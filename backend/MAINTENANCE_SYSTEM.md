# 🔧 Sistema de Mantenimiento - Guía de Instalación

## 📋 Resumen

Se ha implementado un sistema completo de gestión de solicitudes de mantenimiento que permite a los inquilinos reportar problemas en sus unidades y al personal administrativo gestionar y resolver estas solicitudes.

## 🗃️ Paso 1: Crear la tabla en la base de datos

Ejecuta el siguiente script SQL en PostgreSQL:

```bash
psql -U postgres -d apartamentos_db -f database/migrations/create_maintenance_requests.sql
```

O copia y pega el contenido del archivo `database/migrations/create_maintenance_requests.sql` en pgAdmin.

## ✅ Archivos creados

### Modelo
- `src/models/MaintenanceRequestModel.ts` - Definición del modelo Sequelize

### Repositorio
- `src/repositories/MaintenanceRepository.ts` - Acceso a datos con queries optimizados

### Controlador
- `src/controllers/MaintenanceController.ts` - Lógica de negocio

### Validadores
- `src/validators/maintenanceValidator.ts` - Validación de requests

### Rutas
- `src/routes/maintenance.ts` - Endpoints REST
- `src/routes/index.ts` - **ACTUALIZADO** con `/maintenance-requests`

### Asociaciones
- `src/models/associations.ts` - **ACTUALIZADO** con relaciones:
  - MaintenanceRequest → Unit
  - MaintenanceRequest → Tenant
  - MaintenanceRequest → User (assigned_to, resolved_by)

### Seed
- `src/scripts/seed.ts` - **ACTUALIZADO** con 5 solicitudes de ejemplo

## 🌐 Endpoints disponibles

### Listar solicitudes
```
GET /api/maintenance-requests
GET /api/maintenance-requests?status=pending
GET /api/maintenance-requests?priority=urgent
GET /api/maintenance-requests?unit_id=1
GET /api/maintenance-requests?tenant_id=1
GET /api/maintenance-requests?category=Plomería
```

### Filtros especiales
```
GET /api/maintenance-requests/pending       // Solo pendientes
GET /api/maintenance-requests/urgent        // Solo urgentes
GET /api/maintenance-requests/stats         // Estadísticas por categoría
GET /api/maintenance-requests/unit/:unitId  // Por unidad
GET /api/maintenance-requests/tenant/:tenantId  // Por inquilino
```

### Detalle de solicitud
```
GET /api/maintenance-requests/:id
```

### Crear solicitud (inquilino reporta problema)
```
POST /api/maintenance-requests
Body:
{
  "unit_id": 1,
  "tenant_id": 1,
  "title": "Fuga en el baño",
  "description": "El lavamanos presenta una fuga constante",
  "category": "Plomería",
  "priority": "high"  // opcional: low, medium, high, urgent
}
```

### Actualizar solicitud
```
PUT /api/maintenance-requests/:id
Body:
{
  "status": "in_progress",
  "assigned_to": 1,
  "scheduled_date": "2025-01-30",
  "estimated_cost": 150000,
  "notes": "Técnico asignado"
}
```

### Marcar como resuelta
```
POST /api/maintenance-requests/:id/resolve
Body:
{
  "resolved_by": 1,
  "actual_cost": 145000,
  "notes": "Fuga reparada exitosamente"
}
```

### Eliminar solicitud
```
DELETE /api/maintenance-requests/:id
```

## 📊 Categorías válidas

Las solicitudes deben usar una de estas categorías:
- Plomería
- Electricidad
- Pintura
- Carpintería
- Cerrajería
- Electrodomésticos
- Limpieza
- Aire Acondicionado
- Otros

## 🔐 Validaciones implementadas

- `unit_id` y `tenant_id` deben existir y estar activos
- `title` debe tener entre 5 y 255 caracteres
- `description` debe tener al menos 10 caracteres
- `category` debe ser una de las categorías válidas
- `priority` debe ser: low, medium, high, urgent
- `status` debe ser: pending, in_progress, completed, cancelled
- `resolved_by` debe existir al marcar como resuelta

## 📝 Datos de ejemplo en seed

Al ejecutar `npm run seed`, se crearán 5 solicitudes de ejemplo:

1. **Fuga en el baño** (high, pending) - Plomería
2. **Puerta principal no cierra** (medium, in_progress) - Cerrajería  
3. **Aire acondicionado no enfría** (medium, pending) - Aire Acondicionado
4. **Pintura manchada** (low, pending) - Pintura
5. **Toma corriente quemada** (urgent, completed) - Electricidad

## 🧪 Testing en Postman

### 1. Crear nueva solicitud
```
POST http://localhost:3000/api/maintenance-requests
{
  "unit_id": 1,
  "tenant_id": 1,
  "title": "Problema con el grifo de la cocina",
  "description": "El grifo gotea constantemente y necesita reparación urgente",
  "category": "Plomería",
  "priority": "high"
}
```

### 2. Listar pendientes
```
GET http://localhost:3000/api/maintenance-requests/pending
```

### 3. Actualizar estado
```
PUT http://localhost:3000/api/maintenance-requests/1
{
  "status": "in_progress",
  "assigned_to": 1,
  "notes": "Plomero en camino"
}
```

### 4. Resolver solicitud
```
POST http://localhost:3000/api/maintenance-requests/1/resolve
{
  "resolved_by": 1,
  "actual_cost": 80000,
  "notes": "Grifo reparado, se reemplazó empaque"
}
```

### 5. Ver estadísticas
```
GET http://localhost:3000/api/maintenance-requests/stats
```

## 🔄 Flujo típico

1. **Inquilino reporta** → POST con unit_id, tenant_id, descripción
2. **Admin revisa** → GET /pending
3. **Admin asigna** → PUT con assigned_to, scheduled_date
4. **Técnico trabaja** → PUT status = 'in_progress'
5. **Trabajo completo** → POST /resolve con actual_cost
6. **Auditoría** → Todas las operaciones se registran en audit_logs

## 📈 Consultas útiles

### Ver solicitudes urgentes sin asignar
```
GET /api/maintenance-requests?priority=urgent&assigned_to=null
```

### Ver historial de una unidad
```
GET /api/maintenance-requests/unit/1
```

### Ver solicitudes completadas este mes
```
GET /api/maintenance-requests?status=completed
```

## ✅ TODO completado

- [x] Modelo MaintenanceRequest creado
- [x] Repository con queries optimizados
- [x] Controller con todos los endpoints
- [x] Validadores completos
- [x] Rutas REST configuradas
- [x] Asociaciones con Unit, Tenant, User
- [x] Datos de ejemplo en seed
- [x] Auditoría automática
- [x] Documentación completa

## 🚀 Próximos pasos

1. Ejecutar migración SQL
2. Ejecutar `npm run seed` (creará 5 solicitudes de ejemplo)
3. Probar endpoints en Postman
4. Verificar en audit_logs que se registran las operaciones

¡Sistema de mantenimiento listo para usar! 🎉
