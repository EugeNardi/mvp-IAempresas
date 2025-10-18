-- ============================================
-- INSTALACION LIMPIA - SISTEMA MULTI-USUARIO
-- ============================================
-- ADVERTENCIA: Este script BORRA todas las tablas existentes
-- Solo ejecutar si quieres empezar de cero
-- ============================================

-- PASO 1: ELIMINAR TABLAS EXISTENTES
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- PASO 2: ELIMINAR VISTAS
DROP VIEW IF EXISTS public.invoice_stats CASCADE;
DROP VIEW IF EXISTS public.product_stats CASCADE;

-- PASO 3: ELIMINAR FUNCIONES
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- ============================================
-- PASO 4: CREAR TABLAS DESDE CERO
-- ============================================

-- TABLA: COMPANIES
CREATE TABLE public.companies (
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

-- TABLA: INVOICES
CREATE TABLE public.invoices (
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

-- TABLA: PRODUCTS
CREATE TABLE public.products (
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

-- ============================================
-- PASO 5: CREAR INDICES
-- ============================================

-- Indices para COMPANIES
CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_companies_active ON public.companies(is_active);

-- Indices para INVOICES
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX idx_invoices_type ON public.invoices(invoice_type);
CREATE INDEX idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_active ON public.invoices(is_active);

-- Indices para PRODUCTS
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_company_id ON public.products(company_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_sku ON public.products(sku);

-- ============================================
-- PASO 6: HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 7: POLITICAS RLS PARA COMPANIES
-- ============================================

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

-- ============================================
-- PASO 8: POLITICAS RLS PARA INVOICES
-- ============================================

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

-- ============================================
-- PASO 9: POLITICAS RLS PARA PRODUCTS
-- ============================================

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

-- ============================================
-- PASO 10: FUNCIONES Y TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PASO 11: VISTAS
-- ============================================

CREATE VIEW public.invoice_stats AS
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

CREATE VIEW public.product_stats AS
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

-- ============================================
-- PASO 12: PERMISOS
-- ============================================

GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
GRANT SELECT ON public.invoice_stats TO authenticated;
GRANT SELECT ON public.product_stats TO authenticated;

-- ============================================
-- INSTALACION COMPLETADA
-- ============================================
-- Recarga tu aplicacion (F5) y todo deberia funcionar
-- ============================================
