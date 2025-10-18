import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Target, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  PieChart,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  ShoppingCart,
  CreditCard
} from 'lucide-react'

const ControlBoard = ({ invoices, companyData }) => {
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
    profitMargin: 0,
    monthlyGrowth: 0,
    invoiceCount: 0,
    avgTicket: 0,
    cashFlow: 0,
    categoryDistribution: [],
    monthlyData: [],
    trafficLights: {
      cashFlow: 'green',
      profitMargin: 'yellow',
      expenses: 'green',
      growth: 'green'
    }
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

    // Calcular distribución por categoría
    const categoryMap = {}
    invoices.forEach(inv => {
      const category = inv.category || 'Sin categoría'
      if (!categoryMap[category]) {
        categoryMap[category] = { income: 0, expense: 0, count: 0 }
      }
      categoryMap[category].count++
      if (inv.type === 'income') {
        categoryMap[category].income += parseFloat(inv.amount)
      } else {
        categoryMap[category].expense += parseFloat(inv.amount)
      }
    })

    const categoryDistribution = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      value: data.income + data.expense,
      income: data.income,
      expense: data.expense,
      count: data.count,
      percentage: ((data.income + data.expense) / (totalIncome + totalExpenses)) * 100
    })).sort((a, b) => b.value - a.value)

    // Calcular semáforos
    const trafficLights = {
      cashFlow: cashFlow > totalIncome * 0.2 ? 'green' : cashFlow > 0 ? 'yellow' : 'red',
      profitMargin: profitMargin >= 20 ? 'green' : profitMargin >= 10 ? 'yellow' : 'red',
      expenses: totalExpenses < totalIncome * 0.7 ? 'green' : totalExpenses < totalIncome * 0.85 ? 'yellow' : 'red',
      growth: monthlyGrowth >= 10 ? 'green' : monthlyGrowth >= 5 ? 'yellow' : 'red'
    }

    setMetrics({
      totalIncome,
      totalExpenses,
      profit,
      profitMargin,
      monthlyGrowth,
      invoiceCount: invoices.length,
      avgTicket,
      cashFlow,
      categoryDistribution,
      trafficLights
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

  const TrafficLight = ({ status, label, value }) => {
    const colors = {
      green: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700', dot: 'bg-green-500' },
      yellow: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', dot: 'bg-yellow-500' },
      red: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700', dot: 'bg-red-500' }
    }
    const color = colors[status]

    return (
      <div className={`${color.bg} ${color.border} border-2 rounded-xl p-4 flex items-center space-x-3`}>
        <div className={`w-4 h-4 ${color.dot} rounded-full animate-pulse`}></div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${color.text}`}>{label}</p>
          <p className={`text-xs ${color.text} opacity-75`}>{value}</p>
        </div>
      </div>
    )
  }

  const PieChartSegment = ({ category, percentage, color }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3">
        <div className={`w-4 h-4 ${color} rounded`}></div>
        <span className="text-sm font-medium text-gray-700">{category}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</span>
    </div>
  )

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500'
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tablero de Control</h2>
          <p className="text-gray-600 mt-1">Vista ejecutiva de métricas clave y análisis financiero</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-lg">
          <LayoutDashboard className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">Control Panel</span>
        </div>
      </div>

      {/* Semáforos de Estado */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Indicadores de Salud Financiera
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <TrafficLight 
            status={metrics.trafficLights.cashFlow}
            label="Flujo de Caja"
            value={metrics.cashFlow >= 0 ? 'Positivo' : 'Negativo'}
          />
          <TrafficLight 
            status={metrics.trafficLights.profitMargin}
            label="Margen de Ganancia"
            value={`${metrics.profitMargin.toFixed(1)}%`}
          />
          <TrafficLight 
            status={metrics.trafficLights.expenses}
            label="Control de Gastos"
            value={`${((metrics.totalExpenses / (metrics.totalIncome || 1)) * 100).toFixed(0)}% de ingresos`}
          />
          <TrafficLight 
            status={metrics.trafficLights.growth}
            label="Crecimiento"
            value={`${metrics.monthlyGrowth}% mensual`}
          />
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
      <div className="grid md:grid-cols-4 gap-6">
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
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${metrics.avgTicket.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 mt-2">Por venta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Flujo de Caja</span>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <p className={`text-3xl font-bold ${metrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(metrics.cashFlow).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 mt-2">{metrics.cashFlow >= 0 ? 'Positivo' : 'Negativo'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Categorías Activas</span>
            <PieChart className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.categoryDistribution.length}</p>
          <p className="text-sm text-gray-500 mt-2">Tipos de actividad</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Distribución por Actividad - Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
            Distribución por Actividad
          </h3>
          <div className="space-y-1">
            {metrics.categoryDistribution.slice(0, 8).map((cat, idx) => (
              <PieChartSegment
                key={cat.name}
                category={cat.name}
                percentage={cat.percentage}
                color={colors[idx % colors.length]}
              />
            ))}
          </div>
          {metrics.categoryDistribution.length === 0 && (
            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No hay datos disponibles</p>
              </div>
            </div>
          )}
        </div>

        {/* Análisis de Rentabilidad */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Análisis de Rentabilidad
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Ingresos</span>
                <span className="text-sm font-bold text-green-600">
                  ${metrics.totalIncome.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Gastos</span>
                <span className="text-sm font-bold text-red-600">
                  ${metrics.totalExpenses.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-rose-600 h-3 rounded-full"
                  style={{ width: `${(metrics.totalExpenses / (metrics.totalIncome || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Utilidad</span>
                <span className={`text-sm font-bold ${metrics.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ${Math.abs(metrics.profit).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${metrics.profit >= 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}
                  style={{ width: `${Math.abs((metrics.profit / (metrics.totalIncome || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">ROI Estimado</span>
                <span className="text-2xl font-bold text-purple-600">
                  {metrics.profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle por Categoría */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-indigo-600" />
          Detalle por Categoría
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoría</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ingresos</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gastos</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Neto</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Transacciones</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">% Total</th>
              </tr>
            </thead>
            <tbody>
              {metrics.categoryDistribution.map((cat, idx) => (
                <tr key={cat.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 ${colors[idx % colors.length]} rounded`}></div>
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-green-600 font-medium">
                    ${cat.income.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-red-600 font-medium">
                    ${cat.expense.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </td>
                  <td className={`text-right py-3 px-4 text-sm font-bold ${(cat.income - cat.expense) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    ${Math.abs(cat.income - cat.expense).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-gray-700">
                    {cat.count}
                  </td>
                  <td className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                    {cat.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {metrics.categoryDistribution.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No hay datos de categorías disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
        <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Alertas y Recomendaciones
        </h4>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li className="flex items-start">
            <span className="mr-2">
              {metrics.profitMargin >= 20 ? '✅' : metrics.profitMargin >= 10 ? '⚠️' : '🔴'}
            </span>
            <span>
              <strong>Margen de ganancia:</strong> {metrics.profitMargin.toFixed(1)}% - 
              {metrics.profitMargin >= 20 ? ' Excelente, por encima del objetivo' : 
               metrics.profitMargin >= 10 ? ' Aceptable, considerar optimización de costos' : 
               ' Crítico, revisar estructura de costos urgentemente'}
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">
              {metrics.cashFlow > metrics.totalIncome * 0.2 ? '✅' : metrics.cashFlow > 0 ? '⚠️' : '🔴'}
            </span>
            <span>
              <strong>Flujo de caja:</strong> {metrics.cashFlow >= 0 ? 'Positivo' : 'Negativo'} - 
              {metrics.cashFlow > metrics.totalIncome * 0.2 ? ' Muy saludable' : 
               metrics.cashFlow > 0 ? ' Positivo pero ajustado, monitorear de cerca' : 
               ' Negativo, revisar gastos y proyecciones'}
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">
              {metrics.totalExpenses < metrics.totalIncome * 0.7 ? '✅' : metrics.totalExpenses < metrics.totalIncome * 0.85 ? '⚠️' : '🔴'}
            </span>
            <span>
              <strong>Control de gastos:</strong> {((metrics.totalExpenses / (metrics.totalIncome || 1)) * 100).toFixed(0)}% de ingresos - 
              {metrics.totalExpenses < metrics.totalIncome * 0.7 ? ' Excelente control de costos' : 
               metrics.totalExpenses < metrics.totalIncome * 0.85 ? ' Gastos elevados, buscar optimizaciones' : 
               ' Gastos críticos, requiere acción inmediata'}
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">
              {metrics.invoiceCount >= 10 ? '✅' : '💡'}
            </span>
            <span>
              <strong>Facturas procesadas:</strong> {metrics.invoiceCount} documentos - 
              {metrics.invoiceCount >= 10 ? ' Buen volumen de datos para análisis' : 
               ' Cargar más datos para obtener análisis más precisos'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ControlBoard
