-- ============================================
-- SCRIPT FINAL - SISTEMA CONTABLE MULTI-USUARIO
-- ============================================
-- Cada usuario ve SOLO sus datos
-- Multiples usuarios pueden usar la plataforma
-- No borra datos existentes
-- ============================================

-- 1. TABLA DE EMPRESAS
-- Un usuario = Una empresa
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    industry VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_active ON public.companies(is_active);

-- Seguridad RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their own company" ON public.companies;

CREATE POLICY "Users can view their own company"
    ON public.companies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company"
    ON public.companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company"
    ON public.companies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company"
    ON public.companies FOR DELETE
    USING (auth.uid() = user_id);


-- 2. TABLA DE FACTURAS
-- Cada usuario ve solo sus facturas
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN ('income', 'expense')),
    invoice_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    category VARCHAR(100) NOT NULL,
    file_name VARCHAR(255),
    processed BOOLEAN DEFAULT false,
    taxes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON public.invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_active ON public.invoices(is_active);

-- Seguridad RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

CREATE POLICY "Users can view their own invoices"
    ON public.invoices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
    ON public.invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
    ON public.invoices FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
    ON public.invoices FOR DELETE
    USING (auth.uid() = user_id);


-- 3. TABLA DE PRODUCTOS
-- Cada usuario ve solo sus productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    description TEXT,
    category_id UUID,
    unit_cost DECIMAL(15, 2) DEFAULT 0,
    sale_price DECIMAL(15, 2) DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Seguridad RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

CREATE POLICY "Users can view their own products"
    ON public.products FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
    ON public.products FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
    ON public.products FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
    ON public.products FOR DELETE
    USING (auth.uid() = user_id);


-- 4. FUNCIONES Y TRIGGERS
-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para companies
DROP TRIGGER IF EXISTS trigger_companies_updated_at ON public.companies;
CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Triggers para invoices
DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON public.invoices;
CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Triggers para products
DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- 5. VISTAS UTILES
-- Estadisticas de facturas por usuario
CREATE OR REPLACE VIEW public.invoice_stats AS
SELECT 
    user_id,
    company_id,
    COUNT(*) as total_invoices,
    COUNT(*) FILTER (WHERE invoice_type = 'income') as income_count,
    COUNT(*) FILTER (WHERE invoice_type = 'expense') as expense_count,
    COALESCE(SUM(amount) FILTER (WHERE invoice_type = 'income'), 0) as total_income,
    COALESCE(SUM(amount) FILTER (WHERE invoice_type = 'expense'), 0) as total_expenses,
    COALESCE(SUM(amount) FILTER (WHERE invoice_type = 'income'), 0) - 
    COALESCE(SUM(amount) FILTER (WHERE invoice_type = 'expense'), 0) as net_result
FROM public.invoices
WHERE is_active = true
GROUP BY user_id, company_id;

-- Estadísticas de productos por usuario
CREATE OR REPLACE VIEW public.product_stats AS
SELECT 
    user_id,
    company_id,
    COUNT(*) as total_products,
    SUM(current_stock * unit_cost) as total_inventory_value,
    SUM(current_stock * sale_price) as total_potential_sales,
    COUNT(*) FILTER (WHERE current_stock <= min_stock) as low_stock_count,
    COUNT(*) FILTER (WHERE current_stock = 0) as out_of_stock_count
FROM public.products
WHERE is_active = true
GROUP BY user_id, company_id;


-- 6. PERMISOS
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
GRANT SELECT ON public.invoice_stats TO authenticated;
GRANT SELECT ON public.product_stats TO authenticated;


-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================
-- Ejecuta esto para verificar que todo está OK:

-- Ver tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('companies', 'invoices', 'products')
ORDER BY table_name;

-- Ver políticas RLS (deben existir 12 políticas: 4 por tabla)
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('companies', 'invoices', 'products')
ORDER BY tablename, policyname;

-- ============================================
-- SCRIPT COMPLETADO
-- ============================================
-- 3 tablas: companies, invoices, products
-- RLS habilitado en todas
-- Cada usuario ve SOLO sus datos
-- Multiples usuarios pueden usar la app
-- No se borran datos existentes
-- ============================================
