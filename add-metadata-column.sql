-- ============================================
-- AGREGAR COLUMNA METADATA A INVOICES
-- ============================================
-- Este script agrega la columna metadata a la tabla invoices
-- para almacenar información adicional de los movimientos
-- Ejecutar en: Supabase SQL Editor

-- 1. Agregar columna metadata si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.invoices 
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        
        RAISE NOTICE 'Columna metadata agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna metadata ya existe';
    END IF;
END $$;

-- 2. Crear índice para búsquedas en metadata
CREATE INDEX IF NOT EXISTS idx_invoices_metadata ON public.invoices USING gin(metadata);

-- 3. Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'invoices' AND column_name = 'metadata';

-- ============================================
-- ✅ SCRIPT COMPLETADO
-- ============================================
-- La columna metadata ahora está disponible para almacenar:
-- - Tipo de movimiento (venta, compra, gasto, aporte, retiro)
-- - Información de productos
-- - Métodos de pago
-- - Proveedores/clientes
-- - Y cualquier otra información adicional
