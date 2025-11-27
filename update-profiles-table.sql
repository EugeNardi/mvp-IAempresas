-- =====================================================
-- ACTUALIZAR TABLA PROFILES EXISTENTE
-- =====================================================
-- Este script actualiza la tabla profiles que ya existe
-- Ejecuta este script en Supabase SQL Editor

-- Agregar columnas faltantes (si no existen)
DO $$ 
BEGIN
  -- Columnas para WhatsApp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='company_phone') THEN
    ALTER TABLE profiles ADD COLUMN company_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='company_cbu') THEN
    ALTER TABLE profiles ADD COLUMN company_cbu TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='company_alias') THEN
    ALTER TABLE profiles ADD COLUMN company_alias TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='whatsapp_authorized') THEN
    ALTER TABLE profiles ADD COLUMN whatsapp_authorized BOOLEAN DEFAULT false;
  END IF;
  
  -- Columnas para trial y premium
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='trial_ends_at') THEN
    ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='is_premium') THEN
    ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Crear índices (si no existen)
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

-- Habilitar RLS (si no está habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes y recrearlas
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Crear políticas
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Función para crear perfil automáticamente (reemplazar si existe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, trial_ends_at, is_premium)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW() + INTERVAL '14 days',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Función para updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_profiles_timestamp ON profiles;
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Actualizar perfiles existentes con valores por defecto
UPDATE profiles 
SET 
  trial_ends_at = COALESCE(trial_ends_at, NOW() + INTERVAL '14 days'),
  is_premium = COALESCE(is_premium, false),
  whatsapp_authorized = COALESCE(whatsapp_authorized, false)
WHERE trial_ends_at IS NULL OR is_premium IS NULL OR whatsapp_authorized IS NULL;

-- Comentarios
COMMENT ON COLUMN profiles.company_phone IS 'Teléfono de WhatsApp de la empresa';
COMMENT ON COLUMN profiles.company_cbu IS 'CBU de la empresa para pagos';
COMMENT ON COLUMN profiles.company_alias IS 'Alias bancario de la empresa';
COMMENT ON COLUMN profiles.whatsapp_authorized IS 'Indica si WhatsApp está autorizado';
COMMENT ON COLUMN profiles.trial_ends_at IS 'Fecha de finalización del período de prueba';
COMMENT ON COLUMN profiles.is_premium IS 'Indica si el usuario tiene plan premium';

-- Verificación final
SELECT 
  'Tabla profiles actualizada exitosamente!' AS status,
  COUNT(*) AS total_profiles
FROM profiles;
