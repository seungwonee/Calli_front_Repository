@echo off
chcp 65001 > nul
echo ========================================
echo   Korean Calligraphy - Start All Servers
echo ========================================
echo.

cd /d "%~dp0"

echo [INFO] Starting Backend Server (Spring Boot)...
:: Start Backend in a new CMD window
start "Backend Server" cmd /k "cd /d %~dp0Final_Calli_Project && mvnw spring-boot:run"

echo.
echo [INFO] Backend starting in a separate window...
echo [INFO] Waiting 5 seconds before starting Frontend...
timeout /t 5 > nul

echo.
echo [INFO] Starting Frontend Server (Vite)...
echo [INFO] This window will now host the frontend process.
echo.

cd /d "%~dp0frontend"
npm run dev
