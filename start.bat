@echo off
echo 🚀 Starting ECDSA Demo...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Setup backend
echo 📦 Setting up backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate
pip install -q -r requirements.txt

echo 🔧 Starting Flask backend on port 5000...
start /B python app.py

cd ..

REM Setup frontend
echo.
echo 📦 Setting up frontend...
cd frontend

if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
)

echo 🎨 Starting React frontend on port 3000...
start /B npm start

cd ..

echo.
echo ✨ ECDSA Demo is running!
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend:  http://localhost:5000
echo.
echo Press any key to stop both servers
pause >nul

taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1

echo.
echo 🛑 Servers stopped
pause
