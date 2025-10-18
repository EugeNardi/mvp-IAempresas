import React, { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  DollarSign, Calendar, Target, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const ExecutiveDashboard = ({ invoices, companyData }) => {
  const [period, setPeriod] = useState('month') // month, quarter, year
  const [comparison, setComparison] = useState('previous') // previous, yoy

  // Cálculos memoizados para optimizar rendimiento con grandes volúmenes de datos
  const analytics = useMemo(() => {
    if (!invoices || invoices.length === 0) return null

    // Separar ingresos y gastos
    const income = invoices.filter(inv => inv.type === 'income')
    const expenses = invoices.filter(inv => inv.type === 'expense')

    // Totales
    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const netProfit = totalIncome - totalExpenses

    // KPIs Financieros Profesionales
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
    const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0
    const avgTransactionValue = income.length > 0 ? totalIncome / income.length : 0
    const transactionCount = invoices.length

    // Análisis por período
    const groupByPeriod = (data) => {
      const grouped = {}
      data.forEach(inv => {
        const date = new Date(inv.date)
        let key
        
        if (period === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else if (period === 'quarter') {
          const quarter = Math.floor(date.getMonth() / 3) + 1
          key = `${date.getFullYear()}-Q${quarter}`
        } else {
          key = `${date.getFullYear()}`
        }

        if (!grouped[key]) {
          grouped[key] = { income: 0, expense: 0, count: 0 }
        }
        
        grouped[key].count++
        if (inv.type === 'income') {
          grouped[key].income += parseFloat(inv.amount || 0)
        } else {
          grouped[key].expense += parseFloat(inv.amount || 0)
        }
      })
      return grouped
    }

    const periodData = groupByPeriod(invoices)
    const periods = Object.keys(periodData).sort()
    
    // Cálculo de tendencias
    let growthRate = 0
    if (periods.length >= 2) {
      const current = periodData[periods[periods.length - 1]]
      const previous = periodData[periods[periods.length - 2]]
      const currentProfit = current.income - current.expense
      const previousProfit = previous.income - previous.expense
      
      if (previousProfit !== 0) {
        growthRate = ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100
      }
    }

    // Análisis por categoría
    const categoryAnalysis = {}
    invoices.forEach(inv => {
      const cat = inv.category || 'Sin categoría'
      if (!categoryAnalysis[cat]) {
        categoryAnalysis[cat] = { 
          income: 0, 
          expense: 0, 
          count: 0,
          avgValue: 0,
          margin: 0
        }
      }
      
      categoryAnalysis[cat].count++
      if (inv.type === 'income') {
        categoryAnalysis[cat].income += parseFloat(inv.amount || 0)
      } else {
        categoryAnalysis[cat].expense += parseFloat(inv.amount || 0)
      }
    })

    // Calcular métricas por categoría
    Object.keys(categoryAnalysis).forEach(cat => {
      const data = categoryAnalysis[cat]
      data.avgValue = data.count > 0 ? (data.income + data.expense) / data.count : 0
      data.margin = data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0
      data.total = data.income + data.expense
    })

    const topCategories = Object.entries(categoryAnalysis)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Indicadores de salud financiera
    const healthIndicators = {
      liquidity: profitMargin >= 15 ? 'excellent' : profitMargin >= 10 ? 'good' : profitMargin >= 5 ? 'fair' : 'poor',
      efficiency: expenseRatio <= 70 ? 'excellent' : expenseRatio <= 80 ? 'good' : expenseRatio <= 90 ? 'fair' : 'poor',
      growth: growthRate >= 15 ? 'excellent' : growthRate >= 10 ? 'good' : growthRate >= 5 ? 'fair' : 'poor',
      profitability: roi >= 30 ? 'excellent' : roi >= 20 ? 'good' : roi >= 10 ? 'fair' : 'poor'
    }

    // Alertas y recomendaciones
    const alerts = []
    if (profitMargin < 10) {
      alerts.push({ 
        type: 'warning', 
        message: 'Margen de ganancia bajo. Revisar estructura de costos.',
        priority: 'high'
      })
    }
    if (expenseRatio > 85) {
      alerts.push({ 
        type: 'danger', 
        message: 'Ratio de gastos elevado. Optimizar gastos operativos.',
        priority: 'critical'
      })
    }
    if (growthRate < 0) {
      alerts.push({ 
        type: 'danger', 
        message: 'Tendencia negativa detectada. Revisar estrategia comercial.',
        priority: 'critical'
      })
    }

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      expenseRatio,
      roi,
      avgTransactionValue,
      transactionCount,
      growthRate,
      periodData,
      topCategories,
      healthIndicators,
      alerts
    }
  }, [invoices, period])

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin Datos Disponibles</h3>
          <p className="text-gray-600">Cargue facturas para visualizar el análisis ejecutivo</p>
        </div>
      </div>
    )
  }

  const getHealthColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'fair': return 'text-yellow-600 bg-yellow-50'
      case 'poor': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getHealthLabel = (status) => {
    switch (status) {
      case 'excellent': return 'Excelente'
      case 'good': return 'Bueno'
      case 'fair': return 'Aceptable'
      case 'poor': return 'Crítico'
      default: return 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Ejecutivo</h1>
          <p className="text-sm text-gray-600 mt-1">Análisis financiero en tiempo real</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="month">Mensual</option>
            <option value="quarter">Trimestral</option>
            <option value="year">Anual</option>
          </select>
        </div>
      </div>

      {/* Alertas Críticas */}
      {analytics.alerts.length > 0 && (
        <div className="space-y-2">
          {analytics.alerts.map((alert, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-lg border ${
                alert.priority === 'critical' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  alert.priority === 'critical' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <div>
                  <p className={`text-sm font-semibold ${
                    alert.priority === 'critical' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs Principales */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingresos Totales</p>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            ${analytics.totalIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </p>
          <div className="flex items-center text-sm">
            {analytics.growthRate >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={analytics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(analytics.growthRate).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gastos Totales</p>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            ${analytics.totalExpenses.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-gray-600">
            {analytics.expenseRatio.toFixed(1)}% de ingresos
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilidad Neta</p>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <p className={`text-3xl font-bold mb-1 ${analytics.netProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            ${Math.abs(analytics.netProfit).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-gray-600">
            Margen: {analytics.profitMargin.toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ROI</p>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.roi.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            Retorno sobre inversión
          </p>
        </div>
      </div>

      {/* Indicadores de Salud */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Salud Financiera</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getHealthColor(analytics.healthIndicators.liquidity)} mb-2`}>
              <CheckCircle className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Liquidez</p>
            <p className="text-xs text-gray-600">{getHealthLabel(analytics.healthIndicators.liquidity)}</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getHealthColor(analytics.healthIndicators.efficiency)} mb-2`}>
              <Activity className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Eficiencia</p>
            <p className="text-xs text-gray-600">{getHealthLabel(analytics.healthIndicators.efficiency)}</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getHealthColor(analytics.healthIndicators.growth)} mb-2`}>
              <TrendingUp className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Crecimiento</p>
            <p className="text-xs text-gray-600">{getHealthLabel(analytics.healthIndicators.growth)}</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getHealthColor(analytics.healthIndicators.profitability)} mb-2`}>
              <Target className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Rentabilidad</p>
            <p className="text-xs text-gray-600">{getHealthLabel(analytics.healthIndicators.profitability)}</p>
          </div>
        </div>
      </div>

      {/* Top Categorías */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Categoría</h3>
        <div className="space-y-3">
          {analytics.topCategories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-sm font-bold text-gray-900">
                    ${cat.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="text-gray-600">
                    Ingresos: <span className="font-semibold">${cat.income.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                  </span>
                  <span className="text-gray-600">
                    Gastos: <span className="font-semibold">${cat.expense.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                  </span>
                  <span className="text-gray-600">
                    Margen: <span className={`font-semibold ${cat.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {cat.margin.toFixed(1)}%
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas Operativas */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Operativas</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Total Transacciones</span>
              <span className="text-lg font-bold text-gray-900">{analytics.transactionCount}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Valor Promedio</span>
              <span className="text-lg font-bold text-gray-900">
                ${analytics.avgTransactionValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Ratio de Gastos</span>
              <span className="text-lg font-bold text-gray-900">{analytics.expenseRatio.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de Crecimiento</span>
              <span className={`text-lg font-bold ${analytics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones Estratégicas</h3>
          <div className="space-y-3">
            {analytics.profitMargin >= 15 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-sm text-green-900">Margen saludable. Considerar reinversión para crecimiento.</p>
              </div>
            )}
            {analytics.expenseRatio > 80 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-900">Optimizar estructura de costos para mejorar rentabilidad.</p>
              </div>
            )}
            {analytics.growthRate >= 10 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-900">Tendencia positiva. Mantener estrategia actual.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExecutiveDashboard
