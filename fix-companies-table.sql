-- ============================================
-- FIX TABLA COMPANIES - PERSISTENCIA DE BUSINESS_TYPE
-- ============================================
-- Este script asegura que la tabla companies tenga todos los campos necesarios
-- y que el campo business_type se guarde correctamente
-- ============================================

-- Verificar y agregar columnas faltantes si no existen
DO $$ 
BEGIN
    -- Verificar si existe la columna business_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'business_type'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN business_type TEXT CHECK (business_type IN ('emprendedor', 'pyme')) NOT NULL DEFAULT 'emprendedor';
        RAISE NOTICE 'Columna business_type agregada';
    ELSE
        RAISE NOTICE 'Columna business_type ya existe';
    END IF;

    -- Verificar si existe la columna cuit (además de tax_id)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'cuit'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN cuit TEXT;
        RAISE NOTICE 'Columna cuit agregada';
    ELSE
        RAISE NOTICE 'Columna cuit ya existe';
    END IF;

    -- Verificar si existe la columna address
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN address TEXT;
        RAISE NOTICE 'Columna address agregada';
    ELSE
        RAISE NOTICE 'Columna address ya existe';
    END IF;

    -- Verificar si existe la columna locality
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'locality'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN locality TEXT;
        RAISE NOTICE 'Columna locality agregada';
    ELSE
        RAISE NOTICE 'Columna locality ya existe';
    END IF;

    -- Verificar si existe la columna city
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN city TEXT;
        RAISE NOTICE 'Columna city agregada';
    ELSE
        RAISE NOTICE 'Columna city ya existe';
    END IF;

    -- Verificar si existe la columna province
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'province'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN province TEXT;
        RAISE NOTICE 'Columna province agregada';
    ELSE
        RAISE NOTICE 'Columna province ya existe';
    END IF;

    -- Verificar si existe la columna country
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN country TEXT DEFAULT 'Argentina';
        RAISE NOTICE 'Columna country agregada';
    ELSE
        RAISE NOTICE 'Columna country ya existe';
    END IF;

    -- Verificar si existe la columna phone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN phone TEXT;
        RAISE NOTICE 'Columna phone agregada';
    ELSE
        RAISE NOTICE 'Columna phone ya existe';
    END IF;

    -- Verificar si existe la columna email
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN email TEXT;
        RAISE NOTICE 'Columna email agregada';
    ELSE
        RAISE NOTICE 'Columna email ya existe';
    END IF;

    -- Verificar si existe la columna website
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'website'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN website TEXT;
        RAISE NOTICE 'Columna website agregada';
    ELSE
        RAISE NOTICE 'Columna website ya existe';
    END IF;

    -- Verificar si existe la columna fiscal_year
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'fiscal_year'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN fiscal_year TEXT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
        RAISE NOTICE 'Columna fiscal_year agregada';
    ELSE
        RAISE NOTICE 'Columna fiscal_year ya existe';
    END IF;

    -- Verificar si existe la columna currency
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN currency TEXT DEFAULT 'ARS';
        RAISE NOTICE 'Columna currency agregada';
    ELSE
        RAISE NOTICE 'Columna currency ya existe';
    END IF;
END $$;

-- Actualizar registros existentes que no tengan business_type
UPDATE public.companies 
SET business_type = 'emprendedor' 
WHERE business_type IS NULL OR business_type = '';

-- Verificar la estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'companies'
ORDER BY ordinal_position;

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================
-- 1. Copia este script completo
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega el script y haz clic en "Run"
-- 4. Verifica que todas las columnas se hayan creado correctamente
-- 5. Recarga tu aplicación para que los cambios surtan efecto
-- ============================================
