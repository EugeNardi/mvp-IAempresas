# 🪟 Backend como Servicio de Windows

## ¿Qué es un Servicio de Windows?

Un programa que se ejecuta en segundo plano automáticamente cuando Windows inicia.

---

## 📦 Instalación con node-windows

### 1. Instalar dependencia

```bash
cd server
npm install node-windows
```

### 2. Crear script de instalación

Crea `server/install-service.js`:

```javascript
const Service = require('node-windows').Service;
const path = require('path');

// Crear servicio
const svc = new Service({
  name: 'MVP Empresas Backend',
  description: 'Servidor backend para MVP Empresas con WhatsApp',
  script: path.join(__dirname, 'app.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: "PORT",
      value: "3001"
    },
    {
      name: "NODE_ENV",
      value: "production"
    }
  ]
});

// Eventos
svc.on('install', () => {
  console.log('✅ Servicio instalado correctamente');
  svc.start();
});

svc.on('alreadyinstalled', () => {
  console.log('⚠️  El servicio ya está instalado');
});

svc.on('start', () => {
  console.log('🚀 Servicio iniciado');
});

// Instalar
svc.install();
```

### 3. Crear script de desinstalación

Crea `server/uninstall-service.js`:

```javascript
const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'MVP Empresas Backend',
  script: path.join(__dirname, 'app.js')
});

svc.on('uninstall', () => {
  console.log('✅ Servicio desinstalado');
});

svc.uninstall();
```

### 4. Instalar el servicio

```bash
# Como ADMINISTRADOR
cd server
node install-service.js
```

---

## ✅ Resultado

- ✅ Backend inicia automáticamente con Windows
- ✅ Corre en segundo plano
- ✅ Reinicia automáticamente si falla
- ✅ Todos los usuarios del PC lo comparten

---

## 🛠️ Gestión del Servicio

### Ver servicios
```
services.msc
```
Busca: "MVP Empresas Backend"

### Desinstalar
```bash
cd server
node uninstall-service.js
```

---

## ⚠️ Consideraciones

### Ventajas
- ✅ Inicia automáticamente
- ✅ Corre en segundo plano
- ✅ Reinicio automático

### Desventajas
- ⚠️ Solo funciona en Windows
- ⚠️ Necesita permisos de administrador
- ⚠️ Un solo backend para todos los usuarios del PC
- ⚠️ WhatsApp: todos compartirían la misma sesión

### Mejor para:
- Empresas con un solo usuario por PC
- Instalación en servidor local
