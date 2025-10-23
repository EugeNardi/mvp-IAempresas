# 🏢 Actualización: Datos de Empresa - Localidad y Categoría Fiscal

## ✅ Cambios Implementados

Se han agregado nuevos campos a la configuración de empresa para almacenar información completa sobre la ubicación y categoría fiscal del contribuyente.

---

## 📋 Nuevos Campos Agregados

### **1. Localidad** (locality)
- **Tipo:** Texto (opcional)
- **Descripción:** Localidad específica donde se encuentra la empresa
- **Ejemplo:** "Villa Carlos Paz", "Río Cuarto", "Alta Gracia"
- **Uso:** Para empresas que necesitan especificar una localidad dentro de una ciudad

### **2. Ciudad** (city)
- **Tipo:** Texto (requerido)
- **Descripción:** Ciudad donde se encuentra la empresa
- **Ejemplo:** "Córdoba", "Buenos Aires", "Rosario"

### **3. Provincia** (province)
- **Tipo:** Texto (requerido)
- **Descripción:** Provincia donde se encuentra la empresa
- **Ejemplo:** "Córdoba", "Buenos Aires", "Santa Fe"

### **4. País** (country)
- **Tipo:** Texto (requerido)
- **Descripción:** País donde se encuentra la empresa
- **Valor por defecto:** "Argentina"

### **5. Categoría Fiscal** (fiscal_category)
- **Tipo:** Texto (requerido)
- **Descripción:** Tipo de contribuyente según AFIP
- **Opciones disponibles:**
  1. **Monotributo**
  2. **Responsable Inscripto**
  3. **Responsable No Inscripto**
  4. **Exento**
  5. **IVA No Alcanzado**
  6. **Consumidor Final**
  7. **Emprendedor No Registrado**
  8. **Régimen Simplificado**
  9. **Autónomo**
  10. **Otro**

### **6. Ejercicio Fiscal** (fiscal_year)
- **Tipo:** Texto (requerido)
- **Descripción:** Año del ejercicio fiscal
- **Opciones:** 2024, 2025, 2026
- **Valor por defecto:** Año actual

### **7. Moneda** (currency)
- **Tipo:** Texto (requerido)
- **Descripción:** Moneda utilizada por la empresa
- **Opciones:**
  - ARS (Peso Argentino)
  - USD (Dólar Estadounidense)
  - EUR (Euro)
- **Valor por defecto:** "ARS"

---

## 📊 Categorías Fiscales - Descripción Detallada

### **1. Monotributo**
- Régimen simplificado para pequeños contribuyentes
- Facturación limitada según categoría (A-K)
- Pago mensual unificado de impuestos
- **Ideal para:** Pequeños comercios, profesionales independientes, emprendedores

### **2. Responsable Inscripto**
- Obligado a facturar con IVA
- Debe presentar declaraciones juradas mensuales
- Régimen general de IVA y Ganancias
- **Ideal para:** Empresas medianas y grandes, comercios establecidos

### **3. Responsable No Inscripto**
- No inscripto en IVA
- Sujeto a retenciones
- Régimen de Ganancias
- **Ideal para:** Profesionales que no superan ciertos montos

### **4. Exento**
- Exento del pago de IVA
- Actividades específicas exentas por ley
- **Ideal para:** Actividades educativas, salud, ciertas asociaciones

### **5. IVA No Alcanzado**
- Actividades no alcanzadas por IVA
- Servicios específicos
- **Ideal para:** Servicios financieros, seguros, ciertos servicios profesionales

### **6. Consumidor Final**
- No realiza actividad comercial habitual
- Compras para uso personal
- **Ideal para:** Particulares sin actividad comercial

### **7. Emprendedor No Registrado**
- Actividad informal o en proceso de formalización
- Sin inscripción fiscal formal
- **Ideal para:** Emprendimientos en etapa inicial

### **8. Régimen Simplificado**
- Regímenes provinciales simplificados
- Convenio Multilateral simplificado
- **Ideal para:** Pequeños contribuyentes con actividad en múltiples provincias

### **9. Autónomo**
- Trabajador independiente
- Profesional liberal
- **Ideal para:** Profesionales, consultores, freelancers

### **10. Otro**
- Otras categorías no listadas
- Regímenes especiales
- **Ideal para:** Situaciones particulares no contempladas

---

## 🗄️ Estructura de Base de Datos

### Tabla: `companies`

