-- ============================================
-- ACTUALIZAR TABLA COMPANIES
-- ============================================
-- Este script agrega los campos de localidad, ciudad, provincia
-- y categoría fiscal a la tabla companies para almacenar 
-- información completa de la empresa del usuario
-- Ejecutar en: Supabase SQL Editor

-- 1. Agregar columna locality (localidad) si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'locality'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN locality TEXT;
        
        RAISE NOTICE 'Columna locality agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna locality ya existe';
    END IF;
END $$;

-- 2. Agregar columna city (ciudad) si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN city TEXT;
        
        RAISE NOTICE 'Columna city agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna city ya existe';
    END IF;
END $$;

-- 3. Agregar columna province (provincia) si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'province'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN province TEXT;
        
        RAISE NOTICE 'Columna province agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna province ya existe';
    END IF;
END $$;

-- 4. Agregar columna country (país) si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN country TEXT DEFAULT 'Argentina';
        
        RAISE NOTICE 'Columna country agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna country ya existe';
    END IF;
END $$;

-- 5. Agregar columna fiscal_category (categoría fiscal) si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'fiscal_category'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN fiscal_category TEXT;
        
        RAISE NOTICE 'Columna fiscal_category agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna fiscal_category ya existe';
    END IF;
END $$;

-- 6. Agregar columna fiscal_year (ejercicio fiscal) si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'fiscal_year'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN fiscal_year TEXT DEFAULT '2025';
        
        RAISE NOTICE 'Columna fiscal_year agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna fiscal_year ya existe';
    END IF;
END $$;

-- 7. Agregar columna currency (moneda) si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN currency TEXT DEFAULT 'ARS';
        
        RAISE NOTICE 'Columna currency agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna currency ya existe';
    END IF;
END $$;

-- 8. Crear índice para búsquedas por categoría fiscal
CREATE INDEX IF NOT EXISTS idx_companies_fiscal_category 
ON public.companies(fiscal_category);

-- 9. Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN public.companies.locality IS 'Localidad donde se encuentra la empresa (ej: Villa Carlos Paz)';
COMMENT ON COLUMN public.companies.city IS 'Ciudad donde se encuentra la empresa (ej: Córdoba)';
COMMENT ON COLUMN public.companies.province IS 'Provincia donde se encuentra la empresa (ej: Córdoba)';
COMMENT ON COLUMN public.companies.country IS 'País donde se encuentra la empresa (ej: Argentina)';
COMMENT ON COLUMN public.companies.fiscal_category IS 'Categoría fiscal del contribuyente (ej: Monotributo, Responsable Inscripto, etc.)';
COMMENT ON COLUMN public.companies.fiscal_year IS 'Ejercicio fiscal de la empresa (ej: 2025)';
COMMENT ON COLUMN public.companies.currency IS 'Moneda utilizada por la empresa (ej: ARS, USD, EUR)';

-- 10. Verificar estructura actualizada de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'companies'
ORDER BY ordinal_position;

-- ============================================
-- CATEGORÍAS FISCALES DISPONIBLES
-- ============================================
-- Las siguientes son las categorías fiscales que se pueden usar:
-- 
-- 1. Monotributo
--    - Régimen simplificado para pequeños contribuyentes
--    - Facturación limitada según categoría (A-K)
--    - Pago mensual unificado de impuestos
--
-- 2. Responsable Inscripto
--    - Obligado a facturar con IVA
--    - Debe presentar declaraciones juradas mensuales
--    - Régimen general de IVA y Ganancias
--
-- 3. Responsable No Inscripto
--    - No inscripto en IVA
--    - Sujeto a retenciones
--    - Régimen de Ganancias
--
-- 4. Exento
--    - Exento del pago de IVA
--    - Actividades específicas exentas por ley
--
-- 5. IVA No Alcanzado
--    - Actividades no alcanzadas por IVA
--    - Servicios específicos
--
-- 6. Consumidor Final
--    - No realiza actividad comercial habitual
--    - Compras para uso personal
--
-- 7. Emprendedor No Registrado
--    - Actividad informal o en proceso de formalización
--    - Sin inscripción fiscal formal
--
-- 8. Régimen Simplificado
--    - Regímenes provinciales simplificados
--    - Convenio Multilateral simplificado
--
-- 9. Autónomo
--    - Trabajador independiente
--    - Profesional liberal
--
-- 10. Otro
--     - Otras categorías no listadas
--
-- ============================================

-- 11. Ejemplo de actualización de datos existentes
-- Descomentar y ajustar según necesidad:

/*
UPDATE public.companies
SET 
    locality = 'Villa Carlos Paz',
    city = 'Córdoba',
    province = 'Córdoba',
    country = 'Argentina',
    fiscal_category = 'Monotributo',
    fiscal_year = '2025',
    currency = 'ARS'
WHERE user_id = 'TU_USER_ID_AQUI';
*/

-- 12. Ejemplo de consulta para verificar datos
/*
SELECT 
    user_id,
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
    currency AS moneda,
    created_at AS fecha_creacion
FROM public.companies
WHERE user_id = 'TU_USER_ID_AQUI';
*/

-- ============================================
-- VALIDACIONES Y RESTRICCIONES
-- ============================================

-- 13. Agregar constraint para validar categorías fiscales válidas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'valid_fiscal_category'
    ) THEN
        ALTER TABLE public.companies
        ADD CONSTRAINT valid_fiscal_category
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
        );
        
        RAISE NOTICE 'Constraint de validación agregado exitosamente';
    ELSE
        RAISE NOTICE 'El constraint de validación ya existe';
    END IF;
END $$;

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- 14. Las políticas RLS existentes se aplican automáticamente
-- a las nuevas columnas. Verificar que estén activas:

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'companies';

-- ============================================
-- SCRIPT COMPLETADO
-- ============================================
-- 
-- Resumen de cambios:
-- ✅ Columna 'locality' (localidad) agregada
-- ✅ Columna 'city' (ciudad) agregada
-- ✅ Columna 'province' (provincia) agregada
-- ✅ Columna 'country' (país) agregada
-- ✅ Columna 'fiscal_category' (categoría fiscal) agregada
-- ✅ Columna 'fiscal_year' (ejercicio fiscal) agregada
-- ✅ Columna 'currency' (moneda) agregada
-- ✅ Índice para búsquedas creado
-- ✅ Comentarios de documentación agregados
-- ✅ Constraint de validación agregado
-- ✅ Verificación de estructura realizada
--
-- Próximos pasos:
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Verificar que no hay errores (debe mostrar mensajes NOTICE)
-- 3. Ir a la interfaz → Datos de la Empresa
-- 4. Completar los nuevos campos:
--    - Localidad (opcional)
--    - Ciudad (requerido)
--    - Provincia (requerido)
--    - País (requerido)
--    - Categoría Fiscal (requerido)
--    - Ejercicio Fiscal (requerido)
--    - Moneda (requerido)
-- 5. Guardar y verificar que los datos se almacenan correctamente
--
-- ============================================
