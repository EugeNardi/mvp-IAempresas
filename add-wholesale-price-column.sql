-- ============================================
-- AGREGAR COLUMNAS FALTANTES A products
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================

-- Agregar la columna wholesale_price a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(15, 2) DEFAULT 0;

-- Agregar la columna brand (marca) a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand VARCHAR(255);

-- Agregar la columna model (modelo) a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS model VARCHAR(255);

-- Agregar la columna category (categoría como texto) a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Agregar comentarios a las columnas
COMMENT ON COLUMN products.wholesale_price IS 'Precio de venta mayorista del producto';
COMMENT ON COLUMN products.brand IS 'Marca del producto';
COMMENT ON COLUMN products.model IS 'Modelo del producto';
COMMENT ON COLUMN products.category IS 'Categoría del producto (texto libre)';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('wholesale_price', 'brand', 'model', 'category')
ORDER BY column_name;
