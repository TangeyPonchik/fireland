@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

echo ============================================
echo    FireLand · дамп backend.sql
echo ============================================
echo.

supabase db dump --schema public --file backend.sql

if %errorlevel% neq 0 (
    echo.
    echo ❌ Ошибка дампа. Проверь supabase login и link.
    pause
    exit /b 1
)

echo.
echo ✅ backend.sql обновлён
echo.
echo Размер:
dir backend.sql | find "backend.sql"
echo.
echo Закоммить в git, чтобы нейросеть видела схему.
echo.
pause