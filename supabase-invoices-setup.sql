-- ============================================
-- SCRIPT DE CONFIGURACIÓN DE FACTURAS Y EMPRESAS
-- ============================================
-- Este script crea las tablas necesarias SIN BORRAR datos existentes
-- Ejecutar en: Supabase SQL Editor

-- 1. Crear tabla de empresas (companies) si no existe
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

-- 2. Crear tabla de facturas (invoices) si no existe
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    
    -- Datos de la factura
    invoice_number VARCHAR(100) NOT NULL,
    invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN ('income', 'expense')),
    invoice_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    -- Datos adicionales
    file_name VARCHAR(255),
    processed BOOLEAN DEFAULT false,
    
    -- Impuestos (JSON array)
    taxes JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT positive_amount CHECK (amount >= 0)
);

-- 3. Crear índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_active ON public.companies(is_active);

-- 4. Crear índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON public.invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_active ON public.invoices(is_active);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);

-- 5. Crear función para actualizar updated_at de companies
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para companies
DROP TRIGGER IF EXISTS trigger_companies_updated_at ON public.companies;
CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_updated_at();

-- 7. Crear función para actualizar updated_at de invoices
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para invoices
DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON public.invoices;
CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_updated_at();

-- 9. Habilitar Row Level Security (RLS) para companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 10. Políticas RLS para companies
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their own company" ON public.companies;

CREATE POLICY "Users can view their own company"
    ON public.companies
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company"
    ON public.companies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company"
    ON public.companies
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company"
    ON public.companies
    FOR DELETE
    USING (auth.uid() = user_id);

-- 11. Habilitar Row Level Security (RLS) para invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 12. Eliminar políticas existentes de invoices si existen
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

-- 13. Crear políticas de seguridad para invoices (RLS Policies)

-- Política de SELECT: Los usuarios solo pueden ver sus propias facturas
CREATE POLICY "Users can view their own invoices"
    ON public.invoices
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política de INSERT: Los usuarios solo pueden crear facturas para sí mismos
CREATE POLICY "Users can insert their own invoices"
    ON public.invoices
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE: Los usuarios solo pueden actualizar sus propias facturas
CREATE POLICY "Users can update their own invoices"
    ON public.invoices
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política de DELETE: Los usuarios solo pueden eliminar sus propias facturas
CREATE POLICY "Users can delete their own invoices"
    ON public.invoices
    FOR DELETE
    USING (auth.uid() = user_id);

-- 14. Otorgar permisos
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;

-- 15. Crear vista para estadísticas rápidas
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

-- 16. Otorgar permisos a la vista
GRANT SELECT ON public.invoice_stats TO authenticated;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estas consultas para verificar que todo está correcto:

-- Ver estructura de la tabla
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'invoices'
-- ORDER BY ordinal_position;

-- Ver políticas RLS
-- SELECT * FROM pg_policies WHERE tablename = 'invoices';

-- Ver índices
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'invoices';

-- ============================================
-- ✅ SCRIPT COMPLETADO
-- ============================================
-- Ahora puedes usar la tabla 'invoices' en tu aplicación
-- Las facturas se guardarán automáticamente y persistirán entre sesiones
