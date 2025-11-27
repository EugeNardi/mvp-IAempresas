#!/usr/bin/env node

/**
 * Script de verificación de configuración
 * Ejecuta: node check-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando configuración del proyecto...\n');

let errors = 0;
let warnings = 0;

// Verificar archivos .env
console.log('📄 Verificando archivos de configuración:');

if (fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('  ✅ .env (frontend) existe');
  
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  
  if (!envContent.includes('VITE_OPENAI_API_KEY')) {
    console.log('  ⚠️  VITE_OPENAI_API_KEY no configurada');
    warnings++;
  } else if (envContent.includes('your_openai_api_key')) {
    console.log('  ❌ VITE_OPENAI_API_KEY tiene valor de ejemplo');
    errors++;
  } else {
    console.log('  ✅ VITE_OPENAI_API_KEY configurada');
  }
  
  if (!envContent.includes('VITE_SUPABASE_URL')) {
    console.log('  ❌ VITE_SUPABASE_URL no configurada');
    errors++;
  } else {
    console.log('  ✅ VITE_SUPABASE_URL configurada');
  }
  
} else {
  console.log('  ❌ .env (frontend) NO existe');
  console.log('     Copia .env.example a .env');
  errors++;
}

if (fs.existsSync(path.join(__dirname, 'server', '.env'))) {
  console.log('  ✅ server/.env (backend) existe');
  
  const serverEnvContent = fs.readFileSync(path.join(__dirname, 'server', '.env'), 'utf8');
  
  if (!serverEnvContent.includes('SUPABASE_SERVICE_KEY')) {
    console.log('  ❌ SUPABASE_SERVICE_KEY no configurada');
    errors++;
  } else if (serverEnvContent.includes('your_supabase_service_role_key')) {
    console.log('  ❌ SUPABASE_SERVICE_KEY tiene valor de ejemplo');
    errors++;
  } else {
    console.log('  ✅ SUPABASE_SERVICE_KEY configurada');
  }
  
} else {
  console.log('  ❌ server/.env (backend) NO existe');
  console.log('     Copia server/.env.example a server/.env');
  errors++;
}

// Verificar node_modules
console.log('\n📦 Verificando dependencias:');

if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('  ✅ node_modules (frontend) existe');
} else {
  console.log('  ❌ node_modules (frontend) NO existe');
  console.log('     Ejecuta: npm install');
  errors++;
}

if (fs.existsSync(path.join(__dirname, 'server', 'node_modules'))) {
  console.log('  ✅ node_modules (backend) existe');
  
  // Verificar whatsapp-web.js
  if (fs.existsSync(path.join(__dirname, 'server', 'node_modules', 'whatsapp-web.js'))) {
    console.log('  ✅ whatsapp-web.js instalado');
  } else {
    console.log('  ❌ whatsapp-web.js NO instalado');
    console.log('     Ejecuta: cd server && npm install');
    errors++;
  }
  
} else {
  console.log('  ❌ node_modules (backend) NO existe');
  console.log('     Ejecuta: cd server && npm install');
  errors++;
}

// Verificar archivos SQL
console.log('\n📊 Verificando scripts SQL:');

const sqlFiles = [
  'create-chat-tables.sql',
  'create-whatsapp-auth-table.sql',
  'fix-profiles-table.sql'
];

sqlFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file} existe`);
  } else {
    console.log(`  ⚠️  ${file} NO existe`);
    warnings++;
  }
});

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN:');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('✅ Todo está configurado correctamente!');
  console.log('\n🚀 Puedes iniciar los servidores:');
  console.log('   1. cd server && npm run dev');
  console.log('   2. npm run dev (en otra terminal)');
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} error(es) encontrado(s)`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} advertencia(s) encontrada(s)`);
  }
  console.log('\n📖 Lee FIX_ERRORS.md para solucionar los problemas');
}

console.log('='.repeat(50) + '\n');

process.exit(errors > 0 ? 1 : 0);
