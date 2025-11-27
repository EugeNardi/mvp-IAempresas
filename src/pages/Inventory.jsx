import React, { useState, useEffect } from 'react'
import { Package, Tag, Upload, TrendingDown, TrendingUp, AlertTriangle, Plus, Search, Filter, X, Copy, Check, MessageCircle, ChevronDown, ChevronUp, Edit2, Trash2, Send, DollarSign } from 'lucide-react'
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
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [showBroadcastSection, setShowBroadcastSection] = useState(false)
  const [showLowStockConfig, setShowLowStockConfig] = useState(false)
  const [lowStockRules, setLowStockRules] = useState({
    default: 5,
    specific: []
  })
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
  
  // Estados para el chatbot
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: '¡Hola! 👋 Soy tu asistente de personalización. Dime qué quieres cambiar de la lista y lo haré. Por ejemplo:\n\n"Cambia el título a: OFERTAS ESPECIALES"\n"Cambia los emojis de fuego por bombas"\n"Oculta el stock"\n\nEscribe lo que necesites en lenguaje natural.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [listCustomizations, setListCustomizations] = useState({
    showEmojis: true,
    showStock: true,
    customTitle: '',
    customFooter: '',
    priceFormat: 'default', // 'default', 'rounded', 'noDecimals'
    groupBy: 'brand', // 'brand', 'category', 'model'
    titleEmoji: '🔥', // Emoji personalizable del título
    useBold: true // Controla si se usan asteriscos para negritas
  })

  useEffect(() => {
    // Cargar datos siempre, incluso sin company_id (para productos externos)
    loadData()
    loadLowStockRules()
  }, [companyData])

  useEffect(() => {
    // Aplicar filtros cuando cambian los productos o los filtros
    applyFilters()
  }, [products, filters, showOutOfStock])

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

  const getLowStockThreshold = (product) => {
    // Buscar regla específica que coincida
    const specificRule = lowStockRules.specific.find(rule => {
      const matchCategory = !rule.category || product.category === rule.category
      const matchBrand = !rule.brand || product.brand === rule.brand
      const matchModel = !rule.model || product.model === rule.model
      return matchCategory && matchBrand && matchModel
    })
    
    return specificRule ? specificRule.threshold : lowStockRules.default
  }

  const calculateStats = (productList) => {
    const totalProducts = productList.length
    const totalValue = productList.reduce((sum, p) => sum + (p.current_stock * p.unit_cost), 0)
    const lowStock = productList.filter(p => {
      const threshold = getLowStockThreshold(p)
      return p.current_stock > 0 && p.current_stock <= threshold
    }).length
    const outOfStock = productList.filter(p => p.current_stock === 0).length

    setStats({ totalProducts, totalValue, lowStock, outOfStock })
  }

  const loadLowStockRules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('low_stock_rules')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setLowStockRules(data.rules)
      }
    } catch (error) {
      console.log('No hay reglas de stock bajo guardadas, usando valores por defecto')
    }
  }

  const saveLowStockRules = async (rules) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('No se pudo obtener el usuario. Por favor, inicia sesión nuevamente.')
        return
      }

      console.log('Guardando reglas para usuario:', user.id)
      console.log('Reglas a guardar:', rules)

      const { data, error } = await supabase
        .from('low_stock_rules')
        .upsert({
          user_id: user.id,
          rules: rules,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()

      if (error) {
        console.error('Error de Supabase:', error)
        throw error
      }

      console.log('Reglas guardadas exitosamente:', data)
      setLowStockRules(rules)
      // Recalcular estadísticas con las nuevas reglas
      calculateStats(products)
      alert('Reglas guardadas correctamente')
    } catch (error) {
      console.error('Error guardando reglas:', error)
      alert(`Error al guardar las reglas de stock bajo: ${error.message || 'Error desconocido'}`)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Filtrar por sin stock
    if (showOutOfStock) {
      filtered = filtered.filter(p => p.current_stock === 0)
    }

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

  // Función para obtener emoji contextual basado en el texto
  const getContextualEmoji = (text) => {
    if (!text) return '🔹'
    
    const lowerText = text.toLowerCase()
    
    // Frutas y sabores
    if (lowerText.includes('manzana') || lowerText.includes('apple')) return '🍏'
    if (lowerText.includes('uva') || lowerText.includes('grape')) return '🍇'
    if (lowerText.includes('frutilla') || lowerText.includes('fresa') || lowerText.includes('strawberry') || lowerText.includes('straw')) return '🍓'
    if (lowerText.includes('banana') || lowerText.includes('platano')) return '🍌'
    if (lowerText.includes('sandia') || lowerText.includes('watermelon')) return '🍉'
    if (lowerText.includes('naranja') || lowerText.includes('orange')) return '🍊'
    if (lowerText.includes('limon') || lowerText.includes('lemon')) return '🍋'
    if (lowerText.includes('cereza') || lowerText.includes('cherry')) return '🍒'
    if (lowerText.includes('durazno') || lowerText.includes('peach')) return '🍑'
    if (lowerText.includes('pera') || lowerText.includes('pear')) return '🍐'
    if (lowerText.includes('mango')) return '🥭'
    if (lowerText.includes('piña') || lowerText.includes('pineapple')) return '🍍'
    if (lowerText.includes('coco') || lowerText.includes('coconut')) return '🥥'
    if (lowerText.includes('kiwi')) return '🥝'
    if (lowerText.includes('arandano') || lowerText.includes('blueberry') || lowerText.includes('blue')) return '🫐'
    if (lowerText.includes('frambuesa') || lowerText.includes('raspberry') || lowerText.includes('razz')) return '🫐'
    if (lowerText.includes('mora') || lowerText.includes('blackberry')) return '🫐'
    
    // Bebidas y líquidos
    if (lowerText.includes('cafe') || lowerText.includes('coffee')) return '☕'
    if (lowerText.includes('te') || lowerText.includes('tea')) return '🍵'
    if (lowerText.includes('jugo') || lowerText.includes('juice')) return '🧃'
    if (lowerText.includes('leche') || lowerText.includes('milk')) return '🥛'
    if (lowerText.includes('cerveza') || lowerText.includes('beer')) return '🍺'
    if (lowerText.includes('vino') || lowerText.includes('wine')) return '🍷'
    if (lowerText.includes('coctel') || lowerText.includes('cocktail') || lowerText.includes('tropical') || lowerText.includes('splash')) return '🍹'
    if (lowerText.includes('agua') || lowerText.includes('water')) return '💧'
    
    // Hielo y menta
    if (lowerText.includes('ice') || lowerText.includes('hielo') || lowerText.includes('frio') || lowerText.includes('frozen')) return '🧊'
    if (lowerText.includes('mint') || lowerText.includes('menta') || lowerText.includes('miami')) return '🧊'
    
    // Dulces y postres
    if (lowerText.includes('chocolate')) return '🍫'
    if (lowerText.includes('caramelo') || lowerText.includes('candy')) return '🍬'
    if (lowerText.includes('chicle') || lowerText.includes('gum')) return '🍬'
    if (lowerText.includes('vainilla') || lowerText.includes('vanilla')) return '🍦'
    if (lowerText.includes('crema') || lowerText.includes('cream')) return '🍦'
    
    // Tecnología y electrónica
    if (lowerText.includes('vaper') || lowerText.includes('vape') || lowerText.includes('pod') || lowerText.includes('puff')) return '💨'
    if (lowerText.includes('celular') || lowerText.includes('phone') || lowerText.includes('iphone') || lowerText.includes('samsung')) return '📱'
    if (lowerText.includes('auricular') || lowerText.includes('headphone') || lowerText.includes('airpod')) return '🎧'
    if (lowerText.includes('cargador') || lowerText.includes('charger') || lowerText.includes('cable')) return '🔌'
    if (lowerText.includes('bateria') || lowerText.includes('battery') || lowerText.includes('power')) return '🔋'
    if (lowerText.includes('computadora') || lowerText.includes('pc') || lowerText.includes('laptop')) return '💻'
    
    // Especiales y destacados
    if (lowerText.includes('gold') || lowerText.includes('oro') || lowerText.includes('premium') || lowerText.includes('pro')) return '⭐'
    if (lowerText.includes('black') || lowerText.includes('negro') || lowerText.includes('dark')) return '⚫'
    if (lowerText.includes('dragon') || lowerText.includes('beast') || lowerText.includes('tiger')) return '🐉'
    if (lowerText.includes('fire') || lowerText.includes('fuego') || lowerText.includes('hot')) return '🔥'
    if (lowerText.includes('blast') || lowerText.includes('explosion') || lowerText.includes('mega')) return '💥'
    if (lowerText.includes('sour') || lowerText.includes('acido') || lowerText.includes('agrio')) return '😋'
    if (lowerText.includes('sweet') || lowerText.includes('dulce')) return '🍭'
    if (lowerText.includes('mix') || lowerText.includes('mezcla') || lowerText.includes('fusion')) return '🌀'
    
    // Ropa y accesorios
    if (lowerText.includes('remera') || lowerText.includes('camiseta') || lowerText.includes('shirt')) return '👕'
    if (lowerText.includes('pantalon') || lowerText.includes('jean') || lowerText.includes('pants')) return '👖'
    if (lowerText.includes('zapatilla') || lowerText.includes('zapato') || lowerText.includes('shoe')) return '👟'
    if (lowerText.includes('gorra') || lowerText.includes('cap') || lowerText.includes('hat')) return '🧢'
    
    // Default
    return '🔹'
  }

  // Función para obtener emoji de marca
  const getBrandEmoji = (brand) => {
    if (!brand) return '💨'
    
    const lowerBrand = brand.toLowerCase()
    
    if (lowerBrand.includes('elfbar') || lowerBrand.includes('elf')) return '🧊'
    if (lowerBrand.includes('lost mary') || lowerBrand.includes('mary')) return '💨'
    if (lowerBrand.includes('geek') || lowerBrand.includes('pulse')) return '⚡'
    if (lowerBrand.includes('ignite')) return '🔥'
    if (lowerBrand.includes('vaporesso')) return '💨'
    if (lowerBrand.includes('smok')) return '💨'
    if (lowerBrand.includes('apple') || lowerBrand.includes('iphone')) return '🍎'
    if (lowerBrand.includes('samsung')) return '📱'
    if (lowerBrand.includes('coca') || lowerBrand.includes('pepsi')) return '🥤'
    if (lowerBrand.includes('nike') || lowerBrand.includes('adidas')) return '👟'
    
    return '💨'
  }

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
    const groupedByBrand = {}
    productsToList.forEach(product => {
      const brand = product.brand || 'Sin Marca'
      const model = product.model || 'Sin Modelo'
      
      if (!groupedByBrand[brand]) {
        groupedByBrand[brand] = {}
      }
      
      if (!groupedByBrand[brand][model]) {
        groupedByBrand[brand][model] = []
      }
      
      groupedByBrand[brand][model].push(product)
    })

    // Construir el mensaje
    const categoryText = selectedCategoryForList ? ` DE ${selectedCategoryForList.toUpperCase()}` : ''
    const priceType = type === 'minorista' ? 'MINORISTA' : 'MAYORISTA'
    
    // Usar título personalizado o por defecto
    const title = listCustomizations.customTitle || `DISPONIBLE STOCK${categoryText}`
    const titleEmoji = listCustomizations.titleEmoji || '🔥'
    const bold = (text) => listCustomizations.useBold ? `*${text}*` : text
    
    let message = listCustomizations.showEmojis 
      ? `${titleEmoji} ${bold(title)} ${titleEmoji}\n\n`
      : `${bold(title)}\n\n`

    // Agregar productos agrupados por marca y modelo
    Object.entries(groupedByBrand).forEach(([brand, models]) => {
      const brandEmoji = listCustomizations.showEmojis ? getBrandEmoji(brand) : ''
      message += brandEmoji ? `${brandEmoji} ${bold(brand.toUpperCase())}\n\n` : `${bold(brand.toUpperCase())}\n\n`
      
      Object.entries(models).forEach(([model, items]) => {
        // Obtener el precio del primer producto del modelo
        const price = type === 'minorista' 
          ? parseFloat(items[0].sale_price) || 0
          : parseFloat(items[0].wholesale_price) || 0
        
        const formattedPrice = listCustomizations.priceFormat === 'noDecimals'
          ? price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
          : price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        
        message += `• ${bold(model + ' – $' + formattedPrice)}\n\n`
        
        // Listar todos los productos (sabores/variantes) de este modelo
        items.forEach(product => {
          const productName = product.name
          const productEmoji = listCustomizations.showEmojis ? getContextualEmoji(productName) : ''
          const emojiPrefix = productEmoji ? `${productEmoji} ` : '• '
          
          if (type === 'mayorista' && listCustomizations.showStock) {
            // Para mayorista, mostrar cantidad entre paréntesis si showStock está activo
            message += `${emojiPrefix}${productName} (${product.current_stock})\n`
          } else {
            // Para minorista o si showStock está desactivado, solo el nombre
            message += `${emojiPrefix}${productName}\n`
          }
        })
        
        message += `\n`
      })
      
      message += `\n`
    })

    // Mensajes finales - usar personalizado o por defecto
    if (listCustomizations.customFooter) {
      message += listCustomizations.customFooter
    } else {
      const footerEmoji = listCustomizations.showEmojis ? '📲 ' : ''
      const warningEmoji = listCustomizations.showEmojis ? '⚠️ ' : ''
      message += `${footerEmoji}Escribime para reservar el tuyo o consultar por otros modelos\n\n`
      message += `${warningEmoji}¡Stock limitado!`
    }

    return message
  }

  // Procesar mensaje del chatbot con NLP avanzado
  const processChatMessage = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    let botResponse = ''
    let updated = false
    const changes = []
    
    // 1. DETECTAR CAMBIO DE TÍTULO (mejorado - elimina palabras de relleno)
    const titlePatterns = [
      // Patrón principal: captura después de "que diga" o similar, eliminando esas palabras
      /(?:cambia|cambiar|pon|poner|quiero|modifica|modificar).*?(?:t[íi]tulo|titulo|primer.*?t[íi]tulo|encabezado).*?(?:por|a)\s+(?:uno\s+)?(?:que\s+)?(?:diga|diga|sea|tenga):?\s*(.+?)(?:\.|$|ademas|además|tambien|también)/i,
      // Patrón directo: "título: TEXTO"
      /(?:t[íi]tulo|titulo|encabezado).*?:+\s*(.+?)(?:\.|$|ademas|además|tambien|también)/i,
      // Patrón simple: después de "a" o "por"
      /(?:cambia|cambiar|pon|poner).*?(?:t[íi]tulo|titulo).*?(?:por|a)\s+([A-Z].+?)(?:\.|$|ademas|además|tambien|también)/i
    ]
    
    for (const pattern of titlePatterns) {
      const match = userMessage.match(pattern)
      if (match && match[1]) {
        let newTitle = match[1].trim()
        // Limpiar palabras de relleno al inicio
        newTitle = newTitle.replace(/^(?:uno\s+)?(?:que\s+)?(?:diga|diga|sea|tenga):?\s*/i, '')
        newTitle = newTitle.replace(/["']/g, '')
        
        if (newTitle.length > 3) {
          setListCustomizations(prev => ({ ...prev, customTitle: newTitle }))
          changes.push(`título a "${newTitle}"`)
          updated = true
          break
        }
      }
    }
    
    // 2. DETECTAR CAMBIO DE EMOJIS (mejorado - más flexible y completo)
    const emojiPatterns = [
      // Patrón 1: "cambia los emojis de X por Y"
      /(?:cambia|cambiar|reemplaza|reemplazar).*?emoji.*?(?:de|del)?\s*(?:fuego|fuegos|fire).*?(?:por|a|con)\s*(?:uno[s]?\s+)?(?:de\s+)?(.+?)(?:\.|$|ademas|además|tambien|también)/i,
      // Patrón 2: "pon emoji de X"
      /(?:pon|poner|usa|usar|agrega|agregar).*?emoji.*?(?:de|del)?\s+(.+?)(?:\.|$|ademas|además|tambien|también)/i,
      // Patrón 3: "emoji X" directo
      /emoji.*?(?:de|del)?\s+(.+?)(?:\.|$|ademas|además|tambien|también)/i
    ]
    
    for (const pattern of emojiPatterns) {
      const match = userMessage.match(pattern)
      if (match && match[1]) {
        let emojiDesc = match[1].trim().toLowerCase()
        // Limpiar palabras de relleno
        emojiDesc = emojiDesc.replace(/^(?:uno[s]?\s+)?(?:de\s+)?/i, '')
        let newEmoji = ''
        
        // Mapear descripción a emoji (ampliado)
        if (emojiDesc.includes('bomba') || emojiDesc.includes('bomb')) newEmoji = '💣'
        else if (emojiDesc.includes('cohete') || emojiDesc.includes('rocket')) newEmoji = '🚀'
        else if (emojiDesc.includes('estrella') || emojiDesc.includes('star')) newEmoji = '⭐'
        else if (emojiDesc.includes('rayo') || emojiDesc.includes('lightning') || emojiDesc.includes('trueno')) newEmoji = '⚡'
        else if (emojiDesc.includes('corazon') || emojiDesc.includes('corazón') || emojiDesc.includes('heart')) newEmoji = '❤️'
        else if (emojiDesc.includes('regalo') || emojiDesc.includes('gift') || emojiDesc.includes('present')) newEmoji = '🎁'
        else if (emojiDesc.includes('corona') || emojiDesc.includes('crown')) newEmoji = '👑'
        else if (emojiDesc.includes('diamante') || emojiDesc.includes('diamond')) newEmoji = '💎'
        else if (emojiDesc.includes('fuego') || emojiDesc.includes('fire') || emojiDesc.includes('llama')) newEmoji = '🔥'
        else if (emojiDesc.includes('explosion') || emojiDesc.includes('boom') || emojiDesc.includes('explosión')) newEmoji = '💥'
        else if (emojiDesc.includes('dinero') || emojiDesc.includes('money') || emojiDesc.includes('dolar')) newEmoji = '💰'
        else if (emojiDesc.includes('oferta') || emojiDesc.includes('descuento') || emojiDesc.includes('sale')) newEmoji = '🏷️'
        else if (emojiDesc.includes('check') || emojiDesc.includes('tick') || emojiDesc.includes('correcto')) newEmoji = '✅'
        else if (emojiDesc.includes('alerta') || emojiDesc.includes('warning') || emojiDesc.includes('advertencia')) newEmoji = '⚠️'
        else if (emojiDesc.includes('nuevo') || emojiDesc.includes('new') || emojiDesc.includes('novedad')) newEmoji = '🆕'
        else if (emojiDesc.includes('hot') || emojiDesc.includes('caliente') || emojiDesc.includes('trending')) newEmoji = '🔥'
        else if (emojiDesc.includes('party') || emojiDesc.includes('fiesta') || emojiDesc.includes('celebra')) newEmoji = '🎉'
        else if (emojiDesc.includes('flash') || emojiDesc.includes('rapido') || emojiDesc.includes('rápido')) newEmoji = '⚡'
        else if (emojiDesc.includes('megafono') || emojiDesc.includes('megáfono') || emojiDesc.includes('anuncio')) newEmoji = '📢'
        else if (emojiDesc.includes('target') || emojiDesc.includes('objetivo') || emojiDesc.includes('diana')) newEmoji = '🎯'
        
        if (newEmoji) {
          setListCustomizations(prev => ({ ...prev, titleEmoji: newEmoji }))
          changes.push(`emoji del título a ${newEmoji}`)
          updated = true
          break
        }
      }
    }
    
    // 3. DETECTAR CAMBIO DE MENSAJE FINAL
    const footerPatterns = [
      /(?:cambia|cambiar|pon|poner|modifica|modificar).*?(?:mensaje.*?final|footer|pie|final).*?(?:por|a|que diga|diga|sea):?\s*(.+?)$/i,
      /(?:mensaje.*?final|footer).*?(?:sea|diga|que diga):?\s*(.+?)$/i
    ]
    
    for (const pattern of footerPatterns) {
      const match = userMessage.match(pattern)
      if (match && match[1]) {
        const newFooter = match[1].trim().replace(/["']/g, '')
        if (newFooter.length > 0) {
          setListCustomizations(prev => ({ ...prev, customFooter: newFooter }))
          changes.push(`mensaje final`)
          updated = true
          break
        }
      }
    }
    
    // 4. DETECTAR INTENCIÓN DE QUITAR/AGREGAR EMOJIS
    if (lowerMessage.includes('sin emoji') || lowerMessage.includes('quita emoji') || lowerMessage.includes('saca emoji') || lowerMessage.includes('elimina emoji') || lowerMessage.includes('no emoji')) {
      setListCustomizations(prev => ({ ...prev, showEmojis: false }))
      changes.push('emojis eliminados')
      updated = true
    }
    else if (lowerMessage.includes('con emoji') || lowerMessage.includes('agrega emoji') || lowerMessage.includes('pon emoji') || lowerMessage.includes('añade emoji')) {
      setListCustomizations(prev => ({ ...prev, showEmojis: true }))
      changes.push('emojis agregados')
      updated = true
    }
    
    // 5. DETECTAR INTENCIÓN DE OCULTAR/MOSTRAR STOCK
    if (lowerMessage.includes('sin stock') || lowerMessage.includes('oculta stock') || lowerMessage.includes('quita stock') || lowerMessage.includes('no mostrar stock') || lowerMessage.includes('esconde stock')) {
      setListCustomizations(prev => ({ ...prev, showStock: false }))
      changes.push('stock ocultado')
      updated = true
    }
    else if (lowerMessage.includes('con stock') || lowerMessage.includes('muestra stock') || lowerMessage.includes('mostrar stock') || lowerMessage.includes('ver stock')) {
      setListCustomizations(prev => ({ ...prev, showStock: true }))
      changes.push('stock visible')
      updated = true
    }
    
    // 6. DETECTAR FORMATO DE PRECIOS
    if (lowerMessage.includes('precio') && (lowerMessage.includes('redondo') || lowerMessage.includes('sin decimal') || lowerMessage.includes('entero'))) {
      setListCustomizations(prev => ({ ...prev, priceFormat: 'noDecimals' }))
      changes.push('precios sin decimales')
      updated = true
    }
    
    // 7. DETECTAR QUITAR/AGREGAR ASTERISCOS Y NEGRITAS
    if (lowerMessage.includes('saca') || lowerMessage.includes('quita') || lowerMessage.includes('elimina') || lowerMessage.includes('sin')) {
      if (lowerMessage.includes('asterisco') || lowerMessage.includes('*') || lowerMessage.includes('negrita')) {
        setListCustomizations(prev => ({ ...prev, useBold: false }))
        changes.push('asteriscos eliminados')
        updated = true
      }
    }
    else if ((lowerMessage.includes('agrega') || lowerMessage.includes('pon') || lowerMessage.includes('con')) && 
             (lowerMessage.includes('asterisco') || lowerMessage.includes('negrita'))) {
      setListCustomizations(prev => ({ ...prev, useBold: true }))
      changes.push('asteriscos agregados')
      updated = true
    }
    
    // 8. RESTAURAR ORIGINAL
    if (lowerMessage.includes('restaura') || lowerMessage.includes('vuelve') || lowerMessage.includes('original') || lowerMessage.includes('reset') || lowerMessage.includes('por defecto')) {
      setListCustomizations({
        showEmojis: true,
        showStock: true,
        customTitle: '',
        customFooter: '',
        priceFormat: 'default',
        groupBy: 'brand',
        titleEmoji: '🔥',
        useBold: true
      })
      botResponse = '✅ ¡Hecho! He restaurado la lista a su formato original.'
      updated = true
    }
    
    // Generar respuesta
    if (changes.length > 0 && !botResponse) {
      botResponse = `✅ ¡Perfecto! He cambiado: ${changes.join(', ')}.`
    } else if (!updated && !botResponse) {
      botResponse = '✅ Entendido! Dime qué más quieres cambiar. Puedo modificar títulos, emojis, mensajes, ocultar stock, etc.'
    }
    
    // Agregar mensajes al chat
    setChatMessages(prev => [
      ...prev,
      { role: 'user', text: userMessage },
      { role: 'bot', text: botResponse }
    ])
    
    return updated
  }
  
  const handleChatSubmit = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    
    processChatMessage(chatInput)
    setChatInput('')
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
    { id: 'products', name: 'Productos', icon: Package }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-600">Control completo de productos, stock y categorías</p>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-lg border border-gray-200">

        <div className="p-6">
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

              {/* Filtros Panel - Rediseñado */}
              {showFilters && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6 space-y-5 shadow-md">
                  <div className="flex items-center justify-between pb-4 border-b-2 border-gray-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg shadow-sm">
                        <Filter className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Filtros Avanzados</h3>
                        <p className="text-xs text-gray-600">Refina tu búsqueda de productos</p>
                      </div>
                    </div>
                    {hasActiveFilters() && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-semibold shadow-sm"
                      >
                        <X className="w-4 h-4" />
                        <span>Limpiar</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Categoría</label>
                      <select
                        value={filters.categoria}
                        onChange={(e) => setFilters({...filters, categoria: e.target.value})}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-medium shadow-sm hover:border-gray-400 transition-colors"
                      >
                        <option value="">Todas las categorías</option>
                        {uniqueCategories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Marca</label>
                      <select
                        value={filters.marca}
                        onChange={(e) => setFilters({...filters, marca: e.target.value})}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-medium shadow-sm hover:border-gray-400 transition-colors"
                      >
                        <option value="">Todas las marcas</option>
                        {uniqueBrands.map((marca, idx) => (
                          <option key={idx} value={marca}>{marca}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Modelo</label>
                      <select
                        value={filters.modelo}
                        onChange={(e) => setFilters({...filters, modelo: e.target.value})}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm font-medium shadow-sm hover:border-gray-400 transition-colors"
                      >
                        <option value="">Todos los modelos</option>
                        {uniqueModels.map((modelo, idx) => (
                          <option key={idx} value={modelo}>{modelo}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-5 border-2 border-gray-300 shadow-sm">
                    <label className="block text-sm font-bold text-gray-900 mb-4">Rango de Margen (%)</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Margen Mínimo</label>
                        <input
                          type="number"
                          value={filters.margenMin}
                          onChange={(e) => setFilters({...filters, margenMin: e.target.value})}
                          placeholder="Ej: 20"
                          step="1"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm font-medium shadow-sm hover:border-gray-400 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Margen Máximo</label>
                        <input
                          type="number"
                          value={filters.margenMax}
                          onChange={(e) => setFilters({...filters, margenMax: e.target.value})}
                          placeholder="Ej: 100"
                          step="1"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm font-medium shadow-sm hover:border-gray-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters() && (
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg p-4 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <Package className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold">
                          Mostrando <span className="text-lg font-bold">{filteredProducts.length}</span> de <span className="font-bold">{products.length}</span> productos
                        </p>
                      </div>
                      <span className="text-xs bg-white text-gray-900 px-3 py-1.5 rounded-full font-bold shadow-sm">
                        {Object.values(filters).filter(v => v !== '').length} activos
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Cards - Arriba de la tabla */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Productos mostrados</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{hasActiveFilters() ? filteredProducts.length : stats.totalProducts}</p>
                    </div>
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Valor total en stock</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ${(() => {
                          const productsToCalc = hasActiveFilters() ? filteredProducts : products
                          const totalCost = productsToCalc.reduce((sum, p) => {
                            const cost = parseFloat(p.purchase_price) || 0
                            const stock = parseInt(p.current_stock) || 0
                            return sum + (cost * stock)
                          }, 0)
                          return totalCost.toLocaleString('es-AR', { minimumFractionDigits: 0 })
                        })()}
                      </p>
                    </div>
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Valor potencial de venta</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        ${(() => {
                          const productsToCalc = hasActiveFilters() ? filteredProducts : products
                          const totalSale = productsToCalc.reduce((sum, p) => {
                            const price = parseFloat(p.sale_price) || 0
                            const stock = parseInt(p.current_stock) || 0
                            return sum + (price * stock)
                          }, 0)
                          return totalSale.toLocaleString('es-AR', { minimumFractionDigits: 0 })
                        })()}
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Ganancia potencial</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        ${(() => {
                          const productsToCalc = hasActiveFilters() ? filteredProducts : products
                          const totalProfit = productsToCalc.reduce((sum, p) => {
                            const salePrice = parseFloat(p.sale_price) || 0
                            const costPrice = parseFloat(p.purchase_price) || 0
                            const stock = parseInt(p.current_stock) || 0
                            return sum + ((salePrice - costPrice) * stock)
                          }, 0)
                          return totalProfit.toLocaleString('es-AR', { minimumFractionDigits: 0 })
                        })()}
                      </p>
                    </div>
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Enhanced Product Table */}
              <EnhancedProductTable
                products={hasActiveFilters() ? filteredProducts : products}
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStockChange={handleStockChange}
                loading={loading}
                lowStockRules={lowStockRules}
                getLowStockThreshold={getLowStockThreshold}
              />

              {/* Listas de Difusión - Colapsable */}
              <div className="mt-8 bg-gradient-to-br from-green-50/70 to-emerald-50/70 border border-green-200/80 rounded-xl overflow-hidden shadow-md">
                <button
                  type="button"
                  onClick={() => setShowBroadcastSection(!showBroadcastSection)}
                  className="w-full flex items-center justify-between p-6 hover:bg-green-100/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-600 rounded-lg shadow-sm">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900">Listas de Difusión para WhatsApp</h3>
                      <p className="text-sm text-gray-600">Genera y copia listas de productos para enviar a tus clientes</p>
                    </div>
                  </div>
                  {showBroadcastSection ? (
                    <ChevronUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-green-600" />
                  )}
                </button>

                {showBroadcastSection && (
                  <div className="px-6 pb-6 space-y-5 border-t border-green-200 pt-6">
                    {/* Selector de Categoría */}
                    <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filtrar por Categoría (opcional)
                  </label>
                  <select
                    value={selectedCategoryForList}
                    onChange={(e) => setSelectedCategoryForList(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm font-medium text-gray-700 shadow-sm"
                  >
                    <option value="">Todas las categorías</option>
                    {uniqueCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Selecciona una categoría para generar una lista más específica
                  </p>
                </div>

                {/* Botones de Copiar */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Lista Minorista */}
                  <div className="bg-white rounded-lg p-5 border border-blue-200 shadow-sm hover:shadow-lg transition-shadow">
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
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
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
                  <div className="bg-white rounded-lg p-5 border border-purple-200 shadow-sm hover:shadow-lg transition-shadow">
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
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
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
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Vista Previa:</p>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                          {generateBroadcastList('minorista')}
                        </pre>
                      </div>
                    </div>

                    {/* Chatbot de Personalización */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-900">Asistente de Personalización</p>
                      </div>
                      
                      {/* Mensajes del chat */}
                      <div className="bg-white rounded-lg p-3 mb-3 max-h-64 overflow-y-auto space-y-3 border border-gray-200">
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                              msg.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Input del chat */}
                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Escribe lo que quieres cambiar..."
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Enviar
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
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

      {/* Low Stock Configuration Modal */}
      {showLowStockConfig && (
        <LowStockConfigModal
          rules={lowStockRules}
          products={products}
          onClose={() => setShowLowStockConfig(false)}
          onSave={saveLowStockRules}
        />
      )}
    </div>
  )
}

// Componente Modal de Configuración de Stock Bajo
const LowStockConfigModal = ({ rules, products, onClose, onSave }) => {
  const [localRules, setLocalRules] = useState(rules)
  const [showAddRule, setShowAddRule] = useState(false)
  const [isFormExpanded, setIsFormExpanded] = useState(false)
  const [newRule, setNewRule] = useState({
    category: '',
    brand: '',
    model: '',
    threshold: 5
  })

  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))]
  const uniqueModels = [...new Set(products.map(p => p.model).filter(Boolean))]

  const handleAddRule = () => {
    if (!newRule.category && !newRule.brand && !newRule.model) {
      alert('Debes seleccionar al menos una categoría, marca o modelo')
      return
    }

    // Verificar que no contradiga reglas existentes
    const isDuplicate = localRules.specific.some(rule =>
      rule.category === newRule.category &&
      rule.brand === newRule.brand &&
      rule.model === newRule.model
    )

    if (isDuplicate) {
      alert('Ya existe una regla con estos criterios')
      return
    }

    setLocalRules({
      ...localRules,
      specific: [...localRules.specific, { ...newRule }]
    })

    setNewRule({
      category: '',
      brand: '',
      model: '',
      threshold: 5
    })
  }

  const handleRemoveRule = (index) => {
    setLocalRules({
      ...localRules,
      specific: localRules.specific.filter((_, i) => i !== index)
    })
  }

  const handleSave = () => {
    onSave(localRules)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configuración de Stock Bajo</h2>
                <p className="text-sm text-gray-500 mt-0.5">Define umbrales personalizados para tu inventario</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
          {/* Regla General */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">Regla General</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Esta regla se aplica a todos los productos que no tengan una configuración específica
            </p>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="text-sm font-medium text-gray-700">
                Stock bajo cuando hay:
              </label>
              <input
                type="number"
                min="0"
                value={localRules.default}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || value === '-') {
                    setLocalRules({ ...localRules, default: '' })
                  } else {
                    const numValue = parseInt(value)
                    if (!isNaN(numValue) && numValue >= 0) {
                      setLocalRules({ ...localRules, default: numValue })
                    }
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === '-') {
                    setLocalRules({ ...localRules, default: 0 })
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-center text-sm"
              />
              <span className="text-sm text-gray-600">unidades o menos</span>
            </div>
          </div>

          {/* Reglas Específicas */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">Reglas Específicas</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Define umbrales personalizados para categorías, marcas o modelos específicos
            </p>

            {/* Lista de reglas existentes */}
            {localRules.specific.length > 0 && (
              <div className="space-y-2 mb-4">
                {localRules.specific.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        {rule.category && (
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium text-xs">
                            {rule.category}
                          </span>
                        )}
                        {rule.brand && (
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium text-xs">
                            {rule.brand}
                          </span>
                        )}
                        {rule.model && (
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium text-xs">
                            {rule.model}
                          </span>
                        )}
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md font-semibold text-xs border border-orange-200">
                          ≤ {rule.threshold} unidades
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRule(index)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón para agregar nueva regla */}
            {!showAddRule ? (
              <button
                onClick={() => {
                  setShowAddRule(true)
                  setIsFormExpanded(false)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-all font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nueva Regla</span>
              </button>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                {/* Header de la regla */}
                <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-700">{localRules.specific.length + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Regla {localRules.specific.length + 1}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFormExpanded(!isFormExpanded)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
                      title={isFormExpanded ? "Contraer" : "Expandir"}
                    >
                      {isFormExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRule(false)
                        setIsFormExpanded(false)
                        setNewRule({ category: '', brand: '', model: '', threshold: 5 })
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Formulario colapsable */}
                {isFormExpanded && (
                  <div className="p-4 space-y-4">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoría</label>
                        <select
                          value={newRule.category}
                          onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white"
                        >
                          <option value="">Todas</option>
                          {uniqueCategories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Marca</label>
                        <select
                          value={newRule.brand}
                          onChange={(e) => setNewRule({ ...newRule, brand: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white"
                        >
                          <option value="">Todas</option>
                          {uniqueBrands.map((brand, idx) => (
                            <option key={idx} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Modelo</label>
                        <select
                          value={newRule.model}
                          onChange={(e) => setNewRule({ ...newRule, model: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white"
                        >
                          <option value="">Todos</option>
                          {uniqueModels.map((model, idx) => (
                            <option key={idx} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="text-sm font-medium text-gray-700">
                        Stock bajo cuando hay:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newRule.threshold}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || value === '-') {
                            setNewRule({ ...newRule, threshold: '' })
                          } else {
                            const numValue = parseInt(value)
                            if (!isNaN(numValue) && numValue >= 0) {
                              setNewRule({ ...newRule, threshold: numValue })
                            }
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '' || e.target.value === '-') {
                            setNewRule({ ...newRule, threshold: 5 })
                          }
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-center text-sm"
                      />
                      <span className="text-sm text-gray-600">unidades o menos</span>
                      <button
                        onClick={() => {
                          handleAddRule()
                          setShowAddRule(false)
                          setIsFormExpanded(false)
                        }}
                        className="ml-auto px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium text-sm flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-5 bg-white flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all text-sm"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  )
}

export default Inventory
