@echo off
echo ========================================
echo   Iniciando MVP IA Empresas
echo ========================================
echo.

echo [1/3] Verificando configuracion...
if not exist .env (
    echo ERROR: Falta archivo .env en la raiz
    echo Copia .env.example a .env y configura las variables
    pause
    exit /b 1
)

if not exist server\.env (
    echo ERROR: Falta archivo server\.env
    echo Copia server\.env.example a server\.env y configura las variables
    pause
    exit /b 1
)

echo [2/3] Iniciando Backend (Puerto 3001)...
start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak > nul

echo [3/3] Iniciando Frontend (Puerto 5173)...
start "Frontend Dev" cmd /k "npm run dev"

echo.
echo ========================================
echo   Servidores Iniciados!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
