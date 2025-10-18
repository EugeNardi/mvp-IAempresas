-- ============================================
-- 🚀 SCRIPT SQL DEFINITIVO - EJECUTAR COMPLETO
-- ============================================
-- COPIA TODO ESTE ARCHIVO Y PÉGALO EN SUPABASE SQL EDITOR
-- LUEGO PRESIONA "RUN" (Ctrl+Enter)
-- ============================================

-- PASO 1: Eliminar tabla existente si tiene problemas
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.stock_history CASCADE;

-- PASO 2: Crear tabla products CORRECTAMENTE
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  category_id UUID,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  sale_price DECIMAL(12,2) DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit_measure TEXT DEFAULT 'Unidad',
  energy_cost DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 3: Crear índices
CREATE INDEX idx_products_company ON public.products(company_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_name ON public.products(name);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_active ON public.products(is_active);

-- PASO 4: Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear políticas RLS
CREATE POLICY "Enable all for authenticated users" 
ON public.products 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- PASO 6: Dar permisos
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO anon;

-- PASO 7: Verificar que todo está bien
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
ORDER BY ordinal_position;

-- ============================================
-- ✅ LISTO! Ahora recarga tu app y prueba la importación
-- ============================================
