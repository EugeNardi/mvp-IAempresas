import React, { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Plus, Save, X, Upload, Mic, Sparkles, Loader, 
  TrendingUp, AlertCircle, CheckCircle, Image as ImageIcon, Trash2, Package,
  FileSpreadsheet, Download, History, ChevronDown, ChevronUp
} from 'lucide-react'
import AudioRecorderComponent from '../common/AudioRecorder'
import { processAudioForMovement, isOpenAIConfigured } from '../../services/aiService'
import { createUserFriendlyError } from '../../utils/errorMessages'
import * as XLSX from 'xlsx'

const MovimientosVenta = ({ movimiento, onClose, onSuccess }) => {
  const { addInvoice, updateInvoice, invoices, inventoryItems, updateProductStock, loadInventoryItems } = useData()
  const isEditing = !!movimiento
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzed, setAiAnalyzed] = useState(false)
  const [dolarData, setDolarData] = useState(null)
  const [uploadingBulk, setUploadingBulk] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })
  const [bulkSuccess, setBulkSuccess] = useState('')
  const [productosExpandidos, setProductosExpandidos] = useState({})
  const [aiSectionExpanded, setAiSectionExpanded] = useState(false)
  const [bulkSectionExpanded, setBulkSectionExpanded] = useState(false)

  // Cargar inventario y cotización del dólar al montar el componente
  useEffect(() => {
    if (loadInventoryItems) {
      loadInventoryItems()
    }
    fetchDolarData()
  }, [])

  const fetchDolarData = async () => {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares')
      if (response.ok) {
        const data = await response.json()
        const blue = data.find(d => d.casa === 'blue')
        setDolarData(blue)
        // Si no hay tipo de cambio establecido, usar el dólar blue venta
        if (!formData.tipoCambio && blue) {
          setFormData(prev => ({ ...prev, tipoCambio: blue.venta.toString() }))
        }
      }
    } catch (err) {
      console.error('Error fetching dolar:', err)
    }
  }

  const [formData, setFormData] = useState(() => {
    if (isEditing && movimiento) {
      return {
        fecha: movimiento.date || movimiento.invoice_date || new Date().toISOString().split('T')[0],
        tipo: movimiento.metadata?.tipoVenta || 'minorista',
        cliente: movimiento.metadata?.cliente || '',
        medio: movimiento.metadata?.paymentMethod || 'efectivo',
        cobrado: movimiento.metadata?.cobrado ? 'si' : 'no',
        deuda: movimiento.metadata?.deuda || '',
        moneda: movimiento.metadata?.moneda || 'ARS',
        tipoCambio: movimiento.metadata?.tipoCambio || '',
        montoTotal: movimiento.amount?.toString() || '',
        comprobante: null,
        productos: movimiento.metadata?.productos || []
      }
    }
    return {
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'minorista',
      cliente: '',
      medio: 'efectivo',
      cobrado: 'si',
      deuda: '',
      moneda: 'ARS',
      tipoCambio: '',
      montoTotal: '',
      comprobante: null,
      productos: []
    }
  })

  const [productos, setProductos] = useState(() => {
    if (isEditing && movimiento?.metadata?.productos && movimiento.metadata.productos.length > 0) {
      return movimiento.metadata.productos.map(p => ({
        id: p.id || Date.now() + Math.random(),
        productoId: p.productoId || '',
        nombre: p.nombre || '',
        descripcion: p.descripcion || '',
        cantidad: p.cantidad || 1,
        precioUnitario: p.precioUnitario?.toString() || '',
        precioTotal: p.precioTotal?.toString() || '',
        descuento: p.descuento || 0,
        tipoDescuento: p.tipoDescuento || 'monto',
        comision: p.comision || 0,
        tipoComision: p.tipoComision || 'monto',
        comisionista: p.comisionista || '',
        stockDisponible: p.stockDisponible || 0
      }))
    }
    return [{
      id: Date.now(),
      productoId: '',
      nombre: '',
      descripcion: '',
      cantidad: 1,
      precioUnitario: '',
      precioTotal: '',
      descuento: 0,
      tipoDescuento: 'monto',
      comision: 0,
      tipoComision: 'monto',
      comisionista: '',
      stockDisponible: 0
    }]
  })

  const mediosPago = ['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'cheque', 'mercadopago']
  
  const clientesSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'venta' && inv.metadata?.cliente)
      .map(inv => inv.metadata.cliente)
  )]

  const comisionistasSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'venta' && inv.metadata?.productos)
      .flatMap(inv => inv.metadata.productos
        .filter(p => p.comisionista)
        .map(p => p.comisionista)
      )
  )]

  // Actualizar precios cuando cambia el tipo de venta (minorista/mayorista)
  useEffect(() => {
    if (productos.length > 0 && inventoryItems && inventoryItems.length > 0) {
      setProductos(productos.map(p => {
        if (p.productoId) {
          const item = inventoryItems.find(i => i.id === p.productoId)
          if (item) {
            // Seleccionar precio según tipo de venta
            let nuevoPrecio
            if (formData.tipo === 'mayorista') {
              // Para venta mayorista: usar wholesale_price si existe y es > 0, sino sale_price, sino calcular
              nuevoPrecio = (item.wholesale_price && parseFloat(item.wholesale_price) > 0)
                ? parseFloat(item.wholesale_price)
                : (item.sale_price && parseFloat(item.sale_price) > 0)
                  ? parseFloat(item.sale_price)
                  : parseFloat(item.unit_cost || 0) * 1.3
            } else {
              // Para venta minorista: usar sale_price si existe y es > 0, sino calcular
              nuevoPrecio = (item.sale_price && parseFloat(item.sale_price) > 0)
                ? parseFloat(item.sale_price)
                : parseFloat(item.unit_cost || 0) * 1.5
            }
            
            const cantidad = parseFloat(p.cantidad) || 1
            const descuento = parseFloat(p.descuento) || 0
            const subtotal = cantidad * nuevoPrecio
            const montoDescuento = subtotal * (descuento / 100)
            
            return {
              ...p,
              precioUnitario: nuevoPrecio,
              precioTotal: (subtotal - montoDescuento).toFixed(2)
            }
          }
        }
        return p
      }))
    }
  }, [formData.tipo])

  const analyzeWithAI = async (file, type) => {
    setAnalyzing(true)
    setError('')

    try {
      if (type === 'audio') {
        // Procesar audio con IA real
        if (!isOpenAIConfigured()) {
          throw new Error('API de OpenAI no configurada. Agrega tu VITE_OPENAI_API_KEY en el archivo .env')
        }

        const result = await processAudioForMovement(file, 'venta')
        
        if (!result.success) {
          throw new Error(result.error)
        }

        const aiData = result.data
        
        // Mapear datos de IA al formato del formulario
        const mappedData = {
          fecha: aiData.fecha || new Date().toISOString().split('T')[0],
          tipo: aiData.tipo || 'minorista',
          cliente: aiData.cliente || '',
          medio: aiData.medio || 'efectivo',
          cobrado: aiData.cobrado ? 'si' : 'no',
          montoTotal: '',
          comprobante: file
        }

        // Mapear productos si existen
        if (aiData.productos && aiData.productos.length > 0) {
          const mappedProductos = aiData.productos.map((p, idx) => ({
            id: Date.now() + idx,
            productoId: '',
            nombre: p.nombre || '',
            cantidad: p.cantidad || 1,
            precioUnitario: p.precioUnitario?.toString() || '',
            precioTotal: ((p.cantidad || 1) * (p.precioUnitario || 0)).toString(),
            descuento: p.descuento || 0,
            stockDisponible: 0
          }))
          setProductos(mappedProductos)
        }

        setFormData(prev => ({ ...prev, ...mappedData }))
        setAiAnalyzed(true)
        
      } else {
        // Simulación para documentos (por ahora)
        await new Promise(resolve => setTimeout(resolve, 2500))

        const aiData = {
          fecha: new Date().toISOString().split('T')[0],
          tipo: 'minorista',
          cliente: 'Cliente Detectado',
          medio: 'transferencia',
          cobrado: 'si',
          montoTotal: '25000',
          productos: [
            {
              id: Date.now(),
              productoId: inventoryItems[0]?.id || '',
              nombre: inventoryItems[0]?.name || 'Producto 1',
              cantidad: 5,
              precioUnitario: '5000',
              precioTotal: '25000',
              descuento: 0,
              stockDisponible: inventoryItems[0]?.quantity || 0
            }
          ]
        }

        setFormData(prev => ({ ...prev, ...aiData, comprobante: file }))
        setProductos(aiData.productos)
        setAiAnalyzed(true)
      }
    } catch (err) {
      setError(err.message || 'Error al analizar con IA. Por favor completa manualmente.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten PDF o imágenes (JPG, PNG)')
      return
    }

    await analyzeWithAI(file, 'document')
  }

  const agregarProducto = () => {
    const newId = Date.now()
    setProductos([...productos, {
      id: newId,
      productoId: '',
      nombre: '',
      descripcion: '',
      cantidad: 1,
      precioUnitario: '',
      precioTotal: '',
      descuento: 0,
      tipoDescuento: 'monto',
      comision: 0,
      tipoComision: 'monto',
      comisionista: '',
      stockDisponible: 0
    }])
    // Expandir automáticamente el nuevo producto
    setProductosExpandidos(prev => ({ ...prev, [newId]: true }))
  }

  const toggleProducto = (id) => {
    setProductosExpandidos(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const eliminarProducto = (id) => {
    if (productos.length > 1) {
      setProductos(productos.filter(p => p.id !== id))
    }
  }

  const actualizarProducto = (id, campo, valor) => {
    setProductos(productos.map(p => {
      if (p.id === id) {
        const updated = { ...p, [campo]: valor }
        
        // Si selecciona un producto del inventario
        if (campo === 'productoId' && valor) {
          const item = inventoryItems.find(i => i.id === valor)
          if (item) {
            updated.nombre = item.name
            updated.descripcion = item.description || ''
            
            // Seleccionar precio según tipo de venta
            if (formData.tipo === 'mayorista') {
              // Para venta mayorista: usar wholesale_price si existe y es > 0, sino sale_price, sino calcular
              updated.precioUnitario = (item.wholesale_price && parseFloat(item.wholesale_price) > 0)
                ? parseFloat(item.wholesale_price)
                : (item.sale_price && parseFloat(item.sale_price) > 0)
                  ? parseFloat(item.sale_price)
                  : parseFloat(item.unit_cost || 0) * 1.3
            } else {
              // Para venta minorista: usar sale_price si existe y es > 0, sino calcular
              updated.precioUnitario = (item.sale_price && parseFloat(item.sale_price) > 0)
                ? parseFloat(item.sale_price)
                : parseFloat(item.unit_cost || 0) * 1.5
            }
            
            updated.stockDisponible = item.current_stock || 0
            
            // Calcular precio total automáticamente con cantidad 1
            const cantidad = parseFloat(p.cantidad) || 1
            const precio = parseFloat(updated.precioUnitario)
            const descuento = parseFloat(p.descuento) || 0
            
            if (!isNaN(precio)) {
              const subtotal = cantidad * precio
              updated.precioTotal = (subtotal - descuento).toFixed(2)
            }
          }
        }
        
        // Calcular precio total
        if (campo === 'cantidad' || campo === 'precioUnitario' || campo === 'descuento' || campo === 'tipoDescuento' || campo === 'comision' || campo === 'tipoComision') {
          const cantidad = campo === 'cantidad' ? parseFloat(valor) : parseFloat(p.cantidad)
          const precio = campo === 'precioUnitario' ? parseFloat(valor) : parseFloat(p.precioUnitario)
          const descuento = campo === 'descuento' ? parseFloat(valor) : parseFloat(p.descuento)
          const tipoDescuento = campo === 'tipoDescuento' ? valor : (updated.tipoDescuento || p.tipoDescuento || 'monto')
          const comision = campo === 'comision' ? parseFloat(valor) : parseFloat(p.comision || 0)
          const tipoComision = campo === 'tipoComision' ? valor : (updated.tipoComision || p.tipoComision || 'monto')
          
          if (!isNaN(cantidad) && !isNaN(precio)) {
            const subtotal = cantidad * precio
            let montoDescuento = 0
            let montoComision = 0
            
            if (tipoDescuento === 'porcentaje') {
              // Descuento en porcentaje (máximo 100%)
              const porcentaje = Math.min(descuento || 0, 100)
              montoDescuento = subtotal * (porcentaje / 100)
            } else {
              // Descuento en monto fijo
              montoDescuento = descuento || 0
            }
            
            if (tipoComision === 'porcentaje') {
              // Comisión en porcentaje (máximo 100%)
              const porcentaje = Math.min(comision || 0, 100)
              montoComision = subtotal * (porcentaje / 100)
            } else {
              // Comisión en monto fijo
              montoComision = comision || 0
            }
            
            // Restar descuento y comisión
            updated.precioTotal = (subtotal - montoDescuento - montoComision).toFixed(2)
          }
        }
        
        return updated
      }
      return p
    }))
  }

  const calcularMontoTotal = () => {
    const totalProductos = productos.reduce((sum, p) => sum + (parseFloat(p.precioTotal) || 0), 0)
    
    // Si es en USD, convertir a ARS
    if (formData.moneda === 'USD' && formData.tipoCambio) {
      return (totalProductos * parseFloat(formData.tipoCambio)).toFixed(2)
    }
    return totalProductos.toFixed(2)
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar que sea un archivo Excel
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setError('Por favor sube un archivo Excel (.xlsx, .xls) o CSV')
      return
    }

    setUploadingBulk(true)
    setError('')
    setBulkSuccess('')
    setBulkProgress({ current: 0, total: 0 })

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        throw new Error('El archivo está vacío')
      }

      // Validar que el archivo tenga las columnas mínimas necesarias
      const firstRow = jsonData[0]
      const columns = Object.keys(firstRow)
      
      // Buscar columnas de producto y precio (obligatorias)
      const hasProducto = columns.some(col => 
        col.toLowerCase().includes('producto') || 
        col.toLowerCase().includes('product') ||
        col.toLowerCase().includes('item') ||
        col.toLowerCase().includes('articulo')
      )
      
      const hasPrecio = columns.some(col => 
        col.toLowerCase().includes('precio') || 
        col.toLowerCase().includes('price') ||
        col.toLowerCase().includes('monto') ||
        col.toLowerCase().includes('amount') ||
        col.toLowerCase().includes('total')
      )

      if (!hasProducto || !hasPrecio) {
        throw new Error(
          `❌ Formato de archivo incorrecto.\n\n` +
          `Columnas encontradas: ${columns.join(', ')}\n\n` +
          `Se requieren al menos:\n` +
          `• Una columna de Producto (Producto, Product, Item, etc.)\n` +
          `• Una columna de Precio (Precio, Price, Monto, etc.)\n\n` +
          `💡 Descarga la plantilla para ver el formato correcto.`
        )
      }

      setBulkProgress({ current: 0, total: jsonData.length })

      let successCount = 0
      let errorCount = 0
      const errors = []

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i]
        setBulkProgress({ current: i + 1, total: jsonData.length })

        try {
          // Mapear columnas del Excel de forma flexible
          const fecha = row['Fecha'] || row['fecha'] || row['Date'] || row['date'] || 
                       row['FECHA'] || row['DATE'] || new Date().toISOString().split('T')[0]
          
          const cliente = row['Cliente'] || row['cliente'] || row['Customer'] || row['customer'] ||
                         row['CLIENTE'] || row['CUSTOMER'] || row['Client'] || row['client'] ||
                         row['Nombre'] || row['nombre'] || 'Cliente Importado'
          
          const producto = row['Producto'] || row['producto'] || row['Product'] || row['product'] ||
                          row['PRODUCTO'] || row['PRODUCT'] || row['Item'] || row['item'] ||
                          row['Articulo'] || row['articulo'] || row['Descripcion'] || row['descripcion'] || ''
          
          const cantidad = parseFloat(
            row['Cantidad'] || row['cantidad'] || row['Quantity'] || row['quantity'] ||
            row['CANTIDAD'] || row['QUANTITY'] || row['Cant'] || row['cant'] ||
            row['Qty'] || row['qty'] || row['Unidades'] || row['unidades'] || 1
          )
          
          const precioUnitario = parseFloat(
            row['Precio'] || row['precio'] || row['Price'] || row['price'] ||
            row['PRECIO'] || row['PRICE'] || row['Precio Unitario'] || row['precio unitario'] ||
            row['Unit Price'] || row['unit price'] || row['Monto'] || row['monto'] ||
            row['Amount'] || row['amount'] || row['Valor'] || row['valor'] ||
            row['Total'] || row['total'] || row['TOTAL'] || 0
          )
          
          const medio = (row['Medio de Pago'] || row['medio de pago'] || row['Payment Method'] || 
                        row['payment method'] || row['Medio'] || row['medio'] || row['Pago'] || 
                        row['pago'] || row['Payment'] || row['payment'] || 'efectivo').toLowerCase()
          
          const tipo = (row['Tipo'] || row['tipo'] || row['Type'] || row['type'] ||
                       row['TIPO'] || row['TYPE'] || row['Categoria'] || row['categoria'] || 
                       'minorista').toLowerCase()

          // Validaciones
          if (!producto || producto.trim() === '') {
            errors.push(`Fila ${i + 2}: Producto vacío o no encontrado`)
            errorCount++
            continue
          }

          if (isNaN(precioUnitario) || precioUnitario <= 0) {
            errors.push(`Fila ${i + 2}: Precio inválido (${precioUnitario})`)
            errorCount++
            continue
          }

          if (isNaN(cantidad) || cantidad <= 0) {
            errors.push(`Fila ${i + 2}: Cantidad inválida (${cantidad})`)
            errorCount++
            continue
          }

          const montoTotal = cantidad * precioUnitario

          // Crear la venta pasada (SIN actualizar inventario)
          const invoiceData = {
            type: 'income',
            number: `VENTA-PASADA-${Date.now()}-${i}`,
            date: fecha,
            description: `Venta Pasada - ${cliente} - ${producto}`,
            amount: montoTotal,
            category: 'Ventas',
            fileName: 'Importación Excel',
            processed: true,
            taxes: [],
            metadata: {
              movementType: 'venta',
              tipoVenta: tipo,
              cliente: cliente,
              paymentMethod: medio.toLowerCase().replace(/ /g, '_'),
              cobrado: true,
              deuda: 0,
              moneda: 'ARS',
              ventaPasada: true, // Marcar como venta pasada
              productos: [{
                nombre: producto,
                cantidad: cantidad,
                precioUnitario: precioUnitario,
                precioTotal: montoTotal,
                descuento: 0
              }]
            }
          }

          await addInvoice(invoiceData)
          successCount++

        } catch (rowError) {
          console.error(`Error en fila ${i + 1}:`, rowError)
          errors.push(`Fila ${i + 1}: ${rowError.message}`)
          errorCount++
        }

        // Pequeña pausa para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (successCount > 0) {
        setBulkSuccess(`✅ ${successCount} ventas pasadas cargadas exitosamente${errorCount > 0 ? `. ${errorCount} con errores.` : ''}`)
        setTimeout(() => {
          onSuccess?.(`${successCount} ventas pasadas importadas correctamente`)
        }, 2000)
      }

      if (errors.length > 0 && errors.length <= 10) {
        setError(`⚠️ Errores encontrados:\n\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? `\n\n...y ${errors.length - 10} errores más` : ''}`)
      } else if (errors.length > 10) {
        setError(`⚠️ Se encontraron ${errors.length} errores.\n\nRevisa que el archivo tenga el formato correcto:\n• Columnas: Producto, Precio, Cantidad\n• Valores válidos en cada celda\n• Sin filas vacías\n\n💡 Descarga la plantilla para ver el formato correcto.`)
      }

    } catch (err) {
      console.error('Error procesando archivo:', err)
      setError(err.message || 'Error al procesar el archivo')
    } finally {
      setUploadingBulk(false)
      e.target.value = '' // Resetear input
    }
  }

  const downloadTemplate = () => {
    // Crear plantilla de Excel
    const template = [
      {
        'Fecha': '2024-01-15',
        'Cliente': 'Juan Pérez',
        'Producto': 'Producto Ejemplo',
        'Cantidad': 2,
        'Precio': 1500,
        'Medio de Pago': 'efectivo',
        'Tipo': 'minorista'
      },
      {
        'Fecha': '2024-01-20',
        'Cliente': 'María García',
        'Producto': 'Otro Producto',
        'Cantidad': 1,
        'Precio': 3000,
        'Medio de Pago': 'transferencia',
        'Tipo': 'mayorista'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas')
    XLSX.writeFile(wb, 'plantilla_ventas_pasadas.xlsx')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.cliente) throw new Error('El cliente es obligatorio')
      if (productos.length === 0) throw new Error('Debes agregar al menos un producto')
      
      const montoCalculado = calcularMontoTotal()
      if (parseFloat(montoCalculado) <= 0) throw new Error('El monto total debe ser mayor a 0')

      for (const prod of productos) {
        if (!prod.nombre) throw new Error('Todos los productos deben tener nombre')
        if (!prod.cantidad || prod.cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0')
        if (!prod.precioUnitario || prod.precioUnitario <= 0) throw new Error('El precio unitario debe ser mayor a 0')
        
        // Verificar stock disponible
        if (prod.productoId) {
          const item = inventoryItems.find(i => i.id === prod.productoId)
          if (item) {
            const stockActual = item.current_stock || 0
            if (stockActual < prod.cantidad) {
              throw new Error(`Stock insuficiente para ${prod.nombre}. Disponible: ${stockActual}, solicitado: ${prod.cantidad}`)
            }
          }
        }
      }

      const invoiceData = {
        type: 'income',
        number: isEditing ? (movimiento.number || movimiento.invoice_number) : `VENTA-${Date.now()}`,
        date: formData.fecha,
        description: `Venta ${formData.tipo} - ${formData.cliente}`,
        amount: parseFloat(calcularMontoTotal()),
        category: 'Ventas',
        fileName: formData.comprobante?.name || 'Manual',
        processed: true,
        taxes: [],
        metadata: {
          movementType: 'venta',
          tipoVenta: formData.tipo,
          cliente: formData.cliente,
          paymentMethod: formData.medio,
          cobrado: formData.cobrado === 'si',
          deuda: formData.cobrado === 'no' ? parseFloat(formData.deuda || 0) : 0,
          moneda: formData.moneda,
          tipoCambio: formData.moneda === 'USD' ? parseFloat(formData.tipoCambio) : null,
          productos: productos.map(p => ({
            productoId: p.productoId,
            nombre: p.nombre,
            cantidad: parseFloat(p.cantidad),
            precioUnitario: parseFloat(p.precioUnitario),
            precioTotal: parseFloat(p.precioTotal),
            descuento: parseFloat(p.descuento || 0),
            tipoDescuento: p.tipoDescuento || 'monto',
            comision: parseFloat(p.comision || 0),
            tipoComision: p.tipoComision || 'monto',
            comisionista: p.comisionista || ''
          }))
        }
      }

      if (isEditing) {
        await updateInvoice(movimiento.id, invoiceData)
      } else {
        await addInvoice(invoiceData)
      }
      
      // Actualizar inventario (descontar stock de productos vendidos)
      console.log('📦 Actualizando inventario con productos vendidos...')
      for (const prod of productos) {
        if (prod.productoId) {
          try {
            // Restar stock del producto
            await updateProductStock(prod.productoId, parseFloat(prod.cantidad), 'subtract')
            console.log(`✅ Stock actualizado para ${prod.nombre}: -${prod.cantidad}`)
          } catch (invError) {
            console.error(`Error al actualizar inventario para ${prod.nombre}:`, invError)
            // Si falla el descuento de stock, mostramos error pero no bloqueamos la venta
            setError(`Venta registrada pero error al actualizar stock de ${prod.nombre}`)
          }
        }
      }
      
      onSuccess?.(isEditing ? 'Venta actualizada exitosamente.' : 'Venta registrada exitosamente. Inventario actualizado.')
      onClose?.()
    } catch (err) {
      const friendlyMessage = createUserFriendlyError(err, 'Error al guardar la venta')
      setError(friendlyMessage)
      console.error('Error en venta:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? <><span className="text-gray-900">Editar</span> <span className="text-gray-900">Venta</span></> : <><span className="text-gray-900">Nueva</span> <span className="text-gray-900">Venta</span></>}
              </h2>
              <p className="text-gray-500 text-sm">{isEditing ? 'Modifica los datos de la venta' : 'Registra una venta y actualiza el inventario'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* IA Analysis - Colapsable */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setAiSectionExpanded(!aiSectionExpanded)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Análisis Automático con IA</h3>
                  <p className="text-sm text-gray-600">Sube un comprobante o graba un audio</p>
                </div>
              </div>
              {aiSectionExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {aiSectionExpanded && (
              <div className="px-5 pb-5 space-y-3 border-t border-gray-200 pt-4">
                {analyzing && (
                  <div className="flex items-center gap-3 p-3.5 bg-green-50 rounded-lg border border-green-100">
                    <Loader className="w-4 h-4 text-green-600 animate-spin" />
                    <p className="text-sm text-green-700">Analizando con IA...</p>
                  </div>
                )}

                {aiAnalyzed && (
                  <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700">Formulario completado por IA. Revisa y ajusta.</p>
                  </div>
                )}

                <label className="flex items-center gap-3 p-3.5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-gray-50 transition-all">
                  <Upload className="w-4 h-4 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Subir Comprobante</p>
                    <p className="text-xs text-gray-500">PDF o Imagen</p>
                  </div>
                  <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" disabled={analyzing} />
                </label>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">O graba un audio</p>
                  <AudioRecorderComponent
                    onRecordingComplete={(audioFile) => analyzeWithAI(audioFile, 'audio')}
                    onError={(error) => setError(error)}
                    disabled={analyzing}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Datos Generales */}
          <div className="bg-white rounded-xl p-5 space-y-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Datos Generales</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all text-sm"
                >
                  <option value="minorista">Minorista</option>
                  <option value="mayorista">Mayorista</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Cliente *</label>
                <input
                  type="text"
                  list="clientes"
                  value={formData.cliente}
                  onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                  required
                  placeholder="Nombre del cliente"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all text-sm"
                />
                <datalist id="clientes">
                  {clientesSugeridos.map((cli, idx) => (
                    <option key={idx} value={cli} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Moneda *</label>
                <select
                  value={formData.moneda}
                  onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all text-sm"
                >
                  <option value="ARS">ARS (Pesos)</option>
                  <option value="USD">USD (Dólares)</option>
                </select>
              </div>

              {formData.moneda === 'USD' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tipo de Cambio *
                    {dolarData && (
                      <span className="ml-2 text-xs text-gray-500">(Blue: ${dolarData.venta})</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={formData.tipoCambio}
                    onChange={(e) => setFormData({...formData, tipoCambio: e.target.value})}
                    required
                    step="1"
                    placeholder="Ej: 1200.00"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Medio de Pago *</label>
                <select
                  value={formData.medio}
                  onChange={(e) => setFormData({...formData, medio: e.target.value})}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all text-sm"
                >
                  {mediosPago.map(medio => (
                    <option key={medio} value={medio}>{medio.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">¿Cobrado? *</label>
                <select
                  value={formData.cobrado}
                  onChange={(e) => setFormData({...formData, cobrado: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all ${
                    formData.cobrado === 'si' ? 'border-green-500 bg-green-50 font-semibold text-green-800' : 'border-red-500 bg-red-50 font-semibold text-red-800'
                  }`}
                >
                  <option value="si">SÍ - Cobrado</option>
                  <option value="no">NO - Pendiente</option>
                </select>
              </div>
            </div>

            {formData.cobrado === 'no' && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-red-700">Deuda a Cobrar *</label>
                  <input
                    type="number"
                    value={formData.deuda}
                    onChange={(e) => setFormData({...formData, deuda: e.target.value})}
                    required
                    step="1"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-red-400 bg-red-50 outline-none font-semibold text-red-800"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Productos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Productos</h3>
              <button
                type="button"
                onClick={agregarProducto}
                className="flex items-center gap-2 px-3.5 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Producto
              </button>
            </div>

            {productos.map((producto, index) => (
              <div key={producto.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                {/* Header colapsable */}
                <button
                  type="button"
                  onClick={() => toggleProducto(producto.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Producto #{index + 1}
                        {producto.nombre && ` - ${producto.nombre}`}
                      </h4>
                      {producto.precioTotal && (
                        <p className="text-xs text-gray-600">
                          Total: ${parseFloat(producto.precioTotal).toLocaleString('es-AR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {productos.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          eliminarProducto(producto.id)
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {productosExpandidos[producto.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Contenido del producto */}
                {productosExpandidos[producto.id] && (
                  <div className="p-5 space-y-4 border-t border-gray-200">

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Producto del Inventario</span>
                      </div>
                      {producto.productoId && producto.stockDisponible !== undefined && (
                        <span className={`ml-2 text-xs font-semibold ${
                          producto.stockDisponible > 10 ? 'text-green-600' : 
                          producto.stockDisponible > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          • Stock disponible: {producto.stockDisponible} unidades
                        </span>
                      )}
                    </label>
                    
                    {inventoryItems && inventoryItems.length > 0 ? (
                      <select
                        value={producto.productoId}
                        onChange={(e) => actualizarProducto(producto.id, 'productoId', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                      >
                        <option value="">Seleccionar del inventario o crear nuevo</option>
                        {inventoryItems
                          .filter(item => item.is_active !== false)
                          .map(item => {
                            const stock = item.current_stock || 0
                            return (
                              <option key={item.id} value={item.id}>
                                {item.name} - Stock: {stock} {stock <= 5 ? '⚠️' : stock > 0 ? '✓' : '❌'}
                              </option>
                            )
                          })}
                      </select>
                    ) : (
                      <div className="w-full px-4 py-2.5 rounded-lg border-2 border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>No hay productos en el inventario. Agrega productos primero o crea uno nuevo.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Nombre del Producto *</label>
                    <input
                      type="text"
                      value={producto.nombre}
                      onChange={(e) => actualizarProducto(producto.id, 'nombre', e.target.value)}
                      required
                      placeholder="Nombre del producto"
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Cantidad *</label>
                    <input
                      type="number"
                      value={producto.cantidad}
                      onChange={(e) => actualizarProducto(producto.id, 'cantidad', e.target.value)}
                      required
                      min="1"
                      max={producto.stockDisponible > 0 ? producto.stockDisponible : undefined}
                      step="1"
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                    {producto.stockDisponible > 0 && (
                      <p className="text-xs text-gray-600 mt-1">Stock: {producto.stockDisponible}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Precio Unitario *</label>
                    <input
                      type="number"
                      value={producto.precioUnitario || ''}
                      onChange={(e) => actualizarProducto(producto.id, 'precioUnitario', e.target.value)}
                      required
                      min="0"
                      step="1"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Descuento {producto.tipoDescuento === 'porcentaje' ? '(%)' : '($)'}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={producto.tipoDescuento || 'monto'}
                        onChange={(e) => actualizarProducto(producto.id, 'tipoDescuento', e.target.value)}
                        className="px-3 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none text-sm font-medium w-16"
                      >
                        <option value="monto">$</option>
                        <option value="porcentaje">%</option>
                      </select>
                      <input
                        type="number"
                        value={producto.descuento === 0 ? '' : producto.descuento}
                        onChange={(e) => {
                          const valor = e.target.value
                          if (valor === '') {
                            actualizarProducto(producto.id, 'descuento', 0)
                          } else if (producto.tipoDescuento === 'porcentaje') {
                            actualizarProducto(producto.id, 'descuento', Math.min(parseFloat(valor) || 0, 100))
                          } else {
                            actualizarProducto(producto.id, 'descuento', parseFloat(valor) || 0)
                          }
                        }}
                        placeholder="0"
                        min="0"
                        max={producto.tipoDescuento === 'porcentaje' ? '100' : undefined}
                        step="1"
                        className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Comisión {producto.tipoComision === 'porcentaje' ? '(%)' : '($)'}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={producto.tipoComision || 'monto'}
                        onChange={(e) => actualizarProducto(producto.id, 'tipoComision', e.target.value)}
                        className="px-3 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none text-sm font-medium w-16"
                      >
                        <option value="monto">$</option>
                        <option value="porcentaje">%</option>
                      </select>
                      <input
                        type="number"
                        value={producto.comision === 0 ? '' : producto.comision}
                        onChange={(e) => {
                          const valor = e.target.value
                          if (valor === '') {
                            actualizarProducto(producto.id, 'comision', 0)
                          } else if (producto.tipoComision === 'porcentaje') {
                            actualizarProducto(producto.id, 'comision', Math.min(parseFloat(valor) || 0, 100))
                          } else {
                            actualizarProducto(producto.id, 'comision', parseFloat(valor) || 0)
                          }
                        }}
                        placeholder="0"
                        min="0"
                        max={producto.tipoComision === 'porcentaje' ? '100' : undefined}
                        step="1"
                        className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Comisionista</label>
                    <input
                      type="text"
                      list={`comisionistas-${producto.id}`}
                      value={producto.comisionista || ''}
                      onChange={(e) => actualizarProducto(producto.id, 'comisionista', e.target.value)}
                      placeholder="Nombre del comisionista"
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                    <datalist id={`comisionistas-${producto.id}`}>
                      {comisionistasSugeridos.map((com, idx) => (
                        <option key={idx} value={com} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Total</label>
                    <input
                      type="text"
                      value={producto.precioTotal ? `$${parseFloat(producto.precioTotal).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '$0'}
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-lg border border-green-300 bg-green-50 font-bold text-green-700"
                    />
                  </div>
                </div>
                  </div>
                )}
              </div>
            ))}

            {/* Monto Total - Al final de los productos */}
            {productos.length > 0 && productos.some(p => p.precioTotal) && (
              <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                <p className="text-xs text-gray-600 font-medium mb-1.5">
                  Monto Total {formData.moneda === 'USD' && '(convertido a ARS)'}
                </p>
                <p className="text-3xl font-bold text-green-600">
                  ${calcularMontoTotal()} ARS
                </p>
                {formData.moneda === 'USD' && formData.tipoCambio && (
                  <p className="text-xs text-gray-600 mt-2">
                    USD {(productos.reduce((sum, p) => sum + (parseFloat(p.precioTotal) || 0), 0)).toFixed(2)} × ${formData.tipoCambio}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Carga Masiva de Ventas Pasadas - Colapsable */}
          {!isEditing && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setBulkSectionExpanded(!bulkSectionExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-purple-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <History className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      Cargar Ventas Pasadas
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">NUEVO</span>
                    </h3>
                    <p className="text-sm text-gray-600">Importa múltiples ventas históricas desde Excel sin afectar el inventario</p>
                  </div>
                </div>
                {bulkSectionExpanded ? (
                  <ChevronUp className="w-5 h-5 text-purple-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-purple-600" />
                )}
              </button>

              {bulkSectionExpanded && (
                <div className="px-6 pb-6 space-y-4 border-t border-purple-200 pt-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-medium text-gray-900">¿Qué son las ventas pasadas?</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Ventas históricas para análisis y reportes</li>
                      <li><strong>NO modifican el inventario actual</strong></li>
                      <li>Registran clientes, ingresos y estadísticas</li>
                      <li>Útiles para migrar datos de otros sistemas</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Plantilla Excel
                  </button>

                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors cursor-pointer flex-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    {uploadingBulk ? 'Procesando...' : 'Subir Archivo Excel'}
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleBulkUpload}
                      className="hidden"
                      disabled={uploadingBulk}
                    />
                  </label>
                </div>

                {uploadingBulk && bulkProgress.total > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Procesando ventas...</span>
                      <span className="font-semibold">{bulkProgress.current} / {bulkProgress.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all duration-300 flex items-center justify-center"
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      >
                        <span className="text-xs text-white font-semibold">
                          {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {bulkSuccess && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-medium">{bulkSuccess}</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Formato del Excel:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-900">Fecha</span>
                    <p className="text-gray-600">2024-01-15</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-900">Cliente</span>
                    <p className="text-gray-600">Juan Pérez</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-900">Producto</span>
                    <p className="text-gray-600">Producto X</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-900">Cantidad</span>
                    <p className="text-gray-600">2</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-900">Precio</span>
                    <p className="text-gray-600">1500</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-900">Medio de Pago</span>
                    <p className="text-gray-600">efectivo</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-900">Tipo</span>
                    <p className="text-gray-600">minorista</p>
                  </div>
                </div>
              </div>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-5 border-t border-gray-200 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Actualizar Venta' : 'Registrar Venta'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovimientosVenta
