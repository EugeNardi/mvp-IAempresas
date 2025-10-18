-- ============================================
-- SCHEMA PARA MÓDULO DE INVENTARIO
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================

-- ============================================
-- 1. TABLA: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('stock', 'expense', 'income')),
  description TEXT,
  color VARCHAR(20) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'Package',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_company_id ON categories(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories of their company"
  ON categories FOR SELECT
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert categories to their company"
  ON categories FOR INSERT
  WITH CHECK (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update categories of their company"
  ON categories FOR UPDATE
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete categories of their company"
  ON categories FOR DELETE
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));


-- ============================================
-- 2. TABLA: suppliers
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  tax_id VARCHAR(50),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Argentina',
  payment_terms INTEGER DEFAULT 0,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- RLS Policies
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage suppliers of their company"
  ON suppliers FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));


-- ============================================
-- 3. TABLA: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  sku VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  min_value DECIMAL(15, 2) DEFAULT 0,
  unit_measure VARCHAR(50) DEFAULT 'Unidad',
  energy_cost DECIMAL(15, 2) DEFAULT 0,
  barcode VARCHAR(100),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_sku_per_company UNIQUE(company_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(current_stock, min_stock) WHERE current_stock <= min_stock;

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage products of their company"
  ON products FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));


-- ============================================
-- 4. TABLA: sales (para futuro)
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sale_number VARCHAR(100) UNIQUE NOT NULL,
  sale_type VARCHAR(20) DEFAULT 'retail' CHECK (sale_type IN ('retail', 'wholesale')),
  client_name VARCHAR(255),
  seller_name VARCHAR(255),
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  discount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial')),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_company_id ON sales(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(payment_status);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sales of their company"
  ON sales FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));


-- ============================================
-- 5. TABLA: sale_items (para futuro)
-- ============================================
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sale items of their company"
  ON sale_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM sales 
    JOIN companies ON companies.id = sales.company_id
    WHERE sales.id = sale_items.sale_id 
    AND companies.user_id = auth.uid()
  ));


-- ============================================
-- 6. TABLA: purchases (para futuro)
-- ============================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  purchase_number VARCHAR(100) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  invoice_number VARCHAR(100),
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partial')),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_company_id ON purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage purchases of their company"
  ON purchases FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));


-- ============================================
-- 7. TABLA: purchase_items (para futuro)
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(15, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id);

ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage purchase items of their company"
  ON purchase_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM purchases 
    JOIN companies ON companies.id = purchases.company_id
    WHERE purchases.id = purchase_items.purchase_id 
    AND companies.user_id = auth.uid()
  ));


-- ============================================
-- TRIGGERS Y FUNCIONES
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- FUNCIÓN: Actualizar stock después de venta
-- ============================================
CREATE OR REPLACE FUNCTION update_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET current_stock = current_stock - NEW.quantity
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_after_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_after_sale();


-- ============================================
-- FUNCIÓN: Actualizar stock después de compra
-- ============================================
CREATE OR REPLACE FUNCTION update_stock_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET current_stock = current_stock + NEW.quantity,
      unit_cost = NEW.unit_cost
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_after_purchase
  AFTER INSERT ON purchase_items
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_after_purchase();


-- ============================================
-- FUNCIÓN: Generar número de venta automático
-- ============================================
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  new_sale_number VARCHAR(100);
BEGIN
  SELECT COUNT(*) + 1 INTO next_number
  FROM sales
  WHERE company_id = NEW.company_id
  AND EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM NEW.sale_date);
  
  new_sale_number := 'V-' || EXTRACT(YEAR FROM NEW.sale_date) || '-' || LPAD(next_number::TEXT, 6, '0');
  NEW.sale_number := new_sale_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_sale_number
  BEFORE INSERT ON sales
  FOR EACH ROW
  WHEN (NEW.sale_number IS NULL OR NEW.sale_number = '')
  EXECUTE FUNCTION generate_sale_number();


-- ============================================
-- FUNCIÓN: Generar número de compra automático
-- ============================================
CREATE OR REPLACE FUNCTION generate_purchase_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  new_purchase_number VARCHAR(100);
BEGIN
  SELECT COUNT(*) + 1 INTO next_number
  FROM purchases
  WHERE company_id = NEW.company_id
  AND EXTRACT(YEAR FROM purchase_date) = EXTRACT(YEAR FROM NEW.purchase_date);
  
  new_purchase_number := 'C-' || EXTRACT(YEAR FROM NEW.purchase_date) || '-' || LPAD(next_number::TEXT, 6, '0');
  NEW.purchase_number := new_purchase_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_purchase_number
  BEFORE INSERT ON purchases
  FOR EACH ROW
  WHEN (NEW.purchase_number IS NULL OR NEW.purchase_number = '')
  EXECUTE FUNCTION generate_purchase_number();


-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================

-- Insertar categorías por defecto para cada empresa
-- (Esto se puede hacer desde la aplicación al crear una empresa)

-- Ejemplo de categorías de stock
-- INSERT INTO categories (company_id, name, type, color, icon) VALUES
--   ('company-uuid-here', 'Productos', 'stock', '#3B82F6', 'Package'),
--   ('company-uuid-here', 'Materias Primas', 'stock', '#10B981', 'Box'),
--   ('company-uuid-here', 'Insumos', 'stock', '#F59E0B', 'Layers');

-- Ejemplo de categorías de gastos
-- INSERT INTO categories (company_id, name, type, color, icon) VALUES
--   ('company-uuid-here', 'Servicios', 'expense', '#EF4444', 'Zap'),
--   ('company-uuid-here', 'Alquileres', 'expense', '#8B5CF6', 'Home'),
--   ('company-uuid-here', 'Sueldos', 'expense', '#EC4899', 'Users');


-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que las tablas se crearon correctamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'suppliers', 'products', 'sales', 'sale_items', 'purchases', 'purchase_items')
ORDER BY table_name;

-- Verificar que los triggers se crearon correctamente
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('categories', 'products', 'sales', 'sale_items', 'purchases', 'purchase_items')
ORDER BY event_object_table, trigger_name;

-- ============================================
-- ¡LISTO!
-- ============================================
-- El schema de inventario está completamente configurado
-- Ahora puedes usar el módulo de inventario en la aplicación
