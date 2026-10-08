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

git diff --quiet
if %errorlevel% equ 0 (
    git diff --cached --quiet
    if %errorlevel% equ 0 (
        echo Нет изменений для коммита.
        echo Проверяю, есть ли незапушенные коммиты...
        echo.
        git log origin/main..HEAD --oneline
        if %errorlevel% neq 0 (
            echo Все коммиты уже на GitHub.
            pause
            exit /b 0
        )
        set /p confirm="Запушить эти коммиты? (y/n): "
        if /i "%confirm%"=="y" (
            git push
            echo.
            echo ✅ Push выполнен
        ) else (
            echo Отмена
        )
        pause
        exit /b 0
    )
)

set /p msg="Commit message: "
if "%msg%"=="" (
    echo Отмена - сообщение пустое
    pause
    exit /b 1
)

echo.
echo git add .
git add .

echo git commit -m "%msg%"
git commit -m "%msg%"

echo.
echo git push
git push

if %errorlevel% neq 0 (
    echo.
    echo ❌ Ошибка при push
    echo Проверь интернет и права на репозиторий
) else (
    echo.
    echo ✅ Push выполнен
    echo GitHub Pages обновится через 1-2 минуты
)

pause