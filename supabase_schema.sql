-- ============================================
-- SCHEMA SQL PARA GESTIONAR - SISTEMA DE GESTIÓN EMPRESARIAL
-- ============================================
-- Este archivo contiene todas las tablas necesarias para el sistema
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. TABLA DE USUARIOS (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '21 days'),
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para profiles
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. TABLA DE EMPRESAS/NEGOCIOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cuit TEXT,
  business_type TEXT CHECK (business_type IN ('emprendedor', 'pyme')) NOT NULL,
  fiscal_category TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para companies
CREATE POLICY "Los usuarios pueden ver sus propias empresas" 
  ON public.companies FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias empresas" 
  ON public.companies FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias empresas" 
  ON public.companies FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias empresas" 
  ON public.companies FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. TABLA DE FACTURAS/MOVIMIENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  number TEXT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  client_name TEXT,
  client_cuit TEXT,
  payment_method TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON public.invoices(type);

-- Habilitar RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para invoices
CREATE POLICY "Los usuarios pueden ver sus propias facturas" 
  ON public.invoices FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias facturas" 
  ON public.invoices FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias facturas" 
  ON public.invoices FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias facturas" 
  ON public.invoices FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. TABLA DE INVENTARIO
-- ============================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  min_stock INTEGER DEFAULT 0,
  unit_price DECIMAL(15, 2) NOT NULL,
  cost_price DECIMAL(15, 2),
  supplier TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_company_id ON public.inventory_items(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory_items(category);

-- Habilitar RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para inventory_items
CREATE POLICY "Los usuarios pueden ver su propio inventario" 
  ON public.inventory_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear items en su inventario" 
  ON public.inventory_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su inventario" 
  ON public.inventory_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar items de su inventario" 
  ON public.inventory_items FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. TABLA DE CATEGORÍAS DE INVENTARIO
-- ============================================
CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

-- Habilitar RLS
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Los usuarios pueden ver sus propias categorías" 
  ON public.inventory_categories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias categorías" 
  ON public.inventory_categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias categorías" 
  ON public.inventory_categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias categorías" 
  ON public.inventory_categories FOR DELETE 
  USING (auth.uid() = user_id);

-- 6. TABLA DE REMITOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.remitos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  fecha DATE NOT NULL,
  proveedor TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(15, 2) NOT NULL,
  estado TEXT CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')) DEFAULT 'pendiente',
  notas TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_remitos_user_id ON public.remitos(user_id);
CREATE INDEX IF NOT EXISTS idx_remitos_company_id ON public.remitos(company_id);
CREATE INDEX IF NOT EXISTS idx_remitos_estado ON public.remitos(estado);

-- Habilitar RLS
ALTER TABLE public.remitos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Los usuarios pueden ver sus propios remitos" 
  ON public.remitos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios remitos" 
  ON public.remitos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios remitos" 
  ON public.remitos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios remitos" 
  ON public.remitos FOR DELETE 
  USING (auth.uid() = user_id);

-- 7. TABLA DE CONFIGURACIÓN DE IMPUESTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.tax_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  iva_rate DECIMAL(5, 2) DEFAULT 21.00,
  iibb_rate DECIMAL(5, 2) DEFAULT 3.50,
  ganancias_rate DECIMAL(5, 2) DEFAULT 6.00,
  custom_rates JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Los usuarios pueden ver su configuración de impuestos" 
  ON public.tax_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear su configuración de impuestos" 
  ON public.tax_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su configuración de impuestos" 
  ON public.tax_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- 8. FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remitos_updated_at BEFORE UPDATE ON public.remitos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_settings_updated_at BEFORE UPDATE ON public.tax_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. FUNCIÓN PARA CREAR PERFIL AUTOMÁTICAMENTE
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil cuando se registra un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. VISTAS ÚTILES
-- ============================================

-- Vista de resumen financiero por usuario
CREATE OR REPLACE VIEW public.financial_summary AS
SELECT 
  i.user_id,
  i.company_id,
  DATE_TRUNC('month', i.date) as month,
  SUM(CASE WHEN i.type = 'income' THEN i.amount ELSE 0 END) as total_income,
  SUM(CASE WHEN i.type = 'expense' THEN i.amount ELSE 0 END) as total_expenses,
  SUM(CASE WHEN i.type = 'income' THEN i.amount ELSE -i.amount END) as net_profit,
  COUNT(*) as transaction_count
FROM public.invoices i
GROUP BY i.user_id, i.company_id, DATE_TRUNC('month', i.date);

-- Vista de inventario con alertas de stock bajo
CREATE OR REPLACE VIEW public.low_stock_items AS
SELECT 
  ii.*,
  c.name as company_name
FROM public.inventory_items ii
LEFT JOIN public.companies c ON ii.company_id = c.id
WHERE ii.stock <= ii.min_stock AND ii.active = true;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

-- NOTAS DE IMPLEMENTACIÓN:
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Verificar que todas las tablas se crearon correctamente
-- 3. Probar las políticas RLS con diferentes usuarios
-- 4. Configurar Storage buckets para archivos (facturas, imágenes)
-- 5. Habilitar Realtime en las tablas que lo necesiten

-- BUCKETS DE STORAGE RECOMENDADOS:
-- - invoices: Para PDFs de facturas
-- - inventory: Para imágenes de productos
-- - remitos: Para PDFs de remitos
-- - avatars: Para fotos de perfil

-- Para crear buckets, usar la UI de Supabase Storage o:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('inventory', 'inventory', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('remitos', 'remitos', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
