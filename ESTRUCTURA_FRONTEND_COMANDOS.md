# 🏗️ ESTRUCTURA COMPLETA DEL FRONTEND ANGULAR
## Sistema de Gestión de Apartamentos - COMANDOS DE CREACIÓN

---

## 📋 RESUMEN DEL BACKEND ANALIZADO

### ENDPOINTS DISPONIBLES:

#### 🏢 BUILDINGS (Edificios)
- GET /api/buildings (lista con paginación)
- GET /api/buildings/:id (detalle)
- POST /api/buildings (crear)
- PUT /api/buildings/:id (actualizar)
- DELETE /api/buildings/:id (eliminar)

#### 🏠 UNITS (Unidades)
- GET /api/units (lista con paginación)
- GET /api/units/search (búsqueda)
- GET /api/units/vacant (unidades desocupadas)
- GET /api/units/reports/vacancy (reporte de desocupación)
- GET /api/units/:id (detalle)
- POST /api/units (crear)
- PUT /api/units/:id (actualizar)
- DELETE /api/units/:id (eliminar)

#### 👥 TENANTS (Arrendatarios)
- GET /api/tenants (lista con paginación)
- GET /api/tenants/search (búsqueda)
- GET /api/tenants/:id (detalle)
- POST /api/tenants (crear)
- PUT /api/tenants/:id (actualizar)
- DELETE /api/tenants/:id (eliminar)

#### 📝 CONTRACTS (Contratos)
- GET /api/contracts (lista con paginación)
- GET /api/contracts/search (búsqueda)
- GET /api/contracts/expiring (contratos por vencer)
- GET /api/contracts/:id (detalle)
- POST /api/contracts (crear)
- PUT /api/contracts/:id (actualizar)
- POST /api/contracts/:id/finish (finalizar contrato)

#### 💰 PAYMENTS (Pagos)
- GET /api/payments (lista)
- GET /api/payments/search (búsqueda)
- GET /api/payments/overdue (pagos vencidos)
- GET /api/payments/:id (detalle)
- POST /api/payments (crear)
- PUT /api/payments/:id (actualizar)
- POST /api/payments/:id/transactions (registrar transacción)
- POST /api/payments/generate-monthly (generar pago mensual)

#### 💸 EXPENSES (Gastos)
- GET /api/expenses (lista)
- GET /api/expenses/statistics (estadísticas)
- GET /api/expenses/summary/building/:id (resumen por edificio)
- GET /api/expenses/by-building/:id (gastos por edificio)
- GET /api/expenses/:id (detalle)
- POST /api/expenses (crear)
- PUT /api/expenses/:id (actualizar)
- DELETE /api/expenses/:id (eliminar)
- GET /api/expenses/categories (categorías)
- POST /api/expenses/categories (crear categoría)

#### 🔧 MAINTENANCE (Mantenimiento)
- GET /api/maintenance-requests (lista)
- GET /api/maintenance-requests/pending (pendientes)
- GET /api/maintenance-requests/urgent (urgentes)
- GET /api/maintenance-requests/stats (estadísticas)
- GET /api/maintenance-requests/unit/:unitId (por unidad)
- GET /api/maintenance-requests/tenant/:tenantId (por inquilino)
- GET /api/maintenance-requests/:id (detalle)
- POST /api/maintenance-requests (crear)
- PUT /api/maintenance-requests/:id (actualizar)
- POST /api/maintenance-requests/:id/resolve (resolver)

#### 📊 DASHBOARD
- GET /api/dashboard/stats (estadísticas generales)
- GET /api/dashboard/buildings (estadísticas por edificio)
- GET /api/dashboard/revenue (ingresos por mes)
- GET /api/dashboard/top-tenants (top inquilinos)

#### 📈 REPORTS (Reportes)
- GET /api/reports/financial-summary (resumen financiero)
- GET /api/reports/occupancy-rate (tasa de ocupación)
- GET /api/reports/payment-status (estado de pagos)
- GET /api/reports/tenant-history/:id (historial de inquilino)
- GET /api/reports/vacant-units (unidades vacantes)
- GET /api/reports/financial-summary/pdf (exportar PDF)

#### 📁 UPLOADS (Carga de archivos)
- POST /api/uploads/receipt (comprobante de pago)
- POST /api/uploads/contract-document (documento de contrato)
- POST /api/uploads/tenant-id (documento de identidad)
- POST /api/uploads/building-photo (foto de edificio)
- POST /api/uploads/unit-photo (foto de unidad)
- GET /api/uploads/:type/:year/:month/:filename (obtener archivo)
- DELETE /api/uploads/:type/:year/:month/:filename (eliminar archivo)

#### ⚙️ SETTINGS (Configuración)
- GET /api/settings (todas las configuraciones)
- GET /api/settings/:key (configuración específica)
- PUT /api/settings (actualizar múltiples)
- PUT /api/settings/:key (actualizar una)
- POST /api/settings (crear nueva)

