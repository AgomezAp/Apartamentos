# 🔍 Búsqueda y Filtros Avanzados - API Documentation

## Descripción General

El sistema ahora incluye endpoints de búsqueda avanzada para **Units**, **Tenants**, **Payments** y **Contracts** con múltiples filtros, ordenamiento y paginación.

---

## 📦 1. Units (Unidades) - Búsqueda Avanzada

### Endpoint
```
GET /api/units/search
```

### Parámetros de Query

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `search` | string | Búsqueda en número de unidad, descripción o nombre de edificio | `apartamento` |
| `city` | string | Filtrar por ciudad del edificio | `Bogota` |
| `minPrice` | number | Precio mínimo de renta | `800000` |
| `maxPrice` | number | Precio máximo de renta | `1500000` |
| `status` | string | Estado de ocupación: `vacant`, `occupied`, `maintenance` | `vacant` |
| `building_id` | number | ID del edificio | `1` |
| `bedrooms` | number | Número de habitaciones | `2` |
| `bathrooms` | number | Número de baños | `1` |
| `minArea` | number | Área mínima en m² | `50` |
| `maxArea` | number | Área máxima en m² | `100` |
| `page` | number | Número de página (default: 1) | `1` |
| `limit` | number | Resultados por página (default: 10) | `20` |

### Ejemplos de Uso

#### Buscar apartamentos en Bogotá entre $800,000 y $1,500,000
```http
GET /api/units/search?search=apartamento&city=Bogota&minPrice=800000&maxPrice=1500000
```

#### Buscar unidades vacantes con 2 habitaciones
```http
GET /api/units/search?status=vacant&bedrooms=2
```

#### Buscar por área entre 50 y 100 m²
```http
GET /api/units/search?minArea=50&maxArea=100&page=1&limit=20
```

### Respuesta
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "building_id": 1,
      "unit_number": "101",
      "floor": 1,
      "area_sqm": 75,
      "bedrooms": 2,
      "bathrooms": 1,
      "rental_price": 1200000,
      "occupation_status": "vacant",
      "building_name": "Edificio Central",
      "building_city": "Bogota"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "filters": {
    "search": "apartamento",
    "city": "Bogota",
    "minPrice": 800000,
    "maxPrice": 1500000
  }
}
```

---

## 👥 2. Tenants (Inquilinos) - Búsqueda Avanzada

### Endpoint
```
GET /api/tenants/search
```

### Parámetros de Query

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `search` | string | Búsqueda en nombre, apellido, email, teléfono o documento | `Juan` |
| `documentType` | string | Tipo de documento: `CC`, `CE`, `NIT`, `Pasaporte` | `CC` |
| `status` | string | Estado del inquilino: `active` (con contrato activo), `inactive` (sin contrato) | `active` |
| `occupation` | string | Ocupación/profesión | `Ingeniero` |
| `minIncome` | number | Ingreso mensual mínimo | `2000000` |
| `maxIncome` | number | Ingreso mensual máximo | `5000000` |
| `page` | number | Número de página | `1` |
| `limit` | number | Resultados por página | `10` |

### Ejemplos de Uso

#### Buscar inquilinos activos con CC
```http
GET /api/tenants/search?search=Juan&documentType=CC&status=active
```

#### Buscar por rango de ingresos
```http
GET /api/tenants/search?minIncome=2000000&maxIncome=5000000
```

#### Buscar ingenieros sin contrato activo
```http
GET /api/tenants/search?occupation=Ingeniero&status=inactive
```

### Respuesta
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "document_type": "CC",
      "document_number": "1234567890",
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan.perez@email.com",
      "phone": "3001234567",
      "occupation": "Ingeniero",
      "monthly_income": 3500000,
      "contract_status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  },
  "filters": {
    "search": "Juan",
    "documentType": "CC",
    "status": "active"
  }
}
```

---

## 💰 3. Payments (Pagos) - Búsqueda Avanzada

### Endpoint
```
GET /api/payments/search
```

### Parámetros de Query

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `status` | string | Estado del pago: `Pendiente`, `Pagado`, `Vencido`, `overdue` (vencidos) | `overdue` |
| `fromDate` | string | Fecha de vencimiento desde (YYYY-MM-DD) | `2025-01-01` |
| `toDate` | string | Fecha de vencimiento hasta (YYYY-MM-DD) | `2025-12-31` |
| `building_id` | number | ID del edificio | `1` |
| `tenant_id` | number | ID del inquilino | `5` |
| `contract_id` | number | ID del contrato | `10` |
| `minAmount` | number | Monto mínimo | `500000` |
| `maxAmount` | number | Monto máximo | `2000000` |
| `overdueDays` | number | Días de mora mínimos | `30` |

### Ejemplos de Uso

#### Buscar pagos vencidos en 2025
```http
GET /api/payments/search?status=overdue&fromDate=2025-01-01&toDate=2025-12-31
```

#### Buscar pagos por edificio con más de 30 días de mora
```http
GET /api/payments/search?building_id=1&overdueDays=30
```

