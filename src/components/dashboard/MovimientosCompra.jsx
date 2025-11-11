import React, { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Plus, Save, X, Upload, Mic, Sparkles, Loader, 
  ShoppingCart, AlertCircle, CheckCircle, Image as ImageIcon, Trash2, Search
} from 'lucide-react'
import AudioRecorderComponent from '../common/AudioRecorder'
import { processAudioForMovement, isOpenAIConfigured } from '../../services/aiService'

const MovimientosCompra = ({ movimiento, onClose, onSuccess }) => {
  const { addInvoice, updateInvoice, invoices, findOrCreateProduct, updateProductStock, loadInventoryItems, inventoryItems } = useData()
  const isEditing = !!movimiento
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzed, setAiAnalyzed] = useState(false)
  const [dolarData, setDolarData] = useState(null)
  const [searchProducto, setSearchProducto] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [searchingProductId, setSearchingProductId] = useState(null)

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
      }
    } catch (err) {
      console.error('Error fetching dolar:', err)
    }
  }

  const [formData, setFormData] = useState(() => {
    if (isEditing && movimiento) {
      return {
        fecha: movimiento.date || movimiento.invoice_date || new Date().toISOString().split('T')[0],
        tipo: movimiento.metadata?.tipoCompra || 'minorista',
        proveedor: movimiento.metadata?.provider || '',
        medio: movimiento.metadata?.paymentMethod || 'efectivo',
        pago: movimiento.metadata?.pagado ? 'si' : 'no',
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
      proveedor: '',
      medio: 'efectivo',
      pago: 'si',
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
        categoria: p.categoria || '',
        marca: p.marca || '',
        modelo: p.modelo || '',
        nombre: p.nombre || '',
        descripcion: p.descripcion || '',
        cantidad: p.cantidad || 1,
        costoUnitario: p.costoUnitario?.toString() || '',
        costoTotal: p.costoTotal?.toString() || '',
        imagen: null,
        precioMinorista: p.precioMinorista?.toString() || '',
        precioMayorista: p.precioMayorista?.toString() || ''
      }))
    }
    return [{
      id: Date.now(),
      categoria: '',
      marca: '',
      modelo: '',
      nombre: '',
      descripcion: '',
      cantidad: 1,
      costoUnitario: '',
      costoTotal: '',
      imagen: null,
      precioMinorista: '',
      precioMayorista: ''
    }]
  })

  const mediosPago = ['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'cheque', 'mercadopago']
  
  // Obtener proveedores únicos de compras anteriores
  const proveedoresSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'compra' && inv.metadata?.provider)
      .map(inv => inv.metadata.provider)
  )]

  // Obtener categorías, marcas y modelos únicos de compras anteriores
  const categoriasSugeridas = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'compra' && inv.metadata?.productos)
      .flatMap(inv => inv.metadata.productos.map(p => p.categoria))
      .filter(Boolean)
  )]

  const marcasSugeridas = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'compra' && inv.metadata?.productos)
      .flatMap(inv => inv.metadata.productos.map(p => p.marca))
      .filter(Boolean)
  )]

  const modelosSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'compra' && inv.metadata?.productos)
      .flatMap(inv => inv.metadata.productos.map(p => p.modelo))
      .filter(Boolean)
  )]

  const analyzeWithAI = async (file, type) => {
    setAnalyzing(true)
    setError('')

    try {
      if (type === 'audio') {
        // Procesar audio con IA real
        if (!isOpenAIConfigured()) {
          throw new Error('API de OpenAI no configurada. Agrega tu VITE_OPENAI_API_KEY en el archivo .env')
        }

        const result = await processAudioForMovement(file, 'compra')
        
        if (!result.success) {
          throw new Error(result.error)
        }

        const aiData = result.data
        
        // Mapear datos de IA al formato del formulario
        const mappedData = {
          fecha: aiData.fecha || new Date().toISOString().split('T')[0],
          tipo: aiData.tipo || 'minorista',
          proveedor: aiData.proveedor || '',
          medio: aiData.medio || 'efectivo',
          pago: aiData.pagado ? 'si' : 'no',
          montoTotal: '',
          comprobante: file
        }

        // Mapear productos si existen
        if (aiData.productos && aiData.productos.length > 0) {
          const mappedProductos = aiData.productos.map((p, idx) => ({
            id: Date.now() + idx,
            categoria: p.categoria || 'Mercadería',
            nombre: p.nombre || '',
            descripcion: p.descripcion || '',
            cantidad: p.cantidad || 1,
            costoUnitario: p.costoUnitario?.toString() || '',
            costoTotal: ((p.cantidad || 1) * (p.costoUnitario || 0)).toString(),
            imagen: null,
            precioMinorista: p.precioMinorista?.toString() || '',
            precioMayorista: p.precioMayorista?.toString() || ''
          }))
          setProductos(mappedProductos)
        }

        setFormData(prev => ({ ...prev, ...mappedData }))
        setAiAnalyzed(true)
        
      } else {
        // Simulación para documentos
        await new Promise(resolve => setTimeout(resolve, 2500))

        const aiData = {
          fecha: new Date().toISOString().split('T')[0],
          tipo: 'minorista',
          proveedor: 'Proveedor Detectado SA',
          medio: 'transferencia',
          pago: 'si',
          montoTotal: '15000',
          productos: [
            {
              id: Date.now(),
              categoria: categoriasSugeridas[0] || 'Mercadería',
              nombre: 'Producto Detectado 1',
              descripcion: 'Descripción extraída del comprobante',
              cantidad: 10,
              costoUnitario: '1000',
              costoTotal: '10000',
              precioMinorista: '1500',
              precioMayorista: '1300'
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
    setProductos([...productos, {
      id: Date.now(),
      categoria: '',
      marca: '',
      modelo: '',
      nombre: '',
      descripcion: '',
      cantidad: 1,
      costoUnitario: '',
      costoTotal: '',
      imagen: null,
      precioMinorista: '',
      precioMayorista: ''
    }])
  }

  const eliminarProducto = (id) => {
    if (productos.length > 1) {
      setProductos(productos.filter(p => p.id !== id))
    }
  }

  const agregarProductoExistente = (productoInventario) => {
    const nuevoProducto = {
      id: Date.now(),
      categoria: productoInventario.category || '',
      marca: productoInventario.brand || '',
      modelo: productoInventario.model || '',
      nombre: productoInventario.name || '',
      descripcion: productoInventario.description || '',
      cantidad: 1,
      costoUnitario: productoInventario.cost?.toString() || '',
      costoTotal: productoInventario.cost?.toString() || '',
      imagen: null,
      precioMinorista: productoInventario.price?.toString() || '',
      precioMayorista: productoInventario.wholesale_price?.toString() || ''
    }
    
    setProductos([...productos, nuevoProducto])
    setSearchProducto('')
    setShowProductSearch(false)
  }

  const seleccionarProductoExistente = (productoInventario, productoId) => {
    setProductos(productos.map(p => {
      if (p.id === productoId) {
        return {
          ...p,
          categoria: productoInventario.category || '',
          marca: productoInventario.brand || '',
          modelo: productoInventario.model || '',
          nombre: productoInventario.name || '',
          descripcion: productoInventario.description || '',
          costoUnitario: productoInventario.cost?.toString() || '',
          costoTotal: (productoInventario.cost * (p.cantidad || 1))?.toString() || '',
          precioMinorista: productoInventario.price?.toString() || '',
          precioMayorista: productoInventario.wholesale_price?.toString() || ''
        }
      }
      return p
    }))
    setSearchProducto('')
    setSearchingProductId(null)
  }

  const actualizarProducto = (id, campo, valor) => {
    setProductos(productos.map(p => {
      if (p.id === id) {
        const updated = { ...p, [campo]: valor }
        
        // Calcular costo total automáticamente
        if (campo === 'cantidad' || campo === 'costoUnitario') {
          const cantidad = campo === 'cantidad' ? parseFloat(valor) : parseFloat(p.cantidad)
          const costoUnitario = campo === 'costoUnitario' ? parseFloat(valor) : parseFloat(p.costoUnitario)
          if (!isNaN(cantidad) && !isNaN(costoUnitario)) {
            updated.costoTotal = (cantidad * costoUnitario).toFixed(2)
          }
        }
        
        return updated
      }
      return p
    }))
  }

  const calcularMontoTotal = () => {
    return productos.reduce((sum, p) => sum + (parseFloat(p.costoTotal) || 0), 0).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validaciones
      if (!formData.proveedor) throw new Error('El proveedor es obligatorio')
      if (productos.length === 0) throw new Error('Debes agregar al menos un producto')
      
      const montoCalculado = calcularMontoTotal()
      if (parseFloat(montoCalculado) <= 0) throw new Error('El monto total debe ser mayor a 0')

      // Validar productos
      for (const prod of productos) {
        if (!prod.nombre) throw new Error('Todos los productos deben tener nombre')
        if (!prod.cantidad || prod.cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0')
        if (!prod.costoUnitario || prod.costoUnitario <= 0) throw new Error('El costo unitario debe ser mayor a 0')
      }

      // Crear movimiento de compra
      const compraData = {
        type: 'expense',
        date: formData.fecha,
        amount: parseFloat(montoCalculado),
        description: `Compra ${formData.tipo} - ${formData.proveedor}`,
        category: 'Mercadería',
        number: isEditing ? (movimiento.number || movimiento.invoice_number) : `COMPRA-${Date.now()}`,
        metadata: {
          movementType: 'compra',
          tipoCompra: formData.tipo,
          provider: formData.proveedor,
          paymentMethod: formData.medio,
          pagado: formData.pago === 'si',
          deuda: formData.pago === 'no' ? parseFloat(formData.deuda) : 0,
          productos: productos.map(p => ({
            categoria: p.categoria,
            marca: p.marca,
            modelo: p.modelo,
            nombre: p.nombre,
            descripcion: p.descripcion,
            cantidad: parseFloat(p.cantidad),
            costoUnitario: parseFloat(p.costoUnitario),
            costoTotal: parseFloat(p.costoTotal),
            precioMinorista: parseFloat(p.precioMinorista) || 0,
            precioMayorista: parseFloat(p.precioMayorista) || 0,
            imagen: p.imagen
          })),
          comprobante: formData.comprobante,
          aiAnalyzed: aiAnalyzed
        }
      }

      if (isEditing) {
        await updateInvoice(movimiento.id, compraData)
      } else {
        await addInvoice(compraData)
      }
      
      // Actualizar inventario: buscar o crear productos y sumar stock
      console.log('📦 Actualizando inventario con productos de la compra...')
      for (const prod of productos) {
        try {
          // Buscar o crear producto en inventario
          const product = await findOrCreateProduct({
            nombre: prod.nombre,
            descripcion: prod.descripcion,
            categoria: prod.categoria,
            marca: prod.marca,
            modelo: prod.modelo,
            costoUnitario: prod.costoUnitario,
            precioMinorista: prod.precioMinorista,
            precioMayorista: prod.precioMayorista
          })
          
          // Sumar stock al producto
          await updateProductStock(product.id, parseFloat(prod.cantidad), 'add')
          console.log(`✅ Stock actualizado para ${prod.nombre}: +${prod.cantidad}`)
        } catch (invError) {
          console.error(`Error al actualizar inventario para ${prod.nombre}:`, invError)
          // No bloqueamos la compra si falla el inventario
        }
      }
      
      onSuccess?.(isEditing ? 'Compra actualizada exitosamente.' : 'Compra registrada exitosamente. Inventario actualizado.')
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? <><span className="text-gray-900">Editar</span> <span className="text-gray-900">Compra</span></> : <><span className="text-gray-900">Nueva</span> <span className="text-gray-900">Compra</span></>}
              </h2>
              <p className="text-gray-500 text-sm">{isEditing ? 'Modifica los datos de la compra' : 'Registra una compra y actualiza el inventario'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Análisis con IA */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Análisis Automático con IA</h3>
                <p className="text-sm text-gray-600">Sube un comprobante o graba un audio para autocompletar</p>
              </div>
            </div>

            {analyzing && (
              <div className="flex items-center gap-3 p-3.5 bg-blue-50 rounded-lg mb-4 border border-blue-100">
                <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-700">Analizando con IA...</p>
              </div>
            )}

            {aiAnalyzed && (
              <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700">Formulario completado por IA. Revisa y ajusta si es necesario.</p>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-all">
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
                <label className="block text-sm font-medium mb-2">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="minorista">Minorista</option>
                  <option value="mayorista">Mayorista</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Proveedor *</label>
                <input
                  type="text"
                  list="proveedores"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                  required
                  placeholder="Nombre del proveedor"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
                <datalist id="proveedores">
                  {proveedoresSugeridos.map((prov, idx) => (
                    <option key={idx} value={prov} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Medio de Pago *</label>
                <select
                  value={formData.medio}
                  onChange={(e) => setFormData({...formData, medio: e.target.value})}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  {mediosPago.map(medio => (
                    <option key={medio} value={medio}>{medio.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">¿Pago Realizado? *</label>
                <select
                  value={formData.pago}
                  onChange={(e) => setFormData({...formData, pago: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border-2 outline-none ${
                    formData.pago === 'si' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <option value="si">SÍ - Pagado</option>
                  <option value="no">NO - Pendiente</option>
                </select>
              </div>

              {formData.pago === 'no' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-red-600">Deuda a Pagar *</label>
                  <input
                    type="number"
                    value={formData.deuda}
                    onChange={(e) => setFormData({...formData, deuda: e.target.value})}
                    required
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 rounded-lg border-2 border-red-300 bg-red-50 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
              <p className="text-xs text-gray-600 font-medium mb-1.5">Monto Total Calculado</p>
              <p className="text-3xl font-bold text-blue-600">
                ${calcularMontoTotal()}
              </p>
            </div>
          </div>

          {/* Productos */}
          <div className="space-y-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Productos de la Compra</h3>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProductSearch(!showProductSearch)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Search className="w-4 h-4" />
                    Buscar Existente
                  </button>
                  <button
                    type="button"
                    onClick={agregarProducto}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Nuevo
                  </button>
                </div>
              </div>

              {/* Buscador de Productos Existentes */}
              {showProductSearch && (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-5 mb-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-cyan-200">
                      <Search className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h4 className="text-base font-bold text-gray-900">Buscar Producto en Inventario</h4>
                  </div>
                  
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={searchProducto}
                      onChange={(e) => setSearchProducto(e.target.value)}
                      placeholder="Buscar por nombre, marca, modelo o categoría..."
                      className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm bg-white"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                  </div>

                  {searchProducto && (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {inventoryItems
                        ?.filter(item => {
                          const search = searchProducto.toLowerCase()
                          return (
                            item.name?.toLowerCase().includes(search) ||
                            item.brand?.toLowerCase().includes(search) ||
                            item.model?.toLowerCase().includes(search) ||
                            item.category?.toLowerCase().includes(search)
                          )
                        })
                        .map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => agregarProductoExistente(item)}
                            className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-cyan-400 hover:shadow-lg transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">{item.name}</p>
                                <div className="flex items-center gap-2 text-xs mt-2 flex-wrap">
                                  {item.brand && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">{item.brand}</span>}
                                  {item.model && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg font-medium">{item.model}</span>}
                                  {item.category && <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-lg font-medium">{item.category}</span>}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-sm font-bold text-cyan-600">
                                  ${parseFloat(item.cost || 0).toLocaleString('es-AR')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Stock: {item.stock || 0}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      
                      {inventoryItems?.filter(item => {
                        const search = searchProducto.toLowerCase()
                        return (
                          item.name?.toLowerCase().includes(search) ||
                          item.brand?.toLowerCase().includes(search) ||
                          item.model?.toLowerCase().includes(search) ||
                          item.category?.toLowerCase().includes(search)
                        )
                      }).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No se encontraron productos</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!searchProducto && (
                    <p className="text-sm text-cyan-700 text-center py-3 font-medium">
                      💡 Escribe para buscar productos en tu inventario
                    </p>
                  )}
                </div>
              )}
            </div>

            {productos.map((producto, index) => (
              <div key={producto.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Producto #{index + 1}</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchingProductId(searchingProductId === producto.id ? null : producto.id)
                        setSearchProducto('')
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-xs rounded-lg font-semibold transition-all shadow-sm hover:shadow-md ${
                        searchingProductId === producto.id 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                          : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200'
                      }`}
                    >
                      <Search className="w-4 h-4" />
                      {searchingProductId === producto.id ? 'Cerrar' : 'Buscar'}
                    </button>
                    {productos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarProducto(producto.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Buscador Individual del Producto */}
                {searchingProductId === producto.id && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-4 mb-3 shadow-md">
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={searchProducto}
                        onChange={(e) => setSearchProducto(e.target.value)}
                        placeholder="Buscar producto en inventario..."
                        className="w-full px-4 py-2.5 pr-10 text-sm rounded-lg border-2 border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white shadow-sm"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                    </div>

                    {searchProducto && (
                      <div className="max-h-48 overflow-y-auto space-y-1.5">
                        {inventoryItems
                          ?.filter(item => {
                            const search = searchProducto.toLowerCase()
                            return (
                              item.name?.toLowerCase().includes(search) ||
                              item.brand?.toLowerCase().includes(search) ||
                              item.model?.toLowerCase().includes(search) ||
                              item.category?.toLowerCase().includes(search)
                            )
                          })
                          .map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => seleccionarProductoExistente(item, producto.id)}
                              className="w-full text-left p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-cyan-400 hover:shadow-md transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-cyan-600 transition-colors">{item.name}</p>
                                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                    {item.brand && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">{item.brand}</span>}
                                    {item.model && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-medium">{item.model}</span>}
                                    {item.category && <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-md text-xs font-medium">{item.category}</span>}
                                  </div>
                                </div>
                                <div className="text-right ml-3">
                                  <p className="text-xs font-bold text-cyan-600">
                                    ${parseFloat(item.cost || 0).toLocaleString('es-AR')}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">Stock: {item.stock || 0}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        
                        {inventoryItems?.filter(item => {
                          const search = searchProducto.toLowerCase()
                          return (
                            item.name?.toLowerCase().includes(search) ||
                            item.brand?.toLowerCase().includes(search) ||
                            item.model?.toLowerCase().includes(search) ||
                            item.category?.toLowerCase().includes(search)
                          )
                        }).length === 0 && (
                          <div className="text-center py-3 text-gray-500">
                            <p className="text-xs">No se encontraron productos</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!searchProducto && (
                      <p className="text-xs text-cyan-700 text-center py-2 font-medium">
                        💡 Escribe para buscar en el inventario
                      </p>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoría</label>
                    <input
                      type="text"
                      list={`categorias-${producto.id}`}
                      value={producto.categoria}
                      onChange={(e) => actualizarProducto(producto.id, 'categoria', e.target.value)}
                      placeholder="Ej: Autos"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
                    />
                    <datalist id={`categorias-${producto.id}`}>
                      {categoriasSugeridas.map((cat, idx) => (
                        <option key={idx} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Marca</label>
                    <input
                      type="text"
                      list={`marcas-${producto.id}`}
                      value={producto.marca}
                      onChange={(e) => actualizarProducto(producto.id, 'marca', e.target.value)}
                      placeholder="Ej: Toyota"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
                    />
                    <datalist id={`marcas-${producto.id}`}>
                      {marcasSugeridas.map((marca, idx) => (
                        <option key={idx} value={marca} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Modelo</label>
                    <input
                      type="text"
                      list={`modelos-${producto.id}`}
                      value={producto.modelo}
                      onChange={(e) => actualizarProducto(producto.id, 'modelo', e.target.value)}
                      placeholder="Ej: Corolla"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
                    />
                    <datalist id={`modelos-${producto.id}`}>
                      {modelosSugeridos.map((modelo, idx) => (
                        <option key={idx} value={modelo} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={producto.nombre}
                      onChange={(e) => actualizarProducto(producto.id, 'nombre', e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cantidad *</label>
                    <input
                      type="number"
                      value={producto.cantidad}
                      onChange={(e) => actualizarProducto(producto.id, 'cantidad', e.target.value)}
                      required
                      min="1"
                      step="1"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={producto.descripcion}
                    onChange={(e) => actualizarProducto(producto.id, 'descripcion', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Costo Unitario *</label>
                    <input
                      type="number"
                      value={producto.costoUnitario}
                      onChange={(e) => actualizarProducto(producto.id, 'costoUnitario', e.target.value)}
                      required
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Costo Total</label>
                    <input
                      type="text"
                      value={producto.costoTotal}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Imagen</label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-sm">Subir</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => actualizarProducto(producto.id, 'imagen', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-800">Precio Minorista Esperado</label>
                    <input
                      type="number"
                      value={producto.precioMinorista}
                      onChange={(e) => actualizarProducto(producto.id, 'precioMinorista', e.target.value)}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 rounded-lg border border-green-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-800">Precio Mayorista Esperado</label>
                    <input
                      type="number"
                      value={producto.precioMayorista}
                      onChange={(e) => actualizarProducto(producto.id, 'precioMayorista', e.target.value)}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 rounded-lg border border-green-300 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

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
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Cargar Compra
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovimientosCompra
