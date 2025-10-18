import React, { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, DollarSign, Package, CheckCircle, AlertCircle, Search, X } from 'lucide-react'
import { useData } from '../../context/DataContext'

const Sales = () => {
  const { inventoryItems = [], saveInvoice, updateInventoryItem, loading } = useData()
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Filtrar por búsqueda - TODOS los productos
  const filteredItems = (inventoryItems || []).filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Contar productos con stock disponible
  const productsWithStock = (inventoryItems || []).filter(item => item.stock > 0).length

  // Agregar producto al carrito
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      // Si ya está en el carrito, aumentar cantidad
      if (existingItem.quantity < item.stock) {
        setCart(cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ))
      } else {
        alert(`Stock máximo disponible: ${item.stock}`)
      }
    } else {
      // Agregar nuevo item al carrito
      setCart([...cart, {
        ...item,
        quantity: 1,
        salePrice: item.salePrice || 0
      }])
    }
  }

  // Actualizar cantidad en carrito
  const updateQuantity = (itemId, newQuantity) => {
    const item = inventoryItems.find(inv => inv.id === itemId)
    
    if (newQuantity <= 0) {
      removeFromCart(itemId)
    } else if (newQuantity <= item.stock) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ))
    } else {
      alert(`Stock máximo disponible: ${item.stock}`)
    }
  }

  // Actualizar precio de venta
  const updateSalePrice = (itemId, newPrice) => {
    setCart(cart.map(cartItem =>
      cartItem.id === itemId
        ? { ...cartItem, salePrice: parseFloat(newPrice) || 0 }
        : cartItem
    ))
  }

  // Remover del carrito
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  // Limpiar carrito
  const clearCart = () => {
    setCart([])
  }

  // Calcular totales
  const subtotal = cart.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0)
  const iva = subtotal * 0.21 // IVA 21%
  const total = subtotal + iva

  // Procesar venta
  const processSale = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }

    setProcessing(true)

    try {
      // 1. Crear factura de venta
      const invoice = {
        type: 'income',
        number: `VENTA-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: subtotal,
        description: `Venta de ${cart.length} producto(s)`,
        category: 'Ventas',
        fileName: 'Manual',
        taxes: [
          {
            name: 'IVA 21%',
            type: 'IVA',
            rate: 21,
            amount: iva,
            shouldCount: true
          }
        ],
        items: cart.map(item => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.salePrice,
          total: item.salePrice * item.quantity
        }))
      }

      await saveInvoice(invoice)

      // 2. Actualizar stock de cada producto
      for (const cartItem of cart) {
        const inventoryItem = inventoryItems.find(inv => inv.id === cartItem.id)
        const newStock = inventoryItem.stock - cartItem.quantity

        await updateInventoryItem(cartItem.id, {
          ...inventoryItem,
          stock: newStock
        })
      }

      // 3. Mostrar éxito y limpiar carrito
      setShowSuccess(true)
      clearCart()
      
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error procesando venta:', error)
      alert('Error al procesar la venta. Por favor, intenta de nuevo.')
    } finally {
      setProcessing(false)
    }
  }

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-600" />
              Sistema de Ventas
            </h2>
            <p className="text-gray-600 mt-2">
              Selecciona productos del inventario para realizar una venta
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total productos</p>
            <p className="text-3xl font-bold text-green-600">{inventoryItems.length}</p>
            <p className="text-xs text-gray-500 mt-1">{productsWithStock} con stock</p>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-green-900">¡Venta realizada con éxito!</h3>
            <p className="text-green-700">El stock se actualizó y la factura se generó correctamente.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Productos disponibles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Productos Disponibles</h3>
              
              {/* Buscador */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Lista de productos */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        {item.sku && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                            {item.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Stock: <span className="font-semibold">{item.stock}</span>
                        </span>
                        <span className="text-sm text-green-600 font-semibold">
                          ${item.salePrice?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No se encontraron productos' : 'No hay productos en el inventario'}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">
                      Agrega productos en la sección de Inventario
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carrito de compras */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Carrito</h3>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              )}
            </div>

            {cart.length > 0 ? (
              <>
                {/* Items en carrito */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600">Stock disponible: {item.stock}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Cantidad */}
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                          min="1"
                          max={item.stock}
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Precio */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Precio:</span>
                        <input
                          type="number"
                          value={item.salePrice}
                          onChange={(e) => updateSalePrice(item.id, e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      {/* Subtotal del item */}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 text-right">
                          ${(item.salePrice * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA (21%):</span>
                    <span className="font-semibold">${iva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-green-600">${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Botón de venta */}
                <button
                  onClick={processSale}
                  disabled={processing}
                  className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Realizar Venta
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">El carrito está vacío</p>
                <p className="text-sm text-gray-500 mt-1">Agrega productos para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sales
