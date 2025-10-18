# Sistema de Diseño - Inspirado en Apple

## 🍎 Filosofía de Diseño

Diseño sofisticado, minimalista y con atención al detalle, inspirado en los productos de Apple.

---

## 🎨 Paleta de Colores

### Fondos
- **Principal**: `bg-gradient-to-br from-gray-50 to-gray-100` - Fondo con gradiente sutil
- **Cards**: `bg-gradient-to-br from-white to-gray-50` - Cards con profundidad
- **Sidebar**: `bg-white/80 backdrop-blur-xl` - Efecto glassmorphism
- **Header**: `bg-white/80 backdrop-blur-xl` - Transparencia con blur

### Bordes
- **Estándar**: `border-gray-200` - Bordes sutiles pero visibles
- **Hover**: `border-gray-300` - Más definido al hover
- **Separadores**: `border-gray-200/50` - Semi-transparentes

### Texto
- **Principal**: `text-gray-900` - Negro profundo
- **Secundario**: `text-gray-500` - Gris medio
- **Terciario**: `text-gray-400` - Gris claro para labels

### Elementos Interactivos
- **Botón Principal**: `bg-gray-900 hover:bg-gray-800` - Negro sólido
- **Navegación Activa**: `bg-gray-900 text-white shadow-lg` - Destacado con sombra
- **Navegación Inactiva**: `text-gray-600 hover:bg-gray-100` - Sutil

---

## 📐 Espaciado y Dimensiones

### Padding
- **Cards Pequeños**: `p-7` (28px)
- **Cards Medianos**: `p-8` (32px)
- **Cards Grandes**: `p-10` (40px)
- **Sidebar**: `p-6` (24px) para navegación, `p-8` (32px) para header

### Gap
- **Grid Pequeño**: `gap-4` (16px)
- **Grid Mediano**: `gap-6` (24px)
- **Grid Grande**: `gap-8` (32px)

### Margin
- **Entre Secciones**: `mb-8` o `mb-10`
- **Entre Elementos**: `mb-4` o `mb-6`

### Dimensiones
- **Sidebar**: `w-72` (288px) - Más ancho que estándar
- **Header**: `h-20` (80px) - Más alto para respirar
- **Iconos**: `w-5 h-5` (20px) estándar

---

## 🔤 Tipografía

### Tamaños
- **H1 (Página)**: `text-3xl font-bold tracking-tight`
- **H2 (Sección)**: `text-2xl font-bold tracking-tight`
- **H3 (Subsección)**: `text-xl font-semibold`
- **Números Grandes**: `text-6xl font-bold tracking-tight` (Score)
- **Números Medianos**: `text-4xl font-bold tracking-tight` (KPIs)
- **Números Pequeños**: `text-3xl font-bold tracking-tight` (Métricas)
- **Labels**: `text-xs font-semibold uppercase tracking-widest`
- **Texto Normal**: `text-base` o `text-sm`

### Pesos
- **Bold**: `font-bold` - Números y títulos principales
- **Semibold**: `font-semibold` - Subtítulos y labels
- **Medium**: `font-medium` - Texto de navegación
- **Normal**: `font-normal` - Texto regular

### Tracking
- **Tight**: `tracking-tight` - Para números grandes y títulos
- **Widest**: `tracking-widest` - Para labels en mayúsculas

---

## 🎯 Componentes

### Cards Estándar
```jsx
className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all"
```

### Cards con Glassmorphism
```jsx
className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-7 hover:shadow-xl transition-all group"
```

### Botones Principales
```jsx
className="bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
```

### Navegación Activa
```jsx
className="bg-gray-900 text-white font-semibold shadow-lg px-4 py-3 rounded-xl"
```

### Navegación Inactiva
```jsx
className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-4 py-3 rounded-xl transition-all"
```

### Score Card (Hero)
```jsx
className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-10 mb-8 shadow-xl hover:shadow-2xl transition-all"
```

### Inputs
```jsx
className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
```

---

## 🌟 Efectos Especiales

### Glassmorphism
- **Fondo**: `bg-white/80` o `bg-white/90`
- **Blur**: `backdrop-blur-xl` o `backdrop-blur-sm`
- **Uso**: Sidebar, Header, Cards especiales

### Gradientes
- **Fondo App**: `bg-gradient-to-br from-gray-50 to-gray-100`
- **Cards**: `bg-gradient-to-br from-white to-gray-50`
- **SVG**: Gradiente lineal de `#111827` a `#4b5563`

