10:50 08.10.202610:50 08.10.2026@echo off
chcp 65001 >nul

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js не найден. Скачай с https://nodejs.org
    pause
    exit /b 1
)

cd /d "%~dp0"
if not exist "index.html" (
    if exist "..\index.html" (
        cd ..
    ) else (
        echo index.html не найден
        pause
        exit /b 1
    )
)

echo Запуск сервера на http://localhost:3000
start http://localhost:3000
npx --yes serve -l 3000
pause