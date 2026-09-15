@echo off
cd /d C:\FireLand\FireLand
set /p msg="Что изменил? "
git add .
git commit -m "%msg%"
git push
echo.
echo Готово! Netlify задеплоит за 10-20 секунд.
pause