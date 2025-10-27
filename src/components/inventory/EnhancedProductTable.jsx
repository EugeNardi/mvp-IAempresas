import React, { useState, useEffect } from 'react'
import { 
  Edit2, Trash2, Package, Search, AlertTriangle, TrendingUp, TrendingDown,
  Plus, Minus, ShoppingCart, DollarSign, Save, X, Check, CheckSquare, Square
} from 'lucide-react'

const EnhancedProductTable = ({ products, categories, onEdit, onDelete, onStockChange, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [editingStock, setEditingStock] = useState(null)
  const [stockValue, setStockValue] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [bulkStockValue, setBulkStockValue] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.category_id === filterCategory
    const matchesLowStock = !filterLowStock || (product.current_stock || 0) <= (product.min_stock || 0)
    
    return matchesSearch && matchesCategory && matchesLowStock
  })

  // Limpiar selecciones cuando cambian los productos o filtros
  useEffect(() => {
    // Mantener solo los IDs que todavía existen en los productos filtrados
    const validIds = filteredProducts.map(p => p.id)
    const validSelections = selectedProducts.filter(id => validIds.includes(id))
    
    if (validSelections.length !== selectedProducts.length) {
      setSelectedProducts(validSelections)
    }
  }, [products, searchTerm, filterCategory, filterLowStock])

  // Limpiar selecciones cuando se vacía la lista
  useEffect(() => {
    if (filteredProducts.length === 0 && selectedProducts.length > 0) {
      setSelectedProducts([])
    }
  }, [filteredProducts.length])

  const getStockStatus = (product) => {
    const currentStock = parseInt(product.current_stock) || 0
    const minStock = parseInt(product.min_stock) || 0
    
    if (currentStock === 0) {
      return { label: 'Sin stock', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: AlertTriangle }
    } else if (currentStock <= minStock) {
      return { label: 'Stock bajo', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700', icon: TrendingDown }
    } else {
      return { label: 'Stock OK', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: TrendingUp }
    }
  }

  const calculateMargin = (product) => {
    const salePrice = parseFloat(product.sale_price) || 0
    const unitCost = parseFloat(product.unit_cost) || 0
    if (salePrice === 0) return 0
    return ((salePrice - unitCost) / salePrice * 100).toFixed(1)
  }

  const handleStockEdit = (product) => {
    setEditingStock(product.id)
    setStockValue(product.current_stock.toString())
  }

  const handleStockSave = async (product) => {
    const newStock = parseInt(stockValue) || 0
    if (newStock !== product.current_stock) {
      await onStockChange(product.id, newStock)
    }
    setEditingStock(null)
    setStockValue('')
  }

  const handleStockCancel = () => {
    setEditingStock(null)
    setStockValue('')
  }

  const handleQuickAdjust = async (product, adjustment) => {
    const newStock = Math.max(0, product.current_stock + adjustment)
    await onStockChange(product.id, newStock)
  }

  // Funciones de selección múltiple
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0 || bulkLoading) return
    
    const confirmMsg = `¿Estás seguro de eliminar ${selectedProducts.length} producto(s)?`
    if (!confirm(confirmMsg)) return

    console.log(`🗑️ Eliminando ${selectedProducts.length} productos...`)
    setBulkLoading(true)
    
    try {
      // Eliminar todos los productos seleccionados
      const deletePromises = selectedProducts.map(productId => onDelete(productId))
      await Promise.all(deletePromises)
      
      console.log('✅ Productos eliminados correctamente')
      
      // Limpiar selecciones
      setSelectedProducts([])
      setBulkStockValue('')
      setShowBulkActions(false)
      
      // La página se refrescará automáticamente
    } catch (error) {
      console.error('❌ Error en eliminación múltiple:', error)
      alert('Error al eliminar algunos productos. Revisa la consola.')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkStockUpdate = async () => {
    if (selectedProducts.length === 0 || !bulkStockValue || bulkLoading) return
    
    const newStock = parseInt(bulkStockValue) || 0
    const confirmMsg = `¿Actualizar stock de ${selectedProducts.length} producto(s) a ${newStock}?`
    if (!confirm(confirmMsg)) return

    console.log(`📦 Actualizando stock de ${selectedProducts.length} productos a ${newStock}...`)
    setBulkLoading(true)
    
    try {
      // Actualizar todos en paralelo para mayor velocidad
      const updatePromises = selectedProducts.map(productId => 
        onStockChange(productId, newStock)
      )
      await Promise.all(updatePromises)
      
      console.log('✅ Stock actualizado correctamente')
      
      // Limpiar después de actualizar
      setSelectedProducts([])
      setBulkStockValue('')
      setShowBulkActions(false)
    } catch (error) {
      console.error('❌ Error en actualización múltiple:', error)
      alert('Error al actualizar stock de algunos productos')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkStockAdjust = async (adjustment) => {
    if (selectedProducts.length === 0 || bulkLoading) return
    
    const confirmMsg = `¿${adjustment > 0 ? 'Sumar' : 'Restar'} ${Math.abs(adjustment)} unidad(es) a ${selectedProducts.length} producto(s)?`
    if (!confirm(confirmMsg)) return

    console.log(`📊 Ajustando stock de ${selectedProducts.length} productos (${adjustment > 0 ? '+' : ''}${adjustment})...`)
    setBulkLoading(true)
    
    try {
      const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))
      
      // Actualizar todos en paralelo
      const updatePromises = selectedProductsData.map(product => {
        const currentStock = parseInt(product.current_stock) || 0
        const newStock = Math.max(0, currentStock + adjustment)
        return onStockChange(product.id, newStock)
      })
      
      await Promise.all(updatePromises)
      
      console.log('✅ Stock ajustado correctamente')
      
      // Limpiar después de ajustar
      setSelectedProducts([])
      setBulkStockValue('')
      setShowBulkActions(false)
    } catch (error) {
      console.error('❌ Error en ajuste múltiple:', error)
      alert('Error al ajustar stock de algunos productos')
    } finally {
      setBulkLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              {bulkLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              )}
              <span className="font-medium text-blue-900">
                {bulkLoading ? 'Procesando...' : `${selectedProducts.length} producto(s) seleccionado(s)`}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Ajuste rápido */}
              <button
                onClick={() => handleBulkStockAdjust(-1)}
                disabled={bulkLoading}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Restar 1 a todos"
              >
                <Minus className="w-4 h-4 inline mr-1" />
                -1
              </button>
              
              <button
                onClick={() => handleBulkStockAdjust(1)}
                disabled={bulkLoading}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sumar 1 a todos"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                +1
              </button>

              {/* Stock específico */}
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(e.target.value)}
                  placeholder="Stock"
                  disabled={bulkLoading}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleBulkStockUpdate}
                  disabled={!bulkStockValue || bulkLoading}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Establecer stock"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>

              {/* Eliminar */}
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Eliminar
              </button>

              {/* Cancelar */}
              <button
                onClick={() => {
                  setSelectedProducts([])
                  setBulkStockValue('')
                }}
                disabled={bulkLoading}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterLowStock
              ? 'bg-orange-100 text-orange-700 border border-orange-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Stock Bajo
        </button>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No hay productos para mostrar</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || filterCategory || filterLowStock
              ? 'Intenta ajustar los filtros'
              : 'Comienza agregando tu primer producto'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 w-12 sticky left-0 bg-gray-50 z-10">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title={selectedProducts.length === filteredProducts.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  >
                    {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 min-w-[200px]">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 min-w-[120px]">Categoría</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 min-w-[120px]">Marca</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 min-w-[120px]">Modelo</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 min-w-[100px]">Stock</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 min-w-[120px]">Costo</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 min-w-[150px]">Precio Venta Minorista</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 min-w-[150px]">Precio Venta Mayorista</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 min-w-[100px]">Margen</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 min-w-[120px]">Estado</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 min-w-[150px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const status = getStockStatus(product)
                const StatusIcon = status.icon
                const margin = calculateMargin(product)
                const isEditing = editingStock === product.id

                const isSelected = selectedProducts.includes(product.id)

                return (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleSelectProduct(product.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>

                    {/* Producto */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.sku && (
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        )}
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{product.category || '-'}</span>
                    </td>

                    {/* Marca */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{product.brand || '-'}</span>
                    </td>

                    {/* Modelo */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{product.model || '-'}</span>
                    </td>

                    {/* Stock (solo lectura) */}
                    <td className="py-3 px-4">
                      <div className="text-center">
                        <p className="font-bold text-gray-900 text-lg">{product.current_stock}</p>
                        <p className="text-xs text-gray-500">Mín: {product.min_stock}</p>
                      </div>
                    </td>

                    {/* Costo */}
                    <td className="py-3 px-4 text-right">
                      <p className="font-medium text-gray-900">
                        ${(parseFloat(product.unit_cost) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total: ${((parseInt(product.current_stock) || 0) * (parseFloat(product.unit_cost) || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </td>

                    {/* Precio Venta Minorista */}
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      ${(parseFloat(product.sale_price) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Precio Venta Mayorista */}
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      ${(parseFloat(product.wholesale_price) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Margen */}
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${
                        margin > 30 ? 'text-green-600' : margin > 15 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {margin}%
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {filteredProducts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Productos mostrados</p>
              <p className="text-lg font-bold text-gray-900">{filteredProducts.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor total en stock</p>
              <p className="text-lg font-bold text-gray-900">
                ${filteredProducts.reduce((sum, p) => sum + ((parseInt(p.current_stock) || 0) * (parseFloat(p.unit_cost) || 0)), 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor potencial de venta</p>
              <p className="text-lg font-bold text-green-600">
                ${filteredProducts.reduce((sum, p) => sum + ((parseInt(p.current_stock) || 0) * (parseFloat(p.sale_price) || 0)), 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ganancia potencial</p>
              <p className="text-lg font-bold text-blue-600">
                ${filteredProducts.reduce((sum, p) => sum + ((parseInt(p.current_stock) || 0) * ((parseFloat(p.sale_price) || 0) - (parseFloat(p.unit_cost) || 0))), 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedProductTable
