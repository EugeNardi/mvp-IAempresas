import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase - Credenciales hardcodeadas
const supabaseUrl = 'https://ewotgkdjtgisxprsoddg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3b3Rna2RqdGdpc3hwcnNvZGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzEyNDgsImV4cCI6MjA3NjAwNzI0OH0.6akUTcGRZ3tY_6OYPsToXT1EbZbFM4IcSZ6RsI4HVCY'

// Debug logs
console.log('🔧 Supabase Configuration:')
console.log('URL:', supabaseUrl)
console.log('URL Type:', typeof supabaseUrl)
console.log('URL Length:', supabaseUrl.length)
console.log('Key exists:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
