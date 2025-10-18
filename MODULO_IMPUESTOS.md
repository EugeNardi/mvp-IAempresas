# 💰 Módulo de Gestión de Impuestos

## 📋 Descripción

Nuevo apartado en el Dashboard que permite gestionar, calcular y proyectar impuestos automáticamente usando GPT-4 Turbo.

---

## 🎯 Funcionalidades Principales

### 1. **Cálculo Automático de Impuestos**

#### **IVA (Impuesto al Valor Agregado)**

**IVA Débito Fiscal (Ventas):**
```javascript
IVA en Ventas = Total Ventas × 0.21 / 1.21
```

**IVA Crédito Fiscal (Compras):**
```javascript
IVA en Compras = Total Compras × 0.21 / 1.21
```

**Saldo IVA:**
```javascript
Saldo = IVA Débito - IVA Crédito

Si Saldo > 0 → A Pagar (rojo)
Si Saldo < 0 → A Favor (verde)
```

#### **Impuesto a las Ganancias**

```javascript
Utilidad = Total Ventas - Total Compras
Ganancias = Utilidad × 0.35 (tasa 35%)
```

---

### 2. **Dashboard de Impuestos**

#### **4 Cards Informativos:**

**Card 1: IVA Débito**
- Monto total de IVA en ventas
- Icono: TrendingUp (azul)
- Descripción: "IVA en Ventas"

**Card 2: IVA Crédito**
- Monto total de IVA en compras
- Icono: DollarSign (verde)
- Descripción: "IVA en Compras"

**Card 3: Saldo IVA**
- Diferencia entre débito y crédito
- Color dinámico:
  - Rojo si es a pagar
  - Verde si es a favor
- Descripción: "A Pagar" o "A Favor"

**Card 4: Ganancias Estimado**
- Impuesto a las ganancias proyectado
- Icono: FileText (naranja)
- Tasa: 35%

---

### 3. **Análisis con GPT-4 Turbo**

#### **Generador de Análisis Impositivo**

**Parámetros:**
- Período de proyección: 3, 6 o 12 meses
- Datos actuales de IVA y Ganancias
- Todas las facturas cargadas

**Análisis Generado:**

```
📊 ANÁLISIS IMPOSITIVO COMPLETO

1. SITUACIÓN ACTUAL
   - IVA Débito: $X
   - IVA Crédito: $Y
   - Saldo IVA: $Z
   - Ganancias Estimado: $W

2. PROYECCIÓN MENSUAL (próximos X meses)
   ┌──────┬────────────┬────────────┬──────────┐
   │ Mes  │ IVA Débito │ IVA Crédito│ Saldo    │
   ├──────┼────────────┼────────────┼──────────┤
   │ Mes 1│ $X,XXX     │ $X,XXX     │ $X,XXX   │
   │ Mes 2│ $X,XXX     │ $X,XXX     │ $X,XXX   │
   │ Mes 3│ $X,XXX     │ $X,XXX     │ $X,XXX   │
   └──────┴────────────┴────────────┴──────────┘

3. CALENDARIO DE VENCIMIENTOS
   - IVA: Día 20 de cada mes
   - Ganancias: Cuotas mensuales
   - Anticipos: Según categoría

4. OPORTUNIDADES DE OPTIMIZACIÓN
   - Planificación de compras
   - Timing de facturación
   - Deducciones disponibles

5. RECOMENDACIONES ESPECÍFICAS
   - Estrategias para reducir carga
   - Alertas sobre obligaciones
   - Mejores prácticas

6. ALERTAS Y RIESGOS
   - Vencimientos próximos
   - Saldos altos a pagar
   - Inconsistencias detectadas
```

---

## 🤖 Integración con GPT-4

### Prompt Enviado a GPT-4

