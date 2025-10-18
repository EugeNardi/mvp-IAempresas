# 🚀 INSTRUCCIONES PARA CONFIGURAR SUPABASE

## ✅ PASO 1: Ejecutar el Script SQL

1. **Abre Supabase Dashboard**
   - Ve a: https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, click en "SQL Editor"
   - Click en "New query"

3. **Copia el Script**
   - Abre el archivo `supabase-setup.sql`
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)

4. **Pega y Ejecuta**
   - Pega el script en el SQL Editor
   - Click en "Run" (o presiona Ctrl+Enter)
   - Espera a que termine (puede tardar 10-30 segundos)

5. **Verifica que no haya errores**
   - Si todo está bien, verás: "Success. No rows returned"
   - Si hay errores, cópialos y envíamelos

---

## ✅ PASO 2: Verificar que la Tabla Existe

1. **Ve a Table Editor**
   - En el menú lateral, click en "Table Editor"
   - Deberías ver la tabla "products"

2. **Verifica las Columnas**
   - Click en la tabla "products"
   - Deberías ver estas columnas:
     - id (UUID)
     - company_id (UUID) - **Permite NULL** ✅
     - name (TEXT)
     - sku (TEXT)
     - description (TEXT)
     - category_id (UUID)
     - unit_cost (DECIMAL)
     - sale_price (DECIMAL)
     - current_stock (INTEGER)
     - min_stock (INTEGER)
     - unit_measure (TEXT)
     - energy_cost (DECIMAL)
     - is_active (BOOLEAN)
     - created_at (TIMESTAMP)
     - updated_at (TIMESTAMP)

---

## ✅ PASO 3: Verificar Row Level Security (RLS)

1. **Ve a Authentication > Policies**
   - Deberías ver políticas para la tabla "products"
   - Políticas creadas:
     - "Users can view their company products"
     - "Users can insert products"
     - "Users can update their company products"
     - "Users can delete their company products"

2. **Si no ves las políticas**
   - Vuelve al SQL Editor
   - Ejecuta solo la sección "4. ROW LEVEL SECURITY (RLS)" del script

---

## ✅ PASO 4: Probar la Importación

1. **Recarga tu aplicación**
   - Presiona F5 en tu navegador
   - O cierra y abre la app

2. **Sube tu Excel**
   - Click en "Importar productos"
   - Selecciona tu archivo Excel
   - Espera el mapeo automático

3. **Verifica la Vista Previa**
   - Deberías ver:
     ```
     Producto 1: ELFBAR BC10K/14K Touch Blue Razz Ice
     Producto 2: ELFBAR BC10K/14K Touch Watermelon BBG
     ...
     ```

4. **Click en "Importar 31 Productos"**
   - Deberías ver: "✅ Productos insertados exitosamente: 31"
   - Si ves este mensaje, ¡FUNCIONA! 🎉

---

## ✅ PASO 5: Verificar en la Base de Datos

1. **Ve a Table Editor > products**
   - Deberías ver tus 31 productos importados
   - Verifica que tengan:
     - ✅ Nombres completos (Marca + Modelo + Sabor)
     - ✅ Precios correctos
     - ✅ Stock correcto
     - ✅ company_id = NULL (para marcas externas)

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema 1: "Table already exists"
```sql
-- Si la tabla ya existe pero está mal configurada, elimínala primero:
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.stock_history CASCADE;

-- Luego ejecuta el script completo de nuevo
```

### Problema 2: "Permission denied"
```sql
-- Asegúrate de tener permisos:
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

### Problema 3: "Foreign key constraint"
```sql
-- Si hay problemas con foreign keys, verifica que existan las tablas:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'categories', 'user_companies');

-- Si falta alguna, créala primero
```

### Problema 4: RLS bloquea las consultas
```sql
-- Temporalmente deshabilita RLS para testing:
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Prueba la importación
-- Luego vuelve a habilitar:
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
```

---

## 📊 LO QUE HACE EL SCRIPT

### 1. Crea la Tabla `products`
- Con todas las columnas necesarias
- `company_id` permite NULL para marcas externas
- Valores por defecto para todos los campos

### 2. Crea Índices
- Para búsquedas rápidas por:
  - company_id
  - category_id
  - name
  - sku
  - is_active

### 3. Configura Triggers
- Actualiza `updated_at` automáticamente
- Registra cambios de stock en historial

### 4. Configura RLS (Row Level Security)
- Los usuarios solo ven productos de su empresa
- Los usuarios pueden ver productos sin empresa (marcas externas)
- Los usuarios pueden insertar productos con o sin empresa

### 5. Crea Tabla de Historial
- Registra todos los cambios de stock
- Útil para auditoría

### 6. Crea Vista `products_with_details`
- Combina productos con categorías y empresas
- Calcula margen de ganancia
- Indica estado de stock

### 7. Crea Función de Importación Masiva
- Permite importar múltiples productos a la vez
- Maneja errores individualmente
- Retorna estadísticas de importación

### 8. Inserta Categorías de Ejemplo
- ELFBAR
- IGNITE
- LOST MARY

---

## ✅ VERIFICACIÓN FINAL

Ejecuta este query para verificar que todo está bien:

```sql
-- Verificar tabla
SELECT COUNT(*) as total_columns 
FROM information_schema.columns 
WHERE table_name = 'products';
-- Debe retornar: 16 columnas

-- Verificar políticas RLS
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE tablename = 'products';
-- Debe retornar: 4 políticas

-- Verificar que company_id permite NULL
SELECT is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'company_id';
-- Debe retornar: YES

-- Verificar categorías de ejemplo
SELECT name FROM public.categories 
WHERE company_id IS NULL;
-- Debe retornar: ELFBAR, IGNITE, LOST MARY
```

---

## 🎉 ¡LISTO!

Una vez ejecutado el script:

1. ✅ Tabla `products` creada
2. ✅ Índices configurados
3. ✅ RLS configurado
4. ✅ Triggers activos
5. ✅ Historial de stock funcionando
6. ✅ Categorías de ejemplo creadas

**Ahora puedes importar tu Excel sin problemas!** 🚀

---

## 📞 SOPORTE

Si tienes algún error:

1. Copia el mensaje de error completo
2. Copia el query que estabas ejecutando
3. Envíamelo para ayudarte

**¡Tu sistema de importación está listo para funcionar!** 💪
