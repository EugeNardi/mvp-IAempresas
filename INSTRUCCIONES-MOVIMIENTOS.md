# 📋 Instrucciones - Sistema de Movimientos Actualizado

## ✅ Cambios Implementados

### 1. **Estilos Minimalistas de Vercel**
Se aplicaron estilos modernos y sutiles inspirados en Vercel a todos los modales de movimientos:

- **Venta** (Verde) - Colores más sutiles y profesionales
- **Compra** (Azul) - Diseño limpio y minimalista
- **Gasto** (Rojo) - Interfaz clara y directa
- **Aporte** (Púrpura) - Estilo elegante
- **Retiro** (Naranja) - Diseño consistente

#### Características del nuevo diseño:
- ✨ Backdrop blur en el fondo
- 🎨 Colores más sutiles y menos invasivos
- 📦 Bordes finos (1px en lugar de 2px)
- 🔘 Botones más compactos y modernos
- 🎯 Mejor jerarquía visual
- 💫 Transiciones suaves

### 2. **Persistencia de Datos por Usuario**
Todos los movimientos ahora se guardan automáticamente en Supabase:

- ✅ Cada usuario tiene sus propios datos aislados
- ✅ Los movimientos persisten entre sesiones
- ✅ Sincronización automática con la base de datos
- ✅ Metadata completa de cada movimiento

### 3. **Funcionalidad de Eliminación**
Ahora puedes eliminar movimientos directamente desde la tabla:

- 🗑️ Botón de eliminar en cada fila
- ⚠️ Confirmación antes de eliminar
- ✅ Eliminación lógica (soft delete)
- 📊 Actualización automática de la vista

## 🚀 Configuración Requerida en Supabase

### Paso 1: Agregar Columna Metadata

**IMPORTANTE:** Debes ejecutar este script SQL en Supabase para que los movimientos funcionen correctamente.

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Abre el archivo `add-metadata-column.sql`
4. Copia y pega el contenido en el editor
5. Haz clic en **Run**

Este script agrega la columna `metadata` a la tabla `invoices` para almacenar información adicional de cada movimiento.

### Paso 2: Verificar la Configuración