#### 📋 CATALOGS (Catálogos)
- GET /api/catalogs/unit-types (tipos de unidad)
- POST /api/catalogs/unit-types
- PUT /api/catalogs/unit-types/:id
- DELETE /api/catalogs/unit-types/:id
- GET /api/catalogs/service-types (tipos de servicio)
- POST /api/catalogs/service-types
- PUT /api/catalogs/service-types/:id
- DELETE /api/catalogs/service-types/:id
- GET /api/catalogs/payment-statuses (estados de pago)
- POST /api/catalogs/payment-statuses
- PUT /api/catalogs/payment-statuses/:id
- DELETE /api/catalogs/payment-statuses/:id
- GET /api/catalogs/alert-types (tipos de alerta)
- POST /api/catalogs/alert-types
- PUT /api/catalogs/alert-types/:id
- DELETE /api/catalogs/alert-types/:id
- GET /api/catalogs/users (usuarios)
- POST /api/catalogs/users
- PUT /api/catalogs/users/:id
- DELETE /api/catalogs/users/:id

---

## 🗂️ ESTRUCTURA DE CARPETAS EN FORMATO ASCII

```
front/src/app/
│
├── core/                                    # Core Module (Singleton - NO importar en otros módulos)
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── admin.guard.ts
│   │   └── unsaved-changes.guard.ts
│   │
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   └── loading.interceptor.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── storage.service.ts
│   │   ├── notification.service.ts
│   │   └── loading.service.ts
│   │
│   ├── models/
│   │   ├── user.model.ts
│   │   └── api-response.model.ts
│   │
│   └── core.module.ts
│
├── shared/                                  # Shared Module (Importar donde se necesite)
│   ├── components/
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   └── header.component.css
│   │   │
│   │   ├── sidebar/
│   │   │   ├── sidebar.component.ts
│   │   │   ├── sidebar.component.html
│   │   │   └── sidebar.component.css
│   │   │
│   │   ├── footer/
│   │   │   ├── footer.component.ts
│   │   │   ├── footer.component.html
│   │   │   └── footer.component.css
│   │   │
│   │   ├── loading-spinner/
│   │   │   ├── loading-spinner.component.ts
│   │   │   ├── loading-spinner.component.html
│   │   │   └── loading-spinner.component.css
│   │   │
│   │   ├── confirmation-dialog/
│   │   │   ├── confirmation-dialog.component.ts
│   │   │   ├── confirmation-dialog.component.html
│   │   │   └── confirmation-dialog.component.css
│   │   │
│   │   ├── pagination/
│   │   │   ├── pagination.component.ts
│   │   │   ├── pagination.component.html
│   │   │   └── pagination.component.css
│   │   │
│   │   ├── data-table/
│   │   │   ├── data-table.component.ts
│   │   │   ├── data-table.component.html
│   │   │   └── data-table.component.css
│   │   │
│   │   ├── breadcrumb/
│   │   │   ├── breadcrumb.component.ts
│   │   │   ├── breadcrumb.component.html
│   │   │   └── breadcrumb.component.css
│   │   │
│   │   ├── alert/
│   │   │   ├── alert.component.ts
│   │   │   ├── alert.component.html
│   │   │   └── alert.component.css
│   │   │
│   │   ├── card/
│   │   │   ├── card.component.ts
│   │   │   ├── card.component.html
│   │   │   └── card.component.css
│   │   │
│   │   └── status-badge/
│   │       ├── status-badge.component.ts
│   │       ├── status-badge.component.html
│   │       └── status-badge.component.css
│   │
│   ├── directives/
│   │   ├── tooltip.directive.ts
│   │   ├── click-outside.directive.ts
│   │   └── number-only.directive.ts
│   │
│   ├── pipes/
│   │   ├── currency-format.pipe.ts
│   │   ├── date-format.pipe.ts
│   │   ├── filter.pipe.ts
│   │   └── truncate.pipe.ts
│   │
│   ├── validators/
│   │   ├── custom-validators.ts
│   │   └── form-validators.ts
│   │
│   └── shared.module.ts
│
├── features/                                # Feature Modules
│   │
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.css
│   │   │   │
│   │   │   ├── register/
│   │   │   │   ├── register.component.ts
│   │   │   │   ├── register.component.html
│   │   │   │   └── register.component.css
│   │   │   │
│   │   │   ├── forgot-password/
│   │   │   │   ├── forgot-password.component.ts
│   │   │   │   ├── forgot-password.component.html
│   │   │   │   └── forgot-password.component.css
│   │   │   │
│   │   │   └── reset-password/
│   │   │       ├── reset-password.component.ts
│   │   │       ├── reset-password.component.html
│   │   │       └── reset-password.component.css
│   │   │
│   │   ├── auth-routing.module.ts
│   │   └── auth.module.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── stats-card/
│   │   │   │   ├── stats-card.component.ts
│   │   │   │   ├── stats-card.component.html
│   │   │   │   └── stats-card.component.css
│   │   │   │
│   │   │   ├── revenue-chart/
│   │   │   │   ├── revenue-chart.component.ts
│   │   │   │   ├── revenue-chart.component.html
│   │   │   │   └── revenue-chart.component.css
│   │   │   │
│   │   │   ├── occupancy-chart/
│   │   │   │   ├── occupancy-chart.component.ts
│   │   │   │   ├── occupancy-chart.component.html
│   │   │   │   └── occupancy-chart.component.css
│   │   │   │
│   │   │   ├── recent-payments/
│   │   │   │   ├── recent-payments.component.ts
│   │   │   │   ├── recent-payments.component.html
│   │   │   │   └── recent-payments.component.css
│   │   │   │
│   │   │   ├── pending-tasks/
│   │   │   │   ├── pending-tasks.component.ts
│   │   │   │   ├── pending-tasks.component.html
│   │   │   │   └── pending-tasks.component.css
│   │   │   │
│   │   │   └── alerts-widget/
│   │   │       ├── alerts-widget.component.ts
│   │   │       ├── alerts-widget.component.html
│   │   │       └── alerts-widget.component.css
│   │   │
│   │   ├── pages/
│   │   │   └── dashboard-home/
│   │   │       ├── dashboard-home.component.ts
│   │   │       ├── dashboard-home.component.html
│   │   │       └── dashboard-home.component.css
│   │   │
│   │   ├── services/
│   │   │   └── dashboard.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── dashboard.model.ts
│   │   │
│   │   ├── dashboard-routing.module.ts
│   │   └── dashboard.module.ts
│   │
│   ├── buildings/
│   │   ├── components/
│   │   │   ├── building-card/
│   │   │   │   ├── building-card.component.ts
│   │   │   │   ├── building-card.component.html
│   │   │   │   └── building-card.component.css
│   │   │   │
│   │   │   ├── building-form/
│   │   │   │   ├── building-form.component.ts
│   │   │   │   ├── building-form.component.html
│   │   │   │   └── building-form.component.css
│   │   │   │
│   │   │   └── building-stats/
│   │   │       ├── building-stats.component.ts
│   │   │       ├── building-stats.component.html
│   │   │       └── building-stats.component.css
│   │   │
│   │   ├── pages/
│   │   │   ├── building-list/
│   │   │   │   ├── building-list.component.ts
│   │   │   │   ├── building-list.component.html
│   │   │   │   └── building-list.component.css
│   │   │   │
│   │   │   ├── building-detail/
│   │   │   │   ├── building-detail.component.ts
│   │   │   │   ├── building-detail.component.html
│   │   │   │   └── building-detail.component.css
│   │   │   │
│   │   │   ├── building-create/
│   │   │   │   ├── building-create.component.ts
│   │   │   │   ├── building-create.component.html
│   │   │   │   └── building-create.component.css
│   │   │   │
│   │   │   └── building-edit/
│   │   │       ├── building-edit.component.ts
│   │   │       ├── building-edit.component.html
│   │   │       └── building-edit.component.css
│   │   │
│   │   ├── services/
│   │   │   └── building.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── building.model.ts
│   │   │
│   │   ├── buildings-routing.module.ts
│   │   └── buildings.module.ts
│   │
│   ├── units/
│   │   ├── components/
│   │   │   ├── unit-card/
│   │   │   │   ├── unit-card.component.ts
│   │   │   │   ├── unit-card.component.html
│   │   │   │   └── unit-card.component.css
│   │   │   │
│   │   │   ├── unit-form/
│   │   │   │   ├── unit-form.component.ts
│   │   │   │   ├── unit-form.component.html
│   │   │   │   └── unit-form.component.css
│   │   │   │
│   │   │   ├── unit-filter/
│   │   │   │   ├── unit-filter.component.ts
│   │   │   │   ├── unit-filter.component.html
│   │   │   │   └── unit-filter.component.css
│   │   │   │
│   │   │   └── unit-status-indicator/
│   │   │       ├── unit-status-indicator.component.ts
│   │   │       ├── unit-status-indicator.component.html
│   │   │       └── unit-status-indicator.component.css
│   │   │
│   │   ├── pages/
│   │   │   ├── unit-list/
│   │   │   │   ├── unit-list.component.ts
│   │   │   │   ├── unit-list.component.html
│   │   │   │   └── unit-list.component.css
│   │   │   │
│   │   │   ├── unit-detail/
│   │   │   │   ├── unit-detail.component.ts
│   │   │   │   ├── unit-detail.component.html
│   │   │   │   └── unit-detail.component.css
│   │   │   │
│   │   │   ├── unit-create/
│   │   │   │   ├── unit-create.component.ts
│   │   │   │   ├── unit-create.component.html
│   │   │   │   └── unit-create.component.css
│   │   │   │
│   │   │   ├── unit-edit/
│   │   │   │   ├── unit-edit.component.ts
│   │   │   │   ├── unit-edit.component.html
│   │   │   │   └── unit-edit.component.css
│   │   │   │
│   │   │   └── vacant-units/
│   │   │       ├── vacant-units.component.ts
│   │   │       ├── vacant-units.component.html
│   │   │       └── vacant-units.component.css
│   │   │
│   │   ├── services/
│   │   │   └── unit.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── unit.model.ts
│   │   │
│   │   ├── units-routing.module.ts
│   │   └── units.module.ts
│   │
│   ├── tenants/
│   │   ├── components/
│   │   │   ├── tenant-card/
│   │   │   │   ├── tenant-card.component.ts
│   │   │   │   ├── tenant-card.component.html
│   │   │   │   └── tenant-card.component.css
│   │   │   │
│   │   │   ├── tenant-form/
│   │   │   │   ├── tenant-form.component.ts
│   │   │   │   ├── tenant-form.component.html
│   │   │   │   └── tenant-form.component.css
│   │   │   │
│   │   │   ├── tenant-search/
│   │   │   │   ├── tenant-search.component.ts
│   │   │   │   ├── tenant-search.component.html
│   │   │   │   └── tenant-search.component.css
│   │   │   │
│   │   │   └── tenant-contracts/
│   │   │       ├── tenant-contracts.component.ts
│   │   │       ├── tenant-contracts.component.html
│   │   │       └── tenant-contracts.component.css
│   │   │
│   │   ├── pages/
│   │   │   ├── tenant-list/
│   │   │   │   ├── tenant-list.component.ts
│   │   │   │   ├── tenant-list.component.html
│   │   │   │   └── tenant-list.component.css
│   │   │   │
│   │   │   ├── tenant-detail/
│   │   │   │   ├── tenant-detail.component.ts
│   │   │   │   ├── tenant-detail.component.html
│   │   │   │   └── tenant-detail.component.css
│   │   │   │
│   │   │   ├── tenant-create/
│   │   │   │   ├── tenant-create.component.ts
│   │   │   │   ├── tenant-create.component.html
│   │   │   │   └── tenant-create.component.css
│   │   │   │
│   │   │   └── tenant-edit/
│   │   │       ├── tenant-edit.component.ts
│   │   │       ├── tenant-edit.component.html
│   │   │       └── tenant-edit.component.css
│   │   │
│   │   ├── services/
│   │   │   └── tenant.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── tenant.model.ts
│   │   │
│   │   ├── tenants-routing.module.ts
│   │   └── tenants.module.ts
│   │
│   ├── contracts/
│   │   ├── components/
│   │   │   ├── contract-card/
│   │   │   │   ├── contract-card.component.ts
│   │   │   │   ├── contract-card.component.html
│   │   │   │   └── contract-card.component.css
│   │   │   │
│   │   │   ├── contract-form/
│   │   │   │   ├── contract-form.component.ts
│   │   │   │   ├── contract-form.component.html
│   │   │   │   └── contract-form.component.css
│   │   │   │
│   │   │   ├── contract-timeline/
│   │   │   │   ├── contract-timeline.component.ts
│   │   │   │   ├── contract-timeline.component.html
│   │   │   │   └── contract-timeline.component.css
│   │   │   │
│   │   │   ├── contract-payments/
│   │   │   │   ├── contract-payments.component.ts
│   │   │   │   ├── contract-payments.component.html
│   │   │   │   └── contract-payments.component.css
│   │   │   │
│   │   │   └── expiring-contracts/
│   │   │       ├── expiring-contracts.component.ts
│   │   │       ├── expiring-contracts.component.html
│   │   │       └── expiring-contracts.component.css
│   │   │
│   │   ├── pages/
│   │   │   ├── contract-list/
│   │   │   │   ├── contract-list.component.ts
│   │   │   │   ├── contract-list.component.html
│   │   │   │   └── contract-list.component.css
│   │   │   │
│   │   │   ├── contract-detail/
│   │   │   │   ├── contract-detail.component.ts
│   │   │   │   ├── contract-detail.component.html
│   │   │   │   └── contract-detail.component.css
│   │   │   │
│   │   │   ├── contract-create/
│   │   │   │   ├── contract-create.component.ts
│   │   │   │   ├── contract-create.component.html
│   │   │   │   └── contract-create.component.css
│   │   │   │
│   │   │   └── contract-edit/
│   │   │       ├── contract-edit.component.ts
│   │   │       ├── contract-edit.component.html
│   │   │       └── contract-edit.component.css
│   │   │
│   │   ├── services/
│   │   │   └── contract.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── contract.model.ts
│   │   │
│   │   ├── contracts-routing.module.ts
│   │   └── contracts.module.ts
│   │
│   ├── payments/
│   │   ├── components/
│   │   │   ├── payment-card/
│   │   │   │   ├── payment-card.component.ts
│   │   │   │   ├── payment-card.component.html
│   │   │   │   └── payment-card.component.css
│   │   │   │
│   │   │   ├── payment-form/
│   │   │   │   ├── payment-form.component.ts
│   │   │   │   ├── payment-form.component.html
│   │   │   │   └── payment-form.component.css
│   │   │   │
│   │   │   ├── transaction-form/
│   │   │   │   ├── transaction-form.component.ts
│   │   │   │   ├── transaction-form.component.html
│   │   │   │   └── transaction-form.component.css
│   │   │   │
│   │   │   ├── payment-history/
│   │   │   │   ├── payment-history.component.ts
│   │   │   │   ├── payment-history.component.html
│   │   │   │   └── payment-history.component.css
│   │   │   │
│   │   │   ├── overdue-payments/
│   │   │   │   ├── overdue-payments.component.ts
│   │   │   │   ├── overdue-payments.component.html
│   │   │   │   └── overdue-payments.component.css
│   │   │   │
│   │   │   └── payment-calendar/
│   │   │       ├── payment-calendar.component.ts
│   │   │       ├── payment-calendar.component.html
│   │   │       └── payment-calendar.component.css
│   │   │
│   │   ├── pages/
│   │   │   ├── payment-list/
│   │   │   │   ├── payment-list.component.ts
│   │   │   │   ├── payment-list.component.html
│   │   │   │   └── payment-list.component.css
│   │   │   │
│   │   │   ├── payment-detail/
│   │   │   │   ├── payment-detail.component.ts
│   │   │   │   ├── payment-detail.component.html
│   │   │   │   └── payment-detail.component.css
│   │   │   │
│   │   │   ├── payment-create/
│   │   │   │   ├── payment-create.component.ts
│   │   │   │   ├── payment-create.component.html
│   │   │   │   └── payment-create.component.css
│   │   │   │
│   │   │   └── payment-register/
│   │   │       ├── payment-register.component.ts
│   │   │       ├── payment-register.component.html
│   │   │       └── payment-register.component.css
│   │   │
│   │   ├── services/
│   │   │   └── payment.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── payment.model.ts
│   │   │
│   │   ├── payments-routing.module.ts
│   │   └── payments.module.ts
│   │
│   ├── expenses/
│   │   ├── components/
│   │   │   ├── expense-card/
│   │   │   │   ├── expense-card.component.ts
│   │   │   │   ├── expense-card.component.html
│   │   │   │   └── expense-card.component.css
│   │   │   │
│   │   │   ├── expense-form/
│   │   │   │   ├── expense-form.component.ts
│   │   │   │   ├── expense-form.component.html
│   │   │   │   └── expense-form.component.css
│   │   │   │
│   │   │   ├── expense-summary/
│   │   │   │   ├── expense-summary.component.ts
│   │   │   │   ├── expense-summary.component.html
│   │   │   │   └── expense-summary.component.css
│   │   │   │
│   │   │   └── expense-chart/
│   │   │       ├── expense-chart.component.ts
│   │   │       ├── expense-chart.component.html
│   │   │       └── expense-chart.component.css
│   │   │
│   │   ├── pages/
│   │   │   ├── expense-list/
│   │   │   │   ├── expense-list.component.ts
│   │   │   │   ├── expense-list.component.html
│   │   │   │   └── expense-list.component.css
│   │   │   │
│   │   │   ├── expense-detail/
│   │   │   │   ├── expense-detail.component.ts
│   │   │   │   ├── expense-detail.component.html
│   │   │   │   └── expense-detail.component.css
│   │   │   │
│   │   │   ├── expense-create/
│   │   │   │   ├── expense-create.component.ts
│   │   │   │   ├── expense-create.component.html
│   │   │   │   └── expense-create.component.css
│   │   │   │
│   │   │   └── expense-analytics/
│   │   │       ├── expense-analytics.component.ts
│   │   │       ├── expense-analytics.component.html
│   │   │       └── expense-analytics.component.css
│   │   │
│   │   ├── services/
│   │   │   └── expense.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── expense.model.ts
│   │   │
│   │   ├── expenses-routing.module.ts
│   │   └── expenses.module.ts
│   │
│   ├── maintenance/
│   │   ├── components/
│   │   │   ├── maintenance-card/
│   │   │   │   ├── maintenance-card.component.ts
│   │   │   │   ├── maintenance-card.component.html
│   │   │   │   └── maintenance-card.component.css
│   │   │   │
│   │   │   ├── maintenance-form/
│   │   │   │   ├── maintenance-form.component.ts
│   │   │   │   ├── maintenance-form.component.html
│   │   │   │   └── maintenance-form.component.css
│   │   │   │
│   │   │   ├── maintenance-timeline/
│   │   │   │   ├── maintenance-timeline.component.ts
│   │   │   │   ├── maintenance-timeline.component.html
│   │   │   │   └── maintenance-timeline.component.css
│   │   │   │
│   │   │   └── priority-badge/
│   │   │       ├── priority-badge.component.ts
│   │   │       ├── priority-badge.component.html
│   │   │       └── priority-badge.component.css
│   │   │
│   │   ├── pages/
│   │   │   ├── maintenance-list/
│   │   │   │   ├── maintenance-list.component.ts
│   │   │   │   ├── maintenance-list.component.html
│   │   │   │   └── maintenance-list.component.css
│   │   │   │
│   │   │   ├── maintenance-detail/
│   │   │   │   ├── maintenance-detail.component.ts
│   │   │   │   ├── maintenance-detail.component.html
│   │   │   │   └── maintenance-detail.component.css
│   │   │   │
│   │   │   ├── maintenance-create/
│   │   │   │   ├── maintenance-create.component.ts
│   │   │   │   ├── maintenance-create.component.html
│   │   │   │   └── maintenance-create.component.css
│   │   │   │
│   │   │   ├── maintenance-pending/
│   │   │   │   ├── maintenance-pending.component.ts
│   │   │   │   ├── maintenance-pending.component.html
│   │   │   │   └── maintenance-pending.component.css
│   │   │   │
│   │   │   └── maintenance-urgent/
│   │   │       ├── maintenance-urgent.component.ts
│   │   │       ├── maintenance-urgent.component.html
│   │   │       └── maintenance-urgent.component.css
│   │   │
│   │   ├── services/
│   │   │   └── maintenance.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── maintenance.model.ts
│   │   │
│   │   ├── maintenance-routing.module.ts
│   │   └── maintenance.module.ts
│   │
│   ├── reports/
│   │   ├── components/
│   │   │   ├── report-filter/
│   │   │   │   ├── report-filter.component.ts
│   │   │   │   ├── report-filter.component.html
│   │   │   │   └── report-filter.component.css
│   │   │   │
│   │   │   ├── report-table/
│   │   │   │   ├── report-table.component.ts
│   │   │   │   ├── report-table.component.html
│   │   │   │   └── report-table.component.css
│   │   │   │
│   │   │   ├── export-buttons/
│   │   │   │   ├── export-buttons.component.ts
│   │   │   │   ├── export-buttons.component.html
│   │   │   │   └── export-buttons.component.css
│   │   │   │
│   │   │   └── chart-viewer/
│   │   │       ├── chart-viewer.component.ts
│   │   │       ├── chart-viewer.component.html
│   │   │       └── chart-viewer.component.css
│   │   │
│   │   ├── pages/
│   │   │   ├── revenue-report/
│   │   │   │   ├── revenue-report.component.ts
│   │   │   │   ├── revenue-report.component.html
│   │   │   │   └── revenue-report.component.css
│   │   │   │
│   │   │   ├── occupancy-report/
│   │   │   │   ├── occupancy-report.component.ts
│   │   │   │   ├── occupancy-report.component.html
│   │   │   │   └── occupancy-report.component.css
│   │   │   │
│   │   │   ├── tenant-report/
│   │   │   │   ├── tenant-report.component.ts
│   │   │   │   ├── tenant-report.component.html
│   │   │   │   └── tenant-report.component.css
│   │   │   │
│   │   │   ├── payment-report/
│   │   │   │   ├── payment-report.component.ts
│   │   │   │   ├── payment-report.component.html
│   │   │   │   └── payment-report.component.css
│   │   │   │
│   │   │   ├── expense-report/
│   │   │   │   ├── expense-report.component.ts
│   │   │   │   ├── expense-report.component.html
│   │   │   │   └── expense-report.component.css
│   │   │   │
│   │   │   └── custom-report/
│   │   │       ├── custom-report.component.ts
│   │   │       ├── custom-report.component.html
│   │   │       └── custom-report.component.css
│   │   │
│   │   ├── services/
│   │   │   └── report.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── report.model.ts
│   │   │
│   │   ├── reports-routing.module.ts
│   │   └── reports.module.ts
│   │
│   ├── settings/
│   │   ├── components/
│   │   │   ├── general-settings/
│   │   │   │   ├── general-settings.component.ts
│   │   │   │   ├── general-settings.component.html
│   │   │   │   └── general-settings.component.css
│   │   │   │
│   │   │   ├── notification-settings/
│   │   │   │   ├── notification-settings.component.ts
│   │   │   │   ├── notification-settings.component.html
│   │   │   │   └── notification-settings.component.css
│   │   │   │
│   │   │   ├── email-settings/
│   │   │   │   ├── email-settings.component.ts
│   │   │   │   ├── email-settings.component.html
│   │   │   │   └── email-settings.component.css
│   │   │   │
│   │   │   └── user-profile/
│   │   │       ├── user-profile.component.ts
│   │   │       ├── user-profile.component.html
│   │   │       └── user-profile.component.css
│   │   │
│   │   ├── pages/
│   │   │   └── settings-home/
│   │   │       ├── settings-home.component.ts
│   │   │       ├── settings-home.component.html
│   │   │       └── settings-home.component.css
│   │   │
│   │   ├── services/
│   │   │   └── settings.service.ts
│   │   │
│   │   ├── models/
│   │   │   └── settings.model.ts
│   │   │
│   │   ├── settings-routing.module.ts
│   │   └── settings.module.ts
│   │
│   └── catalogs/
│       ├── services/
│       │   └── catalog.service.ts
│       │
│       ├── models/
│       │   └── catalog.model.ts
│       │
│       └── catalogs.module.ts
│
├── layouts/                                 # Layouts
│   ├── main-layout/
│   │   ├── main-layout.component.ts
│   │   ├── main-layout.component.html
│   │   └── main-layout.component.css
│   │
│   ├── auth-layout/
│   │   ├── auth-layout.component.ts
│   │   ├── auth-layout.component.html
│   │   └── auth-layout.component.css
│   │
│   └── empty-layout/
│       ├── empty-layout.component.ts
│       ├── empty-layout.component.html
│       └── empty-layout.component.css
│
├── app.component.ts
├── app.component.html
├── app.component.css
├── app.config.ts
└── app.routes.ts
```

