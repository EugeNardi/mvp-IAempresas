-- ============================================
-- SCRIPT SQL COMPLETO PARA SUPABASE
-- Sistema de Inventario con Importación de Excel
-- ============================================

-- 1. TABLA DE PRODUCTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  sale_price DECIMAL(12,2) DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit_measure TEXT DEFAULT 'Unidad',
  energy_cost DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Permitir NULL en company_id para productos de marcas externas
ALTER TABLE public.products 
ALTER COLUMN company_id DROP NOT NULL;

-- Comentarios para documentación
COMMENT ON TABLE public.products IS 'Tabla de productos del inventario';
COMMENT ON COLUMN public.products.company_id IS 'ID de la empresa (NULL para productos de marcas externas)';
COMMENT ON COLUMN public.products.name IS 'Nombre completo del producto';
COMMENT ON COLUMN public.products.sku IS 'Código SKU del producto';
COMMENT ON COLUMN public.products.category_id IS 'Categoría del producto';
COMMENT ON COLUMN public.products.unit_cost IS 'Costo unitario del producto';
COMMENT ON COLUMN public.products.sale_price IS 'Precio de venta del producto';
COMMENT ON COLUMN public.products.current_stock IS 'Stock actual disponible';
COMMENT ON COLUMN public.products.min_stock IS 'Stock mínimo antes de reorden';

-- ============================================
-- 2. ÍNDICES PARA MEJOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_company ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Índice para búsquedas de texto
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops);

-- ============================================
-- 3. TRIGGER PARA ACTUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver productos de su empresa O productos sin empresa (marcas externas)
DROP POLICY IF EXISTS "Users can view their company products" ON public.products;
CREATE POLICY "Users can view their company products" 
ON public.products 
FOR SELECT 
TO authenticated 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.user_companies 
    WHERE user_id = auth.uid()
  )
  OR company_id IS NULL  -- Permitir ver productos de marcas externas
);

-- Política: Los usuarios pueden insertar productos en su empresa O sin empresa
DROP POLICY IF EXISTS "Users can insert products" ON public.products;
CREATE POLICY "Users can insert products" 
ON public.products 
FOR INSERT 
TO authenticated 
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.user_companies 
    WHERE user_id = auth.uid()
  )
  OR company_id IS NULL  -- Permitir insertar productos de marcas externas
);

-- Política: Los usuarios pueden actualizar productos de su empresa
DROP POLICY IF EXISTS "Users can update their company products" ON public.products;
CREATE POLICY "Users can update their company products" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.user_companies 
    WHERE user_id = auth.uid()
  )
  OR company_id IS NULL
)
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.user_companies 
    WHERE user_id = auth.uid()
  )
  OR company_id IS NULL
);

-- Política: Los usuarios pueden eliminar productos de su empresa
DROP POLICY IF EXISTS "Users can delete their company products" ON public.products;
CREATE POLICY "Users can delete their company products" 
ON public.products 
FOR DELETE 
TO authenticated 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.user_companies 
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 5. TABLA DE CATEGORÍAS (si no existe)
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Permitir NULL en company_id para categorías globales
ALTER TABLE public.categories 
ALTER COLUMN company_id DROP NOT NULL;

-- Índices para categorías
CREATE INDEX IF NOT EXISTS idx_categories_company ON public.categories(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- RLS para categorías
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view categories" ON public.categories;
CREATE POLICY "Users can view categories" 
ON public.categories 
FOR SELECT 
TO authenticated 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.user_companies 
    WHERE user_id = auth.uid()
  )
  OR company_id IS NULL
);

DROP POLICY IF EXISTS "Users can manage categories" ON public.categories;
CREATE POLICY "Users can manage categories" 
ON public.categories 
FOR ALL 
TO authenticated 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.user_companies 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM public.user_companies 
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 6. TABLA DE HISTORIAL DE STOCK
-- ============================================
CREATE TABLE IF NOT EXISTS public.stock_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('import', 'sale', 'adjustment', 'return')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para historial
CREATE INDEX IF NOT EXISTS idx_stock_history_product ON public.stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_created_at ON public.stock_history(created_at DESC);

-- RLS para historial
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view stock history" ON public.stock_history;
CREATE POLICY "Users can view stock history" 
ON public.stock_history 
FOR SELECT 
TO authenticated 
USING (
  product_id IN (
    SELECT id FROM public.products 
    WHERE company_id IN (
      SELECT company_id 
      FROM public.user_companies 
      WHERE user_id = auth.uid()
    )
    OR company_id IS NULL
  )
);

