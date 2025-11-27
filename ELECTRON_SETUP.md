# 🖥️ Convertir a Aplicación de Escritorio con Electron

## ¿Qué es Electron?

Electron empaqueta tu app web + backend en una **aplicación de escritorio** (.exe para Windows).
- El backend se inicia automáticamente cuando abren la app
- No necesitan instalar Node.js ni nada
- Funciona offline
- Un solo archivo .exe para distribuir

---

## 📦 Instalación

### 1. Instalar Electron

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

### 2. Crear archivo principal de Electron

Crea `electron.js` en la raíz:

```javascript
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'public', 'icon.png')
  });

  // En desarrollo: localhost:5173
  // En producción: archivo local
  const startUrl = process.env.ELECTRON_START_URL || 
    \`file://\${path.join(__dirname, 'dist/index.html')}\`;
  
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  const serverPath = path.join(__dirname, 'server', 'app.js');
  
  serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      PORT: 3001,
      NODE_ENV: 'production'
    }
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(\`Backend: \${data}\`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(\`Backend Error: \${data}\`);
  });
}

app.on('ready', () => {
  startBackend();
  
  // Esperar 2 segundos para que el backend inicie
  setTimeout(() => {
    createWindow();
  }, 2000);
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

### 3. Actualizar package.json

```json
{
  "name": "mvp-empresas",
  "version": "1.0.0",
  "main": "electron.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.mvp.empresas",
    "productName": "MVP Empresas",
    "files": [
      "dist/**/*",
      "server/**/*",
      "electron.js",
      "package.json"
    ],
    "directories": {
      "buildResources": "public"
    },
    "win": {
      "target": "nsis",
      "icon": "public/icon.ico"
    }
  }
}
```

### 4. Crear instalador

```bash
# Desarrollo (con hot reload)
npm run electron:dev

# Producción (crear .exe)
npm run electron:build
```

---

## ✅ Resultado

- ✅ Un archivo `.exe` que incluye todo
- ✅ Backend se inicia automáticamente
- ✅ No necesitan instalar Node.js
- ✅ Funciona offline
- ✅ Fácil de distribuir

---

## 📦 Distribución

El archivo `.exe` estará en:
```
dist/
  MVP Empresas Setup 1.0.0.exe  (instalador)
```

Los usuarios solo:
1. Descargan el .exe
2. Instalan
3. Abren la app
4. ¡Backend ya está corriendo! 🚀

---

## ⚠️ Consideraciones

### WhatsApp en Electron
- Cada usuario tendrá su propia sesión de WhatsApp
- Las sesiones se guardan en: `%APPDATA%/mvp-empresas/whatsapp-sessions/`
- Funciona perfectamente con `whatsapp-web.js`

### Actualizaciones
Puedes usar `electron-updater` para actualizaciones automáticas.
