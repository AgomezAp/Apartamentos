@echo off
echo ========================================
echo INSTALACION - SISTEMA DE GESTION INMOBILIARIA
echo ========================================
echo.

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Descarga Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo.

echo [2/5] Verificando MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ADVERTENCIA: MySQL no encontrado en PATH
    echo Asegurate de que MySQL este instalado
    echo.
)

echo [3/5] Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)
cd ..
echo.

echo [4/5] Configurando variables de entorno...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Archivo .env creado desde .env.example
    echo IMPORTANTE: Edita backend\.env con tus credenciales de MySQL
) else (
    echo Archivo .env ya existe
)
echo.

echo [5/5] Creando estructura de base de datos...
echo.
echo INSTRUCCIONES PARA MYSQL:
echo 1. Abre MySQL Workbench o usa la linea de comandos
echo 2. Ejecuta: CREATE DATABASE inmobiliaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo 3. Importa el archivo: backend\database\schema.sql
echo.
echo Comando para linea de comandos:
echo mysql -u root -p -e "CREATE DATABASE inmobiliaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo mysql -u root -p inmobiliaria ^< backend\database\schema.sql
echo.

echo ========================================
echo INSTALACION COMPLETADA
echo ========================================
echo.
echo PROXIMOS PASOS:
echo 1. Edita backend\.env con tus credenciales de MySQL
echo 2. Crea la base de datos e importa el schema
echo 3. Ejecuta: cd backend
echo 4. Ejecuta: npm run dev
echo.
echo El servidor estara en: http://localhost:3000
echo.
pause
