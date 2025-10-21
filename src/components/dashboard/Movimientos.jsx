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
      {/* Modales especializados */}
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Movimientos Financieros</h1>
          <p className="text-sm text-gray-600 mt-1">Gestiona todas tus operaciones</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Movimiento
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Nuevo Movimiento</h2>
                <p className="text-sm text-gray-600 mt-1">Selecciona el tipo de operación</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(movementTypes).map(([key, type]) => {
                  const Icon = type.icon
                  const colors = {
                    venta: 'hover:border-green-500 hover:bg-green-50',
                    compra: 'hover:border-blue-500 hover:bg-blue-50',
                    gasto: 'hover:border-red-500 hover:bg-red-50',
                    aporte: 'hover:border-purple-500 hover:bg-purple-50',
                    retiro: 'hover:border-orange-500 hover:bg-orange-50'
                  }
                  
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        if (key === 'compra') setShowCompraForm(true)
                        else if (key === 'venta') setShowVentaForm(true)
                        else if (key === 'gasto') setShowGastoForm(true)
                        else if (key === 'aporte') setShowAporteForm(true)
                        else if (key === 'retiro') setShowRetiroForm(true)
                      }}
                      className={`p-6 rounded-lg border-2 border-gray-200 ${colors[key]} transition-all group`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-gray-700" />
                      <p className="text-sm font-medium text-gray-700">{type.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>
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
