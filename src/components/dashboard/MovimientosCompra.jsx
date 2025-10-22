import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Plus, Save, X, Upload, Mic, Sparkles, Loader, 
  ShoppingCart, AlertCircle, CheckCircle, Image as ImageIcon, Trash2
} from 'lucide-react'

const MovimientosCompra = ({ onClose, onSuccess }) => {
  const { addInvoice, invoices, addInventoryItem } = useData()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzed, setAiAnalyzed] = useState(false)

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'minorista',
    proveedor: '',
    medio: 'efectivo',
    pago: 'si',
    deuda: '',
    montoTotal: '',
    comprobante: null,
    productos: []
  })

  const [productos, setProductos] = useState([{
    id: Date.now(),
    categoria: '',
    nombre: '',
    descripcion: '',
    cantidad: 1,
    costoUnitario: '',
    costoTotal: '',
    imagen: null,
    precioMinorista: '',
    precioMayorista: ''
  }])

  const mediosPago = ['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'cheque', 'mercadopago']
  
  // Obtener proveedores únicos de compras anteriores
  const proveedoresSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'compra' && inv.metadata?.provider)
      .map(inv => inv.metadata.provider)
  )]

  // Obtener categorías únicas
  const categoriasSugeridas = [...new Set(
    invoices
      .filter(inv => inv.category)
      .map(inv => inv.category)
  )]

  // Análisis con IA de comprobante o audio
  const analyzeWithAI = async (file, type) => {
    setAnalyzing(true)
    setError('')

    try {
      // Simular análisis de IA (en producción llamaría a OpenAI/GPT-4)
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Simulación de datos extraídos por IA
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
          },
          {
            id: Date.now() + 1,
            categoria: categoriasSugeridas[0] || 'Mercadería',
            nombre: 'Producto Detectado 2',
            descripcion: 'Descripción extraída del comprobante',
            cantidad: 5,
            costoUnitario: '1000',
            costoTotal: '5000',
            precioMinorista: '1500',
            precioMayorista: '1300'
          }
        ]
      }

      setFormData(prev => ({
        ...prev,
        ...aiData,
        comprobante: file
      }))
      setProductos(aiData.productos)
      setAiAnalyzed(true)
      setError('')
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

  const handleAudioRecord = async () => {
    // Simulación de grabación de audio
    setError('Función de audio en desarrollo. Por favor usa comprobante o manual.')
  }

  const agregarProducto = () => {
    setProductos([...productos, {
      id: Date.now(),
      categoria: '',
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
        if (!prod.categoria) throw new Error('Todos los productos deben tener categoría')
        if (!prod.cantidad || prod.cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0')
        if (!prod.costoUnitario || prod.costoUnitario <= 0) throw new Error('El costo unitario debe ser mayor a 0')
      }

      // Crear movimiento de compra
      const compra = {
        type: 'expense',
        date: formData.fecha,
        amount: parseFloat(montoCalculado),
        description: `Compra ${formData.tipo} - ${formData.proveedor}`,
        category: 'Mercadería',
        number: `COMPRA-${Date.now()}`,
        metadata: {
          movementType: 'compra',
          tipoCompra: formData.tipo,
          provider: formData.proveedor,
          paymentMethod: formData.medio,
          pagado: formData.pago === 'si',
          deuda: formData.pago === 'no' ? parseFloat(formData.deuda) : 0,
          productos: productos.map(p => ({
            categoria: p.categoria,
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

      await addInvoice(compra)
      
      // Agregar productos al inventario
      for (const prod of productos) {
        const inventoryItem = {
          name: prod.nombre,
          category: prod.categoria,
          description: prod.descripcion || '',
          quantity: parseFloat(prod.cantidad),
          unit_price: parseFloat(prod.precioMinorista) || parseFloat(prod.costoUnitario) * 1.5,
          cost_price: parseFloat(prod.costoUnitario),
          wholesale_price: parseFloat(prod.precioMayorista) || parseFloat(prod.costoUnitario) * 1.3,
          min_stock: Math.ceil(parseFloat(prod.cantidad) * 0.2), // 20% del stock inicial
          supplier: formData.proveedor,
          purchase_date: formData.fecha
        }
        
        try {
          if (addInventoryItem) {
            await addInventoryItem(inventoryItem)
          }
        } catch (invError) {
          console.error('Error al agregar al inventario:', invError)
        }
      }
      
      onSuccess?.('Compra registrada exitosamente. Inventario actualizado.')
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
              <h2 className="text-xl font-semibold text-gray-900">Nueva Compra</h2>
              <p className="text-gray-500 text-sm">Registra una compra y actualiza el inventario</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
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

            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3.5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-all">
                <Upload className="w-4 h-4 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Subir Comprobante</p>
                  <p className="text-xs text-gray-500">PDF o Imagen</p>
                </div>
                <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" disabled={analyzing} />
              </label>

              <button
                type="button"
                onClick={handleAudioRecord}
                disabled={analyzing}
                className="flex items-center gap-3 p-3.5 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <Mic className="w-4 h-4 text-gray-600" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Grabar Audio</p>
                  <p className="text-xs text-gray-500">Describe la compra</p>
                </div>
              </button>
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Productos</h3>
              <button
                type="button"
                onClick={agregarProducto}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
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

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoría *</label>
                    <input
                      type="text"
                      list={`categorias-${producto.id}`}
                      value={producto.categoria}
                      onChange={(e) => actualizarProducto(producto.id, 'categoria', e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none"
                    />
                    <datalist id={`categorias-${producto.id}`}>
                      {categoriasSugeridas.map((cat, idx) => (
                        <option key={idx} value={cat} />
                      ))}
                    </datalist>
                  </div>

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
                      step="0.01"
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
