@echo off
echo ========================================
echo   Iniciando Servidor Backend
echo ========================================
echo.

cd server

echo Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    npm install
)

echo.
echo Iniciando servidor en puerto 3001...
echo.
npm run dev
