import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react'
import FinancialTooltip from './FinancialTooltip'

const DolarCard = () => {
  const [dolarData, setDolarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDolarData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('https://dolarapi.com/v1/dolares')
      
      if (!response.ok) {
        throw new Error('Error al obtener cotización')
      }
      
      const data = await response.json()
      
      const oficial = data.find(d => d.casa === 'oficial')
      const blue = data.find(d => d.casa === 'blue')
      
      setDolarData({
        oficial: {
          compra: oficial?.compra || 0,
          venta: oficial?.venta || 0,
        },
        blue: {
          compra: blue?.compra || 0,
          venta: blue?.venta || 0,
        }
      })
    } catch (err) {
      console.error('Error fetching dolar data:', err)
      setError('No se pudo obtener la cotización')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDolarData()
    const interval = setInterval(fetchDolarData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(value)
  }

  if (loading && !dolarData) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-500">Cargando cotización...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <FinancialTooltip term="dolar">
              <h3 className="text-sm font-semibold text-gray-900">Cotización USD</h3>
            </FinancialTooltip>
          </div>
          <button
            onClick={fetchDolarData}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-900">Cotización USD</h3>
        </div>
        <button
          onClick={fetchDolarData}
          disabled={loading}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          title="Actualizar cotización"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Dólar Oficial */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Oficial</span>
          <span className="text-xs text-gray-400">Regulado BCRA</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Compra</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(dolarData?.oficial?.compra || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Venta</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(dolarData?.oficial?.venta || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Dólar Blue */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Blue</span>
          <span className="text-xs text-gray-400">Mercado paralelo</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Compra</p>
            <p className="text-lg font-bold text-purple-600">
              {formatCurrency(dolarData?.blue?.compra || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Venta</p>
            <p className="text-lg font-bold text-cyan-600">
              {formatCurrency(dolarData?.blue?.venta || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Brecha */}
      {dolarData && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-900">Brecha</span>
            </div>
            <span className="text-sm font-bold text-orange-600">
              {((((dolarData.blue.venta - dolarData.oficial.venta) / dolarData.oficial.venta) * 100).toFixed(1))}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DolarCard
