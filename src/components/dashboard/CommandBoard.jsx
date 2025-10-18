import React, { useState, useEffect } from 'react'
import { LayoutDashboard, TrendingUp, TrendingDown, DollarSign, Calendar, Target, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const CommandBoard = ({ invoices, companyData }) => {
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
    profitMargin: 0,
    monthlyGrowth: 0,
    invoiceCount: 0,
    avgTicket: 0,
    cashFlow: 0
  })

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      calculateMetrics()
    }
  }, [invoices])

  const calculateMetrics = () => {
    const income = invoices.filter(inv => inv.type === 'income')
    const expenses = invoices.filter(inv => inv.type === 'expense')

    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const profit = totalIncome - totalExpenses
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0
    const avgTicket = income.length > 0 ? totalIncome / income.length : 0
    const cashFlow = profit

    // Simular crecimiento mensual
    const monthlyGrowth = 12.5

    setMetrics({
      totalIncome,
      totalExpenses,
      profit,
      profitMargin,
      monthlyGrowth,
      invoiceCount: invoices.length,
      avgTicket,
      cashFlow
    })
  }

  const MetricCard = ({ title, value, icon: Icon, color, trend, trendValue, prefix = '$' }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
        </p>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="font-semibold">{trendValue}%</span>
            <span className="text-gray-500">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tablero de Comando</h2>
          <p className="text-gray-600 mt-1">Vista ejecutiva de métricas clave</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-lg">
          <LayoutDashboard className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">Dashboard</span>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos Totales"
          value={metrics.totalIncome}
          icon={TrendingUp}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          trend="up"
          trendValue={metrics.monthlyGrowth}
        />
        <MetricCard
          title="Gastos Totales"
          value={metrics.totalExpenses}
          icon={TrendingDown}
          color="bg-gradient-to-br from-red-500 to-rose-600"
          trend="down"
          trendValue={5.2}
        />
        <MetricCard
          title="Utilidad Neta"
          value={metrics.profit}
          icon={DollarSign}
          color={metrics.profit >= 0 ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-orange-500 to-red-600"}
          trend={metrics.profit >= 0 ? "up" : "down"}
          trendValue={Math.abs(metrics.profitMargin).toFixed(1)}
        />
        <MetricCard
          title="Margen de Ganancia"
          value={metrics.profitMargin}
          icon={Target}
          color="bg-gradient-to-br from-purple-500 to-pink-600"
          prefix=""
          trend={metrics.profitMargin >= 0 ? "up" : "down"}
          trendValue={metrics.profitMargin.toFixed(1)}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Facturas Procesadas</span>
            <Calendar className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.invoiceCount}</p>
          <p className="text-sm text-gray-500 mt-2">Total de documentos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Ticket Promedio</span>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${metrics.avgTicket.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 mt-2">Por venta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Flujo de Caja</span>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className={`text-3xl font-bold ${metrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(metrics.cashFlow).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 mt-2">{metrics.cashFlow >= 0 ? 'Positivo' : 'Negativo'}</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Evolución Mensual</h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <div className="text-center">
              <LayoutDashboard className="w-16 h-16 text-blue-400 mx-auto mb-3" />
              <p className="text-gray-600">Gráfico de evolución</p>
              <p className="text-sm text-gray-500">Integración con Power BI disponible</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Categoría</h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <div className="text-center">
              <Target className="w-16 h-16 text-purple-400 mx-auto mb-3" />
              <p className="text-gray-600">Gráfico de distribución</p>
              <p className="text-sm text-gray-500">Integración con Power BI disponible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Alertas y Recomendaciones
        </h4>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• Margen de ganancia: {metrics.profitMargin.toFixed(1)}% - {metrics.profitMargin >= 20 ? '✅ Saludable' : '⚠️ Por debajo del objetivo (20%)'}</li>
          <li>• Flujo de caja: {metrics.cashFlow >= 0 ? '✅ Positivo' : '⚠️ Negativo - Revisar gastos'}</li>
          <li>• Facturas procesadas: {metrics.invoiceCount} - {metrics.invoiceCount >= 10 ? '✅ Buen volumen' : '💡 Cargar más datos para mejor análisis'}</li>
        </ul>
      </div>
    </div>
  )
}

export default CommandBoard
