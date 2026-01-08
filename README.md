# 🏢 Sistema de Gestión Inmobiliaria

Sistema web profesional para la gestión integral de edificios, unidades, contratos, pagos y servicios inmobiliarios.

## 📋 Características Principales

- ✅ **Gestión de Edificios**: Administra múltiples edificios con configuración flexible
- 🏠 **Tipos de Unidades Configurables**: Apartamentos, estudios, locales comerciales, etc.
- 📝 **Contratos y Arrendatarios**: Control completo del ciclo de vida de contratos
- 💰 **Gestión de Pagos**: Registro manual de pagos completos y parciales
- 📊 **Reportes Avanzados**: Ocupación, gastos, servicios y más
- 🔔 **Alertas Automáticas**: Notificaciones por email para eventos importantes
- 📈 **Dashboard Ejecutivo**: Métricas y KPIs en tiempo real
- 🔐 **Auditoría Completa**: Logs de todos los cambios con posibilidad de reversión

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **TypeScript**
- **Express.js** (REST API)
- **MySQL** (Base de datos relacional)
- **node-cron** (Tareas programadas)
- **Nodemailer** (Envío de emails)

### Frontend
- **Angular** + **TypeScript**
- **Angular Material** (UI Components)
- **RxJS** (Programación reactiva)
- **Chart.js** (Gráficos)

## 📁 Estructura del Proyecto

```
apartamentos/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (DB, Email)
│   │   ├── controllers/     # Controladores REST
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Rutas de la API
│   │   ├── middleware/      # Middleware (auth, audit, etc.)
│   │   ├── services/        # Servicios (alertas, reportes)
│   │   ├── interfaces/      # Interfaces TypeScript
│   │   └── index.ts         # Punto de entrada
│   ├── database/
│   │   └── schema.sql       # Schema completo de MySQL
│   ├── .env.example         # Variables de entorno ejemplo
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                # (Por crear)
    └── ...
```

## 🚀 Instalación y Configuración

### 1. Requisitos Previos

- Node.js >= 18.x
- MySQL >= 8.0
- npm o yarn

### 2. Configuración del Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env desde el ejemplo
copy .env.example .env

# Editar .env con tus credenciales
```

### 3. Configuración de la Base de Datos

```bash
# Crear la base de datos
mysql -u root -p
CREATE DATABASE inmobiliaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Importar el schema
mysql -u root -p inmobiliaria < database/schema.sql
```

### 4. Configurar Variables de Entorno

Edita el archivo `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=inmobiliaria