```sql
-- Nuevas columnas agregadas:
locality         TEXT              -- Localidad (opcional)
city             TEXT              -- Ciudad (requerido)
province         TEXT              -- Provincia (requerido)
country          TEXT DEFAULT 'Argentina'  -- País (requerido)
fiscal_category  TEXT              -- Categoría fiscal (requerido)
fiscal_year      TEXT DEFAULT '2025'  -- Ejercicio fiscal (requerido)
currency         TEXT DEFAULT 'ARS'  -- Moneda (requerido)
```

### Constraint de Validación

```sql
-- Solo permite categorías fiscales válidas
CHECK (
    fiscal_category IS NULL OR
    fiscal_category IN (
        'Monotributo',
        'Responsable Inscripto',
        'Responsable No Inscripto',
        'Exento',
        'IVA No Alcanzado',
        'Consumidor Final',
        'Emprendedor No Registrado',
        'Régimen Simplificado',
        'Autónomo',
        'Otro'
    )
)
```

---

## 🔧 Archivos Modificados

### **1. CompanyProfile.jsx**
- ✅ Agregado campo "Localidad" (opcional)
- ✅ Campos "Ciudad", "Provincia", "País" reorganizados
- ✅ Agregado selector "Categoría Fiscal" con 10 opciones
- ✅ Campos "Ejercicio Fiscal" y "Moneda" actualizados
- ✅ Texto de ayuda para categoría fiscal

### **2. DataContext.jsx**
- ✅ Función `saveCompanyData` actualizada para guardar nuevos campos
- ✅ Función `loadCompanyData` actualizada para cargar nuevos campos
- ✅ Mapeo correcto entre nombres de base de datos y formulario

### **3. update-company-data.sql** (NUEVO)
- ✅ Script SQL completo para actualizar tabla `companies`
- ✅ Agrega todas las columnas necesarias
- ✅ Crea índices para búsquedas
- ✅ Agrega constraints de validación
- ✅ Incluye comentarios de documentación
- ✅ Ejemplos de uso y consultas

---

## 📝 Instrucciones de Instalación

### **Paso 1: Ejecutar Script SQL**

1. Ve a **Supabase Dashboard**
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `update-company-data.sql`
4. Haz clic en **Run**
5. Verifica que aparezcan mensajes NOTICE confirmando los cambios

**Mensajes esperados:**
```
NOTICE: Columna locality agregada exitosamente
NOTICE: Columna city agregada exitosamente
NOTICE: Columna province agregada exitosamente
NOTICE: Columna country agregada exitosamente
NOTICE: Columna fiscal_category agregada exitosamente
NOTICE: Columna fiscal_year agregada exitosamente
NOTICE: Columna currency agregada exitosamente
NOTICE: Constraint de validación agregado exitosamente
```

### **Paso 2: Verificar en la Interfaz**

1. Inicia la aplicación
2. Ve a **Dashboard** → **Datos de la Empresa**
3. Verifica que aparezcan los nuevos campos:
   - Localidad (opcional)
   - Ciudad (requerido)
   - Provincia (requerido)
   - País (requerido)
   - Categoría Fiscal (requerido)
   - Ejercicio Fiscal (requerido)
   - Moneda (requerido)

### **Paso 3: Completar Información**

1. Completa todos los campos requeridos
2. Selecciona tu categoría fiscal
3. Haz clic en **Guardar**
4. Verifica que aparezca el mensaje: "Datos guardados exitosamente"

---

## 🎨 Vista del Formulario

### Antes:
```
┌─────────────────────────────────────┐
│ Razón Social: Mi Empresa S.A.      │
│ CUIT: 20-12345678-9                 │
│ Dirección: Av. Ejemplo 1234         │
│ Ciudad: Córdoba                     │
│ Provincia: Córdoba                  │
│ País: Argentina                     │
│ Rubro: Comercio                     │
│ Ejercicio Fiscal: 2025              │
│ Moneda: ARS                         │
└─────────────────────────────────────┘
```

### Después:
```
┌─────────────────────────────────────┐
│ Razón Social: Mi Empresa S.A.      │
│ CUIT: 20-12345678-9                 │
│ Dirección: Av. Ejemplo 1234         │
│                                     │
│ Localidad: Villa Carlos Paz         │
│ Ciudad: Córdoba                     │
│                                     │
│ Provincia: Córdoba                  │
│ País: Argentina                     │
│                                     │
│ Categoría Fiscal: Monotributo ▼     │
│ ℹ️ Esta categoría determina las     │
│    regulaciones fiscales aplicables │
│                                     │
│ Rubro: Comercio                     │
│ Ejercicio Fiscal: 2025              │
│ Moneda: ARS                         │
└─────────────────────────────────────┘
```

