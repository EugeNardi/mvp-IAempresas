import React, { useState, useEffect } from 'react'
import { PieChart, TrendingUp, TrendingDown, Package, Users, ShoppingCart, DollarSign } from 'lucide-react'
import FinancialTooltip from './FinancialTooltip'

const AnalisisVisual = ({ invoices }) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      calculateAnalytics()
    } else {
      setLoading(false)
    }
  }, [invoices])

  const calculateAnalytics = () => {
    setLoading(true)

    const compras = invoices.filter(inv => inv.type === 'expense' && inv.metadata?.movementType === 'compra')
    const ventas = invoices.filter(inv => inv.type === 'income' && inv.metadata?.movementType === 'venta')

    // Análisis por Proveedor
    const proveedoresMap = {}
    compras.forEach(compra => {
      const proveedor = compra.metadata?.provider || 'Sin proveedor'
      if (!proveedoresMap[proveedor]) proveedoresMap[proveedor] = 0
      proveedoresMap[proveedor] += parseFloat(compra.amount || 0)
    })

    const totalCompras = Object.values(proveedoresMap).reduce((sum, val) => sum + val, 0)
    const proveedores = Object.entries(proveedoresMap)
      .map(([nombre, monto]) => ({
        nombre,
        monto,
        porcentaje: totalCompras > 0 ? (monto / totalCompras) * 100 : 0
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 8)

    // Análisis por Cliente
    const clientesMap = {}
    ventas.forEach(venta => {
      const cliente = venta.metadata?.cliente || 'Sin cliente'
      if (!clientesMap[cliente]) clientesMap[cliente] = 0
      clientesMap[cliente] += parseFloat(venta.amount || 0)
    })

    const totalVentas = Object.values(clientesMap).reduce((sum, val) => sum + val, 0)
    const clientes = Object.entries(clientesMap)
      .map(([nombre, monto]) => ({
        nombre,
        monto,
        porcentaje: totalVentas > 0 ? (monto / totalVentas) * 100 : 0
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 8)

    // Productos más vendidos
    const productosVendidosMap = {}
    ventas.forEach(venta => {
      const productos = venta.metadata?.productos || []
      productos.forEach(prod => {
        const nombre = prod.nombre || 'Sin nombre'
        if (!productosVendidosMap[nombre]) {
          productosVendidosMap[nombre] = { cantidad: 0, monto: 0 }
        }
        productosVendidosMap[nombre].cantidad += parseFloat(prod.cantidad || 0)
        productosVendidosMap[nombre].monto += parseFloat(prod.precioTotal || 0)
      })
    })

    const totalVentasProductos = Object.values(productosVendidosMap).reduce((sum, val) => sum + val.monto, 0)
    const productosVendidos = Object.entries(productosVendidosMap)
      .map(([nombre, data]) => ({
        nombre,
        cantidad: data.cantidad,
        monto: data.monto,
        porcentaje: totalVentasProductos > 0 ? (data.monto / totalVentasProductos) * 100 : 0
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 8)

    // Productos más comprados
    const productosCompradosMap = {}
    compras.forEach(compra => {
      const productos = compra.metadata?.productos || []
      productos.forEach(prod => {
        const nombre = prod.nombre || 'Sin nombre'
        if (!productosCompradosMap[nombre]) {
          productosCompradosMap[nombre] = { cantidad: 0, monto: 0 }
        }
        productosCompradosMap[nombre].cantidad += parseFloat(prod.cantidad || 0)
        productosCompradosMap[nombre].monto += parseFloat(prod.costoTotal || prod.precioTotal || 0)
      })
    })

    const totalComprasProductos = Object.values(productosCompradosMap).reduce((sum, val) => sum + val.monto, 0)
    const productosComprados = Object.entries(productosCompradosMap)
      .map(([nombre, data]) => ({
        nombre,
        cantidad: data.cantidad,
        monto: data.monto,
        porcentaje: totalComprasProductos > 0 ? (data.monto / totalComprasProductos) * 100 : 0
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 8)

    // Utilidad por Producto
    const utilidadProductosMap = {}
    
    ventas.forEach(venta => {
      const productos = venta.metadata?.productos || []
      productos.forEach(prod => {
        const nombre = prod.nombre || 'Sin nombre'
        if (!utilidadProductosMap[nombre]) {
          utilidadProductosMap[nombre] = { ventas: 0, compras: 0 }
        }
        utilidadProductosMap[nombre].ventas += parseFloat(prod.precioTotal || 0)
      })
    })

    compras.forEach(compra => {
      const productos = compra.metadata?.productos || []
      productos.forEach(prod => {
        const nombre = prod.nombre || 'Sin nombre'
        if (!utilidadProductosMap[nombre]) {
          utilidadProductosMap[nombre] = { ventas: 0, compras: 0 }
        }
        utilidadProductosMap[nombre].compras += parseFloat(prod.costoTotal || prod.precioTotal || 0)
      })
    })

    const utilidadProductos = Object.entries(utilidadProductosMap)
      .map(([nombre, data]) => ({
        nombre,
        ventas: data.ventas,
        compras: data.compras,
        utilidad: data.ventas - data.compras,
        margen: data.ventas > 0 ? ((data.ventas - data.compras) / data.ventas) * 100 : 0
      }))
      .filter(p => p.ventas > 0 || p.compras > 0)
      .sort((a, b) => b.utilidad - a.utilidad)
      .slice(0, 10)

    setAnalytics({
      proveedores,
      clientes,
      productosVendidos,
      productosComprados,
      utilidadProductos,
      totalCompras,
      totalVentas
    })

    setLoading(false)
  }

  const PieChartComponent = ({ data, title, icon: Icon, colorScheme = 'blue' }) => {
    const colors = {
      blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#1e40af', '#1e3a8a'],
      green: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5', '#059669', '#047857'],
      purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff', '#7c3aed', '#6d28d9'],
      orange: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb', '#d97706', '#b45309']
    }

    const chartColors = colors[colorScheme]
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
        color: chartColors[index % chartColors.length]
      }
    })

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
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
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-gray-900">
                {data.length}
              </text>
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-gray-500">
                items
              </text>
            </svg>
          </div>

          <div className="flex-1 space-y-2 max-h-48 overflow-y-auto">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="text-gray-700 truncate" title={item.nombre}>{item.nombre}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-900">{item.porcentaje.toFixed(1)}%</span>
                  <span className="text-xs text-gray-500">${item.monto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generando análisis visual...</p>
        </div>
      </div>
    )
  }

  if (!analytics || invoices.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <PieChart className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay datos suficientes</h3>
          <p className="text-gray-600">Carga movimientos de compra y venta para ver el análisis visual</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Análisis Visual</h1>
        <p className="text-sm text-gray-600 mt-1">Distribución y comparativas en gráficos interactivos</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {analytics.proveedores.length > 0 && (
          <PieChartComponent data={analytics.proveedores} title="Distribución por Proveedor" icon={ShoppingCart} colorScheme="blue" />
        )}
        {analytics.clientes.length > 0 && (
          <PieChartComponent data={analytics.clientes} title="Distribución por Cliente" icon={Users} colorScheme="green" />
        )}
        {analytics.productosVendidos.length > 0 && (
          <PieChartComponent data={analytics.productosVendidos} title="Productos Más Vendidos" icon={TrendingUp} colorScheme="purple" />
        )}
        {analytics.productosComprados.length > 0 && (
          <PieChartComponent data={analytics.productosComprados} title="Productos Más Comprados" icon={TrendingDown} colorScheme="orange" />
        )}
      </div>

      {analytics.utilidadProductos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-700" />
            <FinancialTooltip term="utilidad_neta">
              <h3 className="text-sm font-semibold text-gray-900">Utilidad por Producto</h3>
            </FinancialTooltip>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Producto</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Ventas</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Compras</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Utilidad</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Margen</th>
                </tr>
              </thead>
              <tbody>
                {analytics.utilidadProductos.map((producto, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{producto.nombre}</td>
                    <td className="py-3 px-4 text-sm text-right text-green-600 font-semibold">
                      ${producto.ventas.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-red-600 font-semibold">
                      ${producto.compras.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-bold ${
                      producto.utilidad >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {producto.utilidad >= 0 ? '+' : ''}${producto.utilidad.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        producto.margen >= 30 ? 'bg-green-100 text-green-800' :
                        producto.margen >= 15 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {producto.margen.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalisisVisual
