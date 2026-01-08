# 📮 Colección Postman - Sistema Gestión Apartamentos

## 📁 Archivos generados

- **Apartamentos_API.postman_collection.json** - Colección completa con todos los endpoints
- **Apartamentos_Local.postman_environment.json** - Variables de entorno para desarrollo local

## 🚀 Cómo importar en Postman

### 1️⃣ Importar la Colección
1. Abre Postman
2. Click en **Import** (botón superior izquierdo)
3. Selecciona el archivo `Apartamentos_API.postman_collection.json`
4. Click en **Import**

### 2️⃣ Importar el Ambiente
1. En Postman, click en **Environments** (ícono de engranaje arriba a la derecha)
2. Click en **Import**
3. Selecciona el archivo `Apartamentos_Local.postman_environment.json`
4. Activa el ambiente "Apartamentos - Local" desde el dropdown superior derecho

## 📋 Endpoints disponibles

### Health Check
- `GET /api/health` - Verificar estado de la API

### 🏢 Buildings (Edificios)
- `GET /api/buildings` - Listar todos con paginación
- `GET /api/buildings/:id` - Obtener por ID (incluye estadísticas)
- `POST /api/buildings` - Crear edificio
- `PUT /api/buildings/:id` - Actualizar edificio
- `DELETE /api/buildings/:id` - Eliminar edificio (soft delete)

### 🏠 Units (Unidades/Apartamentos)
- `GET /api/units` - Listar todas con paginación
- `GET /api/units/vacant` - Solo unidades vacantes
- `GET /api/units/reports/vacancy` - Reporte de vacancia con días
- `GET /api/units/:id` - Obtener por ID
- `POST /api/units` - Crear unidad
- `PUT /api/units/:id` - Actualizar unidad
- `DELETE /api/units/:id` - Eliminar unidad

### � Tenants (Inquilinos)
- `GET /api/tenants` - Listar todos con paginación
- `GET /api/tenants/:id` - Obtener por ID
- `POST /api/tenants` - Crear inquilino
- `PUT /api/tenants/:id` - Actualizar inquilino
- `DELETE /api/tenants/:id` - Eliminar inquilino

### �📄 Contracts (Contratos)
- `GET /api/contracts` - Listar todos con filtros
- `GET /api/contracts/expiring?days=30` - Contratos próximos a vencer
- `GET /api/contracts/:id` - Obtener por ID
- `POST /api/contracts` - Crear contrato (genera pagos automáticos)
- `PUT /api/contracts/:id` - Actualizar contrato
- `POST /api/contracts/:id/finish` - Finalizar contrato

### 💰 Payments (Pagos)
- `GET /api/payments` - Listar todos con filtros
- `GET /api/payments/overdue` - Pagos vencidos
- `GET /api/payments/:id` - Obtener por ID (incluye transacciones)
- `POST /api/payments` - Crear pago manualmente
- `POST /api/payments/generate-monthly` - Generar pago mensual automático
- `PUT /api/payments/:id` - Actualizar pago
- `POST /api/payments/:id/transactions` - Agregar transacción/abono

### 📤 Uploads (Subida de Archivos)
- `POST /api/uploads/receipt` - Subir comprobante de pago (multipart/form-data)
- `GET /api/uploads/receipt/:year/:month/:filename` - Descargar/ver comprobante

## 🔧 Configuración previa

### Iniciar el servidor
```bash
cd backend
npm start
```

El servidor debe estar corriendo en `http://localhost:3011`

### Verificar que funciona
Ejecuta primero el request **Health Check**. Deberías recibir:
```json
{
  "success": true,
  "message": "API funcionando correctamente"
}
```

## 📝 Flujo de prueba sugerido

### 1. Crear un edificio
```http
POST /api/buildings
```
```json
{
  "name": "Torre Central",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "state": "Cundinamarca",
  "total_floors": 15,
  "construction_year": 2020
}
```
**Anota el `id` del edificio creado**

### 2. Crear una unidad en ese edificio
```http
POST /api/units
```
```json
{
  "building_id": 1,
  "unit_type_id": 1,
  "unit_number": "101",
  "floor": 1,
  "bedrooms": 2,
  "bathrooms": 2,
  "rental_price": 1200000,
  "occupation_status": "vacant"
}
```
**Anota el `id` de la unidad creada**

### 3. Crear un inquilino (Tenant)
⚠️ **IMPORTANTE**: Debes crear el inquilino ANTES de crear el contrato.

```http
POST /api/tenants
```
```json
{
  "document_type": "CC",
  "document_number": "1234567890",
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@email.com",
  "phone": "6012345678",
  "mobile_phone": "3101234567",
  "emergency_contact_name": "María Pérez",
  "emergency_contact_phone": "3109876543",
  "occupation": "Ingeniero",
  "company_name": "Tech Corp",
  "monthly_income": 5000000
}
```
**Anota el `id` del inquilino creado**

### 4. Crear un contrato
Ahora sí puedes crear el contrato referenciando al inquilino:

