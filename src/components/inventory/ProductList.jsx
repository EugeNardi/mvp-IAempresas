import React, { useState } from 'react'
import { Edit2, Trash2, Package, Search, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

const ProductList = ({ products, categories, onEdit, onDelete, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterLowStock, setFilterLowStock] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.category_id === filterCategory
    const matchesLowStock = !filterLowStock || product.current_stock <= product.min_stock
    
    return matchesSearch && matchesCategory && matchesLowStock
  })

  const getStockStatus = (product) => {
    if (product.current_stock === 0) {
      return { label: 'Sin stock', color: 'red', icon: AlertTriangle }
    } else if (product.current_stock <= product.min_stock) {
      return { label: 'Stock bajo', color: 'orange', icon: TrendingDown }
    } else {
      return { label: 'Stock OK', color: 'green', icon: TrendingUp }
    }
  }

  const calculateMargin = (product) => {
    if (product.sale_price === 0) return 0
    return ((product.sale_price - product.unit_cost) / product.sale_price * 100).toFixed(1)
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoría</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Costo</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Precio Venta</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Margen</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const status = getStockStatus(product)
                const StatusIcon = status.icon
                const margin = calculateMargin(product)

                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.sku && (
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {product.category ? (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${product.category.color}20`,
                            color: product.category.color
                          }}
                        >
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin categoría</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div>
                        <p className="font-medium text-gray-900">{product.current_stock}</p>
                        <p className="text-xs text-gray-500">Mín: {product.min_stock}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      ${product.unit_cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      ${product.sale_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${
                        margin > 30 ? 'text-green-600' : margin > 15 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {margin}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
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
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-medium">{filteredProducts.length}</span> de{' '}
            <span className="font-medium">{products.length}</span> productos
          </p>
          <p className="text-sm text-gray-600">
            Valor total:{' '}
            <span className="font-medium text-gray-900">
              ${filteredProducts.reduce((sum, p) => sum + (p.current_stock * p.unit_cost), 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default ProductList
