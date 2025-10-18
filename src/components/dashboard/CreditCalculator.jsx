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
      rate: 75,
      maxAmount: 50000000,
      term: 36,
      description: 'Para capital de trabajo e inversión productiva'
    },
    {
      name: 'Crédito Productivo Banco Nación',
      rate: 80,
      maxAmount: 30000000,
      term: 24,
      description: 'Financiamiento para PyMEs productivas'
    },
    {
      name: 'Línea FONDEP',
      rate: 70,
      maxAmount: 20000000,
      term: 48,
      description: 'Desarrollo productivo con tasa subsidiada'
    },
    {
      name: 'Crédito Bancario Tradicional',
      rate: 90,
      maxAmount: 100000000,
      term: 60,
      description: 'Línea comercial estándar'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
          <Calculator className="w-8 h-8 mr-3 text-gray-900" />
          Calculadora de Créditos
        </h1>
        <p className="text-sm text-gray-600 mt-1">Simule financiamiento para proyectos de inversión</p>
      </div>

      {/* Líneas de Crédito Disponibles */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Líneas de Crédito PyME Argentina</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {creditLines.map((line, idx) => (
            <div 
              key={idx}
              className="p-4 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => {
                setInterestRate(line.rate)
                setLoanTerm(line.term)
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">{line.name}</h4>
                <span className="text-lg font-bold text-gray-900">{line.rate}%</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{line.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Hasta ${(line.maxAmount / 1000000).toFixed(0)}M</span>
                <span>Plazo: {line.term} meses</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculadora */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Parámetros */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Parámetros del Crédito</h3>
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
          <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 text-white">
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
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Resumen del Crédito</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monto Solicitado</span>
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
                <span className="text-sm text-gray-600">Total Intereses</span>
                <span className="text-sm font-semibold text-red-600">
                  ${calculation.totalInterest.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Capacidad de Pago Mensual</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${paymentCapacity.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de Viabilidad */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Viabilidad del Proyecto</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">ROI Mínimo Recomendado</p>
            <p className="text-2xl font-bold text-gray-900">{projectROI}%</p>
            <p className="text-xs text-gray-500">Anual para superar inflación + tasa</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">Retorno Proyectado</p>
            <p className="text-2xl font-bold text-green-600">
              ${projectReturn.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500">En {loanTerm} meses</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-1">Ganancia Neta</p>
            <p className={`text-2xl font-bold ${netReturn > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netReturn.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500">Después de intereses</p>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="space-y-2">
          {!canAfford && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-900">
                <strong>Advertencia:</strong> La cuota excede su capacidad de pago actual. Considere reducir el monto o extender el plazo.
              </p>
            </div>
          )}
          {netReturn < 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-900">
                <strong>Atención:</strong> El proyecto debe generar un ROI superior al {projectROI}% anual para ser viable en el contexto argentino.
              </p>
            </div>
          )}
          {canAfford && netReturn > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-900">
                <strong>Viable:</strong> El proyecto es financieramente viable con su capacidad de pago actual y ROI proyectado.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cronograma de Pagos (primeros 6 meses) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronograma de Pagos (Primeros 6 Meses)</h3>
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
