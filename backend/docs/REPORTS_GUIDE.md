# 📊 Guía de Reportes y Dashboard

## Descripción General

Sistema completo de reportes y analytics para la gestión de apartamentos. Proporciona estadísticas en tiempo real, análisis financiero, seguimiento de ocupación y métricas de desempeño.

---

## 🎯 Endpoints de Dashboard

### 1. Estadísticas Generales

**Endpoint:** `GET /api/dashboard/stats`

**Descripción:** Obtiene un resumen completo con las métricas principales del sistema.

**Respuesta de Ejemplo:**
```json
{
  "success": true,
  "data": {
    "totalBuildings": 5,
    "totalUnits": 120,
    "occupiedUnits": 95,
    "vacantUnits": 18,
    "maintenanceUnits": 5,
    "reservedUnits": 2,
    "occupancyRate": 79.17,
    "totalTenants": 95,
    "activeContracts": 95,
    "expiringContracts": 8,
    "currentMonthExpectedRevenue": 142500000,
    "currentMonthReceivedRevenue": 98750000,
    "overduePayments": 12
  }
}
```

**Métricas Incluidas:**
- `totalBuildings`: Total de edificios activos
- `totalUnits`: Total de unidades en el sistema
- `occupiedUnits`: Unidades con contratos activos
- `vacantUnits`: Unidades disponibles para arrendar
- `maintenanceUnits`: Unidades en mantenimiento
- `reservedUnits`: Unidades reservadas
- `occupancyRate`: Porcentaje de ocupación (%)
- `totalTenants`: Total de inquilinos activos
- `activeContracts`: Contratos vigentes
- `expiringContracts`: Contratos que vencen en 30 días
- `currentMonthExpectedRevenue`: Ingresos esperados del mes actual (COP)
- `currentMonthReceivedRevenue`: Ingresos recibidos del mes actual (COP)
- `overduePayments`: Pagos vencidos

---

### 2. Estadísticas por Edificio

**Endpoint:** `GET /api/dashboard/buildings`

**Descripción:** Obtiene métricas detalladas por cada edificio.

**Respuesta de Ejemplo:**
```json
{
  "success": true,
  "data": [
    {
      "building_id": 1,
      "building_name": "Torre Central",
      "total_units": 30,
      "occupied_units": 25,
      "vacant_units": 3,
      "maintenance_units": 2,
      "occupancy_rate": 83.33,
      "total_rental_value": 45000000
    },
    {
      "building_id": 2,
      "building_name": "Edificio Norte",
      "total_units": 24,
      "occupied_units": 20,
      "vacant_units": 4,
      "maintenance_units": 0,
      "occupancy_rate": 83.33,
      "total_rental_value": 36000000
    }
  ]
}
```

**Campos:**
- `building_id`: ID del edificio
- `building_name`: Nombre del edificio
- `total_units`: Total de unidades
- `occupied_units`: Unidades ocupadas
- `vacant_units`: Unidades vacantes
- `maintenance_units`: Unidades en mantenimiento
- `occupancy_rate`: Tasa de ocupación (%)
- `total_rental_value`: Valor total de arriendo (COP)

---

### 3. Ingresos por Mes

**Endpoint:** `GET /api/dashboard/revenue?months=12`

**Descripción:** Obtiene tendencia de ingresos de los últimos N meses.

**Parámetros Query:**
- `months` (opcional): Número de meses a consultar (1-24). Default: 12

**Respuesta de Ejemplo:**
```json
{
  "success": true,
  "data": [
    {
      "month": "2024-01",
      "expected_revenue": 140000000,
      "received_revenue": 135000000,
      "collection_rate": 96.43
    },
    {
      "month": "2024-02",
      "expected_revenue": 140000000,
      "received_revenue": 138000000,
      "collection_rate": 98.57
    },
    {
      "month": "2024-03",
      "expected_revenue": 142500000,
      "received_revenue": 98750000,
      "collection_rate": 69.30
    }
  ]
}
```

**Campos:**
- `month`: Mes en formato YYYY-MM
- `expected_revenue`: Ingresos esperados (COP)
- `received_revenue`: Ingresos recibidos (COP)
- `collection_rate`: Tasa de recaudo (%)

**Ejemplo de Uso:**
```bash
# Últimos 12 meses
curl http://localhost:3010/api/dashboard/revenue?months=12

# Últimos 6 meses
curl http://localhost:3010/api/dashboard/revenue?months=6
```

---

### 4. Top Inquilinos