Ejecuta esta consulta para verificar que todo está correcto:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoices' 
ORDER BY ordinal_position;
```

Deberías ver la columna `metadata` de tipo `jsonb`.

## 📝 Estructura de Metadata

Cada tipo de movimiento guarda información específica en el campo `metadata`:

### Venta
```json
{
  "movementType": "venta",
  "tipoVenta": "minorista|mayorista",
  "cliente": "Nombre del cliente",
  "paymentMethod": "efectivo|transferencia|...",
  "cobrado": true|false,
  "deuda": 0,
  "productos": [
    {
      "productoId": "uuid",
      "nombre": "Producto X",
      "cantidad": 5,
      "precioUnitario": 1000,
      "precioTotal": 5000,
      "descuento": 0
    }
  ]
}
```

### Compra
```json
{
  "movementType": "compra",
  "tipoCompra": "minorista|mayorista",
  "provider": "Nombre del proveedor",
  "paymentMethod": "efectivo|transferencia|...",
  "pagado": true|false,
  "deuda": 0,
  "productos": [
    {
      "categoria": "Mercadería",
      "nombre": "Producto X",
      "cantidad": 10,
      "costoUnitario": 800,
      "costoTotal": 8000,
      "precioMinorista": 1200,
      "precioMayorista": 1000
    }
  ]
}
```

### Gasto
```json
{
  "movementType": "gasto",
  "concepto": "Pago de alquiler",
  "descripcion": "Alquiler mensual",
  "beneficiario": "Inmobiliaria X",
  "paymentMethod": "transferencia",
  "pagado": true|false,
  "deuda": 0,
  "recurrente": true|false,
  "frecuencia": "mensual|quincenal|..."
}
```

### Aporte
```json
{
  "movementType": "aporte",
  "tipoAporte": "Capital Inicial|Inversión|...",
  "aportante": "Juan Pérez",
  "descripcion": "Aporte de capital",
  "paymentMethod": "transferencia",
  "porcentajeParticipacion": 25,
  "destinoFondos": "Expansión"
}
```

### Retiro
```json
{
  "movementType": "retiro",
  "tipoRetiro": "Dividendos|Retiro Socio|...",
  "beneficiario": "Socio Principal",
  "descripcion": "Retiro de utilidades",
  "paymentMethod": "transferencia",
  "autorizadoPor": "Gerencia General",
  "concepto": "Distribución Q1 2025"
}
```

## 🎨 Colores por Tipo de Movimiento

Cada tipo de movimiento tiene su color característico:

- 🟢 **Venta**: Verde (`green-600`)
- 🔵 **Compra**: Azul (`blue-600`)
- 🔴 **Gasto**: Rojo (`red-600`)
- 🟣 **Aporte**: Púrpura (`purple-600`)
- 🟠 **Retiro**: Naranja (`orange-600`)

Los colores se aplican de forma sutil en:
- Iconos del header
- Fondos de secciones destacadas
- Botones de acción
- Badges de tipo

## 🔧 Funcionalidades Implementadas

### ✅ Crear Movimientos
1. Haz clic en "Nuevo Movimiento"
2. Selecciona el tipo de operación
3. Completa el formulario
4. Los datos se guardan automáticamente en Supabase

### ✅ Ver Movimientos
- Tabla con todos los movimientos
- Filtros por tipo
- Búsqueda por descripción
- Ordenamiento por fecha

### ✅ Eliminar Movimientos
1. Haz clic en el ícono de papelera (🗑️) en la fila del movimiento
2. Confirma la eliminación
3. El movimiento se marca como inactivo (soft delete)

### ✅ Análisis con IA (Simulado)
- Sube un comprobante (PDF o imagen)
- La IA extrae información automáticamente
- Revisa y ajusta los datos antes de guardar

## 📊 Integración con Inventario

### Ventas
- Descuenta automáticamente del stock
- Valida disponibilidad antes de vender
- Actualiza el inventario en tiempo real

### Compras
- Agrega productos al inventario automáticamente
- Registra precios de costo y venta
- Configura stock mínimo

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Cada usuario solo ve sus propios datos
- ✅ Políticas de seguridad por operación (SELECT, INSERT, UPDATE, DELETE)
- ✅ Validación de permisos en el backend

## 🐛 Solución de Problemas

### Error: "La tabla invoices no existe"
**Solución:** Ejecuta el script `supabase-invoices-setup.sql` en Supabase SQL Editor

### Error: "Column metadata does not exist"
**Solución:** Ejecuta el script `add-metadata-column.sql` en Supabase SQL Editor

### Los movimientos no se guardan
**Verificar:**
1. Que estés autenticado
2. Que las políticas RLS estén configuradas
3. Que la columna metadata exista
4. Revisa la consola del navegador para ver errores

### Los movimientos no aparecen
**Verificar:**
1. Que el filtro no esté ocultándolos
2. Que `is_active = true`
3. Que el `user_id` coincida con tu usuario

## 📈 Próximas Mejoras Sugeridas

- [ ] Edición de movimientos existentes
- [ ] Exportación a PDF/Excel
- [ ] Gráficos y estadísticas avanzadas
- [ ] Integración real con IA (OpenAI/GPT-4)
- [ ] Notificaciones de movimientos
- [ ] Historial de cambios
- [ ] Adjuntar múltiples archivos
- [ ] Plantillas de movimientos recurrentes

## 💡 Notas Importantes

1. **Backup:** Los datos se guardan en Supabase, pero siempre es bueno hacer backups periódicos
2. **Performance:** Los índices están optimizados para búsquedas rápidas
3. **Escalabilidad:** El sistema está diseñado para manejar miles de movimientos
4. **Mantenimiento:** Revisa periódicamente los movimientos inactivos para limpiar la base de datos

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, por favor:
1. Revisa esta documentación
2. Verifica la consola del navegador
3. Revisa los logs de Supabase
4. Contacta al equipo de desarrollo

---

**Última actualización:** Octubre 2025
**Versión:** 2.0.0
