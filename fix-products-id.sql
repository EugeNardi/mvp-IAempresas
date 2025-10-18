-- ============================================
-- FIX RÁPIDO: Configurar ID automático en tabla products
-- ============================================

-- 1. Asegurarse de que la columna id tenga DEFAULT gen_random_uuid()
ALTER TABLE public.products 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Verificar que la columna id sea PRIMARY KEY
-- (Si no lo es, esto lo arreglará)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'products_pkey'
    ) THEN
        ALTER TABLE public.products ADD PRIMARY KEY (id);
    END IF;
END $$;

-- 3. Verificar la configuración
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND column_name = 'id';

-- Debería mostrar:
-- column_name | data_type | column_default      | is_nullable
-- id          | uuid      | gen_random_uuid()   | NO

-- ============================================
-- EJECUTA ESTE SCRIPT EN SUPABASE SQL EDITOR
-- ============================================
