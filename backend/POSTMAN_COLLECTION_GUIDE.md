# COLECCIÓN POSTMAN - ORDEN DE CREACIÓN

## 📋 ORDEN OBLIGATORIO (Crear en este orden después de reiniciar el servidor)

### 1️⃣ CATÁLOGOS (Crear PRIMERO) - `/api/catalogs`

#### **Unit Types** (Tipos de Unidad)
```
POST /api/catalogs/unit-types
{
  "name": "Apartamento",
  "description": "Unidad residencial estándar"
}
```
Otros tipos sugeridos:
- Penthouse
- Estudio
- Loft
- Dúplex
- Local Comercial
- Oficina
- Parqueadero
- Bodega

---

#### **Service Types** (Tipos de Servicio)
```
POST /api/catalogs/service-types
{
  "name": "Agua",
  "description": "Servicio de acueducto"
}
```
Otros tipos sugeridos:
- Electricidad
- Gas
- Internet
- Aseo
- Administración
- Parqueadero

---

#### **Payment Statuses** (Estados de Pago)
```
POST /api/catalogs/payment-statuses
{
  "name": "Pendiente",
  "description": "Pago pendiente de recibir",
  "color": "#FFA500"
}
```
Otros estados NECESARIOS:
- Pagado (color: #00FF00)
- Vencido (color: #FF0000)
- Parcial (color: #FFFF00)
- Cancelado (color: #808080)

---

#### **Alert Types** (Tipos de Alerta)
```
POST /api/catalogs/alert-types
{
  "name": "Pago Vencido",
  "description": "Alerta de pago vencido",
  "icon": "💰",
  "color": "#FF0000"
}
```
Otros tipos sugeridos:
- Contrato por Vencer (⏰, #FFA500)
- Unidad Desocupada (🏠, #FFFF00)
- Capacidad Máxima (⚠️, #FF0000)
- Mantenimiento (🔧, #0000FF)

---

#### **Users** (Usuarios)
```
POST /api/catalogs/users
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```
Roles disponibles: admin, manager, user

---

### 2️⃣ CATEGORÍAS DE GASTOS - `/api/expenses/categories`

```
POST /api/expenses/categories
{
  "name": "Mantenimiento",
  "description": "Gastos de mantenimiento del edificio"
}
```
Otras categorías sugeridas:
- Servicios Públicos
- Reparaciones
- Seguros
- Impuestos
- Limpieza
- Seguridad
- Jardinería
- Administración

---

### 3️⃣ EDIFICIOS - `/api/buildings`

```
POST /api/buildings
{
  "name": "Torre Central",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "state": "Cundinamarca",
  "postal_code": "110111",
  "total_floors": 15,
  "max_capacity": 60,
  "description": "Edificio moderno en zona norte",
  "construction_year": 2020
}
```

---

### 4️⃣ UNIDADES - `/api/units`

```
POST /api/units
{
  "building_id": 1,
  "unit_type_id": 1,
  "unit_number": "101",
  "floor": 1,
  "area": 85.5,
  "bedrooms": 3,
  "bathrooms": 2,
  "parking_spots": 1,
  "monthly_rent": 1500000,
  "admin_fee": 200000,
  "description": "Apartamento amoblado con vista",
  "is_occupied": false
}
```

---

### 5️⃣ INQUILINOS - `/api/tenants`

```
POST /api/tenants
{
  "document_type": "CC",
  "document_number": "1234567890",
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@email.com",
  "phone": "3001234567",
  "mobile_phone": "3001234567",
  "emergency_contact_name": "María Pérez",
  "emergency_contact_phone": "3009876543",
  "occupation": "Ingeniero",
  "company_name": "Tech Corp",
  "monthly_income": 5000000,
  "notes": "Buen historial crediticio"
}
```

---

### 6️⃣ CONTRATOS - `/api/contracts`

```
POST /api/contracts
{
  "unit_id": 1,
  "tenant_id": 1,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "monthly_rent": 1500000,
  "deposit": 1500000,
  "admin_fee": 200000,
  "payment_day": 5,
  "terms": "Contrato de arrendamiento estándar"
}
```

---

### 7️⃣ PAGOS - `/api/payments`

```
POST /api/payments
{
  "contract_id": 1,
  "payment_status_id": 1,
  "period_month": 1,
  "period_year": 2025,
  "due_date": "2025-01-05",
  "amount_due": 1700000,
  "notes": "Primer pago del año"
}
```

Para registrar pago:
```
PUT /api/payments/:id
{
  "amount_paid": 1700000,
  "payment_date": "2025-01-05",
  "payment_method": "Transferencia",
  "reference_number": "TRX123456",
  "payment_status_id": 2
}
```

---

### 8️⃣ GASTOS - `/api/expenses`

```
POST /api/expenses
{
  "building_id": 1,
  "category_id": 1,
  "description": "Reparación de ascensor",
  "amount": 500000,
  "expense_date": "2025-01-15",
  "payment_method": "Transferencia",
  "reference_number": "EXP001",
  "notes": "Mantenimiento preventivo"
}
```

---

### 9️⃣ ARCHIVOS - `/api/uploads`

**Subir comprobante de pago:**
```
POST /api/uploads/receipt
Content-Type: multipart/form-data
receipt: [archivo PDF/imagen]
```

**Subir contrato:**
```
POST /api/uploads/contract-document
Content-Type: multipart/form-data
contract: [archivo PDF]
```

**Subir ID de inquilino:**
```
POST /api/uploads/tenant-id
Content-Type: multipart/form-data
tenantId: [archivo PDF/imagen]
```

**Subir foto de edificio:**
```
POST /api/uploads/building-photo
Content-Type: multipart/form-data
photo: [archivo de imagen]
```

**Subir foto de unidad:**
```
POST /api/uploads/unit-photo
Content-Type: multipart/form-data
photo: [archivo de imagen]
```

---

## 📊 ENDPOINTS DE CONSULTA

### Dashboard
```
GET /api/dashboard
GET /api/dashboard/occupancy
GET /api/dashboard/payments
GET /api/dashboard/buildings
GET /api/dashboard/recent-activity
```

### Reportes
```
GET /api/reports/payments?building_id=1&start_date=2025-01-01&end_date=2025-12-31
GET /api/reports/occupancy?building_id=1
GET /api/reports/expenses?building_id=1&category_id=1
GET /api/reports/collections?year=2025&month=1
```

### Consultas con filtros
```
GET /api/buildings
GET /api/units?building_id=1&is_occupied=false
GET /api/tenants
GET /api/contracts?status=active&building_id=1
GET /api/payments?contract_id=1&status=pending
GET /api/expenses?building_id=1&start_date=2025-01-01
```

### Consultas específicas
```
GET /api/buildings/:id
GET /api/units/:id
GET /api/tenants/:id
GET /api/contracts/:id
GET /api/payments/:id
GET /api/expenses/:id
```

---

## 🔄 ORDEN CORRECTO DE ELIMINACIÓN (Inverso)

1. Payments (Pagos)
2. Contracts (Contratos)
3. Tenants (Inquilinos)
4. Units (Unidades)
5. Buildings (Edificios)
6. Expenses (Gastos)
7. Expense Categories (Categorías de gastos)
8. Catálogos (Unit Types, Service Types, Payment Statuses, Alert Types, Users)

---

## 🎯 ENDPOINTS COMPLETOS POR MÓDULO

### CATÁLOGOS - `/api/catalogs`
- `GET /api/catalogs/unit-types` - Listar tipos de unidad
- `POST /api/catalogs/unit-types` - Crear tipo de unidad
- `PUT /api/catalogs/unit-types/:id` - Actualizar tipo de unidad
- `DELETE /api/catalogs/unit-types/:id` - Desactivar tipo de unidad

- `GET /api/catalogs/service-types` - Listar tipos de servicio
- `POST /api/catalogs/service-types` - Crear tipo de servicio
- `PUT /api/catalogs/service-types/:id` - Actualizar tipo de servicio
- `DELETE /api/catalogs/service-types/:id` - Desactivar tipo de servicio

- `GET /api/catalogs/payment-statuses` - Listar estados de pago
- `POST /api/catalogs/payment-statuses` - Crear estado de pago
- `PUT /api/catalogs/payment-statuses/:id` - Actualizar estado de pago
- `DELETE /api/catalogs/payment-statuses/:id` - Desactivar estado de pago

- `GET /api/catalogs/alert-types` - Listar tipos de alerta
- `POST /api/catalogs/alert-types` - Crear tipo de alerta
- `PUT /api/catalogs/alert-types/:id` - Actualizar tipo de alerta
- `DELETE /api/catalogs/alert-types/:id` - Desactivar tipo de alerta

- `GET /api/catalogs/users` - Listar usuarios
- `POST /api/catalogs/users` - Crear usuario
- `PUT /api/catalogs/users/:id` - Actualizar usuario
- `DELETE /api/catalogs/users/:id` - Desactivar usuario

### EDIFICIOS - `/api/buildings`
- `GET /api/buildings` - Listar todos
- `GET /api/buildings/:id` - Obtener por ID
- `POST /api/buildings` - Crear
- `PUT /api/buildings/:id` - Actualizar
- `DELETE /api/buildings/:id` - Eliminar

### UNIDADES - `/api/units`
- `GET /api/units` - Listar todos
- `GET /api/units/:id` - Obtener por ID
- `GET /api/units/building/:buildingId` - Por edificio
- `POST /api/units` - Crear
- `PUT /api/units/:id` - Actualizar
- `DELETE /api/units/:id` - Eliminar

### INQUILINOS - `/api/tenants`
- `GET /api/tenants` - Listar todos
- `GET /api/tenants/:id` - Obtener por ID
- `POST /api/tenants` - Crear
- `PUT /api/tenants/:id` - Actualizar
- `DELETE /api/tenants/:id` - Eliminar

### CONTRATOS - `/api/contracts`
- `GET /api/contracts` - Listar todos
- `GET /api/contracts/:id` - Obtener por ID
- `POST /api/contracts` - Crear
- `PUT /api/contracts/:id` - Actualizar
- `PUT /api/contracts/:id/terminate` - Terminar contrato
- `DELETE /api/contracts/:id` - Eliminar

### PAGOS - `/api/payments`
- `GET /api/payments` - Listar todos
- `GET /api/payments/:id` - Obtener por ID
- `GET /api/payments/contract/:contractId` - Por contrato
- `POST /api/payments` - Crear
- `PUT /api/payments/:id` - Actualizar/Registrar pago
- `DELETE /api/payments/:id` - Eliminar

### GASTOS - `/api/expenses`
- `GET /api/expenses` - Listar todos
- `GET /api/expenses/:id` - Obtener por ID
- `GET /api/expenses/by-building/:id` - Por edificio
- `GET /api/expenses/summary/building/:id` - Resumen por edificio
- `GET /api/expenses/statistics` - Estadísticas
- `POST /api/expenses` - Crear
- `PUT /api/expenses/:id` - Actualizar
- `DELETE /api/expenses/:id` - Eliminar

- `GET /api/expenses/categories` - Listar categorías
- `GET /api/expenses/categories/:id` - Obtener categoría
- `POST /api/expenses/categories` - Crear categoría
- `PUT /api/expenses/categories/:id` - Actualizar categoría
- `DELETE /api/expenses/categories/:id` - Eliminar categoría

### ARCHIVOS - `/api/uploads`
- `POST /api/uploads/receipt` - Subir recibo
- `POST /api/uploads/contract-document` - Subir contrato
- `POST /api/uploads/tenant-id` - Subir ID inquilino
- `POST /api/uploads/building-photo` - Subir foto edificio
- `POST /api/uploads/unit-photo` - Subir foto unidad
- `GET /api/uploads/:type/:year/:month/:filename` - Obtener archivo
- `DELETE /api/uploads/:type/:year/:month/:filename` - Eliminar archivo

### DASHBOARD - `/api/dashboard`
- `GET /api/dashboard` - Resumen general
- `GET /api/dashboard/occupancy` - Ocupación
- `GET /api/dashboard/payments` - Estado de pagos
- `GET /api/dashboard/buildings` - Estado edificios
- `GET /api/dashboard/recent-activity` - Actividad reciente

### REPORTES - `/api/reports`
- `GET /api/reports/payments` - Reporte de pagos
- `GET /api/reports/occupancy` - Reporte de ocupación
- `GET /api/reports/expenses` - Reporte de gastos
- `GET /api/reports/collections` - Reporte de recaudos

### CONFIGURACIÓN - `/api/settings`
- `GET /api/settings` - Obtener configuraciones
- `PUT /api/settings/:key` - Actualizar configuración
