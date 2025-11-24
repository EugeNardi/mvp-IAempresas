-- Tabla para almacenar reglas de stock bajo personalizadas por usuario
CREATE TABLE IF NOT EXISTS low_stock_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rules JSONB NOT NULL DEFAULT '{"default": 5, "specific": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_low_stock_rules_user_id ON low_stock_rules(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE low_stock_rules ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias reglas
CREATE POLICY "Users can view own low stock rules"
  ON low_stock_rules
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias reglas
CREATE POLICY "Users can insert own low stock rules"
  ON low_stock_rules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias reglas
CREATE POLICY "Users can update own low stock rules"
  ON low_stock_rules
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias reglas
CREATE POLICY "Users can delete own low stock rules"
  ON low_stock_rules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE low_stock_rules IS 'Almacena las reglas personalizadas de stock bajo por usuario';
COMMENT ON COLUMN low_stock_rules.rules IS 'Objeto JSON con regla default y array de reglas específicas por categoría/marca/modelo';
COMMENT ON COLUMN low_stock_rules.user_id IS 'ID del usuario propietario de las reglas';
