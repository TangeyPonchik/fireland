@echo off
chcp 65001 >nul
cd /d C:\FireLand\FireLand
set /p msg="Commit message: "
git add .
git commit -m "%msg%"
git push
echo.
echo Done! Netlify will deploy in 10-20 seconds.
pause