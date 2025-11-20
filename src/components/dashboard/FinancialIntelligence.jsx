import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, 
  Target, DollarSign, PieChart, BarChart3, Activity, Lightbulb,
  ArrowUpRight, ArrowDownRight, Shield, Briefcase, LineChart,
  Calendar, Users, ShoppingCart, CreditCard, Percent, Award,
  Brain, Sparkles, ChevronRight, Info, Package, TrendingUpIcon,
  Clock, ArrowLeft, Receipt, FileText, AlertCircle, Building2
} from 'lucide-react'
import FinancialTooltip from './FinancialTooltip'
import DolarCard from './DolarCard'
import AnalisisVisual from './AnalisisVisual'
import { useData } from '../../context/DataContext'

const FinancialIntelligence = ({ invoices, companyData }) => {
  const { inventoryItems } = useData()
  const [kpis, setKpis] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('metrics') // 'metrics' o 'charts'
  const [analysisType, setAnalysisType] = useState(null) // null = selector, 'clientes', 'productos', 'ventas', 'financiero', 'proveedores'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [clientAnalysis, setClientAnalysis] = useState(null)
  const [financialViewMode, setFinancialViewMode] = useState('metricas') // 'metricas' o 'graficos'
  const [periodType, setPeriodType] = useState('general') // 'general', 'mes', 'rango'
  const [startMonth, setStartMonth] = useState(new Date().getMonth())
  const [startYear, setStartYear] = useState(new Date().getFullYear())
  const [endMonth, setEndMonth] = useState(new Date().getMonth())
  const [endYear, setEndYear] = useState(new Date().getFullYear())
  const [promedioType, setPromedioType] = useState('mes') // 'dia', 'mes', 'año'
  const [financialMetrics, setFinancialMetrics] = useState(null)
  const [salesMetrics, setSalesMetrics] = useState(null)
  const [salesViewMode, setSalesViewMode] = useState('metricas') // 'metricas' o 'graficos'
  const [salesPeriodType, setSalesPeriodType] = useState('general') // 'general', 'mes', 'rango'
  const [salesStartMonth, setSalesStartMonth] = useState(new Date().getMonth())
  const [salesStartYear, setSalesStartYear] = useState(new Date().getFullYear())
  const [salesEndMonth, setSalesEndMonth] = useState(new Date().getMonth())
  const [salesEndYear, setSalesEndYear] = useState(new Date().getFullYear())
  const [salesEvolutionType, setSalesEvolutionType] = useState('mes') // 'dia', 'mes', 'año'
  const [salesDistributionType, setSalesDistributionType] = useState('semana') // 'dia_semana', 'semana_mes', 'mes_año'
  const [productViewMode, setProductViewMode] = useState('metricas') // 'metricas' o 'graficos'
  const [searchProductUnidades, setSearchProductUnidades] = useState('')
  const [searchProductFacturacion, setSearchProductFacturacion] = useState('')
  const [showSuggestionsUnidades, setShowSuggestionsUnidades] = useState(false)
  const [showSuggestionsFacturacion, setShowSuggestionsFacturacion] = useState(false)
  const [searchCliente, setSearchCliente] = useState('')
  const [showSuggestionsClientes, setShowSuggestionsClientes] = useState(false)
  const [proveedorViewMode, setProveedorViewMode] = useState('metricas') // 'metricas' o 'graficos'
  const [searchProveedor, setSearchProveedor] = useState('')
  const [showSuggestionsProveedores, setShowSuggestionsProveedores] = useState(false)
  const [categoriaSeleccionadaMarcas, setCategoriaSeleccionadaMarcas] = useState('todas')
  const [categoriaSeleccionadaModelos, setCategoriaSeleccionadaModelos] = useState('todas')
  const [periodoRentabilidad, setPeriodoRentabilidad] = useState('6') // meses
  const [periodoGastos, setPeriodoGastos] = useState('general') // 'general', 'mes', 'varios'
  const [mesesGastos, setMesesGastos] = useState('3') // para 'varios' meses
  const [categoriaEquilibrio, setCategoriaEquilibrio] = useState('todas') // para punto de equilibrio
  const [periodoDeudas, setPeriodoDeudas] = useState('general') // 'general', 'mes', 'varios'
  const [mesesDeudas, setMesesDeudas] = useState('3') // para 'varios' meses

  useEffect(() => {
    calculateKPIs()
    generateRecommendations()
    if (analysisType === 'clientes') {
      calculateClientAnalysis()
    }
    if (analysisType === 'financiero') {
      calculateFinancialMetrics()
    }
    if (analysisType === 'ventas') {
      calculateSalesMetrics()
    }
  }, [invoices, analysisType, selectedMonth, selectedYear, periodType, startMonth, startYear, endMonth, endYear, promedioType, salesPeriodType, salesStartMonth, salesStartYear, salesEndMonth, salesEndYear])

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

    // Análisis de compras y ventas
    const compras = invoices.filter(inv => inv.metadata?.movementType === 'compra')
    const ventas = invoices.filter(inv => inv.metadata?.movementType === 'venta')
    const totalCompras = compras.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const totalVentas = ventas.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    
    const porcentajeCompras = totalIncome > 0 ? (totalCompras / totalIncome) * 100 : 0
    const porcentajeVentas = totalIncome > 0 ? (totalVentas / totalIncome) * 100 : 0
    
    // Análisis de clientes
    const clientes = new Set(ventas.map(v => v.metadata?.cliente).filter(Boolean))
    const clientesUnicos = clientes.size
    const ventaPromedioPorCliente = clientesUnicos > 0 ? totalVentas / clientesUnicos : 0
    
    // Análisis de proveedores
    const proveedores = new Set(compras.map(c => c.metadata?.provider).filter(Boolean))
    const proveedoresUnicos = proveedores.size
    const compraPromedioPorProveedor = proveedoresUnicos > 0 ? totalCompras / proveedoresUnicos : 0

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
      // Nuevos KPIs
      totalCompras,
      totalVentas,
      porcentajeCompras,
      porcentajeVentas,
      clientesUnicos,
      ventaPromedioPorCliente,
      proveedoresUnicos,
      compraPromedioPorProveedor,
      cantidadCompras: compras.length,
      cantidadVentas: ventas.length
    })

    setLoading(false)
  }

  const calculateClientAnalysis = () => {
    if (!invoices || invoices.length === 0) return

    const ventas = invoices.filter(inv => inv.type === 'income' && inv.metadata?.movementType === 'venta')
    
    // Agrupar ventas por cliente
    const clientesMap = {}
    ventas.forEach(venta => {
      const cliente = venta.metadata?.cliente || 'Sin cliente'
      const fecha = new Date(venta.date)
      const medioPago = venta.metadata?.paymentMethod || 'No especificado'
      const monto = parseFloat(venta.amount || 0)
      
      if (!clientesMap[cliente]) {
        clientesMap[cliente] = {
          nombre: cliente,
          compras: [],
          totalGastado: 0,
          cantidadCompras: 0,
          mediosPago: {},
          fechas: []
        }
      }
      
      clientesMap[cliente].compras.push({
        fecha,
        monto,
        medioPago,
        productos: venta.metadata?.productos || []
      })
      clientesMap[cliente].totalGastado += monto
      clientesMap[cliente].cantidadCompras++
      clientesMap[cliente].fechas.push(fecha)
      
      // Contar medios de pago
      if (!clientesMap[cliente].mediosPago[medioPago]) {
        clientesMap[cliente].mediosPago[medioPago] = 0
      }
      clientesMap[cliente].mediosPago[medioPago]++
    })

    // Calcular métricas por cliente
    const clientesArray = Object.values(clientesMap).map(cliente => {
      // Ordenar fechas
      cliente.fechas.sort((a, b) => a - b)
      
      // Calcular tiempo promedio entre compras
      let tiempoPromedioEntreCompras = 0
      if (cliente.fechas.length > 1) {
        const diferencias = []
        for (let i = 1; i < cliente.fechas.length; i++) {
          const diff = (cliente.fechas[i] - cliente.fechas[i - 1]) / (1000 * 60 * 60 * 24) // días
          diferencias.push(diff)
        }
        tiempoPromedioEntreCompras = diferencias.reduce((sum, val) => sum + val, 0) / diferencias.length
      }
      
      // Calcular unidades totales
      let unidadesTotales = 0
      cliente.compras.forEach(compra => {
        compra.productos.forEach(prod => {
          unidadesTotales += parseFloat(prod.cantidad || 0)
        })
      })
      
      return {
        ...cliente,
        ticketPromedio: cliente.totalGastado / cliente.cantidadCompras,
        tiempoPromedioEntreCompras,
        ultimaCompra: cliente.fechas[cliente.fechas.length - 1],
        unidadesTotales,
        esRecurrente: cliente.cantidadCompras > 1
      }
    })

    // Total de ventas para calcular porcentajes
    const totalVentas = clientesArray.reduce((sum, c) => sum + c.totalGastado, 0)

    // Top 10 clientes
    const top10Clientes = clientesArray
      .sort((a, b) => b.totalGastado - a.totalGastado)
      .slice(0, 10)
      .map((cliente, index) => ({
        ...cliente,
        posicion: index + 1,
        porcentajeSobreTotal: totalVentas > 0 ? (cliente.totalGastado / totalVentas) * 100 : 0
      }))

    // Clientes no recurrentes
    const clientesNoRecurrentes = clientesArray.filter(c => !c.esRecurrente)

    // Métricas generales
    const totalClientes = clientesArray.length
    const clientesRecurrentes = clientesArray.filter(c => c.esRecurrente).length
    const ticketPromedio = totalClientes > 0 ? totalVentas / totalClientes : 0
    const comprasPromedioPorCliente = totalClientes > 0 
      ? clientesArray.reduce((sum, c) => sum + c.cantidadCompras, 0) / totalClientes 
      : 0
    
    const tiemposEntreCompras = clientesArray
      .filter(c => c.tiempoPromedioEntreCompras > 0)
      .map(c => c.tiempoPromedioEntreCompras)
    const tiempoPromedioGlobal = tiemposEntreCompras.length > 0
      ? tiemposEntreCompras.reduce((sum, val) => sum + val, 0) / tiemposEntreCompras.length
      : 0

    // Nuevos clientes por mes
    const clientesPorMes = {}
    clientesArray.forEach(cliente => {
      const primeraCompra = cliente.fechas[0]
      const mesAno = `${primeraCompra.getFullYear()}-${primeraCompra.getMonth()}`
      if (!clientesPorMes[mesAno]) {
        clientesPorMes[mesAno] = { nuevos: 0, recurrentes: 0 }
      }
      clientesPorMes[mesAno].nuevos++
    })

    // Clientes nuevos vs recurrentes por mes seleccionado
    const ventasDelMes = ventas.filter(v => {
      const fecha = new Date(v.date)
      return fecha.getMonth() === selectedMonth && fecha.getFullYear() === selectedYear
    })

    const clientesDelMes = new Set()
    const clientesNuevosDelMes = new Set()
    const clientesRecurrentesDelMes = new Set()

    ventasDelMes.forEach(venta => {
      const cliente = venta.metadata?.cliente || 'Sin cliente'
      clientesDelMes.add(cliente)
      
      // Verificar si es nuevo (primera compra en este mes)
      const clienteData = clientesMap[cliente]
      if (clienteData) {
        const primeraCompra = clienteData.fechas[0]
        const esNuevo = primeraCompra.getMonth() === selectedMonth && primeraCompra.getFullYear() === selectedYear
        
        if (esNuevo) {
          clientesNuevosDelMes.add(cliente)
        } else {
          clientesRecurrentesDelMes.add(cliente)
        }
      }
    })

    // Distribución de medios de pago
    const mediosPagoGlobal = {}
    clientesArray.forEach(cliente => {
      Object.entries(cliente.mediosPago).forEach(([medio, cantidad]) => {
        if (!mediosPagoGlobal[medio]) {
          mediosPagoGlobal[medio] = 0
        }
        mediosPagoGlobal[medio] += cantidad
      })
    })

    const totalTransacciones = Object.values(mediosPagoGlobal).reduce((sum, val) => sum + val, 0)
    const mediosPagoDistribucion = Object.entries(mediosPagoGlobal).map(([medio, cantidad]) => ({
      nombre: medio,
      cantidad,
      porcentaje: totalTransacciones > 0 ? (cantidad / totalTransacciones) * 100 : 0
    }))

    // Obtener el mes actual para nuevos clientes
    const mesActual = `${selectedYear}-${selectedMonth}`
    const nuevosClientesMesActual = clientesPorMes[mesActual]?.nuevos || 0

    // Calcular clientes activos (último mes)
    const haceUnMes = new Date()
    haceUnMes.setMonth(haceUnMes.getMonth() - 1)
    
    const clientesActivosUltimoMes = new Set()
    ventas.forEach(venta => {
      const fechaVenta = new Date(venta.date)
      if (fechaVenta >= haceUnMes) {
        const cliente = venta.metadata?.cliente || 'Sin cliente'
        clientesActivosUltimoMes.add(cliente)
      }
    })

    setClientAnalysis({
      totalClientes,
      clientesRecurrentes,
      ticketPromedio,
      comprasPromedioPorCliente,
      tiempoPromedioGlobal,
      top10Clientes,
      clientesNoRecurrentes,
      nuevosClientesMesActual,
      clientesPorMes,
      clientesNuevosDelMes: clientesNuevosDelMes.size,
      clientesRecurrentesDelMes: clientesRecurrentesDelMes.size,
      mediosPagoDistribucion,
      clientesActivos: clientesActivosUltimoMes.size
    })
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

  const calculateFinancialMetrics = () => {
    if (!invoices || invoices.length === 0) {
      setFinancialMetrics(null)
      return
    }

    // Filtrar facturas según el período seleccionado
    let filteredInvoices = [...invoices]
    
    if (periodType === 'mes') {
      filteredInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date)
        return invDate.getMonth() === startMonth && invDate.getFullYear() === startYear
      })
    } else if (periodType === 'rango') {
      filteredInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date)
        const start = new Date(startYear, startMonth, 1)
        const end = new Date(endYear, endMonth + 1, 0)
        return invDate >= start && invDate <= end
      })
    }

    // Separar por tipo
    const ventas = filteredInvoices.filter(inv => inv.type === 'income' && inv.metadata?.movementType === 'venta')
    const compras = filteredInvoices.filter(inv => inv.type === 'expense' && inv.metadata?.movementType === 'compra')
    const gastos = filteredInvoices.filter(inv => inv.type === 'expense' && inv.metadata?.movementType === 'gasto')
    const deudas = filteredInvoices.filter(inv => inv.metadata?.estadoPago === 'pendiente' || inv.metadata?.estadoPago === 'parcial')

    // Calcular totales
    const ingresosTotales = ventas.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const costosProductos = compras.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const gastosTotales = gastos.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)

    // Ganancias
    const gananciaBruta = ingresosTotales - costosProductos
    const gananciaNeta = gananciaBruta - gastosTotales

    // Márgenes
    const margenBruto = ingresosTotales > 0 ? (gananciaBruta / ingresosTotales) * 100 : 0
    const margenNeto = ingresosTotales > 0 ? (gananciaNeta / ingresosTotales) * 100 : 0
    const rentabilidadTotal = ingresosTotales > 0 ? (gananciaNeta / ingresosTotales) * 100 : 0

    // ROI
    const totalInversion = costosProductos + gastosTotales
    const roi = totalInversion > 0 ? (gananciaNeta / totalInversion) * 100 : 0

    // Ratio de liquidez (activos corrientes / pasivos corrientes)
    const activosCorrientes = ingresosTotales
    const pasivosCorrientes = costosProductos + gastosTotales
    const ratioLiquidez = pasivosCorrientes > 0 ? activosCorrientes / pasivosCorrientes : 0

    // Flujo de caja
    const flujoCaja = gananciaNeta

    // Endeudamiento
    const totalDeudas = deudas.reduce((sum, inv) => {
      const monto = parseFloat(inv.amount || 0)
      const pagado = parseFloat(inv.metadata?.montoPagado || 0)
      return sum + (monto - pagado)
    }, 0)
    const porcentajeEndeudamiento = ingresosTotales > 0 ? (totalDeudas / ingresosTotales) * 100 : 0

    // Capacidad de pago promedio
    const ventasPendientes = deudas.filter(d => d.type === 'income')
    const comprasPendientes = deudas.filter(d => d.type === 'expense')
    
    let diasPromedioCobro = 0
    if (ventasPendientes.length > 0) {
      const diasTotales = ventasPendientes.reduce((sum, inv) => {
        const fechaVenta = new Date(inv.date)
        const hoy = new Date()
        const dias = Math.floor((hoy - fechaVenta) / (1000 * 60 * 60 * 24))
        return sum + dias
      }, 0)
      diasPromedioCobro = diasTotales / ventasPendientes.length
    }

    let diasPromedioPago = 0
    if (comprasPendientes.length > 0) {
      const diasTotales = comprasPendientes.reduce((sum, inv) => {
        const fechaCompra = new Date(inv.date)
        const hoy = new Date()
        const dias = Math.floor((hoy - fechaCompra) / (1000 * 60 * 60 * 24))
        return sum + dias
      }, 0)
      diasPromedioPago = diasTotales / comprasPendientes.length
    }

    // Punto de equilibrio
    const costosVariables = costosProductos
    const costosFijos = gastosTotales
    const margenContribucion = ingresosTotales > 0 ? (ingresosTotales - costosVariables) / ingresosTotales : 0
    const puntoEquilibrio = margenContribucion > 0 ? costosFijos / margenContribucion : 0

    // Promedio de ingresos
    let promedioIngresos = 0
    if (promedioType === 'dia') {
      const dias = filteredInvoices.length > 0 ? 
        Math.max(1, Math.floor((new Date(Math.max(...filteredInvoices.map(i => new Date(i.date)))) - 
                                 new Date(Math.min(...filteredInvoices.map(i => new Date(i.date))))) / (1000 * 60 * 60 * 24))) : 1
      promedioIngresos = ingresosTotales / dias
    } else if (promedioType === 'mes') {
      const meses = periodType === 'general' ? 
        Math.max(1, Math.ceil((new Date() - new Date(Math.min(...invoices.map(i => new Date(i.date))))) / (1000 * 60 * 60 * 24 * 30))) : 1
      promedioIngresos = ingresosTotales / meses
    } else if (promedioType === 'año') {
      const años = periodType === 'general' ? 
        Math.max(1, Math.ceil((new Date() - new Date(Math.min(...invoices.map(i => new Date(i.date))))) / (1000 * 60 * 60 * 24 * 365))) : 1
      promedioIngresos = ingresosTotales / años
    }

    // Evolución mensual para gráficos
    const evolucionMensual = {}
    filteredInvoices.forEach(inv => {
      const date = new Date(inv.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!evolucionMensual[key]) {
        evolucionMensual[key] = { ingresos: 0, costos: 0, gastos: 0, gananciaBruta: 0, gananciaNeta: 0 }
      }
      
      if (inv.type === 'income' && inv.metadata?.movementType === 'venta') {
        evolucionMensual[key].ingresos += parseFloat(inv.amount || 0)
      } else if (inv.type === 'expense' && inv.metadata?.movementType === 'compra') {
        evolucionMensual[key].costos += parseFloat(inv.amount || 0)
      } else if (inv.type === 'expense' && inv.metadata?.movementType === 'gasto') {
        evolucionMensual[key].gastos += parseFloat(inv.amount || 0)
      }
      
      // Ganancia Bruta = Ingresos - Costos de productos
      evolucionMensual[key].gananciaBruta = evolucionMensual[key].ingresos - evolucionMensual[key].costos
      // Ganancia Neta = Ganancia Bruta - Gastos operativos
      evolucionMensual[key].gananciaNeta = evolucionMensual[key].gananciaBruta - evolucionMensual[key].gastos
    })

    const evolucionData = Object.entries(evolucionMensual)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, data]) => ({ mes, ...data }))

    setFinancialMetrics({
      ingresosTotales,
      promedioIngresos,
      gastosTotales,
      gananciaBruta,
      gananciaNeta,
      margenBruto,
      margenNeto,
      rentabilidadTotal,
      roi,
      ratioLiquidez,
      flujoCaja,
      porcentajeEndeudamiento,
      diasPromedioCobro,
      diasPromedioPago,
      puntoEquilibrio,
      evolucionData,
      costosProductos
    })
  }

  const calculateSalesMetrics = () => {
    if (!invoices || invoices.length === 0) return

    // Filtrar ventas
    const todasLasVentas = invoices.filter(inv => inv.type === 'income' && inv.metadata?.movementType === 'venta')
    
    // Filtrar por período
    let filteredSales = todasLasVentas
    if (salesPeriodType === 'mes') {
      filteredSales = todasLasVentas.filter(inv => {
        const date = new Date(inv.date)
        return date.getMonth() === salesStartMonth && date.getFullYear() === salesStartYear
      })
    } else if (salesPeriodType === 'rango') {
      filteredSales = todasLasVentas.filter(inv => {
        const date = new Date(inv.date)
        const startDate = new Date(salesStartYear, salesStartMonth, 1)
        const endDate = new Date(salesEndYear, salesEndMonth + 1, 0)
        return date >= startDate && date <= endDate
      })
    }

    // Ventas totales ($)
    const ventasTotales = filteredSales.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)

    // Crecimiento mensual - comparar período seleccionado con el anterior
    let crecimientoMensual = 0
    
    if (salesPeriodType === 'mes') {
      // Comparar el mes seleccionado con el mes anterior
      const ventasMesSeleccionado = ventasTotales
      
      // Calcular mes anterior
      let mesAnterior = salesStartMonth - 1
      let yearAnterior = salesStartYear
      if (mesAnterior < 0) {
        mesAnterior = 11
        yearAnterior -= 1
      }
      
      const ventasMesAnterior = todasLasVentas.filter(inv => {
        const date = new Date(inv.date)
        return date.getMonth() === mesAnterior && date.getFullYear() === yearAnterior
      }).reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
      
      crecimientoMensual = ventasMesAnterior > 0 ? ((ventasMesSeleccionado - ventasMesAnterior) / ventasMesAnterior) * 100 : 0
    } else if (salesPeriodType === 'rango') {
      // Para rango, comparar con el período anterior de igual duración
      const startDate = new Date(salesStartYear, salesStartMonth, 1)
      const endDate = new Date(salesEndYear, salesEndMonth + 1, 0)
      const diffMonths = (salesEndYear - salesStartYear) * 12 + (salesEndMonth - salesStartMonth) + 1
      
      // Calcular período anterior
      const prevEndMonth = salesStartMonth - 1
      const prevEndYear = prevEndMonth < 0 ? salesStartYear - 1 : salesStartYear
      const prevEndMonthAdjusted = prevEndMonth < 0 ? 11 : prevEndMonth
      
      const prevStartMonth = prevEndMonthAdjusted - diffMonths + 1
      const prevStartYear = prevStartMonth < 0 ? prevEndYear - 1 : prevEndYear
      const prevStartMonthAdjusted = prevStartMonth < 0 ? 12 + prevStartMonth : prevStartMonth
      
      const ventasPeriodoAnterior = todasLasVentas.filter(inv => {
        const date = new Date(inv.date)
        const prevStart = new Date(prevStartYear, prevStartMonthAdjusted, 1)
        const prevEnd = new Date(prevEndYear, prevEndMonthAdjusted + 1, 0)
        return date >= prevStart && date <= prevEnd
      }).reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
      
      crecimientoMensual = ventasPeriodoAnterior > 0 ? ((ventasTotales - ventasPeriodoAnterior) / ventasPeriodoAnterior) * 100 : 0
    } else {
      // Para general, comparar últimos 30 días con los 30 anteriores
      const hoy = new Date()
      const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
      const hace60Dias = new Date(hoy.getTime() - 60 * 24 * 60 * 60 * 1000)
      
      const ventasUltimos30 = todasLasVentas.filter(inv => {
        const date = new Date(inv.date)
        return date >= hace30Dias && date <= hoy
      }).reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
      
      const ventas30Anteriores = todasLasVentas.filter(inv => {
        const date = new Date(inv.date)
        return date >= hace60Dias && date < hace30Dias
      }).reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
      
      crecimientoMensual = ventas30Anteriores > 0 ? ((ventasUltimos30 - ventas30Anteriores) / ventas30Anteriores) * 100 : 0
    }

    // Ventas minoristas y mayoristas (con soporte para productos sin tipo)
    const ventasMinoristas = filteredSales.filter(inv => inv.metadata?.tipoVenta === 'minorista')
    const ventasMayoristas = filteredSales.filter(inv => inv.metadata?.tipoVenta === 'mayorista')
    const ventasSinTipo = filteredSales.filter(inv => !inv.metadata?.tipoVenta || (inv.metadata?.tipoVenta !== 'minorista' && inv.metadata?.tipoVenta !== 'mayorista'))
    const totalMinorista = ventasMinoristas.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const totalMayorista = ventasMayoristas.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const totalSinTipo = ventasSinTipo.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    
    const tipoPredominante = totalMinorista > totalMayorista ? 'Minorista' : 'Mayorista'

    // Cantidad de transacciones
    const cantidadVentas = filteredSales.length

    // Unidades vendidas totales
    const unidadesVendidas = filteredSales.reduce((sum, inv) => {
      const productos = inv.metadata?.productos || []
      return sum + productos.reduce((pSum, p) => pSum + (parseFloat(p.cantidad) || 0), 0)
    }, 0)

    // Ticket promedio
    const ticketPromedio = cantidadVentas > 0 ? ventasTotales / cantidadVentas : 0

    // Promedio de unidades por venta
    const promedioUnidadesPorVenta = cantidadVentas > 0 ? unidadesVendidas / cantidadVentas : 0

    // Descuentos totales
    const descuentosTotales = filteredSales.reduce((sum, inv) => {
      const productos = inv.metadata?.productos || []
      return sum + productos.reduce((pSum, p) => {
        const cantidad = parseFloat(p.cantidad) || 0
        const precioUnitario = parseFloat(p.precioUnitario) || 0
        const descuento = parseFloat(p.descuento) || 0
        const subtotal = cantidad * precioUnitario
        return pSum + (subtotal * (descuento / 100))
      }, 0)
    }, 0)

    // % de ventas con descuento
    const ventasConDescuento = filteredSales.filter(inv => {
      const productos = inv.metadata?.productos || []
      return productos.some(p => (parseFloat(p.descuento) || 0) > 0)
    }).length
    const porcentajeConDescuento = cantidadVentas > 0 ? (ventasConDescuento / cantidadVentas) * 100 : 0

    // Promedio de valor por producto
    const valorPromedioPorProducto = unidadesVendidas > 0 ? ventasTotales / unidadesVendidas : 0

    // % de ventas cobradas vs pendientes
    const ventasCobradas = filteredSales.filter(inv => inv.metadata?.cobrado === true || inv.metadata?.cobrado === 'si').length
    const ventasPendientes = filteredSales.filter(inv => inv.metadata?.cobrado === false || inv.metadata?.cobrado === 'no').length
    const porcentajeCobradas = cantidadVentas > 0 ? (ventasCobradas / cantidadVentas) * 100 : 0
    const porcentajePendientes = cantidadVentas > 0 ? (ventasPendientes / cantidadVentas) * 100 : 0

    // Día con mayor volumen de ventas
    const ventasPorDia = {}
    filteredSales.forEach(inv => {
      const fecha = inv.date
      if (!ventasPorDia[fecha]) {
        ventasPorDia[fecha] = 0
      }
      ventasPorDia[fecha] += parseFloat(inv.amount || 0)
    })
    
    let diaMayorVenta = { fecha: '-', monto: 0 }
    Object.entries(ventasPorDia).forEach(([fecha, monto]) => {
      if (monto > diaMayorVenta.monto) {
        diaMayorVenta = { fecha, monto }
      }
    })

    // Mes más activo del año
    const ventasPorMes = {}
    todasLasVentas.forEach(inv => {
      const date = new Date(inv.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!ventasPorMes[key]) {
        ventasPorMes[key] = 0
      }
      ventasPorMes[key] += parseFloat(inv.amount || 0)
    })
    
    let mesActivo = { mes: '-', monto: 0 }
    Object.entries(ventasPorMes).forEach(([mes, monto]) => {
      if (monto > mesActivo.monto) {
        mesActivo = { mes, monto }
      }
    })

    // Velocidad de ventas (promedio por día)
    const diasUnicos = new Set(filteredSales.map(inv => inv.date)).size
    const ventasPorDiaPromedio = diasUnicos > 0 ? cantidadVentas / diasUnicos : 0

    // Tendencia de ventas
    const tendencia = crecimientoMensual >= 0 ? '↑' : '↓'

    // Evolución mensual para gráficos
    const evolucionMensual = {}
    filteredSales.forEach(inv => {
      const date = new Date(inv.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!evolucionMensual[key]) {
        evolucionMensual[key] = { 
          ventas: 0, 
          cantidad: 0, 
          unidades: 0,
          minorista: 0,
          mayorista: 0
        }
      }
      
      evolucionMensual[key].ventas += parseFloat(inv.amount || 0)
      evolucionMensual[key].cantidad += 1
      
      const productos = inv.metadata?.productos || []
      evolucionMensual[key].unidades += productos.reduce((sum, p) => sum + (parseFloat(p.cantidad) || 0), 0)
      
      if (inv.metadata?.tipoVenta === 'minorista') {
        evolucionMensual[key].minorista += parseFloat(inv.amount || 0)
      } else if (inv.metadata?.tipoVenta === 'mayorista') {
        evolucionMensual[key].mayorista += parseFloat(inv.amount || 0)
      } else {
        // Si no tiene tipo, sumarlo a ambos proporcionalmente o a un "sin tipo"
        evolucionMensual[key].minorista += parseFloat(inv.amount || 0) / 2
        evolucionMensual[key].mayorista += parseFloat(inv.amount || 0) / 2
      }
    })

    const evolucionData = Object.entries(evolucionMensual)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, data]) => ({ mes, ...data }))

    // Datos adicionales para gráficos
    
    // Evolución por día
    const evolucionDiaria = {}
    filteredSales.forEach(inv => {
      const fecha = inv.date
      if (!evolucionDiaria[fecha]) {
        evolucionDiaria[fecha] = { ventas: 0, cantidad: 0, unidades: 0, minorista: 0, mayorista: 0 }
      }
      evolucionDiaria[fecha].ventas += parseFloat(inv.amount || 0)
      evolucionDiaria[fecha].cantidad += 1
      const productos = inv.metadata?.productos || []
      evolucionDiaria[fecha].unidades += productos.reduce((sum, p) => sum + (parseFloat(p.cantidad) || 0), 0)
      if (inv.metadata?.tipoVenta === 'minorista') {
        evolucionDiaria[fecha].minorista += parseFloat(inv.amount || 0)
      } else if (inv.metadata?.tipoVenta === 'mayorista') {
        evolucionDiaria[fecha].mayorista += parseFloat(inv.amount || 0)
      } else {
        evolucionDiaria[fecha].minorista += parseFloat(inv.amount || 0) / 2
        evolucionDiaria[fecha].mayorista += parseFloat(inv.amount || 0) / 2
      }
    })
    const evolucionDiariaData = Object.entries(evolucionDiaria)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([fecha, data]) => ({ fecha, ...data }))

    // Evolución por año
    const evolucionAnual = {}
    filteredSales.forEach(inv => {
      const year = new Date(inv.date).getFullYear()
      if (!evolucionAnual[year]) {
        evolucionAnual[year] = { ventas: 0, cantidad: 0, unidades: 0, minorista: 0, mayorista: 0 }
      }
      evolucionAnual[year].ventas += parseFloat(inv.amount || 0)
      evolucionAnual[year].cantidad += 1
      const productos = inv.metadata?.productos || []
      evolucionAnual[year].unidades += productos.reduce((sum, p) => sum + (parseFloat(p.cantidad) || 0), 0)
      if (inv.metadata?.tipoVenta === 'minorista') {
        evolucionAnual[year].minorista += parseFloat(inv.amount || 0)
      } else if (inv.metadata?.tipoVenta === 'mayorista') {
        evolucionAnual[year].mayorista += parseFloat(inv.amount || 0)
      } else {
        evolucionAnual[year].minorista += parseFloat(inv.amount || 0) / 2
        evolucionAnual[year].mayorista += parseFloat(inv.amount || 0) / 2
      }
    })
    const evolucionAnualData = Object.entries(evolucionAnual)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, data]) => ({ year, ...data }))

    // Distribución por medio de pago
    const ventasPorMedioPago = {}
    filteredSales.forEach(inv => {
      const medio = inv.metadata?.paymentMethod || 'no_especificado'
      if (!ventasPorMedioPago[medio]) {
        ventasPorMedioPago[medio] = { total: 0, cantidad: 0 }
      }
      ventasPorMedioPago[medio].total += parseFloat(inv.amount || 0)
      ventasPorMedioPago[medio].cantidad += 1
    })

    // Distribución por día de la semana
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const ventasPorDiaSemana = {}
    diasSemana.forEach(dia => {
      ventasPorDiaSemana[dia] = { ventas: 0, cantidad: 0 }
    })
    filteredSales.forEach(inv => {
      const date = new Date(inv.date)
      const dia = diasSemana[date.getDay()]
      ventasPorDiaSemana[dia].ventas += parseFloat(inv.amount || 0)
      ventasPorDiaSemana[dia].cantidad += 1
    })

    // Distribución por semana del mes
    const ventasPorSemanaMes = { 'Semana 1': 0, 'Semana 2': 0, 'Semana 3': 0, 'Semana 4': 0, 'Semana 5': 0 }
    filteredSales.forEach(inv => {
      const date = new Date(inv.date)
      const dia = date.getDate()
      const semana = Math.ceil(dia / 7)
      ventasPorSemanaMes[`Semana ${semana}`] += parseFloat(inv.amount || 0)
    })

    // Distribución por mes del año
    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const ventasPorMesAño = {}
    mesesNombres.forEach(mes => {
      ventasPorMesAño[mes] = { ventas: 0, cantidad: 0 }
    })
    filteredSales.forEach(inv => {
      const date = new Date(inv.date)
      const mes = mesesNombres[date.getMonth()]
      ventasPorMesAño[mes].ventas += parseFloat(inv.amount || 0)
      ventasPorMesAño[mes].cantidad += 1
    })

    // Heatmap por día y semana
    const heatmapData = {}
    filteredSales.forEach(inv => {
      const date = new Date(inv.date)
      const dia = diasSemana[date.getDay()]
      const semana = Math.ceil(date.getDate() / 7)
      const key = `${dia}-Semana${semana}`
      if (!heatmapData[key]) {
        heatmapData[key] = { dia, semana, ventas: 0 }
      }
      heatmapData[key].ventas += parseFloat(inv.amount || 0)
    })

    // Clientes únicos por período
    const clientesUnicos = new Set(filteredSales.map(inv => inv.metadata?.cliente).filter(Boolean)).size

    // Correlación descuentos vs volumen
    const ventasConDescuentoData = []
    const ventasSinDescuentoData = []
    filteredSales.forEach(inv => {
      const productos = inv.metadata?.productos || []
      const tieneDescuento = productos.some(p => (parseFloat(p.descuento) || 0) > 0)
      const unidades = productos.reduce((sum, p) => sum + (parseFloat(p.cantidad) || 0), 0)
      
      if (tieneDescuento) {
        ventasConDescuentoData.push({ monto: parseFloat(inv.amount || 0), unidades })
      } else {
        ventasSinDescuentoData.push({ monto: parseFloat(inv.amount || 0), unidades })
      }
    })

    const promedioUnidadesConDescuento = ventasConDescuentoData.length > 0 
      ? ventasConDescuentoData.reduce((sum, v) => sum + v.unidades, 0) / ventasConDescuentoData.length 
      : 0
    const promedioUnidadesSinDescuento = ventasSinDescuentoData.length > 0 
      ? ventasSinDescuentoData.reduce((sum, v) => sum + v.unidades, 0) / ventasSinDescuentoData.length 
      : 0

    setSalesMetrics({
      ventasTotales,
      crecimientoMensual,
      totalMinorista,
      totalMayorista,
      tipoPredominante,
      cantidadVentas,
      unidadesVendidas,
      ticketPromedio,
      promedioUnidadesPorVenta,
      descuentosTotales,
      porcentajeConDescuento,
      valorPromedioPorProducto,
      porcentajeCobradas,
      porcentajePendientes,
      ventasCobradas,
      ventasPendientes,
      diaMayorVenta,
      mesActivo,
      ventasPorDiaPromedio,
      tendencia,
      evolucionData,
      evolucionDiariaData,
      evolucionAnualData,
      ventasPorMedioPago,
      ventasPorDiaSemana,
      ventasPorSemanaMes,
      ventasPorMesAño,
      heatmapData,
      clientesUnicos,
      promedioUnidadesConDescuento,
      promedioUnidadesSinDescuento
    })
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

  // Tipos de análisis disponibles - Solo 4 principales
  const analysisTypes = [
    { id: 'clientes', name: 'CLIENTES', icon: Users, color: 'from-gray-700 to-gray-900' },
    { id: 'productos', name: 'PRODUCTOS', icon: Package, color: 'from-gray-800 to-black' },
    { id: 'proveedores', name: 'PROVEEDORES', icon: Building2, color: 'from-gray-600 to-gray-800' },
    { id: 'gastos', name: 'GASTOS', icon: Receipt, color: 'from-gray-700 to-gray-900' },
  ]

  // Componente de gráfico de torta
  const PieChartComponent = ({ data, title }) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
    let currentAngle = -90

    const segments = data.map((item, index) => {
      const angle = (item.porcentaje / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180
      const largeArc = angle > 180 ? 1 : 0

      const x1 = 50 + 45 * Math.cos(startRad)
      const y1 = 50 + 45 * Math.sin(startRad)
      const x2 = 50 + 45 * Math.cos(endRad)
      const y2 = 50 + 45 * Math.sin(endRad)

      return {
        ...item,
        path: `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: colors[index % colors.length]
      }
    })

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <svg viewBox="0 0 100 100" className="w-48 h-48">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="text-sm text-gray-700">{item.nombre}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.porcentaje.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Si no hay tipo de análisis seleccionado, mostrar selector
  if (!analysisType) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Análisis de Negocio
          </h1>
          <p className="text-base sm:text-lg text-gray-600">Selecciona una categoría para ver métricas detalladas</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {analysisTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setAnalysisType(type.id)}
              className="group relative bg-white border-2 border-gray-200 hover:border-gray-900 rounded-2xl p-8 transition-all hover:shadow-xl hover:scale-105 active:scale-100"
            >
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}>
                  <type.icon className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{type.name}</h3>
                  <p className="text-sm text-gray-500">Ver análisis detallado</p>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Vista de análisis de clientes
  if (analysisType === 'clientes') {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* Header */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <button
            onClick={() => setAnalysisType(null)}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 active:text-gray-900 hover:text-gray-900 active:bg-gray-100 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Análisis</span> de Clientes
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">Métricas y comportamiento de tus clientes</p>
            </div>
          </div>
        </div>

        {/* Toggle entre Métricas y Gráficos */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-full sm:w-fit">
          <button
            onClick={() => setViewMode('metrics')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2.5 rounded-md font-medium text-sm transition-all touch-manipulation min-h-[44px] ${
              viewMode === 'metrics' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 active:text-gray-900'
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => setViewMode('charts')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2.5 rounded-md font-medium text-sm transition-all touch-manipulation min-h-[44px] ${
              viewMode === 'charts' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 active:text-gray-900'
            }`}
          >
            Gráficos
          </button>
        </div>

        {!clientAnalysis ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Analizando clientes...</p>
            </div>
          </div>
        ) : viewMode === 'metrics' ? (
          <>
            {/* Métricas de Clientes */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Clientes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{clientAnalysis.totalClientes}</p>
                <p className="text-xs text-gray-500 mt-2">Clientes únicos registrados</p>
              </div>

              {/* Clientes Activos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{clientAnalysis.clientesActivos}</p>
                <p className="text-xs text-gray-500 mt-2">Compraron en el último mes</p>
              </div>

              {/* Nuevos Clientes del Mes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Nuevos Clientes</p>
                  <Sparkles className="w-6 h-6 text-cyan-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{clientAnalysis.nuevosClientesMesActual}</p>
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    {[2024, 2025].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clientes Recurrentes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Clientes Recurrentes</p>
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{clientAnalysis.clientesRecurrentes}</p>
                <p className="text-xs text-gray-500 mt-2">Compraron más de una vez</p>
              </div>

              {/* Ticket Promedio */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">
                  ${clientAnalysis.ticketPromedio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Por cliente</p>
              </div>

              {/* Promedio de Compras */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Compras por Cliente</p>
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">
                  {clientAnalysis.comprasPromedioPorCliente.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Promedio de compras</p>
              </div>

              {/* Frecuencia Promedio */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Frecuencia Promedio</p>
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">
                  {clientAnalysis.tiempoPromedioGlobal.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Días entre compras</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Gráficos de Clientes */}
            <div className="space-y-6">
              {/* TOP 10 Clientes - Diseño Equilibrado */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">TOP 10 Clientes</h3>
                      <p className="text-xs text-gray-500">Ranking por facturación total</p>
                    </div>
                  </div>
                  
                  {/* Buscador de clientes */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={searchCliente}
                      onChange={(e) => {
                        setSearchCliente(e.target.value)
                        setShowSuggestionsClientes(e.target.value.length > 0)
                      }}
                      onFocus={() => setShowSuggestionsClientes(searchCliente.length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestionsClientes(false), 200)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                    />
                    
                    {/* Sugerencias */}
                    {showSuggestionsClientes && searchCliente && clientAnalysis.top10Clientes && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {clientAnalysis.top10Clientes
                          .filter(c => c.nombre.toLowerCase().includes(searchCliente.toLowerCase()))
                          .map((cliente, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchCliente(cliente.nombre)
                                setShowSuggestionsClientes(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-all text-sm border-b border-gray-100 last:border-b-0 group"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">#{cliente.posicion}</span>
                                  <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{cliente.nombre}</span>
                                </div>
                                <span className="text-gray-900 font-semibold">${cliente.totalGastado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                              </div>
                            </button>
                          ))}
                        {clientAnalysis.top10Clientes.filter(c => c.nombre.toLowerCase().includes(searchCliente.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No se encontraron clientes
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {searchCliente ? (
                  // Mostrar cliente buscado
                  (() => {
                    const clienteEncontrado = clientAnalysis.top10Clientes.find(c => 
                      c.nombre.toLowerCase() === searchCliente.toLowerCase()
                    )
                    
                    if (!clienteEncontrado) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          Cliente no encontrado en el TOP 10
                        </div>
                      )
                    }
                    
                    return (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">{clienteEncontrado.nombre}</span> está en la posición <span className="font-semibold">#{clienteEncontrado.posicion}</span>
                          </p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Posición</p>
                              <p className="text-2xl font-bold text-blue-600">#{clienteEncontrado.posicion}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Total Gastado</p>
                              <p className="text-2xl font-bold text-gray-900">${clienteEncontrado.totalGastado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Compras</p>
                              <p className="text-2xl font-bold text-gray-900">{clienteEncontrado.cantidadCompras}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">% del Total</p>
                              <p className="text-2xl font-bold text-blue-600">{clienteEncontrado.porcentajeSobreTotal.toFixed(1)}%</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Unidades</p>
                              <p className="text-lg font-semibold text-gray-900">{clienteEncontrado.unidadesTotales.toFixed(0)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Frecuencia</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {clienteEncontrado.tiempoPromedioEntreCompras > 0 
                                  ? `${clienteEncontrado.tiempoPromedioEntreCompras.toFixed(0)} días` 
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Última Compra</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {new Date(clienteEncontrado.ultimaCompra).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  // Mostrar TOP 10
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">#</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Cliente</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Total Gastado</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">% del Total</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Compras</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Unidades</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Frecuencia</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Última Compra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientAnalysis.top10Clientes.map((cliente, index) => {
                          const isTop3 = index < 3
                          const positionBg = index === 0 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-300' : 
                                           index === 1 ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border border-gray-300' : 
                                           index === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 border border-orange-300' : 
                                           'bg-gray-100 text-gray-600'
                          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
                          
                          return (
                            <tr key={index} className={`border-b border-gray-200 hover:bg-blue-50 transition-all hover:shadow-sm ${isTop3 ? 'bg-blue-50/30' : ''}`}>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold ${positionBg} shadow-sm`}>
                                  {medal || cliente.posicion}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span className="text-sm font-semibold text-gray-900">{cliente.nombre}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-right font-bold text-gray-900">
                                ${cliente.totalGastado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                              </td>
                              <td className="py-4 px-4 text-sm text-right">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                                  {cliente.porcentajeSobreTotal.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-right text-gray-700 font-semibold">
                                {cliente.cantidadCompras}
                              </td>
                              <td className="py-4 px-4 text-sm text-right text-gray-700 font-medium">
                                {cliente.unidadesTotales.toFixed(0)}
                              </td>
                              <td className="py-4 px-4 text-sm text-right text-gray-600">
                                {cliente.tiempoPromedioEntreCompras > 0 
                                  ? `${cliente.tiempoPromedioEntreCompras.toFixed(0)} días` 
                                  : 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm text-right text-gray-600">
                                {new Date(cliente.ultimaCompra).toLocaleDateString('es-AR')}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Gráficos de Distribución */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Clientes Nuevos vs Recurrentes del Mes */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">👥 Distribución Clientes</h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        {monthNames.map((month, index) => (
                          <option key={index} value={index}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        {[2024, 2025].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    <svg viewBox="0 0 100 100" className="w-48 h-48">
                      {(() => {
                        const colors = ['#3b82f6', '#10b981']
                        const total = clientAnalysis.clientesNuevosDelMes + clientAnalysis.clientesRecurrentesDelMes
                        if (total === 0) return null
                        
                        const porcentajeNuevos = (clientAnalysis.clientesNuevosDelMes / total) * 100
                        const porcentajeRecurrentes = (clientAnalysis.clientesRecurrentesDelMes / total) * 100
                        
                        const angleNuevos = (porcentajeNuevos / 100) * 360
                        const angleRecurrentes = (porcentajeRecurrentes / 100) * 360
                        
                        const startAngleNuevos = -90
                        const endAngleNuevos = startAngleNuevos + angleNuevos
                        const startAngleRecurrentes = endAngleNuevos
                        const endAngleRecurrentes = startAngleRecurrentes + angleRecurrentes
                        
                        const startRadNuevos = (startAngleNuevos * Math.PI) / 180
                        const endRadNuevos = (endAngleNuevos * Math.PI) / 180
                        const startRadRecurrentes = (startAngleRecurrentes * Math.PI) / 180
                        const endRadRecurrentes = (endAngleRecurrentes * Math.PI) / 180
                        
                        const largeArcNuevos = angleNuevos > 180 ? 1 : 0
                        const largeArcRecurrentes = angleRecurrentes > 180 ? 1 : 0
                        
                        const x1Nuevos = 50 + 45 * Math.cos(startRadNuevos)
                        const y1Nuevos = 50 + 45 * Math.sin(startRadNuevos)
                        const x2Nuevos = 50 + 45 * Math.cos(endRadNuevos)
                        const y2Nuevos = 50 + 45 * Math.sin(endRadNuevos)
                        
                        const x1Recurrentes = 50 + 45 * Math.cos(startRadRecurrentes)
                        const y1Recurrentes = 50 + 45 * Math.sin(startRadRecurrentes)
                        const x2Recurrentes = 50 + 45 * Math.cos(endRadRecurrentes)
                        const y2Recurrentes = 50 + 45 * Math.sin(endRadRecurrentes)
                        
                        return (
                          <>
                            <path
                              d={`M 50 50 L ${x1Nuevos} ${y1Nuevos} A 45 45 0 ${largeArcNuevos} 1 ${x2Nuevos} ${y2Nuevos} Z`}
                              fill={colors[0]}
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                            <path
                              d={`M 50 50 L ${x1Recurrentes} ${y1Recurrentes} A 45 45 0 ${largeArcRecurrentes} 1 ${x2Recurrentes} ${y2Recurrentes} Z`}
                              fill={colors[1]}
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                            <circle cx="50" cy="50" r="25" fill="white" />
                          </>
                        )
                      })()}
                    </svg>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-blue-500" />
                          <span className="text-sm text-gray-700">Nuevos</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {clientAnalysis.clientesNuevosDelMes + clientAnalysis.clientesRecurrentesDelMes > 0 
                              ? ((clientAnalysis.clientesNuevosDelMes / (clientAnalysis.clientesNuevosDelMes + clientAnalysis.clientesRecurrentesDelMes)) * 100).toFixed(1)
                              : 0}%
                          </span>
                          <span className="text-xs text-gray-500 ml-2">({clientAnalysis.clientesNuevosDelMes} clientes)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-green-500" />
                          <span className="text-sm text-gray-700">Recurrentes</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {clientAnalysis.clientesNuevosDelMes + clientAnalysis.clientesRecurrentesDelMes > 0 
                              ? ((clientAnalysis.clientesRecurrentesDelMes / (clientAnalysis.clientesNuevosDelMes + clientAnalysis.clientesRecurrentesDelMes)) * 100).toFixed(1)
                              : 0}%
                          </span>
                          <span className="text-xs text-gray-500 ml-2">({clientAnalysis.clientesRecurrentesDelMes} clientes)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medios de Pago */}
                <PieChartComponent
                  title="💳 Distribución Medios de Pago"
                  data={clientAnalysis.mediosPagoDistribucion}
                />
              </div>

              {/* Lista de Clientes No Recurrentes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  ⚠️ Clientes No Recurrentes ({clientAnalysis.clientesNoRecurrentes.length})
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {clientAnalysis.clientesNoRecurrentes.map((cliente, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <p className="font-semibold text-gray-900 mb-2">{cliente.nombre}</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>Gastó: <span className="font-semibold text-gray-900">${cliente.totalGastado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></p>
                          <p>Fecha: {new Date(cliente.ultimaCompra).toLocaleDateString('es-AR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Vista de análisis de gastos
  if (analysisType === 'gastos') {
    // Filtrar gastos según el período seleccionado
    let gastosFiltrados = invoices.filter(inv => inv.type === 'expense' && inv.metadata?.movementType === 'gasto')
    let fechaInicio = null
    let fechaFin = new Date()
    
    if (periodoGastos === 'mes') {
      fechaInicio = new Date()
      fechaInicio.setMonth(fechaInicio.getMonth() - 1)
      gastosFiltrados = gastosFiltrados.filter(g => new Date(g.date) >= fechaInicio)
    } else if (periodoGastos === 'varios') {
      fechaInicio = new Date()
      fechaInicio.setMonth(fechaInicio.getMonth() - parseInt(mesesGastos))
      gastosFiltrados = gastosFiltrados.filter(g => new Date(g.date) >= fechaInicio)
    }
    
    const gastos = gastosFiltrados
    
    // Calcular variación mensual
    const mesActual = new Date()
    const mesAnterior = new Date()
    mesAnterior.setMonth(mesAnterior.getMonth() - 1)
    
    const gastosEsteMes = invoices.filter(inv => {
      if (inv.type !== 'expense' || inv.metadata?.movementType !== 'gasto') return false
      const fecha = new Date(inv.date)
      return fecha.getMonth() === mesActual.getMonth() && fecha.getFullYear() === mesActual.getFullYear()
    }).reduce((sum, g) => sum + parseFloat(g.amount || 0), 0)
    
    const gastosMesAnterior = invoices.filter(inv => {
      if (inv.type !== 'expense' || inv.metadata?.movementType !== 'gasto') return false
      const fecha = new Date(inv.date)
      return fecha.getMonth() === mesAnterior.getMonth() && fecha.getFullYear() === mesAnterior.getFullYear()
    }).reduce((sum, g) => sum + parseFloat(g.amount || 0), 0)
    
    const variacionMensual = gastosMesAnterior > 0 
      ? ((gastosEsteMes - gastosMesAnterior) / gastosMesAnterior) * 100 
      : 0
    
    // Agrupar gastos por categoría
    const gastosPorCategoria = {}
    gastos.forEach(gasto => {
      const categoria = gasto.metadata?.categoria || 'Sin categoría'
      if (!gastosPorCategoria[categoria]) {
        gastosPorCategoria[categoria] = { total: 0, cantidad: 0 }
      }
      gastosPorCategoria[categoria].total += parseFloat(gasto.amount || 0)
      gastosPorCategoria[categoria].cantidad += 1
    })

    const totalGastos = Object.values(gastosPorCategoria).reduce((sum, val) => sum + val.total, 0)
    const gastosData = Object.entries(gastosPorCategoria)
      .map(([categoria, data]) => ({
        nombre: categoria,
        monto: data.total,
        cantidad: data.cantidad,
        porcentaje: totalGastos > 0 ? (data.total / totalGastos) * 100 : 0
      }))
      .sort((a, b) => b.monto - a.monto)
    
    // Categoría con mayor gasto
    const categoriaMayorGasto = gastosData[0]
    
    // Gastos fijos vs variables
    const gastosFijos = gastos.filter(g => g.metadata?.tipoGasto === 'fijo')
    const gastosVariables = gastos.filter(g => g.metadata?.tipoGasto === 'variable' || !g.metadata?.tipoGasto)
    const totalGastosFijos = gastosFijos.reduce((sum, g) => sum + parseFloat(g.amount || 0), 0)
    const totalGastosVariables = gastosVariables.reduce((sum, g) => sum + parseFloat(g.amount || 0), 0)
    const porcentajeFijos = totalGastos > 0 ? (totalGastosFijos / totalGastos) * 100 : 0
    const porcentajeVariables = totalGastos > 0 ? (totalGastosVariables / totalGastos) * 100 : 0
    
    // Ingresos del período
    const ingresosPeriodo = invoices.filter(inv => {
      if (inv.type !== 'income') return false
      if (periodoGastos === 'mes') {
        return new Date(inv.date) >= fechaInicio
      } else if (periodoGastos === 'varios') {
        return new Date(inv.date) >= fechaInicio
      }
      return true
    }).reduce((sum, ing) => sum + parseFloat(ing.amount || 0), 0)
    
    const porcentajeGastosSobreIngresos = ingresosPeriodo > 0 ? (totalGastos / ingresosPeriodo) * 100 : 0
    const margenOperativo = ingresosPeriodo > 0 ? ((ingresosPeriodo - totalGastos) / ingresosPeriodo) * 100 : 0

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setAnalysisType(null)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Análisis</span> de Gastos
            </h2>
            <p className="text-sm text-gray-600">Distribución y detalle de gastos operativos</p>
          </div>
        </div>

        {/* Selector de Período */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Período a analizar:</label>
            <select
              value={periodoGastos}
              onChange={(e) => setPeriodoGastos(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="general">General (todos los gastos)</option>
              <option value="mes">Último mes</option>
              <option value="varios">Varios meses</option>
            </select>
            
            {periodoGastos === 'varios' && (
              <select
                value={mesesGastos}
                onChange={(e) => setMesesGastos(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
              </select>
            )}
          </div>
        </div>

        {gastos.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay gastos registrados</h3>
            <p className="text-gray-600">Registra gastos para ver el análisis del período seleccionado</p>
          </div>
        ) : (
          <>
            {/* Métricas Principales */}
            <div className="grid md:grid-cols-4 gap-6">
              {/* Gasto Total */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Gasto Total</p>
                  <Receipt className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${totalGastos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">{gastos.length} transacciones</p>
              </div>

              {/* Gasto Promedio */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Gasto Promedio</p>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${(totalGastos / gastos.length).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Por transacción</p>
              </div>

              {/* Variación Mensual */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Variación Mensual</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Cambio porcentual del gasto comparado con el mes anterior
                      </div>
                    </div>
                  </div>
                  {variacionMensual >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <p className={`text-3xl font-bold ${variacionMensual >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {variacionMensual >= 0 ? '+' : ''}{variacionMensual.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">vs mes anterior</p>
              </div>

              {/* Tipos de Gastos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Tipos de Gastos</p>
                  <PieChart className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{gastosData.length}</p>
                <p className="text-xs text-gray-500 mt-2">Categorías diferentes</p>
              </div>
            </div>

            {/* Métricas Secundarias */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Gastos Fijos vs Variables */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Fijos vs Variables</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Distribución entre gastos fijos (recurrentes) y variables (ocasionales)
                      </div>
                    </div>
                  </div>
                  <Percent className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Fijos</span>
                      <span className="font-semibold text-gray-900">{porcentajeFijos.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full"
                        style={{ width: `${porcentajeFijos}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Variables</span>
                      <span className="font-semibold text-gray-900">{porcentajeVariables.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${porcentajeVariables}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gastos sobre Ingresos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Gastos / Ingresos</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Porcentaje de los ingresos que se destina a gastos. Menor es mejor
                      </div>
                    </div>
                  </div>
                  <Percent className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {porcentajeGastosSobreIngresos.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Del total de ingresos</p>
              </div>

              {/* Margen Operativo */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Margen Operativo</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Porcentaje de ingresos que queda después de cubrir gastos operativos
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className={`text-3xl font-bold ${margenOperativo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {margenOperativo.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Rentabilidad operativa</p>
              </div>
            </div>

            {/* Categoría con Mayor Gasto - RESALTADO */}
            {categoriaMayorGasto && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-200 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-900 mb-1">⭐ Categoría con Mayor Gasto</p>
                      <p className="text-2xl font-bold text-yellow-900">{categoriaMayorGasto.nombre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-yellow-900">
                      ${categoriaMayorGasto.monto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {categoriaMayorGasto.porcentaje.toFixed(1)}% del total
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de Gastos por Categoría */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Gastos por Categoría</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastosData.map((gasto, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{gasto.nombre}</td>
                        <td className="py-3 px-4 text-sm text-right text-gray-700">{gasto.cantidad}</td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                          ${gasto.monto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            {gasto.porcentaje.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Vista de análisis de deudas
  if (analysisType === 'deudas') {
    // Filtrar deudas según período - usar el campo cobrado/pagado y deuda
    let deudasFiltradas = invoices.filter(inv => {
      // Para ventas: cobrado === false significa que hay deuda
      // Para compras: pagado === false significa que hay deuda
      const tieneDeuda = inv.type === 'income' 
        ? (inv.metadata?.cobrado === false || inv.metadata?.cobrado === 'no') && parseFloat(inv.metadata?.deuda || 0) > 0
        : (inv.metadata?.pagado === false || inv.metadata?.pagado === 'no') && parseFloat(inv.metadata?.deuda || 0) > 0
      
      return tieneDeuda
    })
    let fechaInicio = null
    
    if (periodoDeudas === 'mes') {
      fechaInicio = new Date()
      fechaInicio.setMonth(fechaInicio.getMonth() - 1)
      deudasFiltradas = deudasFiltradas.filter(d => new Date(d.date) >= fechaInicio)
    } else if (periodoDeudas === 'varios') {
      fechaInicio = new Date()
      fechaInicio.setMonth(fechaInicio.getMonth() - parseInt(mesesDeudas))
      deudasFiltradas = deudasFiltradas.filter(d => new Date(d.date) >= fechaInicio)
    }
    
    const deudas = deudasFiltradas
    const deudasPorCliente = {}
    const deudasPorProveedor = {}
    const hoy = new Date()
    
    deudas.forEach(deuda => {
      // Usar el campo deuda del metadata que es donde se guarda el monto adeudado
      const saldo = parseFloat(deuda.metadata?.deuda || 0)
      const fechaDeuda = new Date(deuda.date)
      const diasAtraso = Math.floor((hoy - fechaDeuda) / (1000 * 60 * 60 * 24))
      
      if (deuda.type === 'income') {
        // Deudas de clientes (cuentas por cobrar)
        const cliente = deuda.metadata?.cliente || 'Sin cliente'
        if (!deudasPorCliente[cliente]) {
          deudasPorCliente[cliente] = { 
            total: 0, 
            cantidad: 0, 
            facturas: [],
            fechaMasAntigua: fechaDeuda,
            diasAtrasoTotal: 0
          }
        }
        deudasPorCliente[cliente].total += saldo
        deudasPorCliente[cliente].cantidad += 1
        deudasPorCliente[cliente].diasAtrasoTotal += diasAtraso
        deudasPorCliente[cliente].facturas.push({
          fecha: deuda.date,
          monto: saldo,
          numero: deuda.invoice_number,
          diasAtraso
        })
        if (fechaDeuda < deudasPorCliente[cliente].fechaMasAntigua) {
          deudasPorCliente[cliente].fechaMasAntigua = fechaDeuda
        }
      } else {
        // Deudas con proveedores (cuentas por pagar)
        const proveedor = deuda.metadata?.provider || 'Sin proveedor'
        if (!deudasPorProveedor[proveedor]) {
          deudasPorProveedor[proveedor] = { 
            total: 0, 
            cantidad: 0, 
            facturas: [],
            fechaMasAntigua: fechaDeuda,
            diasAtrasoTotal: 0
          }
        }
        deudasPorProveedor[proveedor].total += saldo
        deudasPorProveedor[proveedor].cantidad += 1
        deudasPorProveedor[proveedor].diasAtrasoTotal += diasAtraso
        deudasPorProveedor[proveedor].facturas.push({
          fecha: deuda.date,
          monto: saldo,
          numero: deuda.invoice_number,
          diasAtraso
        })
        if (fechaDeuda < deudasPorProveedor[proveedor].fechaMasAntigua) {
          deudasPorProveedor[proveedor].fechaMasAntigua = fechaDeuda
        }
      }
    })

    const totalPorCobrar = Object.values(deudasPorCliente).reduce((sum, val) => sum + val.total, 0)
    const totalPorPagar = Object.values(deudasPorProveedor).reduce((sum, val) => sum + val.total, 0)
    const balanceDeudas = totalPorCobrar - totalPorPagar

    // Calcular antigüedad y días de atraso promedio
    const antiguedadPromedioCobrar = Object.values(deudasPorCliente).length > 0
      ? Object.values(deudasPorCliente).reduce((sum, val) => {
          const dias = Math.floor((hoy - val.fechaMasAntigua) / (1000 * 60 * 60 * 24))
          return sum + dias
        }, 0) / Object.values(deudasPorCliente).length
      : 0
    
    const diasAtrasoPromedioCobrar = Object.values(deudasPorCliente).length > 0
      ? Object.values(deudasPorCliente).reduce((sum, val) => sum + (val.diasAtrasoTotal / val.cantidad), 0) / Object.values(deudasPorCliente).length
      : 0
    
    const antiguedadPromedioPagar = Object.values(deudasPorProveedor).length > 0
      ? Object.values(deudasPorProveedor).reduce((sum, val) => {
          const dias = Math.floor((hoy - val.fechaMasAntigua) / (1000 * 60 * 60 * 24))
          return sum + dias
        }, 0) / Object.values(deudasPorProveedor).length
      : 0
    
    const diasAtrasoPromedioPagar = Object.values(deudasPorProveedor).length > 0
      ? Object.values(deudasPorProveedor).reduce((sum, val) => sum + (val.diasAtrasoTotal / val.cantidad), 0) / Object.values(deudasPorProveedor).length
      : 0

    const clientesData = Object.entries(deudasPorCliente)
      .map(([nombre, data]) => {
        const antiguedad = Math.floor((hoy - data.fechaMasAntigua) / (1000 * 60 * 60 * 24))
        const diasAtrasoPromedio = data.diasAtrasoTotal / data.cantidad
        // Tasa de interés sugerida: 2% mensual (baja y razonable)
        const tasaInteresMensual = 0.02
        const mesesAtraso = diasAtrasoPromedio / 30
        const interesesSugeridos = data.total * tasaInteresMensual * mesesAtraso
        
        return {
          nombre,
          ...data,
          antiguedad,
          diasAtrasoPromedio,
          interesesSugeridos
        }
      })
      .sort((a, b) => b.total - a.total)

    const proveedoresData = Object.entries(deudasPorProveedor)
      .map(([nombre, data]) => {
        const antiguedad = Math.floor((hoy - data.fechaMasAntigua) / (1000 * 60 * 60 * 24))
        const diasAtrasoPromedio = data.diasAtrasoTotal / data.cantidad
        
        return {
          nombre,
          ...data,
          antiguedad,
          diasAtrasoPromedio
        }
      })
      .sort((a, b) => b.total - a.total)
    
    // Calcular porcentaje de ingresos para pagar deudas
    const ingresosTotales = invoices.filter(inv => inv.type === 'income').reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    const porcentajeIngresosPagar = ingresosTotales > 0 ? (totalPorPagar / ingresosTotales) * 100 : 0

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setAnalysisType(null)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Análisis</span> de Deudas
            </h2>
            <p className="text-sm text-gray-600">Cuentas por cobrar y por pagar</p>
          </div>
        </div>

        {/* Selector de Período */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Período a analizar:</label>
            <select
              value={periodoDeudas}
              onChange={(e) => setPeriodoDeudas(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="general">General (todas las deudas)</option>
              <option value="mes">Último mes</option>
              <option value="varios">Varios meses</option>
            </select>
            
            {periodoDeudas === 'varios' && (
              <select
                value={mesesDeudas}
                onChange={(e) => setMesesDeudas(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
              </select>
            )}
          </div>
        </div>

        {deudas.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">¡Sin deudas pendientes!</h3>
            <p className="text-sm text-gray-600">Todas las cuentas están al día en el período seleccionado</p>
          </div>
        )}
        
        {/* GENERAL - Resumen de Deudas */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Resumen General</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">Total Por Cobrar</p>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${totalPorCobrar.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{clientesData.length} clientes deben</p>
                </div>

                <div className="bg-white border border-red-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">Total Por Pagar</p>
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    ${totalPorPagar.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{proveedoresData.length} proveedores a pagar</p>
                </div>

                <div className={`bg-white border ${balanceDeudas >= 0 ? 'border-blue-200' : 'border-orange-200'} rounded-lg p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-600">Balance Neto</p>
                    <DollarSign className={`w-5 h-5 ${balanceDeudas >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  </div>
                  <p className={`text-3xl font-bold ${balanceDeudas >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {balanceDeudas >= 0 ? '+' : ''}${balanceDeudas.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Diferencia neta</p>
                </div>
              </div>
            </div>

            {/* DEUDORES (Clientes) */}
            {clientesData.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Deudores (Clientes)</h3>
                
                {/* Métricas de Deudores */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total a Cobrar</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${totalPorCobrar.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Antigüedad Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(antiguedadPromedioCobrar)} días
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Días de Atraso Promedio</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(diasAtrasoPromedioCobrar)} días
                    </p>
                  </div>
                </div>

                {/* Tabla TOP 10 Deudores */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 TOP 10 Deudores</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Deuda</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Facturas</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Antigüedad</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Días Atraso</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Interés Sugerido (2%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientesData.slice(0, 10).map((cliente, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{cliente.nombre}</td>
                            <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                              ${cliente.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="py-3 px-4 text-sm text-right text-gray-700">{cliente.cantidad}</td>
                            <td className="py-3 px-4 text-sm text-right text-gray-700">{cliente.antiguedad} días</td>
                            <td className="py-3 px-4 text-sm text-right text-orange-600">{Math.round(cliente.diasAtrasoPromedio)} días</td>
                            <td className="py-3 px-4 text-sm text-right text-blue-600">
                              ${cliente.interesesSugeridos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ACREEDORES (Proveedores) */}
            {proveedoresData.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">🏢 Acreedores (Proveedores)</h3>
                
                {/* Métricas de Acreedores */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total a Pagar</p>
                    <p className="text-2xl font-bold text-red-600">
                      ${totalPorPagar.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Antigüedad Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(antiguedadPromedioPagar)} días
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Días de Atraso Promedio</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(diasAtrasoPromedioPagar)} días
                    </p>
                  </div>
                </div>

                {/* Tabla TOP 10 Acreedores */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 TOP 10 Acreedores</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Proveedor</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Deuda</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Compras</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Antigüedad</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Días Atraso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proveedoresData.slice(0, 10).map((proveedor, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{proveedor.nombre}</td>
                            <td className="py-3 px-4 text-sm text-right font-semibold text-red-600">
                              ${proveedor.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="py-3 px-4 text-sm text-right text-gray-700">{proveedor.cantidad}</td>
                            <td className="py-3 px-4 text-sm text-right text-gray-700">{proveedor.antiguedad} días</td>
                            <td className="py-3 px-4 text-sm text-right text-orange-600">{Math.round(proveedor.diasAtrasoPromedio)} días</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Gráficos Finales */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Gráfico de Torta - Distribución */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">📊 Distribución de Deudas</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-700">Por Cobrar</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {((totalPorCobrar / (totalPorCobrar + totalPorPagar)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${(totalPorCobrar / (totalPorCobrar + totalPorPagar)) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-700">Por Pagar</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {((totalPorPagar / (totalPorCobrar + totalPorPagar)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full"
                      style={{ width: `${(totalPorPagar / (totalPorCobrar + totalPorPagar)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Impacto en Ingresos */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-purple-900 mb-4">💼 Impacto en Ingresos</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-purple-700 mb-2">Porcentaje de ingresos necesarios para pagar deudas:</p>
                    <p className="text-4xl font-bold text-purple-900">
                      {porcentajeIngresosPagar.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-4">
                    <div 
                      className="bg-purple-600 h-4 rounded-full"
                      style={{ width: `${Math.min(100, porcentajeIngresosPagar)}%` }}
                    ></div>
                  </div>
                  <div className="pt-4 border-t border-purple-300">
                    <p className="text-sm text-purple-700">Monto a pagar:</p>
                    <p className="text-2xl font-bold text-purple-900">
                      ${totalPorPagar.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">Ingresos totales:</p>
                    <p className="text-xl font-semibold text-purple-800">
                      ${ingresosTotales.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
      </div>
    )
  }

  // Vista de análisis de productos
  if (analysisType === 'productos') {
    const ventas = invoices.filter(inv => inv.type === 'income' && inv.metadata?.movementType === 'venta')
    const productos = inventoryItems || []
    
    // Calcular métricas
    const totalProductosRegistrados = productos.length
    const productosActivos = productos.filter(p => p.is_active && p.current_stock > 0).length
    const productosInactivos = productos.filter(p => !p.is_active || p.current_stock === 0).length
    
    // Categorías activas
    const categoriasActivas = new Set(
      productos.filter(p => p.is_active && p.current_stock > 0 && p.category).map(p => p.category)
    ).size
    
    // Modelos y marcas
    const modelosDisponibles = new Set(
      productos.filter(p => p.model).map(p => p.model)
    ).size
    
    const marcasDisponibles = new Set(
      productos.filter(p => p.brand).map(p => p.brand)
    ).size
    
    // Agrupar ventas por producto
    const ventasPorProducto = {}
    const ventasPorCategoria = {}
    const ventasPorMarca = {}
    
    ventas.forEach(venta => {
      const productosVenta = venta.metadata?.productos || []
      productosVenta.forEach(producto => {
        const nombre = producto.nombre || 'Sin nombre'
        const cantidad = parseFloat(producto.cantidad) || 0
        const precioUnitario = parseFloat(producto.precioUnitario) || parseFloat(producto.precio) || 0
        const precioTotal = parseFloat(producto.precioTotal) || 0
        const descuento = parseFloat(producto.descuento) || 0
        // Usar precioTotal si está disponible, sino calcular desde precioUnitario
        const ingresos = precioTotal > 0 ? precioTotal : (precioUnitario * cantidad) - descuento
        
        // Por producto
        if (!ventasPorProducto[nombre]) {
          ventasPorProducto[nombre] = { 
            cantidad: 0, 
            unidades: 0, 
            ingresos: 0,
            categoria: producto.categoria || 'Sin categoría',
            marca: producto.marca || 'Sin marca'
          }
        }
        ventasPorProducto[nombre].cantidad += 1
        ventasPorProducto[nombre].unidades += cantidad
        ventasPorProducto[nombre].ingresos += ingresos
        
        // Por categoría
        const categoria = producto.categoria || 'Sin categoría'
        if (!ventasPorCategoria[categoria]) {
          ventasPorCategoria[categoria] = { unidades: 0, ingresos: 0 }
        }
        ventasPorCategoria[categoria].unidades += cantidad
        ventasPorCategoria[categoria].ingresos += ingresos
        
        // Por marca
        const marca = producto.marca || 'Sin marca'
        if (!ventasPorMarca[marca]) {
          ventasPorMarca[marca] = { unidades: 0, ingresos: 0 }
        }
        ventasPorMarca[marca].unidades += cantidad
        ventasPorMarca[marca].ingresos += ingresos
      })
    })
    
    const productosData = Object.entries(ventasPorProducto)
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.ingresos - a.ingresos)
    
    const totalIngresos = productosData.reduce((sum, p) => sum + p.ingresos, 0)
    const totalUnidadesVendidas = productosData.reduce((sum, p) => sum + p.unidades, 0)
    
    // Producto más vendido (por unidades)
    const productoMasVendido = productosData.length > 0 
      ? productosData.reduce((max, p) => p.unidades > max.unidades ? p : max, productosData[0])
      : null
    
    // Producto con mayor facturación
    const productoMayorFacturacion = productosData.length > 0 
      ? productosData[0]
      : null
    
    // Categoría más vendida
    const categoriaData = Object.entries(ventasPorCategoria)
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.unidades - a.unidades)
    const categoriaMasVendida = categoriaData.length > 0 ? categoriaData[0] : null
    
    // Marca con mayor participación
    const marcaData = Object.entries(ventasPorMarca)
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.ingresos - a.ingresos)
    const marcaMayorParticipacion = marcaData.length > 0 ? marcaData[0] : null
    
    // Stock promedio
    const stockPromedio = productos.length > 0
      ? productos.reduce((sum, p) => sum + (p.current_stock || 0), 0) / productos.length
      : 0
    
    // Rotación de inventario
    const rotacionInventario = stockPromedio > 0 ? totalUnidadesVendidas / stockPromedio : 0
    
    // Días promedio de rotación (estimado en 30 días)
    const diasRotacion = rotacionInventario > 0 ? 30 / rotacionInventario : 0
    
    // Productos sin ventas
    const productosConVentas = new Set(productosData.map(p => p.nombre))
    const productosSinVentas = productos.filter(p => !productosConVentas.has(p.name)).length
    const porcentajeSinVentas = productos.length > 0 ? (productosSinVentas / productos.length) * 100 : 0
    
    // Promedio de ventas por producto
    const promedioVentasPorProducto = productosData.length > 0 
      ? totalUnidadesVendidas / productosData.length 
      : 0
    
    // Promedio de ingresos por categoría
    const promedioIngresosPorCategoria = categoriaData.length > 0
      ? totalIngresos / categoriaData.length
      : 0
    
    // Relación unidades vendidas / stock disponible
    const stockTotal = productos.reduce((sum, p) => sum + (p.current_stock || 0), 0)
    const relacionVentasStock = stockTotal > 0 ? (totalUnidadesVendidas / stockTotal) * 100 : 0

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setAnalysisType(null)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Análisis</span> de Productos
            </h2>
            <p className="text-sm text-gray-600">Rendimiento y estadísticas de productos</p>
          </div>
        </div>

        {/* Toggle Métricas/Gráficos */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setProductViewMode('metricas')}
            className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
              productViewMode === 'metricas'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => setProductViewMode('graficos')}
            className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
              productViewMode === 'graficos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Gráficos
          </button>
        </div>

        {productos.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay productos registrados</h3>
            <p className="text-gray-600">Registra productos en el inventario para ver el análisis</p>
          </div>
        ) : productViewMode === 'metricas' ? (
          <>
            {/* Métricas de Productos */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Productos Registrados */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Total Productos Registrados</p>
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{totalProductosRegistrados}</p>
                <p className="text-xs text-gray-500 mt-2">Productos en el sistema</p>
              </div>

              {/* Productos Activos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{productosActivos}</p>
                <p className="text-xs text-gray-500 mt-2">Disponibles para venta</p>
              </div>

              {/* Productos Inactivos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Productos Inactivos</p>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{productosInactivos}</p>
                <p className="text-xs text-gray-500 mt-2">Sin stock o descontinuados</p>
              </div>

              {/* Categorías Activas */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Categorías Activas</p>
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{categoriasActivas}</p>
                <p className="text-xs text-gray-500 mt-2">Con productos en venta</p>
              </div>

              {/* Modelos Disponibles */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Modelos Disponibles</p>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{modelosDisponibles}</p>
                <p className="text-xs text-gray-500 mt-2">Modelos registrados</p>
              </div>

              {/* Marcas Disponibles */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Marcas Disponibles</p>
                  <Award className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{marcasDisponibles}</p>
                <p className="text-xs text-gray-500 mt-2">Marcas en inventario</p>
              </div>

              {/* Producto Más Vendido */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-orange-900">🔥 Producto Más Vendido</p>
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-900 truncate">
                  {productoMasVendido ? productoMasVendido.nombre : 'N/A'}
                </p>
                <p className="text-xs text-orange-700 mt-2">
                  {productoMasVendido ? `${productoMasVendido.unidades.toFixed(0)} unidades vendidas` : 'Sin ventas'}
                </p>
              </div>

              {/* Producto Mayor Facturación */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-green-900">💰 Mayor Facturación</p>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900 truncate">
                  {productoMayorFacturacion ? productoMayorFacturacion.nombre : 'N/A'}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  {productoMayorFacturacion ? `$${productoMayorFacturacion.ingresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}` : 'Sin ventas'}
                </p>
              </div>

              {/* Categoría Más Vendida */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Categoría Más Vendida</p>
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 truncate">
                  {categoriaMasVendida ? categoriaMasVendida.nombre : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {categoriaMasVendida ? `${categoriaMasVendida.unidades.toFixed(0)} unidades` : 'Sin ventas'}
                </p>
              </div>

              {/* Marca Mayor Participación */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Marca con Mayor Participación</p>
                  <Award className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent" />
                </div>
                <p className="text-2xl font-bold text-gray-900 truncate">
                  {marcaMayorParticipacion ? marcaMayorParticipacion.nombre : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {marcaMayorParticipacion ? `${((marcaMayorParticipacion.ingresos / totalIngresos) * 100).toFixed(1)}% de facturación` : 'Sin ventas'}
                </p>
              </div>

              {/* Rotación de Inventario */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Rotación de Inventario</p>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{rotacionInventario.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Veces rotado</p>
              </div>

              {/* Días Promedio de Rotación */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Días Promedio de Rotación</p>
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{diasRotacion.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-2">Días hasta venta</p>
              </div>

              {/* Stock Promedio */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Stock Promedio Disponible</p>
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{stockPromedio.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-2">Unidades por producto</p>
              </div>

              {/* % Productos Sin Ventas */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">% Productos Sin Ventas</p>
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{porcentajeSinVentas.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-2">{productosSinVentas} productos sin movimiento</p>
              </div>

              {/* Promedio Ventas por Producto */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Promedio Ventas por Producto</p>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{promedioVentasPorProducto.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-2">Unidades promedio</p>
              </div>

              {/* Promedio Ingresos por Categoría */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Promedio Ingresos por Categoría</p>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${promedioIngresosPorCategoria.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Facturación promedio</p>
              </div>

              {/* Relación Ventas/Stock */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Relación Ventas/Stock</p>
                  <Percent className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{relacionVentasStock.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-2">Eficiencia de inventario</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Gráficos de Productos */}
            <div className="space-y-6">
              {/* TOP 10 Productos Más Vendidos por Unidades */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">TOP 10 Productos</span> Más Vendidos (Unidades)
                  </h3>
                  
                  {/* Buscador de productos */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={searchProductUnidades}
                      onChange={(e) => {
                        setSearchProductUnidades(e.target.value)
                        setShowSuggestionsUnidades(e.target.value.length > 0)
                      }}
                      onFocus={() => setShowSuggestionsUnidades(searchProductUnidades.length > 0)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-64"
                    />
                    
                    {/* Sugerencias */}
                    {showSuggestionsUnidades && searchProductUnidades && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {productosData
                          .sort((a, b) => b.unidades - a.unidades)
                          .filter(p => p.nombre.toLowerCase().includes(searchProductUnidades.toLowerCase()))
                          .slice(0, 10)
                          .map((producto, index) => {
                            const posicion = productosData.sort((a, b) => b.unidades - a.unidades).findIndex(p => p.nombre === producto.nombre) + 1
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  setSearchProductUnidades(producto.nombre)
                                  setShowSuggestionsUnidades(false)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-orange-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-700">#{posicion} {producto.nombre}</span>
                                  <span className="text-orange-600 font-semibold">{producto.unidades.toFixed(0)} u.</span>
                                </div>
                              </button>
                            )
                          })}
                        {productosData.filter(p => p.nombre.toLowerCase().includes(searchProductUnidades.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No se encontraron productos
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {productosData.length > 0 ? (
                  <div className="space-y-3">
                    {(() => {
                      const sortedByUnidades = [...productosData].sort((a, b) => b.unidades - a.unidades)
                      const maxUnidades = Math.max(...productosData.map(p => p.unidades))
                      
                      // Si hay búsqueda, mostrar solo ese producto
                      if (searchProductUnidades) {
                        const productoEncontrado = sortedByUnidades.find(p => 
                          p.nombre.toLowerCase() === searchProductUnidades.toLowerCase()
                        )
                        
                        if (productoEncontrado) {
                          const posicion = sortedByUnidades.findIndex(p => p.nombre === productoEncontrado.nombre) + 1
                          const width = (productoEncontrado.unidades / maxUnidades) * 100
                          
                          return (
                            <div className="space-y-4">
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-orange-900">
                                  <span className="font-bold">{productoEncontrado.nombre}</span> está en la posición <span className="font-bold">#{posicion}</span> de {sortedByUnidades.length} productos
                                </p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium text-gray-700">#{posicion}. {productoEncontrado.nombre}</span>
                                  <span className="font-semibold text-orange-600">{productoEncontrado.unidades.toFixed(0)} unidades</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                                    style={{ width: `${width}%` }}
                                  >
                                    <span className="text-xs font-semibold text-white">{width.toFixed(0)}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                      }
                      
                      // Mostrar TOP 10
                      return sortedByUnidades.slice(0, 10).map((producto, index) => {
                        const width = (producto.unidades / maxUnidades) * 100
                        const isTop3 = index < 3
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  isTop3 ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {index + 1}
                                </span>
                                <span className="font-medium text-gray-900 truncate">{producto.nombre}</span>
                              </div>
                              <span className="font-bold text-gray-900">{producto.unidades.toFixed(0)} u.</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  isTop3 ? 'bg-cyan-500' : 'bg-gray-900'
                                }`}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                )}
              </div>

              {/* TOP 10 Productos con Mayor Facturación */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">TOP 10 Productos</span> con Mayor Facturación
                  </h3>
                  
                  {/* Buscador de productos */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={searchProductFacturacion}
                      onChange={(e) => {
                        setSearchProductFacturacion(e.target.value)
                        setShowSuggestionsFacturacion(e.target.value.length > 0)
                      }}
                      onFocus={() => setShowSuggestionsFacturacion(searchProductFacturacion.length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestionsFacturacion(false), 200)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
                    />
                    
                    {/* Sugerencias */}
                    {showSuggestionsFacturacion && searchProductFacturacion && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {productosData
                          .sort((a, b) => b.ingresos - a.ingresos)
                          .filter(p => p.nombre.toLowerCase().includes(searchProductFacturacion.toLowerCase()))
                          .slice(0, 10)
                          .map((producto, index) => {
                            const posicion = productosData.sort((a, b) => b.ingresos - a.ingresos).findIndex(p => p.nombre === producto.nombre) + 1
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  setSearchProductFacturacion(producto.nombre)
                                  setShowSuggestionsFacturacion(false)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-green-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-700">#{posicion} {producto.nombre}</span>
                                  <span className="text-green-600 font-semibold">${producto.ingresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                                </div>
                              </button>
                            )
                          })}
                        {productosData.filter(p => p.nombre.toLowerCase().includes(searchProductFacturacion.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No se encontraron productos
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {productosData.length > 0 ? (
                  <div className="space-y-3">
                    {(() => {
                      const sortedByIngresos = [...productosData].sort((a, b) => b.ingresos - a.ingresos)
                      const maxIngresos = Math.max(...productosData.map(p => p.ingresos))
                      
                      // Si hay búsqueda, mostrar solo ese producto
                      if (searchProductFacturacion) {
                        const productoEncontrado = sortedByIngresos.find(p => 
                          p.nombre.toLowerCase() === searchProductFacturacion.toLowerCase()
                        )
                        
                        if (productoEncontrado) {
                          const posicion = sortedByIngresos.findIndex(p => p.nombre === productoEncontrado.nombre) + 1
                          const width = (productoEncontrado.ingresos / maxIngresos) * 100
                          
                          return (
                            <div className="space-y-4">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-900">
                                  <span className="font-bold">{productoEncontrado.nombre}</span> está en la posición <span className="font-bold">#{posicion}</span> de {sortedByIngresos.length} productos
                                </p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium text-gray-700">#{posicion}. {productoEncontrado.nombre}</span>
                                  <span className="font-semibold text-green-600">${productoEncontrado.ingresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                                    style={{ width: `${width}%` }}
                                  >
                                    <span className="text-xs font-semibold text-white">${productoEncontrado.ingresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                      }
                      
                      // Mostrar TOP 10
                      return sortedByIngresos.slice(0, 10).map((producto, index) => {
                        const width = (producto.ingresos / maxIngresos) * 100
                        const isTop3 = index < 3
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  isTop3 ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {index + 1}
                                </span>
                                <span className="font-medium text-gray-900 truncate">{producto.nombre}</span>
                              </div>
                              <span className="font-bold text-gray-900">${producto.ingresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  isTop3 ? 'bg-cyan-500' : 'bg-gray-900'
                                }`}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                )}
              </div>

              {/* Participación por Categoría (Pie Chart) */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">🎯 Participación por Categoría</h3>
                {categoriaData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    <svg viewBox="0 0 100 100" className="w-64 h-64">
                      {(() => {
                        const colors = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b']
                        let currentAngle = -90
                        return categoriaData.map((cat, index) => {
                          const percentage = (cat.ingresos / totalIngresos) * 100
                          const angle = (percentage / 100) * 360
                          const startAngle = currentAngle
                          const endAngle = currentAngle + angle
                          currentAngle = endAngle

                          const startRad = (startAngle * Math.PI) / 180
                          const endRad = (endAngle * Math.PI) / 180
                          const largeArc = angle > 180 ? 1 : 0

                          const x1 = 50 + 45 * Math.cos(startRad)
                          const y1 = 50 + 45 * Math.sin(startRad)
                          const x2 = 50 + 45 * Math.cos(endRad)
                          const y2 = 50 + 45 * Math.sin(endRad)

                          return (
                            <path
                              key={index}
                              d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={colors[index % colors.length]}
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                          )
                        })
                      })()}
                    </svg>
                    <div className="flex-1 space-y-2">
                      {categoriaData.map((cat, index) => {
                        const colors = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b']
                        const percentage = (cat.ingresos / totalIngresos) * 100
                        return (
                          <div key={index} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
                              <span className="text-sm text-gray-700">{cat.nombre}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                )}
              </div>

              {/* Participación por Marca (Donut Chart) */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">🏆 Participación por Marca</h3>
                {marcaData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    <svg viewBox="0 0 100 100" className="w-64 h-64">
                      {(() => {
                        const colors = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b']
                        let currentAngle = -90
                        return marcaData.map((marca, index) => {
                          const percentage = (marca.ingresos / totalIngresos) * 100
                          const angle = (percentage / 100) * 360
                          const startAngle = currentAngle
                          const endAngle = currentAngle + angle
                          currentAngle = endAngle

                          const startRad = (startAngle * Math.PI) / 180
                          const endRad = (endAngle * Math.PI) / 180
                          const largeArc = angle > 180 ? 1 : 0

                          const x1 = 50 + 45 * Math.cos(startRad)
                          const y1 = 50 + 45 * Math.sin(startRad)
                          const x2 = 50 + 45 * Math.cos(endRad)
                          const y2 = 50 + 45 * Math.sin(endRad)

                          return (
                            <path
                              key={index}
                              d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={colors[index % colors.length]}
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                          )
                        })
                      })()}
                      <circle cx="50" cy="50" r="25" fill="white" />
                    </svg>
                    <div className="flex-1 space-y-2">
                      {marcaData.map((marca, index) => {
                        const colors = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b']
                        const percentage = (marca.ingresos / totalIngresos) * 100
                        return (
                          <div key={index} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
                              <span className="text-sm text-gray-700">{marca.nombre}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                )}
              </div>

              {/* Comparación Unidades vs Facturación por Categoría */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Unidades Vendidas vs Facturación por Categoría</h3>
                {categoriaData.length > 0 ? (
                  <div className="space-y-4">
                    {categoriaData.map((cat, index) => {
                      const maxUnidades = Math.max(...categoriaData.map(c => c.unidades))
                      const maxIngresos = Math.max(...categoriaData.map(c => c.ingresos))
                      const widthUnidades = (cat.unidades / maxUnidades) * 100
                      const widthIngresos = (cat.ingresos / maxIngresos) * 100
                      
                      return (
                        <div key={index} className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">{cat.nombre}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">Unidades: {cat.unidades.toFixed(0)}</p>
                              <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                                <div 
                                  className="bg-blue-500 h-6 rounded-full transition-all duration-500"
                                  style={{ width: `${widthUnidades}%` }}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">Facturación: ${cat.ingresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                              <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                                <div 
                                  className="bg-green-500 h-6 rounded-full transition-all duration-500"
                                  style={{ width: `${widthIngresos}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                )}
              </div>

              {/* Indicador de Productos Sin Ventas (Gauge) */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">⚠️ Productos Sin Ventas</h3>
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-32">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      {/* Fondo del gauge */}
                      <path
                        d="M 20 90 A 80 80 0 0 1 180 90"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="20"
                        strokeLinecap="round"
                      />
                      {/* Valor del gauge */}
                      <path
                        d="M 20 90 A 80 80 0 0 1 180 90"
                        fill="none"
                        stroke={porcentajeSinVentas > 50 ? '#ef4444' : porcentajeSinVentas > 25 ? '#f59e0b' : '#10b981'}
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeDasharray={`${(porcentajeSinVentas / 100) * 251.2} 251.2`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                      <p className="text-4xl font-bold text-gray-900">{porcentajeSinVentas.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">{productosSinVentas} productos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Pareto (80/20) */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">📈 Análisis de Pareto (80/20)</h3>
                <p className="text-sm text-gray-600 mb-4">Identificación del 20% de productos que generan el 80% de las ventas</p>
                {productosData.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      let acumulado = 0
                      const productosConAcumulado = productosData.map(p => {
                        acumulado += p.ingresos
                        return {
                          ...p,
                          acumuladoPorcentaje: (acumulado / totalIngresos) * 100
                        }
                      })
                      
                      const productos80 = productosConAcumulado.filter(p => p.acumuladoPorcentaje <= 80)
                      const porcentajeProductos80 = (productos80.length / productosData.length) * 100
                      
                      return (
                        <>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                              <span className="font-bold">{productos80.length}</span> productos ({porcentajeProductos80.toFixed(1)}%) generan el <span className="font-bold">80%</span> de las ventas
                            </p>
                          </div>
                          <div className="space-y-2">
                            {productosConAcumulado.slice(0, 15).map((producto, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-8">{index + 1}</span>
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 truncate">{producto.nombre}</span>
                                    <span className="text-gray-600">{producto.acumuladoPorcentaje.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        producto.acumuladoPorcentaje <= 80 ? 'bg-blue-500' : 'bg-gray-400'
                                      }`}
                                      style={{ width: `${producto.acumuladoPorcentaje}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                )}
              </div>

              {/* Comparación Más Vendidos vs Más Rentables */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">⚖️ Productos Más Vendidos vs Más Rentables</h3>
                {productosData.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-blue-600 mb-3">🔥 Más Vendidos (Unidades)</h4>
                      <div className="space-y-2">
                        {productosData.slice(0, 5).sort((a, b) => b.unidades - a.unidades).map((producto, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 truncate">{index + 1}. {producto.nombre}</span>
                            <span className="text-sm font-bold text-blue-600">{producto.unidades.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-green-600 mb-3">💰 Más Rentables (Ingresos)</h4>
                      <div className="space-y-2">
                        {productosData.slice(0, 5).map((producto, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 truncate">{index + 1}. {producto.nombre}</span>
                            <span className="text-sm font-bold text-green-600">${producto.ingresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                )}
              </div>

              {/* Resumen de Rotación */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">🔄 Análisis de Rotación de Inventario</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-2">Rotación Promedio</p>
                    <p className="text-3xl font-bold text-blue-900">{rotacionInventario.toFixed(2)}x</p>
                    <p className="text-xs text-blue-600 mt-1">Veces rotado</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-700 mb-2">Días en Stock</p>
                    <p className="text-3xl font-bold text-purple-900">{diasRotacion.toFixed(0)}</p>
                    <p className="text-xs text-purple-600 mt-1">Días promedio</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <p className="text-sm text-orange-700 mb-2">Eficiencia</p>
                    <p className="text-3xl font-bold text-orange-900">{relacionVentasStock.toFixed(1)}%</p>
                    <p className="text-xs text-orange-600 mt-1">Ventas/Stock</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Vista de análisis de proveedores
  if (analysisType === 'proveedores') {
    const compras = invoices.filter(inv => inv.type === 'expense' && inv.metadata?.provider)
    const now = new Date()
    const unMesAtras = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    // Agrupar por proveedor con datos detallados
    const comprasPorProveedor = {}
    let totalUnidades = 0
    let totalDescuentos = 0
    let comprasConDescuento = 0
    const comprasPorMes = {}
    const categoriasPorProveedor = {}
    const marcasPorProveedor = {}
    
    compras.forEach(compra => {
      const proveedor = compra.metadata?.provider || 'Sin proveedor'
      const fecha = new Date(compra.date)
      const mesKey = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`
      const productos = compra.metadata?.productos || []
      const monto = parseFloat(compra.amount || 0)
      const pagado = compra.metadata?.paid === true || compra.metadata?.paid === 'si'
      
      // Inicializar proveedor
      if (!comprasPorProveedor[proveedor]) {
        comprasPorProveedor[proveedor] = { 
          total: 0, 
          cantidad: 0,
          ultimaCompra: compra.date,
          totalPagado: 0,
          totalPendiente: 0,
          unidades: 0,
          descuentos: 0,
          categorias: new Set(),
          marcas: new Set(),
          fechasCompras: []
        }
      }
      
      // Acumular datos
      comprasPorProveedor[proveedor].total += monto
      comprasPorProveedor[proveedor].cantidad += 1
      comprasPorProveedor[proveedor].fechasCompras.push(fecha)
      
      if (pagado) {
        comprasPorProveedor[proveedor].totalPagado += monto
      } else {
        comprasPorProveedor[proveedor].totalPendiente += monto
      }
      
      if (new Date(compra.date) > new Date(comprasPorProveedor[proveedor].ultimaCompra)) {
        comprasPorProveedor[proveedor].ultimaCompra = compra.date
      }
      
      // Procesar productos
      productos.forEach(prod => {
        const cantidad = parseFloat(prod.cantidad) || 0
        const descuento = parseFloat(prod.descuento) || 0
        const categoria = prod.categoria || 'Sin categoría'
        const marca = prod.marca || 'Sin marca'
        
        totalUnidades += cantidad
        comprasPorProveedor[proveedor].unidades += cantidad
        
        if (descuento > 0) {
          totalDescuentos += descuento
          comprasPorProveedor[proveedor].descuentos += descuento
          comprasConDescuento++
        }
        
        comprasPorProveedor[proveedor].categorias.add(categoria)
        comprasPorProveedor[proveedor].marcas.add(marca)
        
        // Acumular por categoría
        if (!categoriasPorProveedor[categoria]) {
          categoriasPorProveedor[categoria] = 0
        }
        categoriasPorProveedor[categoria] += cantidad
        
        // Acumular por marca
        if (!marcasPorProveedor[marca]) {
          marcasPorProveedor[marca] = 0
        }
        marcasPorProveedor[marca] += cantidad
      })
      
      // Compras por mes
      if (!comprasPorMes[mesKey]) {
        comprasPorMes[mesKey] = 0
      }
      comprasPorMes[mesKey] += monto
    })

    const totalCompras = Object.values(comprasPorProveedor).reduce((sum, val) => sum + val.total, 0)
    const totalPagado = Object.values(comprasPorProveedor).reduce((sum, val) => sum + val.totalPagado, 0)
    const totalPendiente = Object.values(comprasPorProveedor).reduce((sum, val) => sum + val.totalPendiente, 0)
    
    // Calcular rentabilidad por proveedor (ventas generadas con productos de ese proveedor)
    const ventasPorProveedor = {}
    invoices.filter(inv => inv.type === 'income').forEach(venta => {
      const productos = venta.metadata?.productos || []
      productos.forEach(prod => {
        const proveedor = prod.proveedor || 'Sin proveedor'
        const precioVenta = parseFloat(prod.precio) || 0
        const cantidad = parseFloat(prod.cantidad) || 0
        const totalVenta = precioVenta * cantidad
        
        if (!ventasPorProveedor[proveedor]) {
          ventasPorProveedor[proveedor] = 0
        }
        ventasPorProveedor[proveedor] += totalVenta
      })
    })

    const proveedoresData = Object.entries(comprasPorProveedor)
      .map(([nombre, data]) => {
        // Calcular frecuencia de compra (días promedio entre compras)
        let frecuenciaCompra = 0
        if (data.fechasCompras.length > 1) {
          const fechasOrdenadas = data.fechasCompras.sort((a, b) => a - b)
          let diasEntreCompras = []
          for (let i = 1; i < fechasOrdenadas.length; i++) {
            const dias = (fechasOrdenadas[i] - fechasOrdenadas[i-1]) / (1000 * 60 * 60 * 24)
            diasEntreCompras.push(dias)
          }
          frecuenciaCompra = diasEntreCompras.length > 0 
            ? diasEntreCompras.reduce((a, b) => a + b, 0) / diasEntreCompras.length 
            : 0
        }
        
        // Calcular rentabilidad
        const ventasGeneradas = ventasPorProveedor[nombre] || 0
        const ganancia = ventasGeneradas - data.total
        const margen = data.total > 0 ? (ganancia / ventasGeneradas) * 100 : 0
        
        return {
          nombre, 
          ...data,
          categorias: Array.from(data.categorias),
          marcas: Array.from(data.marcas),
          frecuenciaCompra,
          ventasGeneradas,
          ganancia,
          margen
        }
      })
      .sort((a, b) => b.total - a.total)
    
    // Calcular métricas
    const totalProveedoresRegistrados = proveedoresData.length
    const proveedoresActivos = proveedoresData.filter(p => new Date(p.ultimaCompra) >= unMesAtras).length
    const proveedoresInactivos = totalProveedoresRegistrados - proveedoresActivos
    
    // Variación mensual del gasto
    const mesesOrdenados = Object.keys(comprasPorMes).sort()
    const ultimoMes = mesesOrdenados[mesesOrdenados.length - 1]
    const penultimoMes = mesesOrdenados[mesesOrdenados.length - 2]
    const gastoMesActual = comprasPorMes[ultimoMes] || 0
    const gastoMesPasado = comprasPorMes[penultimoMes] || 0
    const variacionGastoTotal = gastoMesPasado > 0 
      ? ((gastoMesActual - gastoMesPasado) / gastoMesPasado) * 100
      : 0
    
    // Ticket promedio y compras promedio
    const ticketPromedio = compras.length > 0 ? totalCompras / compras.length : 0
    const comprasPromedioPorProveedor = totalProveedoresRegistrados > 0 ? compras.length / totalProveedoresRegistrados : 0
    
    // Frecuencia de compra (días entre compras)
    const fechasCompras = compras.map(c => new Date(c.date)).sort((a, b) => a - b)
    let diasEntreCompras = []
    for (let i = 1; i < fechasCompras.length; i++) {
      const dias = (fechasCompras[i] - fechasCompras[i-1]) / (1000 * 60 * 60 * 24)
      diasEntreCompras.push(dias)
    }
    const frecuenciaCompra = diasEntreCompras.length > 0 
      ? diasEntreCompras.reduce((a, b) => a + b, 0) / diasEntreCompras.length 
      : 0
    
    // Costo promedio por producto
    const costoPromedioPorProducto = totalUnidades > 0 ? totalCompras / totalUnidades : 0
    
    // Descuentos obtenidos (monto total ahorrado)
    const montoTotalDescuentos = totalDescuentos
    
    // Monto total en deuda
    const montoTotalDeuda = totalPendiente
    
    // Proveedores destacados
    const proveedorMasCompras = [...proveedoresData].sort((a, b) => b.cantidad - a.cantidad)[0]
    const proveedorMayorVolumen = proveedoresData[0] // Ya está ordenado por total
    const participacionProveedorPrincipal = proveedorMayorVolumen ? (proveedorMayorVolumen.total / totalCompras) * 100 : 0
    
    // Categoría, marca y modelo más comprados
    const categoriaMasComprada = Object.entries(categoriasPorProveedor).sort((a, b) => b[1] - a[1])[0]
    const marcaMasComprada = Object.entries(marcasPorProveedor).sort((a, b) => b[1] - a[1])[0]
    
    // Modelo más comprado
    const modelosPorProveedor = {}
    compras.forEach(compra => {
      const productos = compra.metadata?.productos || []
      productos.forEach(prod => {
        const modelo = prod.modelo || 'Sin modelo'
        const cantidad = parseFloat(prod.cantidad) || 0
        if (!modelosPorProveedor[modelo]) {
          modelosPorProveedor[modelo] = 0
        }
        modelosPorProveedor[modelo] += cantidad
      })
    })
    const modeloMasComprado = Object.entries(modelosPorProveedor).sort((a, b) => b[1] - a[1])[0]

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setAnalysisType(null)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Análisis</span> de Proveedores
            </h2>
            <p className="text-sm text-gray-600">Gestión y relación con proveedores</p>
          </div>
        </div>

        {/* Toggle Métricas/Gráficos */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setProveedorViewMode('metricas')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              proveedorViewMode === 'metricas'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => setProveedorViewMode('graficos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              proveedorViewMode === 'graficos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Gráficos
          </button>
        </div>

        {proveedoresData.length === 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <ShoppingCart className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay proveedores registrados</h3>
            <p className="text-gray-600">Registra compras con proveedores para ver el análisis</p>
          </div>
        ) : proveedorViewMode === 'metricas' ? (
          <>
            {/* Métricas de Proveedores */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Total Proveedores Registrados */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Total Proveedores</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Proveedores a los que se les realizó al menos una compra
                      </div>
                    </div>
                  </div>
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalProveedoresRegistrados}</p>
                <p className="text-xs text-gray-500 mt-2">Proveedores registrados</p>
              </div>

              {/* Total Proveedores Activos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Proveedores Activos</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Proveedores con compras en el último mes
                      </div>
                    </div>
                  </div>
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{proveedoresActivos}</p>
                <p className="text-xs text-gray-500 mt-2">Último mes</p>
              </div>

              {/* Total Proveedores Inactivos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Proveedores Inactivos</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Proveedores sin compras en el último mes. Considera revisar si necesitas reactivarlos
                      </div>
                    </div>
                  </div>
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{proveedoresInactivos}</p>
                <p className="text-xs text-gray-500 mt-2">Sin operaciones recientes</p>
              </div>

              {/* Gasto Total */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Gasto Total</p>
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${totalCompras.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Todas las compras</p>
              </div>

              {/* Variación del Gasto Total */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Variación del Gasto</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Cambio porcentual del gasto total comparado con el mes anterior
                      </div>
                    </div>
                  </div>
                  {variacionGastoTotal >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className={`text-3xl font-bold ${variacionGastoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {variacionGastoTotal >= 0 ? '+' : ''}{variacionGastoTotal.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">vs mes pasado</p>
              </div>

              {/* Ticket Promedio */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Monto promedio gastado en cada compra a proveedores
                      </div>
                    </div>
                  </div>
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${ticketPromedio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Por compra</p>
              </div>

              {/* Compras Promedio */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Compras Promedio</p>
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {comprasPromedioPorProveedor.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Por proveedor</p>
              </div>

              {/* Frecuencia de Compra */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Frecuencia de Compra</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Promedio de días entre cada compra realizada
                      </div>
                    </div>
                  </div>
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {frecuenciaCompra.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Días entre compras</p>
              </div>

              {/* Costo Promedio por Producto */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Costo por Producto</p>
                  <Package className="w-5 h-5 text-teal-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${costoPromedioPorProducto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Por unidad</p>
              </div>

              {/* Descuentos Obtenidos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Descuentos Obtenidos</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Monto total ahorrado por descuentos de proveedores
                      </div>
                    </div>
                  </div>
                  <TrendingDown className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ${montoTotalDescuentos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Total ahorrado</p>
              </div>

              {/* Monto Total en Deuda */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Deuda a Proveedores</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Monto total pendiente de pago a proveedores
                      </div>
                    </div>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">
                  ${montoTotalDeuda.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Pendiente de pago</p>
              </div>

              {/* Proveedor con Más Compras - RESALTADO */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-blue-900">⭐ Más Compras</p>
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xl font-bold text-blue-900 truncate">{proveedorMasCompras?.nombre || 'N/A'}</p>
                <p className="text-xs text-blue-700 mt-2">
                  {proveedorMasCompras?.cantidad || 0} compras realizadas
                </p>
              </div>

              {/* Proveedor con Mayor Volumen $ - RESALTADO */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-purple-900">⭐ Mayor Volumen $</p>
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-purple-900 truncate">{proveedorMayorVolumen?.nombre || 'N/A'}</p>
                <p className="text-xs text-purple-700 mt-2">
                  ${(proveedorMayorVolumen?.total || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* Participación del Proveedor Principal */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Dependencia</p>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        % de compras concentradas en el proveedor principal. Alto = mayor dependencia
                      </div>
                    </div>
                  </div>
                  <Percent className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {participacionProveedorPrincipal.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Del total de compras</p>
              </div>

              {/* Categoría Más Comprada - RESALTADO */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-green-900">⭐ Categoría Top</p>
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xl font-bold text-green-900 truncate">
                  {categoriaMasComprada?.[0] || 'N/A'}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  {(categoriaMasComprada?.[1] || 0).toFixed(0)} unidades
                </p>
              </div>

              {/* Marca Más Comprada - RESALTADO */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-orange-900">⭐ Marca Top</p>
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-xl font-bold text-orange-900 truncate">
                  {marcaMasComprada?.[0] || 'N/A'}
                </p>
                <p className="text-xs text-orange-700 mt-2">
                  {(marcaMasComprada?.[1] || 0).toFixed(0)} unidades
                </p>
              </div>

              {/* Modelo Más Comprado - RESALTADO */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300 rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-pink-900">⭐ Modelo Top</p>
                  <Package className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-xl font-bold text-pink-900 truncate">
                  {modeloMasComprado?.[0] || 'N/A'}
                </p>
                <p className="text-xs text-pink-700 mt-2">
                  {(modeloMasComprado?.[1] || 0).toFixed(0)} unidades
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Gráficos de Proveedores */}
            <div className="space-y-6">
              {/* TOP 10 Proveedores */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                      <ShoppingCart className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">TOP 10 Proveedores</h3>
                      <p className="text-xs text-gray-500">Ranking por volumen de compras</p>
                    </div>
                  </div>
                  
                  {/* Buscador de proveedores */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar proveedor..."
                      value={searchProveedor}
                      onChange={(e) => {
                        setSearchProveedor(e.target.value)
                        setShowSuggestionsProveedores(e.target.value.length > 0)
                      }}
                      onFocus={() => setShowSuggestionsProveedores(searchProveedor.length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestionsProveedores(false), 200)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64"
                    />
                    
                    {/* Sugerencias */}
                    {showSuggestionsProveedores && searchProveedor && proveedoresData && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {proveedoresData
                          .filter(p => p.nombre.toLowerCase().includes(searchProveedor.toLowerCase()))
                          .slice(0, 10)
                          .map((proveedor, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchProveedor(proveedor.nombre)
                                setShowSuggestionsProveedores(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-red-50 transition-all text-sm border-b border-gray-100 last:border-b-0 group"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">#{index + 1}</span>
                                  <span className="font-medium text-gray-700 group-hover:text-red-600 transition-colors">{proveedor.nombre}</span>
                                </div>
                                <span className="text-gray-900 font-semibold">${proveedor.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                              </div>
                            </button>
                          ))}
                        {proveedoresData.filter(p => p.nombre.toLowerCase().includes(searchProveedor.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No se encontraron proveedores
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {searchProveedor ? (
                  // Mostrar proveedor buscado
                  (() => {
                    const proveedorEncontrado = proveedoresData.find(p => 
                      p.nombre.toLowerCase() === searchProveedor.toLowerCase()
                    )
                    
                    if (!proveedorEncontrado) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          Proveedor no encontrado
                        </div>
                      )
                    }
                    
                    const posicion = proveedoresData.findIndex(p => p.nombre === proveedorEncontrado.nombre) + 1
                    
                    return (
                      <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-900">
                            <span className="font-semibold">{proveedorEncontrado.nombre}</span> está en la posición <span className="font-semibold">#{posicion}</span> de {proveedoresData.length} proveedores
                          </p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Posición</p>
                              <p className="text-2xl font-bold text-red-600">#{posicion}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Total Comprado</p>
                              <p className="text-2xl font-bold text-gray-900">${proveedorEncontrado.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Compras</p>
                              <p className="text-2xl font-bold text-gray-900">{proveedorEncontrado.cantidad}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">% del Total</p>
                              <p className="text-2xl font-bold text-red-600">{((proveedorEncontrado.total / totalCompras) * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Unidades</p>
                              <p className="text-lg font-semibold text-gray-900">{proveedorEncontrado.unidades.toFixed(0)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Frecuencia</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {proveedorEncontrado.frecuenciaCompra > 0 
                                  ? `${proveedorEncontrado.frecuenciaCompra.toFixed(0)} días` 
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Última Compra</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {new Date(proveedorEncontrado.ultimaCompra).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  // Mostrar TOP 10
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">#</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Proveedor</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Total Comprado</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">% del Total</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Compras</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Unidades</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Frecuencia</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Última Compra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proveedoresData.slice(0, 10).map((proveedor, index) => {
                          const isTop3 = index < 3
                          const positionBg = index === 0 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-300' : 
                                           index === 1 ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border border-gray-300' : 
                                           index === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 border border-orange-300' : 
                                           'bg-gray-100 text-gray-600'
                          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
                          
                          return (
                            <tr key={index} className={`border-b border-gray-200 hover:bg-red-50 transition-all hover:shadow-sm ${isTop3 ? 'bg-red-50/30' : ''}`}>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold ${positionBg} shadow-sm`}>
                                  {medal || (index + 1)}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                  <span className="text-sm font-semibold text-gray-900">{proveedor.nombre}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-right font-bold text-gray-900">
                                ${proveedor.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                              </td>
                              <td className="py-4 px-4 text-sm text-right">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-sm">
                                  {((proveedor.total / totalCompras) * 100).toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-right text-gray-700 font-semibold">
                                {proveedor.cantidad}
                              </td>
                              <td className="py-4 px-4 text-sm text-right text-gray-700 font-medium">
                                {proveedor.unidades.toFixed(0)}
                              </td>
                              <td className="py-4 px-4 text-sm text-right text-gray-600">
                                {proveedor.frecuenciaCompra > 0 
                                  ? `${proveedor.frecuenciaCompra.toFixed(0)} días` 
                                  : 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm text-right text-gray-600">
                                {new Date(proveedor.ultimaCompra).toLocaleDateString('es-AR')}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Gráficos de Análisis */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* TOP 10 Proveedores Más Rentables */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">TOP 10 Más Rentables</h3>
                      <p className="text-xs text-gray-500">Por ganancia neta generada</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {proveedoresData
                      .sort((a, b) => b.ganancia - a.ganancia)
                      .slice(0, 10)
                      .map((proveedor, index) => {
                        const maxGanancia = Math.max(...proveedoresData.map(p => p.ganancia))
                        const porcentaje = (proveedor.ganancia / maxGanancia) * 100
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700 truncate">{proveedor.nombre}</span>
                              <span className="font-bold text-green-600">
                                ${proveedor.ganancia.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all"
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Comparación Comprado vs Ganancia */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Comprado vs Ganancia</h3>
                      <p className="text-xs text-gray-500">TOP 5 proveedores</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {proveedoresData.slice(0, 5).map((proveedor, index) => {
                      const maxValor = Math.max(
                        ...proveedoresData.slice(0, 5).map(p => Math.max(p.total, p.ganancia))
                      )
                      const porcentajeComprado = (proveedor.total / maxValor) * 100
                      const porcentajeGanancia = (proveedor.ganancia / maxValor) * 100
                      
                      return (
                        <div key={index} className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">{proveedor.nombre}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-20">Comprado:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full"
                                  style={{ width: `${porcentajeComprado}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-700 w-24 text-right">
                                ${proveedor.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-20">Ganancia:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                                  style={{ width: `${porcentajeGanancia}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-green-600 w-24 text-right">
                                ${proveedor.ganancia.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Gráficos de Torta - Distribución */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Distribución de Ganancia por Proveedor */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <PieChart className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Distribución de Ganancia</h3>
                      <p className="text-xs text-gray-500">Por proveedor</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      const totalGanancias = proveedoresData.reduce((sum, p) => sum + p.ganancia, 0)
                      const top5 = proveedoresData
                        .sort((a, b) => b.ganancia - a.ganancia)
                        .slice(0, 5)
                      const otros = proveedoresData.slice(5).reduce((sum, p) => sum + p.ganancia, 0)
                      
                      const colores = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#e5e7eb']
                      
                      return (
                        <>
                          {top5.map((proveedor, index) => {
                            const porcentaje = (proveedor.ganancia / totalGanancias) * 100
                            return (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: colores[index] }}
                                  ></div>
                                  <span className="text-sm text-gray-700 truncate max-w-[150px]">{proveedor.nombre}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{porcentaje.toFixed(1)}%</span>
                              </div>
                            )
                          })}
                          {otros > 0 && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: colores[5] }}
                                ></div>
                                <span className="text-sm text-gray-700">Otros</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {((otros / totalGanancias) * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Distribución por Categorías */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Categorías</span> en Compras
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      const totalCategorias = Object.values(categoriasPorProveedor).reduce((a, b) => a + b, 0)
                      const top5Categorias = Object.entries(categoriasPorProveedor)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                      
                      return top5Categorias.map(([categoria, cantidad], index) => {
                        const porcentaje = (cantidad / totalCategorias) * 100
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{categoria}</span>
                              <span className="text-sm font-bold text-gray-900">{porcentaje.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gray-900 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Distribución por Marcas */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Marcas</span> en Compras
                  </h3>
                  
                  <select
                    value={categoriaSeleccionadaMarcas}
                    onChange={(e) => setCategoriaSeleccionadaMarcas(e.target.value)}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="todas">Todas las categorías</option>
                    {Object.keys(categoriasPorProveedor).map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <div className="space-y-3">
                    {(() => {
                      const marcasFiltradas = {}
                      compras.forEach(compra => {
                        const productos = compra.metadata?.productos || []
                        productos.forEach(prod => {
                          const categoria = prod.categoria || 'Sin categoría'
                          const marca = prod.marca || 'Sin marca'
                          const cantidad = parseFloat(prod.cantidad) || 0
                          
                          if (categoriaSeleccionadaMarcas === 'todas' || categoria === categoriaSeleccionadaMarcas) {
                            if (!marcasFiltradas[marca]) {
                              marcasFiltradas[marca] = 0
                            }
                            marcasFiltradas[marca] += cantidad
                          }
                        })
                      })
                      
                      const totalMarcas = Object.values(marcasFiltradas).reduce((a, b) => a + b, 0)
                      const top5Marcas = Object.entries(marcasFiltradas)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                      
                      const colores = ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3']
                      
                      return top5Marcas.map(([marca, cantidad], index) => {
                        const porcentaje = (cantidad / totalMarcas) * 100
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: colores[index] }}
                              ></div>
                              <span className="text-sm text-gray-700 truncate max-w-[120px]">{marca}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{porcentaje.toFixed(1)}%</span>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>

              {/* Distribución por Modelos */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200">
                    <Package className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Modelos en Compras</h3>
                    <p className="text-xs text-gray-500">Por categoría seleccionada</p>
                  </div>
                </div>
                
                <select
                  value={categoriaSeleccionadaModelos}
                  onChange={(e) => setCategoriaSeleccionadaModelos(e.target.value)}
                  className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="todas">Todas las categorías</option>
                  {Object.keys(categoriasPorProveedor).map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {(() => {
                    const modelosFiltrados = {}
                    compras.forEach(compra => {
                      const productos = compra.metadata?.productos || []
                      productos.forEach(prod => {
                        const categoria = prod.categoria || 'Sin categoría'
                        const modelo = prod.modelo || 'Sin modelo'
                        const cantidad = parseFloat(prod.cantidad) || 0
                        
                        if (categoriaSeleccionadaModelos === 'todas' || categoria === categoriaSeleccionadaModelos) {
                          if (!modelosFiltrados[modelo]) {
                            modelosFiltrados[modelo] = 0
                          }
                          modelosFiltrados[modelo] += cantidad
                        }
                      })
                    })
                    
                    const totalModelos = Object.values(modelosFiltrados).reduce((a, b) => a + b, 0)
                    const top10Modelos = Object.entries(modelosFiltrados)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                    
                    const colores = ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe', 
                                    '#0891b2', '#0e7490', '#155e75', '#164e63', '#e5e7eb']
                    
                    return top10Modelos.map(([modelo, cantidad], index) => {
                      const porcentaje = (cantidad / totalModelos) * 100
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: colores[index] }}
                            ></div>
                            <span className="text-sm text-gray-700 truncate max-w-[120px]">{modelo}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{porcentaje.toFixed(1)}%</span>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Gráficos de Evolución y Comparación */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Evolución Mensual de Rentabilidad */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Evolución de Rentabilidad</h3>
                        <p className="text-xs text-gray-500">Margen promedio mensual</p>
                      </div>
                    </div>
                    
                    <select
                      value={periodoRentabilidad}
                      onChange={(e) => setPeriodoRentabilidad(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 min-h-[44px] sm:min-h-0 touch-manipulation focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="3">3 meses</option>
                      <option value="6">6 meses</option>
                      <option value="12">12 meses</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    {(() => {
                      const rentabilidadMensual = {}
                      const mesesAtras = parseInt(periodoRentabilidad)
                      const fechaLimite = new Date()
                      fechaLimite.setMonth(fechaLimite.getMonth() - mesesAtras)
                      
                      compras.filter(c => new Date(c.date) >= fechaLimite).forEach(compra => {
                        const fecha = new Date(compra.date)
                        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
                        const monto = parseFloat(compra.amount || 0)
                        
                        if (!rentabilidadMensual[mesKey]) {
                          rentabilidadMensual[mesKey] = { compras: 0, ventas: 0 }
                        }
                        rentabilidadMensual[mesKey].compras += monto
                      })
                      
                      invoices.filter(inv => inv.type === 'income' && new Date(inv.date) >= fechaLimite).forEach(venta => {
                        const fecha = new Date(venta.date)
                        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
                        const productos = venta.metadata?.productos || []
                        
                        productos.forEach(prod => {
                          const precioVenta = parseFloat(prod.precio) || 0
                          const cantidad = parseFloat(prod.cantidad) || 0
                          const totalVenta = precioVenta * cantidad
                          
                          if (!rentabilidadMensual[mesKey]) {
                            rentabilidadMensual[mesKey] = { compras: 0, ventas: 0 }
                          }
                          rentabilidadMensual[mesKey].ventas += totalVenta
                        })
                      })
                      
                      const mesesOrdenados = Object.keys(rentabilidadMensual).sort()
                      const maxMargen = Math.max(...mesesOrdenados.map(mes => {
                        const data = rentabilidadMensual[mes]
                        return data.ventas > 0 ? ((data.ventas - data.compras) / data.ventas) * 100 : 0
                      }))
                      
                      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                      
                      return mesesOrdenados.map((mesKey, index) => {
                        const [year, month] = mesKey.split('-')
                        const nombreMes = monthNames[parseInt(month) - 1]
                        const data = rentabilidadMensual[mesKey]
                        const margen = data.ventas > 0 ? ((data.ventas - data.compras) / data.ventas) * 100 : 0
                        const porcentaje = maxMargen > 0 ? (Math.abs(margen) / maxMargen) * 100 : 0
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700">{nombreMes} {year}</span>
                              <span className={`font-bold ${margen >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {margen.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  margen >= 0 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                    : 'bg-gradient-to-r from-red-500 to-red-600'
                                }`}
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Gasto Mensual vs Margen */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                      <BarChart3 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Gasto vs Margen Mensual</h3>
                      <p className="text-xs text-gray-500">Últimos 6 meses</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {(() => {
                      const gastoMensual = {}
                      const fechaLimite = new Date()
                      fechaLimite.setMonth(fechaLimite.getMonth() - 6)
                      
                      compras.filter(c => new Date(c.date) >= fechaLimite).forEach(compra => {
                        const fecha = new Date(compra.date)
                        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
                        const monto = parseFloat(compra.amount || 0)
                        
                        if (!gastoMensual[mesKey]) {
                          gastoMensual[mesKey] = { gasto: 0, ventas: 0 }
                        }
                        gastoMensual[mesKey].gasto += monto
                      })
                      
                      invoices.filter(inv => inv.type === 'income' && new Date(inv.date) >= fechaLimite).forEach(venta => {
                        const fecha = new Date(venta.date)
                        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
                        const productos = venta.metadata?.productos || []
                        
                        productos.forEach(prod => {
                          const precioVenta = parseFloat(prod.precio) || 0
                          const cantidad = parseFloat(prod.cantidad) || 0
                          const totalVenta = precioVenta * cantidad
                          
                          if (!gastoMensual[mesKey]) {
                            gastoMensual[mesKey] = { gasto: 0, ventas: 0 }
                          }
                          gastoMensual[mesKey].ventas += totalVenta
                        })
                      })
                      
                      const mesesOrdenados = Object.keys(gastoMensual).sort()
                      const maxGasto = Math.max(...mesesOrdenados.map(mes => gastoMensual[mes].gasto))
                      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                      
                      return mesesOrdenados.map((mesKey, index) => {
                        const [year, month] = mesKey.split('-')
                        const nombreMes = monthNames[parseInt(month) - 1]
                        const data = gastoMensual[mesKey]
                        const margen = data.ventas > 0 ? ((data.ventas - data.gasto) / data.ventas) * 100 : 0
                        const porcentajeGasto = (data.gasto / maxGasto) * 100
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">{nombreMes} {year}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-600">
                                  ${data.gasto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </span>
                                <span className={`text-xs font-semibold ${margen >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {margen.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full"
                                style={{ width: `${porcentajeGasto}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>

              {/* Análisis de Pareto */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl border border-rose-200">
                    <TrendingUp className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Análisis de Pareto (80/20)</h3>
                    <p className="text-xs text-gray-500">Proveedores que generan el 80% de las ganancias</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(() => {
                    const proveedoresOrdenados = [...proveedoresData].sort((a, b) => b.ganancia - a.ganancia)
                    const totalGanancias = proveedoresOrdenados.reduce((sum, p) => sum + p.ganancia, 0)
                    let acumulado = 0
                    const proveedores80 = []
                    
                    for (const proveedor of proveedoresOrdenados) {
                      acumulado += proveedor.ganancia
                      proveedores80.push({
                        ...proveedor,
                        acumulado: (acumulado / totalGanancias) * 100
                      })
                      if (acumulado / totalGanancias >= 0.8) break
                    }
                    
                    return (
                      <>
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-rose-900">
                            <span className="font-bold">{proveedores80.length}</span> proveedores generan el <span className="font-bold">80%</span> de las ganancias totales
                          </p>
                        </div>
                        {proveedores80.map((proveedor, index) => {
                          const porcentaje = (proveedor.ganancia / totalGanancias) * 100
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">{proveedor.nombre}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">{porcentaje.toFixed(1)}%</span>
                                  <span className="text-xs font-semibold text-rose-600">
                                    Acum: {proveedor.acumulado.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-rose-500 to-rose-600 h-2 rounded-full"
                                  style={{ width: `${proveedor.acumulado}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Vista de análisis financiero
  if (analysisType === 'financiero') {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setAnalysisType(null)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Análisis</span> Financiero
            </h2>
            <p className="text-sm text-gray-600">Métricas y gráficos financieros detallados</p>
          </div>
        </div>

        {/* Selector de Período */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Período de Análisis</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Tipo de Período</label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General (Todo)</option>
                <option value="mes">Un Mes</option>
                <option value="rango">Varios Meses</option>
              </select>
            </div>

            {periodType === 'mes' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Mes</label>
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {monthNames.map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Año</label>
                  <input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {periodType === 'rango' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Desde</label>
                  <div className="flex gap-2">
                    <select
                      value={startMonth}
                      onChange={(e) => setStartMonth(parseInt(e.target.value))}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {monthNames.map((month, idx) => (
                        <option key={idx} value={idx}>{month.substring(0, 3)}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={startYear}
                      onChange={(e) => setStartYear(parseInt(e.target.value))}
                      className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Hasta</label>
                  <div className="flex gap-2">
                    <select
                      value={endMonth}
                      onChange={(e) => setEndMonth(parseInt(e.target.value))}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {monthNames.map((month, idx) => (
                        <option key={idx} value={idx}>{month.substring(0, 3)}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={endYear}
                      onChange={(e) => setEndYear(parseInt(e.target.value))}
                      className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Toggle Métricas/Gráficos */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setFinancialViewMode('metricas')}
            className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
              financialViewMode === 'metricas'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => setFinancialViewMode('graficos')}
            className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
              financialViewMode === 'graficos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Gráficos
          </button>
        </div>

        {/* Contenido según modo seleccionado */}
        {!financialMetrics ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay datos en este período</h3>
            <p className="text-gray-600">Selecciona otro período para ver el análisis</p>
          </div>
        ) : (
          <>
            {financialViewMode === 'metricas' ? (
              <div className="space-y-6">
                {/* Selector de Promedio */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Promedio de ingresos por:</label>
                    <select
                      value={promedioType}
                      onChange={(e) => setPromedioType(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 min-h-[44px] sm:min-h-0 touch-manipulation focus:ring-blue-500"
                    >
                      <option value="dia">Día</option>
                      <option value="mes">Mes</option>
                      <option value="año">Año</option>
                    </select>
                  </div>
                </div>

                {/* Métricas Principales - Ingresos y Gastos */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="ingresos">
                        <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                      </FinancialTooltip>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ${financialMetrics.ingresosTotales.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-gray-600">Promedio de Ingresos</p>
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ${financialMetrics.promedioIngresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Por {promedioType}</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="gastos_operativos">
                        <p className="text-sm font-medium text-gray-600">Gastos Totales</p>
                      </FinancialTooltip>
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ${financialMetrics.gastosTotales.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                {/* Ganancias */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="ganancia_bruta">
                        <p className="text-sm font-medium text-gray-600">Ganancia Bruta</p>
                      </FinancialTooltip>
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className={`text-3xl font-bold ${
                      financialMetrics.gananciaBruta >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {financialMetrics.gananciaBruta >= 0 ? '+' : ''}${financialMetrics.gananciaBruta.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Ingresos - Costos de productos</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="utilidad_neta">
                        <p className="text-sm font-medium text-gray-600">Ganancia Neta</p>
                      </FinancialTooltip>
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className={`text-3xl font-bold ${
                      financialMetrics.gananciaNeta >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {financialMetrics.gananciaNeta >= 0 ? '+' : ''}${financialMetrics.gananciaNeta.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Ganancia bruta - Gastos operativos</p>
                  </div>
                </div>

                {/* Márgenes y Rentabilidad */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="margen_bruto">
                        <p className="text-sm font-medium text-gray-600">Margen Bruto</p>
                      </FinancialTooltip>
                      <Percent className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {financialMetrics.margenBruto.toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="margen_neto">
                        <p className="text-sm font-medium text-gray-600">Margen Neto</p>
                      </FinancialTooltip>
                      <Percent className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {financialMetrics.margenNeto.toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="rentabilidad">
                        <p className="text-sm font-medium text-gray-600">Rentabilidad Total</p>
                      </FinancialTooltip>
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {financialMetrics.rentabilidadTotal.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Ganancia neta / Ingresos</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="roi">
                        <p className="text-sm font-medium text-gray-600">ROI</p>
                      </FinancialTooltip>
                      <TrendingUpIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <p className={`text-3xl font-bold ${
                      financialMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {financialMetrics.roi.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Retorno de inversión</p>
                  </div>
                </div>

                {/* Indicadores Financieros */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="ratio_liquidez">
                        <p className="text-sm font-medium text-gray-600">Ratio de Liquidez</p>
                      </FinancialTooltip>
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {financialMetrics.ratioLiquidez.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {financialMetrics.ratioLiquidez >= 1.5 ? '✓ Excelente' : financialMetrics.ratioLiquidez >= 1 ? '✓ Bueno' : '⚠ Bajo'}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="flujo_caja">
                        <p className="text-sm font-medium text-gray-600">Flujo de Caja</p>
                      </FinancialTooltip>
                      <LineChart className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className={`text-3xl font-bold ${
                      financialMetrics.flujoCaja >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {financialMetrics.flujoCaja >= 0 ? '+' : ''}${financialMetrics.flujoCaja.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FinancialTooltip term="endeudamiento">
                        <p className="text-sm font-medium text-gray-600">% Endeudamiento</p>
                      </FinancialTooltip>
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {financialMetrics.porcentajeEndeudamiento.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {financialMetrics.porcentajeEndeudamiento < 30 ? '✓ Bajo' : financialMetrics.porcentajeEndeudamiento < 60 ? '⚠ Moderado' : '⚠ Alto'}
                    </p>
                  </div>
                </div>

                {/* Capacidad de Pago */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-gray-600">Días Promedio para Cobrar</p>
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round(financialMetrics.diasPromedioCobro)} días
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Tiempo promedio para cobrar ventas</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-gray-600">Días Promedio para Pagar</p>
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round(financialMetrics.diasPromedioPago)} días
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Tiempo promedio para pagar deudas</p>
                  </div>
                </div>

                {/* Punto de Equilibrio */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <FinancialTooltip term="punto_equilibrio">
                      <h3 className="text-lg font-semibold">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Punto de Equilibrio</span>
                      </h3>
                    </FinancialTooltip>
                    
                    {/* Selector de Categoría */}
                    <select
                      value={categoriaEquilibrio}
                      onChange={(e) => setCategoriaEquilibrio(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 min-h-[44px] sm:min-h-0 touch-manipulation focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="todas">Todas las categorías</option>
                      {(() => {
                        const categorias = new Set()
                        invoices.filter(inv => inv.type === 'income').forEach(inv => {
                          const productos = inv.metadata?.productos || []
                          productos.forEach(prod => {
                            const categoria = prod.categoria || 'Sin categoría'
                            categorias.add(categoria)
                          })
                        })
                        return Array.from(categorias).map((cat, index) => (
                          <option key={index} value={cat}>{cat}</option>
                        ))
                      })()}
                    </select>
                  </div>
                  
                  {(() => {
                    // Calcular precio promedio por unidad según categoría
                    let totalVentas = 0
                    let totalUnidades = 0
                    
                    invoices.filter(inv => inv.type === 'income').forEach(inv => {
                      const productos = inv.metadata?.productos || []
                      productos.forEach(prod => {
                        const categoria = prod.categoria || 'Sin categoría'
                        if (categoriaEquilibrio === 'todas' || categoria === categoriaEquilibrio) {
                          const precio = parseFloat(prod.precio) || 0
                          const cantidad = parseFloat(prod.cantidad) || 0
                          totalVentas += precio * cantidad
                          totalUnidades += cantidad
                        }
                      })
                    })
                    
                    const precioPromedio = totalUnidades > 0 ? totalVentas / totalUnidades : 0
                    const unidadesEquilibrio = precioPromedio > 0 ? financialMetrics.puntoEquilibrio / precioPromedio : 0
                    
                    const porcentajeAlcanzado = (financialMetrics.ingresosTotales / financialMetrics.puntoEquilibrio) * 100
                    const alcanzado = financialMetrics.ingresosTotales >= financialMetrics.puntoEquilibrio
                    
                    return (
                      <div className="space-y-6">
                        {/* Métricas principales */}
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">Punto de Equilibrio</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ${financialMetrics.puntoEquilibrio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">Ingresos Actuales</p>
                            <p className={`text-2xl font-bold ${alcanzado ? 'text-green-600' : 'text-orange-600'}`}>
                              ${financialMetrics.ingresosTotales.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">Unidades Necesarias</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {unidadesEquilibrio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              @ ${precioPromedio.toLocaleString('es-AR', { maximumFractionDigits: 0 })} c/u
                            </p>
                          </div>
                        </div>
                        
                        {/* Gráfico visual mejorado */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Progreso hacia el equilibrio</span>
                            <span className={`text-sm font-bold ${alcanzado ? 'text-green-600' : 'text-orange-600'}`}>
                              {porcentajeAlcanzado.toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                              <div
                                className={`h-6 rounded-full transition-all duration-500 ${
                                  alcanzado ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, porcentajeAlcanzado)}%`
                                }}
                              />
                            </div>
                            {/* Línea del objetivo */}
                            <div className="absolute top-0 right-0 h-6 w-0.5 bg-gray-900" />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-600">
                              {alcanzado ? (
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                  <CheckCircle className="w-4 h-4" />
                                  Superado por ${(financialMetrics.ingresosTotales - financialMetrics.puntoEquilibrio).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-orange-600 font-medium">
                                  <AlertCircle className="w-4 h-4" />
                                  Faltan ${(financialMetrics.puntoEquilibrio - financialMetrics.ingresosTotales).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">Objetivo: 100%</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Cotizaciones */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Cotizaciones</h3>
                  </div>
                  <DolarCard />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Evolución Mensual */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">📈 Evolución de Ingresos, Gastos y Ganancias por Mes</h3>
                  {financialMetrics.evolucionData.length > 0 ? (
                    <div className="space-y-4">
                      {financialMetrics.evolucionData.map((data, index) => {
                        const maxValue = Math.max(
                          ...financialMetrics.evolucionData.map(d => Math.max(d.ingresos, d.gastos, Math.abs(d.gananciaBruta), Math.abs(d.gananciaNeta)))
                        )
                        const [year, month] = data.mes.split('-')
                        const monthName = monthNames[parseInt(month) - 1]
                        
                        return (
                          <div key={index} className="space-y-3">
                            <p className="text-sm font-bold text-gray-900">{monthName} {year}</p>
                            <div className="space-y-2">
                              {/* Ingresos */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">Ingresos</span>
                                  <span className="text-xs font-bold text-green-600">
                                    ${data.ingresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                  <div
                                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${(data.ingresos / maxValue) * 100}%` }}
                                  />
                                </div>
                              </div>
                              
                              {/* Gastos */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">Gastos</span>
                                  <span className="text-xs font-bold text-red-600">
                                    ${data.gastos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                  <div
                                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${(data.gastos / maxValue) * 100}%` }}
                                  />
                                </div>
                              </div>
                              
                              {/* Ganancia Bruta */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">Ganancia Bruta</span>
                                  <span className={`text-xs font-bold ${
                                    data.gananciaBruta >= 0 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent' : 'text-orange-600'
                                  }`}>
                                    {data.gananciaBruta >= 0 ? '+' : ''}${Math.abs(data.gananciaBruta).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      data.gananciaBruta >= 0 ? 'bg-cyan-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${(Math.abs(data.gananciaBruta) / maxValue) * 100}%` }}
                                  />
                                </div>
                              </div>
                              
                              {/* Ganancia Neta */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">Ganancia Neta</span>
                                  <span className={`text-xs font-bold ${
                                    data.gananciaNeta >= 0 ? 'text-blue-600' : 'text-orange-600'
                                  }`}>
                                    {data.gananciaNeta >= 0 ? '+' : ''}${Math.abs(data.gananciaNeta).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      data.gananciaNeta >= 0 ? 'bg-blue-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${(Math.abs(data.gananciaNeta) / maxValue) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No hay datos para mostrar</p>
                  )}
                </div>

                {/* Distribución Ingresos vs Gastos vs Ganancia Bruta vs Ganancia Neta */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Distribución Financiera</h3>
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    <div className="flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-64 h-64">
                        {(() => {
                          const total = financialMetrics.ingresosTotales + financialMetrics.gastosTotales + Math.abs(financialMetrics.gananciaBruta) + Math.abs(financialMetrics.gananciaNeta)
                          const ingresosAngle = (financialMetrics.ingresosTotales / total) * 360
                          const gastosAngle = (financialMetrics.gastosTotales / total) * 360
                          const gananciaBrutaAngle = (Math.abs(financialMetrics.gananciaBruta) / total) * 360
                          const gananciaNetaAngle = (Math.abs(financialMetrics.gananciaNeta) / total) * 360

                          let currentAngle = -90

                          const createPath = (angle, startAngle) => {
                            const endAngle = startAngle + angle
                            const largeArc = angle > 180 ? 1 : 0
                            const startRad = (startAngle * Math.PI) / 180
                            const endRad = (endAngle * Math.PI) / 180
                            
                            // Arco exterior
                            const x1 = 50 + 45 * Math.cos(startRad)
                            const y1 = 50 + 45 * Math.sin(startRad)
                            const x2 = 50 + 45 * Math.cos(endRad)
                            const y2 = 50 + 45 * Math.sin(endRad)
                            
                            // Arco interior (donut)
                            const x3 = 50 + 25 * Math.cos(endRad)
                            const y3 = 50 + 25 * Math.sin(endRad)
                            const x4 = 50 + 25 * Math.cos(startRad)
                            const y4 = 50 + 25 * Math.sin(startRad)
                            
                            return `M ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A 25 25 0 ${largeArc} 0 ${x4} ${y4} Z`
                          }

                          const ingresosPath = createPath(ingresosAngle, currentAngle)
                          currentAngle += ingresosAngle
                          const gastosPath = createPath(gastosAngle, currentAngle)
                          currentAngle += gastosAngle
                          const gananciaBrutaPath = createPath(gananciaBrutaAngle, currentAngle)
                          currentAngle += gananciaBrutaAngle
                          const gananciaNetaPath = createPath(gananciaNetaAngle, currentAngle)

                          return (
                            <>
                              <path d={ingresosPath} fill="#10b981" className="hover:opacity-80 transition-opacity cursor-pointer" />
                              <path d={gastosPath} fill="#ef4444" className="hover:opacity-80 transition-opacity cursor-pointer" />
                              <path d={gananciaBrutaPath} fill="#06b6d4" className="hover:opacity-80 transition-opacity cursor-pointer" />
                              <path d={gananciaNetaPath} fill="#3b82f6" className="hover:opacity-80 transition-opacity cursor-pointer" />
                              <circle cx="50" cy="50" r="20" fill="white" />
                              <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-bold fill-gray-900">
                                Total
                              </text>
                              <text x="50" y="56" textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-gray-600">
                                ${(total / 1000).toFixed(0)}K
                              </text>
                            </>
                          )
                        })()}
                      </svg>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-green-500" />
                          <span className="text-sm font-medium text-gray-700">Ingresos</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${financialMetrics.ingresosTotales.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-600">
                            {((financialMetrics.ingresosTotales / (financialMetrics.ingresosTotales + financialMetrics.gastosTotales + Math.abs(financialMetrics.gananciaBruta) + Math.abs(financialMetrics.gananciaNeta))) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-red-500" />
                          <span className="text-sm font-medium text-gray-700">Gastos</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${financialMetrics.gastosTotales.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-600">
                            {((financialMetrics.gastosTotales / (financialMetrics.ingresosTotales + financialMetrics.gastosTotales + Math.abs(financialMetrics.gananciaBruta) + Math.abs(financialMetrics.gananciaNeta))) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-cyan-500" />
                          <span className="text-sm font-medium text-gray-700">Ganancia Bruta</span>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${financialMetrics.gananciaBruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {financialMetrics.gananciaBruta >= 0 ? '+' : ''}${financialMetrics.gananciaBruta.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-600">
                            {((Math.abs(financialMetrics.gananciaBruta) / (financialMetrics.ingresosTotales + financialMetrics.gastosTotales + Math.abs(financialMetrics.gananciaBruta) + Math.abs(financialMetrics.gananciaNeta))) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-blue-500" />
                          <span className="text-sm font-medium text-gray-700">Ganancia Neta</span>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${financialMetrics.gananciaNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {financialMetrics.gananciaNeta >= 0 ? '+' : ''}${financialMetrics.gananciaNeta.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-600">
                            {((Math.abs(financialMetrics.gananciaNeta) / (financialMetrics.ingresosTotales + financialMetrics.gastosTotales + Math.abs(financialMetrics.gananciaBruta) + Math.abs(financialMetrics.gananciaNeta))) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparativa de Márgenes */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparativa de Márgenes</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="56" 
                            fill="none" 
                            stroke="#3b82f6" 
                            strokeWidth="12"
                            strokeDasharray={`${(financialMetrics.margenBruto / 100) * 351.86} 351.86`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">{financialMetrics.margenBruto.toFixed(1)}%</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Margen Bruto</p>
                    </div>

                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="56" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="12"
                            strokeDasharray={`${(financialMetrics.margenNeto / 100) * 351.86} 351.86`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">{financialMetrics.margenNeto.toFixed(1)}%</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Margen Neto</p>
                    </div>

                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="56" 
                            fill="none" 
                            stroke="#f59e0b" 
                            strokeWidth="12"
                            strokeDasharray={`${(Math.abs(financialMetrics.roi) / 100) * 351.86} 351.86`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${financialMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {financialMetrics.roi.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700">ROI</p>
                    </div>
                  </div>
                </div>

                {/* Salud Financiera */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Indicadores de Salud Financiera</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Ratio de Liquidez</span>
                        <span className="text-sm font-bold text-gray-900">{financialMetrics.ratioLiquidez.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            financialMetrics.ratioLiquidez >= 1.5 ? 'bg-green-500' : 
                            financialMetrics.ratioLiquidez >= 1 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (financialMetrics.ratioLiquidez / 2) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {financialMetrics.ratioLiquidez >= 1.5 ? 'Excelente capacidad de pago' : 
                         financialMetrics.ratioLiquidez >= 1 ? 'Buena capacidad de pago' : 'Capacidad de pago limitada'}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Nivel de Endeudamiento</span>
                        <span className="text-sm font-bold text-gray-900">{financialMetrics.porcentajeEndeudamiento.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            financialMetrics.porcentajeEndeudamiento < 30 ? 'bg-green-500' : 
                            financialMetrics.porcentajeEndeudamiento < 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, financialMetrics.porcentajeEndeudamiento)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {financialMetrics.porcentajeEndeudamiento < 30 ? 'Bajo nivel de deuda' : 
                         financialMetrics.porcentajeEndeudamiento < 60 ? 'Nivel moderado de deuda' : 'Alto nivel de deuda'}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Rentabilidad</span>
                        <span className="text-sm font-bold text-gray-900">{financialMetrics.rentabilidadTotal.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            financialMetrics.rentabilidadTotal >= 20 ? 'bg-green-500' : 
                            financialMetrics.rentabilidadTotal >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.abs(financialMetrics.rentabilidadTotal))}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {financialMetrics.rentabilidadTotal >= 20 ? 'Excelente rentabilidad' : 
                         financialMetrics.rentabilidadTotal >= 10 ? 'Buena rentabilidad' : 'Rentabilidad baja'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Vista de análisis de ventas
  if (analysisType === 'ventas') {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    if (!salesMetrics) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Calculando métricas de ventas...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setAnalysisType(null)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Análisis</span> de Ventas
            </h2>
            <p className="text-sm text-gray-600">Métricas detalladas de rendimiento comercial</p>
          </div>
        </div>

        {/* Selector de Período */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período de Análisis</label>
              <select
                value={salesPeriodType}
                onChange={(e) => setSalesPeriodType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="general">General (Todos los datos)</option>
                <option value="mes">Un Mes Específico</option>
                <option value="rango">Varios Meses (Rango)</option>
              </select>
            </div>

            {salesPeriodType === 'mes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                  <select
                    value={salesStartMonth}
                    onChange={(e) => setSalesStartMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {monthNames.map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                  <select
                    value={salesStartYear}
                    onChange={(e) => setSalesStartYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {salesPeriodType === 'rango' && (
              <>
                <div className="md:col-span-2 grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desde - Mes</label>
                    <select
                      value={salesStartMonth}
                      onChange={(e) => setSalesStartMonth(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {monthNames.map((month, idx) => (
                        <option key={idx} value={idx}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                    <select
                      value={salesStartYear}
                      onChange={(e) => setSalesStartYear(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hasta - Mes</label>
                    <select
                      value={salesEndMonth}
                      onChange={(e) => setSalesEndMonth(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {monthNames.map((month, idx) => (
                        <option key={idx} value={idx}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                    <select
                      value={salesEndYear}
                      onChange={(e) => setSalesEndYear(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Toggle Métricas/Gráficos */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setSalesViewMode('metricas')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              salesViewMode === 'metricas'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => setSalesViewMode('graficos')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              salesViewMode === 'graficos'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Gráficos
          </button>
        </div>

        {/* Contenido */}
        {salesViewMode === 'metricas' ? (
          <div className="space-y-6">
            {/* Métricas Principales */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${salesMetrics.ventasTotales.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Suma total facturada en el período</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Crecimiento Mensual</p>
                  {salesMetrics.crecimientoMensual >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className={`text-3xl font-bold ${salesMetrics.crecimientoMensual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {salesMetrics.crecimientoMensual >= 0 ? '+' : ''}{salesMetrics.crecimientoMensual.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Variación respecto al mes anterior</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Cantidad de Ventas</p>
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {salesMetrics.cantidadVentas}
                </p>
                <p className="text-xs text-gray-500 mt-2">Número de transacciones registradas</p>
              </div>
            </div>

            {/* Ventas por Tipo */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Ventas Minoristas</p>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${salesMetrics.totalMinorista.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Ventas Mayoristas</p>
                  <Briefcase className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${salesMetrics.totalMayorista.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Tipo Predominante</p>
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {salesMetrics.tipoPredominante}
                </p>
              </div>
            </div>

            {/* Métricas de Productos */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Unidades Vendidas</p>
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {salesMetrics.unidadesVendidas.toLocaleString('es-AR')}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                  <Receipt className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${salesMetrics.ticketPromedio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Unidades por Venta</p>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {salesMetrics.promedioUnidadesPorVenta.toFixed(1)}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Valor por Producto</p>
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${salesMetrics.valorPromedioPorProducto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* Descuentos */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Descuentos Totales</p>
                  <Percent className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${salesMetrics.descuentosTotales.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Monto total de descuentos aplicados</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">% Ventas con Descuento</p>
                  <Percent className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {salesMetrics.porcentajeConDescuento.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Estado de Cobro */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Cobro</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Ventas Cobradas</span>
                    <span className="text-sm font-bold text-green-600">{salesMetrics.porcentajeCobradas.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${salesMetrics.porcentajeCobradas}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{salesMetrics.ventasCobradas} ventas cobradas</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Ventas Pendientes</span>
                    <span className="text-sm font-bold text-red-600">{salesMetrics.porcentajePendientes.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${salesMetrics.porcentajePendientes}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{salesMetrics.ventasPendientes} ventas pendientes</p>
                </div>
              </div>
            </div>

            {/* Análisis Temporal */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Día con Mayor Venta</p>
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {salesMetrics.diaMayorVenta.fecha !== '-' ? new Date(salesMetrics.diaMayorVenta.fecha).toLocaleDateString('es-AR') : '-'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ${salesMetrics.diaMayorVenta.monto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Mes Más Activo</p>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {salesMetrics.mesActivo.mes !== '-' ? monthNames[parseInt(salesMetrics.mesActivo.mes.split('-')[1]) - 1] : '-'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ${salesMetrics.mesActivo.monto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-600">Velocidad de Ventas</p>
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {salesMetrics.ventasPorDiaPromedio.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Ventas promedio por día</p>
              </div>
            </div>

            {/* Tendencia */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${salesMetrics.tendencia === '↑' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {salesMetrics.tendencia === '↑' ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tendencia de Ventas: {salesMetrics.tendencia === '↑' ? 'Creciente' : 'Decreciente'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {salesMetrics.tendencia === '↑' 
                      ? `Las ventas están creciendo un ${salesMetrics.crecimientoMensual.toFixed(1)}% respecto al mes anterior`
                      : `Las ventas han disminuido un ${Math.abs(salesMetrics.crecimientoMensual).toFixed(1)}% respecto al mes anterior`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1️⃣ GRÁFICOS DE EVOLUCIÓN TEMPORAL */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">📈 Evolución Temporal de Ventas</h3>
                <select
                  value={salesEvolutionType}
                  onChange={(e) => setSalesEvolutionType(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="dia">Por Día</option>
                  <option value="mes">Por Mes</option>
                  <option value="año">Por Año</option>
                </select>
              </div>

              {/* Gráfico de barras - Evolución de ventas */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Ventas ($) y Unidades Vendidas</p>
                  <div className="space-y-2">
                    {(salesEvolutionType === 'dia' ? salesMetrics.evolucionDiariaData.slice(-30) : 
                      salesEvolutionType === 'mes' ? salesMetrics.evolucionData : 
                      salesMetrics.evolucionAnualData).map((item, idx) => {
                      const label = salesEvolutionType === 'dia' ? new Date(item.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) :
                                    salesEvolutionType === 'mes' ? item.mes :
                                    item.year
                      const maxVentas = Math.max(...(salesEvolutionType === 'dia' ? salesMetrics.evolucionDiariaData : 
                                                      salesEvolutionType === 'mes' ? salesMetrics.evolucionData : 
                                                      salesMetrics.evolucionAnualData).map(d => d.ventas))
                      const maxUnidades = Math.max(...(salesEvolutionType === 'dia' ? salesMetrics.evolucionDiariaData : 
                                                       salesEvolutionType === 'mes' ? salesMetrics.evolucionData : 
                                                       salesMetrics.evolucionAnualData).map(d => d.unidades))
                      
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-600 w-20">{label}</span>
                          <div className="flex-1 flex gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                  <div
                                    className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                    style={{ width: `${(item.ventas / maxVentas) * 100}%` }}
                                  >
                                    <span className="text-xs font-semibold text-white">
                                      ${item.ventas.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                  <div
                                    className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                    style={{ width: `${(item.unidades / maxUnidades) * 100}%` }}
                                  >
                                    <span className="text-xs font-semibold text-white">
                                      {item.unidades} u.
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="text-gray-600">Ventas ($)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-gray-600">Unidades</span>
                    </div>
                  </div>
                </div>

                {/* Comparativa Minorista vs Mayorista */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Comparativa Minorista vs Mayorista (Barras Apiladas)</p>
                  <div className="space-y-2">
                    {(salesEvolutionType === 'dia' ? salesMetrics.evolucionDiariaData.slice(-30) : 
                      salesEvolutionType === 'mes' ? salesMetrics.evolucionData : 
                      salesMetrics.evolucionAnualData).map((item, idx) => {
                      const label = salesEvolutionType === 'dia' ? new Date(item.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) :
                                    salesEvolutionType === 'mes' ? item.mes :
                                    item.year
                      const total = item.minorista + item.mayorista
                      const maxTotal = Math.max(...(salesEvolutionType === 'dia' ? salesMetrics.evolucionDiariaData : 
                                                     salesEvolutionType === 'mes' ? salesMetrics.evolucionData : 
                                                     salesMetrics.evolucionAnualData).map(d => d.minorista + d.mayorista))
                      
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-600 w-20">{label}</span>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-full h-6 overflow-hidden flex">
                              <div
                                className="bg-blue-500 h-6 flex items-center justify-center transition-all duration-500"
                                style={{ width: `${(item.minorista / maxTotal) * 100}%` }}
                                title={`Minorista: $${item.minorista.toLocaleString('es-AR')}`}
                              >
                                {item.minorista > 0 && (
                                  <span className="text-xs font-semibold text-white px-2">
                                    ${item.minorista.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                  </span>
                                )}
                              </div>
                              <div
                                className="bg-orange-500 h-6 flex items-center justify-center transition-all duration-500"
                                style={{ width: `${(item.mayorista / maxTotal) * 100}%` }}
                                title={`Mayorista: $${item.mayorista.toLocaleString('es-AR')}`}
                              >
                                {item.mayorista > 0 && (
                                  <span className="text-xs font-semibold text-white px-2">
                                    ${item.mayorista.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-gray-600">Minorista</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span className="text-gray-600">Mayorista</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2️⃣ GRÁFICOS DE ESTRUCTURA / DISTRIBUCIÓN */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Distribución por tipo de venta */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🟦 Distribución por Tipo de Venta</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Minorista</span>
                      <span className="text-sm font-bold text-blue-600">
                        ${salesMetrics.totalMinorista.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-blue-500 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                        style={{ width: `${(salesMetrics.totalMinorista / (salesMetrics.totalMinorista + salesMetrics.totalMayorista)) * 100}%` }}
                      >
                        <span className="text-sm font-semibold text-white">
                          {((salesMetrics.totalMinorista / (salesMetrics.totalMinorista + salesMetrics.totalMayorista)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Mayorista</span>
                      <span className="text-sm font-bold text-orange-600">
                        ${salesMetrics.totalMayorista.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-orange-500 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                        style={{ width: `${(salesMetrics.totalMayorista / (salesMetrics.totalMinorista + salesMetrics.totalMayorista)) * 100}%` }}
                      >
                        <span className="text-sm font-semibold text-white">
                          {((salesMetrics.totalMayorista / (salesMetrics.totalMinorista + salesMetrics.totalMayorista)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribución por medio de pago */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Distribución por Medio de Pago</h3>
                <div className="space-y-3">
                  {Object.entries(salesMetrics.ventasPorMedioPago)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([medio, data], idx) => {
                      const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500']
                      const maxTotal = Math.max(...Object.values(salesMetrics.ventasPorMedioPago).map(d => d.total))
                      const nombreMedio = medio.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      
                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                {nombreMedio}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({data.cantidad} ventas)
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              ${data.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-6">
                            <div
                              className={`${colors[idx % colors.length]} h-6 rounded-full transition-all duration-500`}
                              style={{ width: `${(data.total / maxTotal) * 100}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* 4️⃣ GRÁFICOS DE COMPORTAMIENTO */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Distribución de Ventas</span> por Período
                </h3>
                <select
                  value={salesDistributionType}
                  onChange={(e) => setSalesDistributionType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 min-h-[44px] sm:min-h-0 touch-manipulation focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="dia_semana">Por Día de la Semana</option>
                  <option value="semana_mes">Por Semana del Mes</option>
                  <option value="mes_año">Por Mes del Año</option>
                </select>
              </div>

              <div className="space-y-3">
                {salesDistributionType === 'dia_semana' && Object.entries(salesMetrics.ventasPorDiaSemana).map(([dia, data], idx) => {
                  const maxVentas = Math.max(...Object.values(salesMetrics.ventasPorDiaSemana).map(d => d.ventas))
                  const porcentaje = (data.ventas / maxVentas) * 100
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{dia}</span>
                        <span className="text-sm font-bold text-gray-900">
                          ${data.ventas.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gray-900 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-16 text-right">
                          {data.cantidad} ventas
                        </span>
                      </div>
                    </div>
                  )
                })}

                {salesDistributionType === 'semana_mes' && Object.entries(salesMetrics.ventasPorSemanaMes).map(([semana, ventas], idx) => {
                  const maxVentas = Math.max(...Object.values(salesMetrics.ventasPorSemanaMes))
                  const porcentaje = (ventas / maxVentas) * 100
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{semana}</span>
                        <span className="text-sm font-bold text-gray-900">
                          ${ventas.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gray-900 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  )
                })}

                {salesDistributionType === 'mes_año' && Object.entries(salesMetrics.ventasPorMesAño).map(([mes, data], idx) => {
                  const maxVentas = Math.max(...Object.values(salesMetrics.ventasPorMesAño).map(d => d.ventas))
                  const porcentaje = (data.ventas / maxVentas) * 100
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{mes}</span>
                        <span className="text-sm font-bold text-gray-900">
                          ${data.ventas.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gray-900 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-16 text-right">
                          {data.cantidad} ventas
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Mapa de Calor</span> - Ventas por Día/Semana
              </h3>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-8 gap-1 min-w-max">
                  <div className="text-xs font-medium text-gray-600 p-2"></div>
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, idx) => (
                    <div key={idx} className="text-xs font-medium text-gray-600 text-center p-2">{dia}</div>
                  ))}
                  
                  {[1, 2, 3, 4, 5].map(semana => (
                    <React.Fragment key={semana}>
                      <div className="text-xs font-medium text-gray-600 p-2">S{semana}</div>
                      {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((dia, idx) => {
                        const key = `${dia}-Semana${semana}`
                        const data = salesMetrics.heatmapData[key] || { ventas: 0 }
                        const maxVentas = Math.max(...Object.values(salesMetrics.heatmapData).map(d => d.ventas), 1)
                        const intensity = (data.ventas / maxVentas) * 100
                        
                        return (
                          <div
                            key={idx}
                            className="aspect-square rounded flex items-center justify-center text-xs font-semibold transition-all duration-300 hover:scale-110 cursor-pointer"
                            style={{
                              backgroundColor: intensity > 75 ? '#7c3aed' :
                                             intensity > 50 ? '#a78bfa' :
                                             intensity > 25 ? '#c4b5fd' :
                                             intensity > 0 ? '#e9d5ff' : '#f3f4f6',
                              color: intensity > 50 ? 'white' : '#374151'
                            }}
                            title={`${dia} - Semana ${semana}: $${data.ventas.toLocaleString('es-AR')}`}
                          >
                            {data.ventas > 0 ? `$${(data.ventas / 1000).toFixed(0)}k` : '-'}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
                <span>Menos</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <div className="w-4 h-4 bg-purple-100 rounded"></div>
                  <div className="w-4 h-4 bg-purple-300 rounded"></div>
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <div className="w-4 h-4 bg-purple-700 rounded"></div>
                </div>
                <span>Más</span>
              </div>
            </div>

            {/* 6️⃣ GRÁFICOS DE RENDIMIENTO */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Relación Unidades/Ingresos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Relación Unidades vs Ingresos</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Precio Promedio por Unidad</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${salesMetrics.valorPromedioPorProducto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <Package className="w-10 h-10 text-purple-600" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">📊 Análisis:</p>
                    <p>• Total unidades: <strong>{salesMetrics.unidadesVendidas.toLocaleString('es-AR')}</strong></p>
                    <p>• Ingresos totales: <strong>${salesMetrics.ventasTotales.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</strong></p>
                    <p className="mt-2 text-xs italic">
                      {salesMetrics.valorPromedioPorProducto > salesMetrics.ticketPromedio / 2 
                        ? '✅ Las ventas crecen principalmente por precio unitario alto'
                        : '✅ Las ventas crecen principalmente por volumen de unidades'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cantidad de ventas vs Clientes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Ventas vs Clientes Activos</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Ventas</p>
                      <p className="text-2xl font-bold text-blue-600">{salesMetrics.cantidadVentas}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Clientes</p>
                      <p className="text-2xl font-bold text-green-600">{salesMetrics.clientesUnicos}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">📊 Fidelización:</p>
                    <p>• Promedio de compras por cliente: <strong>{(salesMetrics.cantidadVentas / salesMetrics.clientesUnicos).toFixed(2)}</strong></p>
                    <p className="mt-2 text-xs italic">
                      {salesMetrics.cantidadVentas / salesMetrics.clientesUnicos > 2 
                        ? '✅ Alta fidelización - Clientes compran múltiples veces'
                        : '⚠️ Baja fidelización - Mayoría son compras únicas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Correlación Descuentos vs Volumen */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Impacto de Descuentos en Volumen</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-green-900">Con Descuento</h4>
                    <Percent className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {salesMetrics.promedioUnidadesConDescuento.toFixed(1)} u.
                  </p>
                  <p className="text-sm text-green-700">Promedio de unidades por venta</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Sin Descuento</h4>
                    <DollarSign className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-600 mb-2">
                    {salesMetrics.promedioUnidadesSinDescuento.toFixed(1)} u.
                  </p>
                  <p className="text-sm text-gray-700">Promedio de unidades por venta</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-900 mb-2">📈 Conclusión:</p>
                <p className="text-sm text-purple-800">
                  {salesMetrics.promedioUnidadesConDescuento > salesMetrics.promedioUnidadesSinDescuento 
                    ? `✅ Los descuentos aumentan el volumen en ${((salesMetrics.promedioUnidadesConDescuento / salesMetrics.promedioUnidadesSinDescuento - 1) * 100).toFixed(1)}%. Las promociones son efectivas.`
                    : salesMetrics.promedioUnidadesSinDescuento > salesMetrics.promedioUnidadesConDescuento
                    ? `⚠️ Los descuentos NO aumentan significativamente el volumen. Considera revisar la estrategia de promociones.`
                    : '➖ El impacto de los descuentos es neutral en el volumen de ventas.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Vista original para otros tipos de análisis
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setAnalysisType(null)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Análisis</h1>
          <p className="text-sm text-gray-600 mt-1">Métricas clave de tu negocio</p>
        </div>
      </div>

      {/* Mostrar Gráficos o Métricas */}
      {viewMode === 'charts' ? (
        <AnalisisVisual invoices={invoices} />
      ) : (
        <>
          {/* Métricas Principales - 4 Cuadros Centrados */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Clientes */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Clientes</p>
                    <p className="text-4xl font-bold text-gray-900">{kpis.clientesUnicos}</p>
                  </div>
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total ventas</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${kpis.totalVentas.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio por cliente</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${kpis.ventaPromedioPorCliente.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Productos</p>
                    <p className="text-4xl font-bold text-gray-900">{kpis.topCategories.length}</p>
                  </div>
                  <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Categorías activas</span>
                    <span className="text-sm font-semibold text-gray-900">{kpis.topCategories.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transacciones</span>
                    <span className="text-sm font-semibold text-gray-900">{kpis.transactionCount}</span>
                  </div>
                </div>
              </div>

              {/* Proveedores */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Proveedores</p>
                    <p className="text-4xl font-bold text-gray-900">{kpis.proveedoresUnicos}</p>
                  </div>
                  <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total compras</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${kpis.totalCompras.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio por proveedor</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${kpis.compraPromedioPorProveedor.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gastos */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Gastos</p>
                    <p className="text-4xl font-bold text-gray-900">
                      ${kpis.totalExpenses.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <Receipt className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Margen neto</span>
                    <span className={`text-sm font-semibold ${kpis.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ganancia neta</span>
                    <span className={`text-sm font-semibold ${kpis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(kpis.netProfit).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FinancialIntelligence
