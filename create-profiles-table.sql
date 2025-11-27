-- =====================================================
-- CREAR TABLA PROFILES (OBLIGATORIO)
-- =====================================================
-- Esta tabla debe existir para que la app funcione
-- Ejecuta este script PRIMERO en Supabase SQL Editor

-- Crear tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Campos para WhatsApp
  company_phone TEXT,
  company_cbu TEXT,
  company_alias TEXT,
  whatsapp_authorized BOOLEAN DEFAULT false,
  
  -- Campos para trial y premium
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  is_premium BOOLEAN DEFAULT false
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, trial_ends_at, is_premium)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NOW() + INTERVAL '14 days',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at
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

-- Crear perfiles para usuarios existentes (si hay)
INSERT INTO public.profiles (id, full_name, trial_ends_at, is_premium)
SELECT 
  id,
  raw_user_meta_data->>'full_name',
  NOW() + INTERVAL '14 days',
  false
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Comentarios
COMMENT ON TABLE profiles IS 'Perfiles de usuario con información adicional';
COMMENT ON COLUMN profiles.company_phone IS 'Teléfono de WhatsApp de la empresa';
COMMENT ON COLUMN profiles.company_cbu IS 'CBU de la empresa para pagos';
COMMENT ON COLUMN profiles.company_alias IS 'Alias bancario de la empresa';
COMMENT ON COLUMN profiles.whatsapp_authorized IS 'Indica si WhatsApp está autorizado';
COMMENT ON COLUMN profiles.trial_ends_at IS 'Fecha de finalización del período de prueba';
COMMENT ON COLUMN profiles.is_premium IS 'Indica si el usuario tiene plan premium';

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla profiles creada exitosamente!' AS status;
