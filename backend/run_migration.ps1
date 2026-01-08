# Script PowerShell para ejecutar la migración de buildings
# Uso: .\run_migration.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Migración: Agregar campo 'country'" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Rutas comunes de PostgreSQL
$postgresqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $postgresqlPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ No se encontró PostgreSQL en las rutas comunes" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, ejecuta manualmente desde pgAdmin o psql:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres -d apartamentos -f database/migrations/add_country_to_buildings.sql" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "✓ PostgreSQL encontrado en:" -ForegroundColor Green
Write-Host "  $psqlPath" -ForegroundColor Gray
Write-Host ""

# Ejecutar migración
Write-Host "Ejecutando migración..." -ForegroundColor Yellow
$migrationFile = Join-Path $PSScriptRoot "database\migrations\add_country_to_buildings.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ No se encontró el archivo de migración" -ForegroundColor Red
    Write-Host "  Buscado en: $migrationFile" -ForegroundColor Gray
    Read-Host "Presiona Enter para salir"
    exit 1
}

try {
    & $psqlPath -U postgres -d apartamentos -f $migrationFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ ¡Migración ejecutada exitosamente!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Error al ejecutar la migración (código: $LASTEXITCODE)" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Presiona Enter para salir"
