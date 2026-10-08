@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

echo ============================================
echo    FireLand - git push
echo ============================================
echo.

echo 📋 Статус:
git status --short
echo.

echo 📝 Коммичу ВСЕ изменения с сообщением по умолчанию...
echo.

git add .
git commit -m "auto: обновление" 2>nul

echo.
echo 🚀 Push...
echo.

git push

echo.
echo ============================================
echo    Готово
echo ============================================
pause