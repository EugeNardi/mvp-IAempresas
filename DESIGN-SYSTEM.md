# Sistema de Diseño - Inspirado en Notion

## 🎨 Paleta de Colores

### Grises (Paleta Principal)
- **Fondo Principal**: `bg-gray-50` - Fondo de la aplicación
- **Fondo Cards**: `bg-white` - Tarjetas y contenedores
- **Bordes**: `border-gray-300` - Bordes consistentes
- **Bordes Hover**: `border-gray-400` - Estado hover
- **Texto Principal**: `text-gray-900` - Títulos y contenido principal
- **Texto Secundario**: `text-gray-600` - Descripciones
- **Texto Terciario**: `text-gray-500` - Labels y metadata
- **Botones Primarios**: `bg-gray-900` hover `bg-gray-800`
- **Navegación Activa**: `bg-gray-100`

### Colores de Acento (Uso Mínimo)
- **Success**: `bg-green-50` border `border-green-200` text `text-green-600`
- **Error**: `bg-red-50` border `border-red-200` text `text-red-600`
- **Warning**: `bg-yellow-50` border `border-yellow-200` text `text-yellow-600`

## 📐 Espaciado

### Padding
- **Cards Pequeños**: `p-5` o `p-6`
- **Cards Grandes**: `p-8`
- **Sidebar**: `p-4` (navegación), `p-6` (header)

### Gap
- **Grid**: `gap-4` (consistente)
- **Flex**: `space-x-2`, `space-x-3`, `space-x-4`

### Margin
- **Entre Secciones**: `mb-6` o `mb-8`
- **Entre Elementos**: `mb-2`, `mb-3`, `mb-4`

## 🔤 Tipografía

### Tamaños
- **H1 (Página)**: `text-2xl font-semibold`
- **H2 (Sección)**: `text-xl font-semibold`
- **Números Grandes**: `text-5xl font-bold` (Score)
- **Números Medianos**: `text-3xl font-bold` (KPIs)
- **Números Pequeños**: `text-2xl font-bold` (Métricas)
- **Texto Normal**: `text-sm` o `text-base`
- **Labels**: `text-xs font-medium uppercase tracking-wider`

### Pesos
- **Bold**: `font-bold` - Números y títulos importantes
- **Semibold**: `font-semibold` - Headers y navegación activa
- **Medium**: `font-medium` - Labels y botones
- **Normal**: `font-normal` - Texto regular

## 🎯 Componentes

### Cards
```jsx
className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors"
```

### Botones Primarios
```jsx
className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
```

### Botones Secundarios
```jsx
className="bg-white border-2 border-gray-300 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
```

### Inputs
```jsx
className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
```

### Navegación (Sidebar)
```jsx
// Activo
className="bg-gray-100 text-gray-900 font-semibold px-4 py-2.5 rounded-lg"

// Inactivo
className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-4 py-2.5 rounded-lg"
```

## 🔄 Transiciones

### Estándar
- `transition-colors` - Para cambios de color
- `transition-all` - Para múltiples propiedades
- `duration-300` - Duración consistente

### Hover States
- Cards: `hover:border-gray-400`
- Botones: `hover:bg-gray-800`
- Navegación: `hover:bg-gray-50`

## 📏 Bordes

### Border Radius
- **Cards**: `rounded-lg` (8px)
- **Botones**: `rounded-lg` (8px)
- **Inputs**: `rounded-lg` (8px)
- **Badges**: `rounded-full`

### Border Width
- **Estándar**: `border` (1px)
- **Énfasis**: `border-2` (2px)

## 🎭 Sombras

### Uso Mínimo
- **Cards**: `shadow-sm` (sutil)
- **Modals**: `shadow-lg` (más prominente)
- **Evitar**: `shadow-xl`, `shadow-2xl` (demasiado pesado)

## ✅ Reglas de Consistencia

1. **Siempre usar** `border-gray-300` para bordes
2. **Siempre usar** `rounded-lg` para esquinas
3. **Siempre usar** `font-bold` para números
4. **Siempre usar** `font-semibold` para headers
5. **Siempre usar** `text-xs uppercase tracking-wider` para labels
6. **Siempre usar** `bg-gray-50` para fondo de página
7. **Siempre usar** `bg-white` para cards
8. **Siempre usar** `bg-gray-900` para botones primarios
9. **Siempre usar** `transition-colors` o `transition-all`
10. **Siempre usar** `hover:border-gray-400` en cards

## 🚫 Evitar

- ❌ Gradientes (`bg-gradient-to-*`)
- ❌ Colores de acento en elementos principales
- ❌ `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- ❌ `shadow-xl`, `shadow-2xl`
- ❌ Múltiples colores en una misma sección
- ❌ Tipografía muy fina (`font-light`, `font-extralight`)
- ❌ Bordes muy claros (`border-gray-100`, `border-gray-200`)

## 📱 Responsive

### Breakpoints
- **Mobile**: Base styles
- **Tablet**: `md:` prefix
- **Desktop**: `lg:` prefix

### Grid
```jsx
className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
```

## 🎨 Inspiración: Notion

El diseño está inspirado en Notion por:
- ✅ Paleta monocromática (grises)
- ✅ Bordes consistentes y visibles
- ✅ Espaciado generoso
- ✅ Tipografía clara y legible
- ✅ Hover states sutiles
- ✅ Transiciones suaves
- ✅ Minimalismo funcional
- ✅ Jerarquía visual clara
