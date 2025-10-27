import React, { useState, useEffect } from 'react'
import { Package, Tag, Upload, TrendingDown, AlertTriangle, Plus, Search, Filter, X, Copy, Check, MessageCircle } from 'lucide-react'
import { useData } from '../context/DataContext'
import { supabase } from '../lib/supabase'
import CategoryManager from '../components/inventory/CategoryManager'
import EnhancedProductTable from '../components/inventory/EnhancedProductTable'
import ProductForm from '../components/inventory/ProductForm'
import SmartBulkImport from '../components/inventory/SmartBulkImport'

const Inventory = () => {
  const { companyData } = useData()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    categoria: '',
    marca: '',
    modelo: '',
    margenMin: '',
    margenMax: ''
  })
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategoryForList, setSelectedCategoryForList] = useState('')
  const [copiedMinorista, setCopiedMinorista] = useState(false)
  const [copiedMayorista, setCopiedMayorista] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  })

  useEffect(() => {
    // Cargar datos siempre, incluso sin company_id (para productos externos)
    loadData()
  }, [companyData])

  useEffect(() => {
    // Aplicar filtros cuando cambian los productos o los filtros
    applyFilters()
  }, [products, filters])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadProducts(),
        loadCategories()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      console.log('🔍 Cargando productos...')
      
      // Cargar productos del usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.warn('⚠️ No hay usuario autenticado')
        setProducts([])
        return
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }

      console.log('✅ Productos cargados:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('Primeros 3 productos:', data.slice(0, 3))
      }
      
      setProducts(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      alert('Error al cargar productos. Verifica la consola.')
    }
  }

  const loadCategories = async () => {
    try {
      console.log('🔍 Cargando categorías...')
      
      // Intentar cargar categorías, pero no fallar si la tabla no existe
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.warn('⚠️ Tabla categories no existe aún:', error.message)
        setCategories([])
        return
      }
      
      console.log('✅ Categorías cargadas:', data?.length || 0)
      setCategories(data || [])
    } catch (error) {
      console.warn('Categories table not available yet')
      setCategories([])
    }
  }

  const calculateStats = (productList) => {
    const totalProducts = productList.length
    const totalValue = productList.reduce((sum, p) => sum + (p.current_stock * p.unit_cost), 0)
    const lowStock = productList.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock).length
    const outOfStock = productList.filter(p => p.current_stock === 0).length

    setStats({ totalProducts, totalValue, lowStock, outOfStock })
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Filtrar por categoría
    if (filters.categoria) {
      filtered = filtered.filter(p => 
        p.category && p.category.toLowerCase().includes(filters.categoria.toLowerCase())
      )
    }

    // Filtrar por marca
    if (filters.marca) {
      filtered = filtered.filter(p => 
        p.brand && p.brand.toLowerCase().includes(filters.marca.toLowerCase())
      )
    }

    // Filtrar por modelo
    if (filters.modelo) {
      filtered = filtered.filter(p => 
        p.model && p.model.toLowerCase().includes(filters.modelo.toLowerCase())
      )
    }

    // Filtrar por margen
    if (filters.margenMin !== '' || filters.margenMax !== '') {
      filtered = filtered.filter(p => {
        const salePrice = parseFloat(p.sale_price) || 0
        const unitCost = parseFloat(p.unit_cost) || 0
        
        // Calcular margen: (precio_venta - costo) / precio_venta * 100
        const margen = salePrice > 0 
          ? ((salePrice - unitCost) / salePrice) * 100 
          : 0
        
        const cumpleMin = filters.margenMin === '' || margen >= parseFloat(filters.margenMin)
        const cumpleMax = filters.margenMax === '' || margen <= parseFloat(filters.margenMax)
        
        return cumpleMin && cumpleMax
      })
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setFilters({
      categoria: '',
      marca: '',
      modelo: '',
      margenMin: '',
      margenMax: ''
    })
  }

  const hasActiveFilters = () => {
    return filters.categoria || filters.marca || filters.modelo || 
           filters.margenMin !== '' || filters.margenMax !== ''
  }

  // Obtener valores únicos para sugerencias
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))]
  const uniqueModels = [...new Set(products.map(p => p.model).filter(Boolean))]

  // Generar lista de difusión
  const generateBroadcastList = (type) => {
    // Filtrar productos con stock y por categoría si está seleccionada
    let productsToList = products.filter(p => p.current_stock > 0)
    
    if (selectedCategoryForList) {
      productsToList = productsToList.filter(p => p.category === selectedCategoryForList)
    }

    if (productsToList.length === 0) {
      return '⚠️ No hay productos en stock para mostrar'
    }

    // Agrupar por marca y modelo
    const groupedProducts = {}
    productsToList.forEach(product => {
      const brand = product.brand || 'Sin Marca'
      const model = product.model || 'Sin Modelo'
      const key = `${brand}|${model}`
      
      if (!groupedProducts[key]) {
        groupedProducts[key] = {
          brand,
          model,
          products: []
        }
      }
      groupedProducts[key].products.push(product)
    })

    // Construir el mensaje
    const categoryText = selectedCategoryForList ? ` - ${selectedCategoryForList}` : ''
    const priceType = type === 'minorista' ? 'MINORISTA' : 'MAYORISTA'
    
    let message = `🎉 *LISTA DE PRODUCTOS DISPONIBLES${categoryText}* 🎉\n`
    message += `💰 *Precios ${priceType}* 💰\n`
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`

    // Agregar productos agrupados
    Object.values(groupedProducts).forEach(group => {
      message += `🏷️ *${group.brand}* - ${group.model}\n`
      message += `━━━━━━━━━━━━━━━━\n`
      
      group.products.forEach(product => {
        const price = type === 'minorista' 
          ? parseFloat(product.sale_price) || 0
          : parseFloat(product.wholesale_price) || 0
        
        message += `📦 ${product.name}\n`
        message += `   💵 $${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}\n`
        message += `   📊 Stock: ${product.current_stock} unidades\n\n`
      })
      
      message += `\n`
    })

    message += `━━━━━━━━━━━━━━━━━━━━\n`
    message += `✨ *¡Consultá por disponibilidad!* ✨\n`
    message += `📱 Hacé tu pedido ahora\n`

    return message
  }

  const copyBroadcastList = async (type) => {
    const message = generateBroadcastList(type)
    
    try {
      await navigator.clipboard.writeText(message)
      if (type === 'minorista') {
        setCopiedMinorista(true)
        setTimeout(() => setCopiedMinorista(false), 2000)
      } else {
        setCopiedMayorista(true)
        setTimeout(() => setCopiedMayorista(false), 2000)
      }
    } catch (err) {
      console.error('Error al copiar:', err)
      alert('Error al copiar al portapapeles')
    }
  }

  const handleProductSaved = () => {
    loadProducts()
    setShowProductForm(false)
    setEditingProduct(null)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleDelete = async (productId) => {
    try {
      console.log(`🗑️ Eliminando producto: ${productId}`)
      
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId)

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }
      
      console.log('✅ Producto eliminado, recargando lista...')
      
      // Recargar productos automáticamente
      await loadProducts()
      
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error // Propagar el error para que bulk delete lo maneje
    }
  }

  const handleStockChange = async (productId, newStock) => {
    try {
      console.log(`📦 Actualizando stock del producto ${productId} a ${newStock}`)
      
      const { error } = await supabase
        .from('products')
        .update({ 
          current_stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) {
        console.error('❌ Error actualizando stock:', error)
        throw error
      }

      console.log('✅ Stock actualizado correctamente')
      await loadProducts()
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Error al actualizar el stock')
    }
  }

  const tabs = [
    { id: 'products', name: 'Productos', icon: Package },
    { id: 'categories', name: 'Categorías', icon: Tag }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600 mt-1">Control completo de productos, stock y categorías</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Productos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
              <Package className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Valor Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.totalValue.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
              <TrendingDown className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Stock Bajo</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Sin Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStock}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-all font-medium text-sm ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Actions */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowBulkImport(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Importar Excel</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-colors font-medium text-sm shadow-md hover:shadow-lg ${
                    hasActiveFilters() 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                  {hasActiveFilters() && (
                    <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {Object.values(filters).filter(v => v !== '').length}
                    </span>
                  )}
                </button>
              </div>

              {/* Filtros Panel */}
              {showFilters && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Filter className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Filtrar Productos</h3>
                    </div>
                    {hasActiveFilters() && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                      >
                        <X className="w-4 h-4" />
                        <span>Limpiar Filtros</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">📦 Categoría</label>
                      <select
                        value={filters.categoria}
                        onChange={(e) => setFilters({...filters, categoria: e.target.value})}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-700 shadow-sm"
                      >
                        <option value="">Todas las categorías</option>
                        {uniqueCategories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Marca</label>
                      <select
                        value={filters.marca}
                        onChange={(e) => setFilters({...filters, marca: e.target.value})}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-700 shadow-sm"
                      >
                        <option value="">Todas las marcas</option>
                        {uniqueBrands.map((marca, idx) => (
                          <option key={idx} value={marca}>{marca}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">🚗 Modelo</label>
                      <select
                        value={filters.modelo}
                        onChange={(e) => setFilters({...filters, modelo: e.target.value})}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-700 shadow-sm"
                      >
                        <option value="">Todos los modelos</option>
                        {uniqueModels.map((modelo, idx) => (
                          <option key={idx} value={modelo}>{modelo}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">💰 Rango de Margen (%)</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5">Margen Mínimo</label>
                        <input
                          type="number"
                          value={filters.margenMin}
                          onChange={(e) => setFilters({...filters, margenMin: e.target.value})}
                          placeholder="Ej: 20"
                          step="1"
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5">Margen Máximo</label>
                        <input
                          type="number"
                          value={filters.margenMax}
                          onChange={(e) => setFilters({...filters, margenMax: e.target.value})}
                          placeholder="Ej: 100"
                          step="1"
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters() && (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-4 shadow-md">
                      <p className="text-sm font-medium">
                        ✨ Mostrando <span className="font-bold text-lg">{filteredProducts.length}</span> de <span className="font-bold">{products.length}</span> productos
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Product Table */}
              <EnhancedProductTable
                products={hasActiveFilters() ? filteredProducts : products}
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStockChange={handleStockChange}
                loading={loading}
              />

              {/* Listas de Difusión */}
              <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Listas de Difusión para WhatsApp</h3>
                    <p className="text-sm text-gray-600">Genera y copia listas de productos para enviar a tus clientes</p>
                  </div>
                </div>

                {/* Selector de Categoría */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📦 Filtrar por Categoría (opcional)
                  </label>
                  <select
                    value={selectedCategoryForList}
                    onChange={(e) => setSelectedCategoryForList(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-medium text-gray-700 shadow-sm"
                  >
                    <option value="">Todas las categorías</option>
                    {uniqueCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Selecciona una categoría para generar una lista más específica
                  </p>
                </div>

                {/* Botones de Copiar */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Lista Minorista */}
                  <div className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-gray-900">Clientes Minoristas</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Lista con precios de venta minorista para clientes finales
                    </p>
                    <button
                      onClick={() => copyBroadcastList('minorista')}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                        copiedMinorista
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copiedMinorista ? (
                        <>
                          <Check className="w-5 h-5" />
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copiar Lista Minorista
                        </>
                      )}
                    </button>
                  </div>

                  {/* Lista Mayorista */}
                  <div className="bg-white rounded-lg p-5 border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <h4 className="font-bold text-gray-900">Clientes Mayoristas</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Lista con precios de venta mayorista para distribuidores
                    </p>
                    <button
                      onClick={() => copyBroadcastList('mayorista')}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                        copiedMayorista
                          ? 'bg-green-500 text-white'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {copiedMayorista ? (
                        <>
                          <Check className="w-5 h-5" />
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copiar Lista Mayorista
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Vista Previa */}
                <div className="mt-6 bg-white rounded-lg p-4 border-2 border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">📋 Vista Previa:</p>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {generateBroadcastList('minorista')}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <CategoryManager onCategoryChange={loadCategories} />
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
          onSave={handleProductSaved}
        />
      )}

      {/* Smart Bulk Import Modal */}
      {showBulkImport && (
        <SmartBulkImport
          companyData={companyData}
          categories={categories}
          onClose={() => setShowBulkImport(false)}
          onImportComplete={loadProducts}
        />
      )}
    </div>
  )
}

export default Inventory
