-- Tabla para gestionar la autorización de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_authorization (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  is_authorized BOOLEAN DEFAULT false,
  authorization_code TEXT,
  authorization_date TIMESTAMP WITH TIME ZONE,
  qr_code TEXT,
  session_data JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_user_id ON whatsapp_authorization(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_phone ON whatsapp_authorization(phone_number);

-- RLS
ALTER TABLE whatsapp_authorization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own whatsapp auth"
  ON whatsapp_authorization FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own whatsapp auth"
  ON whatsapp_authorization FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own whatsapp auth"
  ON whatsapp_authorization FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own whatsapp auth"
  ON whatsapp_authorization FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_whatsapp_auth_timestamp
  BEFORE UPDATE ON whatsapp_authorization
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- Agregar campos a la tabla profiles para configuración de empresa
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_cbu TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_alias TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_authorized BOOLEAN DEFAULT false;

COMMENT ON TABLE whatsapp_authorization IS 'Tabla para gestionar la autorización de WhatsApp Business API';
