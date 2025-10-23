import React, { useState } from 'react'
import { Info } from 'lucide-react'

const FinancialTooltip = ({ term, children, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const explanations = {
    // Métricas financieras básicas
    'roi': {
      title: 'ROI (Return on Investment)',
      description: 'Retorno sobre la Inversión. Mide la rentabilidad de una inversión. Se calcula como: (Ganancia - Costo) / Costo × 100. Por ejemplo, si invertiste $100 y ganaste $150, tu ROI es 50%.',
      example: 'Inversión: $10,000 → Ganancia: $15,000 → ROI: 50%'
    },
    'utilidad_neta': {
      title: 'Utilidad Neta',
      description: 'Es la ganancia real que queda después de restar todos los gastos, impuestos y costos. Es el dinero que realmente ganaste en tu negocio.',
      example: 'Ventas: $100,000 - Costos: $60,000 - Gastos: $20,000 = Utilidad Neta: $20,000'
    },
    'kpi': {
      title: 'KPI (Key Performance Indicator)',
      description: 'Indicador Clave de Rendimiento. Son métricas que miden el éxito de tu negocio. Ejemplos: ventas mensuales, clientes nuevos, margen de ganancia.',
      example: 'KPI de ventas: $50,000/mes → Meta: $60,000/mes'
    },
    'margen_bruto': {
      title: 'Margen Bruto',
      description: 'Diferencia entre el precio de venta y el costo del producto. Indica cuánto ganas por cada venta antes de gastos operativos.',
      example: 'Precio venta: $100 - Costo: $60 = Margen Bruto: $40 (40%)'
    },
    'margen_neto': {
      title: 'Margen Neto',
      description: 'Porcentaje de ganancia después de todos los gastos. Muestra cuánto de cada peso vendido es ganancia real.',
      example: 'Ventas: $100 → Utilidad Neta: $15 → Margen Neto: 15%'
    },
    'flujo_caja': {
      title: 'Flujo de Caja',
      description: 'Movimiento de dinero que entra y sale de tu negocio. Un flujo positivo significa que entra más dinero del que sale.',
      example: 'Ingresos: $50,000 - Egresos: $40,000 = Flujo: +$10,000'
    },
    'punto_equilibrio': {
      title: 'Punto de Equilibrio',
      description: 'Cantidad de ventas necesarias para cubrir todos los costos. A partir de este punto, empiezas a ganar dinero.',
      example: 'Costos fijos: $20,000 → Margen: 40% → Punto equilibrio: $50,000 en ventas'
    },
    'ebitda': {
      title: 'EBITDA',
      description: 'Ganancias antes de Intereses, Impuestos, Depreciación y Amortización. Mide la rentabilidad operativa del negocio.',
      example: 'Ingresos operativos sin contar gastos financieros ni impuestos'
    },
    'capital_trabajo': {
      title: 'Capital de Trabajo',
      description: 'Dinero disponible para operar el negocio día a día. Se calcula: Activos Corrientes - Pasivos Corrientes.',
      example: 'Efectivo + Inventario - Deudas a corto plazo'
    },
    'rotacion_inventario': {
      title: 'Rotación de Inventario',
      description: 'Cuántas veces vendes y repones tu inventario en un período. Mayor rotación = mejor gestión.',
      example: 'Ventas anuales: $120,000 / Inventario promedio: $20,000 = 6 veces al año'
    },
    'ticket_promedio': {
      title: 'Ticket Promedio',
      description: 'Monto promedio que gasta cada cliente por compra. Se calcula: Ventas Totales / Número de Transacciones.',
      example: 'Ventas: $50,000 / 200 clientes = Ticket promedio: $250'
    },
    'costo_adquisicion': {
      title: 'Costo de Adquisición de Cliente (CAC)',
      description: 'Cuánto gastas en marketing y ventas para conseguir un nuevo cliente.',
      example: 'Gasto marketing: $5,000 / 50 clientes nuevos = CAC: $100'
    },
    'valor_vida_cliente': {
      title: 'Valor de Vida del Cliente (LTV)',
      description: 'Ganancia total que genera un cliente durante toda su relación con tu negocio.',
      example: 'Compra promedio: $100 × 10 compras al año × 3 años = LTV: $3,000'
    },
    'tasa_conversion': {
      title: 'Tasa de Conversión',
      description: 'Porcentaje de visitantes o prospectos que se convierten en clientes.',
      example: '100 visitantes → 5 compras = Tasa de conversión: 5%'
    },
    'rentabilidad': {
      title: 'Rentabilidad',
      description: 'Capacidad de generar ganancias. Se mide como porcentaje de las ventas o inversión.',
      example: 'Utilidad: $20,000 / Ventas: $100,000 = Rentabilidad: 20%'
    },
    'liquidez': {
      title: 'Liquidez',
      description: 'Capacidad de pagar deudas a corto plazo con el dinero disponible.',
      example: 'Efectivo + Cuentas por cobrar / Deudas a corto plazo'
    },
    'apalancamiento': {
      title: 'Apalancamiento Financiero',
      description: 'Uso de deuda para financiar inversiones. Puede multiplicar ganancias pero también riesgos.',
      example: 'Capital propio: $50,000 + Préstamo: $50,000 = Inversión total: $100,000'
    },
    'depreciacion': {
      title: 'Depreciación',
      description: 'Pérdida de valor de un activo con el tiempo. Se usa para calcular el desgaste de equipos, vehículos, etc.',
      example: 'Computadora: $1,000 / 5 años = Depreciación: $200/año'
    },
    'activo': {
      title: 'Activo',
      description: 'Todo lo que posee tu empresa y tiene valor: efectivo, inventario, equipos, propiedades.',
      example: 'Efectivo: $10,000 + Inventario: $30,000 + Equipos: $20,000 = Activos: $60,000'
    },
    'pasivo': {
      title: 'Pasivo',
      description: 'Deudas y obligaciones de tu empresa: préstamos, cuentas por pagar, salarios pendientes.',
      example: 'Préstamo bancario: $20,000 + Proveedores: $5,000 = Pasivos: $25,000'
    },
    'patrimonio': {
      title: 'Patrimonio Neto',
      description: 'Valor real de tu empresa. Se calcula: Activos - Pasivos. Es lo que quedaría si vendieras todo y pagaras todas las deudas.',
      example: 'Activos: $60,000 - Pasivos: $25,000 = Patrimonio: $35,000'
    }
  }

  const info = explanations[term.toLowerCase().replace(/\s+/g, '_')]

  if (!info) {
    return children
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className="inline-flex items-center gap-1 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
        <Info className="w-3.5 h-3.5 text-gray-400 hover:text-cyan-600 transition-colors" />
      </div>
      
      {showTooltip && (
        <div className="absolute left-0 top-full mt-2 z-50 w-80 p-4 bg-gray-900 text-white text-sm rounded-lg shadow-2xl animate-fade-in">
          <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 transform rotate-45"></div>
          
          <h4 className="font-bold text-cyan-400 mb-2">{info.title}</h4>
          <p className="text-gray-200 mb-3 leading-relaxed">{info.description}</p>
          
          {info.example && (
            <div className="bg-gray-800 rounded-md p-2 border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Ejemplo:</p>
              <p className="text-xs text-cyan-300 font-mono">{info.example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FinancialTooltip