---

## 🔍 Consultas SQL Útiles

### Ver datos de tu empresa:
```sql
SELECT 
    name AS empresa,
    tax_id AS cuit,
    address AS direccion,
    locality AS localidad,
    city AS ciudad,
    province AS provincia,
    country AS pais,
    fiscal_category AS categoria_fiscal,
    industry AS rubro,
    fiscal_year AS ejercicio_fiscal,
    currency AS moneda
FROM public.companies
WHERE user_id = auth.uid();
```

### Actualizar categoría fiscal:
```sql
UPDATE public.companies
SET fiscal_category = 'Monotributo'
WHERE user_id = auth.uid();
```

### Ver todas las empresas por categoría:
```sql
SELECT 
    fiscal_category,
    COUNT(*) as cantidad
FROM public.companies
WHERE is_active = true
GROUP BY fiscal_category
ORDER BY cantidad DESC;
```

---

## ✅ Validaciones Implementadas

### En el Formulario:
- ✅ Ciudad: requerido
- ✅ Provincia: requerido
- ✅ País: requerido
- ✅ Categoría Fiscal: requerido
- ✅ Ejercicio Fiscal: requerido
- ✅ Moneda: requerido
- ✅ Localidad: opcional

### En la Base de Datos:
- ✅ Constraint para categorías fiscales válidas
- ✅ Valores por defecto para país, ejercicio fiscal y moneda
- ✅ Índice para búsquedas por categoría fiscal

---

## 🎯 Casos de Uso

### **Caso 1: Monotributista en Córdoba**
```
Razón Social: Almacén Don José
CUIT: 20-12345678-9
Dirección: Av. San Martín 123
Localidad: Villa Carlos Paz
Ciudad: Córdoba
Provincia: Córdoba
País: Argentina
Categoría Fiscal: Monotributo
Rubro: Comercio
```

### **Caso 2: Responsable Inscripto en Buenos Aires**
```
Razón Social: Tech Solutions S.A.
CUIT: 30-98765432-1
Dirección: Av. Corrientes 5000
Localidad: (vacío)
Ciudad: Buenos Aires
Provincia: Buenos Aires
País: Argentina
Categoría Fiscal: Responsable Inscripto
Rubro: Tecnología
```

### **Caso 3: Emprendedor en Rosario**
```
Razón Social: Emprendimientos del Litoral
CUIT: 27-11223344-5
Dirección: Calle Mitre 456
Localidad: (vacío)
Ciudad: Rosario
Provincia: Santa Fe
País: Argentina
Categoría Fiscal: Emprendedor No Registrado
Rubro: Servicios
```

---

## 📊 Impacto en el Sistema

### **Reportes y Análisis:**
- Los reportes ahora pueden filtrar por categoría fiscal
- Análisis de cumplimiento según tipo de contribuyente
- Estadísticas por ubicación geográfica

### **Regulaciones:**
- El sistema puede aplicar reglas específicas según categoría fiscal
- Validaciones diferentes para cada tipo de contribuyente
- Cálculos de impuestos personalizados

### **Facturación:**
- Tipo de factura según categoría (A, B, C, etc.)
- Aplicación correcta de IVA
- Retenciones según corresponda

---

## 🚀 Próximos Pasos

1. ✅ **Ejecutar script SQL** en Supabase
2. ✅ **Completar datos** de la empresa en la interfaz
3. ✅ **Verificar** que los datos se guardan correctamente
4. 📋 **Configurar reglas** específicas por categoría fiscal
5. 📋 **Implementar validaciones** según tipo de contribuyente
6. 📋 **Generar reportes** por categoría fiscal

---

## 📚 Archivos Relacionados

- `CompanyProfile.jsx` - Formulario de datos de empresa
- `DataContext.jsx` - Gestión de datos en contexto
- `update-company-data.sql` - Script SQL de actualización
- `ACTUALIZACION-DATOS-EMPRESA.md` - Esta documentación

---

## ✨ Resumen

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ✅ 7 Nuevos Campos Agregados                        │
│  ✅ 10 Categorías Fiscales Disponibles               │
│  ✅ Validaciones Implementadas                       │
│  ✅ Script SQL Completo                              │
│  ✅ Interfaz Actualizada                             │
│  ✅ Documentación Completa                           │
│                                                      │
│  🎯 Sistema listo para manejar diferentes tipos     │
│     de contribuyentes y regulaciones fiscales       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**¡Tu sistema ahora soporta múltiples categorías fiscales y ubicaciones!** 🎉
