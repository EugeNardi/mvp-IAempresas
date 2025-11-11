-- Tabla para almacenar tokens de verificación y recuperación
CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_type ON verification_tokens(type);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_verification_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verification_tokens_updated_at
  BEFORE UPDATE ON verification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_tokens_updated_at();

-- Función para limpiar tokens expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_tokens
  WHERE expires_at < NOW() AND used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad RLS
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propios tokens
CREATE POLICY "Users can view own tokens"
  ON verification_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el sistema puede insertar tokens (desde el backend)
CREATE POLICY "Service role can insert tokens"
  ON verification_tokens
  FOR INSERT
  WITH CHECK (true);

-- Solo el sistema puede actualizar tokens
CREATE POLICY "Service role can update tokens"
  ON verification_tokens
  FOR UPDATE
  USING (true);

COMMENT ON TABLE verification_tokens IS 'Almacena tokens para verificación de email y recuperación de contraseña';
COMMENT ON COLUMN verification_tokens.type IS 'Tipo de token: email_verification o password_reset';
COMMENT ON COLUMN verification_tokens.used IS 'Indica si el token ya fue utilizado';
COMMENT ON COLUMN verification_tokens.expires_at IS 'Fecha y hora de expiración del token';
