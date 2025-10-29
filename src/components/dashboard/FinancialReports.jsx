import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Download, 
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar
} from 'lucide-react'

const FinancialReports = ({ invoices, companyData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedReport, setSelectedReport] = useState('balance')

  // Calcular métricas financieras
  const financialMetrics = useMemo(() => {
    const income = invoices.filter(inv => inv.type === 'income')
    const expenses = invoices.filter(inv => inv.type === 'expense')

    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const netProfit = totalIncome - totalExpenses

    // Agrupar por categoría
    const incomeByCategory = income.reduce((acc, inv) => {
      acc[inv.category] = (acc[inv.category] || 0) + parseFloat(inv.amount)
      return acc
    }, {})

    const expensesByCategory = expenses.reduce((acc, inv) => {
      acc[inv.category] = (acc[inv.category] || 0) + parseFloat(inv.amount)
      return acc
    }, {})

    // Calcular ratios
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      incomeByCategory,
      expensesByCategory,
      profitMargin,
      expenseRatio,
      transactionCount: invoices.length,
    }
  }, [invoices])

  // Balance General
  const balanceSheet = useMemo(() => {
    const { totalIncome, totalExpenses, netProfit } = financialMetrics

    return {
      assets: {
        current: {
          cash: netProfit > 0 ? netProfit : 0,
          accountsReceivable: totalIncome * 0.15, // 15% estimado
          inventory: totalExpenses * 0.10, // 10% estimado
        }
      },
      liabilities: {
        current: {
          accountsPayable: totalExpenses * 0.20, // 20% estimado
          shortTermDebt: totalExpenses * 0.10, // 10% estimado
        }
      },
      equity: {
        capital: totalIncome * 0.30, // 30% estimado
        retainedEarnings: netProfit,
      }
    }
  }, [financialMetrics])

  // Estado de Resultados
  const incomeStatement = useMemo(() => {
    const { totalIncome, totalExpenses, expensesByCategory } = financialMetrics

    // Desglosar gastos
    const operatingExpenses = Object.entries(expensesByCategory)
      .filter(([cat]) => ['Gastos Operativos', 'Sueldos'].includes(cat))
      .reduce((sum, [, amount]) => sum + amount, 0)

    const costOfGoodsSold = Object.entries(expensesByCategory)
      .filter(([cat]) => cat === 'Compras')
      .reduce((sum, [, amount]) => sum + amount, 0)

    const grossProfit = totalIncome - costOfGoodsSold
    const operatingIncome = grossProfit - operatingExpenses
    const netIncome = totalIncome - totalExpenses

    return {
      revenue: totalIncome,
      costOfGoodsSold,
      grossProfit,
      grossMargin: totalIncome > 0 ? (grossProfit / totalIncome) * 100 : 0,
      operatingExpenses,
      operatingIncome,
      operatingMargin: totalIncome > 0 ? (operatingIncome / totalIncome) * 100 : 0,
      otherExpenses: totalExpenses - costOfGoodsSold - operatingExpenses,
      netIncome,
      netMargin: totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0,
    }
  }, [financialMetrics])

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (!companyData || invoices.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {!companyData ? 'Configura tu empresa primero' : 'No hay datos para mostrar'}
          </h3>
          <p className="text-gray-600">
            {!companyData 
              ? 'Completa los datos de tu empresa en la pestaña "Datos de Empresa"'
              : 'Carga algunas facturas para generar reportes financieros'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Report Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">Reportes</span> Financieros
            </h3>
            <p className="text-gray-600">{companyData.name} - Ejercicio {companyData.fiscalYear}</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
        </div>

        <div className="flex space-x-2 mt-6">
          <button
            onClick={() => setSelectedReport('balance')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedReport === 'balance'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className={selectedReport === 'balance' ? '' : 'bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent'}>
              Balance General
            </span>
          </button>
          <button
            onClick={() => setSelectedReport('income')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedReport === 'income'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className={selectedReport === 'income' ? '' : 'bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent'}>
              Estado de Resultados
            </span>
          </button>
          <button
            onClick={() => setSelectedReport('analysis')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedReport === 'analysis'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className={selectedReport === 'analysis' ? '' : 'bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent'}>
              Análisis
            </span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Ingresos Totales</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(financialMetrics.totalIncome)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Gastos Totales</span>
            <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(financialMetrics.totalExpenses)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Utilidad Neta</span>
            <DollarSign className={`w-5 h-5 ${financialMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <p className={`text-2xl font-bold ${financialMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(financialMetrics.netProfit)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Margen de Utilidad</span>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {financialMetrics.profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Balance General */}
      {selectedReport === 'balance' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h4 className="text-xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">Balance</span> <span className="text-gray-900">General</span>
          </h4>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Activos */}
            <div>
              <h5 className="text-lg font-bold mb-4 pb-2 border-b-2 border-black">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">ACTIVOS</span>
              </h5>
              
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Activos Corrientes</p>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Efectivo y equivalentes</span>
                      <span className="font-medium">{formatCurrency(balanceSheet.assets.current.cash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Cuentas por cobrar</span>
                      <span className="font-medium">{formatCurrency(balanceSheet.assets.current.accountsReceivable)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Inventario</span>
                      <span className="font-medium">{formatCurrency(balanceSheet.assets.current.inventory)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total Activos</span>
                    <span>{formatCurrency(
                      balanceSheet.assets.current.cash + 
                      balanceSheet.assets.current.accountsReceivable + 
                      balanceSheet.assets.current.inventory
                    )}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pasivos y Patrimonio */}
            <div>
              <h5 className="text-lg font-bold mb-4 pb-2 border-b-2 border-black">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">PASIVOS Y PATRIMONIO</span>
              </h5>
              
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Pasivos Corrientes</p>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Cuentas por pagar</span>
                      <span className="font-medium">{formatCurrency(balanceSheet.liabilities.current.accountsPayable)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Deuda a corto plazo</span>
                      <span className="font-medium">{formatCurrency(balanceSheet.liabilities.current.shortTermDebt)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total Pasivos</span>
                    <span>{formatCurrency(
                      balanceSheet.liabilities.current.accountsPayable + 
                      balanceSheet.liabilities.current.shortTermDebt
                    )}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="font-semibold text-gray-900 mb-2">Patrimonio</p>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Capital</span>
                      <span className="font-medium">{formatCurrency(balanceSheet.equity.capital)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Resultados acumulados</span>
                      <span className="font-medium">{formatCurrency(balanceSheet.equity.retainedEarnings)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total Patrimonio</span>
                    <span>{formatCurrency(
                      balanceSheet.equity.capital + 
                      balanceSheet.equity.retainedEarnings
                    )}</span>
                  </div>
                </div>

                <div className="pt-2 border-t-2 border-black">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total Pasivos + Patrimonio</span>
                    <span>{formatCurrency(
                      balanceSheet.liabilities.current.accountsPayable + 
                      balanceSheet.liabilities.current.shortTermDebt +
                      balanceSheet.equity.capital + 
                      balanceSheet.equity.retainedEarnings
                    )}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado de Resultados */}
      {selectedReport === 'income' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h4 className="text-xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">Estado</span> <span className="text-gray-900">de Resultados</span>
          </h4>
          
          <div className="space-y-4 max-w-2xl">
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-gray-900">Ingresos por Ventas</span>
              <span className="font-bold text-gray-900">{formatCurrency(incomeStatement.revenue)}</span>
            </div>

            <div className="flex justify-between ml-4">
              <span className="text-gray-700">(-) Costo de Ventas</span>
              <span className="text-red-600">({formatCurrency(incomeStatement.costOfGoodsSold)})</span>
            </div>

            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
              <span>Utilidad Bruta</span>
              <span>{formatCurrency(incomeStatement.grossProfit)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 ml-4">
              <span>Margen Bruto</span>
              <span>{incomeStatement.grossMargin.toFixed(1)}%</span>
            </div>

            <div className="flex justify-between ml-4 mt-4">
              <span className="text-gray-700">(-) Gastos Operativos</span>
              <span className="text-red-600">({formatCurrency(incomeStatement.operatingExpenses)})</span>
            </div>

            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
              <span>Utilidad Operativa</span>
              <span>{formatCurrency(incomeStatement.operatingIncome)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 ml-4">
              <span>Margen Operativo</span>
              <span>{incomeStatement.operatingMargin.toFixed(1)}%</span>
            </div>

            <div className="flex justify-between ml-4 mt-4">
              <span className="text-gray-700">(-) Otros Gastos</span>
              <span className="text-red-600">({formatCurrency(incomeStatement.otherExpenses)})</span>
            </div>

            <div className="flex justify-between font-bold text-lg pt-4 border-t-2 border-black">
              <span className="text-gray-900">Utilidad Neta</span>
              <span className={incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(incomeStatement.netIncome)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 ml-4">
              <span>Margen Neto</span>
              <span className={incomeStatement.netMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                {incomeStatement.netMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Análisis */}
      {selectedReport === 'analysis' && (
        <div className="space-y-6">
          {/* Análisis por Categoría */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h4 className="text-xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">Análisis</span> <span className="text-gray-900">por Categoría</span>
            </h4>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="font-semibold mb-4">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">Ingresos</span> <span className="text-gray-900">por Categoría</span>
                </h5>
                <div className="space-y-3">
                  {Object.entries(financialMetrics.incomeByCategory).map(([category, amount]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">{category}</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(amount / financialMetrics.totalIncome) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-4">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">Gastos</span> <span className="text-gray-900">por Categoría</span>
                </h5>
                <div className="space-y-3">
                  {Object.entries(financialMetrics.expensesByCategory).map(([category, amount]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">{category}</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${(amount / financialMetrics.totalExpenses) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ratios Financieros */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h4 className="text-xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">Ratios</span> <span className="text-gray-900">Financieros</span>
            </h4>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Ratio de Gastos</p>
                <p className="text-2xl font-bold text-gray-900">{financialMetrics.expenseRatio.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Gastos / Ingresos</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Margen de Utilidad</p>
                <p className={`text-2xl font-bold ${financialMetrics.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financialMetrics.profitMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Utilidad Neta / Ingresos</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Transacciones</p>
                <p className="text-2xl font-bold text-gray-900">{financialMetrics.transactionCount}</p>
                <p className="text-xs text-gray-500 mt-1">Total de facturas</p>
              </div>
            </div>
          </div>

          {/* Recomendaciones IA */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">Análisis IA</span> <span className="text-white">- Recomendaciones</span>
                </h4>
                <ul className="space-y-2 text-gray-300">
                  {financialMetrics.profitMargin < 10 && (
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Tu margen de utilidad es bajo ({financialMetrics.profitMargin.toFixed(1)}%). Considera revisar tus costos operativos.</span>
                    </li>
                  )}
                  {financialMetrics.expenseRatio > 80 && (
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>Tus gastos representan el {financialMetrics.expenseRatio.toFixed(1)}% de tus ingresos. Busca oportunidades de optimización.</span>
                    </li>
                  )}
                  {financialMetrics.netProfit > 0 && (
                    <li className="flex items-start space-x-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>¡Excelente! Estás generando utilidades. Considera reinvertir en crecimiento.</span>
                    </li>
                  )}
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Mantén un registro constante de tus facturas para un mejor análisis financiero.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancialReports
