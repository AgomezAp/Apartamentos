# 🚀 Guía de Instalación Rápida - PostgreSQL

## ✅ Sistema Migrado a PostgreSQL

El sistema ha sido migrado completamente de MySQL a **PostgreSQL** y utiliza una sola variable de entorno para la conexión a la base de datos.

## 📋 Requisitos Previos

- **Node.js** 18+ instalado
- Acceso a una base de datos **PostgreSQL** (local o remota)

## ⚡ Instalación en 5 Pasos

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

El archivo `.env` ya está configurado con:

```env
DATABASE_URL=postgres://alejandroap:0Ub9g5b(_exN@185.137.92.54:5432/apartamentos
PORT=3010
CORS_ORIGIN=*
```

**Nota:** La base de datos está en tu servidor remoto (185.137.92.54:5432)

### 3. Crear las Tablas en PostgreSQL

Ejecuta el script SQL en tu servidor PostgreSQL:

```bash
# Opción 1: Si tienes psql instalado localmente
psql "postgres://alejandroap:0Ub9g5b(_exN@185.137.92.54:5432/apartamentos" -f database/schema_postgres.sql

# Opción 2: Copiar el archivo schema_postgres.sql y ejecutarlo manualmente en tu servidor
```

El archivo `database/schema_postgres.sql` contiene:
- ✅ 24 tablas
- ✅ 3 vistas optimizadas
- ✅ 2 triggers automáticos
- ✅ 40+ índices para rendimiento
- ✅ Datos iniciales (seed data)

### 4. Compilar TypeScript

```bash
npm run build
```

### 5. Iniciar el Servidor

**Modo Producción:**
```bash
npm start
```

**Modo Desarrollo (con auto-recarga):**
```bash
npm run dev
```

## ✅ Verificar Instalación

El servidor debería mostrar:

```
✅ Conexión a PostgreSQL establecida correctamente
🔔 Iniciando servicio de alertas automáticas...
✅ Servicio de alertas iniciado correctamente
==================================================
🏢 Sistema de Gestión Inmobiliaria
==================================================
🚀 Servidor ejecutándose en http://localhost:3010
📚 Documentación: http://localhost:3010/api
💊 Health check: http://localhost:3010/api/health
==================================================
```

Prueba el endpoint de salud:

```bash
curl http://localhost:3010/api/health
```

Deberías obtener:

```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2025-12-23T..."
}
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

| Categoría | Tablas | Descripción |
|-----------|---------|-------------|
| **Configuración** | `unit_types`, `service_types`, `expense_categories`, `payment_statuses`, `alert_types` | Catálogos configurables |
| **Usuarios** | `users` | Autenticación y permisos |
| **Edificios** | `buildings`, `units`, `building_unit_type_config`, `unit_services` | Estructura inmobiliaria |
| **Arrendamiento** | `tenants`, `contracts` | Inquilinos y contratos |
| **Pagos** | `payments`, `payment_transactions` | Control de pagos y abonos parciales |
| **Gastos** | `expenses`, `monthly_services` | Gastos y servicios mensuales |
| **Alertas** | `alerts` | Sistema de notificaciones automáticas |
| **Auditoría** | `audit_logs` | Trazabilidad de cambios |
| **Sistema** | `system_settings` | Configuración del sistema |

### Vistas Disponibles

- `v_units_full` - Información completa de unidades con contratos activos
- `v_overdue_payments` - Pagos vencidos con días de mora
- `v_vacant_units` - Unidades desocupadas con tiempo de vacancia

## 🔧 Cambios Realizados

### De MySQL a PostgreSQL

| Aspecto | Antes (MySQL) | Ahora (PostgreSQL) |
|---------|--------------|-------------------|
| **Driver** | `mysql2` | `pg` |
| **Conexión** | Variables separadas (HOST, PORT, USER, PASSWORD, DATABASE) | `DATABASE_URL` única |
| **Auto-increment** | `AUTO_INCREMENT` | `SERIAL` / `BIGSERIAL` |
| **ENUM** | Tipo nativo `ENUM` | `VARCHAR + CHECK` constraint |
| **JSON** | `JSON` | `JSONB` (más eficiente) |
| **Columnas calculadas** | `GENERATED ALWAYS AS ... STORED` | `GENERATED ALWAYS AS ... STORED` ✅ |
| **Triggers** | `DELIMITER //` sintaxis | Funciones `plpgsql` |
| **Fechas** | `CURDATE()`, `DATEDIFF()` | `CURRENT_DATE`, operador `-` |
| **Actualizaciones automáticas** | `ON UPDATE CURRENT_TIMESTAMP` | Triggers con función `update_updated_at_column()` |

## 🔐 Configuración de Email (Opcional)

Para habilitar el envío automático de alertas por email, agrega en `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password_o_app_password
ALERT_EMAIL_FROM=noreply@inmobiliaria.com
```

## 📝 Variables de Entorno Completas

```env
# Servidor
PORT=3010
CORS_ORIGIN=*
NODE_ENV=development

# Base de Datos PostgreSQL
DATABASE_URL=postgres://usuario:password@host:puerto/database

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password
ALERT_EMAIL_FROM=noreply@inmobiliaria.com

# JWT (para futuras implementaciones)
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'pg'"

```bash
cd backend
npm install pg @types/pg
```

### Error: "Connection refused"

Verifica que:
1. La base de datos PostgreSQL esté corriendo en el servidor remoto
2. El firewall permita conexiones al puerto 5432
3. Las credenciales en DATABASE_URL sean correctas

### Error: "role does not exist"

Crea el usuario en PostgreSQL:

```sql
CREATE USER alejandroap WITH PASSWORD '0Ub9g5b(_exN';
GRANT ALL PRIVILEGES ON DATABASE apartamentos TO alejandroap;
```

### Error: "relation does not exist"

Ejecuta el archivo `database/schema_postgres.sql` para crear las tablas.

## 📚 Próximos Pasos

1. ✅ **Instalación completa** - Ya realizada
2. 📊 **Crear datos de prueba** - Edificios, unidades, inquilinos
3. 🔐 **Implementar autenticación JWT** - Login de usuarios
4. 🎨 **Desarrollar frontend Angular** - Ver `frontend/ESTRUCTURA_ANGULAR.md`
5. 📈 **Implementar endpoints de reportes** - Estadísticas y dashboards
6. 📧 **Configurar SMTP** - Alertas automáticas por email

## 📖 Documentación Adicional

- `README.md` - Visión general del proyecto
- `ARQUITECTURA.md` - Diseño técnico y patrones
- `backend/docs/API_ENDPOINTS.md` - Referencia completa de la API
- `frontend/ESTRUCTURA_ANGULAR.md` - Estructura del frontend

## 🎯 API Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/buildings` | Listar edificios |
| POST | `/api/buildings` | Crear edificio |
| GET | `/api/units` | Listar unidades |
| GET | `/api/units/vacant` | Unidades desocupadas |
| GET | `/api/contracts` | Listar contratos |
| GET | `/api/contracts/expiring` | Contratos por vencer |
| GET | `/api/payments` | Listar pagos |
| GET | `/api/payments/overdue` | Pagos vencidos |
| POST | `/api/payments/:id/transactions` | Registrar pago parcial |

Ver documentación completa en `backend/docs/API_ENDPOINTS.md`

---

**¡Sistema listo para usar!** 🎉
