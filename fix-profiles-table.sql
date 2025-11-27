-- ⚠️ ESTE SCRIPT YA NO ES NECESARIO
-- ⚠️ USA: create-profiles-table.sql EN SU LUGAR
--
-- Este script solo agrega columnas si la tabla profiles YA EXISTE
-- Si la tabla NO EXISTE, usa create-profiles-table.sql primero
--
-- Agregar columnas faltantes a la tabla profiles
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columnas para WhatsApp
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_cbu TEXT,
ADD COLUMN IF NOT EXISTS company_alias TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_authorized BOOLEAN DEFAULT false;

-- Agregar columnas para trial y premium
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

-- Comentarios
COMMENT ON COLUMN profiles.company_phone IS 'Teléfono de WhatsApp de la empresa';
COMMENT ON COLUMN profiles.company_cbu IS 'CBU de la empresa para pagos';
COMMENT ON COLUMN profiles.company_alias IS 'Alias bancario de la empresa';
COMMENT ON COLUMN profiles.whatsapp_authorized IS 'Indica si WhatsApp está autorizado';
COMMENT ON COLUMN profiles.trial_ends_at IS 'Fecha de finalización del período de prueba';
COMMENT ON COLUMN profiles.is_premium IS 'Indica si el usuario tiene plan premium';
