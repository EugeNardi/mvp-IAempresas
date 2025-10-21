import React, { useState, useEffect } from 'react'
import { Package, Tag, Upload, TrendingDown, AlertTriangle, Plus, Search, Filter } from 'lucide-react'
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setEditingProduct(null)
                      setShowProductForm(true)
                    }}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Producto</span>
                  </button>
                  <button
                    onClick={() => setShowBulkImport(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Importar Excel</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Product Table */}
              <EnhancedProductTable
                products={products}
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStockChange={handleStockChange}
                loading={loading}
              />
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
