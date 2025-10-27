import React, { useState, useMemo } from 'react'
import { TrendingUp, Brain, AlertCircle, Target, DollarSign, Calendar } from 'lucide-react'

const AIProjections = ({ invoices }) => {
  const [projectionPeriod, setProjectionPeriod] = useState(6) // meses

  // Contexto económico Argentina 2024-2025 (datos reales)
  const economicContext = {
    inflacionAnual2024: 140, // %
    inflacionProyectada2025: 22, // %
    inflacionMensual: 1.67, // % mensual (22% anual / 12)
    tasaInteresPymes: 85, // % anual promedio
    devaluacionEsperada: 15, // % anual
    crecimientoEconomico: 5.5, // % PIB proyectado
    ajustePreciosPromedio: 2.0, // % mensual típico en empresas
    ajusteCostosPromedio: 1.8 // % mensual típico en costos
  }

  const analysis = useMemo(() => {
    if (!invoices || invoices.length === 0) return null

    const income = invoices.filter(inv => inv.type === 'income')
    const expenses = invoices.filter(inv => inv.type === 'expense')

    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const netProfit = totalIncome - totalExpenses

    // Calcular tendencia mensual
    const monthlyData = {}
    invoices.forEach(inv => {
      const date = new Date(inv.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expense: 0 }
      }
      if (inv.type === 'income') {
        monthlyData[key].income += parseFloat(inv.amount || 0)
      } else {
        monthlyData[key].expense += parseFloat(inv.amount || 0)
      }
    })

    const months = Object.keys(monthlyData).sort()
    const avgMonthlyIncome = months.length > 0 
      ? Object.values(monthlyData).reduce((sum, m) => sum + m.income, 0) / months.length 
      : 0
    const avgMonthlyExpense = months.length > 0
      ? Object.values(monthlyData).reduce((sum, m) => sum + m.expense, 0) / months.length
      : 0

    // Calcular tasa de crecimiento histórica
    let growthRate = 0
    if (months.length >= 2) {
      const recent = monthlyData[months[months.length - 1]]
      const previous = monthlyData[months[months.length - 2]]
      const recentProfit = recent.income - recent.expense
      const previousProfit = previous.income - previous.expense
      if (previousProfit !== 0) {
        growthRate = ((recentProfit - previousProfit) / Math.abs(previousProfit)) * 100
      }
    }

    // Proyecciones inteligentes con inflación aplicada correctamente
    const projections = []
    
    // Calcular margen actual para mantenerlo en proyecciones
    const currentMargin = avgMonthlyIncome > 0 ? ((avgMonthlyIncome - avgMonthlyExpense) / avgMonthlyIncome) : 0
    
    for (let i = 1; i <= projectionPeriod; i++) {
      // INGRESOS: Ajuste por inflación + ajuste de precios empresarial
      // Las empresas ajustan precios mensualmente para mantener márgenes
      const ajusteIngresosAcumulado = Math.pow(1 + economicContext.ajustePreciosPromedio / 100, i)
      const crecimientoReal = Math.pow(1 + (growthRate / 100) / 12, i) // Crecimiento real del negocio
      const projectedIncome = avgMonthlyIncome * ajusteIngresosAcumulado * crecimientoReal
      
      // GASTOS: Ajuste por inflación de costos
      // Los costos también suben con inflación (proveedores, salarios, servicios)
      const ajusteCostosAcumulado = Math.pow(1 + economicContext.ajusteCostosPromedio / 100, i)
      const eficienciaOperativa = Math.pow(0.995, i) // 0.5% mejora mensual en eficiencia
      const projectedExpense = avgMonthlyExpense * ajusteCostosAcumulado * eficienciaOperativa
      
      // UTILIDAD REAL: Diferencia entre ingresos y gastos ajustados
      const projectedProfit = projectedIncome - projectedExpense
      const projectedMargin = projectedIncome > 0 ? (projectedProfit / projectedIncome) * 100 : 0
      
      // Poder adquisitivo real (ajustado por inflación general)
      const inflacionAcumulada = Math.pow(1 + economicContext.inflacionMensual / 100, i)
      const profitRealValue = projectedProfit / inflacionAcumulada // Valor real del dinero

      projections.push({
        month: i,
        income: projectedIncome,
        expense: projectedExpense,
        profit: projectedProfit,
        profitRealValue: profitRealValue,
        margin: projectedMargin,
        inflationAdjusted: inflacionAcumulada,
        priceAdjustment: ajusteIngresosAcumulado,
        costAdjustment: ajusteCostosAcumulado
      })
    }

    // Recomendaciones basadas en contexto argentino
    const recommendations = []

    // Análisis de liquidez
    const liquidityRatio = totalIncome > 0 ? totalExpenses / totalIncome : 0
    if (liquidityRatio > 0.85) {
      recommendations.push({
        type: 'warning',
        category: 'Liquidez',
        message: 'Ratio de gastos alto. En contexto inflacionario argentino, priorizar reducción de costos fijos.',
        action: 'Renegociar contratos con cláusulas de ajuste por inflación.'
      })
    }

    // Análisis de crecimiento real
    const lastProjection = projections[projections.length - 1]
    const profitGrowth = lastProjection ? ((lastProjection.profit - (avgMonthlyIncome - avgMonthlyExpense)) / Math.abs(avgMonthlyIncome - avgMonthlyExpense)) * 100 : 0
    
    if (profitGrowth < 0) {
      recommendations.push({
        type: 'danger',
        category: 'Rentabilidad',
        message: 'Proyección muestra caída en utilidad. Costos crecen más rápido que ingresos.',
        action: 'Urgente: Aumentar precios al menos ' + economicContext.ajusteCostosPromedio + '% mensual para mantener márgenes.'
      })
    } else if (profitGrowth < economicContext.inflacionMensual) {
      recommendations.push({
        type: 'warning',
        category: 'Inflación',
        message: 'Utilidad crece pero por debajo de inflación. Pérdida de poder adquisitivo.',
        action: 'Ajustar precios ' + (economicContext.inflacionMensual + 0.5).toFixed(1) + '% mensual para superar inflación.'
      })
    }

    // Análisis de margen proyectado
    const avgProjectedMargin = projections.reduce((sum, p) => sum + p.margin, 0) / projections.length
    const currentMarginCalc = avgMonthlyIncome > 0 ? ((avgMonthlyIncome - avgMonthlyExpense) / avgMonthlyIncome) * 100 : 0
    
    if (avgProjectedMargin > currentMarginCalc) {
      recommendations.push({
        type: 'success',
        category: 'Rentabilidad',
        message: 'Margen proyectado mejora de ' + currentMarginCalc.toFixed(1) + '% a ' + avgProjectedMargin.toFixed(1) + '%. Estrategia de precios efectiva.',
        action: 'Mantener ajustes de precios mensuales. Considerar inversión en expansión.'
      })
    } else if (avgProjectedMargin < currentMarginCalc * 0.9) {
      recommendations.push({
        type: 'warning',
        category: 'Márgenes',
        message: 'Margen proyectado cae de ' + currentMarginCalc.toFixed(1) + '% a ' + avgProjectedMargin.toFixed(1) + '%. Costos crecen más rápido.',
        action: 'Revisar estructura de costos. Negociar con proveedores. Aumentar precios.'
      })
    }
    
    // Oportunidad de inversión
    if (netProfit > avgMonthlyExpense * 2 && avgProjectedMargin > 15) {
      recommendations.push({
        type: 'success',
        category: 'Inversión',
        message: 'Capacidad de inversión detectada con márgenes saludables.',
        action: 'Evaluar líneas de crédito PyME (tasa ~85% anual). ROI debe superar 100% anual.'
      })
    }

    // Estrategia de precios
    recommendations.push({
      type: 'info',
      category: 'Estrategia de Precios',
      message: 'En contexto inflacionario, ajustar precios ' + economicContext.ajustePreciosPromedio + '% mensual es clave.',
      action: 'Implementar cláusula de ajuste automático en contratos. Revisar precios cada 30 días.'
    })
    
    // Riesgo cambiario
    if (economicContext.devaluacionEsperada > 10) {
      recommendations.push({
        type: 'info',
        category: 'Riesgo Cambiario',
        message: `Devaluación esperada: ${economicContext.devaluacionEsperada}% anual.`,
        action: 'Considerar cobertura cambiaria. Dolarizar excedentes de caja.'
      })
    }

    return {
      current: {
        totalIncome,
        totalExpenses,
        netProfit,
        avgMonthlyIncome,
        avgMonthlyExpense,
        growthRate
      },
      projections,
      recommendations,
      economicContext
    }
  }, [invoices, projectionPeriod])

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin Datos para Proyectar</h3>
          <p className="text-gray-600">Cargue facturas para generar proyecciones con IA</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Proyecciones</span> con IA
          </h1>
          <p className="text-sm text-gray-600">Análisis predictivo ajustado al contexto económico argentino</p>
        </div>
        <select
          value={projectionPeriod}
          onChange={(e) => setProjectionPeriod(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 transition-colors"
        >
          <option value={3}>3 meses</option>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
        </select>
      </div>

      {/* Contexto Económico */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          <span className="text-cyan-600">Contexto Económico</span> <span className="text-gray-900">Argentina 2024-2025</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Inflación Proyectada 2025</p>
            <p className="text-2xl font-bold text-gray-900">{analysis.economicContext.inflacionProyectada2025}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Tasa Interés PyMEs</p>
            <p className="text-2xl font-bold text-gray-900">{analysis.economicContext.tasaInteresPymes}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Crecimiento Económico</p>
            <p className="text-2xl font-bold text-gray-900">+{analysis.economicContext.crecimientoEconomico}%</p>
          </div>
        </div>
      </div>

      {/* Situación Actual */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          <span className="text-cyan-600">Situación</span> <span className="text-gray-900">Actual</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Promedio Mensual Ingresos</p>
            <p className="text-2xl font-bold text-gray-900">
              ${analysis.current.avgMonthlyIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Promedio Mensual Gastos</p>
            <p className="text-2xl font-bold text-gray-900">
              ${analysis.current.avgMonthlyExpense.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tasa de Crecimiento</p>
            <p className={`text-2xl font-bold ${analysis.current.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analysis.current.growthRate >= 0 ? '+' : ''}{analysis.current.growthRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Proyecciones */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          <span className="text-cyan-600">Proyección a {projectionPeriod} Meses</span> <span className="text-gray-900">(Ajustada por Inflación)</span>
        </h3>
        <div className="space-y-3">
          {analysis.projections.map((proj, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Mes {proj.month}</p>
                  <p className="text-xs text-gray-600">Ajuste inflación: {((proj.inflationAdjusted - 1) * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  proj.profit >= (analysis.current.avgMonthlyIncome - analysis.current.avgMonthlyExpense) 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  ${proj.profit.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="text-gray-600">Margen: {proj.margin.toFixed(1)}%</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500" title="Valor real ajustado por inflación">
                    Real: ${proj.profitRealValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones IA */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          Recomendaciones Estratégicas con IA
        </h3>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-xl border-2 ${
                rec.type === 'danger' ? 'bg-red-50 border-red-200' :
                rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                rec.type === 'success' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {rec.type === 'danger' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                {rec.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                {rec.type === 'success' && <Target className="w-5 h-5 text-green-600 mt-0.5" />}
                {rec.type === 'info' && <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{rec.category}</p>
                  <p className="text-sm font-semibold text-gray-900 mb-2">{rec.message}</p>
                  <p className="text-sm text-gray-700 bg-white/50 p-2 rounded">
                    <strong>Acción:</strong> {rec.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Resumen Ejecutivo - Próximos {projectionPeriod} Meses</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-300 mb-1">Utilidad Proyectada Total</p>
            <p className="text-3xl font-bold">
              ${analysis.projections.reduce((sum, p) => sum + p.profit, 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300 mb-1">Margen Promedio Proyectado</p>
            <p className="text-3xl font-bold">
              {(analysis.projections.reduce((sum, p) => sum + p.margin, 0) / analysis.projections.length).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIProjections
