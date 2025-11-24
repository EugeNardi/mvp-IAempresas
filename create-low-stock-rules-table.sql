-- ============================================
-- CREAR TABLA low_stock_rules
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================

-- Crear la tabla low_stock_rules
CREATE TABLE IF NOT EXISTS low_stock_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rules JSONB NOT NULL DEFAULT '{"default": 5, "specific": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_low_stock_rules UNIQUE(user_id)
);

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_low_stock_rules_user_id ON low_stock_rules(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE low_stock_rules ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propias reglas
CREATE POLICY "Users can view their own low stock rules"
  ON low_stock_rules FOR SELECT
  USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar sus propias reglas
CREATE POLICY "Users can insert their own low stock rules"
  ON low_stock_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propias reglas
CREATE POLICY "Users can update their own low stock rules"
  ON low_stock_rules FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propias reglas
CREATE POLICY "Users can delete their own low stock rules"
  ON low_stock_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Agregar comentario a la tabla
COMMENT ON TABLE low_stock_rules IS 'Reglas personalizadas de stock bajo por usuario';
COMMENT ON COLUMN low_stock_rules.rules IS 'Configuración de reglas en formato JSON: {default: number, specific: [{category, brand, model, threshold}]}';

-- Verificar que la tabla se creó correctamente
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'low_stock_rules'
ORDER BY ordinal_position;
