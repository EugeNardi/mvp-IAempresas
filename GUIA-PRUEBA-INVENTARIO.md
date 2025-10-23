# 🧪 Guía de Prueba: Integración Inventario ↔ Movimientos

## ✅ Verificación Paso a Paso

### **Paso 1: Verificar que la tabla products existe**

1. Ve a **Supabase Dashboard**
2. Abre el **SQL Editor**
3. Ejecuta:
```sql
SELECT * FROM products LIMIT 5;
```

✅ **Resultado esperado:** Debe mostrar productos o tabla vacía (no error)

---

### **Paso 2: Agregar productos al inventario**

#### Opción A: Desde la interfaz

1. Ve a **Inventario** en el menú
2. Haz clic en **"Agregar Producto"**
3. Completa:
   - Nombre: "Coca Cola 2L"
   - Categoría: "Bebidas"
   - Stock actual: 50
   - Costo unitario: $500
   - Precio venta: $800
4. Guarda

#### Opción B: Desde SQL (más rápido para pruebas)

```sql
-- Reemplaza 'TU_USER_ID' con tu ID de usuario
INSERT INTO products (user_id, name, description, category_id, unit_cost, sale_price, current_stock, min_stock, is_active)
VALUES 
  ('TU_USER_ID', 'Coca Cola 2L', 'Gaseosa Coca Cola 2 litros', null, 500, 800, 50, 10, true),
  ('TU_USER_ID', 'Pepsi 2L', 'Gaseosa Pepsi 2 litros', null, 480, 750, 30, 10, true),
  ('TU_USER_ID', 'Agua Mineral 500ml', 'Agua mineral sin gas', null, 200, 350, 100, 20, true);
```

✅ **Resultado esperado:** 3 productos agregados

---

### **Paso 3: Verificar productos en inventario**

1. Ve a **Inventario**
2. Verifica que aparezcan los productos agregados
3. Anota el stock actual de cada uno

✅ **Resultado esperado:** 
```
- Coca Cola 2L: Stock 50
- Pepsi 2L: Stock 30
- Agua Mineral 500ml: Stock 100
```

---

### **Paso 4: Probar COMPRA (Agregar Stock)**

#### Test 1: Compra de producto existente

1. Ve a **Dashboard** → **Movimientos**
2. Haz clic en **"Nueva Compra"**
3. Completa:
   - Proveedor: "Distribuidora ABC"
   - Fecha: Hoy
   - Medio de pago: Efectivo
   - Producto: "Coca Cola 2L"
   - Cantidad: **20 unidades**
   - Costo unitario: $500
4. Guarda

✅ **Verificar:**
- Mensaje: "Compra registrada exitosamente. Inventario actualizado."
- Ve a **Inventario**
- Stock de Coca Cola debe ser: **70** (50 + 20)

#### Test 2: Compra de producto nuevo

1. Nueva Compra
2. Proveedor: "Distribuidora XYZ"
3. Producto: "Fanta 2L" (nuevo)
4. Cantidad: 25
5. Costo: $480
6. Precio minorista: $750
7. Guarda

✅ **Verificar:**
- Mensaje: "Compra registrada. Inventario actualizado."
- Ve a **Inventario**
- Debe aparecer **"Fanta 2L"** con stock **25**

---

### **Paso 5: Probar VENTA (Restar Stock)**

#### Test 1: Venta con stock suficiente

1. Ve a **Dashboard** → **Movimientos**
2. Haz clic en **"Nueva Venta"**
3. Completa:
   - Cliente: "Juan Pérez"
   - Tipo: Minorista
   - Fecha: Hoy
4. En **Producto del Inventario**, selecciona: **"Coca Cola 2L"**
   
✅ **Verificar selector:**
```
Producto del Inventario • Stock disponible: 70 unidades ✓
▼ Coca Cola 2L - Stock: 70 ✓
```

5. Completa:
   - Cantidad: **10 unidades**
   - Precio unitario: $800 (autocompletado)
   - Descuento: 0%
6. Guarda

✅ **Verificar:**
- Mensaje: "Venta registrada exitosamente. Inventario actualizado."
- Ve a **Inventario**
- Stock de Coca Cola debe ser: **60** (70 - 10)

#### Test 2: Venta con descuento

1. Nueva Venta
2. Cliente: "María López"
3. Selecciona: **"Pepsi 2L"** (Stock: 30)
4. Cantidad: **5 unidades**
5. Precio: $750
6. **Descuento: 10%**
7. Guarda

✅ **Verificar:**
- Total calculado: $3,375 (5 × $750 × 90%)
- Ve a **Inventario**
- Stock de Pepsi debe ser: **25** (30 - 5)
- ⚠️ **Importante:** Se descuentan 5 unidades, NO 4.5

#### Test 3: Venta con stock insuficiente (debe fallar)

1. Nueva Venta
2. Cliente: "Carlos Gómez"
3. Selecciona: **"Agua Mineral 500ml"** (Stock: 100)
4. Cantidad: **150 unidades** (más de lo disponible)
5. Intenta guardar

❌ **Resultado esperado:**
```
Error: Stock insuficiente para Agua Mineral 500ml
Disponible: 100 unidades
Solicitado: 150 unidades
```

✅ **Verificar:**
- La venta NO se registra
- El stock NO cambia (sigue en 100)

---

### **Paso 6: Verificar indicadores visuales**

#### En selector de productos:

**Stock alto (>10):**
```
✓ Coca Cola 2L - Stock: 60 ✓
```
- Color verde
- Checkmark ✓

**Stock bajo (1-10):**
```
⚠️ Pepsi 2L - Stock: 5 ⚠️
```
- Color amarillo
- Warning ⚠️