#### Buscar pagos pendientes en rango de monto
```http
GET /api/payments/search?status=Pendiente&minAmount=500000&maxAmount=2000000
```

### Respuesta
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "contract_id": 10,
      "period_month": 1,
      "period_year": 2025,
      "amount_due": 1200000,
      "amount_paid": 0,
      "due_date": "2025-01-05",
      "status_name": "Vencido",
      "tenant_name": "Juan Pérez",
      "unit_number": "101",
      "building_name": "Edificio Central",
      "balance": 1200000,
      "days_overdue": 25
    }
  ],
  "total": 15,
  "filters": {
    "status": "overdue",
    "fromDate": "2025-01-01",
    "toDate": "2025-12-31"
  }
}
```

---

## 📝 4. Contracts (Contratos) - Búsqueda Avanzada con Ordenamiento

### Endpoint
```
GET /api/contracts/search
```

### Parámetros de Query

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `building_id` | number | ID del edificio | `1` |
| `status` | string | Estado: `active`, `finished`, `cancelled` | `active` |
| `tenant_id` | number | ID del inquilino | `5` |
| `unit_id` | number | ID de la unidad | `10` |
| `fromDate` | string | Fecha de inicio desde (YYYY-MM-DD) | `2025-01-01` |
| `toDate` | string | Fecha de inicio hasta (YYYY-MM-DD) | `2025-12-31` |
| `minRent` | number | Renta mensual mínima | `800000` |
| `maxRent` | number | Renta mensual máxima | `2000000` |
| `expiringInDays` | number | Contratos que vencen en X días | `30` |
| `sortBy` | string | Campo de ordenamiento: `start_date`, `end_date`, `monthly_rent`, `building_name`, `tenant_name`, `status` | `end_date` |
| `order` | string | Orden: `asc`, `desc` | `asc` |

### Ejemplos de Uso

#### Buscar contratos activos ordenados por fecha de vencimiento
```http
GET /api/contracts/search?building_id=1&status=active&sortBy=end_date&order=asc
```

#### Buscar contratos que vencen en 30 días
```http
GET /api/contracts/search?status=active&expiringInDays=30
```

#### Buscar por rango de renta y ordenar por monto
```http
GET /api/contracts/search?minRent=800000&maxRent=2000000&sortBy=monthly_rent&order=desc
```

### Respuesta
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "unit_id": 10,
      "tenant_id": 5,
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "monthly_rent": 1200000,
      "status": "active",
      "unit_number": "101",
      "building_id": 1,
      "building_name": "Edificio Central",
      "tenant_name": "Juan Pérez",
      "tenant_email": "juan.perez@email.com",
      "urgency_status": "active",
      "days_until_expiry": 300
    }
  ],
  "total": 10,
  "filters": {
    "building_id": 1,
    "status": "active",
    "sortBy": "end_date",
    "order": "asc"
  }
}
```

---

## 🎯 Casos de Uso Comunes

### 1. Dashboard de Pagos Atrasados por Edificio
```http
GET /api/payments/search?building_id=1&status=overdue&overdueDays=15
```

### 2. Buscar Unidades Disponibles para Familia
```http
GET /api/units/search?status=vacant&bedrooms=3&bathrooms=2&city=Bogota&minArea=80
```

### 3. Inquilinos con Buenos Ingresos para Nueva Unidad
```http
GET /api/tenants/search?status=inactive&minIncome=3000000
```

### 4. Contratos por Renovar este Mes
```http
GET /api/contracts/search?status=active&expiringInDays=30&sortBy=end_date&order=asc
```

### 5. Análisis de Rentas Altas en un Edificio
```http
GET /api/contracts/search?building_id=1&status=active&minRent=1500000&sortBy=monthly_rent&order=desc
```

---

## 📊 Ventajas de la Búsqueda Avanzada

✅ **Filtros Combinables**: Puedes combinar múltiples filtros para búsquedas muy específicas
✅ **Paginación**: Resultados optimizados con soporte de paginación
✅ **Ordenamiento**: Control total sobre el orden de los resultados (contracts)
✅ **Performance**: Queries optimizados con índices en PostgreSQL
✅ **Flexibilidad**: Campos opcionales - usa solo lo que necesites

---

## 🔧 Notas Técnicas

- Todos los filtros son **opcionales**
- La búsqueda por texto (`search`) usa **ILIKE** (case-insensitive)
- Los filtros de fecha usan formato **ISO 8601** (YYYY-MM-DD)
- Los filtros numéricos aceptan **decimales** para mayor precisión
- El estado `overdue` en payments se calcula en **tiempo real**
- El campo `urgency_status` en contracts se calcula dinámicamente

---

## 📌 Próximas Mejoras Planificadas

- [ ] Exportar resultados de búsqueda a PDF/Excel
- [ ] Guardar búsquedas favoritas
- [ ] Búsqueda por rango de fechas más flexible
- [ ] Filtros por características personalizadas (features JSON)
- [ ] Full-text search con PostgreSQL
