import React, { useState, useEffect, useMemo } from 'react'
import { Calculator, TrendingUp, AlertCircle, DollarSign, Calendar, FileText, Building2, Percent } from 'lucide-react'

const TaxManagement = ({ invoices, companyData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [condicionIVA, setCondicionIVA] = useState('responsable_inscripto')
  const [provincia, setProvincia] = useState('buenos_aires')
  
  // Alícuotas de ARCA Argentina
  const taxRates = {
    iva: {
      general: 0.21,
      reducido: 0.105,
      exento: 0
    },
    iibb: {
      buenos_aires: 0.03,
      caba: 0.025,
      cordoba: 0.035,
      santa_fe: 0.03,
      mendoza: 0.03,
      otras: 0.03
    },
    ganancias: {
      sociedades: 0.35,
      monotributo: 0,
      autonomo: 0.35
    },
    percepciones: {
      iva: 0.021,
      ganancias: 0.02,
      iibb: 0.03
    },
    retenciones: {
      iva: 0.021,
      ganancias: 0.02,
      iibb: 0.03
    },
    contribuciones: {
      seguridad_social: 0.21
    }
  }

  // Calcular impuestos de las facturas
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      calculateTaxes()
    }
  }, [invoices])

  const calculateTaxes = () => {
    const salesInvoices = invoices.filter(inv => inv.type === 'income')
    const purchaseInvoices = invoices.filter(inv => inv.type === 'expense')

    // Calcular IVA desde impuestos discriminados
    let ivaCollected = 0
    let ivaPaid = 0
    let gananciaTotal = 0
    let otrosImpuestos = []

    // Procesar facturas de venta
    salesInvoices.forEach(inv => {
      if (inv.taxes && inv.taxes.length > 0) {
        inv.taxes.forEach(tax => {
          if (tax.type === 'IVA') {
            ivaCollected += tax.amount
          } else if (tax.type === 'Ganancias') {
            gananciaTotal += tax.amount
          } else {
            const existing = otrosImpuestos.find(t => t.type === tax.type)
            if (existing) {
              existing.amount += tax.amount
            } else {
              otrosImpuestos.push({ ...tax })
            }
          }
        })
      } else {
        // Fallback: calcular IVA estimado si no hay impuestos discriminados
        ivaCollected += parseFloat(inv.amount) * 0.21 / 1.21
      }
    })

    // Procesar facturas de compra
    purchaseInvoices.forEach(inv => {
      if (inv.taxes && inv.taxes.length > 0) {
        inv.taxes.forEach(tax => {
          if (tax.type === 'IVA') {
            ivaPaid += tax.amount
          } else if (tax.type === 'Ganancias') {
            gananciaTotal += tax.amount
          } else {
            const existing = otrosImpuestos.find(t => t.type === tax.type)
            if (existing) {
              existing.amount += tax.amount
            } else {
              otrosImpuestos.push({ ...tax })
            }
          }
        })
      } else {
        // Fallback: calcular IVA estimado si no hay impuestos discriminados
        ivaPaid += parseFloat(inv.amount) * 0.21 / 1.21
      }
    })

    const ivaBalance = ivaCollected - ivaPaid

    // Si no hay ganancias discriminadas, estimar
    if (gananciaTotal === 0) {
      const totalSales = salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
      const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
      const profit = totalSales - totalPurchases
      gananciaTotal = profit > 0 ? profit * 0.35 : 0
    }

    setTaxData({
      iva: {
        collected: ivaCollected,
        paid: ivaPaid,
        balance: ivaBalance
      },
      ganancias: {
        estimated: gananciaTotal,
        rate: 35
      },
      otros: otrosImpuestos,
      total: ivaBalance + gananciaTotal + otrosImpuestos.reduce((sum, t) => sum + t.amount, 0)
    })
  }

  const generateTaxAnalysis = async () => {
    if (!invoices || invoices.length === 0) {
      alert('Necesitas cargar facturas primero')
      return
    }

    setLoading(true)

    const prompt = `Actúa como un experto contador impositivo argentino.

DATOS ACTUALES:
- IVA Débito Fiscal (ventas): $${taxData.iva.collected.toFixed(2)}
- IVA Crédito Fiscal (compras): $${taxData.iva.paid.toFixed(2)}
- Saldo IVA a Pagar: $${taxData.iva.balance.toFixed(2)}
- Impuesto a las Ganancias Estimado (35%): $${taxData.ganancias.estimated.toFixed(2)}
- Total Impuestos Estimados: $${taxData.total.toFixed(2)}

FACTURAS ANALIZADAS: ${invoices.length}
- Ventas: ${invoices.filter(i => i.type === 'income').length}
- Compras: ${invoices.filter(i => i.type === 'expense').length}

SOLICITUD:
1. Analiza mi situación impositiva actual
2. Genera proyecciones para los próximos ${projectionPeriod} meses
3. Identifica oportunidades de optimización fiscal
4. Recomienda estrategias para reducir carga impositiva
5. Alerta sobre obligaciones y vencimientos importantes

Genera un análisis completo con:
- Tabla de proyección mensual de IVA
- Estimación de Ganancias
- Calendario de vencimientos
- Recomendaciones específicas
- Alertas y riesgos`

    try {
      const response = await sendMessageToGPT(prompt, companyData, invoices, [])
      
      if (response.success) {
        setTaxAnalysis(response.message)
      } else {
        alert('Error: ' + response.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar análisis')
    } finally {
      setLoading(false)
    }
  }

  if (!companyData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Configura tu empresa primero
          </h3>
          <p className="text-gray-600">
            Completa los datos de tu empresa para gestionar impuestos
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Impuestos</h2>
          <p className="text-gray-600 mt-1">Análisis y proyecciones impositivas con IA</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">GPT-4 Turbo</span>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">IVA Débito</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${taxData.iva.collected.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">IVA en Ventas</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">IVA Crédito</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${taxData.iva.paid.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">IVA en Compras</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Saldo IVA</span>
            <div className={`w-10 h-10 ${taxData.iva.balance >= 0 ? 'bg-red-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
              <Calculator className="w-5 h-5 ${taxData.iva.balance >= 0 ? 'text-red-600' : 'text-green-600'}" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${taxData.iva.balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${Math.abs(taxData.iva.balance).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{taxData.iva.balance >= 0 ? 'A Pagar' : 'A Favor'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Ganancias Est.</span>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${taxData.ganancias.estimated.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Tasa {taxData.ganancias.rate}%</p>
        </div>
      </div>

      {/* Analysis Generator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Análisis Impositivo con IA</h3>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Proyección
            </label>
            <select
              value={projectionPeriod}
              onChange={(e) => setProjectionPeriod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none"
            >
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="12">12 meses (anual)</option>
            </select>
          </div>

          <div className="flex-1 flex items-end">
            <button
              onClick={generateTaxAnalysis}
              disabled={loading || !invoices || invoices.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generar Análisis con GPT-4</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Result */}
        {taxAnalysis && (
          <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Análisis Generado por GPT-4</h4>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                {taxAnalysis}
              </pre>
            </div>
          </div>
        )}

        {!taxAnalysis && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Haz clic en "Generar Análisis" para obtener proyecciones impositivas</p>
          </div>
        )}
      </div>

      {/* Tax Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Información Importante
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Los cálculos son estimaciones basadas en tus facturas cargadas</li>
          <li>• IVA calculado con tasa estándar del 21%</li>
          <li>• Ganancias estimado con tasa del 35% (puede variar según categoría)</li>
          <li>• Consulta con un contador para confirmación oficial</li>
          <li>• Las proyecciones son orientativas y pueden cambiar</li>
        </ul>
      </div>
    </div>
  )
}

export default TaxManagement
