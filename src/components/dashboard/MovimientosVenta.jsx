import React, { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Plus, Save, X, Upload, Mic, Sparkles, Loader, 
  TrendingUp, AlertCircle, CheckCircle, Image as ImageIcon, Trash2, Package
} from 'lucide-react'
import AudioRecorderComponent from '../common/AudioRecorder'
import { processAudioForMovement, isOpenAIConfigured } from '../../services/aiService'

const MovimientosVenta = ({ movimiento, onClose, onSuccess }) => {
  const { addInvoice, updateInvoice, invoices, inventoryItems, updateProductStock, loadInventoryItems } = useData()
  const isEditing = !!movimiento
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzed, setAiAnalyzed] = useState(false)

  // Cargar inventario al montar el componente
  useEffect(() => {
    if (loadInventoryItems) {
      loadInventoryItems()
    }
  }, [])

  const [formData, setFormData] = useState(() => {
    if (isEditing && movimiento) {
      return {
        fecha: movimiento.date || movimiento.invoice_date || new Date().toISOString().split('T')[0],
        tipo: movimiento.metadata?.tipoVenta || 'minorista',
        cliente: movimiento.metadata?.cliente || '',
        medio: movimiento.metadata?.paymentMethod || 'efectivo',
        cobrado: movimiento.metadata?.cobrado ? 'si' : 'no',
        deuda: movimiento.metadata?.deuda || '',
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
      stockDisponible: 0
    }]
  })

  const mediosPago = ['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'cheque', 'mercadopago']
  
  const clientesSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'venta' && inv.metadata?.cliente)
      .map(inv => inv.metadata.cliente)
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
    setProductos([...productos, {
      id: Date.now(),
      productoId: '',
      nombre: '',
      descripcion: '',
      cantidad: 1,
      precioUnitario: '',
      precioTotal: '',
      descuento: 0,
      stockDisponible: 0
    }])
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
            updated.precioUnitario = formData.tipo === 'mayorista' 
              ? (item.wholesale_price || item.sale_price || item.unit_cost * 1.3)
              : (item.sale_price || item.unit_cost * 1.5)
            updated.stockDisponible = item.current_stock || 0
          }
        }
        
        // Calcular precio total
        if (campo === 'cantidad' || campo === 'precioUnitario' || campo === 'descuento') {
          const cantidad = campo === 'cantidad' ? parseFloat(valor) : parseFloat(p.cantidad)
          const precio = campo === 'precioUnitario' ? parseFloat(valor) : parseFloat(p.precioUnitario)
          const descuento = campo === 'descuento' ? parseFloat(valor) : parseFloat(p.descuento)
          
          if (!isNaN(cantidad) && !isNaN(precio)) {
            const subtotal = cantidad * precio
            const montoDescuento = subtotal * (descuento / 100)
            updated.precioTotal = (subtotal - montoDescuento).toFixed(2)
          }
        }
        
        return updated
      }
      return p
    }))
  }

  const calcularMontoTotal = () => {
    return productos.reduce((sum, p) => sum + (parseFloat(p.precioTotal) || 0), 0).toFixed(2)
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
          productos: productos.map(p => ({
            productoId: p.productoId,
            nombre: p.nombre,
            cantidad: parseFloat(p.cantidad),
            precioUnitario: parseFloat(p.precioUnitario),
            precioTotal: parseFloat(p.precioTotal),
            descuento: parseFloat(p.descuento || 0)
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
            <div className="p-2.5 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Editar Venta' : 'Nueva Venta'}</h2>
              <p className="text-gray-500 text-sm">{isEditing ? 'Modifica los datos de la venta' : 'Registra una venta y actualiza el inventario'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* IA Analysis */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Análisis Automático con IA</h3>
                <p className="text-sm text-gray-600">Sube un comprobante o graba un audio</p>
              </div>
            </div>

            {analyzing && (
              <div className="flex items-center gap-3 p-3.5 bg-green-50 rounded-lg mb-4 border border-green-100">
                <Loader className="w-4 h-4 text-green-600 animate-spin" />
                <p className="text-sm text-green-700">Analizando con IA...</p>
              </div>
            )}

            {aiAnalyzed && (
              <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg mb-4">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700">Formulario completado por IA. Revisa y ajusta.</p>
              </div>
            )}

            <div className="space-y-3">
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

            <div className="grid md:grid-cols-3 gap-4">
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

              {formData.cobrado === 'no' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-red-700">Deuda a Cobrar *</label>
                  <input
                    type="number"
                    value={formData.deuda}
                    onChange={(e) => setFormData({...formData, deuda: e.target.value})}
                    required
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-red-400 bg-red-50 outline-none font-semibold text-red-800"
                  />
                </div>
              )}
            </div>

            <div className="bg-green-50 p-5 rounded-xl border border-green-200">
              <p className="text-xs text-gray-600 font-medium mb-1.5">Monto Total</p>
              <p className="text-3xl font-bold text-green-600">
                ${calcularMontoTotal()}
              </p>
            </div>
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
              <div key={producto.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Producto #{index + 1}</h4>
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

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Cantidad *</label>
                    <input
                      type="number"
                      value={producto.cantidad}
                      onChange={(e) => actualizarProducto(producto.id, 'cantidad', e.target.value)}
                      required
                      min="1"
                      step="0.01"
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                    {producto.stockDisponible > 0 && (
                      <p className="text-xs text-gray-600 mt-1">Stock: {producto.stockDisponible}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Precio Unit. *</label>
                    <input
                      type="number"
                      value={producto.precioUnitario}
                      onChange={(e) => actualizarProducto(producto.id, 'precioUnitario', e.target.value)}
                      required
                      step="0.01"
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Descuento %</label>
                    <input
                      type="number"
                      value={producto.descuento}
                      onChange={(e) => actualizarProducto(producto.id, 'descuento', e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">Total</label>
                    <input
                      type="text"
                      value={producto.precioTotal}
                      readOnly
                      className="w-full px-3.5 py-2 rounded-lg border border-green-300 bg-green-50 font-semibold text-green-700 text-sm"
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