**Endpoint:** `GET /api/dashboard/top-tenants?limit=10`

**Descripción:** Obtiene los inquilinos más puntuales en sus pagos.

**Parámetros Query:**
- `limit` (opcional): Número de inquilinos a retornar (1-50). Default: 10

**Respuesta de Ejemplo:**
```json
{
  "success": true,
  "data": [
    {
      "tenant_id": 15,
      "tenant_name": "María González",
      "total_payments": 24,
      "on_time_payments": 24,
      "punctuality_rate": 100.00
    },
    {
      "tenant_id": 8,
      "tenant_name": "Carlos Rodríguez",
      "total_payments": 18,
      "on_time_payments": 17,
      "punctuality_rate": 94.44
    }
  ]
}
```

**Campos:**
- `tenant_id`: ID del inquilino
- `tenant_name`: Nombre completo del inquilino
- `total_payments`: Total de pagos realizados
- `on_time_payments`: Pagos realizados a tiempo
- `punctuality_rate`: Tasa de puntualidad (%)

**Nota:** Solo incluye inquilinos con al menos 3 pagos registrados.

---

## 📈 Endpoints de Reportes

### 1. Resumen Financiero

**Endpoint:** `GET /api/reports/financial-summary?startDate=2024-01-01&endDate=2024-12-31`

**Descripción:** Análisis financiero completo con ingresos esperados vs recibidos.

**Parámetros Query (opcionales):**
- `startDate`: Fecha de inicio (YYYY-MM-DD)
- `endDate`: Fecha de fin (YYYY-MM-DD)

**Respuesta de Ejemplo:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_expected": 1710000000,
      "total_received": 1580000000,
      "total_pending": 130000000,
      "collection_rate": 92.40
    },
    "paymentStatus": [
      {
        "status": "Completado",
        "count": 285,
        "total_amount": 1580000000
      },
      {
        "status": "Pendiente",
        "count": 45,
        "total_amount": 95000000
      },
      {
        "status": "Parcial",
        "count": 12,
        "total_amount": 35000000
      }
    ]
  }
}
```

**Casos de Uso:**
- Revisión financiera mensual
- Análisis de cartera vencida
- Proyección de ingresos

---

### 2. Reporte de Ocupación

**Endpoint:** `GET /api/reports/occupancy-rate`

**Descripción:** Análisis detallado de ocupación por edificio con cálculo de ingresos perdidos.

**Respuesta de Ejemplo:**
```json
{
  "success": true,
  "data": [
    {
      "building_id": 1,
      "building_name": "Torre Central",
      "total_units": 30,
      "occupied_units": 25,
      "vacant_units": 3,
      "maintenance_units": 2,
      "occupancy_rate": 83.33,
      "potential_monthly_income": 45000000,
      "current_monthly_income": 37500000,
      "lost_revenue": 7500000
    }
  ]
}
```

**Campos:**
- `potential_monthly_income`: Ingresos si todas las unidades estuvieran ocupadas
- `current_monthly_income`: Ingresos actuales
- `lost_revenue`: Ingresos perdidos por vacancia

**Casos de Uso:**
- Identificar oportunidades de arrendamiento
- Optimización de estrategias de mercadeo
- Análisis de rentabilidad por edificio

---

### 3. Reporte de Estado de Pagos

**Endpoint:** `GET /api/reports/payment-status?year=2024&month=3`

**Descripción:** Lista detallada de todos los pagos con su estado actual.

**Parámetros Query (opcionales):**
- `year`: Año a filtrar
- `month`: Mes a filtrar (1-12)

**Respuesta de Ejemplo:**
```json
{
  "success": true,
  "data": [
    {
      "payment_id": 125,
      "building_name": "Torre Central",
      "unit_number": "301",
      "tenant_name": "Juan Pérez",
      "amount_due": 1500000,
      "amount_paid": 1500000,
      "payment_status": "Completado",
      "due_date": "2024-03-05",
      "paid_date": "2024-03-03",
      "days_overdue": null
    },
    {
      "payment_id": 126,
      "building_name": "Edificio Norte",
      "unit_number": "205",
      "tenant_name": "María González",
      "amount_due": 1200000,
      "amount_paid": 0,
      "payment_status": "Vencido",
      "due_date": "2024-03-05",
      "paid_date": null,
      "days_overdue": 22
    }
  ]
}
```

**Campos:**
- `days_overdue`: Días de mora (null si está al día)
- `payment_status`: Estado del pago (Pendiente, Parcial, Completado, Vencido)

**Casos de Uso:**
- Gestión de cobranza
- Identificación de pagos vencidos
- Seguimiento de pagos parciales

---

### 4. Historial de Inquilino

**Endpoint:** `GET /api/reports/tenant-history/15`

**Descripción:** Perfil completo de un inquilino con todos sus contratos, pagos y estadísticas.

**Parámetros:**
- `id` (path): ID del inquilino

**Respuesta de Ejemplo:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "tenant_id": 15,
      "full_name": "María González",
      "email": "maria.gonzalez@email.com",
      "mobile_phone": "3012345678",
      "document_type": "CC",
      "document_number": "1234567890"
    },
    "contracts": [
      {
        "contract_id": 45,
        "building_name": "Torre Central",
        "unit_number": "301",
        "start_date": "2022-06-01",
        "end_date": "2024-06-01",
        "monthly_rent": 1500000,
        "contract_status": "Activo"
      }
    ],
    "payments": [
      {
        "payment_id": 125,
        "month": "2024-03",
        "amount_due": 1500000,
        "amount_paid": 1500000,
        "status": "Completado",
        "paid_date": "2024-03-03"
      }
    ],
    "transactions": [
      {
        "transaction_id": 78,
        "amount": 1500000,
        "transaction_method": "Transferencia",
        "transaction_date": "2024-03-03"
      }
    ],
    "statistics": {
      "total_contracts": 2,
      "total_payments": 24,
      "on_time_payments": 24,
      "late_payments": 0,
      "punctuality_rate": 100.00,
      "total_paid": 36000000
    }
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "Inquilino no encontrado"
}
```

