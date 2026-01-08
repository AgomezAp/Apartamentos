# 📦 Archivos de Postman Generados

## ✅ Se han creado 3 archivos en `/backend`:

### 1. 📮 Apartamentos_API.postman_collection.json
**Colección completa con 28 requests organizados:**

#### Health Check (1 endpoint)
- ✅ Verificar estado de la API

#### Buildings - Edificios (5 endpoints)
- 📋 GET - Listar todos (con paginación)
- 🔍 GET - Obtener por ID (con estadísticas)
- ➕ POST - Crear edificio
- ✏️ PUT - Actualizar edificio
- 🗑️ DELETE - Eliminar edificio (soft delete)

#### Units - Unidades/Apartamentos (7 endpoints)
- 📋 GET - Listar todas (con paginación y filtro por edificio)
- 🏠 GET - Unidades vacantes
- 📊 GET - Reporte de vacancia (con días vacantes)
- 🔍 GET - Obtener por ID
- ➕ POST - Crear unidad
- ✏️ PUT - Actualizar unidad
- 🗑️ DELETE - Eliminar unidad

#### Contracts - Contratos (6 endpoints)
- 📋 GET - Listar todos (con filtros: status, unit_id, tenant_id)
- ⏰ GET - Contratos próximos a vencer
- 🔍 GET - Obtener por ID
- ➕ POST - Crear contrato (auto-genera pagos mensuales)
- ✏️ PUT - Actualizar contrato
- ✔️ POST - Finalizar contrato

#### Payments - Pagos (7 endpoints)
- 📋 GET - Listar todos (con filtros: contract_id, status, year, month)
- 🔴 GET - Pagos vencidos
- 🔍 GET - Obtener por ID (incluye transacciones)
- ➕ POST - Crear pago manualmente
- 🤖 POST - Generar pago mensual automático
- ✏️ PUT - Actualizar pago
- 💸 POST - Agregar transacción/abono

---

### 2. 🌍 Apartamentos_Local.postman_environment.json
**Variables de entorno para desarrollo local:**
- `base_url`: http://localhost:3011
- `api_version`: v1

---

### 3. 📖 POSTMAN_README.md
**Documentación completa que incluye:**
- Instrucciones de importación
- Lista de todos los endpoints
- Flujo de prueba sugerido paso a paso
- Ejemplos de requests/responses
- Filtros y paginación
- Troubleshooting
- Notas importantes

---

## 🚀 Cómo usar

### Paso 1: Importar en Postman
1. Abre Postman
2. Click en **Import**
3. Arrastra los 2 archivos JSON:
   - `Apartamentos_API.postman_collection.json`
   - `Apartamentos_Local.postman_environment.json`

### Paso 2: Activar ambiente
1. Selecciona "Apartamentos - Local" en el dropdown de ambientes (esquina superior derecha)

### Paso 3: Verificar servidor
El servidor está corriendo en: **http://localhost:3011** ✅

Ejecuta el request **Health Check** para confirmar.

---

## 📊 Estado del servidor actual

```
✅ Servidor ejecutándose en http://localhost:3011
✅ Sequelize sincronizó 9 tablas
✅ PostgreSQL conectado
✅ Servicio de alertas activo
```

---

## 🎯 Flujo de prueba recomendado

### 1️⃣ Health Check
```http
GET http://localhost:3011/api/health
```
Respuesta esperada:
```json
{
  "success": true,
  "message": "API funcionando correctamente"
}
```

### 2️⃣ Crear un edificio
```http
POST http://localhost:3011/api/buildings
Content-Type: application/json

{
  "name": "Torre Central",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "state": "Cundinamarca",
  "total_floors": 15,
  "construction_year": 2020
}
```

### 3️⃣ Listar edificios
```http
GET http://localhost:3011/api/buildings?page=1&limit=10
```

### 4️⃣ Crear una unidad
```http
POST http://localhost:3011/api/units
Content-Type: application/json

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

### 5️⃣ Ver unidades vacantes
```http
GET http://localhost:3011/api/units/vacant
```

### 6️⃣ Crear contrato (requiere tenant_id existente)
```http
POST http://localhost:3011/api/contracts
Content-Type: application/json

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
**Esto genera automáticamente 12 pagos mensuales** 🚀

### 7️⃣ Consultar pagos del contrato
```http
GET http://localhost:3011/api/payments?contract_id=1
```

### 8️⃣ Registrar un pago
```http
POST http://localhost:3011/api/payments/1/transactions
Content-Type: application/json

{
  "amount": 1200000,
  "transaction_date": "2025-01-05",
  "payment_method": "transferencia",
  "reference_number": "TRX-001"
}
```

---

## ⚠️ Notas importantes

### Datos de prueba necesarios
Para probar contratos necesitas:
- ✅ Un edificio creado (`building_id`)
- ✅ Una unidad creada (`unit_id`)
- ❗ Un arrendatario en la BD (`tenant_id`)

**Solución temporal para tenant:**
Inserta manualmente en PostgreSQL:
```sql
INSERT INTO tenants (document_type, document_number, first_name, last_name, email, phone)
VALUES ('CC', '1234567890', 'Juan', 'Pérez', 'juan@example.com', '3001234567');
```

### Funcionalidades automáticas
1. **Al crear contrato con status='active'**: Se generan todos los pagos mensuales automáticamente
2. **Al agregar transacción**: Se actualiza `amount_paid` del pago automáticamente
3. **Si amount_paid >= amount_due**: Se cambia el estado a "Pagado" automáticamente
4. **DELETE endpoints**: Son soft delete (marcan `is_active = false`)

---

## 📞 Reportar problemas

Al probar, si encuentras errores reporta:
1. ✅ Request URL completa
2. ✅ Body enviado (JSON)
3. ✅ Respuesta recibida
4. ✅ Logs del servidor en la terminal

---

**Todo listo para probar!** 🎉

Importa los archivos en Postman y empieza con el Health Check.