```javascript
Actúa como un experto contador impositivo argentino.

DATOS ACTUALES:
- IVA Débito Fiscal (ventas): $X
- IVA Crédito Fiscal (compras): $Y
- Saldo IVA a Pagar: $Z
- Impuesto a las Ganancias Estimado (35%): $W
- Total Impuestos Estimados: $T

FACTURAS ANALIZADAS: N
- Ventas: X
- Compras: Y

SOLICITUD:
1. Analiza mi situación impositiva actual
2. Genera proyecciones para los próximos X meses
3. Identifica oportunidades de optimización fiscal
4. Recomienda estrategias para reducir carga impositiva
5. Alerta sobre obligaciones y vencimientos importantes

Genera un análisis completo con:
- Tabla de proyección mensual de IVA
- Estimación de Ganancias
- Calendario de vencimientos
- Recomendaciones específicas
- Alertas y riesgos
```

### Respuesta de GPT-4

GPT-4 genera un análisis completo que incluye:

✅ **Proyecciones Mensuales**
- IVA mes a mes
- Ganancias acumuladas
- Flujo de caja impositivo

✅ **Calendario de Vencimientos**
- Fechas importantes
- Montos estimados
- Recordatorios

✅ **Optimización Fiscal**
- Estrategias legales
- Timing de operaciones
- Deducciones aplicables

✅ **Alertas y Riesgos**
- Saldos altos
- Vencimientos próximos
- Inconsistencias

---

## 📊 Cálculos Detallados

### IVA (21% - Tasa Estándar Argentina)

**Ejemplo:**

```
Ventas del mes: $100,000
IVA incluido en ventas: $100,000 × 0.21 / 1.21 = $17,355.37

Compras del mes: $60,000
IVA incluido en compras: $60,000 × 0.21 / 1.21 = $10,413.22

Saldo IVA a Pagar: $17,355.37 - $10,413.22 = $6,942.15
```

### Impuesto a las Ganancias (35% - Tasa Sociedades)

**Ejemplo:**

```
Ventas: $100,000
Compras: $60,000
Utilidad: $40,000

Ganancias (35%): $40,000 × 0.35 = $14,000
```

### Total Impuestos Estimados

```
Total = Saldo IVA + Ganancias
Total = $6,942.15 + $14,000 = $20,942.15
```

---

## 🎨 Interfaz de Usuario

### Diseño

**Header:**
- Título: "Gestión de Impuestos"
- Subtítulo: "Análisis y proyecciones impositivas con IA"
- Badge: "GPT-4 Turbo" (gradiente púrpura-azul)

**Cards de Resumen:**
- Grid de 4 columnas
- Colores semánticos:
  - Azul: IVA Débito
  - Verde: IVA Crédito
  - Rojo/Verde: Saldo (dinámico)
  - Naranja: Ganancias

**Generador de Análisis:**
- Selector de período (3, 6, 12 meses)
- Botón con gradiente púrpura-azul
- Icono de Sparkles
- Estado de carga con spinner

**Resultado del Análisis:**
- Fondo gris claro
- Borde sutil
- Formato pre-wrap para tablas
- Tipografía legible

**Información Importante:**
- Fondo azul claro
- Icono de alerta
- Lista de disclaimers

---

## 🔍 Detección de Impuestos en Facturas

### Extracción Automática

El sistema puede detectar impuestos mencionados en las facturas:

```javascript
Palabras clave detectadas:
- "IVA"
- "I.V.A"
- "Impuesto al Valor Agregado"
- "Ganancias"
- "Impuesto a las Ganancias"
- "Retención"
- "Percepción"
```

### Futuras Mejoras

**Extracción de Tasas:**
```
IVA 21% → Detectar tasa específica
IVA 10.5% → Productos especiales
IVA 27% → Servicios específicos
```

**Retenciones:**
```
Retención IIBB → Ingresos Brutos
Retención Ganancias → Impuesto a las Ganancias
Retención IVA → Régimen de retención
```

---

## 📈 Proyecciones

### Escenarios Generados por GPT-4

**Escenario Optimista:**
```
Supuestos:
- Crecimiento 15% mensual
- Mantenimiento de márgenes
- Optimización de compras

Proyección:
Mes 1: IVA $X, Ganancias $Y
Mes 2: IVA $X, Ganancias $Y
Mes 3: IVA $X, Ganancias $Y
```

**Escenario Realista:**
```
Supuestos:
- Crecimiento 5% mensual
- Márgenes estables
- Operación normal

Proyección:
Mes 1: IVA $X, Ganancias $Y
Mes 2: IVA $X, Ganancias $Y
Mes 3: IVA $X, Ganancias $Y
```