**Casos de Uso:**
- Atención al cliente
- Evaluación de renovación de contrato
- Análisis de comportamiento de pago

---

### 5. Unidades Vacantes

**Endpoint:** `GET /api/reports/vacant-units`

**Descripción:** Reporte de todas las unidades vacantes con cálculo de ingresos perdidos.

**Respuesta de Ejemplo:**
```json
{
  "success": true,
  "data": [
    {
      "unit_id": 45,
      "building_name": "Torre Central",
      "unit_number": "405",
      "unit_type": "Apartamento 2 habitaciones",
      "rental_price": 1800000,
      "last_contract_end": "2024-01-15",
      "days_vacant": 45,
      "estimated_lost_revenue": 2700000
    },
    {
      "unit_id": 52,
      "building_name": "Edificio Norte",
      "unit_number": "302",
      "unit_type": "Apartamento 3 habitaciones",
      "rental_price": 2200000,
      "last_contract_end": null,
      "days_vacant": null,
      "estimated_lost_revenue": 0
    }
  ],
  "summary": {
    "totalVacant": 18,
    "totalLostRevenue": 15400000,
    "averageDaysVacant": 28
  }
}
```

**Campos:**
- `days_vacant`: Días desde que terminó el último contrato (null si nunca tuvo contrato)
- `estimated_lost_revenue`: Ingresos perdidos calculados como (precio_renta / 30 * días_vacantes)

**Casos de Uso:**
- Priorización de arrendamientos
- Análisis de rotación
- Optimización de precios

---

## 🔍 Consultas SQL Destacadas

### Cálculo de Tasa de Ocupación
```sql
SELECT 
  building_id,
  COUNT(*) as total_units,
  SUM(CASE WHEN occupation_status = 'Ocupada' THEN 1 ELSE 0 END) as occupied_units,
  ROUND((SUM(CASE WHEN occupation_status = 'Ocupada' THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 2) as occupancy_rate
FROM units
GROUP BY building_id
```

### Cálculo de Tasa de Recaudo
```sql
SELECT 
  SUM(amount_due) as total_expected,
  SUM(amount_paid) as total_received,
  ROUND((SUM(amount_paid)::numeric / NULLIF(SUM(amount_due), 0)) * 100, 2) as collection_rate
FROM payments
WHERE EXTRACT(YEAR FROM due_date) = 2024
  AND EXTRACT(MONTH FROM due_date) = 3
```

### Identificación de Pagos Vencidos
```sql
SELECT 
  *,
  CASE 
    WHEN payment_status IN ('Pendiente', 'Parcial') AND due_date < CURRENT_DATE 
    THEN (CURRENT_DATE - due_date)
    ELSE NULL 
  END as days_overdue
FROM payments
WHERE payment_status IN ('Pendiente', 'Parcial')
ORDER BY due_date ASC
```

