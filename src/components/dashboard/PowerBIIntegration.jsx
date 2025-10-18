import React, { useState, useEffect } from 'react'
import { LineChart, Download, Share2, Settings, BarChart3, PieChart, TrendingUp, ExternalLink, Copy, CheckCircle, Sparkles, RefreshCw } from 'lucide-react'

const PowerBIIntegration = ({ invoices, companyData }) => {
  const [copied, setCopied] = useState(false)
  const [exportFormat, setExportFormat] = useState('json')
  const [autoCharts, setAutoCharts] = useState(null)
  const [generating, setGenerating] = useState(false)

  // Generar gráficos automáticamente al cargar
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      generateAutoCharts()
    }
  }, [invoices])

  const generateAutoCharts = async () => {
    setGenerating(true)

    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Calcular datos para gráficos
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

    // Calcular promedios y estadísticas adicionales
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0
    
    // Agrupar por proveedor/cliente (usando descripción como proxy)
    const providerData = {}
    invoices.forEach(inv => {
      const provider = inv.description?.split(' ')[0] || 'Sin nombre'
      if (!providerData[provider]) {
        providerData[provider] = { income: 0, expense: 0, count: 0 }
      }
      providerData[provider].count++
      if (inv.type === 'income') {
        providerData[provider].income += parseFloat(inv.amount)
      } else {
        providerData[provider].expense += parseFloat(inv.amount)
      }
    })

    // Calcular tendencias
    const monthsArray = Object.entries(monthlyData).sort((a, b) => new Date(a[0]) - new Date(b[0]))
    const trends = monthsArray.map((month, idx) => {
      if (idx === 0) return { month: month[0], growth: 0 }
      const prevProfit = monthsArray[idx - 1][1].income - monthsArray[idx - 1][1].expense
      const currentProfit = month[1].income - month[1].expense
      const growth = prevProfit !== 0 ? ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100 : 0
      return { month: month[0], growth }
    })

    setAutoCharts({
      summary: {
        totalIncome,
        totalExpenses,
        profit: totalIncome - totalExpenses,
        profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0,
        avgIncome,
        avgExpense,
        incomeCount: income.length,
        expenseCount: expenses.length
      },
      byCategory: categoryData,
      byMonth: monthlyData,
      byProvider: providerData,
      trends,
      topCategories: Object.entries(categoryData)
        .map(([cat, data]) => ({ category: cat, total: data.income + data.expense }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
      topProviders: Object.entries(providerData)
        .map(([name, data]) => ({ name, total: data.income + data.expense, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
    })

    setGenerating(false)
  }

  const exportData = () => {
    let data
    let filename
    let type

    if (exportFormat === 'json') {
      data = JSON.stringify({ company: companyData, invoices }, null, 2)
      filename = 'datos_financieros.json'
      type = 'application/json'
    } else if (exportFormat === 'csv') {
      // Convertir a CSV
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

  const copyAPIEndpoint = () => {
    const endpoint = 'https://api.contabilidad-ia.com/v1/data/export'
    navigator.clipboard.writeText(endpoint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Análisis de Datos</h1>
        <p className="text-sm text-gray-600 mt-1">Visualizaciones y métricas procesadas de tus facturas</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Registros</p>
          <p className="text-3xl font-bold text-gray-900">{invoices?.length || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Facturas totales</p>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Actualización</p>
          <p className="text-xl font-semibold text-gray-900">Hoy</p>
          <p className="text-sm text-gray-600 mt-1">{new Date().toLocaleDateString('es-AR')}</p>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Estado</p>
          <p className="text-xl font-semibold text-gray-900">{generating ? 'Procesando' : 'Listo'}</p>
          <button
            onClick={generateAutoCharts}
            disabled={generating || !invoices || invoices.length === 0}
            className="mt-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 inline mr-1 ${generating ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Auto-Generated Dashboards */}
      {autoCharts && !generating && (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Ingresos</p>
              <p className="text-2xl font-bold text-gray-900">
                ${autoCharts.summary.totalIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Gastos</p>
              <p className="text-2xl font-bold text-gray-900">
                ${autoCharts.summary.totalExpenses.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Utilidad</p>
              <p className={`text-2xl font-bold ${autoCharts.summary.profit >= 0 ? 'text-gray-900' : 'text-gray-900'}`}>
                {autoCharts.summary.profit >= 0 ? '+' : '-'}${Math.abs(autoCharts.summary.profit).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Margen</p>
              <p className="text-2xl font-bold text-gray-900">
                {autoCharts.summary.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Tablas de Datos Detalladas */}
          <div className="space-y-6">
            {/* Tabla de Resumen por Categoría */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen por Categoría</h3>
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

            {/* Tabla de Evolución Mensual */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tabla: Evolución Mensual</h3>
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

            {/* Tabla de Top Proveedores/Clientes */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tabla: Top Proveedores/Clientes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ingresos</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gastos</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Transacciones</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autoCharts.topProviders.map((provider, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{provider.name}</td>
                        <td className="text-right py-3 px-4 text-sm text-green-600 font-medium">
                          ${provider.income.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-red-600 font-medium">
                          ${provider.expense.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-gray-700">
                          {provider.count}
                        </td>
                        <td className="text-right py-3 px-4 text-sm font-bold text-gray-900">
                          ${provider.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla de Métricas Estadísticas */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tabla: Métricas Estadísticas</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Métrica</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">Promedio de Ingresos</td>
                      <td className="text-right py-3 px-4 text-sm text-green-600 font-bold">
                        ${autoCharts.summary.avgIncome.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">Por factura de ingreso</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">Promedio de Gastos</td>
                      <td className="text-right py-3 px-4 text-sm text-red-600 font-bold">
                        ${autoCharts.summary.avgExpense.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">Por factura de gasto</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">Total Facturas Ingreso</td>
                      <td className="text-right py-3 px-4 text-sm text-gray-900 font-bold">
                        {autoCharts.summary.incomeCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">Documentos de ingreso</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">Total Facturas Gasto</td>
                      <td className="text-right py-3 px-4 text-sm text-gray-900 font-bold">
                        {autoCharts.summary.expenseCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">Documentos de gasto</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">Margen de Ganancia</td>
                      <td className={`text-right py-3 px-4 text-sm font-bold ${autoCharts.summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {autoCharts.summary.profitMargin.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">Rentabilidad general</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">Categorías Activas</td>
                      <td className="text-right py-3 px-4 text-sm text-gray-900 font-bold">
                        {Object.keys(autoCharts.byCategory).length}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">Tipos de actividad</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Categories Chart */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Categorías</h3>
              <div className="space-y-4">
                {autoCharts.topCategories.map((cat, idx) => {
                  const maxTotal = autoCharts.topCategories[0].total
                  const percentage = (cat.total / maxTotal) * 100
                  const colors = ['bg-gray-900', 'bg-gray-700', 'bg-gray-600', 'bg-gray-500', 'bg-gray-400']
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                        <span className="text-sm font-bold text-gray-900">
                          ${cat.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${colors[idx]} h-3 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolución Mensual</h3>
              <div className="space-y-4">
                {Object.entries(autoCharts.byMonth).map(([month, data], idx) => {
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
                            className="bg-gray-900 h-2 rounded-full transition-all"
                            style={{ width: `${incomePercentage}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-600 h-2 rounded-full transition-all"
                            style={{ width: `${expensePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Desglose por Categoría</h3>
              <div className="space-y-3">
                {Object.entries(autoCharts.byCategory).map(([category, data], idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{category}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-green-600">
                          Ingresos: ${data.income.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-xs text-red-600">
                          Gastos: ${data.expense.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${(data.income - data.expense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(data.income - data.expense) >= 0 ? '+' : '-'}${Math.abs(data.income - data.expense).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumen Ejecutivo</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Total Facturas</span>
                  <span className="text-xl font-bold text-gray-900">{invoices.length}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Categorías</span>
                  <span className="text-xl font-bold text-gray-900">{Object.keys(autoCharts.byCategory).length}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Meses Analizados</span>
                  <span className="text-xl font-bold text-gray-900">{Object.keys(autoCharts.byMonth).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ROI</span>
                  <span className="text-xl font-bold text-gray-900">{autoCharts.summary.profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {generating && (
        <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Generando Visualizaciones...</h3>
          <p className="text-gray-600">Procesando {invoices?.length || 0} facturas</p>
        </div>
      )}

      {/* Empty State */}
      {!autoCharts && !generating && (!invoices || invoices.length === 0) && (
        <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-10 h-10 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay datos para visualizar</h3>
          <p className="text-gray-600">Carga facturas para generar dashboards automáticos</p>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white border border-gray-300 rounded-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Exportar Datos para Power BI</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato de Exportación
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
            >
              <option value="json">JSON (Recomendado para Power BI)</option>
              <option value="csv">CSV (Excel compatible)</option>
            </select>
          </div>

          <button
            onClick={exportData}
            className="w-full bg-gray-900 text-white px-6 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Datos ({exportFormat.toUpperCase()})</span>
          </button>
        </div>
      </div>

      {/* API Integration */}
      <div className="bg-white border border-gray-300 rounded-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Conexión API (Próximamente)</h3>
        <p className="text-gray-600 mb-6">
          Conecta Power BI directamente a tu cuenta usando nuestra API REST
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Endpoint de API</span>
            <button
              onClick={copyAPIEndpoint}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
          <code className="text-sm text-gray-800 font-mono">
            https://api.contabilidad-ia.com/v1/data/export
          </code>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> La conexión API directa estará disponible en la versión Pro. 
            Por ahora, usa la exportación manual de archivos.
          </p>
        </div>
      </div>

      {/* Power BI Templates */}
      <div className="bg-white border border-gray-300 rounded-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Plantillas de Power BI</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Dashboard Financiero</h4>
                <p className="text-sm text-gray-500">Análisis completo de ingresos y gastos</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Descargar Template</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Análisis de Categorías</h4>
                <p className="text-sm text-gray-500">Distribución por tipo de gasto</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Descargar Template</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Proyecciones</h4>
                <p className="text-sm text-gray-500">Tendencias y forecasting</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Descargar Template</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <LineChart className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">KPIs Ejecutivos</h4>
                <p className="text-sm text-gray-500">Métricas clave del negocio</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Descargar Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
        <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Cómo Conectar con Power BI
        </h4>
        <ol className="space-y-2 text-sm text-yellow-800 list-decimal list-inside">
          <li>Exporta tus datos en formato JSON o CSV</li>
          <li>Abre Microsoft Power BI Desktop</li>
          <li>Ve a "Obtener datos" → "Archivo" → Selecciona tu archivo exportado</li>
          <li>Descarga una de nuestras plantillas prediseñadas</li>
          <li>Conecta los datos a la plantilla</li>
          <li>¡Listo! Visualiza tus datos financieros</li>
        </ol>
        <a
          href="https://powerbi.microsoft.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center space-x-2 text-yellow-700 hover:text-yellow-800 font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Descargar Power BI Desktop (Gratis)</span>
        </a>
      </div>
    </div>
  )
}

export default PowerBIIntegration
