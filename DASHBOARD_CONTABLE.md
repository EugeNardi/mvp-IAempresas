# 📊 Dashboard Contable - Documentación

## 🎯 Descripción General

Dashboard completo de contabilidad con procesamiento de facturas mediante IA para PyMEs. Permite gestionar datos de empresa, cargar facturas (manual o automático) y generar reportes financieros automáticos.

## ✨ Características Principales

### 1. **Datos de Empresa**
- Configuración completa del perfil empresarial
- Campos: Razón Social, CUIT, Dirección, Ciudad, Provincia, País
- Selección de rubro/industria
- Configuración de ejercicio fiscal y moneda
- Validación de formularios

### 2. **Carga de Facturas**
- **Carga Automática con IA:**
  - Drag & drop de archivos (PDF, JPG, PNG)
  - Procesamiento automático con IA simulada
  - Extracción de datos: número, fecha, monto, categoría
  
- **Ingreso Manual:**
  - Formulario completo para ingreso manual
  - Campos: Tipo (Ingreso/Gasto), Número, Fecha, Monto, Categoría, Descripción
  - Categorías predefinidas: Ventas, Servicios, Compras, Gastos Operativos, Sueldos, Impuestos

- **Resumen en Tiempo Real:**
  - Total de Ingresos
  - Total de Gastos
  - Balance (Ingresos - Gastos)
  - Lista detallada de facturas con opciones de eliminación

### 3. **Reportes Financieros**

#### **Balance General**
- **Activos:**
  - Efectivo y equivalentes
  - Cuentas por cobrar (15% de ingresos)
  - Inventario (10% de gastos)

- **Pasivos:**
  - Cuentas por pagar (20% de gastos)
  - Deuda a corto plazo (10% de gastos)

- **Patrimonio:**
  - Capital (30% de ingresos)
  - Resultados acumulados (utilidad neta)

#### **Estado de Resultados**
- Ingresos por Ventas
- (-) Costo de Ventas
- **= Utilidad Bruta** (con margen %)
- (-) Gastos Operativos
- **= Utilidad Operativa** (con margen %)
- (-) Otros Gastos
- **= Utilidad Neta** (con margen %)

#### **Análisis Financiero**
- Gráficos de barras por categoría (Ingresos y Gastos)
- Ratios financieros:
  - Ratio de Gastos (Gastos/Ingresos)
  - Margen de Utilidad (Utilidad/Ingresos)
  - Total de transacciones

- **Recomendaciones IA:**
  - Análisis automático de márgenes
  - Alertas sobre ratios de gastos altos
  - Sugerencias de optimización
  - Recomendaciones de crecimiento

## 🔧 Estructura de Archivos

```
src/
├── pages/
│   └── Dashboard.jsx              # Página principal del dashboard
├── components/
│   └── dashboard/
│       ├── CompanyProfile.jsx     # Formulario de datos de empresa
│       ├── UploadInvoices.jsx     # Carga y gestión de facturas
│       └── FinancialReports.jsx   # Reportes y análisis financiero
```

## 📊 Cálculos Contables Implementados

### Fórmulas del Balance General:
```
Total Activos = Efectivo + Cuentas por Cobrar + Inventario
Total Pasivos = Cuentas por Pagar + Deuda Corto Plazo
Total Patrimonio = Capital + Resultados Acumulados
Total Pasivos + Patrimonio = Total Activos (ecuación contable)
```

### Fórmulas del Estado de Resultados:
```
Utilidad Bruta = Ingresos - Costo de Ventas
Margen Bruto = (Utilidad Bruta / Ingresos) × 100

Utilidad Operativa = Utilidad Bruta - Gastos Operativos
Margen Operativo = (Utilidad Operativa / Ingresos) × 100

Utilidad Neta = Ingresos - Gastos Totales
Margen Neto = (Utilidad Neta / Ingresos) × 100
```

### Ratios Financieros:
```
Ratio de Gastos = (Gastos Totales / Ingresos) × 100
Margen de Utilidad = (Utilidad Neta / Ingresos) × 100
```

## 🎨 Diseño y UX

- **Tema:** Blanco y negro minimalista
- **Navegación:** Sidebar colapsable con tabs
- **Responsive:** Adaptado para desktop y mobile
- **Feedback Visual:** 
  - Colores semánticos (verde=ingresos, rojo=gastos)
  - Animaciones suaves
  - Estados de carga
  - Mensajes de éxito/error

## 🚀 Flujo de Uso

1. **Inicio de Sesión** → Redirige a `/dashboard`
2. **Configurar Empresa** → Completar datos en "Datos de Empresa"
3. **Cargar Facturas** → Subir archivos o ingresar manualmente
4. **Ver Reportes** → Analizar Balance, Estado de Resultados y Análisis

## 🔄 Navegación

- **Dashboard ↔ Chat:** Botones de navegación en sidebar
- **Cerrar Sesión:** Disponible en ambas vistas
- **Tabs Internas:** Profile → Upload → Reports

## 💡 Características Técnicas

- **Estado Local:** React useState para gestión de datos
- **Validaciones:** Formularios con validación requerida
- **Formato de Moneda:** Locale español argentino (es-AR)
- **Procesamiento IA:** Simulado con setTimeout (2 segundos)
- **Persistencia:** Datos en memoria (se pierden al recargar)

## 🔮 Mejoras Futuras Sugeridas

1. **Persistencia de Datos:**
   - Integrar con Supabase para guardar empresa y facturas
   - Crear tablas: `companies`, `invoices`

2. **IA Real:**
   - Integrar OCR para lectura de facturas (Tesseract.js o API)
   - Procesamiento con OpenAI para categorización automática

3. **Exportación:**
   - Generar PDFs de reportes
   - Exportar a Excel/CSV

4. **Gráficos:**
   - Integrar Chart.js o Recharts
   - Gráficos de línea temporal
   - Gráficos de torta por categoría

5. **Multi-periodo:**
   - Comparación mensual/anual
   - Filtros por fecha
   - Tendencias históricas

## 📝 Notas Importantes

- Los porcentajes en el Balance General son **estimaciones** para demostración
- En producción, estos valores deberían calcularse con datos reales
- El procesamiento de IA está **simulado** - implementar OCR real para producción
- Los datos no persisten - agregar base de datos para uso real

## 🎓 Conceptos Contables Aplicados

- **Ecuación Contable:** Activos = Pasivos + Patrimonio
- **Principio de Partida Doble:** Cada transacción afecta al menos dos cuentas
- **Estado de Resultados:** Muestra rentabilidad en un período
- **Balance General:** Muestra situación financiera en un momento
- **Ratios Financieros:** Indicadores de salud financiera

---

**Desarrollado para PyMEs argentinas** 🇦🇷
