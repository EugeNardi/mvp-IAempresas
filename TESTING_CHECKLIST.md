# ✅ Checklist de Testing - Sistema de Gestión

## 🎯 Objetivo
Verificar que la aplicación funciona correctamente y que los datos están aislados por usuario.

---

## 1. 🔐 Autenticación

### Registro de Usuario
- [ ] Crear cuenta con email y contraseña
- [ ] Verificar que se envía email de confirmación
- [ ] Confirmar email (si está habilitado)
- [ ] Verificar que se crea el usuario en Supabase

### Login
- [ ] Iniciar sesión con credenciales correctas
- [ ] Verificar que se redirige al dashboard
- [ ] Verificar que se muestra el email del usuario en sidebar
- [ ] Intentar login con credenciales incorrectas (debe fallar)

### Logout
- [ ] Cerrar sesión
- [ ] Verificar que se redirige al login
- [ ] Verificar que no se puede acceder al dashboard sin autenticación

---

## 2. 🏢 Gestión de Empresa

### Crear Empresa
- [ ] Ir a "Mi Empresa"
- [ ] Llenar todos los campos del formulario
- [ ] Guardar empresa
- [ ] Verificar que se muestra mensaje de éxito
- [ ] Verificar que los datos se guardan en Supabase
- [ ] Recargar página y verificar que los datos persisten

### Editar Empresa
- [ ] Modificar datos de la empresa
- [ ] Guardar cambios
- [ ] Verificar que se actualizan correctamente
- [ ] Recargar y verificar persistencia

---

## 3. 💰 Movimientos Financieros

### Crear Venta
- [ ] Ir a "Movimientos"
- [ ] Clic en "Nuevo Movimiento"
- [ ] Seleccionar "Venta"
- [ ] Llenar formulario completo
- [ ] Guardar
- [ ] Verificar que aparece en la lista
- [ ] Verificar que se guarda en Supabase

### Crear Compra
- [ ] Crear movimiento tipo "Compra"
- [ ] Agregar productos
- [ ] Verificar cálculos automáticos
- [ ] Guardar y verificar

### Crear Gasto
- [ ] Crear movimiento tipo "Gasto"
- [ ] Seleccionar categoría
- [ ] Guardar y verificar

### Editar Movimiento
- [ ] Clic en "Editar" en un movimiento
- [ ] Modificar datos
- [ ] Guardar cambios
- [ ] Verificar actualización

### Eliminar Movimiento
- [ ] Clic en "Eliminar"
- [ ] Confirmar eliminación
- [ ] Verificar que desaparece de la lista
- [ ] Verificar soft delete en Supabase (is_active = false)

### Ver Detalle
- [ ] Clic en "Ver" en un movimiento
- [ ] Verificar que se muestra toda la información
- [ ] Cerrar modal

### Gestión de Deudas
- [ ] Crear venta con deuda
- [ ] Verificar que aparece badge "DEUDA"
- [ ] Marcar como cobrado
- [ ] Verificar que desaparece el badge

---

## 4. 📦 Inventario

### Crear Producto
- [ ] Ir a "Inventario"
- [ ] Clic en "Agregar Producto"
- [ ] Llenar formulario
- [ ] Guardar
- [ ] Verificar que aparece en la lista

### Editar Producto
- [ ] Editar producto existente
- [ ] Modificar stock, precio, etc.
- [ ] Guardar y verificar

### Eliminar Producto
- [ ] Eliminar producto
- [ ] Confirmar
- [ ] Verificar que desaparece

### Categorías
- [ ] Crear nueva categoría
- [ ] Asignar productos a categorías
- [ ] Verificar filtrado por categoría

### Importación Masiva
- [ ] Usar función de importación masiva
- [ ] Verificar que se crean múltiples productos

---

## 5. 📊 Dashboard y Análisis

### Panel de Control
- [ ] Ir a "Panel de Control"
- [ ] Verificar que se muestran KPIs:
  - [ ] Ingresos Totales
  - [ ] Gastos Totales
  - [ ] Utilidad Neta
  - [ ] Margen
- [ ] Verificar gráficos:
  - [ ] Top 5 Categorías
  - [ ] Evolución Mensual

### Vista Analytics
- [ ] Cambiar a vista "Análisis"
- [ ] Verificar tabla por categoría
- [ ] Verificar tabla mensual
- [ ] Exportar datos (JSON/CSV)

### Vista Reportes
- [ ] Cambiar a vista "Reportes"
- [ ] Seleccionar "Balance General"
- [ ] Verificar vista previa
- [ ] Descargar PDF
- [ ] Seleccionar "Reporte Mensual"
- [ ] Verificar y descargar

### Análisis Inteligente
- [ ] Ir a "Análisis"
- [ ] Probar cada tipo de análisis:
  - [ ] Análisis de Clientes
  - [ ] Análisis de Productos
  - [ ] Análisis de Ventas
  - [ ] Análisis Financiero
  - [ ] Análisis de Proveedores

---

## 6. 🤖 Proyecciones IA

- [ ] Ir a "Proyecciones IA"
- [ ] Verificar que se muestran proyecciones
- [ ] Cambiar período (3, 6, 12 meses)
- [ ] Verificar contexto económico argentino
- [ ] Verificar recomendaciones

---

## 7. 💳 Calculadora de Créditos

