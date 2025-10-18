import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useData } from '../../context/DataContext'

const CategoryManager = ({ onCategoryChange }) => {
  const { companyData } = useData()
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    description: '',
    color: '#3B82F6',
    icon: 'Package'
  })

  const categoryTypes = [
    { value: 'stock', label: 'Stock/Inventario', color: 'blue' },
    { value: 'expense', label: 'Gastos', color: 'red' },
    { value: 'income', label: 'Ingresos', color: 'green' }
  ]

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#64748B'
  ]

  useEffect(() => {
    if (companyData?.id) {
      loadCategories()
    }
  }, [companyData])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('company_id', companyData.id)
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingCategory) {
        // Actualizar categoría
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            type: formData.type,
            description: formData.description,
            color: formData.color,
            icon: formData.icon
          })
          .eq('id', editingCategory.id)

        if (error) throw error
      } else {
        // Crear nueva categoría
        const { error } = await supabase
          .from('categories')
          .insert([{
            company_id: companyData.id,
            name: formData.name,
            type: formData.type,
            description: formData.description,
            color: formData.color,
            icon: formData.icon
          }])

        if (error) throw error
      }

      await loadCategories()
      if (onCategoryChange) onCategoryChange()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error al guardar la categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', categoryId)

      if (error) throw error
      await loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error al eliminar la categoría')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || '',
      color: category.color || '#3B82F6',
      icon: category.icon || 'Package'
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      type: 'stock',
      description: '',
      color: '#3B82F6',
      icon: 'Package'
    })
  }

  const getCategoryTypeColor = (type) => {
    const typeObj = categoryTypes.find(t => t.value === type)
    return typeObj?.color || 'gray'
  }

  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = []
    acc[cat.type].push(cat)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
          <p className="text-gray-600 mt-1">Organiza tus productos, gastos e ingresos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories by Type */}
      {loading && categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando categorías...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryTypes.map(type => (
            <div key={type.value} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-3 h-3 rounded-full bg-${type.color}-500`}></div>
                <h3 className="text-lg font-semibold text-gray-900">{type.label}</h3>
                <span className="text-sm text-gray-500">
                  ({groupedCategories[type.value]?.length || 0})
                </span>
              </div>

              {groupedCategories[type.value]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupedCategories[type.value].map(category => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <Tag className="w-5 h-5" style={{ color: category.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-gray-500 truncate">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No hay categorías de este tipo</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Productos de limpieza"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {categoryTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción opcional"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        formData.color === color
                          ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : editingCategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManager
