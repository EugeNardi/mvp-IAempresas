import React, { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, 
  Download, RefreshCw, ArrowUpRight, ArrowDownRight, Target, Activity, FileText,
  AlertCircle, AlertTriangle, CheckCircle, Wallet, CreditCard, Receipt, 
  ArrowUp, ArrowDown, Minus, X
} from 'lucide-react'
import FinancialTooltip from './FinancialTooltip'
import DolarCard from './DolarCard'
import { supabase } from '../../lib/supabase'

const CombinedDashboard = ({ invoices, companyData, isEmprendedor = false }) => {
  const [products, setProducts] = useState([])
  const [viewMode, setViewMode] = useState('analysis') // analysis, sales, reports
  const [period, setPeriod] = useState('month')
  const [autoCharts, setAutoCharts] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [exportFormat, setExportFormat] = useState('json')
  const [selectedReport, setSelectedReport] = useState('balance')
  
  // Estados para período de análisis
  const [periodType, setPeriodType] = useState('general')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState(new Date().toISOString().slice(0, 7))
  
  // Estados para punto de equilibrio
  const [breakEvenFilters, setBreakEvenFilters] = useState({
    category: '',
    brand: '',
    model: ''
  })
  
  // Estados para métricas avanzadas
  const [advancedMetrics, setAdvancedMetrics] = useState({
    roi: 0,
    liquidityRatio: 0,
    cashFlow: 0,
    breakEven: 0
  })
  
  const [filteredBreakEven, setFilteredBreakEven] = useState({
    totalCost: 0,           // Costo total de adquisición
    totalSalePrice: 0,      // Precio de venta total
    unitsNeeded: 0,         // Unidades necesarias para punto de equilibrio
    profit: 0,              // Ganancia generada en punto de equilibrio
    avgMargin: 0            // Margen promedio
  })
  
  const [evolutionData, setEvolutionData] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  
  // Estado para Vista Ideal
  const [vistaIdeal, setVistaIdeal] = useState(false)
  const [showVistaIdealModal, setShowVistaIdealModal] = useState(false)
  const [vistaIdealConfig, setVistaIdealConfig] = useState({
    tipoPrecio: 'minorista' // 'minorista' o 'mayorista'
  })

  // Cargar productos del inventario
  useEffect(() => {
    loadProducts()
  }, [companyData])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      console.log('📦 Productos cargados desde Supabase:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('📋 Primer producto de ejemplo:', data[0])
        console.log('🔑 Campos disponibles:', Object.keys(data[0]))
      }
      
      setProducts(data || [])
    } catch (error) {
      console.error('❌ Error loading products:', error)
      setProducts([])
    }
  }

  // Generar análisis automáticamente
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      generateAnalytics()
    }
  }, [invoices])

  // Extraer filtros cuando cambien los productos
  useEffect(() => {
    if (products.length > 0) {
      extractFiltersData()
    }
  }, [products])

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
    
    // Calcular métricas avanzadas y datos de evolución
    calculateAdvancedMetrics()
  }
  
  // Filtrar facturas según período seleccionado
  const getFilteredInvoices = () => {
    if (!invoices) return []
    
    if (periodType === 'general') {
      return invoices
    } else if (periodType === 'month') {
      return invoices.filter(inv => {
        const invMonth = new Date(inv.date).toISOString().slice(0, 7)
        return invMonth === selectedMonth
      })
    } else if (periodType === 'range') {
      return invoices.filter(inv => {
        const invMonth = new Date(inv.date).toISOString().slice(0, 7)
        return invMonth >= startMonth && invMonth <= endMonth
      })
    }
    return invoices
  }
  
  // Calcular métricas avanzadas
  const calculateAdvancedMetrics = () => {
    const filtered = getFilteredInvoices()
    const income = filtered.filter(inv => inv.type === 'income')
    const expenses = filtered.filter(inv => inv.type === 'expense')
    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const profit = totalIncome - totalExpenses
    
    // ROI = (Ganancia / Inversión) * 100
    const roi = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0
    
    // Ratio de Liquidez = Ingresos / Gastos
    const liquidityRatio = totalExpenses > 0 ? totalIncome / totalExpenses : 0
    
    // Flujo de Caja = Ingresos - Gastos
    const cashFlow = profit
    
    // Punto de Equilibrio = Costos Fijos / Margen de Contribución
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) : 0
    const breakEven = profitMargin > 0 ? totalExpenses / profitMargin : totalExpenses
    
    setAdvancedMetrics({
      roi,
      liquidityRatio,
      cashFlow,
      breakEven
    })
    
    // Calcular datos de evolución
    const monthlyData = {}
    filtered.forEach(inv => {
      const month = new Date(inv.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'short' })
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, income: 0, expense: 0 }
      }
      
      if (inv.type === 'income') {
        monthlyData[month].income += parseFloat(inv.amount)
        // Si es venta, sumar a sales
        if (inv.metadata?.movementType === 'venta') {
          monthlyData[month].sales += parseFloat(inv.amount)
        }
      } else {
        monthlyData[month].expense += parseFloat(inv.amount)
      }
    })
    
    const evolution = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sales: data.sales,
      income: data.income,
      profit: data.income - data.expense
    }))
    
    setEvolutionData(evolution)
  }
  
  // Calcular métricas del mes actual vs mes anterior
  const calculateMonthlyComparison = () => {
    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)
    
    const currentMonthInvoices = invoices.filter(inv => inv.date.startsWith(currentMonth))
    const lastMonthInvoices = invoices.filter(inv => inv.date.startsWith(lastMonth))
    
    const currentIncome = currentMonthInvoices.filter(inv => inv.type === 'income').reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const lastIncome = lastMonthInvoices.filter(inv => inv.type === 'income').reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    
    // Egresos = solo gastos operativos (excluir compras de inventario)
    const currentExpenses = currentMonthInvoices.filter(inv => inv.type === 'expense' && inv.metadata?.movementType !== 'compra').reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const lastExpenses = lastMonthInvoices.filter(inv => inv.type === 'expense' && inv.metadata?.movementType !== 'compra').reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    
    const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0
    const expensesChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0
    
    return {
      currentIncome,
      lastIncome,
      incomeChange,
      currentExpenses,
      lastExpenses,
      expensesChange
    }
  }
  
  // Calcular Ganancia Bruta (Ingresos - CPV)
  const calculateGrossProfitMetrics = () => {
    const filtered = getFilteredInvoices()
    const ventas = filtered.filter(inv => inv.type === 'income' && inv.metadata?.movementType === 'venta')
    const compras = filtered.filter(inv => inv.type === 'expense' && inv.metadata?.movementType === 'compra')
    
    const totalVentas = ventas.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const cpv = compras.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) // Costo de Productos Vendidos
    
    const grossProfit = totalVentas - cpv
    const grossMargin = totalVentas > 0 ? (grossProfit / totalVentas) * 100 : 0
    
    return { totalVentas, cpv, grossProfit, grossMargin }
  }
  
  // Calcular Ganancia Neta (Ganancia Bruta - Gastos - Impuestos)
  const calculateNetProfitMetrics = () => {
    const { grossProfit } = calculateGrossProfitMetrics()
    const filtered = getFilteredInvoices()
    
    const gastos = filtered.filter(inv => inv.type === 'expense' && inv.metadata?.movementType !== 'compra')
    const totalGastos = gastos.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    
    // Separar gastos fijos y variables según el campo tipoGasto del metadata
    const gastosFijos = gastos.filter(inv => inv.metadata?.tipoGasto === 'fijo')
    const gastosVariables = gastos.filter(inv => inv.metadata?.tipoGasto === 'variable' || !inv.metadata?.tipoGasto)
    
    const totalFijos = gastosFijos.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const totalVariables = gastosVariables.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    
    // Impuestos (estimado como 21% de las ventas si no está especificado)
    const impuestos = filtered.filter(inv => inv.category === 'Impuestos').reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    
    const netProfit = grossProfit - totalGastos - impuestos
    const { totalVentas } = calculateGrossProfitMetrics()
    const netMargin = totalVentas > 0 ? (netProfit / totalVentas) * 100 : 0
    
    return { netProfit, netMargin, totalGastos, totalFijos, totalVariables, impuestos }
  }
  
  // Calcular proyección de Vista Ideal (vender todo el inventario)
  const calculateIdealProjection = () => {
    if (products.length === 0) return { ingresoProyectado: 0, gananciaProyectada: 0 }
    
    console.log('🔍 Total productos antes de filtrar:', products.length)
    
    // Agrupar productos por ID único para evitar duplicados
    const productosUnicos = {}
    products.forEach(prod => {
      if (prod.id && !productosUnicos[prod.id]) {
        productosUnicos[prod.id] = prod
      }
    })
    
    const productosArray = Object.values(productosUnicos)
    console.log('✅ Productos únicos después de filtrar:', productosArray.length)
    
    // Calcular ingreso según el tipo de precio configurado
    let detalleCalculo = []
    const ingresoProyectado = productosArray.reduce((sum, prod) => {
      // Los precios ya están en pesos
      const precioMinorista = parseFloat(prod.retail_price || prod.sale_price || prod.precio_venta || 0)
      const precioMayorista = parseFloat(prod.wholesale_price || prod.precio_mayorista || 0)
      
      const salePrice = vistaIdealConfig.tipoPrecio === 'mayorista' 
        ? precioMayorista
        : precioMinorista
      
      const stock = parseFloat(prod.current_stock || prod.stock || 0)
      const subtotal = salePrice * stock
      
      if (stock > 0) {
        detalleCalculo.push({
          nombre: prod.name,
          precio: salePrice,
          stock: stock,
          subtotal: subtotal
        })
      }
      
      return sum + subtotal
    }, 0)
    
    console.log('📊 Detalle de productos con stock:', detalleCalculo)
    console.log('💰 Total ingreso proyectado:', ingresoProyectado)
    
    // Calcular costo de adquisición del inventario actual
    const compras = invoices.filter(inv => inv.metadata?.movementType === 'compra')
    const costoInventario = productosArray.reduce((sum, prod) => {
      const stock = parseFloat(prod.current_stock) || 0
      let purchasePrice = 0
      
      // Buscar el costo en las facturas de compra
      for (const compra of compras) {
        if (compra.metadata?.productos) {
          const productoEnCompra = compra.metadata.productos.find(p => 
            p.nombre === prod.name || 
            (p.marca === prod.brand && p.modelo === prod.model)
          )
          if (productoEnCompra && productoEnCompra.precioUnitario) {
            // El precio ya está en pesos
            purchasePrice = parseFloat(productoEnCompra.precioUnitario)
            break
          }
        }
      }
      
      return sum + (purchasePrice * stock)
    }, 0)
    
    const gananciaProyectada = ingresoProyectado - costoInventario
    
    return { ingresoProyectado, gananciaProyectada, costoInventario }
  }
  
  // Detectar alertas inteligentes
  const detectSmartAlerts = () => {
    const alerts = []
    const filtered = getFilteredInvoices()
    
    // Calcular promedio trimestral de gastos
    const now = new Date()
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    const lastThreeMonths = invoices.filter(inv => new Date(inv.date) >= threeMonthsAgo && inv.type === 'expense')
    const avgQuarterlyExpenses = lastThreeMonths.length > 0 ? lastThreeMonths.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) / 3 : 0
    
    const currentMonthExpenses = filtered.filter(inv => inv.type === 'expense' && inv.date.startsWith(now.toISOString().slice(0, 7)))
      .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    
    // Alerta: Gastos superiores a la media
    if (currentMonthExpenses > avgQuarterlyExpenses * 1.2) {
      alerts.push({
        type: 'danger',
        icon: AlertCircle,
        message: `Gastos superiores a la media del trimestre (+${((currentMonthExpenses / avgQuarterlyExpenses - 1) * 100).toFixed(0)}%)`
      })
    }
    
    // Alerta: Margen bruto bajo
    const { grossMargin } = calculateGrossProfitMetrics()
    const lastMonthGrossMargin = 0 // Calcular del mes anterior
    if (grossMargin < lastMonthGrossMargin * 0.9) {
      alerts.push({
        type: 'warning',
        icon: AlertTriangle,
        message: `Margen bruto bajó más del 10%`
      })
    }
    
    // Alerta: Cuentas por cobrar
    const cuentasPorCobrar = filtered.filter(inv => inv.metadata?.paymentStatus === 'pending' && inv.type === 'income')
    const overdueInvoices = cuentasPorCobrar.filter(inv => {
      const dueDate = new Date(inv.date)
      dueDate.setDate(dueDate.getDate() + 30)
      return dueDate < now
    })
    
    if (overdueInvoices.length > 0) {
      alerts.push({
        type: 'warning',
        icon: AlertTriangle,
        message: `Demora en cobros supera los 30 días (${overdueInvoices.length} facturas)`
      })
    }
    
    // Alerta: Ventas crecieron
    const { incomeChange } = calculateMonthlyComparison()
    if (incomeChange > 15) {
      alerts.push({
        type: 'success',
        icon: CheckCircle,
        message: `Ventas crecieron más del 15% este mes (+${incomeChange.toFixed(0)}%)`
      })
    }
    
    return alerts
  }
  
  // Extraer categorías, marcas y modelos para filtros
  const extractFiltersData = () => {
    const cats = new Set()
    const brds = new Set()
    const mdls = new Set()
    
    // Usar productos del inventario
    products.forEach(prod => {
      if (prod.category) cats.add(prod.category)
      if (prod.brand) brds.add(prod.brand)
      if (prod.model) mdls.add(prod.model)
    })
    
    console.log('📊 Productos cargados:', products.length)
    console.log('📂 Categorías encontradas:', [...cats])
    console.log('🏷️ Marcas encontradas:', [...brds])
    console.log('📦 Modelos encontrados:', [...mdls])
    
    setCategories([...cats])
    setBrands([...brds])
    setModels([...mdls])
  }
  
  // Calcular punto de equilibrio filtrado
  useEffect(() => {
    if (products.length === 0) return
    
    // Filtrar productos según categoría, marca y modelo seleccionados
    const filteredProducts = products.filter(prod => {
      const matchCategory = !breakEvenFilters.category || prod.category === breakEvenFilters.category
      const matchBrand = !breakEvenFilters.brand || prod.brand === breakEvenFilters.brand
      const matchModel = !breakEvenFilters.model || prod.model === breakEvenFilters.model
      
      return matchCategory && matchBrand && matchModel
    })
    
    console.log('🔍 Filtros aplicados:', breakEvenFilters)
    console.log('🔍 Productos filtrados:', filteredProducts.length, 'de', products.length)
    
    if (filteredProducts.length === 0) {
      setFilteredBreakEven({
        totalCost: 0,
        totalSalePrice: 0,
        unitsNeeded: 0,
        profit: 0,
        avgMargin: 0
      })
      return
    }
    
    // PASO 1: Calcular el COSTO TOTAL de adquisición de los productos seleccionados
    // Buscar el costo en las facturas de compra
    const compras = invoices.filter(inv => inv.metadata?.movementType === 'compra')
    
    const totalCost = filteredProducts.reduce((sum, prod) => {
      const stock = parseFloat(prod.current_stock) || 0
      
      // Buscar el costo en las facturas de compra
      let purchasePrice = 0
      
      // Buscar en todas las compras
      for (const compra of compras) {
        if (compra.metadata?.productos) {
          const productoEnCompra = compra.metadata.productos.find(p => 
            p.nombre === prod.name || 
            (p.marca === prod.brand && p.modelo === prod.model)
          )
          if (productoEnCompra && productoEnCompra.precioUnitario) {
            purchasePrice = parseFloat(productoEnCompra.precioUnitario)
            break
          }
        }
      }
      
      const productCost = purchasePrice * stock
      console.log(`  - ${prod.name}: $${purchasePrice} × ${stock} = $${productCost}`)
      return sum + productCost
    }, 0)
    
    // PASO 2: Calcular el precio de venta promedio por unidad
    const totalStock = filteredProducts.reduce((sum, prod) => sum + (parseFloat(prod.current_stock) || 0), 0)
    const totalSalePrice = filteredProducts.reduce((sum, prod) => {
      const salePrice = parseFloat(prod.sale_price) || 0
      const stock = parseFloat(prod.current_stock) || 0
      return sum + (salePrice * stock)
    }, 0)
    const avgSalePrice = totalStock > 0 ? totalSalePrice / totalStock : 0
    
    // PASO 3: Calcular precio de compra promedio por unidad
    const avgPurchasePrice = totalStock > 0 ? totalCost / totalStock : 0
    
    // PASO 4: Calcular margen por unidad
    const marginPerUnit = avgSalePrice - avgPurchasePrice
    
    // PASO 5: Calcular unidades necesarias para punto de equilibrio
    // En el punto de equilibrio: Ingresos = Costos
    // unitsNeeded × avgSalePrice = totalCost
    // unitsNeeded = totalCost / avgSalePrice
    const unitsNeeded = avgSalePrice > 0 ? Math.ceil(totalCost / avgSalePrice) : 0
    
    // PASO 6: Calcular ganancia en el punto de equilibrio
    const revenueAtBreakEven = unitsNeeded * avgSalePrice
    const profit = revenueAtBreakEven - totalCost
    
    // PASO 7: El margen en el punto de equilibrio es 0% (por definición)
    const avgMargin = 0
    
    console.log('💰 Punto de Equilibrio calculado:', {
      productos_filtrados: filteredProducts.length,
      stock_total: totalStock,
      costo_total: totalCost.toFixed(2),
      precio_venta_promedio: avgSalePrice.toFixed(2),
      precio_compra_promedio: avgPurchasePrice.toFixed(2),
      margen_por_unidad: marginPerUnit.toFixed(2),
      unidades_necesarias: unitsNeeded,
      ingreso_en_equilibrio: revenueAtBreakEven.toFixed(2),
      ganancia: profit.toFixed(2),
      margen_equilibrio: '0%'
    })
    
    setFilteredBreakEven({
      totalCost,
      totalSalePrice,
      unitsNeeded,
      profit,
      avgMargin
    })
  }, [breakEvenFilters, products])
  
  // Recalcular métricas cuando cambia el período
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      calculateAdvancedMetrics()
    }
  }, [periodType, selectedMonth, startMonth, endMonth, invoices])

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
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setViewMode('analysis')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              viewMode === 'analysis' 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Análisis Financiero
          </button>
          <button
            onClick={() => setViewMode('sales')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              viewMode === 'sales' 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Ventas
          </button>
          <button
            onClick={() => setViewMode('reports')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              viewMode === 'reports' 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Balance
          </button>
        </div>
        
        {/* Botón Vista Ideal - Solo en Análisis Financiero */}
        {viewMode === 'analysis' && (
          <button
            onClick={() => {
              if (vistaIdeal) {
                setVistaIdeal(false)
              } else {
                setShowVistaIdealModal(true)
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              vistaIdeal 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Target className="w-4 h-4" />
            {vistaIdeal ? 'Vista Real' : 'Activar Vista Ideal'}
          </button>
        )}
      </div>
      
      {/* Modal de Configuración Vista Ideal */}
      {showVistaIdealModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Configurar Vista Ideal</h2>
                </div>
                <button 
                  onClick={() => setShowVistaIdealModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Configura cómo quieres proyectar tu análisis financiero
                </p>
                
                {/* Tipo de Precio */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Precio de Venta
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVistaIdealConfig({...vistaIdealConfig, tipoPrecio: 'minorista'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        vistaIdealConfig.tipoPrecio === 'minorista'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Minorista</p>
                        <p className="text-xs text-gray-600 mt-1">Precio de venta al público</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setVistaIdealConfig({...vistaIdealConfig, tipoPrecio: 'mayorista'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        vistaIdealConfig.tipoPrecio === 'mayorista'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Mayorista</p>
                        <p className="text-xs text-gray-600 mt-1">Precio de venta por mayor</p>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Info adicional */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Proyección:</span> Se analizará la venta de todo el inventario actual a precio {vistaIdealConfig.tipoPrecio}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowVistaIdealModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setVistaIdeal(true)
                  setShowVistaIdealModal(false)
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Aplicar Vista Ideal
              </button>
            </div>
          </div>
        </div>
      )}

      {generating && (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Procesando {invoices.length} facturas...</p>
        </div>
      )}

      {!generating && autoCharts && (
        <>
          {/* Vista Análisis Financiero */}
          {viewMode === 'analysis' && (
            <div className="space-y-6">
              {/* Mensaje Vista Ideal */}
              {vistaIdeal && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Vista Ideal:</span> Mostrando proyección si vendes todo el inventario a precio {vistaIdealConfig.tipoPrecio}
                  </p>
                </div>
              )}
              
              {/* Selector de Período */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Período de Análisis</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Período</label>
                    <select
                      value={periodType}
                      onChange={(e) => setPeriodType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                    >
                      <option value="general">General (Todos los datos)</option>
                      <option value="month">Mes específico</option>
                      <option value="range">Rango de meses</option>
                    </select>
                  </div>

                  {periodType === 'month' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Mes</label>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                      />
                    </div>
                  )}

                  {periodType === 'range' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                        <input
                          type="month"
                          value={startMonth}
                          onChange={(e) => setStartMonth(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                        <input
                          type="month"
                          value={endMonth}
                          onChange={(e) => setEndMonth(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* A. INDICADORES CLAVE */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Indicadores Clave</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {(() => {
                    const comparison = calculateMonthlyComparison()
                    const grossMetrics = calculateGrossProfitMetrics()
                    const netMetrics = calculateNetProfitMetrics()
                    const idealProjection = calculateIdealProjection()
                    
                    // Si Vista Ideal está activa, sumar la proyección
                    const ingresosDisplay = vistaIdeal ? comparison.currentIncome + idealProjection.ingresoProyectado : comparison.currentIncome
                    const gananciaBrutaDisplay = vistaIdeal ? grossMetrics.grossProfit + idealProjection.gananciaProyectada : grossMetrics.grossProfit
                    const gananciaNetaDisplay = vistaIdeal ? netMetrics.netProfit + idealProjection.gananciaProyectada : netMetrics.netProfit
                    
                    return (
                      <>
                        {/* 1. Ingresos Totales del Mes */}
                        <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative">
                          {vistaIdeal && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              Proyección
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            {!vistaIdeal && comparison.incomeChange !== 0 && (
                              <div className={`flex items-center gap-1 text-sm font-semibold ${comparison.incomeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {comparison.incomeChange > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                {Math.abs(comparison.incomeChange).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Ingresos del Mes</p>
                          <p className="text-3xl font-bold text-gray-900 mb-2">
                            ${ingresosDisplay.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </p>
                          {vistaIdeal ? (
                            <p className="text-xs text-blue-600 font-medium">Real: ${comparison.currentIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })} + Inventario: ${idealProjection.ingresoProyectado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                          ) : (
                            <p className="text-xs text-gray-500">vs mes anterior: ${comparison.lastIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                          )}
                        </div>

                        {/* 2. Ganancia Bruta */}
                        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative">
                          {vistaIdeal && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              Proyección
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Ganancia Bruta</p>
                          <p className="text-3xl font-bold text-gray-900 mb-2">
                            ${gananciaBrutaDisplay.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </p>
                          {vistaIdeal ? (
                            <p className="text-xs text-blue-600 font-medium">+ ${idealProjection.gananciaProyectada.toLocaleString('es-AR', { maximumFractionDigits: 0 })} del inventario</p>
                          ) : (
                            <p className="text-xs text-gray-500">Margen: {grossMetrics.grossMargin.toFixed(1)}%</p>
                          )}
                        </div>

                        {/* 3. Ganancia Neta */}
                        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative">
                          {vistaIdeal && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              Proyección
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Target className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Ganancia Neta</p>
                          <p className="text-3xl font-bold text-gray-900 mb-2">
                            ${gananciaNetaDisplay.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </p>
                          {vistaIdeal ? (
                            <p className="text-xs text-blue-600 font-medium">Vendiendo todo el stock</p>
                          ) : (
                            <p className="text-xs text-gray-500">Margen: {netMetrics.netMargin.toFixed(1)}%</p>
                          )}
                        </div>

                        {/* 4. Egresos Totales */}
                        <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>
                            {comparison.expensesChange !== 0 && (
                              <div className={`flex items-center gap-1 text-sm font-semibold ${comparison.expensesChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {comparison.expensesChange > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                {Math.abs(comparison.expensesChange).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Egresos Totales</p>
                          <p className="text-3xl font-bold text-gray-900 mb-2">
                            ${comparison.currentExpenses.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-500">Fijos: ${netMetrics.totalFijos.toLocaleString('es-AR', { maximumFractionDigits: 0 })} | Variables: ${netMetrics.totalVariables.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                        </div>

                        {/* 5. Cash Flow */}
                        <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-cyan-100 rounded-lg">
                              <Activity className="w-6 h-6 text-cyan-600" />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Cash Flow</p>
                          <p className={`text-3xl font-bold mb-2 ${advancedMetrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.abs(advancedMetrics.cashFlow).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-500">{advancedMetrics.cashFlow >= 0 ? 'Positivo' : 'Negativo'}</p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* B. RENTABILIDAD Y LIQUIDEZ */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Rentabilidad y Liquidez</h2>
                
                {/* Gráfico de Rentabilidad Mensual */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Rentabilidad Mensual</h3>
                  <div className="space-y-4">
                    {evolutionData.map((monthData, idx) => {
                      const maxValue = Math.max(...evolutionData.map(d => Math.max(d.income, Math.abs(d.profit))))
                      const incomePercentage = (monthData.income / maxValue) * 100
                      const profitPercentage = (Math.abs(monthData.profit) / maxValue) * 100
                      
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-900">{monthData.month}</span>
                            <div className="flex gap-4 text-xs">
                              <span className="text-green-600 font-medium">
                                Ingresos: ${monthData.income.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                              </span>
                              <span className={`font-medium ${monthData.profit >= 0 ? 'text-cyan-600' : 'text-red-600'}`}>
                                Ganancia: ${Math.abs(monthData.profit).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-100 rounded-full h-3">
                              <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all" style={{ width: `${incomePercentage}%` }} />
                            </div>
                            <div className="bg-gray-100 rounded-full h-3">
                              <div className={`h-3 rounded-full transition-all ${monthData.profit >= 0 ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`} style={{ width: `${profitPercentage}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Costos vs Ganancias y Liquidez */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Costos vs Ganancias */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Costos vs Ganancias</h3>
                    {(() => {
                      const grossMetrics = calculateGrossProfitMetrics()
                      const netMetrics = calculateNetProfitMetrics()
                      const total = Math.abs(grossMetrics.cpv) + Math.abs(netMetrics.totalGastos) + Math.abs(netMetrics.netProfit)
                      
                      return (
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">CPV (Costo de Productos)</span>
                              <span className="font-semibold">${grossMetrics.cpv.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div className="bg-red-500 h-3 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (Math.abs(grossMetrics.cpv) / total) * 100))}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Gastos Operativos</span>
                              <span className="font-semibold">${netMetrics.totalGastos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (Math.abs(netMetrics.totalGastos) / total) * 100))}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Ganancia Neta</span>
                              <span className="font-semibold text-green-600">${netMetrics.netProfit.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (Math.abs(netMetrics.netProfit) / total) * 100))}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Liquidez */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Liquidez</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <Wallet className="w-5 h-5 text-green-600 mb-2" />
                        <p className="text-xs text-gray-600 mb-1">Caja Disponible</p>
                        <p className="text-lg font-bold text-green-600">
                          ${Math.abs(advancedMetrics.cashFlow).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <CreditCard className="w-5 h-5 text-blue-600 mb-2" />
                        <p className="text-xs text-gray-600 mb-1">Por Cobrar</p>
                        <p className="text-lg font-bold text-blue-600">$0</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <Receipt className="w-5 h-5 text-red-600 mb-2" />
                        <p className="text-xs text-gray-600 mb-1">Por Pagar</p>
                        <p className="text-lg font-bold text-red-600">$0</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ratio de Liquidez</span>
                        <span className="text-lg font-bold text-gray-900">{advancedMetrics.liquidityRatio.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {advancedMetrics.liquidityRatio >= 1.5 ? '✅ Excelente capacidad de pago' : advancedMetrics.liquidityRatio >= 1 ? '⚠️ Capacidad de pago justa' : '❌ Baja capacidad de pago'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* C. ALERTAS INTELIGENTES */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Alertas Inteligentes</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {detectSmartAlerts().map((alert, idx) => {
                    const Icon = alert.icon
                    const colorClasses = {
                      danger: 'bg-red-50 border-red-200 text-red-800',
                      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                      success: 'bg-green-50 border-green-200 text-green-800'
                    }
                    
                    return (
                      <div key={idx} className={`border rounded-lg p-4 flex items-start gap-3 ${colorClasses[alert.type]}`}>
                        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{alert.message}</p>
                      </div>
                    )
                  })}
                  {detectSmartAlerts().length === 0 && (
                    <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No hay alertas en este momento. ¡Todo está bajo control!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vista Ventas */}
          {viewMode === 'sales' && (
            <div className="space-y-6">
              {/* KPIs de Ventas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${autoCharts.summary.totalIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{autoCharts.summary.incomeCount} transacciones</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    ${autoCharts.summary.avgIncome.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Por transacción</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Margen de Ganancia</p>
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {autoCharts.summary.profitMargin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Sobre ventas totales</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Utilidad Neta</p>
                    <Activity className="w-5 h-5 text-cyan-600" />
                  </div>
                  <p className={`text-3xl font-bold ${autoCharts.summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${autoCharts.summary.profit.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Ganancia total</p>
                </div>
              </div>

              {/* Ventas por Categoría */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Ventas por Categoría</h3>
                <div className="space-y-4">
                  {Object.entries(autoCharts.byCategory)
                    .sort((a, b) => b[1].income - a[1].income)
                    .map(([category, data]) => {
                      const percentage = (data.income / autoCharts.summary.totalIncome) * 100
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{category}</span>
                            <span className="text-sm font-semibold text-green-600">
                              ${data.income.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-12 text-right">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Evolución de Ventas Mensual */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Evolución de Ventas</h3>
                <div className="space-y-4">
                  {Object.entries(autoCharts.byMonth).map(([month, monthData]) => {
                    const maxValue = Math.max(...Object.values(autoCharts.byMonth).map(m => m.income))
                    const incomePercentage = (monthData.income / maxValue) * 100
                    
                    return (
                      <div key={month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{month}</span>
                          <span className="text-sm font-semibold text-green-600">
                            ${monthData.income.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${incomePercentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Vista Reportes */}
          {viewMode === 'reports' && (
            <div className="space-y-6">
              {/* Selector de Reporte */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Seleccionar Tipo de Reporte</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedReport('balance')}
                    className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                      selectedReport === 'balance'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Balance General</h4>
                    <p className="text-sm text-gray-600">Resumen financiero completo con análisis por categoría</p>
                  </button>
                  
                  <button
                    onClick={() => setSelectedReport('monthly')}
                    className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                      selectedReport === 'monthly'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Reporte Mensual</h4>
                    <p className="text-sm text-gray-600">Evolución mensual de ingresos, gastos y utilidades</p>
                  </button>
                </div>
              </div>

              {/* Vista Previa del Reporte */}
              {selectedReport === 'balance' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Vista Previa: Balance General</h3>
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
