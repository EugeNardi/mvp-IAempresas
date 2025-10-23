import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { user } = useAuth()
  const [companyData, setCompanyData] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [inventoryItems, setInventoryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableExists, setTableExists] = useState(true)

  // Cargar datos desde Supabase cuando el usuario inicia sesión
  useEffect(() => {
    let isMounted = true
    
    if (user && isMounted) {
      loadCompanyData()
      loadInvoices()
      loadInventoryItems()
    } else {
      setCompanyData(null)
      setInvoices([])
      setInventoryItems([])
      setLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [user?.id])

  const loadCompanyData = async () => {
    try {
      console.log('🏭 Cargando datos de empresa desde Supabase...')
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error) {
        // Si no existe la empresa, no es un error crítico
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No hay datos de empresa aún')
          setCompanyData(null)
          return
        }
        console.warn('⚠️ Error cargando empresa:', error.message)
        setCompanyData(null)
        return
      }

      console.log('✅ Empresa cargada:', data.name)
      
      // Transformar datos de Supabase al formato del componente
      const transformedData = {
        id: data.id,
        name: data.name,
        cuit: data.tax_id || '',
        address: data.address || '',
        locality: data.locality || '',
        city: data.city || '',
        province: data.province || '',
        country: data.country || 'Argentina',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        industry: data.industry || '',
        fiscalCategory: data.fiscal_category || '',
        fiscalYear: data.fiscal_year || new Date().getFullYear().toString(),
        currency: data.currency || 'ARS'
      }
      
      setCompanyData(transformedData)
    } catch (error) {
      console.error('Error loading company:', error)
      setCompanyData(null)
    }
  }

  const saveCompanyData = async (companyInfo) => {
    try {
      console.log('💾 Guardando datos de empresa en Supabase...')
      
      const companyDataToSave = {
        user_id: user.id,
        name: companyInfo.name,
        tax_id: companyInfo.cuit || null,
        address: companyInfo.address || null,
        locality: companyInfo.locality || null,
        city: companyInfo.city || null,
        province: companyInfo.province || null,
        country: companyInfo.country || 'Argentina',
        phone: companyInfo.phone || null,
        email: companyInfo.email || null,
        website: companyInfo.website || null,
        industry: companyInfo.industry || null,
        fiscal_category: companyInfo.fiscalCategory || null,
        fiscal_year: companyInfo.fiscalYear || new Date().getFullYear().toString(),
        currency: companyInfo.currency || 'ARS'
      }

      // Intentar actualizar primero
      const { data: existingData } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let result
      if (existingData) {
        // Actualizar empresa existente
        result = await supabase
          .from('companies')
          .update(companyDataToSave)
          .eq('id', existingData.id)
          .select()
          .single()
      } else {
        // Crear nueva empresa
        result = await supabase
          .from('companies')
          .insert([companyDataToSave])
          .select()
          .single()
      }

      if (result.error) {
        console.error('❌ Error guardando empresa:', result.error)
        throw result.error
      }

      console.log('✅ Empresa guardada correctamente')
      
      // Recargar datos de empresa
      await loadCompanyData()
      
      return result.data
    } catch (error) {
      console.error('Error saving company:', error)
      throw error
    }
  }

  const loadInvoices = async () => {
    try {
      console.log('📊 Cargando facturas desde Supabase...')
      setLoading(true)
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('invoice_date', { ascending: false })

      if (error) {
        // Error 400 o 404 significa que la tabla no existe
        if (error.code === 'PGRST204' || error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.warn('⚠️ La tabla "invoices" no existe en Supabase.')
          console.warn('📝 Ejecuta el script SQL: supabase-invoices-setup.sql')
          console.warn('👉 Supabase Dashboard > SQL Editor > Pega el script > Run')
          setTableExists(false)
          setInvoices([])
          setLoading(false)
          return
        }
        
        console.error('❌ Error cargando facturas:', error)
        throw error
      }

      console.log(`✅ Facturas cargadas: ${data?.length || 0}`)
      setTableExists(true)
      
      // Transformar datos de Supabase al formato del componente
      const transformedInvoices = (data || []).map(invoice => ({
        id: invoice.id,
        type: invoice.invoice_type,
        number: invoice.invoice_number,
        date: invoice.invoice_date,
        description: invoice.description,
        amount: invoice.amount,
        category: invoice.category,
        fileName: invoice.file_name || 'Manual',
        processed: invoice.processed,
        taxes: invoice.taxes || [],
        metadata: invoice.metadata || {}
      }))
      
      setInvoices(transformedInvoices)
    } catch (error) {
      console.error('Error loading invoices:', error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const saveInvoice = async (invoice) => {
    try {
      if (!tableExists) {
        throw new Error('La tabla "invoices" no existe. Ejecuta el script SQL primero.')
      }

      console.log('💾 Guardando factura en Supabase...', invoice)
      
      const invoiceData = {
        user_id: user.id,
        company_id: companyData?.id || null,
        invoice_number: invoice.number,
        invoice_type: invoice.type,
        invoice_date: invoice.date,
        description: invoice.description,
        amount: parseFloat(invoice.amount),
        category: invoice.category,
        file_name: invoice.fileName || 'Manual',
        processed: invoice.processed || true,
        taxes: invoice.taxes || [],
        metadata: invoice.metadata || {}
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single()

      if (error) {
        console.error('❌ Error guardando factura:', error)
        console.error('Detalles del error:', error.message, error.code)
        throw error
      }

      console.log('✅ Factura guardada correctamente:', data.id)
      
      // Recargar facturas para mantener sincronización
      await loadInvoices()
      
      return data
    } catch (error) {
      console.error('Error saving invoice:', error)
      throw error
    }
  }

  const deleteInvoice = async (invoiceId) => {
    try {
      if (!tableExists) {
        throw new Error('La tabla "invoices" no existe. Ejecuta el script SQL primero.')
      }

      console.log(`🗑️ Eliminando factura: ${invoiceId}`)
      
      const { error } = await supabase
        .from('invoices')
        .update({ is_active: false })
        .eq('id', invoiceId)

      if (error) {
        console.error('❌ Error eliminando factura:', error)
        throw error
      }

      console.log('✅ Factura eliminada correctamente')
      
      // Recargar facturas
      await loadInvoices()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      throw error
    }
  }

  const loadInventoryItems = async () => {
    try {
      console.log('📦 Cargando items del inventario...')
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.warn('⚠️ Error cargando inventario:', error.message)
        setInventoryItems([])
        return
      }

      setInventoryItems(data || [])
      console.log(`✅ Items del inventario cargados: ${data?.length || 0}`)
    } catch (error) {
      console.error('Error loading inventory:', error)
      setInventoryItems([])
    }
  }

  const updateInventoryItem = async (itemId, updatedData) => {
    try {
      console.log(`📝 Actualizando item del inventario: ${itemId}`)
      
      const { data, error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', itemId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error actualizando item:', error)
        throw error
      }

      console.log('✅ Item actualizado correctamente')
      
      // Recargar inventario
      await loadInventoryItems()
      
      return data
    } catch (error) {
      console.error('Error updating inventory item:', error)
      throw error
    }
  }

  const updateInvoice = async (invoiceId, updatedData) => {
    try {
      if (!tableExists) {
        throw new Error('La tabla "invoices" no existe. Ejecuta el script SQL primero.')
      }

      console.log(`📝 Actualizando factura: ${invoiceId}`)
      
      const invoiceData = {
        invoice_number: updatedData.number,
        invoice_type: updatedData.type,
        invoice_date: updatedData.date,
        description: updatedData.description,
        amount: parseFloat(updatedData.amount),
        category: updatedData.category,
        file_name: updatedData.fileName || 'Manual',
        processed: updatedData.processed || true,
        taxes: updatedData.taxes || [],
        metadata: updatedData.metadata || {}
      }

      const { data, error } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', invoiceId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error actualizando factura:', error)
        throw error
      }

      console.log('✅ Factura actualizada correctamente')
      
      // Recargar facturas
      await loadInvoices()
      
      return data
    } catch (error) {
      console.error('Error updating invoice:', error)
      throw error
    }
  }

  // Alias para compatibilidad
  const addInvoice = saveInvoice
  
  // Función para agregar items al inventario
  const addInventoryItem = async (item) => {
    try {
      console.log('📦 Agregando item al inventario...')
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          user_id: user.id,
          ...item
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error agregando item:', error)
        throw error
      }

      console.log('✅ Item agregado correctamente')
      await loadInventoryItems()
      return data
    } catch (error) {
      console.error('Error adding inventory item:', error)
      throw error
    }
  }

  // Función para actualizar stock (sumar o restar)
  const updateProductStock = async (productId, quantityChange, operation = 'add') => {
    try {
      console.log(`📦 ${operation === 'add' ? 'Agregando' : 'Restando'} ${quantityChange} unidades al producto ${productId}`)
      
      // Obtener producto actual
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('current_stock, name')
        .eq('id', productId)
        .single()

      if (fetchError) {
        console.error('❌ Error obteniendo producto:', fetchError)
        throw fetchError
      }

      const currentStock = product.current_stock || 0
      const newStock = operation === 'add' 
        ? currentStock + quantityChange 
        : currentStock - quantityChange

      // Validar que no quede stock negativo
      if (newStock < 0) {
        throw new Error(`Stock insuficiente para ${product.name}. Stock actual: ${currentStock}, intentando restar: ${quantityChange}`)
      }

      // Actualizar stock
      const { data, error } = await supabase
        .from('products')
        .update({ 
          current_stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error actualizando stock:', error)
        throw error
      }

      console.log(`✅ Stock actualizado: ${currentStock} → ${newStock}`)
      await loadInventoryItems()
      return data
    } catch (error) {
      console.error('Error updating product stock:', error)
      throw error
    }
  }

  // Función para buscar o crear producto en inventario
  const findOrCreateProduct = async (productData) => {
    try {
      console.log('🔍 Buscando producto en inventario:', productData.nombre)
      
      // Buscar por nombre exacto
      const { data: existingProducts, error: searchError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .ilike('name', productData.nombre)
        .eq('is_active', true)

      if (searchError) {
        console.error('❌ Error buscando producto:', searchError)
        throw searchError
      }

      // Si existe, retornar el primero
      if (existingProducts && existingProducts.length > 0) {
        console.log('✅ Producto encontrado en inventario')
        return existingProducts[0]
      }

      // Si no existe, crear nuevo
      console.log('📦 Creando nuevo producto en inventario')
      const newProduct = {
        user_id: user.id,
        name: productData.nombre,
        description: productData.descripcion || '',
        category_id: null,
        unit_cost: parseFloat(productData.costoUnitario || 0),
        sale_price: parseFloat(productData.precioMinorista || productData.precioUnitario || 0),
        current_stock: 0,
        min_stock: 0,
        is_active: true
      }

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creando producto:', error)
        throw error
      }

      console.log('✅ Producto creado en inventario')
      await loadInventoryItems()
      return data
    } catch (error) {
      console.error('Error finding or creating product:', error)
      throw error
    }
  }

  // Función para obtener productos del inventario
  const getInventoryProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error obteniendo productos:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting inventory products:', error)
      return []
    }
  }

  const value = {
    companyData,
    setCompanyData,
    saveCompanyData,
    loadCompanyData,
    invoices,
    setInvoices,
    loading,
    loadInvoices,
    saveInvoice,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    inventoryItems,
    setInventoryItems,
    loadInventoryItems,
    addInventoryItem,
    updateInventoryItem,
    updateProductStock,
    findOrCreateProduct,
    getInventoryProducts,
    tableExists
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