```http
POST /api/contracts
```
```json
{
  "unit_id": 1,
  "tenant_id": 1,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "monthly_rent": 1200000,
  "deposit_amount": 1200000,
  "payment_day": 5,
  "status": "active"
}
```

Esto generará automáticamente los **12 pagos mensuales** del año.

### 5. Consultar pagos generados
```http
GET /api/payments?contract_id=1
```

### 6. Registrar un pago con comprobante

#### Paso 6.1: Subir el comprobante
```http
POST /api/uploads/receipt
```
**Tipo:** `multipart/form-data`  
**Campo:** `receipt` (tipo File)

En Postman:
1. Selecciona Body → form-data
2. Agrega un campo llamado `receipt`
3. Cambia el tipo a `File` (dropdown a la derecha)
4. Selecciona un archivo (JPG, PNG, GIF o PDF - Máx 5MB)

**Respuesta:**
```json
{
  "success": true,
  "message": "Archivo subido exitosamente",
  "data": {
    "filename": "comprobante_20250127_143055_abc123.pdf",
    "path": "/uploads/receipts/2025/01/comprobante_20250127_143055_abc123.pdf",
    "size": 245678
  }
}
```

#### Paso 6.2: Registrar la transacción con el comprobante
Copia el valor de `data.path` de la respuesta anterior y úsalo en `receipt_file_path`:

```http
POST /api/payments/1/transactions
```
```json
{
  "amount": 1200000,
  "transaction_date": "2025-01-05",
  "payment_method": "transferencia",
  "reference_number": "TRX-001",
  "receipt_file_path": "/uploads/receipts/2025/01/comprobante_20250127_143055_abc123.pdf",
  "notes": "Transferencia Bancolombia - Enero 2025"
}
```

#### Paso 6.3: Ver/Descargar el comprobante
```http
GET /api/uploads/receipt/2025/01/comprobante_20250127_143055_abc123.pdf
```

O abre directamente en el navegador:
```
http://localhost:3011/api/uploads/receipt/2025/01/comprobante_20250127_143055_abc123.pdf
```

**📋 Nota:** Consulta [UPLOAD_TESTING_GUIDE.md](./UPLOAD_TESTING_GUIDE.md) para guía completa de pruebas de subida de archivos.

## 🎯 Filtros y Paginación

### Paginación
Agregar query params:
- `page=1` - Número de página (default: 1)
- `limit=10` - Registros por página (default: 10)

Ejemplo:
```
GET /api/buildings?page=2&limit=20
```

### Filtros en Contracts
- `status=active` - Filtrar por estado (active, finished, cancelled, pending)
- `unit_id=1` - Filtrar por unidad
- `tenant_id=1` - Filtrar por arrendatario

Ejemplo:
```
GET /api/contracts?status=active&page=1&limit=10
```

### Filtros en Payments
- `contract_id=1` - Pagos de un contrato
- `status=Pendiente` - Filtrar por estado
- `year=2025` - Filtrar por año
- `month=1` - Filtrar por mes

Ejemplo:
```
GET /api/payments?contract_id=1&status=Pendiente
```

## 🐛 Troubleshooting

### Error: "Cannot connect to server"
- Verificar que el servidor esté corriendo (`npm start` en backend)
- Verificar que el puerto sea `3011`
- Verificar que PostgreSQL esté corriendo

### Error 404: "Route not found"
- Verificar que la URL tenga `/api/` antes del endpoint
- Ejemplo correcto: `http://localhost:3011/api/buildings`

### Error 500: "Database error"
- Verificar que PostgreSQL esté corriendo
- Verificar la conexión en `.env`: `DATABASE_URL=postgres://alejandroap:0Ub9g5b(_exN@185.137.92.54:5432/apartamentos`
- Revisar logs del servidor en la terminal

### Error: "tenant_id not found"
- Necesitas crear primero un arrendatario en la tabla `tenants`
- Puedes hacerlo directamente en PostgreSQL o esperar a que se cree el endpoint

## 📊 Respuestas de la API

### Respuesta exitosa
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Respuesta con paginación
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Respuesta de error
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

## 🔐 Notas importantes

1. **Sequelize Sync**: Al iniciar el servidor, Sequelize verifica/crea las tablas automáticamente
2. **Audit Trail**: Los endpoints POST/PUT/DELETE registran auditoría en `audit_logs`
3. **Soft Delete**: Los DELETE no borran registros, solo marcan `is_active = false`
4. **Auto-generation**: Al crear un contrato con `status=active`, se generan pagos mensuales automáticamente
5. **Transacciones**: Al agregar una transacción, se actualiza `amount_paid` y el `payment_status_id` automáticamente si se completa

## 📞 Soporte

Si encuentras errores o necesitas agregar nuevos endpoints, reporta con:
- Request URL completa
- Body enviado (JSON)
- Respuesta recibida
- Logs del servidor

---

**Versión:** 1.0  
**Fecha:** 24 de diciembre de 2025  
**Puerto:** 3011  
**Base URL:** http://localhost:3011/api
