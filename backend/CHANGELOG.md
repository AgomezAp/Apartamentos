# Changelog - Sistema de Gestión de Apartamentos

## [1.3.0] - 2025-01-27

### ✨ Nueva Funcionalidad: Sistema de Subida de Archivos

#### Agregado
- **Multer** instalado para manejo de archivos (`multer@1.4.5-lts.1`)
- **Configuración de multer** en `src/config/multer.ts` con:
  - Almacenamiento en disco en `uploads/receipts/{año}/{mes}/`
  - Validación de tipos de archivo (JPG, PNG, GIF, PDF)
  - Límite de tamaño de 5MB
  - Generación automática de nombres únicos (timestamp + random)
  - Creación automática de carpetas por año y mes

- **UploadController** en `src/controllers/UploadController.ts`:
  - `uploadReceipt()` - Sube archivos y retorna metadata
  - `getReceipt()` - Sirve archivos para descarga/visualización

- **Rutas de upload** en `src/routes/uploads.ts`:
  - `POST /api/uploads/receipt` - Subir comprobante
  - `GET /api/uploads/receipt/:year/:month/:filename` - Descargar comprobante

- **Integración** en `src/routes/index.ts`:
  - Rutas de upload registradas en router principal

- **Estructura de carpetas**:
  - Creado `uploads/receipts/` con `.gitkeep`
  - Actualizado `.gitignore` para ignorar archivos pero mantener estructura

- **Documentación**:
  - `UPLOAD_TESTING_GUIDE.md` - Guía completa de pruebas con Postman y cURL
  - Actualizado `POSTMAN_README.md` con sección de Uploads
  - Actualizado `Apartamentos_API.postman_collection.json` con folder Uploads

#### Modificado
- **PaymentRepository.ts**: Método `addTransaction()` ahora acepta `receipt_file_path` como parámetro opcional
- **interfaces/index.ts**: Interface `PaymentTransaction` ahora incluye `receipt_file_path?: string`
- **Migración ejecutada**: Campo `receipt_file_path` agregado a tabla `payment_transactions`

#### Características
- ✅ Validación automática de tipo de archivo
- ✅ Validación de tamaño (máx 5MB)
- ✅ Nombres únicos para evitar colisiones
- ✅ Organización por año/mes
- ✅ Manejo de errores robusto
- ✅ Soporte para PDFs e imágenes

---

## [1.2.0] - 2025-01-26

### ✨ Contratos con Duración Flexible

#### Modificado
- **ContractController.ts**: 
  - Generación de pagos ahora es dinámica basada en fechas de contrato
  - Calcula meses entre `start_date` y `end_date`
  - Genera exactamente N pagos según duración (no siempre 12)
  - Mensaje de respuesta incluye cantidad de pagos generados

#### Ejemplos
- Contrato 4 meses → Genera 4 pagos
- Contrato 6 meses → Genera 6 pagos
- Contrato 12 meses → Genera 12 pagos

#### Documentación
- Creado `COMPROBANTES_README.md` con explicación detallada
- Ejemplos de contratos con diferentes duraciones

---

## [1.1.0] - 2025-01-25

### ✨ CRUD de Inquilinos (Tenants)

#### Agregado
- **TenantRepository** completo en `src/repositories/TenantRepository.ts`:
  - `findAll()` con paginación
  - `findById()`
  - `findByDocument()` para validar duplicados
  - `create()`
  - `update()`
  - `delete()` (soft delete)
  - `count()`

- **TenantController** en `src/controllers/TenantController.ts`:
  - Validaciones completas
  - Verificación de existencia antes de update/delete
  - Prevención de documentos duplicados

- **Rutas de tenants** en `src/routes/tenants.ts`:
  - `GET /api/tenants` - Listar con paginación
  - `GET /api/tenants/:id` - Obtener por ID
  - `POST /api/tenants` - Crear
  - `PUT /api/tenants/:id` - Actualizar
  - `DELETE /api/tenants/:id` - Eliminar (soft)

#### Documentación
- Actualizado `POSTMAN_README.md` con flujo de Tenants
- Actualizado `Apartamentos_API.postman_collection.json` con folder Tenants (5 endpoints)

---

## [1.0.1] - 2025-01-24

### 🐛 Corrección de Errores SQL

#### Corregido
- **UnitRepository**:
  - `ut.type_name` → `ut.name AS type_name` (columna correcta)
  
- **ContractRepository**:
  - `t.full_name` → `CONCAT(t.first_name, ' ', t.last_name) AS tenant_name`
  - Removido filtro `is_active` inexistente en tabla contracts
  - Corregido JOIN con tenants

#### Impacto
- Todos los métodos de contratos ahora funcionan correctamente
- Queries de unidades retornan tipo correctamente

---

## [1.0.0] - 2025-01-23

### 🐛 Corrección de Bug Crítico: "Edificio no encontrado"

#### Problema
Operaciones de actualización y eliminación retornaban error "No encontrado" aunque la operación se ejecutaba correctamente.

#### Causa
`executeQuery()` retornaba solo `result.rows`, lo que hacía que `result.rowCount` fuera `undefined` en los repositorios.

#### Solución
- Creado `executeUpdate()` en `src/config/database.ts`:
  - Retorna `result.rowCount` en lugar de `result.rows`
  - Específico para operaciones UPDATE y DELETE

#### Modificado
- **BuildingRepository**: Métodos `update()` y `delete()` usan `executeUpdate()`
- **ContractRepository**: Métodos `update()` y `finish()` usan `executeUpdate()`
- **PaymentRepository**: Método `update()` usa `executeUpdate()`
- **UnitRepository**: Métodos `update()` y `delete()` usan `executeUpdate()`

#### Resultado
✅ UPDATE/DELETE ahora retornan mensajes correctos basados en `rowCount`
✅ Verificación de existencia funciona correctamente
✅ Mensajes de error y éxito apropiados

---

## [0.9.0] - 2025-01-22

### 🎉 Release Inicial

#### Funcionalidades
- CRUD completo de Edificios
- CRUD completo de Unidades
- CRUD completo de Contratos
- Sistema de Pagos con transacciones
- Generación automática de pagos mensuales
- Reportes de vacancia
- Contratos próximos a vencer
- Audit logs automáticos
- Soft delete en todos los recursos

#### Tecnologías
- Node.js 18+
- TypeScript 5.3.3
- Express 4.18.2
- PostgreSQL 14+
- Sequelize 6.x + pg 8.11.3
- Winston (logging)

#### API
- 30+ endpoints RESTful
- Paginación en todos los listados
- Filtros avanzados
- Validaciones robustas

---

## Leyenda

- ✨ Nueva funcionalidad
- 🐛 Corrección de bug
- 📝 Documentación
- ⚡ Mejora de rendimiento
- 🔧 Configuración
- 🗄️ Base de datos
- 🚨 Breaking change

---

## Roadmap

### Próximas versiones

#### v1.4.0 (Planeado)
- [ ] Autenticación JWT
- [ ] Roles y permisos
- [ ] Soft delete en archivos

#### v1.5.0 (Planeado)
- [ ] Dashboard con estadísticas
- [ ] Reportes en PDF
- [ ] Notificaciones por email

#### v2.0.0 (Futuro)
- [ ] Migración a cloud storage (AWS S3)
- [ ] Compresión automática de imágenes
- [ ] Sistema de backup automatizado
- [ ] API webhooks
