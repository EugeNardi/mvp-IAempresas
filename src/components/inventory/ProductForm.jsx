import React, { useState, useEffect } from 'react'
import { X, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useData } from '../../context/DataContext'

const ProductForm = ({ product, categories, onClose, onSave }) => {
  const { companyData } = useData()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    supplier_id: '',
    unit_cost: '',
    sale_price: '',
    current_stock: '',
    min_stock: '',
    min_value: '',
    unit_measure: 'Unidad',
    energy_cost: '',
    barcode: ''
  })

  useEffect(() => {
    loadSuppliers()
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        unit_cost: product.unit_cost || '',
        sale_price: product.sale_price || '',
        current_stock: product.current_stock || '',
        min_stock: product.min_stock || '',
        min_value: product.min_value || '',
        unit_measure: product.unit_measure || 'Unidad',
        energy_cost: product.energy_cost || '',
        barcode: product.barcode || ''
      })
    }
  }, [product])

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('company_id', companyData.id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No hay usuario autenticado')
      }

      const productData = {
        user_id: user.id,
        company_id: companyData?.id || null,
        name: formData.name,
        sku: formData.sku || null,
        description: formData.description || null,
        category_id: formData.category_id || null,
        unit_cost: parseFloat(formData.unit_cost) || 0,
        sale_price: parseFloat(formData.sale_price) || 0,
        current_stock: parseInt(formData.current_stock) || 0,
        min_stock: parseInt(formData.min_stock) || 0
      }

      if (product) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
      }

      onSave()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error al guardar el producto: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateMargin = () => {
    const cost = parseFloat(formData.unit_cost) || 0
    const price = parseFloat(formData.sale_price) || 0
    if (price === 0) return 0
    return ((price - cost) / price * 100).toFixed(1)
  }

  const suggestPrice = (marginPercent) => {
    const cost = parseFloat(formData.unit_cost) || 0
    if (cost === 0) return
    const suggestedPrice = cost / (1 - marginPercent / 100)
    setFormData({ ...formData, sale_price: suggestedPrice.toFixed(2) })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-4 sm:my-8">
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {product ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">Complete los datos del producto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Información Básica */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-200">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              <span>Información Básica</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Laptop Dell Inspiron 15"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU / Código
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: PROD-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 7798123456789"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción detallada del producto"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Precios y Costos */}
          <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-4 sm:p-6 border border-gray-200">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              <span>Precios y Costos</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo de Adquisición *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margen de Ganancia
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className={`text-lg font-semibold ${
                    calculateMargin() > 30 ? 'text-green-600' : 
                    calculateMargin() > 15 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {calculateMargin()}%
                  </span>
                </div>
              </div>

              <div className="md:col-span-3">
                <p className="text-sm text-gray-600 mb-2">Sugerencias de precio:</p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => suggestPrice(20)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    20% margen
                  </button>
                  <button
                    type="button"
                    onClick={() => suggestPrice(30)}
                    className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    30% margen
                  </button>
                  <button
                    type="button"
                    onClick={() => suggestPrice(50)}
                    className="px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    50% margen
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo de Energía/Insumo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.energy_cost}
                    onChange={(e) => setFormData({ ...formData, energy_cost: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-gray-200">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              <span>Control de Stock</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Inicial *
                </label>
                <input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Mínimo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_value}
                    onChange={(e) => setFormData({ ...formData, min_value: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de Medida
                </label>
                <select
                  value={formData.unit_measure}
                  onChange={(e) => setFormData({ ...formData, unit_measure: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Unidad">Unidad</option>
                  <option value="Kg">Kilogramo</option>
                  <option value="Litro">Litro</option>
                  <option value="Metro">Metro</option>
                  <option value="Caja">Caja</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 font-semibold transition-all duration-200 transform hover:scale-[1.02]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Guardando...</span>
                </span>
              ) : (
                product ? 'Actualizar Producto' : 'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
