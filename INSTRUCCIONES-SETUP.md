# INSTRUCCIONES DE INSTALACION - SISTEMA MULTI-USUARIO

## PASO 1: EJECUTAR SCRIPT SQL

1. Abre **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menu lateral izquierdo)
4. Click en **New query**
5. Copia TODO el contenido de: `supabase-setup-final.sql`
6. Pega en el editor
7. Click en **RUN** (boton verde abajo a la derecha)
8. Espera a ver **"Success"** en verde

## PASO 2: VERIFICAR INSTALACION

Ejecuta estas consultas en SQL Editor para verificar:

### Verificar Tablas Creadas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('companies', 'invoices', 'products')
ORDER BY table_name;
```

**Resultado esperado:**
```
companies
invoices
products
```

### Verificar Politicas RLS (12 total)
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'invoices', 'products')
ORDER BY tablename, policyname;
```

**Resultado esperado: 12 politicas**
- 4 para companies
- 4 para invoices
- 4 para products

### Verificar Indices
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'invoices', 'products')
ORDER BY tablename, indexname;
```

## PASO 3: RECARGAR APLICACION

1. Vuelve a tu aplicacion web
2. Presiona **F5** para recargar
3. Inicia sesion
4. Verifica que no hay errores en consola (F12)

## PASO 4: PROBAR FUNCIONALIDAD

### Test 1: Datos de Empresa
1. Ve a **Dashboard > Empresa**
2. Llena el formulario
3. Click en **Guardar Informacion**
4. Recarga la pagina (F5)
5. Verifica que los datos persisten

### Test 2: Facturas
1. Ve a **Dashboard > Facturas**
2. Click en **Ingreso Manual**
3. Llena los datos
4. Click en **Agregar Factura**
5. Recarga la pagina (F5)
6. Verifica que la factura sigue ahi

### Test 3: Productos
1. Ve a **Dashboard > Inventario**
2. Click en **Nuevo Producto**
3. Llena los datos
4. Click en **Guardar**
5. Recarga la pagina (F5)
6. Verifica que el producto sigue ahi

## PASO 5: PROBAR MULTI-USUARIO

### Usuario 1
1. Inicia sesion con usuario1@test.com
2. Crea empresa "Empresa 1"
3. Agrega 3 productos
4. Agrega 2 facturas

### Usuario 2
1. Cierra sesion
2. Inicia sesion con usuario2@test.com
3. Crea empresa "Empresa 2"
4. Agrega 5 productos
5. Agrega 3 facturas

### Verificacion
1. Vuelve a iniciar sesion como usuario1@test.com
2. Verifica que solo ves TUS 3 productos y 2 facturas
3. NO deberias ver los datos de usuario2

## ERRORES COMUNES

### Error: "relation does not exist"
**Solucion:** No ejecutaste el script SQL. Ve al Paso 1.

### Error: "permission denied"
**Solucion:** Las politicas RLS no se crearon. Ejecuta el script de nuevo.

### Los datos se borran al refrescar
**Solucion:** Verifica que las tablas existen en Supabase (Paso 2).

### Veo datos de otros usuarios
**Solucion:** Las politicas RLS no funcionan. Ejecuta:
```sql
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
```

## CONSOLA DEL NAVEGADOR

### Mensajes Correctos (F12)
```
Cargando datos de empresa desde Supabase...
Empresa cargada: Mi Empresa S.A.
Cargando facturas desde Supabase...
Facturas cargadas: 5
Cargando productos...
Productos cargados: 10
```

### Mensajes de Error
Si ves errores 400 o "relation does not exist":
- Ejecuta el script SQL (Paso 1)
- Recarga la pagina (F5)

## ESTRUCTURA FINAL

```
Supabase Database
├── companies (tabla)
│   ├── 4 politicas RLS
│   ├── 2 indices
│   └── 1 trigger
├── invoices (tabla)
│   ├── 4 politicas RLS
│   ├── 5 indices
│   └── 1 trigger
├── products (tabla)
│   ├── 4 politicas RLS
│   ├── 4 indices
│   └── 1 trigger
├── invoice_stats (vista)
└── product_stats (vista)
```

## SOPORTE

Si tienes problemas:
1. Verifica la consola del navegador (F12)
2. Verifica los logs de Supabase
3. Ejecuta las consultas de verificacion (Paso 2)
4. Asegurate de estar autenticado

## LISTO!

Una vez completados todos los pasos, tu sistema estara:
- Funcionando con multiples usuarios
- Cada usuario ve solo sus datos
- Datos persistentes (no se borran)
- Seguro con RLS
- Listo para produccion