---

## 📝 COMANDOS PARA CREAR LA ESTRUCTURA COMPLETA

### OPCIÓN 1: Comando PowerShell (Windows)

```powershell
# Navegar a la carpeta front/src/app
cd C:\Users\DESARROLLO\Documents\Codigos\apartamentos\front\src\app

# Crear estructura completa de carpetas
$folders = @(
    "core\guards",
    "core\interceptors",
    "core\services",
    "core\models",
    "shared\components\header",
    "shared\components\sidebar",
    "shared\components\footer",
    "shared\components\loading-spinner",
    "shared\components\confirmation-dialog",
    "shared\components\pagination",
    "shared\components\data-table",
    "shared\components\breadcrumb",
    "shared\components\alert",
    "shared\components\card",
    "shared\components\status-badge",
    "shared\directives",
    "shared\pipes",
    "shared\validators",
    "features\auth\pages\login",
    "features\auth\pages\register",
    "features\auth\pages\forgot-password",
    "features\auth\pages\reset-password",
    "features\dashboard\components\stats-card",
    "features\dashboard\components\revenue-chart",
    "features\dashboard\components\occupancy-chart",
    "features\dashboard\components\recent-payments",
    "features\dashboard\components\pending-tasks",
    "features\dashboard\components\alerts-widget",
    "features\dashboard\pages\dashboard-home",
    "features\dashboard\services",
    "features\dashboard\models",
    "features\buildings\components\building-card",
    "features\buildings\components\building-form",
    "features\buildings\components\building-stats",
    "features\buildings\pages\building-list",
    "features\buildings\pages\building-detail",
    "features\buildings\pages\building-create",
    "features\buildings\pages\building-edit",
    "features\buildings\services",
    "features\buildings\models",
    "features\units\components\unit-card",
    "features\units\components\unit-form",
    "features\units\components\unit-filter",
    "features\units\components\unit-status-indicator",
    "features\units\pages\unit-list",
    "features\units\pages\unit-detail",
    "features\units\pages\unit-create",
    "features\units\pages\unit-edit",
    "features\units\pages\vacant-units",
    "features\units\services",
    "features\units\models",
    "features\tenants\components\tenant-card",
    "features\tenants\components\tenant-form",
    "features\tenants\components\tenant-search",
    "features\tenants\components\tenant-contracts",
    "features\tenants\pages\tenant-list",
    "features\tenants\pages\tenant-detail",
    "features\tenants\pages\tenant-create",
    "features\tenants\pages\tenant-edit",
    "features\tenants\services",
    "features\tenants\models",
    "features\contracts\components\contract-card",
    "features\contracts\components\contract-form",
    "features\contracts\components\contract-timeline",
    "features\contracts\components\contract-payments",
    "features\contracts\components\expiring-contracts",
    "features\contracts\pages\contract-list",
    "features\contracts\pages\contract-detail",
    "features\contracts\pages\contract-create",
    "features\contracts\pages\contract-edit",
    "features\contracts\services",
    "features\contracts\models",
    "features\payments\components\payment-card",
    "features\payments\components\payment-form",
    "features\payments\components\transaction-form",
    "features\payments\components\payment-history",
    "features\payments\components\overdue-payments",
    "features\payments\components\payment-calendar",
    "features\payments\pages\payment-list",
    "features\payments\pages\payment-detail",
    "features\payments\pages\payment-create",
    "features\payments\pages\payment-register",
    "features\payments\services",
    "features\payments\models",
    "features\expenses\components\expense-card",
    "features\expenses\components\expense-form",
    "features\expenses\components\expense-summary",
    "features\expenses\components\expense-chart",
    "features\expenses\pages\expense-list",
    "features\expenses\pages\expense-detail",
    "features\expenses\pages\expense-create",
    "features\expenses\pages\expense-analytics",
    "features\expenses\services",
    "features\expenses\models",
    "features\maintenance\components\maintenance-card",
    "features\maintenance\components\maintenance-form",
    "features\maintenance\components\maintenance-timeline",
    "features\maintenance\components\priority-badge",
    "features\maintenance\pages\maintenance-list",
    "features\maintenance\pages\maintenance-detail",
    "features\maintenance\pages\maintenance-create",
    "features\maintenance\pages\maintenance-pending",
    "features\maintenance\pages\maintenance-urgent",
    "features\maintenance\services",
    "features\maintenance\models",
    "features\reports\components\report-filter",
    "features\reports\components\report-table",
    "features\reports\components\export-buttons",
    "features\reports\components\chart-viewer",
    "features\reports\pages\revenue-report",
    "features\reports\pages\occupancy-report",
    "features\reports\pages\tenant-report",
    "features\reports\pages\payment-report",
    "features\reports\pages\expense-report",
    "features\reports\pages\custom-report",
    "features\reports\services",
    "features\reports\models",
    "features\settings\components\general-settings",
    "features\settings\components\notification-settings",
    "features\settings\components\email-settings",
    "features\settings\components\user-profile",
    "features\settings\pages\settings-home",
    "features\settings\services",
    "features\settings\models",
    "features\catalogs\services",
    "features\catalogs\models",
    "layouts\main-layout",
    "layouts\auth-layout",
    "layouts\empty-layout"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder
}

Write-Host "✅ Estructura de carpetas creada exitosamente!"
```

