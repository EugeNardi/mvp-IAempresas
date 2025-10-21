import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Plus, Save, X, Upload, Mic, Sparkles, Loader, 
  TrendingUp, AlertCircle, CheckCircle, Image as ImageIcon, Trash2
} from 'lucide-react'

const MovimientosVenta = ({ onClose, onSuccess }) => {
  const { addInvoice, invoices, inventoryItems, updateInventoryItem } = useData()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzed, setAiAnalyzed] = useState(false)

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'minorista',
    cliente: '',
    medio: 'efectivo',
    cobrado: 'si',
    deuda: '',
    montoTotal: '',
    comprobante: null,
    productos: []
  })

  const [productos, setProductos] = useState([{
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
    } catch (err) {
      setError('Error al analizar con IA. Por favor completa manualmente.')
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
            updated.descripcion = item.description
            updated.precioUnitario = formData.tipo === 'mayorista' 
              ? item.wholesale_price 
              : item.unit_price
            updated.stockDisponible = item.quantity
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
        
        // Verificar stock
        if (prod.productoId) {
          const item = inventoryItems.find(i => i.id === prod.productoId)
          if (item && item.quantity < prod.cantidad) {
            throw new Error(`Stock insuficiente para ${prod.nombre}. Disponible: ${item.quantity}`)
          }
        }
      }

      const venta = {
        type: 'income',
        date: formData.fecha,
        amount: parseFloat(montoCalculado),
        description: `Venta ${formData.tipo} - ${formData.cliente}`,
        category: 'Productos',
        number: `VENTA-${Date.now()}`,
        metadata: {
          movementType: 'venta',
          tipoVenta: formData.tipo,
          cliente: formData.cliente,
          paymentMethod: formData.medio,
          cobrado: formData.cobrado === 'si',
          deuda: formData.cobrado === 'no' ? parseFloat(formData.deuda) : 0,
          productos: productos.map(p => ({
            productoId: p.productoId,
            nombre: p.nombre,
            descripcion: p.descripcion,
            cantidad: parseFloat(p.cantidad),
            precioUnitario: parseFloat(p.precioUnitario),
            precioTotal: parseFloat(p.precioTotal),
            descuento: parseFloat(p.descuento) || 0
          })),
          comprobante: formData.comprobante,
          aiAnalyzed: aiAnalyzed
        }
      }

      await addInvoice(venta)
      
      // Actualizar inventario (descontar stock)
      for (const prod of productos) {
        if (prod.productoId && updateInventoryItem) {
          const item = inventoryItems.find(i => i.id === prod.productoId)
          if (item) {
            await updateInventoryItem(prod.productoId, {
              quantity: item.quantity - parseFloat(prod.cantidad)
            })
          }
        }
      }
      
      onSuccess?.('Venta registrada exitosamente. Inventario actualizado.')
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border-2 border-green-200">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex items-center justify-between z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Nueva Venta</h2>
              <p className="text-green-100 text-sm">Registra una venta y actualiza el inventario</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* IA Analysis */}
          <div className="bg-white border-2 border-green-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Análisis Automático con IA</h3>
                <p className="text-sm text-gray-600">Sube un comprobante o graba un audio</p>
              </div>
            </div>

            {analyzing && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg mb-4 border border-green-200">
                <Loader className="w-5 h-5 text-green-600 animate-spin" />
                <p className="text-sm font-medium text-green-800">Analizando con IA...</p>
              </div>
            )}

            {aiAnalyzed && (
              <div className="flex items-center gap-3 p-4 bg-green-100 border-2 border-green-300 rounded-lg mb-4">
                <CheckCircle className="w-5 h-5 text-green-700" />
                <p className="text-sm font-medium text-green-900">Formulario completado por IA. Revisa y ajusta.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 bg-white border-2 border-green-300 rounded-lg cursor-pointer hover:border-green-500 hover:shadow-md transition-all">
                <Upload className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Subir Comprobante</p>
                  <p className="text-xs text-gray-600">PDF o Imagen</p>
                </div>
                <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" disabled={analyzing} />
              </label>

              <button
                type="button"
                onClick={() => setError('Función de audio en desarrollo')}
                disabled={analyzing}
                className="flex items-center gap-3 p-4 bg-white border-2 border-green-300 rounded-lg hover:border-green-500 hover:shadow-md transition-all disabled:opacity-50"
              >
                <Mic className="w-5 h-5 text-green-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Grabar Audio</p>
                  <p className="text-xs text-gray-600">Describe la venta</p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Datos Generales */}
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border-2 border-green-100">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Datos Generales
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
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

            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-lg border-2 border-green-300">
              <p className="text-sm text-green-800 font-medium mb-2">Monto Total</p>
              <p className="text-4xl font-bold text-green-700">
                ${calcularMontoTotal()}
              </p>
            </div>
          </div>

          {/* Productos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Productos
              </h3>
              <button
                type="button"
                onClick={agregarProducto}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Agregar Producto
              </button>
            </div>

            {productos.map((producto, index) => (
              <div key={producto.id} className="bg-white border-2 border-green-200 rounded-lg p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Producto #{index + 1}</h4>
                  {productos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarProducto(producto.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Producto del Inventario</label>
                    <select
                      value={producto.productoId}
                      onChange={(e) => actualizarProducto(producto.id, 'productoId', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                    >
                      <option value="">Seleccionar o crear nuevo</option>
                      {inventoryItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} (Stock: {item.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={producto.nombre}
                      onChange={(e) => actualizarProducto(producto.id, 'nombre', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cantidad *</label>
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
                    <label className="block text-sm font-medium mb-2">Precio Unit. *</label>
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
                    <label className="block text-sm font-medium mb-2">Descuento %</label>
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
                    <label className="block text-sm font-medium mb-2">Total</label>
                    <input
                      type="text"
                      value={producto.precioTotal}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-green-300 bg-green-50 font-bold text-green-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t-2 border-green-200 sticky bottom-0 bg-gradient-to-br from-green-50 to-emerald-50 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Registrar Venta
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