**Escenario Pesimista:**
```
Supuestos:
- Decrecimiento 5% mensual
- Presión en márgenes
- Aumento de costos

Proyección:
Mes 1: IVA $X, Ganancias $Y
Mes 2: IVA $X, Ganancias $Y
Mes 3: IVA $X, Ganancias $Y
```

---

## ⚠️ Disclaimers

```
✅ Los cálculos son estimaciones basadas en facturas cargadas
✅ IVA calculado con tasa estándar del 21%
✅ Ganancias estimado con tasa del 35% (sociedades)
✅ Consulta con un contador para confirmación oficial
✅ Las proyecciones son orientativas y pueden cambiar
```

---

## 🚀 Casos de Uso

### Caso 1: PyME con Ventas Regulares

```
Situación:
- Ventas mensuales: $150,000
- Compras mensuales: $90,000
- Margen: 40%

Análisis:
- IVA Débito: $26,033
- IVA Crédito: $15,620
- Saldo IVA: $10,413 (a pagar)
- Ganancias: $21,000
- Total Impuestos: $31,413

Proyección 3 meses:
- Mes 1: $31,413
- Mes 2: $32,984 (+5%)
- Mes 3: $34,633 (+5%)
```

### Caso 2: Startup en Crecimiento

```
Situación:
- Ventas creciendo 20% mensual
- Compras creciendo 15% mensual
- Mejorando márgenes

Análisis:
- Proyección agresiva
- Necesidad de capital para impuestos
- Planificación de flujo de caja

Recomendaciones GPT-4:
- Reservar 25% de ingresos para impuestos
- Planificar pagos anticipados
- Optimizar timing de compras
```

### Caso 3: Empresa con Saldo a Favor

```
Situación:
- Compras > Ventas (inversión inicial)
- IVA Crédito > IVA Débito
- Saldo a favor

Análisis:
- Saldo IVA: -$15,000 (a favor)
- Posibilidad de compensación
- Devolución o crédito futuro

Recomendaciones GPT-4:
- Solicitar devolución si es significativo
- Usar crédito en próximos períodos
- Planificar inversiones
```

---

## 📝 Archivos Creados

```
✅ src/components/dashboard/TaxManagement.jsx
   - Componente principal
   - Cálculo de impuestos
   - Integración con GPT-4
   - UI completa

✅ src/pages/Dashboard.jsx
   - Nueva pestaña "Impuestos"
   - Icono Calculator
   - Renderizado condicional

✅ MODULO_IMPUESTOS.md
   - Documentación completa
   - Ejemplos de uso
   - Cálculos detallados
```

---

## 🎯 Beneficios

### Para el Usuario

✅ **Visibilidad Total:** Conoce sus obligaciones impositivas
✅ **Proyecciones:** Planifica pagos futuros
✅ **Optimización:** Identifica oportunidades de ahorro
✅ **Alertas:** No se pierde vencimientos
✅ **Asesoramiento IA:** Recomendaciones personalizadas

### Para el Negocio

✅ **Planificación:** Mejor gestión de flujo de caja
✅ **Cumplimiento:** Evita multas y recargos
✅ **Eficiencia:** Automatiza cálculos complejos
✅ **Estrategia:** Optimiza carga impositiva legalmente

---

## 🔮 Futuras Mejoras

### Corto Plazo

- [ ] Integración con AFIP (API oficial)
- [ ] Detección automática de retenciones
- [ ] Calendario de vencimientos interactivo
- [ ] Exportar análisis a PDF

### Mediano Plazo

- [ ] Múltiples tasas de IVA (21%, 10.5%, 27%)
- [ ] Cálculo de Ingresos Brutos
- [ ] Régimen de Monotributo
- [ ] Comparación con períodos anteriores

### Largo Plazo

- [ ] Integración bancaria
- [ ] Pagos automáticos
- [ ] Alertas por WhatsApp/Email
- [ ] Dashboard móvil

---

**🎉 ¡Módulo de Impuestos completamente funcional con GPT-4!**

Ahora puedes gestionar, calcular y proyectar todos tus impuestos automáticamente. 💰