### OPCIÓN 2: Script Bash (Linux/Mac)

```bash
#!/bin/bash
cd front/src/app

# Crear estructura completa
mkdir -p core/{guards,interceptors,services,models}
mkdir -p shared/components/{header,sidebar,footer,loading-spinner,confirmation-dialog,pagination,data-table,breadcrumb,alert,card,status-badge}
mkdir -p shared/{directives,pipes,validators}
mkdir -p features/auth/pages/{login,register,forgot-password,reset-password}
mkdir -p features/dashboard/components/{stats-card,revenue-chart,occupancy-chart,recent-payments,pending-tasks,alerts-widget}
mkdir -p features/dashboard/pages/dashboard-home
mkdir -p features/dashboard/{services,models}
mkdir -p features/buildings/components/{building-card,building-form,building-stats}
mkdir -p features/buildings/pages/{building-list,building-detail,building-create,building-edit}
mkdir -p features/buildings/{services,models}
mkdir -p features/units/components/{unit-card,unit-form,unit-filter,unit-status-indicator}
mkdir -p features/units/pages/{unit-list,unit-detail,unit-create,unit-edit,vacant-units}
mkdir -p features/units/{services,models}
mkdir -p features/tenants/components/{tenant-card,tenant-form,tenant-search,tenant-contracts}
mkdir -p features/tenants/pages/{tenant-list,tenant-detail,tenant-create,tenant-edit}
mkdir -p features/tenants/{services,models}
mkdir -p features/contracts/components/{contract-card,contract-form,contract-timeline,contract-payments,expiring-contracts}
mkdir -p features/contracts/pages/{contract-list,contract-detail,contract-create,contract-edit}
mkdir -p features/contracts/{services,models}
mkdir -p features/payments/components/{payment-card,payment-form,transaction-form,payment-history,overdue-payments,payment-calendar}
mkdir -p features/payments/pages/{payment-list,payment-detail,payment-create,payment-register}
mkdir -p features/payments/{services,models}
mkdir -p features/expenses/components/{expense-card,expense-form,expense-summary,expense-chart}
mkdir -p features/expenses/pages/{expense-list,expense-detail,expense-create,expense-analytics}
mkdir -p features/expenses/{services,models}
mkdir -p features/maintenance/components/{maintenance-card,maintenance-form,maintenance-timeline,priority-badge}
mkdir -p features/maintenance/pages/{maintenance-list,maintenance-detail,maintenance-create,maintenance-pending,maintenance-urgent}
mkdir -p features/maintenance/{services,models}
mkdir -p features/reports/components/{report-filter,report-table,export-buttons,chart-viewer}
mkdir -p features/reports/pages/{revenue-report,occupancy-report,tenant-report,payment-report,expense-report,custom-report}
mkdir -p features/reports/{services,models}
mkdir -p features/settings/components/{general-settings,notification-settings,email-settings,user-profile}
mkdir -p features/settings/pages/settings-home
mkdir -p features/settings/{services,models}
mkdir -p features/catalogs/{services,models}
mkdir -p layouts/{main-layout,auth-layout,empty-layout}

echo "✅ Estructura de carpetas creada exitosamente!"
```

