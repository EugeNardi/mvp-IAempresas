import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Info } from 'lucide-react'

const DolarWidget = () => {
  const [dolarData, setDolarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)

  const fetchDolarData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // API de dólar argentina - dolarapi.com (gratuita y sin autenticación)
      const response = await fetch('https://dolarapi.com/v1/dolares')
      
      if (!response.ok) {
        throw new Error('Error al obtener cotización')
      }
      
      const data = await response.json()
      
      // Extraer dólar oficial y blue
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
      
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching dolar data:', err)
      setError('No se pudo obtener la cotización')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDolarData()
    // Actualizar cada 5 minutos
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

  const formatTime = (date) => {
    if (!date) return ''
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading && !dolarData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-500">Cargando cotización...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
          <button
            onClick={fetchDolarData}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Cotización USD</h3>
            {lastUpdate && (
              <p className="text-xs text-gray-500">
                Actualizado {formatTime(lastUpdate)}
              </p>
            )}
          </div>
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
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1 relative">
            <span className="text-xs font-medium text-gray-600">Dólar Oficial</span>
            <button
              className="relative"
              onMouseEnter={() => setShowTooltip('oficial')}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </button>
            {showTooltip === 'oficial' && (
              <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                <p className="font-semibold mb-1">Dólar Oficial</p>
                <p>Cotización regulada por el Banco Central. Se usa para operaciones formales, importaciones y exportaciones.</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-md p-2">
            <p className="text-xs text-blue-600 mb-1">Compra</p>
            <p className="text-sm font-bold text-blue-900">
              {formatCurrency(dolarData?.oficial?.compra || 0)}
            </p>
          </div>
          <div className="bg-green-50 rounded-md p-2">
            <p className="text-xs text-green-600 mb-1">Venta</p>
            <p className="text-sm font-bold text-green-900">
              {formatCurrency(dolarData?.oficial?.venta || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Dólar Blue */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1 relative">
            <span className="text-xs font-medium text-gray-600">Dólar Blue</span>
            <button
              className="relative"
              onMouseEnter={() => setShowTooltip('blue')}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </button>
            {showTooltip === 'blue' && (
              <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                <p className="font-semibold mb-1">Dólar Blue (Informal)</p>
                <p>Cotización del mercado paralelo o informal. Refleja el valor real del dólar en el mercado libre sin restricciones.</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-purple-50 rounded-md p-2">
            <p className="text-xs text-purple-600 mb-1">Compra</p>
            <p className="text-sm font-bold text-purple-900">
              {formatCurrency(dolarData?.blue?.compra || 0)}
            </p>
          </div>
          <div className="bg-cyan-50 rounded-md p-2">
            <p className="text-xs text-cyan-600 mb-1">Venta</p>
            <p className="text-sm font-bold text-cyan-900">
              {formatCurrency(dolarData?.blue?.venta || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Brecha */}
      {dolarData && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 relative">
              <span className="text-xs text-gray-500">Brecha</span>
              <button
                className="relative"
                onMouseEnter={() => setShowTooltip('brecha')}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="w-3 h-3 text-gray-400 hover:text-gray-600" />
              </button>
              {showTooltip === 'brecha' && (
                <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                  <p className="font-semibold mb-1">Brecha Cambiaria</p>
                  <p>Diferencia porcentual entre el dólar oficial y el blue. Indica la distorsión del mercado cambiario.</p>
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-orange-600">
              {((((dolarData.blue.venta - dolarData.oficial.venta) / dolarData.oficial.venta) * 100).toFixed(1))}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DolarWidget
