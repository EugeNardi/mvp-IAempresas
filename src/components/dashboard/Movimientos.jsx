import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Plus, Save, X, Search, 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  FileText, AlertCircle
} from 'lucide-react'
import MovimientosCompra from './MovimientosCompra'
import MovimientosVenta from './MovimientosVenta'
import MovimientosGasto from './MovimientosGasto'
import MovimientosAporte from './MovimientosAporte'
import MovimientosRetiro from './MovimientosRetiro'

const Movimientos = ({ companyData }) => {
  const { invoices, addInvoice } = useData()
  const [showForm, setShowForm] = useState(false)
  const [showCompraForm, setShowCompraForm] = useState(false)
  const [showVentaForm, setShowVentaForm] = useState(false)
  const [showGastoForm, setShowGastoForm] = useState(false)
  const [showAporteForm, setShowAporteForm] = useState(false)
  const [showRetiroForm, setShowRetiroForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    type: 'venta',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: '',
    provider: '',
    product: '',
    quantity: 1,
    unitPrice: '',
    number: '',
    paymentMethod: 'efectivo'
  })

  const movementTypes = {
    venta: { label: 'Venta', icon: TrendingUp, color: 'green', accountType: 'income' },
    compra: { label: 'Compra', icon: ShoppingCart, color: 'blue', accountType: 'expense' },
    gasto: { label: 'Gasto', icon: TrendingDown, color: 'red', accountType: 'expense' },
    aporte: { label: 'Aporte', icon: DollarSign, color: 'purple', accountType: 'income' },
    retiro: { label: 'Retiro', icon: TrendingDown, color: 'orange', accountType: 'expense' }
  }

  const categoriesByType = {
    venta: ['Productos', 'Servicios', 'Consultoría', 'Comisiones'],
    compra: ['Mercadería', 'Materia Prima', 'Insumos', 'Equipamiento'],
    gasto: ['Sueldos', 'Alquiler', 'Servicios', 'Marketing', 'Impuestos'],
    aporte: ['Capital Inicial', 'Inversión', 'Préstamo Recibido'],
    retiro: ['Dividendos', 'Retiro Socio', 'Préstamo Otorgado']
  }

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'mercadopago', label: 'Mercado Pago' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'quantity' || name === 'unitPrice') {
      const qty = name === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity)
      const price = name === 'unitPrice' ? parseFloat(value) : parseFloat(formData.unitPrice)
      if (!isNaN(qty) && !isNaN(price)) {
        setFormData(prev => ({ ...prev, amount: (qty * price).toFixed(2) }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('El monto debe ser mayor a 0')
      }

      const movement = {
        type: movementTypes[formData.type].accountType,
        date: formData.date,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        number: formData.number || `${formData.type.toUpperCase()}-${Date.now()}`,
        metadata: {
          movementType: formData.type,
          provider: formData.provider,
          product: formData.product,
          quantity: formData.quantity,
          unitPrice: formData.unitPrice,
          paymentMethod: formData.paymentMethod
        }
      }

      await addInvoice(movement)
      setSuccess(`${movementTypes[formData.type].label} registrado exitosamente`)
      setShowForm(false)
      setFormData({
        type: 'venta',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        category: '',
        provider: '',
        product: '',
        quantity: 1,
        unitPrice: '',
        number: '',
        paymentMethod: 'efectivo'
      })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredMovements = invoices.filter(inv => {
    const matchesSearch = inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterType === 'all') return matchesSearch
    const movementType = inv.metadata?.movementType || (inv.type === 'income' ? 'venta' : 'gasto')
    return matchesSearch && movementType === filterType
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {showCompraForm && (
        <MovimientosCompra 
          onClose={() => setShowCompraForm(false)}
          onSuccess={(msg) => {
            setSuccess(msg)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      {showVentaForm && (
        <MovimientosVenta 
          onClose={() => setShowVentaForm(false)}
          onSuccess={(msg) => {
            setSuccess(msg)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      {showGastoForm && (
        <MovimientosGasto 
          onClose={() => setShowGastoForm(false)}
          onSuccess={(msg) => {
            setSuccess(msg)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      {showAporteForm && (
        <MovimientosAporte 
          onClose={() => setShowAporteForm(false)}
          onSuccess={(msg) => {
            setSuccess(msg)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      {showRetiroForm && (
        <MovimientosRetiro 
          onClose={() => setShowRetiroForm(false)}
          onSuccess={(msg) => {
            setSuccess(msg)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimientos Financieros</h1>
          <p className="text-sm text-gray-600 mt-1">Centro de gestión de operaciones</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
        >
          <Plus className="w-5 h-5" />
          Nuevo
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Nuevo Movimiento</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Tipo de Movimiento *</label>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(movementTypes).map(([key, type]) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setShowForm(false)
                          if (key === 'compra') {
                            setShowCompraForm(true)
                          } else if (key === 'venta') {
                            setShowVentaForm(true)
                          } else if (key === 'gasto') {
                            setShowGastoForm(true)
                          } else if (key === 'aporte') {
                            setShowAporteForm(true)
                          } else if (key === 'retiro') {
                            setShowRetiroForm(true)
                          }
                        }}
                        className={`p-4 rounded-lg border-2 ${formData.type === key ? 'border-gray-900 bg-gray-50' : 'border-gray-300'}`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-semibold">{type.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número</label>
                  <input type="text" name="number" value={formData.number} onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoría *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none">
                  <option value="">Seleccionar</option>
                  {categoriesByType[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{formData.type === 'venta' ? 'Cliente' : 'Proveedor'}</label>
                  <input type="text" name="provider" value={formData.provider} onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Producto/Servicio</label>
                  <input type="text" name="product" value={formData.product} onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cantidad</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Precio Unit.</label>
                  <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleInputChange} step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monto Total *</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required step="0.01"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Método de Pago</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 outline-none">
                  {paymentMethods.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? 'Guardando...' : (<><Save className="w-5 h-5" />Guardar</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 outline-none" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 outline-none">
            <option value="all">Todos</option>
            {Object.entries(movementTypes).map(([key, type]) => (
              <option key={key} value={key}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold">Fecha</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Tipo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Descripción</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Categoría</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">Monto</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No hay movimientos</p>
              </td></tr>
            ) : (
              filteredMovements.sort((a, b) => new Date(b.date) - new Date(a.date)).map((mov, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{new Date(mov.date).toLocaleDateString('es-AR')}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      mov.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {movementTypes[mov.metadata?.movementType || (mov.type === 'income' ? 'venta' : 'gasto')]?.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{mov.description}</td>
                  <td className="py-3 px-4 text-sm">{mov.category}</td>
                  <td className={`py-3 px-4 text-sm text-right font-semibold ${
                    mov.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${parseFloat(mov.amount).toLocaleString('es-AR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Movimientos