### Sombras
- **Estándar**: `shadow-lg` - Para elementos elevados
- **Hover**: `shadow-xl` o `shadow-2xl` - Al pasar el mouse
- **Sidebar**: `shadow-2xl` - Sombra profunda

### Transiciones
- **Estándar**: `transition-all` - Para múltiples propiedades
- **Duración**: `duration-300` - 300ms consistente
- **Hover Scale**: `group-hover:scale-105` - Efecto de zoom sutil

---

## 🎨 Border Radius

### Tamaños
- **Pequeño**: `rounded-xl` (12px) - Botones, navegación
- **Mediano**: `rounded-2xl` (16px) - Cards estándar
- **Grande**: `rounded-3xl` (24px) - Score card, elementos hero
- **Completo**: `rounded-full` - Botones principales, badges

---

## 🔄 Animaciones y Micro-interacciones

### Hover States
- **Cards**: `hover:shadow-xl transition-all`
- **Números**: `group-hover:scale-105 transition-transform`
- **Botones**: `hover:bg-gray-800 transition-all duration-300`
- **Navegación**: `hover:bg-gray-100 transition-all`

### Active States
- **Navegación**: Fondo negro con sombra
- **Iconos**: Cambio de color coordinado

### Focus States
- **Inputs**: `focus:border-gray-500 focus:ring-2 focus:ring-gray-200`
- **Botones**: `focus:outline-none focus:ring-2 focus:ring-gray-300`

---

## 📊 Visualizaciones

### Círculo de Progreso
- **Fondo**: `stroke="#f3f4f6"` (gris claro)
- **Progreso**: `stroke="url(#gradient)"` (gradiente gris)
- **Grosor**: `strokeWidth="6"`
- **Tamaño**: `w-32 h-32` (128px)

### Barras de Progreso
- **Fondo**: `bg-gray-200`
- **Progreso**: Escala de grises (`bg-gray-900` a `bg-gray-400`)
- **Altura**: `h-2` o `h-3`
- **Esquinas**: `rounded-full`

---

## ✅ Reglas de Consistencia

1. **Siempre usar** `rounded-2xl` o superior para cards
2. **Siempre usar** `rounded-full` para botones principales
3. **Siempre usar** `backdrop-blur-xl` en sidebar y header
4. **Siempre usar** `shadow-xl` o `shadow-2xl` para elevación
5. **Siempre usar** `tracking-tight` en números grandes
6. **Siempre usar** `tracking-widest` en labels uppercase
7. **Siempre usar** `transition-all` para animaciones suaves
8. **Siempre usar** `group` y `group-hover` para efectos coordinados
9. **Siempre usar** gradientes sutiles en fondos
10. **Siempre usar** `font-bold` para números importantes

---

## 🚫 Evitar

- ❌ Bordes muy gruesos (`border-2` o más)
- ❌ Colores de acento fuertes (azul, verde, rojo)
- ❌ Sombras muy sutiles (`shadow-sm`)
- ❌ Border radius pequeños (`rounded-lg` o menos en cards)
- ❌ Tipografía muy fina en números
- ❌ Transiciones bruscas sin `transition-all`
- ❌ Cards sin hover effects
- ❌ Fondos planos sin gradientes

---

## 🎯 Inspiración Apple

### Características Clave:
1. ✅ **Minimalismo** - Menos es más
2. ✅ **Espaciado Generoso** - Respiro visual
3. ✅ **Glassmorphism** - Transparencias con blur
4. ✅ **Sombras Profundas** - Sensación de profundidad
5. ✅ **Tipografía Bold** - Números impactantes
6. ✅ **Micro-interacciones** - Hover effects sutiles
7. ✅ **Gradientes Sutiles** - Profundidad sin colores
8. ✅ **Border Radius Grandes** - Suavidad en esquinas
9. ✅ **Tracking Ajustado** - Legibilidad optimizada
10. ✅ **Transiciones Suaves** - Fluidez en interacciones

---

## 📱 Responsive

### Breakpoints
- **Mobile**: Base styles
- **Tablet**: `md:` prefix
- **Desktop**: `lg:` prefix

### Ajustes Móviles
- Sidebar colapsa a `w-0`
- Grid cambia de 4 columnas a 1-2
- Padding reducido en mobile
- Texto más pequeño en mobile

---

## 🎨 Resultado Final

El diseño ahora es:
- ✅ **Sofisticado** - Nivel Apple
- ✅ **Profesional** - Empresa de tecnología
- ✅ **Moderno** - Últimas tendencias (glassmorphism)
- ✅ **Único** - No parece template genérico
- ✅ **Fluido** - Micro-interacciones suaves
- ✅ **Elegante** - Atención al detalle
