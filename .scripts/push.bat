@echo off
chcp 65001 >nul
cd /d "%~dp0\.."

if not exist ".git" (
    echo ❌ Это не git-репозиторий
    pause
    exit /b 1
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git не установлен. Скачай с https://git-scm.com
    pause
    exit /b 1
)

echo ============================================
echo    FireLand - git push
echo ============================================
echo.

git status --short
echo.

set /p "msg=Commit message (Enter - только push без коммита): "

if not "%msg%"=="" (
    echo.
    echo git add .
    git add .
    
    echo git commit -m "%msg%"
    git commit -m "%msg%"
    
    if errorlevel 1 (
        echo.
        echo ❌ Ошибка при commit
        pause
        exit /b 1
    )
) else (
    echo.
    echo Пропускаю коммит - только push
)

echo.
echo git push
git push

if errorlevel 1 (
    echo.
    echo ============================================
    echo    ❌ Ошибка при push
    echo ============================================
    echo.
    echo Возможные причины:
    echo   • Нет интернета
    echo   • Нет прав на репозиторий
    echo   • Нужно сначала git pull
) else (
    echo.
    echo ============================================
    echo    ✅ Готово!
    echo ============================================
    echo.
    echo GitHub Pages обновится через 1-2 минуты
    echo https://tangeyponchik.github.io/fireland/
)

pause