@echo off
REM Script para ejecutar la migración: agregar campo country a buildings
REM Windows Batch Script

echo Ejecutando migración: add_country_to_buildings.sql
echo.

REM Intentar con rutas comunes de PostgreSQL
SET PSQL_PATH=

if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" SET PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" SET PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" SET PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\13\bin\psql.exe" SET PSQL_PATH=C:\Program Files\PostgreSQL\13\bin\psql.exe

if "%PSQL_PATH%"=="" (
    echo No se encontró PostgreSQL en las rutas comunes.
    echo Por favor ejecuta manualmente:
    echo psql -U postgres -d apartamentos -f database/migrations/add_country_to_buildings.sql
    pause
    exit /b 1
)

echo Usando PostgreSQL en: %PSQL_PATH%
echo.

"%PSQL_PATH%" -U postgres -d apartamentos -f database\migrations\add_country_to_buildings.sql

if %errorlevel% equ 0 (
    echo.
    echo ✓ Migración ejecutada exitosamente!
) else (
    echo.
    echo ✗ Error al ejecutar la migración
)

pause