---

## 📊 Mejores Prácticas

### 1. Monitoreo Diario
- Revisar `GET /api/dashboard/stats` cada mañana
- Verificar `overduePayments` para gestión de cobranza
- Monitorear `expiringContracts` para renovaciones

### 2. Análisis Mensual
- Ejecutar `GET /api/reports/financial-summary` al cerrar el mes
- Revisar `collection_rate` y comparar con metas
- Analizar `GET /api/reports/payment-status` para identificar patrones

### 3. Planificación Trimestral
- Evaluar `GET /api/dashboard/revenue?months=3` para tendencias
- Revisar `GET /api/reports/occupancy-rate` para estrategias de mercadeo
- Analizar `GET /api/reports/vacant-units` para ajustes de precio

### 4. Gestión de Inquilinos
- Consultar `GET /api/dashboard/top-tenants` para identificar mejores inquilinos
- Usar `GET /api/reports/tenant-history/:id` antes de renovaciones
- Priorizar atención a inquilinos con alta `punctuality_rate`

---

## 🚀 Casos de Uso Avanzados

### Escenario 1: Cierre Mensual
```bash
# 1. Obtener resumen financiero del mes
curl "http://localhost:3010/api/reports/financial-summary?startDate=2024-03-01&endDate=2024-03-31"

# 2. Revisar pagos pendientes
curl "http://localhost:3010/api/reports/payment-status?year=2024&month=3"

# 3. Verificar tasa de recaudo
curl "http://localhost:3010/api/dashboard/revenue?months=1"
```

### Escenario 2: Optimización de Vacancia
```bash
# 1. Identificar unidades vacantes
curl "http://localhost:3010/api/reports/vacant-units"

# 2. Revisar ocupación por edificio
curl "http://localhost:3010/api/reports/occupancy-rate"

# 3. Calcular ingresos potenciales
# Usar lost_revenue de occupancy-rate
```

### Escenario 3: Evaluación de Inquilino
```bash
# 1. Obtener historial completo
curl "http://localhost:3010/api/reports/tenant-history/15"

# 2. Verificar si está en top inquilinos
curl "http://localhost:3010/api/dashboard/top-tenants?limit=50"

# 3. Revisar pagos recientes
curl "http://localhost:3010/api/reports/payment-status?year=2024&month=3"
```

---

## 🔮 Mejoras Futuras

### Exportación de Datos
- ✅ Respuestas JSON implementadas
- ⏳ Exportación a PDF (pendiente)
- ⏳ Exportación a Excel (pendiente)
- ⏳ Envío automático por email (pendiente)

### Reportes Programados
- ⏳ Reporte diario de pagos vencidos
- ⏳ Reporte semanal de ocupación
- ⏳ Reporte mensual financiero automático

### Análisis Predictivo
- ⏳ Predicción de pagos atrasados
- ⏳ Tendencias de ocupación
- ⏳ Proyección de ingresos

### Dashboards Personalizados
- ⏳ Configuración de métricas por usuario
- ⏳ Alertas personalizadas
- ⏳ Comparación entre períodos

---

## 📝 Notas Técnicas

### Rendimiento
- Las consultas del dashboard están optimizadas con índices en `building_id`, `unit_id`, `tenant_id`
- Los reportes usan agregaciones SQL directas (no ORM) para máximo rendimiento
- Todas las tasas se calculan con `ROUND(... , 2)` para exactitud

### Formato de Datos
- Fechas: YYYY-MM-DD (ISO 8601)
- Montos: Enteros en COP (pesos colombianos)
- Porcentajes: Decimales con 2 posiciones (ej: 95.67)

### Validaciones
- `months`: 1-24 (dashboard/revenue)
- `limit`: 1-50 (dashboard/top-tenants)
- `year`: 2000-2100 (reports/payment-status)
- `month`: 1-12 (reports/payment-status)
- `tenant_id`: Debe existir en la base de datos

### Códigos de Error
- `400`: Parámetros inválidos
- `404`: Recurso no encontrado (ej: tenant_id inválido)
- `500`: Error del servidor/base de datos

---

## 📞 Soporte

Para dudas sobre los reportes:
1. Revisar esta guía completa
2. Verificar ejemplos de respuesta
3. Consultar casos de uso avanzados
4. Revisar validaciones de parámetros

---

**Última actualización:** Diciembre 2024  
**Versión del Sistema:** 1.0.0  
**Base de Datos:** PostgreSQL 14+
