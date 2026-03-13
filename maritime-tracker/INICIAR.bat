@echo off
chcp 65001 >nul
title Maritime Tracker

echo.
echo  =============================================
echo    Maritime Team Tracker - Iniciando...
echo  =============================================
echo.

:: Comprobar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python no encontrado.
    echo  Descargalo en: https://www.python.org/downloads/
    echo  Marca "Add Python to PATH" al instalar.
    pause
    exit /b
)

:: Instalar Flask si no esta
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo  Instalando Flask por primera vez...
    pip install flask
)

:: Arrancar servidor
echo  Abriendo navegador...
timeout /t 2 /nobreak >nul
start http://localhost:5000
python server.py

pause
