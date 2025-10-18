import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, 
  Target, DollarSign, PieChart, BarChart3, Activity, Lightbulb,
  ArrowUpRight, ArrowDownRight, Shield, Briefcase, LineChart,
  Calendar, Users, ShoppingCart, CreditCard, Percent, Award,
  Brain, Sparkles, ChevronRight, Info
} from 'lucide-react'

const FinancialIntelligence = ({ invoices, companyData }) => {
  const [kpis, setKpis] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateKPIs()
    generateRecommendations()
  }, [invoices])

  const calculateKPIs = () => {
    if (!invoices || invoices.length === 0) {
      setLoading(false)
      return
    }

    const income = invoices.filter(inv => inv.type === 'income')
    const expenses = invoices.filter(inv => inv.type === 'expense')

    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const netProfit = totalIncome - totalExpenses

    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
    const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0
    const burnRate = expenses.length > 0 ? totalExpenses / expenses.length : 0
    const runway = burnRate > 0 ? netProfit / burnRate : 0

    const currentRatio = totalExpenses > 0 ? totalIncome / totalExpenses : 0
    const quickRatio = currentRatio * 0.8

    const operatingEfficiency = totalIncome > 0 ? (1 - (totalExpenses / totalIncome)) * 100 : 0
    const revenuePerTransaction = income.length > 0 ? totalIncome / income.length : 0
    const costPerTransaction = expenses.length > 0 ? totalExpenses / expenses.length : 0

    const now = new Date()
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3))
    
    const recentIncome = income.filter(inv => new Date(inv.date) >= threeMonthsAgo)
    const oldIncome = income.filter(inv => new Date(inv.date) < threeMonthsAgo)
    
    const recentTotal = recentIncome.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const oldTotal = oldIncome.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    
    const growthRate = oldTotal > 0 ? ((recentTotal - oldTotal) / oldTotal) * 100 : 0

    const categoryAnalysis = {}
    invoices.forEach(inv => {
      const cat = inv.category || 'Sin categoría'
      if (!categoryAnalysis[cat]) {
        categoryAnalysis[cat] = { income: 0, expenses: 0, count: 0 }
      }
      categoryAnalysis[cat].count++
      if (inv.type === 'income') {
        categoryAnalysis[cat].income += parseFloat(inv.amount || 0)
      } else {
        categoryAnalysis[cat].expenses += parseFloat(inv.amount || 0)
      }
    })

    const topCategories = Object.entries(categoryAnalysis)
      .map(([cat, data]) => ({
        category: cat,
        total: data.income + data.expenses,
        profit: data.income - data.expenses,
        ...data
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    const concentrationRisk = topCategories.length > 0 
      ? (topCategories[0].total / (totalIncome + totalExpenses)) * 100 
      : 0

    const amounts = invoices.map(inv => parseFloat(inv.amount || 0))
    const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
    const stdDev = Math.sqrt(variance)
    const volatilityScore = mean > 0 ? (stdDev / mean) * 100 : 0

    let healthScore = 0
    if (profitMargin > 20) healthScore += 30
    else if (profitMargin > 10) healthScore += 20
    else if (profitMargin > 0) healthScore += 10

    if (currentRatio > 2) healthScore += 25
    else if (currentRatio > 1.5) healthScore += 20
    else if (currentRatio > 1) healthScore += 15
    else if (currentRatio > 0.5) healthScore += 10

    if (growthRate > 20) healthScore += 25
    else if (growthRate > 10) healthScore += 20
    else if (growthRate > 5) healthScore += 15
    else if (growthRate > 0) healthScore += 10

    if (concentrationRisk < 30) healthScore += 10
    else if (concentrationRisk < 50) healthScore += 7
    else if (concentrationRisk < 70) healthScore += 4

    if (volatilityScore < 20) healthScore += 10
    else if (volatilityScore < 40) healthScore += 7
    else if (volatilityScore < 60) healthScore += 4

    setKpis({
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      roi,
      operatingEfficiency,
      currentRatio,
      quickRatio,
      burnRate,
      runway,
      revenuePerTransaction,
      costPerTransaction,
      transactionCount: invoices.length,
      growthRate,
      recentTotal,
      oldTotal,
      topCategories,
      concentrationRisk,
      volatilityScore,
      healthScore: Math.min(healthScore, 100)
    })

    setLoading(false)
  }

  const generateRecommendations = () => {
    if (!invoices || invoices.length === 0) return

    const recs = []
    const income = invoices.filter(inv => inv.type === 'income')
    const expenses = invoices.filter(inv => inv.type === 'expense')
    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    if (profitMargin < 10) {
      recs.push({
        type: 'critical',
        icon: AlertTriangle,
        title: 'Margen de Ganancia Bajo',
        description: `Tu margen de ganancia es del ${profitMargin.toFixed(1)}%, por debajo del 10% recomendado.`,
        actions: [
          'Revisar estructura de costos y eliminar gastos innecesarios',
          'Aumentar precios de productos/servicios de alto valor',
          'Negociar mejores términos con proveedores',
          'Implementar estrategias de upselling y cross-selling'
        ],
        impact: 'high',
        priority: 1
      })
    } else if (profitMargin > 30) {
      recs.push({
        type: 'success',
        icon: Award,
        title: 'Excelente Margen de Ganancia',
        description: `Tu margen de ${profitMargin.toFixed(1)}% es excepcional. Considera reinvertir.`,
        actions: [
          'Reinvertir en marketing para acelerar crecimiento',
          'Expandir líneas de productos rentables',
          'Crear reservas de emergencia (6 meses de gastos)',
          'Invertir en automatización y tecnología'
        ],
        impact: 'high',
        priority: 2
      })
    }

    const categoryCount = new Set(invoices.map(inv => inv.category)).size
    if (categoryCount < 3) {
      recs.push({
        type: 'warning',
        icon: PieChart,
        title: 'Falta de Diversificación',
        description: 'Tus ingresos están concentrados en pocas categorías, aumentando el riesgo.',
        actions: [
          'Explorar nuevos segmentos de mercado',
          'Desarrollar productos/servicios complementarios',
          'Crear alianzas estratégicas con otras empresas',
          'Implementar estrategia de diversificación gradual'
        ],
        impact: 'medium',
        priority: 3
      })
    }

    const avgIncome = income.length > 0 ? totalIncome / income.length : 0
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0
    
    if (avgExpense > avgIncome * 0.8) {
      recs.push({
        type: 'warning',
        icon: Activity,
        title: 'Gestión de Flujo de Caja',
        description: 'Tus gastos promedio son altos en relación a tus ingresos.',
        actions: [
          'Implementar presupuesto mensual estricto',
          'Negociar plazos de pago más largos con proveedores',
          'Acelerar cobros con descuentos por pronto pago',
          'Crear proyecciones de flujo de caja a 90 días'
        ],
        impact: 'high',
        priority: 2
      })
    }

    recs.push({
      type: 'info',
      icon: Brain,
      title: 'Inteligencia de Mercado',
      description: 'Mantente actualizado con las tendencias de tu industria.',
      actions: [
        'Realizar análisis competitivo trimestral',
        'Monitorear indicadores económicos clave',
        'Participar en eventos y networking de la industria',
        'Implementar sistema de feedback de clientes'
      ],
      impact: 'low',
      priority: 6
    })

    setRecommendations(recs.sort((a, b) => a.priority - b.priority))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analizando datos financieros...</p>
        </div>
      </div>
    )
  }

  if (!kpis) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay datos suficientes</h3>
          <p className="text-gray-600">Carga facturas para ver el análisis de inteligencia financiera</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Métricas Financieras</h1>
        <p className="text-base text-gray-500 mt-2">Análisis inteligente de tu situación financiera</p>
      </div>

      {/* Score */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-10 mb-8 shadow-xl hover:shadow-2xl transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Score de Salud Financiera</p>
            <p className="text-6xl font-bold text-gray-900 tracking-tight">{kpis.healthScore}</p>
            <p className="text-base text-gray-500 mt-3">de 100 puntos</p>
          </div>
          <div className="w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle cx="64" cy="64" r="58" stroke="#f3f4f6" strokeWidth="6" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="url(#gradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(kpis.healthScore / 100) * 364.42} 364.42`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#111827', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#4b5563', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-7 hover:shadow-xl transition-all group">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Margen</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight group-hover:scale-105 transition-transform">{kpis.profitMargin.toFixed(1)}%</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-7 hover:shadow-xl transition-all group">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">ROI</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight group-hover:scale-105 transition-transform">{kpis.roi.toFixed(1)}%</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-7 hover:shadow-xl transition-all group">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Liquidez</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight group-hover:scale-105 transition-transform">{kpis.currentRatio.toFixed(2)}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-7 hover:shadow-xl transition-all group">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Crecimiento</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight group-hover:scale-105 transition-transform">{kpis.growthRate > 0 ? '+' : ''}{kpis.growthRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Métricas Detalladas */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Eficiencia Operativa</p>
          <p className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">{kpis.operatingEfficiency.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Ingreso promedio: <span className="font-semibold text-gray-700">${kpis.revenuePerTransaction.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Proyección de Runway</p>
          <p className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">{kpis.runway > 0 ? `${kpis.runway.toFixed(1)} meses` : 'N/A'}</p>
          <p className="text-sm text-gray-500">Burn rate: <span className="font-semibold text-gray-700">${kpis.burnRate.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></p>
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Principales Categorías</p>
        <div className="space-y-4">
          {kpis.topCategories.slice(0, 3).map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 px-3 rounded-xl transition-all">
              <span className="text-base font-semibold text-gray-900">{cat.category}</span>
              <span className="text-base font-bold text-gray-700">${cat.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FinancialIntelligence
