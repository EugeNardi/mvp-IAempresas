-- ============================================
-- FIX: Eliminar triggers problemáticos en invoices
-- ============================================
-- Este script elimina cualquier trigger que esté causando
-- el error "record 'new' has no field 'type'"
-- Ejecutar en: Supabase SQL Editor

-- 1. Ver todos los triggers actuales en la tabla invoices
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'invoices';

-- 2. Eliminar todos los triggers personalizados (excepto el de updated_at)
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'invoices'
        AND trigger_name NOT LIKE '%updated_at%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.invoices CASCADE', trigger_record.trigger_name);
        RAISE NOTICE 'Trigger eliminado: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 3. Verificar que los triggers problemáticos fueron eliminados
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'invoices';

-- 4. Verificar la estructura de la tabla invoices
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;

-- ============================================
-- ✅ SCRIPT COMPLETADO
-- ============================================
-- Los triggers problemáticos han sido eliminados.
-- Ahora deberías poder guardar facturas sin errores.
