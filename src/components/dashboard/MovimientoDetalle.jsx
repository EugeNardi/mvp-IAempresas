import React, { useState } from 'react'
import { X, Calendar, DollarSign, FileText, Tag, User, CreditCard, Package, TrendingUp, TrendingDown, ShoppingCart, Wallet, CheckCircle } from 'lucide-react'
import { useData } from '../../context/DataContext'

const MovimientoDetalle = ({ movimiento, onClose, onEdit }) => {
  const { updateInvoice } = useData()
  const [loading, setLoading] = useState(false)
  const [showPagoForm, setShowPagoForm] = useState(false)
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0])
  
  if (!movimiento) return null
  
  // Detectar si tiene deuda pendiente
  const tieneDeuda = movimiento.type === 'income'
    ? (movimiento.metadata?.cobrado === false || movimiento.metadata?.cobrado === 'no') && parseFloat(movimiento.metadata?.deuda || 0) > 0
    : (movimiento.metadata?.pagado === false || movimiento.metadata?.pagado === 'no') && parseFloat(movimiento.metadata?.deuda || 0) > 0
  
  const handleMarcarPagado = async () => {
    setLoading(true)
    try {
      const updatedMetadata = {
        ...movimiento.metadata,
        ...(movimiento.type === 'income' 
          ? { cobrado: true, fechaCobro: fechaPago }
          : { pagado: true, fechaPago: fechaPago }
        )
      }
      
      await updateInvoice(movimiento.id, {
        ...movimiento,
        metadata: updatedMetadata
      })
      
      setShowPagoForm(false)
      onClose()
      window.location.reload() // Recargar para actualizar la lista
    } catch (error) {
      console.error('Error al marcar como pagado:', error)
      alert('Error al actualizar el movimiento')
    } finally {
      setLoading(false)
    }
  }

  const movementTypes = {
    venta: { label: 'Venta', icon: TrendingUp, color: 'green' },
    compra: { label: 'Compra', icon: ShoppingCart, color: 'blue' },
    gasto: { label: 'Gasto', icon: TrendingDown, color: 'red' },
    aporte: { label: 'Aporte', icon: DollarSign, color: 'purple' },
    retiro: { label: 'Retiro', icon: Wallet, color: 'orange' }
  }

  const movementType = movimiento.metadata?.movementType || (movimiento.type === 'income' ? 'venta' : 'gasto')
  const typeInfo = movementTypes[movementType] || movementTypes.gasto
  const Icon = typeInfo.icon

  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  }

  const iconColorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${iconColorClasses[typeInfo.color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Detalle del Movimiento</h2>
              <p className="text-gray-500 text-sm">{typeInfo.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Badge de tipo */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${colorClasses[typeInfo.color]}`}>
              {typeInfo.label}
            </span>
            <span className="text-sm text-gray-500">
              #{movimiento.number || movimiento.invoice_number || movimiento.id?.slice(0, 8)}
            </span>
          </div>

          {/* Información Principal */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Información Principal</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fecha</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(movimiento.date || movimiento.invoice_date).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Monto</p>
                  <p className={`text-lg font-bold ${movimiento.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    ${parseFloat(movimiento.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Categoría</p>
                  <p className="text-sm font-medium text-gray-900">{movimiento.category}</p>
                </div>
              </div>

              {movimiento.metadata?.paymentMethod && (
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Medio de Pago</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {movimiento.metadata.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {movimiento.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Descripción</p>
                    <p className="text-sm text-gray-700">{movimiento.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información Específica por Tipo */}
          {movementType === 'venta' && movimiento.metadata?.cliente && (
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Datos de Venta</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cliente</span>
                  <span className="text-sm font-medium text-gray-900">{movimiento.metadata.cliente}</span>
                </div>
                {movimiento.metadata.tipoVenta && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tipo</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{movimiento.metadata.tipoVenta}</span>
                  </div>
                )}
                {movimiento.metadata.cobrado !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      movimiento.metadata.cobrado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {movimiento.metadata.cobrado ? 'Cobrado' : 'Pendiente'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {movementType === 'compra' && movimiento.metadata?.provider && (
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Datos de Compra</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Proveedor</span>
                  <span className="text-sm font-medium text-gray-900">{movimiento.metadata.provider}</span>
                </div>
                {movimiento.metadata.pagado !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      movimiento.metadata.pagado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {movimiento.metadata.pagado ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {movementType === 'gasto' && movimiento.metadata?.beneficiario && (
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Datos del Gasto</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Beneficiario</span>
                  <span className="text-sm font-medium text-gray-900">{movimiento.metadata.beneficiario}</span>
                </div>
                {movimiento.metadata.concepto && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Concepto</span>
                    <span className="text-sm font-medium text-gray-900">{movimiento.metadata.concepto}</span>
                  </div>
                )}
                {movimiento.metadata.recurrente && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recurrencia</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{movimiento.metadata.frecuencia}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Productos */}
          {movimiento.metadata?.productos && movimiento.metadata.productos.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Productos ({movimiento.metadata.productos.length})
              </h3>
              <div className="space-y-3">
                {movimiento.metadata.productos.map((producto, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{producto.nombre}</span>
                      <span className="text-sm font-bold text-gray-900">
                        ${parseFloat(producto.precioTotal || producto.costoTotal || 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Cantidad: {producto.cantidad}</span>
                      <span>Precio Unit.: ${parseFloat(producto.precioUnitario || producto.costoUnitario || 0).toLocaleString('es-AR')}</span>
                      {producto.descuento > 0 && <span>Desc.: {producto.descuento}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerta de Deuda y Opción de Pago */}
          {tieneDeuda && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">Deuda Pendiente</h4>
                  <p className="text-sm text-red-700">
                    {movimiento.type === 'income' ? 'Este cliente debe' : 'Debes pagar'}: <span className="font-bold">${parseFloat(movimiento.metadata?.deuda || 0).toLocaleString('es-AR')}</span>
                  </p>
                </div>
              </div>
              
              {!showPagoForm ? (
                <button
                  onClick={() => setShowPagoForm(true)}
                  className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar como {movimiento.type === 'income' ? 'Cobrado' : 'Pagado'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Fecha de {movimiento.type === 'income' ? 'Cobro' : 'Pago'}
                    </label>
                    <input
                      type="date"
                      value={fechaPago}
                      onChange={(e) => setFechaPago(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleMarcarPagado}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => setShowPagoForm(false)}
                      className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => onEdit(movimiento)}
              className={`flex-1 px-4 py-2.5 text-white text-sm rounded-lg font-medium transition-colors ${
                typeInfo.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                typeInfo.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                typeInfo.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                typeInfo.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              Editar Movimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovimientoDetalle
