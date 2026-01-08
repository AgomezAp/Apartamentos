# 🌱 Script de Seed - Datos Iniciales

Este script poblará la base de datos con datos de prueba para que puedas probar todos los endpoints de la API.

## 📋 Qué Datos Crea

### 1. **Catálogos (Datos de Referencia)**
- ✅ 9 Tipos de Unidad (Apartamento, Penthouse, Estudio, etc.)
- ✅ 7 Tipos de Servicio (Agua, Electricidad, Gas, etc.)
- ✅ 5 Estados de Pago (Pendiente, Pagado, Vencido, etc.)
- ✅ 4 Tipos de Alerta
- ✅ 2 Usuarios (admin y manager)

### 2. **Categorías de Gastos**
- ✅ 10 Categorías (Mantenimiento, Seguridad, Limpieza, etc.)

### 3. **Edificios**
- ✅ Torre Central (15 pisos, 60 unidades)
- ✅ Edificio Los Andes (10 pisos, 40 unidades)
- ✅ Residencias del Parque (8 pisos, 32 unidades)

### 4. **Unidades**
- ✅ 100 unidades totales
- ✅ Incluye Penthouses, apartamentos estándar
- ✅ Diferentes características (balcón, vista, etc.)

### 5. **Inquilinos**
- ✅ 5 inquilinos de prueba con datos completos

### 6. **Contratos**
- ✅ 5 contratos activos
- ✅ Fechas 2025-01-01 a 2025-12-31

### 7. **Pagos**
- ✅ 15 pagos (3 meses × 5 contratos)
- ✅ Enero pagado, Febrero y Marzo pendientes
- ✅ Incluye transacciones de pago

### 8. **Gastos**
- ✅ 3 gastos de ejemplo (mantenimiento, vigilancia, pintura)

## 🚀 Cómo Ejecutar

### Opción 1: Con npm script (recomendado)
```bash
npm run seed
```

### Opción 2: Directamente con ts-node
```bash
npx ts-node src/scripts/seed.ts
```

### Opción 3: Compilar y ejecutar
```bash
tsc
node dist/scripts/seed.js
```

## ⚠️ Importante

1. **Ejecuta el servidor primero** para que las tablas existan:
   ```bash
   npm run dev
   ```
   Espera a que veas: `✅ Todas las tablas sincronizadas correctamente`

2. **Detén el servidor** antes de ejecutar el seed (para evitar conflictos de conexión)

3. El script es **idempotente** en catálogos (usa `ON CONFLICT DO NOTHING`), pero creará duplicados en edificios, unidades, etc. si lo ejecutas múltiples veces.

## 👥 Usuarios Creados

Puedes usar estos usuarios para probar autenticación (cuando se implemente JWT):

| Email | Password | Nombre |
|-------|----------|--------|
| admin@apartamentos.com | admin123 | Administrador Sistema |
| manager@apartamentos.com | manager123 | Gerente Operaciones |

## 📊 Después del Seed

Puedes probar estos endpoints en Postman:

### Catálogos
- `GET /api/catalogs/unit-types` - Ver tipos de unidad
- `GET /api/catalogs/payment-statuses` - Ver estados de pago

### Edificios y Unidades
- `GET /api/buildings` - Ver los 3 edificios
- `GET /api/units` - Ver las 100 unidades
- `GET /api/units/vacant` - Ver unidades disponibles

### Inquilinos y Contratos
- `GET /api/tenants` - Ver los 5 inquilinos
- `GET /api/contracts` - Ver los 5 contratos activos

### Pagos
- `GET /api/payments` - Ver todos los pagos
- `GET /api/payments/overdue` - Ver pagos vencidos (habrá algunos)

### Gastos
- `GET /api/expenses` - Ver gastos registrados
- `GET /api/expenses/categories` - Ver categorías

### Dashboard
- `GET /api/dashboard/stats` - Ver estadísticas generales
- `GET /api/dashboard/buildings` - Ver stats por edificio

## 🔄 Limpiar y Volver a Ejecutar

Si quieres limpiar todo y empezar de nuevo:

```sql
-- Ejecuta esto en tu cliente PostgreSQL
TRUNCATE TABLE 
  payment_transactions, 
  payments, 
  contracts, 
  tenants, 
  units, 
  buildings,
  expenses,
  expense_categories,
  alert_types,
  payment_statuses,
  service_types,
  unit_types,
  users
RESTART IDENTITY CASCADE;
```

Luego ejecuta `npm run seed` de nuevo.

## 🐛 Solución de Problemas

### Error: "No se encontró el estado de pago Pendiente"
- Asegúrate de que el servidor haya creado las tablas correctamente
- Verifica que `payment_statuses` existe: `SELECT * FROM payment_statuses;`

### Error: "relation does not exist"
- El servidor no ha sincronizado las tablas
- Inicia el servidor con `npm run dev` y espera a que sincronice

### Error: "duplicate key value"
- Estás ejecutando el seed múltiples veces
- Limpia la base de datos primero (ver sección anterior)

## 📝 Notas

- Los datos son **ficticios** y solo para pruebas
- Las contraseñas están **sin encriptar** (se encriptarán cuando se implemente JWT)
- Los emails son de ejemplo y no funcionan
- Los números de teléfono son inventados
