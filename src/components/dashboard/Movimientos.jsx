import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Plus, Save, X, Search, 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  FileText, AlertCircle, Trash2, Eye, Edit, CheckSquare, Square, Filter
} from 'lucide-react'
import MovimientosCompra from './MovimientosCompra'
import MovimientosVenta from './MovimientosVenta'
import MovimientosGasto from './MovimientosGasto'
import MovimientosAporte from './MovimientosAporte'
import MovimientosRetiro from './MovimientosRetiro'
import MovimientoDetalle from './MovimientoDetalle'
import ModalEliminar from './ModalEliminar'

const Movimientos = ({ companyData }) => {
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useData()
  const [showForm, setShowForm] = useState(false)
  const [showCompraForm, setShowCompraForm] = useState(false)
  const [showVentaForm, setShowVentaForm] = useState(false)
  const [showGastoForm, setShowGastoForm] = useState(false)
  const [showAporteForm, setShowAporteForm] = useState(false)
  const [showRetiroForm, setShowRetiroForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showOnlyDeudas, setShowOnlyDeudas] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedMovimiento, setSelectedMovimiento] = useState(null)
  const [showDetalle, setShowDetalle] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [movimientoToDelete, setMovimientoToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editingMovimiento, setEditingMovimiento] = useState(null)
  const [selectedMovimientos, setSelectedMovimientos] = useState([])

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

  const handleDeleteClick = (movimiento) => {
    setMovimientoToDelete(movimiento)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!movimientoToDelete) return

    setDeleteLoading(true)
    try {
      await deleteInvoice(movimientoToDelete.id)
      setSuccess('Movimiento eliminado exitosamente')
      setShowDeleteModal(false)
      setMovimientoToDelete(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Error al eliminar el movimiento: ' + err.message)
      setTimeout(() => setError(''), 3000)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setMovimientoToDelete(null)
  }

  const handleDeleteMultiple = async () => {
    setDeleteLoading(true)
    setError('')
    
    try {
      // Eliminar todos los movimientos seleccionados
      await Promise.all(
        selectedMovimientos.map(id => deleteInvoice(id))
      )
      
      setSuccess(`${selectedMovimientos.length} movimiento(s) eliminado(s) exitosamente`)
      setSelectedMovimientos([])
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Error al eliminar los movimientos: ' + err.message)
      setTimeout(() => setError(''), 3000)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleViewDetalle = (movimiento) => {
    setSelectedMovimiento(movimiento)
    setShowDetalle(true)
  }

  const handleEdit = (movimiento) => {
    setShowDetalle(false)
    setEditingMovimiento(movimiento)
    
    const movementType = movimiento.metadata?.movementType || (movimiento.type === 'income' ? 'venta' : 'gasto')
    
    if (movementType === 'venta') setShowVentaForm(true)
    else if (movementType === 'compra') setShowCompraForm(true)
    else if (movementType === 'gasto') setShowGastoForm(true)
    else if (movementType === 'aporte') setShowAporteForm(true)
    else if (movementType === 'retiro') setShowRetiroForm(true)
  }

  const filteredMovements = invoices.filter(inv => {
    const matchesSearch = inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtro de deudas
    if (showOnlyDeudas) {
      const tieneDeuda = inv.type === 'income'
        ? (inv.metadata?.cobrado === false || inv.metadata?.cobrado === 'no') && parseFloat(inv.metadata?.deuda || 0) > 0
        : (inv.metadata?.pagado === false || inv.metadata?.pagado === 'no') && parseFloat(inv.metadata?.deuda || 0) > 0
      if (!tieneDeuda) return false
    }
    
    if (filterType === 'all') return matchesSearch
    const movementType = inv.metadata?.movementType || (inv.type === 'income' ? 'venta' : 'gasto')
    return matchesSearch && movementType === filterType
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Modales especializados */}
      {showCompraForm && (
        <MovimientosCompra 
          movimiento={editingMovimiento}
          onClose={() => {
            setShowCompraForm(false)
            setEditingMovimiento(null)
          }}
          onSuccess={(msg) => {
            setSuccess(msg)
            setEditingMovimiento(null)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      {showVentaForm && (
        <MovimientosVenta 
          movimiento={editingMovimiento}
          onClose={() => {
            setShowVentaForm(false)
            setEditingMovimiento(null)
          }}
          onSuccess={(msg) => {
            setSuccess(msg)
            setEditingMovimiento(null)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      {showGastoForm && (
        <MovimientosGasto 
          movimiento={editingMovimiento}
          onClose={() => {
            setShowGastoForm(false)
            setEditingMovimiento(null)
          }}
          onSuccess={(msg) => {
            setSuccess(msg)
            setEditingMovimiento(null)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      {showAporteForm && (
        <MovimientosAporte 
          movimiento={editingMovimiento}
          onClose={() => {
            setShowAporteForm(false)
            setEditingMovimiento(null)
          }}
          onSuccess={(msg) => {
            setSuccess(msg)
            setEditingMovimiento(null)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      {showRetiroForm && (
        <MovimientosRetiro 
          movimiento={editingMovimiento}
          onClose={() => {
            setShowRetiroForm(false)
            setEditingMovimiento(null)
          }}
          onSuccess={(msg) => {
            setSuccess(msg)
            setEditingMovimiento(null)
            setTimeout(() => setSuccess(''), 3000)
          }}
        />
      )}

      {/* Modal de Detalle */}
      {showDetalle && selectedMovimiento && (
        <MovimientoDetalle
          movimiento={selectedMovimiento}
          onClose={() => {
            setShowDetalle(false)
            setSelectedMovimiento(null)
          }}
          onEdit={handleEdit}
        />
      )}

      {/* Modal de Eliminación */}
      {showDeleteModal && movimientoToDelete && (
        <ModalEliminar
          movimiento={movimientoToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          loading={deleteLoading}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {selectedMovimientos.length > 0 && (
            <>
              <button
                onClick={() => setSelectedMovimientos([])}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar ({selectedMovimientos.length})
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar ${selectedMovimientos.length} movimiento(s) seleccionado(s)?`)) {
                    handleDeleteMultiple()
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Seleccionados
              </button>
            </>
          )}
        </div>
        <button
          id="nuevo-movimiento-btn"
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
                <h2 className="text-lg font-bold text-gray-900">Nuevo Movimiento</h2>
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
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 outline-none" />
          </div>
          
          {/* Botón de Deudas */}
          <button
            onClick={() => setShowOnlyDeudas(!showOnlyDeudas)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              showOnlyDeudas 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
            }`}
          >
            {showOnlyDeudas ? '✓ Deudas' : 'Deudas'}
          </button>

          {/* Botón de Filtro */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <Filter className="w-4 h-4" />
              Filtro {filterType !== 'all' && `(${movementTypes[filterType]?.label})`}
            </button>
            
            {showFilterMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => {
                      setFilterType('all')
                      setShowFilterMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      filterType === 'all' ? 'bg-gray-50 font-semibold' : ''
                    }`}
                  >
                    Todos
                  </button>
                  {Object.entries(movementTypes).map(([key, type]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilterType(key)
                        setShowFilterMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                        filterType === key ? 'bg-gray-50 font-semibold' : ''
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                <button
                  onClick={() => {
                    if (selectedMovimientos.length === filteredMovements.length) {
                      setSelectedMovimientos([])
                    } else {
                      setSelectedMovimientos(filteredMovements.map(m => m.id))
                    }
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  title={selectedMovimientos.length === filteredMovements.length ? "Deseleccionar todos" : "Seleccionar todos"}
                >
                  {selectedMovimientos.length === filteredMovements.length && filteredMovements.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-gray-700" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No hay movimientos</p>
              </td></tr>
            ) : (
              filteredMovements.sort((a, b) => new Date(b.date) - new Date(a.date)).map((mov, idx) => {
                // Detectar si tiene deuda pendiente
                const tieneDeuda = mov.type === 'income'
                  ? (mov.metadata?.cobrado === false || mov.metadata?.cobrado === 'no') && parseFloat(mov.metadata?.deuda || 0) > 0
                  : (mov.metadata?.pagado === false || mov.metadata?.pagado === 'no') && parseFloat(mov.metadata?.deuda || 0) > 0
                
                const isSelected = selectedMovimientos.includes(mov.id)
                
                return (
                <tr key={idx} className={`border-b border-gray-100 transition-all duration-150 ${
                  isSelected ? 'bg-gray-50 border-l-4 border-l-gray-900' : 
                  tieneDeuda ? 'bg-gradient-to-r from-red-50/50 to-orange-50/50 border-l-4 border-l-red-400 hover:shadow-sm' : 
                  'hover:bg-gray-50/50'
                }`}>
                  <td className="py-4 px-4 text-sm w-12 text-center">
                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMovimientos(prev => prev.filter(id => id !== mov.id))
                        } else {
                          setSelectedMovimientos(prev => [...prev, mov.id])
                        }
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-gray-700" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700 font-medium">{new Date(mov.date).toLocaleDateString('es-AR')}</td>
                  <td className="py-4 px-6 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        mov.metadata?.movementType === 'compra' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        mov.metadata?.movementType === 'venta' ? 'bg-green-50 text-green-700 border border-green-200' :
                        mov.type === 'income' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {movementTypes[mov.metadata?.movementType || (mov.type === 'income' ? 'venta' : 'gasto')]?.label}
                      </span>
                      {tieneDeuda && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
                          DEUDA
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <div className="text-gray-900 font-medium">{mov.description}</div>
                    {tieneDeuda && (
                      <div className="text-xs text-red-700 font-semibold mt-2 bg-red-50 px-2.5 py-1 rounded-md inline-flex border border-red-200">
                        Deuda: ${parseFloat(mov.metadata?.deuda || 0).toLocaleString('es-AR')}
                      </div>
                    )}
                  </td>
                  <td className={`py-4 px-6 text-sm text-right font-bold ${
                    mov.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${parseFloat(mov.amount).toLocaleString('es-AR')}
                  </td>
                  <td className="py-4 px-6 text-sm text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleViewDetalle(mov)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(mov)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        title="Editar movimiento"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(mov)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Movimientos
