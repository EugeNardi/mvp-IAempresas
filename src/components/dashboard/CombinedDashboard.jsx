import React, { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, 
  Download, RefreshCw, ArrowUpRight, ArrowDownRight, Target, Activity, FileText
} from 'lucide-react'
import FinancialTooltip from './FinancialTooltip'
import DolarCard from './DolarCard'

const CombinedDashboard = ({ invoices, companyData }) => {
  const [viewMode, setViewMode] = useState('executive') // executive, analytics, reports
  const [period, setPeriod] = useState('month')
  const [autoCharts, setAutoCharts] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [exportFormat, setExportFormat] = useState('json')
  const [selectedReport, setSelectedReport] = useState('balance')

  // Generar análisis automáticamente
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      generateAnalytics()
    }
  }, [invoices])

  const generateAnalytics = async () => {
    setGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const income = invoices.filter(inv => inv.type === 'income')
    const expenses = invoices.filter(inv => inv.type === 'expense')
    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)

    // Agrupar por categoría
    const categoryData = {}
    invoices.forEach(inv => {
      if (!categoryData[inv.category]) {
        categoryData[inv.category] = { income: 0, expense: 0 }
      }
      if (inv.type === 'income') {
        categoryData[inv.category].income += parseFloat(inv.amount)
      } else {
        categoryData[inv.category].expense += parseFloat(inv.amount)
      }
    })

    // Agrupar por mes
    const monthlyData = {}
    invoices.forEach(inv => {
      const month = new Date(inv.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'short' })
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 }
      }
      if (inv.type === 'income') {
        monthlyData[month].income += parseFloat(inv.amount)
      } else {
        monthlyData[month].expense += parseFloat(inv.amount)
      }
    })

    setAutoCharts({
      summary: {
        totalIncome,
        totalExpenses,
        profit: totalIncome - totalExpenses,
        profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0,
        avgIncome: income.length > 0 ? totalIncome / income.length : 0,
        avgExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
        incomeCount: income.length,
        expenseCount: expenses.length
      },
      byCategory: categoryData,
      byMonth: monthlyData,
      topCategories: Object.entries(categoryData)
        .map(([cat, data]) => ({ category: cat, total: data.income + data.expense }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
    })

    setGenerating(false)
  }

  const exportData = () => {
    let data, filename, type

    if (exportFormat === 'json') {
      data = JSON.stringify({ company: companyData, invoices }, null, 2)
      filename = 'datos_financieros.json'
      type = 'application/json'
    } else {
      const headers = 'Tipo,Número,Fecha,Monto,Descripción,Categoría\n'
      const rows = invoices.map(inv => 
        `${inv.type},${inv.number},${inv.date},${inv.amount},"${inv.description}",${inv.category}`
      ).join('\n')
      data = headers + rows
      filename = 'datos_financieros.csv'
      type = 'text/csv'
    }

    const blob = new Blob([data], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const downloadPDF = (reportType) => {
    // Crear contenido HTML para el reporte
    const reportDate = new Date().toLocaleDateString('es-AR')
    const companyName = companyData?.name || 'Mi Empresa'
    
    let reportContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte ${reportType}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #fff; }
            h1 { color: #1f2937; border-bottom: 3px solid #111827; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
            .company { font-size: 28px; font-weight: bold; color: #111827; }
            .date { color: #6b7280; font-size: 14px; margin-top: 5px; }
            .total { font-weight: bold; background-color: #f9fafb; }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
            .chart-container { margin: 30px 0; page-break-inside: avoid; }
            .bar-chart { margin: 20px 0; }
            .bar-item { margin: 15px 0; }
            .bar-label { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
            .bar-bg { background: #e5e7eb; height: 30px; border-radius: 8px; overflow: hidden; }
            .bar-fill { height: 100%; background: linear-gradient(to right, #111827, #374151); display: flex; align-items: center; padding: 0 10px; color: white; font-weight: bold; font-size: 12px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            .kpi-card { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .kpi-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
            .kpi-value { font-size: 24px; font-weight: bold; color: #111827; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">${companyName}</div>
            <div class="date">Reporte generado el ${reportDate}</div>
          </div>
    `

    if (reportType === 'balance' && autoCharts) {
      reportContent += `
        <h1>Balance General</h1>
        
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Ingresos Totales</div>
            <div class="kpi-value positive">$${autoCharts.summary.totalIncome.toLocaleString('es-AR')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Gastos Totales</div>
            <div class="kpi-value negative">$${autoCharts.summary.totalExpenses.toLocaleString('es-AR')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Utilidad Neta</div>
            <div class="kpi-value ${autoCharts.summary.profit >= 0 ? 'positive' : 'negative'}">$${autoCharts.summary.profit.toLocaleString('es-AR')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Margen de Ganancia</div>
            <div class="kpi-value">${autoCharts.summary.profitMargin.toFixed(1)}%</div>
          </div>
        </div>
        
        <div class="chart-container">
          <h2>Top 5 Categorías por Volumen</h2>
          <div class="bar-chart">
            ${autoCharts.topCategories.map((cat, idx) => {
              const maxTotal = autoCharts.topCategories[0].total
              const percentage = (cat.total / maxTotal) * 100
              return `
                <div class="bar-item">
                  <div class="bar-label">
                    <span><strong>${cat.category}</strong></span>
                    <span>$${cat.total.toLocaleString('es-AR')}</span>
                  </div>
                  <div class="bar-bg">
                    <div class="bar-fill" style="width: ${percentage}%">${percentage.toFixed(0)}%</div>
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>
        
        <h2>Análisis Detallado por Categoría</h2>
        <table>
          <tr><th>Categoría</th><th>Ingresos</th><th>Gastos</th><th>Balance</th><th>% del Total</th></tr>
          ${Object.entries(autoCharts.byCategory).map(([cat, data]) => {
            const balance = data.income - data.expense
            const total = data.income + data.expense
            const percentage = ((total / (autoCharts.summary.totalIncome + autoCharts.summary.totalExpenses)) * 100)
            return `
              <tr>
                <td><strong>${cat}</strong></td>
                <td class="positive">$${data.income.toLocaleString('es-AR')}</td>
                <td class="negative">$${data.expense.toLocaleString('es-AR')}</td>
                <td class="${balance >= 0 ? 'positive' : 'negative'}"><strong>$${balance.toLocaleString('es-AR')}</strong></td>
                <td>${percentage.toFixed(1)}%</td>
              </tr>
            `
          }).join('')}
        </table>
      `
    } else if (reportType === 'monthly' && autoCharts) {
      const monthsArray = Object.entries(autoCharts.byMonth)
      const maxIncome = Math.max(...monthsArray.map(([, data]) => data.income))
      const maxExpense = Math.max(...monthsArray.map(([, data]) => data.expense))
      const maxAmount = Math.max(maxIncome, maxExpense)
      
      reportContent += `
        <h1>Reporte Mensual</h1>
        
        <div class="chart-container">
          <h2>Evolución de Ingresos y Gastos</h2>
          <div class="bar-chart">
            ${monthsArray.map(([month, data]) => {
              const incomePercentage = (data.income / maxAmount) * 100
              const expensePercentage = (data.expense / maxAmount) * 100
              const profit = data.income - data.expense
              return `
                <div class="bar-item">
                  <div class="bar-label">
                    <span><strong>${month}</strong></span>
                    <span>Utilidad: <strong class="${profit >= 0 ? 'positive' : 'negative'}">$${profit.toLocaleString('es-AR')}</strong></span>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 5px;">
                    <div>
                      <div style="font-size: 11px; color: #059669; margin-bottom: 3px;">Ingresos: $${data.income.toLocaleString('es-AR')}</div>
                      <div class="bar-bg">
                        <div class="bar-fill" style="width: ${incomePercentage}%; background: linear-gradient(to right, #059669, #10b981);"></div>
                      </div>
                    </div>
                    <div>
                      <div style="font-size: 11px; color: #dc2626; margin-bottom: 3px;">Gastos: $${data.expense.toLocaleString('es-AR')}</div>
                      <div class="bar-bg">
                        <div class="bar-fill" style="width: ${expensePercentage}%; background: linear-gradient(to right, #dc2626, #ef4444);"></div>
                      </div>
                    </div>
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>
        
        <h2>Detalle Mensual</h2>
        <table>
          <tr><th>Mes</th><th>Ingresos</th><th>Gastos</th><th>Utilidad</th><th>Margen %</th></tr>
          ${monthsArray.map(([month, data]) => {
            const profit = data.income - data.expense
            const margin = data.income > 0 ? (profit / data.income * 100) : 0
            return `
              <tr>
                <td><strong>${month}</strong></td>
                <td class="positive">$${data.income.toLocaleString('es-AR')}</td>
                <td class="negative">$${data.expense.toLocaleString('es-AR')}</td>
                <td class="${profit >= 0 ? 'positive' : 'negative'}"><strong>$${profit.toLocaleString('es-AR')}</strong></td>
                <td><strong>${margin.toFixed(1)}%</strong></td>
              </tr>
            `
          }).join('')}
        </table>
      `
    }

    reportContent += `
        </body>
      </html>
    `

    // Crear blob y descargar
    const blob = new Blob([reportContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_${reportType}_${reportDate}.html`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay datos disponibles</h3>
          <p className="text-gray-600">Carga facturas para ver el dashboard y análisis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header con Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setViewMode('executive')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
              viewMode === 'executive' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
              viewMode === 'analytics' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Análisis
          </button>
          <button
            onClick={() => setViewMode('reports')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
              viewMode === 'reports' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Reportes
          </button>
        </div>
      </div>

      {generating && (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Procesando {invoices.length} facturas...</p>
        </div>
      )}

      {!generating && autoCharts && (
        <>
          {/* Vista Dashboard Ejecutivo */}
          {viewMode === 'executive' && (
            <div className="space-y-6">
              {/* KPIs Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <FinancialTooltip term="flujo_caja">
                      <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                    </FinancialTooltip>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${autoCharts.summary.totalIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{autoCharts.summary.incomeCount} facturas</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <FinancialTooltip term="flujo_caja">
                      <p className="text-sm font-medium text-gray-600">Gastos Totales</p>
                    </FinancialTooltip>
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${autoCharts.summary.totalExpenses.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{autoCharts.summary.expenseCount} facturas</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <FinancialTooltip term="utilidad_neta">
                      <p className="text-sm font-medium text-gray-600">Utilidad Neta</p>
                    </FinancialTooltip>
                    <DollarSign className="w-5 h-5 text-cyan-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${autoCharts.summary.profit >= 0 ? '+' : '-'}${Math.abs(autoCharts.summary.profit).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Ganancia/Pérdida</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <FinancialTooltip term="margen_neto">
                      <p className="text-sm font-medium text-gray-600">Margen</p>
                    </FinancialTooltip>
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {autoCharts.summary.profitMargin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Rentabilidad</p>
                </div>
              </div>

              {/* Gráficos Visuales */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Top Categorías */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-6">
                    <span className="text-gray-900">Top 5 Categorías</span>
                  </h3>
                  <div className="space-y-4">
                    {autoCharts.topCategories.map((cat, idx) => {
                      const maxTotal = autoCharts.topCategories[0].total
                      const percentage = (cat.total / maxTotal) * 100
                      
                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                            <span className="text-sm font-bold text-gray-900">${cat.total.toLocaleString('es-AR')}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gray-900 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Evolución Mensual */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-6">
                    <span className="text-gray-900">Evolución Mensual</span>
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(autoCharts.byMonth).slice(-5).map(([month, data], idx) => {
                      const maxAmount = Math.max(...Object.values(autoCharts.byMonth).map(d => Math.max(d.income, d.expense)))
                      const incomePercentage = (data.income / maxAmount) * 100
                      const expensePercentage = (data.expense / maxAmount) * 100
                      
                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{month}</span>
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="text-green-600 font-semibold">
                                +${data.income.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                              </span>
                              <span className="text-red-600 font-semibold">
                                -${data.expense.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${incomePercentage}%` }}
                              />
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full transition-all"
                                style={{ width: `${expensePercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vista Análisis Detallado */}
          {viewMode === 'analytics' && (
            <div className="space-y-6">
              {/* Tabla por Categoría */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <span className="text-cyan-600">Análisis</span> <span className="text-gray-900">por Categoría</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoría</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ingresos</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gastos</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Balance</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">% Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(autoCharts.byCategory).map(([category, data], idx) => {
                        const balance = data.income - data.expense
                        const total = data.income + data.expense
                        const percentage = ((total / (autoCharts.summary.totalIncome + autoCharts.summary.totalExpenses)) * 100)
                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{category}</td>
                            <td className="text-right py-3 px-4 text-sm text-green-600 font-medium">
                              ${data.income.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-red-600 font-medium">
                              ${data.expense.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`text-right py-3 px-4 text-sm font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              {balance >= 0 ? '+' : '-'}${Math.abs(balance).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-gray-700">
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla Mensual */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <span className="text-cyan-600">Evolución Mensual</span> <span className="text-gray-900">Detallada</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mes</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ingresos</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gastos</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Utilidad</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Margen %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(autoCharts.byMonth).map(([month, data], idx) => {
                        const profit = data.income - data.expense
                        const margin = data.income > 0 ? (profit / data.income * 100) : 0
                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{month}</td>
                            <td className="text-right py-3 px-4 text-sm text-green-600 font-medium">
                              ${data.income.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-red-600 font-medium">
                              ${data.expense.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`text-right py-3 px-4 text-sm font-bold ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              {profit >= 0 ? '+' : '-'}${Math.abs(profit).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`text-right py-3 px-4 text-sm font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {margin.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Exportar Datos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <span className="text-cyan-600">Exportar</span> <span className="text-gray-900">Datos</span>
                </h3>
                <div className="flex items-center gap-4">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
                  >
                    <option value="json">JSON (Power BI)</option>
                    <option value="csv">CSV (Excel)</option>
                  </select>
                  <button
                    onClick={exportData}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vista Reportes */}
          {viewMode === 'reports' && (
            <div className="space-y-6">
              {/* Selector de Reporte */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <span className="text-cyan-600">Seleccionar</span> <span className="text-gray-900">Tipo de Reporte</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedReport('balance')}
                    className={`p-6 rounded-lg border transition-all text-left ${
                      selectedReport === 'balance'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-900 hover:shadow-md'
                    }`}
                  >
                    <FileText className="w-6 h-6 text-gray-900 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1">Balance General</h4>
                    <p className="text-sm text-gray-600">Resumen financiero completo con análisis por categoría</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedReport('monthly')}
                    className={`p-6 rounded-lg border transition-all text-left ${
                      selectedReport === 'monthly'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-900 hover:shadow-md'
                    }`}
                  >
                    <BarChart3 className="w-6 h-6 text-gray-900 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1">Reporte Mensual</h4>
                    <p className="text-sm text-gray-600">Evolución mensual de ingresos, gastos y utilidades</p>
                  </button>
                </div>
              </div>

              {/* Vista Previa del Reporte */}
              {selectedReport === 'balance' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">
                      <span className="text-cyan-600">Vista Previa:</span> <span className="text-gray-900">Balance General</span>
                    </h3>
                    <button
                      onClick={() => downloadPDF('balance')}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Resumen Financiero</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${autoCharts.summary.totalIncome.toLocaleString('es-AR')}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Gastos Totales</p>
                          <p className="text-2xl font-bold text-red-600">
                            ${autoCharts.summary.totalExpenses.toLocaleString('es-AR')}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Utilidad Neta</p>
                          <p className={`text-2xl font-bold ${autoCharts.summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            ${autoCharts.summary.profit.toLocaleString('es-AR')}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Margen de Ganancia</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {autoCharts.summary.profitMargin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Análisis por Categoría</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Categoría</th>
                              <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Ingresos</th>
                              <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Gastos</th>
                              <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(autoCharts.byCategory).slice(0, 5).map(([cat, data], idx) => (
                              <tr key={idx} className="border-b border-gray-100">
                                <td className="py-2 px-3 text-sm font-medium text-gray-900">{cat}</td>
                                <td className="text-right py-2 px-3 text-sm text-green-600">
                                  ${data.income.toLocaleString('es-AR')}
                                </td>
                                <td className="text-right py-2 px-3 text-sm text-red-600">
                                  ${data.expense.toLocaleString('es-AR')}
                                </td>
                                <td className={`text-right py-2 px-3 text-sm font-semibold ${(data.income - data.expense) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                  ${(data.income - data.expense).toLocaleString('es-AR')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === 'monthly' && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Vista Previa: Reporte Mensual</h3>
                    <button
                      onClick={() => downloadPDF('monthly')}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Descargar PDF
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mes</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ingresos</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gastos</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Utilidad</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Margen %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(autoCharts.byMonth).map(([month, data], idx) => {
                          const profit = data.income - data.expense
                          const margin = data.income > 0 ? (profit / data.income * 100) : 0
                          return (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">{month}</td>
                              <td className="text-right py-3 px-4 text-sm text-green-600 font-medium">
                                ${data.income.toLocaleString('es-AR')}
                              </td>
                              <td className="text-right py-3 px-4 text-sm text-red-600 font-medium">
                                ${data.expense.toLocaleString('es-AR')}
                              </td>
                              <td className={`text-right py-3 px-4 text-sm font-bold ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                ${profit.toLocaleString('es-AR')}
                              </td>
                              <td className={`text-right py-3 px-4 text-sm font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {margin.toFixed(1)}%
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CombinedDashboard
