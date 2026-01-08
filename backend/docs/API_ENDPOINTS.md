# 📚 Documentación de la API REST

## Información General

- **Base URL**: `http://localhost:3000/api`
- **Formato de respuesta**: JSON
- **Autenticación**: Bearer Token (implementación pendiente)

## Formato de Respuesta Estándar

### Respuesta Exitosa
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Operación exitosa",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

---

## 🏢 EDIFICIOS (`/buildings`)

### 1. Listar Edificios
```
GET /api/buildings?page=1&limit=10&sortBy=name&sortOrder=ASC
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `sortBy` (opcional): Campo para ordenar
- `sortOrder` (opcional): ASC o DESC

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Edificio Central",
      "address": "Calle 123 #45-67",
      "city": "Bogotá",
      "total_units": 20,
      "max_capacity": 20,
      "is_active": true
    }
  ],
  "pagination": { /* ... */ }
}
```

### 2. Obtener Edificio por ID
```
GET /api/buildings/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Edificio Central",
    "address": "Calle 123 #45-67",
    "total_units_count": 20,
    "occupied_units_count": 15,
    "vacant_units_count": 5,
    "active_contracts_count": 15,
    "monthly_income": 30000000
  }
}
```

### 3. Crear Edificio
```
POST /api/buildings
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Edificio Norte",
  "address": "Avenida 80 #12-34",
  "city": "Medellín",
  "state": "Antioquia",
  "postal_code": "050001",
  "total_floors": 10,
  "total_units": 40,
  "max_capacity": 40,
  "description": "Edificio residencial moderno",
  "construction_year": 2020
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": { /* edificio creado */ },
  "message": "Edificio creado exitosamente"
}
```

### 4. Actualizar Edificio
```
PUT /api/buildings/:id
Content-Type: application/json
```

**Body:** (solo incluir campos a actualizar)
```json
{
  "name": "Edificio Norte - Actualizado",
  "max_capacity": 45
}
```

### 5. Eliminar Edificio (Soft Delete)
```
DELETE /api/buildings/:id
```

---

## 🏠 UNIDADES (`/units`)

### 1. Listar Unidades
```
GET /api/units?building_id=1&page=1&limit=10
```

**Query Parameters:**
- `building_id` (opcional): Filtrar por edificio
- `page`, `limit`, `sortBy`, `sortOrder`

### 2. Obtener Unidad por ID
```
GET /api/units/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "building_id": 1,
    "building_name": "Edificio Central",
    "unit_type_id": 1,
    "unit_type_name": "Apartamento",
    "unit_number": "101",
    "floor": 1,
    "area_sqm": 80.5,
    "bedrooms": 3,
    "bathrooms": 2,
    "rental_price": 2000000,
    "is_occupied": true,
    "occupation_status": "occupied"
  }
}
```

### 3. Crear Unidad
```
POST /api/units
```

**Body:**
```json
{
  "building_id": 1,
  "unit_type_id": 1,
  "unit_number": "102",
  "floor": 1,
  "area_sqm": 85.0,
  "bedrooms": 3,
  "bathrooms": 2,
  "rental_price": 2100000,
  "description": "Apartamento con vista al parque",
  "features": {
    "balcony": true,
    "parking": 1,
    "storage": true
  }
}
```

### 4. Actualizar Unidad
```
PUT /api/units/:id
```

### 5. Eliminar Unidad
```
DELETE /api/units/:id
```

### 6. Obtener Unidades Desocupadas
```
GET /api/units/vacant?building_id=1
```

### 7. Reporte de Desocupación
```
GET /api/units/reports/vacancy
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "unit_number": "205",
      "building_name": "Edificio Central",
      "unit_type": "Apartamento",
      "rental_price": 2000000,
      "last_occupied_date": "2024-08-15",
      "days_vacant": 130
    }
  ]
}
```

---

## 📝 CONTRATOS (`/contracts`)

### 1. Listar Contratos
```
GET /api/contracts?status=active&unit_id=1&tenant_id=5
```

**Query Parameters:**
- `status`: active, finished, cancelled, pending
- `unit_id`: Filtrar por unidad
- `tenant_id`: Filtrar por arrendatario

### 2. Obtener Contrato por ID
```
GET /api/contracts/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "contract_number": "CNT-2024-001",
    "unit_id": 1,
    "unit_number": "101",
    "building_name": "Edificio Central",
    "tenant_id": 1,
    "tenant_name": "Juan Pérez",
    "tenant_email": "juan@example.com",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "monthly_rent": 2000000,
    "deposit_amount": 2000000,
    "payment_day": 5,
    "status": "active"
  }
}
```

### 3. Crear Contrato
```
POST /api/contracts
```

**Body:**
```json
{
  "unit_id": 1,
  "tenant_id": 1,
  "contract_number": "CNT-2024-002",
  "start_date": "2024-01-15",
  "end_date": "2024-07-15",
  "monthly_rent": 2000000,
  "deposit_amount": 2000000,
  "payment_day": 5,
  "status": "active",
  "notes": "Contrato de 6 meses",
  "has_rent_increase": true,
  "rent_increase_percentage": 5.0,
  "rent_increase_frequency_months": 6
}
```

> **Nota:** Al crear un contrato con `status: "active"`, se generan automáticamente los pagos mensuales.

### 4. Actualizar Contrato
```
PUT /api/contracts/:id
```

### 5. Finalizar Contrato
```
POST /api/contracts/:id/finish
```

**Efecto:** Cambia el estado a "finished" y marca la unidad como desocupada.