**Sin stock (0):**
```
❌ Producto X - Stock: 0 ❌
```
- Color rojo
- Cruz ❌

---

### **Paso 7: Verificar logs en consola**

Abre **DevTools** (F12) → **Console**

#### Al hacer una compra:
```
📦 Actualizando inventario con productos de la compra...
🔍 Buscando producto en inventario: Coca Cola 2L
✅ Producto encontrado en inventario
📦 Agregando 20 unidades al producto [ID]
✅ Stock actualizado: 50 → 70
```

#### Al hacer una venta:
```
📦 Actualizando inventario con productos vendidos...
📦 Restando 10 unidades al producto [ID]
✅ Stock actualizado: 70 → 60
```

---

### **Paso 8: Prueba completa de flujo**

#### Escenario: Negocio de bebidas

**Estado inicial:**
```
Inventario vacío
```

**1. Compra inicial:**
```
Compra de 100 Coca Cola 2L @ $500
→ Stock: 100
```

**2. Primera venta:**
```
Venta de 15 Coca Cola @ $800
→ Stock: 85
```

**3. Segunda compra:**
```
Compra de 50 Coca Cola más
→ Stock: 135
```

**4. Venta con descuento:**
```
Venta de 20 Coca Cola @ $800 con 15% descuento
→ Stock: 115
→ Total: $13,600
```

**5. Venta mayorista:**
```
Venta de 30 Coca Cola @ $700 (precio mayorista)
→ Stock: 85
```

✅ **Verificar:**
- Stock final: **85 unidades**
- Todas las ventas registradas
- Montos correctos con descuentos

---

## 🔍 Checklist de Verificación

### Funcionalidades de Compra:
- [ ] Productos existentes suman stock correctamente
- [ ] Productos nuevos se crean automáticamente
- [ ] Stock se actualiza en tiempo real
- [ ] Mensaje de confirmación aparece
- [ ] Logs en consola son correctos

### Funcionalidades de Venta:
- [ ] Selector muestra productos del inventario
- [ ] Stock disponible se muestra correctamente
- [ ] Indicadores visuales funcionan (✓ ⚠️ ❌)
- [ ] Autocompletado de precios funciona
- [ ] Validación de stock funciona
- [ ] Descuentos calculan correctamente
- [ ] Stock se descuenta correctamente
- [ ] Mensaje de confirmación aparece

### Validaciones:
- [ ] No permite vender sin stock
- [ ] Muestra error claro cuando falta stock
- [ ] No permite stock negativo
- [ ] Valida cantidades correctamente

### UI/UX:
- [ ] Selector de productos es claro
- [ ] Stock disponible es visible
- [ ] Colores indican estado correctamente
- [ ] Mensajes de error son claros
- [ ] Mensajes de éxito son claros

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: No aparecen productos en el selector

**Causa:** Inventario vacío o no cargado

**Solución:**
1. Verifica que hay productos en inventario
2. Recarga la página
3. Verifica en consola si hay errores de carga

### Problema 2: Stock no se actualiza

**Causa:** Error en la función `updateProductStock`

**Solución:**
1. Abre consola (F12)
2. Busca errores en rojo
3. Verifica que la tabla `products` tiene la columna `current_stock`

### Problema 3: Error "Stock insuficiente" cuando hay stock

**Causa:** Campo `current_stock` es null

**Solución:**
```sql
UPDATE products 
SET current_stock = 0 
WHERE current_stock IS NULL;
```

### Problema 4: Descuento no calcula bien

**Causa:** Fórmula incorrecta

**Verificar:**
```javascript
Subtotal = Cantidad × Precio
Descuento = Subtotal × (Porcentaje / 100)
Total = Subtotal - Descuento
```

---

## 📊 Datos de Prueba SQL

```sql
-- Insertar productos de prueba (reemplaza TU_USER_ID)
INSERT INTO products (user_id, name, description, unit_cost, sale_price, current_stock, min_stock, is_active)
VALUES 
  ('TU_USER_ID', 'Coca Cola 2L', 'Gaseosa Coca Cola 2 litros', 500, 800, 50, 10, true),
  ('TU_USER_ID', 'Pepsi 2L', 'Gaseosa Pepsi 2 litros', 480, 750, 30, 10, true),
  ('TU_USER_ID', 'Fanta 2L', 'Gaseosa Fanta 2 litros', 480, 750, 25, 10, true),
  ('TU_USER_ID', 'Sprite 2L', 'Gaseosa Sprite 2 litros', 480, 750, 40, 10, true),
  ('TU_USER_ID', 'Agua Mineral 500ml', 'Agua mineral sin gas', 200, 350, 100, 20, true),
  ('TU_USER_ID', 'Jugo Naranja 1L', 'Jugo de naranja natural', 300, 500, 20, 5, true),
  ('TU_USER_ID', 'Cerveza Quilmes 1L', 'Cerveza rubia', 350, 600, 60, 15, true),
  ('TU_USER_ID', 'Vino Tinto 750ml', 'Vino tinto reserva', 800, 1200, 15, 5, true);

-- Verificar que se insertaron
SELECT id, name, current_stock FROM products ORDER BY name;
```

---

## ✅ Resultado Esperado Final

Después de completar todas las pruebas:

1. ✅ **Compras agregan stock automáticamente**
2. ✅ **Ventas restan stock automáticamente**
3. ✅ **Validaciones previenen sobreventa**
4. ✅ **Indicadores visuales funcionan correctamente**
5. ✅ **Descuentos calculan sin afectar stock**
6. ✅ **Mensajes claros en cada operación**
7. ✅ **Logs detallados en consola**
8. ✅ **Productos nuevos se crean automáticamente en compras**

**¡Sistema de inventario integrado y funcionando!** 🎉
