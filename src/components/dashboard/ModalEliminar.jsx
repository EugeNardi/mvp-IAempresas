import React, { useState } from 'react'
import { AlertTriangle, Trash2, X, Loader } from 'lucide-react'

const ModalEliminar = ({ movimiento, onConfirm, onCancel, loading }) => {
  if (!movimiento) return null

  const movementTypes = {
    venta: { label: 'Venta', color: 'green' },
    compra: { label: 'Compra', color: 'blue' },
    gasto: { label: 'Gasto', color: 'red' },
    aporte: { label: 'Aporte', color: 'purple' },
    retiro: { label: 'Retiro', color: 'orange' }
  }

  const movementType = movimiento.metadata?.movementType || (movimiento.type === 'income' ? 'venta' : 'gasto')
  const typeInfo = movementTypes[movementType] || movementTypes.gasto

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h2>
              <p className="text-sm text-gray-500 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
            <button 
              onClick={onCancel} 
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Información del movimiento */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase">Movimiento a Eliminar</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                typeInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                typeInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                typeInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                typeInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {typeInfo.label}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fecha:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(movimiento.date || movimiento.invoice_date).toLocaleDateString('es-AR')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monto:</span>
                <span className={`text-sm font-bold ${
                  movimiento.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${parseFloat(movimiento.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              {movimiento.description && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Descripción:</span>
                  <p className="text-sm text-gray-900 mt-1 line-clamp-2">{movimiento.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Warning message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-900 font-medium">¿Estás seguro?</p>
                <p className="text-xs text-amber-700 mt-1">
                  El movimiento será eliminado permanentemente. Esta acción no se puede revertir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Eliminar Movimiento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalEliminar
