@echo off
chcp 65001 >nul
title Servidor Local Escape Room Ciberseguridad
color 0A

echo ======================================================================
echo       ESCAPE ROOM CIBERSEGURIDAD — SERVIDOR MULTIJUGADOR LOCAL
echo ======================================================================
echo.
echo  [*] Comprobando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo  [!] ERROR: Node.js no está instalado o no está en el PATH.
    echo      Descárgalo e instálalo desde: https://nodejs.org/
    pause
    exit /b 1
)

echo  [✓] Node.js detectado.
echo  [*] Iniciando servidor local en red LAN (puerto 4000)...
echo.

:: Abrir navegador en 2 segundos
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:4000/host"

:: Iniciar servidor
node server.js
pause