---

## 📂 LISTA DE ARCHIVOS A CREAR (VACÍOS)

Una vez creadas las carpetas, crear archivos vacíos con:

```powershell
# CREAR ARCHIVOS VACÍOS EN POWERSHELL

# Core
New-Item -ItemType File -Force core\guards\auth.guard.ts
New-Item -ItemType File -Force core\guards\admin.guard.ts
New-Item -ItemType File -Force core\guards\unsaved-changes.guard.ts
New-Item -ItemType File -Force core\interceptors\auth.interceptor.ts
New-Item -ItemType File -Force core\interceptors\error.interceptor.ts
New-Item -ItemType File -Force core\interceptors\loading.interceptor.ts
New-Item -ItemType File -Force core\services\auth.service.ts
New-Item -ItemType File -Force core\services\storage.service.ts
New-Item -ItemType File -Force core\services\notification.service.ts
New-Item -ItemType File -Force core\services\loading.service.ts
New-Item -ItemType File -Force core\models\user.model.ts
New-Item -ItemType File -Force core\models\api-response.model.ts
New-Item -ItemType File -Force core\core.module.ts

# Shared Module
New-Item -ItemType File -Force shared\shared.module.ts

# Shared Components (ejemplo para header, replicar para todos)
New-Item -ItemType File -Force shared\components\header\header.component.ts
New-Item -ItemType File -Force shared\components\header\header.component.html
New-Item -ItemType File -Force shared\components\header\header.component.css

# Y así sucesivamente para CADA componente...
```

