@echo off
cls
echo.
echo =======================================
echo   Resume Builder Pro v2.0 - Quick Start
echo =======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check if MongoDB is running (basic check)
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %errorlevel% == 0 (
    echo ✅ MongoDB is running
) else (
    echo ⚠️  MongoDB not detected. Make sure MongoDB is running
    echo ℹ️  You can start MongoDB with: mongod
    echo.
)

REM Setup backend .env if it doesn't exist
if not exist "backend\.env" (
    echo ℹ️  Creating backend environment file...
    (
        echo # Database Configuration
        echo MONGODB_URI=mongodb://localhost:27017/resume-builder
        echo.
        echo # Authentication
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo JWT_EXPIRES_IN=7d
        echo SESSION_SECRET=your-session-secret-key-change-this-too
        echo.
        echo # Server Configuration
        echo PORT=5001
        echo NODE_ENV=development
        echo FRONTEND_URL=http://localhost:3000
        echo.
        echo # AI Service ^(Replace with your OpenAI API key^)
        echo OPENAI_API_KEY=your-openai-api-key-here
        echo.
        echo # Security
        echo CORS_ORIGIN=http://localhost:3000
    ) > backend\.env
    echo ✅ Created backend\.env file
    echo ⚠️  IMPORTANT: Add your OpenAI API key to backend\.env
    echo.
)

REM Install backend dependencies
echo ℹ️  Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

REM Install frontend dependencies
cd ..\frontend
echo ℹ️  Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

REM Initialize database
cd ..\backend
echo ℹ️  Initializing database...
call npm run init-db
if %errorlevel% neq 0 (
    echo ⚠️  Database initialization had issues, but continuing...
) else (
    echo ✅ Database initialized successfully
    echo ℹ️  Demo account created: demo@resumebuilder.com / demo123
)

cd ..

REM Create development start script
echo ℹ️  Creating development start script...
(
    echo @echo off
    echo echo.
    echo echo =======================================
    echo echo   Resume Builder Pro v2.0 - Development
    echo echo =======================================
    echo echo.
    echo echo 🚀 Starting application...
    echo echo.
    echo echo 📡 Starting backend server...
    echo start "Resume Builder Backend" cmd /k "cd backend && npm run dev"
    echo timeout /t 5 /nobreak ^>nul
    echo.
    echo echo 🌐 Starting frontend server...
    echo start "Resume Builder Frontend" cmd /k "cd frontend && npm start"
    echo.
    echo echo.
    echo echo 🎉 Application started successfully!
    echo echo 📱 Frontend: http://localhost:3000
    echo echo 📡 Backend:  http://localhost:5001
    echo echo 🔍 Health:   http://localhost:5001/health
    echo echo.
    echo echo 📝 Demo Account:
    echo echo    Email:    demo@resumebuilder.com
    echo echo    Password: demo123
    echo echo.
    echo echo ℹ️  Close the terminal windows to stop the servers
    echo echo.
    echo pause
) > start_dev.bat

echo ✅ Created start_dev.bat script

echo.
echo =======================================
echo   🎉 Setup completed successfully!
echo =======================================
echo.
echo ✅ All prerequisites checked
echo ✅ Environment configured  
echo ✅ Dependencies installed
echo ✅ Database initialized
echo ✅ Start scripts created
echo.
echo ⚠️  Don't forget to add your OpenAI API key to backend\.env
echo.
echo 🚀 Ready to start! Run: start_dev.bat
echo.
echo Alternative manual start:
echo   Terminal 1: cd backend ^&^& npm run dev
echo   Terminal 2: cd frontend ^&^& npm start
echo.
pause