-- ============================================
-- 7. FUNCIÓN PARA REGISTRAR CAMBIOS DE STOCK
-- ============================================
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.current_stock != NEW.current_stock) THEN
    INSERT INTO public.stock_history (
      product_id,
      previous_stock,
      new_stock,
      change_amount,
      change_type,
      notes,
      created_by
    ) VALUES (
      NEW.id,
      OLD.current_stock,
      NEW.current_stock,
      NEW.current_stock - OLD.current_stock,
      'adjustment',
      'Stock actualizado',
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_product_stock_change ON public.products;
CREATE TRIGGER log_product_stock_change
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_change();

-- ============================================
-- 8. VISTA PARA PRODUCTOS CON INFORMACIÓN COMPLETA
-- ============================================
CREATE OR REPLACE VIEW public.products_with_details AS
SELECT 
  p.*,
  c.name as category_name,
  c.color as category_color,
  comp.name as company_name,
  (p.sale_price - p.unit_cost) as profit_margin,
  CASE 
    WHEN p.current_stock <= 0 THEN 'out_of_stock'
    WHEN p.current_stock <= p.min_stock THEN 'low_stock'
    ELSE 'in_stock'
  END as stock_status
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.companies comp ON p.company_id = comp.id;

-- ============================================
-- 9. FUNCIÓN PARA IMPORTACIÓN MASIVA
-- ============================================
CREATE OR REPLACE FUNCTION import_products_bulk(
  products_data JSONB,
  user_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  imported_count INTEGER,
  failed_count INTEGER,
  errors JSONB
) AS $$
DECLARE
  product JSONB;
  imported INTEGER := 0;
  failed INTEGER := 0;
  error_list JSONB := '[]'::JSONB;
BEGIN
  FOR product IN SELECT * FROM jsonb_array_elements(products_data)
  LOOP
    BEGIN
      INSERT INTO public.products (
        company_id,
        name,
        sku,
        description,
        category_id,
        unit_cost,
        sale_price,
        current_stock,
        min_stock,
        unit_measure,
        energy_cost,
        is_active,
        created_by
      ) VALUES (
        COALESCE((product->>'company_id')::UUID, user_company_id),
        product->>'name',
        product->>'sku',
        product->>'description',
        (product->>'category_id')::UUID,
        COALESCE((product->>'unit_cost')::DECIMAL, 0),
        COALESCE((product->>'sale_price')::DECIMAL, 0),
        COALESCE((product->>'current_stock')::INTEGER, 0),
        COALESCE((product->>'min_stock')::INTEGER, 0),
        COALESCE(product->>'unit_measure', 'Unidad'),
        COALESCE((product->>'energy_cost')::DECIMAL, 0),
        COALESCE((product->>'is_active')::BOOLEAN, true),
        auth.uid()
      );
      
      imported := imported + 1;
      
    EXCEPTION WHEN OTHERS THEN
      failed := failed + 1;
      error_list := error_list || jsonb_build_object(
        'product', product->>'name',
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  RETURN QUERY SELECT 
    true,
    imported,
    failed,
    error_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. PERMISOS PARA USUARIOS AUTENTICADOS
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT ON public.stock_history TO authenticated;
GRANT SELECT ON public.products_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION import_products_bulk TO authenticated;

-- ============================================
-- 11. DATOS DE EJEMPLO (OPCIONAL)
-- ============================================
-- Insertar categorías de ejemplo para marcas externas
INSERT INTO public.categories (company_id, name, description, color) 
VALUES 
  (NULL, 'ELFBAR', 'Productos ELFBAR', '#8B5CF6'),
  (NULL, 'IGNITE', 'Productos IGNITE', '#F59E0B'),
  (NULL, 'LOST MARY', 'Productos LOST MARY', '#EC4899')
ON CONFLICT (company_id, name) DO NOTHING;

-- ============================================
-- 12. VERIFICACIÓN FINAL
-- ============================================
-- Verificar que la tabla existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'products';

-- Verificar columnas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- Para ejecutar este script:
-- 1. Ve a Supabase Dashboard
-- 2. SQL Editor
-- 3. Copia y pega este script completo
-- 4. Click en "Run"
-- 5. Verifica que no haya errores
-- 6. Recarga tu aplicación
-- ============================================
