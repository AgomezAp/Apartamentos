# Script para crear la tabla maintenance_requests
# Ejecutar: .\create_maintenance_table.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔧 Creando tabla maintenance_requests..." -ForegroundColor Cyan

try {
    # Leer el archivo SQL
    $sqlScript = Get-Content "database\migrations\create_maintenance_requests.sql" -Raw
    
    # Ejecutar SQL
    $env:PGPASSWORD = "1234"
    $sqlScript | psql -U postgres -d apartamentos_db
    
    Write-Host "✅ Tabla maintenance_requests creada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Ahora puedes ejecutar el seed:" -ForegroundColor Yellow
    Write-Host "   npm run seed" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Endpoints disponibles:" -ForegroundColor Yellow
    Write-Host "   POST   /api/maintenance-requests" -ForegroundColor White
    Write-Host "   GET    /api/maintenance-requests" -ForegroundColor White
    Write-Host "   GET    /api/maintenance-requests/:id" -ForegroundColor White
    Write-Host "   PUT    /api/maintenance-requests/:id" -ForegroundColor White
    Write-Host "   POST   /api/maintenance-requests/:id/resolve" -ForegroundColor White
    Write-Host "   DELETE /api/maintenance-requests/:id" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error al crear la tabla: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solución alternativa:" -ForegroundColor Yellow
    Write-Host "   1. Abre pgAdmin" -ForegroundColor White
    Write-Host "   2. Conecta a la base de datos 'apartamentos_db'" -ForegroundColor White
    Write-Host "   3. Abre Query Tool" -ForegroundColor White
    Write-Host "   4. Copia el contenido de 'database/migrations/create_maintenance_requests.sql'" -ForegroundColor White
    Write-Host "   5. Ejecuta la query" -ForegroundColor White
    exit 1
}