# Email (opcional, para alertas)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
```

### 5. Ejecutar el Servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📡 Endpoints de la API

### Edificios
```
GET    /api/buildings          # Listar edificios
GET    /api/buildings/:id      # Obtener edificio
POST   /api/buildings          # Crear edificio
PUT    /api/buildings/:id      # Actualizar edificio
DELETE /api/buildings/:id      # Eliminar edificio
```

### Unidades
```
GET    /api/units              # Listar unidades
GET    /api/units/:id          # Obtener unidad
GET    /api/units/vacant       # Unidades disponibles
GET    /api/units/reports/vacancy  # Reporte de desocupación
POST   /api/units              # Crear unidad
PUT    /api/units/:id          # Actualizar unidad
DELETE /api/units/:id          # Eliminar unidad
```

### Contratos
```
GET    /api/contracts          # Listar contratos
GET    /api/contracts/:id      # Obtener contrato
GET    /api/contracts/expiring # Contratos por vencer
POST   /api/contracts          # Crear contrato
PUT    /api/contracts/:id      # Actualizar contrato
POST   /api/contracts/:id/finish  # Finalizar contrato
```

### Pagos
```
GET    /api/payments           # Listar pagos
GET    /api/payments/:id       # Obtener pago
GET    /api/payments/overdue   # Pagos vencidos
POST   /api/payments           # Crear pago
PUT    /api/payments/:id       # Actualizar pago
POST   /api/payments/:id/transactions  # Registrar transacción
POST   /api/payments/generate-monthly  # Generar pago mensual
```

## 🔔 Sistema de Alertas

El sistema genera alertas automáticas para:

1. **Contratos por Vencer**: 30 días antes del vencimiento
2. **Pagos Vencidos**: Diariamente verifica pagos atrasados
3. **Unidades Desocupadas**: Notifica cuando una unidad queda vacía
4. **Desocupación Prolongada**: Alerta cuando una unidad lleva >60 días vacía
5. **Capacidad Máxima**: Notifica cuando un edificio alcanza su capacidad

### Configuración de Alertas

Las alertas se ejecutan automáticamente mediante cron jobs:
- **Diariamente a las 8:00 AM**: Verificación general
- **Cada hora**: Verificación de pagos vencidos

## 📊 Modelo de Base de Datos

### Tablas Principales

1. **buildings**: Edificios
2. **units**: Unidades (apartamentos, locales, etc.)
3. **unit_types**: Tipos de unidad (configurable)
4. **tenants**: Arrendatarios
5. **contracts**: Contratos de arrendamiento
6. **payments**: Pagos y su estado
7. **payment_transactions**: Transacciones de pago
8. **expenses**: Gastos por unidad o edificio
9. **monthly_services**: Control mensual de servicios
10. **alerts**: Sistema de alertas
11. **audit_logs**: Logs de auditoría

### Vistas

- **v_units_full**: Unidades con información completa
- **v_overdue_payments**: Pagos vencidos
- **v_vacant_units**: Unidades desocupadas

## 🔐 Auditoría y Logs

Todas las operaciones importantes se registran automáticamente:

- **Usuario** que realizó la acción
- **Fecha y hora** exacta
- **Tipo de acción** (CREATE, UPDATE, DELETE)
- **Valores anteriores** y **nuevos**
- **IP** y **User Agent**

Consultar logs:
```typescript
GET /api/audit-logs?table=contracts&record_id=123
```

## 📈 Reportes Disponibles

1. **Tiempo de Desocupación**: Unidades vacías y días sin ocupar
2. **Gastos por Unidad**: Desglose de gastos por propiedad
3. **Gastos por Edificio**: Consolidado de gastos por edificio
4. **Servicios Mensuales**: Control y comparativos de consumo
5. **Tasas de Cobro**: Pagado vs. Pendiente vs. Vencido
6. **Ocupación**: Porcentaje de ocupación por edificio

## 🎯 Próximos Pasos

### Funcionalidades Pendientes

- [ ] Sistema de autenticación JWT completo
- [ ] Gestión de arrendatarios (CRUD)
- [ ] Gestión de gastos y servicios
- [ ] Dashboard con métricas en tiempo real
- [ ] Generación de reportes PDF/Excel
- [ ] Frontend Angular completo
- [ ] Upload de documentos (contratos, recibos)
- [ ] Sistema de notificaciones en tiempo real (WebSockets)
- [ ] Multi-idioma

## 🤝 Contribución

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas Importantes

### Configuración NO Hardcodeada

- Los **tipos de unidad** son configurables desde la base de datos
- Los **tipos de servicio** son configurables
- Las **categorías de gastos** son configurables
- Los **días de alerta** son configurables via `system_settings`

### Escalabilidad

El sistema está diseñado para:
- ✅ Múltiples edificios ilimitados
- ✅ Diferentes tipos de unidades por edificio
- ✅ Cláusulas de aumento de arriendo (preparado)
- ✅ Histórico completo de cambios
- ✅ Reversión de acciones (futuro)

### Seguridad

- Validación de datos en backend
- Prepared statements (prevención SQL injection)
- CORS configurado
- Variables sensibles en .env
- Hash de contraseñas con bcrypt

## 📞 Soporte

Para preguntas o problemas:
- Abre un **Issue** en GitHub
- Revisa la documentación en `/docs`

---

**Desarrollado con ❤️ para una gestión inmobiliaria profesional y eficiente**
