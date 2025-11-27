const fs = require('fs');
const path = require('path');

console.log('\n🔍 VERIFICACIÓN DE WHATSAPP REAL\n');
console.log('='.repeat(50));

let allGood = true;

// 1. Verificar dependencias del servidor
console.log('\n📦 1. Verificando dependencias del servidor...');
const serverPackageJson = path.join(__dirname, 'server', 'package.json');
if (fs.existsSync(serverPackageJson)) {
  const pkg = JSON.parse(fs.readFileSync(serverPackageJson, 'utf8'));
  const required = ['whatsapp-web.js', 'qrcode', '@supabase/supabase-js', 'express'];
  const missing = required.filter(dep => !pkg.dependencies[dep]);
  
  if (missing.length > 0) {
    console.log('   ❌ Faltan dependencias:', missing.join(', '));
    console.log('   💡 Ejecuta: cd server && npm install');
    allGood = false;
  } else {
    console.log('   ✅ Todas las dependencias instaladas');
  }
} else {
  console.log('   ❌ No se encuentra server/package.json');
  allGood = false;
}

// 2. Verificar archivos del servidor
console.log('\n📁 2. Verificando archivos del servidor...');
const serverFiles = [
  'server/services/whatsappService.js',
  'server/routes/whatsappRoutes.js',
  'server/app.js'
];

serverFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} NO EXISTE`);
    allGood = false;
  }
});

// 3. Verificar .env del servidor
console.log('\n🔐 3. Verificando configuración del servidor...');
const serverEnv = path.join(__dirname, 'server', '.env');
if (fs.existsSync(serverEnv)) {
  const envContent = fs.readFileSync(serverEnv, 'utf8');
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET', 'PORT'];
  const missingVars = requiredVars.filter(v => !envContent.includes(v));
  
  if (missingVars.length > 0) {
    console.log('   ⚠️  Faltan variables:', missingVars.join(', '));
    console.log('   💡 Copia server/.env.example a server/.env y configúralo');
  } else {
    console.log('   ✅ Variables de entorno configuradas');
  }
} else {
  console.log('   ❌ server/.env NO EXISTE');
  console.log('   💡 Copia server/.env.example a server/.env');
  allGood = false;
}

// 4. Verificar archivos SQL
console.log('\n🗄️  4. Verificando scripts SQL...');
const sqlFiles = [
  'update-profiles-table.sql',
  'create-chat-tables.sql'
];

sqlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} NO EXISTE`);
    allGood = false;
  }
});

// 5. Verificar componente de frontend
console.log('\n🎨 5. Verificando componente de frontend...');
const messagingComponent = path.join(__dirname, 'src', 'pages', 'Messaging.jsx');
if (fs.existsSync(messagingComponent)) {
  const content = fs.readFileSync(messagingComponent, 'utf8');
  
  if (content.includes('http://localhost:3001/api/whatsapp')) {
    console.log('   ✅ Messaging.jsx configurado para backend real');
  } else {
    console.log('   ⚠️  Messaging.jsx puede estar en modo simulado');
  }
  
  if (content.includes('pollForQRCode')) {
    console.log('   ✅ Función de QR code implementada');
  } else {
    console.log('   ❌ Falta función de QR code');
    allGood = false;
  }
} else {
  console.log('   ❌ src/pages/Messaging.jsx NO EXISTE');
  allGood = false;
}

// 6. Verificar Toast component
console.log('\n🔔 6. Verificando componente Toast...');
const toastComponent = path.join(__dirname, 'src', 'components', 'Toast.jsx');
if (fs.existsSync(toastComponent)) {
  console.log('   ✅ Toast.jsx existe');
} else {
  console.log('   ❌ Toast.jsx NO EXISTE');
  allGood = false;
}

// Resumen final
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('\n✅ TODO LISTO PARA WHATSAPP REAL\n');
  console.log('📋 PRÓXIMOS PASOS:');
  console.log('   1. Ejecuta SQL en Supabase:');
  console.log('      - update-profiles-table.sql');
  console.log('      - create-chat-tables.sql');
  console.log('   2. Inicia el backend:');
  console.log('      cd server && npm run dev');
  console.log('   3. Inicia el frontend:');
  console.log('      npm run dev');
  console.log('   4. Ve a Mensajería → Autorizar WhatsApp');
  console.log('   5. Escanea el QR con tu teléfono');
  console.log('\n📖 Lee WHATSAPP_REAL_GUIA.md para más detalles\n');
} else {
  console.log('\n❌ HAY PROBLEMAS QUE RESOLVER\n');
  console.log('💡 Revisa los errores arriba y corrígelos');
  console.log('📖 Consulta WHATSAPP_REAL_GUIA.md para ayuda\n');
}
