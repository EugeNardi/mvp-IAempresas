-- ============================================
-- CONFIGURACIÓN DE ROW LEVEL SECURITY (RLS)
-- Sistema de Gestión Empresarial
-- ============================================
-- 
-- IMPORTANTE: Ejecutar este script en Supabase Dashboard
-- SQL Editor > New Query > Pegar este código > Run
--
-- Este script configura la seguridad a nivel de fila para
-- asegurar que cada usuario solo pueda acceder a sus propios datos
-- ============================================

-- ============================================
-- 1. COMPANIES TABLE
-- ============================================

-- Habilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propia empresa
CREATE POLICY "Users can view own company"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar su propia empresa
CREATE POLICY "Users can insert own company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar su propia empresa
CREATE POLICY "Users can update own company"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar su propia empresa
CREATE POLICY "Users can delete own company"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. INVOICES TABLE
-- ============================================

-- Habilitar RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias facturas
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propias facturas
CREATE POLICY "Users can insert own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias facturas
CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propias facturas
CREATE POLICY "Users can delete own invoices"
  ON invoices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios productos
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios productos
CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios productos
CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propios productos
CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. CHAT_CONVERSATIONS TABLE
-- ============================================

-- Habilitar RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias conversaciones
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propias conversaciones
CREATE POLICY "Users can insert own conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias conversaciones
CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propias conversaciones
CREATE POLICY "Users can delete own conversations"
  ON chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. CHAT_MESSAGES TABLE
-- ============================================

-- Habilitar RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios mensajes
CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios mensajes
CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios mensajes
CREATE POLICY "Users can update own messages"
  ON chat_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propios mensajes
CREATE POLICY "Users can delete own messages"
  ON chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. SAVED_REPORTS TABLE (si existe)
-- ============================================

-- Habilitar RLS
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios reportes
CREATE POLICY "Users can view own reports"
  ON saved_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios reportes
CREATE POLICY "Users can insert own reports"
  ON saved_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios reportes
CREATE POLICY "Users can update own reports"
  ON saved_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propios reportes
CREATE POLICY "Users can delete own reports"
  ON saved_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. USER_SETTINGS TABLE (si existe)
-- ============================================

-- Habilitar RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias configuraciones
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propias configuraciones
CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias configuraciones
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 8. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices en user_id para queries rápidas
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(user_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id, conversation_id);

-- ============================================
-- 9. VERIFICACIÓN
-- ============================================

-- Verificar que RLS está habilitado en todas las tablas
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'companies',
    'invoices',
    'products',
    'chat_conversations',
    'chat_messages',
    'saved_reports',
    'user_settings'
  )
ORDER BY tablename;

-- Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- ✅ SCRIPT COMPLETADO
-- ============================================
-- 
-- Después de ejecutar este script:
-- 1. Verificar que todas las tablas tienen rowsecurity = true
-- 2. Verificar que todas las políticas se crearon correctamente
-- 3. Probar con múltiples usuarios que no pueden ver datos de otros
-- 4. Monitorear logs de Supabase para errores de permisos
--
-- ============================================
