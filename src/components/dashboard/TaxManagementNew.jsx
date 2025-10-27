import React, { useState, useMemo } from 'react'
import { Calculator, TrendingUp, AlertCircle, DollarSign, FileText, Building2, Percent, Download } from 'lucide-react'

const TaxManagement = ({ invoices, companyData }) => {
  const [condicionIVA, setCondicionIVA] = useState('responsable_inscripto')
  const [provincia, setProvincia] = useState('buenos_aires')
  const [tipoSociedad, setTipoSociedad] = useState('sociedades')

  // Alícuotas ARCA Argentina 2024
  const taxRates = {
    iva: { general: 0.21, reducido: 0.105, exento: 0 },
    iibb: {
      buenos_aires: 0.03, caba: 0.025, cordoba: 0.035,
      santa_fe: 0.03, mendoza: 0.03, otras: 0.03
    },
    ganancias: { sociedades: 0.35, monotributo: 0, autonomo: 0.35 },
    percepciones_iva: 0.021,
    percepciones_ganancias: 0.02,
    percepciones_iibb: 0.03,
    retenciones_iva: 0.021,
    retenciones_ganancias: 0.02,
    seguridad_social: 0.21
  }

  // Calcular impuestos basados en remitos y movimientos
  const taxCalculations = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return {
        iva: { debito: 0, credito: 0, saldo: 0, percepciones: 0, retenciones: 0 },
        iibb: { total: 0, percepciones: 0, retenciones: 0 },
        ganancias: { estimado: 0, percepciones: 0, retenciones: 0, anticipo: 0 },
        seguridad_social: 0,
        total_a_pagar: 0
      }
    }

    let ivaDebito = 0
    let ivaCredito = 0
    let ivaPercepciones = 0
    let ivaRetenciones = 0
    let iibbTotal = 0
    let iibbPercepciones = 0
    let iibbRetenciones = 0
    let gananciasBruto = 0
    let gananciasPercepciones = 0
    let gananciasRetenciones = 0
    let seguridadSocial = 0

    invoices.forEach(inv => {
      const amount = parseFloat(inv.amount) || 0
      const metadata = inv.metadata || {}

      // Si viene de remito con análisis de IA
      if (metadata.fromRemito && metadata.subtotal) {
        if (inv.type === 'income') {
          ivaDebito += metadata.iva || 0
          iibbTotal += metadata.iibb || 0
          gananciasBruto += metadata.subtotal || 0
        } else {
          ivaCredito += metadata.iva || 0
          iibbTotal += metadata.iibb || 0
        }
        ivaPercepciones += metadata.percepciones || 0
      } else {
        // Cálculo estándar para movimientos sin remito
        const subtotal = amount / (1 + taxRates.iva.general)
        
        if (inv.type === 'income') {
          // Ventas
          if (condicionIVA === 'responsable_inscripto') {
            ivaDebito += subtotal * taxRates.iva.general
          }
          iibbTotal += subtotal * (taxRates.iibb[provincia] || taxRates.iibb.otras)
          gananciasBruto += subtotal
          
          // Percepciones en ventas
          ivaPercepciones += subtotal * taxRates.percepciones_iva
          iibbPercepciones += subtotal * taxRates.percepciones_iibb
        } else {
          // Compras
          if (condicionIVA === 'responsable_inscripto') {
            ivaCredito += subtotal * taxRates.iva.general
          }
          
          // Retenciones en compras
          ivaRetenciones += subtotal * taxRates.retenciones_iva
          gananciasRetenciones += subtotal * taxRates.retenciones_ganancias
          iibbRetenciones += subtotal * taxRates.percepciones_iibb
        }
      }

      // Seguridad Social (solo sobre sueldos)
      if (inv.category === 'Sueldos') {
        seguridadSocial += amount * taxRates.seguridad_social
      }
    })

    const ivaSaldo = ivaDebito - ivaCredito - ivaRetenciones
    const gananciasEstimado = gananciasBruto * (taxRates.ganancias[tipoSociedad] || 0.35)
    const gananciasAnticipo = gananciasEstimado / 12 // Anticipo mensual
    const totalAPagar = Math.max(0, ivaSaldo) + iibbTotal + gananciasAnticipo + seguridadSocial

    return {
      iva: {
        debito: ivaDebito,
        credito: ivaCredito,
        saldo: ivaSaldo,
        percepciones: ivaPercepciones,
        retenciones: ivaRetenciones
      },
      iibb: {
        total: iibbTotal,
        percepciones: iibbPercepciones,
        retenciones: iibbRetenciones
      },
      ganancias: {
        estimado: gananciasEstimado,
        percepciones: gananciasPercepciones,
        retenciones: gananciasRetenciones,
        anticipo: gananciasAnticipo
      },
      seguridad_social: seguridadSocial,
      total_a_pagar: totalAPagar
    }
  }, [invoices, condicionIVA, provincia, tipoSociedad])

  const downloadReport = () => {
    const reportDate = new Date().toLocaleDateString('es-AR')
    const companyName = companyData?.name || 'Mi Empresa'
    
    const reportContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte Impositivo ARCA</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1f2937; border-bottom: 3px solid #111827; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
            .company { font-size: 28px; font-weight: bold; color: #111827; }
            .total { font-weight: bold; background-color: #f9fafb; font-size: 18px; }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">${companyName}</div>
            <div>Reporte Impositivo ARCA - ${reportDate}</div>
          </div>
          
          <h1>Resumen Impositivo</h1>
          <table>
            <tr><th>Concepto</th><th>Monto</th></tr>
            <tr><td>IVA Débito Fiscal</td><td class="positive">$${taxCalculations.iva.debito.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>IVA Crédito Fiscal</td><td class="negative">$${taxCalculations.iva.credito.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>IVA Retenciones</td><td class="negative">$${taxCalculations.iva.retenciones.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr class="total"><td>Saldo IVA a Pagar</td><td class="${taxCalculations.iva.saldo >= 0 ? 'negative' : 'positive'}">$${Math.abs(taxCalculations.iva.saldo).toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>

          <h2>Ingresos Brutos (IIBB)</h2>
          <table>
            <tr><th>Concepto</th><th>Monto</th></tr>
            <tr><td>IIBB Total (${provincia})</td><td class="negative">$${taxCalculations.iibb.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Percepciones IIBB</td><td>$${taxCalculations.iibb.percepciones.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Retenciones IIBB</td><td>$${taxCalculations.iibb.retenciones.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>

          <h2>Impuesto a las Ganancias</h2>
          <table>
            <tr><th>Concepto</th><th>Monto</th></tr>
            <tr><td>Ganancias Estimado Anual</td><td class="negative">$${taxCalculations.ganancias.estimado.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Anticipo Mensual</td><td class="negative">$${taxCalculations.ganancias.anticipo.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Retenciones Ganancias</td><td>$${taxCalculations.ganancias.retenciones.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>

          <h2>Contribuciones Patronales</h2>
          <table>
            <tr><th>Concepto</th><th>Monto</th></tr>
            <tr><td>Seguridad Social (21%)</td><td class="negative">$${taxCalculations.seguridad_social.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>

          <h2>Total a Pagar</h2>
          <table>
            <tr class="total"><td>TOTAL IMPUESTOS</td><td class="negative">$${taxCalculations.total_a_pagar.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([reportContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_impositivo_${reportDate}.html`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            <span className="text-cyan-600">Gestión Impositiva</span> ARCA
          </h1>
          <p className="text-sm text-gray-600">Sistema regulatorio argentino completo</p>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar Reporte
        </button>
      </div>

      {/* Configuración */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          <span className="text-cyan-600">Configuración</span> <span className="text-gray-900">Impositiva</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Condición IVA</label>
            <select value={condicionIVA} onChange={(e) => setCondicionIVA(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none">
              <option value="responsable_inscripto">Responsable Inscripto</option>
              <option value="monotributo">Monotributo</option>
              <option value="exento">Exento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Provincia (IIBB)</label>
            <select value={provincia} onChange={(e) => setProvincia(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none">
              <option value="buenos_aires">Buenos Aires (3%)</option>
              <option value="caba">CABA (2.5%)</option>
              <option value="cordoba">Córdoba (3.5%)</option>
              <option value="santa_fe">Santa Fe (3%)</option>
              <option value="mendoza">Mendoza (3%)</option>
              <option value="otras">Otras (3%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Sociedad</label>
            <select value={tipoSociedad} onChange={(e) => setTipoSociedad(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none">
              <option value="sociedades">Sociedades (35%)</option>
              <option value="autonomo">Autónomo (35%)</option>
              <option value="monotributo">Monotributo (0%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* IVA */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5" />
          Impuesto al Valor Agregado (IVA)
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Débito Fiscal</p>
            <p className="text-2xl font-bold text-green-600">
              ${taxCalculations.iva.debito.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Crédito Fiscal</p>
            <p className="text-2xl font-bold text-blue-600">
              ${taxCalculations.iva.credito.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Retenciones</p>
            <p className="text-2xl font-bold text-purple-600">
              ${taxCalculations.iva.retenciones.toLocaleString('es-AR')}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${taxCalculations.iva.saldo >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-sm text-gray-600 mb-1">Saldo</p>
            <p className={`text-2xl font-bold ${taxCalculations.iva.saldo >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(taxCalculations.iva.saldo).toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-gray-600">{taxCalculations.iva.saldo >= 0 ? 'A Pagar' : 'A Favor'}</p>
          </div>
        </div>
      </div>

      {/* IIBB */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Ingresos Brutos (IIBB)
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total IIBB</p>
            <p className="text-2xl font-bold text-orange-600">
              ${taxCalculations.iibb.total.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Percepciones</p>
            <p className="text-2xl font-bold text-yellow-600">
              ${taxCalculations.iibb.percepciones.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Retenciones</p>
            <p className="text-2xl font-bold text-amber-600">
              ${taxCalculations.iibb.retenciones.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Ganancias */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Impuesto a las Ganancias
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Estimado Anual</p>
            <p className="text-2xl font-bold text-indigo-600">
              ${taxCalculations.ganancias.estimado.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="bg-violet-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Anticipo Mensual</p>
            <p className="text-2xl font-bold text-violet-600">
              ${taxCalculations.ganancias.anticipo.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Retenciones</p>
            <p className="text-2xl font-bold text-purple-600">
              ${taxCalculations.ganancias.retenciones.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {/* Seguridad Social */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Contribuciones Patronales
        </h3>
        <div className="bg-teal-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Seguridad Social (21%)</p>
          <p className="text-2xl font-bold text-teal-600">
            ${taxCalculations.seguridad_social.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 mb-2">Total Impuestos a Pagar</p>
            <p className="text-4xl font-bold">
              ${taxCalculations.total_a_pagar.toLocaleString('es-AR')}
            </p>
          </div>
          <Calculator className="w-16 h-16 text-gray-400" />
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Información ARCA Argentina
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>IVA:</strong> Tasa general 21%, reducida 10.5%</li>
          <li>• <strong>IIBB:</strong> Varía según provincia (2.5% - 3.5%)</li>
          <li>• <strong>Ganancias:</strong> Sociedades 35%, Autónomos 35%</li>
          <li>• <strong>Percepciones IVA:</strong> 2.1% sobre ventas</li>
          <li>• <strong>Retenciones:</strong> Aplicables según régimen</li>
          <li>• <strong>Seguridad Social:</strong> 21% sobre sueldos</li>
          <li>• Los cálculos se basan en remitos analizados por IA y movimientos registrados</li>
        </ul>
      </div>
    </div>
  )
}

export default TaxManagement