**NOTA:** Sería muy largo listar todos los archivos vacíos aquí. **Le recomiendo que después de crear las carpetas con el script anterior, me pida que le genere el código para cada módulo uno por uno.**

---

## ✅ ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. ✅ Crear estructura de carpetas (ejecutar script PowerShell/Bash)
2. ✅ **Core Module** → Guards, Interceptors, Servicios
3. ✅ **Shared Module** → Componentes reutilizables
4. ✅ **Layouts** → main-layout, auth-layout
5. ✅ **Auth Module** → Login, Register
6. ✅ **Dashboard Module**
7. ✅ **Catalogs Module**
8. ✅ **Buildings Module**
9. ✅ **Units Module**
10. ✅ **Tenants Module**
11. ✅ **Contracts Module**
12. ✅ **Payments Module**
13. ✅ **Expenses Module**
14. ✅ **Maintenance Module**
15. ✅ **Reports Module**
16. ✅ **Settings Module**

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecute el script PowerShell** para crear toda la estructura de carpetas
2. **Verifique** que se crearon correctamente
3. **Dígame qué módulo quiere que programe primero** y yo le generaré el código completo para ese módulo

Recomiendo empezar por:
- **Core Module** (servicios esenciales)
- **Shared Module** (componentes reutilizables)
- **Layouts** (estructura base)
- **Dashboard** (página principal)

¿Desea que proceda a generar el código para algún módulo en específico?
