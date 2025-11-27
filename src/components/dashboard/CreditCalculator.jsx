import React, { useState } from 'react'
import { Calculator, DollarSign, TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react'

const CreditCalculator = ({ invoices }) => {
  const [loanAmount, setLoanAmount] = useState(1000000)
  const [loanTerm, setLoanTerm] = useState(12) // meses
  const [interestRate, setInterestRate] = useState(85) // % anual
  const [loanType, setLoanType] = useState('frances') // frances o aleman

  // Líneas de crédito reales en Argentina 2024-2025
  const creditLines = [
    {
      name: 'Línea PyME BICE',
      bank: 'BICE',
      logo: 'https://logos-world.net/wp-content/uploads/2023/09/Banco-BICE-Logo.png',
      rate: 75,
      maxAmount: 50000000,
      term: 36,
      description: 'Para capital de trabajo e inversión productiva'
    },
    {
      name: 'Línea FONDEP',
      bank: 'FONDEP',
      logo: 'https://www.argentina.gob.ar/sites/default/files/2018/10/logo_fondep.png',
      rate: 70,
      maxAmount: 20000000,
      term: 48,
      description: 'Desarrollo productivo con tasa subsidiada'
    },
    {
      name: 'Crédito PyME Galicia',
      bank: 'Banco Galicia',
      logo: 'https://logos-world.net/wp-content/uploads/2023/09/Banco-Galicia-Logo.png',
      rate: 85,
      maxAmount: 40000000,
      term: 36,
      description: 'Financiamiento para capital de trabajo'
    },
    {
      name: 'Crédito Santander Río',
      bank: 'Santander',
      logo: 'https://logos-world.net/wp-content/uploads/2020/09/Santander-Logo.png',
      rate: 88,
      maxAmount: 50000000,
      term: 48,
      description: 'Línea de inversión productiva'
    },
    {
      name: 'Crédito BBVA PyME',
      bank: 'BBVA',
      logo: 'https://logos-world.net/wp-content/uploads/2020/09/BBVA-Logo.png',
      rate: 87,
      maxAmount: 35000000,
      term: 36,
      description: 'Capital de trabajo y equipamiento'
    },
    {
      name: 'Crédito Macro Empresas',
      bank: 'Banco Macro',
      logo: 'https://logos-world.net/wp-content/uploads/2023/09/Banco-Macro-Logo.png',
      rate: 86,
      maxAmount: 45000000,
      term: 42,
      description: 'Financiamiento integral para PyMEs'
    },
    {
      name: 'Crédito ICBC PyME',
      bank: 'ICBC',
      logo: 'https://logos-world.net/wp-content/uploads/2021/03/ICBC-Logo.png',
      rate: 84,
      maxAmount: 38000000,
      term: 36,
      description: 'Línea de crédito para inversión'
    },
    {
      name: 'Crédito Supervielle',
      bank: 'Banco Supervielle',
      logo: 'https://logos-world.net/wp-content/uploads/2023/09/Banco-Supervielle-Logo.png',
      rate: 89,
      maxAmount: 30000000,
      term: 36,
      description: 'Financiamiento comercial'
    }
  ]

  // Calcular capacidad de pago basada en facturas
  const calculatePaymentCapacity = () => {
    if (!invoices || invoices.length === 0) return 0

    const income = invoices.filter(inv => inv.type === 'income')
    const expenses = invoices.filter(inv => inv.type === 'expense')

    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const netProfit = totalIncome - totalExpenses

    // Capacidad de pago: 30% de la utilidad neta mensual
    const monthlyProfit = netProfit / Math.max(1, invoices.length / 30)
    return monthlyProfit * 0.3
  }

  // Sistema Francés (cuota fija)
  const calculateFrances = () => {
    const monthlyRate = interestRate / 100 / 12
    const numPayments = loanTerm
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1)
    
    const totalPayment = monthlyPayment * numPayments
    const totalInterest = totalPayment - loanAmount

    const schedule = []
    let balance = loanAmount

    for (let i = 1; i <= numPayments; i++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment

      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      })
    }

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule
    }
  }

  // Sistema Alemán (amortización fija)
  const calculateAleman = () => {
    const monthlyRate = interestRate / 100 / 12
    const principalPayment = loanAmount / loanTerm
    
    const schedule = []
    let balance = loanAmount
    let totalPayment = 0

    for (let i = 1; i <= loanTerm; i++) {
      const interestPayment = balance * monthlyRate
      const payment = principalPayment + interestPayment
      balance -= principalPayment
      totalPayment += payment

      schedule.push({
        month: i,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      })
    }

    const totalInterest = totalPayment - loanAmount

    return {
      monthlyPayment: schedule[0].payment, // Primera cuota (la más alta)
      totalPayment,
      totalInterest,
      schedule
    }
  }

  const calculation = loanType === 'frances' ? calculateFrances() : calculateAleman()
  const paymentCapacity = calculatePaymentCapacity()
  const canAfford = calculation.monthlyPayment <= paymentCapacity

  // ROI del proyecto (asumiendo retorno del 120% anual mínimo para superar inflación + tasa)
  const projectROI = 120 // % anual mínimo recomendado
  const projectReturn = (loanAmount * projectROI / 100) * (loanTerm / 12)
  const netReturn = projectReturn - calculation.totalInterest

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">Simule su financiamiento</p>
      </div>

      {/* Líneas de Crédito Disponibles */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Líneas de Crédito Disponibles</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {creditLines.map((line, idx) => (
            <button 
              key={idx}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-900 hover:shadow-lg transition-all text-left group"
              onClick={() => {
                setInterestRate(line.rate)
                setLoanTerm(line.term)
              }}
            >
              <div className="flex items-start gap-4">
                {/* Logo del Banco */}
                <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-2 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src={line.logo} 
                    alt={line.bank}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-sm font-bold text-gray-400">
                    {line.bank.substring(0, 2)}
                  </div>
                </div>
                
                {/* Información */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h4 className="font-bold text-gray-900 text-base leading-tight group-hover:text-gray-900">
                      {line.name}
                    </h4>
                    <span className="text-xl font-bold text-blue-600 flex-shrink-0">
                      {line.rate}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {line.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Calculadora */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Parámetros */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Parámetros</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto del Crédito
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                  step="100000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ${loanAmount.toLocaleString('es-AR')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plazo (meses)
              </label>
              <input
                type="range"
                min="6"
                max="60"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-gray-900 font-semibold">{loanTerm} meses</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasa de Interés Anual (%)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                step="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sistema de Amortización
              </label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="frances">Sistema Francés (cuota fija)</option>
                <option value="aleman">Sistema Alemán (amortización fija)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          {/* Cuota Mensual */}
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <p className="text-sm text-gray-300 mb-2">Cuota Mensual {loanType === 'aleman' && '(Primera)'}</p>
            <p className="text-4xl font-bold mb-4">
              ${calculation.monthlyPayment.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
            <div className="flex items-center space-x-2">
              {canAfford ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-400">Dentro de capacidad de pago</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-400">Excede capacidad de pago</span>
                </>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Resumen</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monto</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${loanAmount.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total a Pagar</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${calculation.totalPayment.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Intereses</span>
                <span className="text-sm font-semibold text-red-600">
                  ${calculation.totalInterest.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      {!canAfford && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-900">
            La cuota excede su capacidad de pago. Considere reducir el monto o extender el plazo.
          </p>
        </div>
      )}
      {canAfford && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <p className="text-sm text-green-900">
            El crédito es viable con su capacidad de pago actual.
          </p>
        </div>
      )}

      {/* Cronograma de Pagos (primeros 6 meses) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Primeros 6 Meses</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Mes</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Cuota</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Capital</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Interés</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {calculation.schedule.slice(0, 6).map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{row.month}</td>
                  <td className="text-right py-3 px-4 text-sm text-gray-900">
                    ${row.payment.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-gray-900">
                    ${row.principal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-red-600">
                    ${row.interest.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                    ${row.balance.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CreditCalculator