### 6. Contratos Próximos a Vencer
```
GET /api/contracts/expiring?days=30
```

**Query Parameters:**
- `days` (opcional): Días hacia adelante (default: 30)

---

## 💰 PAGOS (`/payments`)

### 1. Listar Pagos
```
GET /api/payments?contract_id=1&status=Pendiente&year=2024&month=12
```

**Query Parameters:**
- `contract_id`: Filtrar por contrato
- `status`: Pagado, Pendiente, Vencido, Parcial
- `year`: Año del período
- `month`: Mes del período (1-12)

### 2. Obtener Pago por ID
```
GET /api/payments/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "contract_id": 1,
    "contract_number": "CNT-2024-001",
    "unit_number": "101",
    "building_name": "Edificio Central",
    "tenant_name": "Juan Pérez",
    "period_month": 12,
    "period_year": 2024,
    "due_date": "2024-12-05",
    "payment_date": "2024-12-03",
    "amount_due": 2000000,
    "amount_paid": 2000000,
    "balance": 0,
    "status_name": "Pagado",
    "transactions": [
      {
        "id": 1,
        "transaction_date": "2024-12-03",
        "amount": 2000000,
        "payment_method": "Transferencia",
        "reference_number": "TRX-123456"
      }
    ]
  }
}
```

### 3. Crear Pago
```
POST /api/payments
```

**Body:**
```json
{
  "contract_id": 1,
  "payment_status_id": 2,
  "period_month": 1,
  "period_year": 2025,
  "due_date": "2025-01-05",
  "amount_due": 2000000
}
```

### 4. Actualizar Pago
```
PUT /api/payments/:id
```

### 5. Registrar Transacción (Pago Parcial)
```
POST /api/payments/:id/transactions
```

**Body:**
```json
{
  "transaction_date": "2024-12-15",
  "amount": 1000000,
  "payment_method": "Efectivo",
  "reference_number": "REC-001",
  "notes": "Pago parcial del arriendo"
}
```

> **Nota:** Actualiza automáticamente el `amount_paid` y `balance` del pago principal.

### 6. Pagos Vencidos
```
GET /api/payments/overdue
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "payment_id": 15,
      "due_date": "2024-11-05",
      "amount_due": 2000000,
      "amount_paid": 500000,
      "balance": 1500000,
      "days_overdue": 48,
      "unit_number": "305",
      "building_name": "Edificio Norte",
      "tenant_name": "María González",
      "tenant_email": "maria@example.com"
    }
  ]
}
```

### 7. Generar Pago Mensual
```
POST /api/payments/generate-monthly
```

**Body:**
```json
{
  "contract_id": 1,
  "year": 2025,
  "month": 2
}
```

---

## 🔔 ALERTAS

### Estados de Pago

| ID | Nombre    | Descripción              |
|----|-----------|--------------------------|
| 1  | Pagado    | Pago completado          |
| 2  | Pendiente | Pago pendiente           |
| 3  | Vencido   | Pago vencido             |
| 4  | Parcial   | Pago parcial realizado   |

### Tipos de Alerta

1. **Unidad Desocupada**: Cuando una unidad queda vacía
2. **Capacidad Máxima**: Edificio alcanza su capacidad
3. **Contrato por Vencer**: 30 días antes del vencimiento
4. **Pago Vencido**: Pago atrasado
5. **Unidad Desocupada Prolongada**: >60 días desocupada

---

## ⚙️ Configuración del Sistema

### Settings Disponibles

```sql
SELECT * FROM system_settings;
```

| setting_key                        | Valor Default | Descripción                           |
|-----------------------------------|---------------|---------------------------------------|
| alert_vacant_unit_threshold_days  | 60            | Días para alerta de desocupación      |
| alert_contract_expiry_days        | 30            | Días antes de vencer contrato         |
| alert_payment_due_days            | 5             | Días antes de vencimiento de pago     |

---

## 🔐 Auditoría

Todas las operaciones CREATE, UPDATE, DELETE se registran automáticamente en `audit_logs`.

**Consultar Logs:**
```sql
SELECT * FROM audit_logs 
WHERE table_name = 'contracts' 
  AND record_id = 1 
ORDER BY created_at DESC;
```

---

## 📊 Triggers Automáticos

### 1. Actualización de Ocupación
Cuando un contrato se activa/finaliza, la unidad cambia automáticamente su estado de ocupación.

### 2. Actualización de Estado de Pago
El estado del pago se actualiza automáticamente según el balance:
- Balance = 0 → **Pagado**
- Balance > 0 y amount_paid > 0 → **Parcial**
- Due date < hoy → **Vencido**
- Otros → **Pendiente**

---

## 🚨 Códigos de Error

| Código | Descripción                    |
|--------|--------------------------------|
| 400    | Bad Request - Datos inválidos  |
| 401    | No autorizado                  |
| 404    | Recurso no encontrado          |
| 409    | Conflicto - Duplicado          |
| 500    | Error interno del servidor     |

---

## 📝 Notas de Desarrollo

- Usa **prepared statements** para prevenir SQL injection
- Todas las fechas están en formato ISO 8601
- Los valores monetarios son decimales (12,2)
- La paginación usa offset-based pagination
- CORS está habilitado para desarrollo

---

## 🔄 Próximas Implementaciones

- [ ] Autenticación JWT
- [ ] Endpoints de Arrendatarios
- [ ] Endpoints de Gastos
- [ ] Endpoints de Servicios
- [ ] Dashboard con estadísticas
- [ ] Generación de reportes PDF
- [ ] Upload de archivos