- [ ] Ir a "Créditos"
- [ ] Seleccionar línea de crédito
- [ ] Modificar monto y plazo
- [ ] Verificar cálculos:
  - [ ] Cuota mensual
  - [ ] Total a pagar
  - [ ] Total intereses
- [ ] Cambiar sistema (Francés/Alemán)
- [ ] Verificar análisis de viabilidad

---

## 8. 📄 Remitos

- [ ] Ir a "Remitos"
- [ ] Cargar PDF
- [ ] Verificar análisis (simulado)
- [ ] Aprobar remito
- [ ] Verificar que se crea movimiento

---

## 9. 🏛️ Impuestos

- [ ] Ir a "Impuestos"
- [ ] Configurar condición IVA
- [ ] Configurar alícuotas
- [ ] Verificar cálculos automáticos
- [ ] Descargar reporte

---

## 10. 🔒 Aislamiento de Datos (CRÍTICO)

### Crear Segundo Usuario
- [ ] Abrir navegador en modo incógnito
- [ ] Registrar nuevo usuario (user2@test.com)
- [ ] Crear empresa diferente
- [ ] Crear algunos movimientos

### Verificar Aislamiento
- [ ] Con Usuario 1:
  - [ ] Verificar que NO ve datos de Usuario 2
  - [ ] Verificar que solo ve sus propios movimientos
  - [ ] Verificar que solo ve sus propios productos
  
- [ ] Con Usuario 2:
  - [ ] Verificar que NO ve datos de Usuario 1
  - [ ] Verificar que solo ve sus propios movimientos
  - [ ] Verificar que solo ve sus propios productos

### Verificar en Supabase
- [ ] Ir a Supabase Dashboard
- [ ] Ver tabla `companies`
  - [ ] Verificar que cada empresa tiene diferente `user_id`
- [ ] Ver tabla `invoices`
  - [ ] Verificar que cada factura tiene el `user_id` correcto
- [ ] Ver tabla `products`
  - [ ] Verificar que cada producto tiene el `user_id` correcto

---

## 11. 🎨 UI/UX

### Diseño General
- [ ] Verificar que no hay emojis innecesarios
- [ ] Verificar que no hay animaciones molestas
- [ ] Verificar colores consistentes (blanco/negro/celeste)
- [ ] Verificar que todos los botones tienen hover effects
- [ ] Verificar que todos los inputs tienen focus states

### Responsive
- [ ] Probar en móvil (< 768px)
- [ ] Probar en tablet (768px - 1024px)
- [ ] Probar en desktop (> 1024px)
- [ ] Verificar que sidebar se oculta en móvil
- [ ] Verificar que tablas son scrollables en móvil

### Navegación
- [ ] Verificar que todos los links funcionan
- [ ] Verificar que el sidebar se cierra al seleccionar en móvil
- [ ] Verificar que se puede navegar con teclado (Tab)

---

## 12. ⚡ Performance

- [ ] Verificar que la carga inicial es rápida (< 3s)
- [ ] Verificar que no hay errores en consola
- [ ] Verificar que no hay warnings en consola
- [ ] Verificar que las imágenes cargan correctamente
- [ ] Verificar que los gráficos se renderizan correctamente

---

## 13. 🐛 Manejo de Errores

### Sin Conexión
- [ ] Desconectar internet
- [ ] Intentar guardar datos
- [ ] Verificar que se muestra mensaje de error apropiado

### Datos Inválidos
- [ ] Intentar guardar formulario vacío
- [ ] Verificar validaciones
- [ ] Intentar guardar con datos incorrectos
- [ ] Verificar mensajes de error claros

### Sesión Expirada
- [ ] Esperar que expire la sesión (o forzarla)
- [ ] Intentar hacer una acción
- [ ] Verificar que se redirige al login

---

## 14. 📱 Funcionalidades Específicas

### Chat IA (si está implementado)
- [ ] Abrir chat
- [ ] Enviar mensaje
- [ ] Verificar respuesta
- [ ] Crear nueva conversación
- [ ] Eliminar conversación

### Exportación de Datos
- [ ] Exportar a JSON
- [ ] Exportar a CSV
- [ ] Verificar que los archivos se descargan
- [ ] Verificar que los datos son correctos

---

## 15. 🔧 Supabase

### Verificar Tablas
- [ ] Verificar que todas las tablas existen
- [ ] Verificar que RLS está habilitado
- [ ] Verificar que las políticas están creadas
- [ ] Verificar que los índices están creados

### Verificar Datos
- [ ] Ver datos en tabla `companies`
- [ ] Ver datos en tabla `invoices`
- [ ] Ver datos en tabla `products`
- [ ] Verificar que `user_id` está en todos los registros
- [ ] Verificar que `is_active` funciona correctamente

---

## ✅ Resultado Final

### Bugs Encontrados:
```
1. [Descripción del bug]
   - Severidad: Alta/Media/Baja
   - Pasos para reproducir:
   - Solución propuesta:

2. [Otro bug]
   ...
```

### Mejoras Sugeridas:
```
1. [Mejora]
2. [Otra mejora]
```

### Estado General:
- [ ] ✅ Listo para producción
- [ ] ⚠️ Requiere correcciones menores
- [ ] ❌ Requiere correcciones mayores

---

## 📝 Notas Adicionales

```
[Agregar cualquier observación importante]
```

---

Fecha de testing: _______________
Testeado por: _______________
Versión: _______________
