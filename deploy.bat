@echo off
cd /d C:\FireLand\FireLand

echo ========================================
echo ПРОВЕРКА ЛОКАЛЬНЫХ ФАЙЛОВ
echo ========================================
echo.

findstr /C:"publishable key only" messenger.js
if errorlevel 1 (
  echo ❌ В messenger.js нет "publishable key only" - ты не заменил файл!
  pause
  exit /b 1
)
echo ✅ messenger.js - новая версия
echo.

findstr /C:"sb_publishable_" leaderboard.js
if errorlevel 1 (
  echo ❌ В leaderboard.js нет "sb_publishable_" - ты не заменил ключ!
  pause
  exit /b 1
)
echo ✅ leaderboard.js - новый ключ
echo.

echo ========================================
echo ДЕПЛОЙ
echo ========================================
netlify deploy --prod --dir=.

echo.
echo ========================================
echo ГОТОВО. Проверь продакшен.
echo ========================================
pause