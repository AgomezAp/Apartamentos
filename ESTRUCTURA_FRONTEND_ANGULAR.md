# 🏗️ ESTRUCTURA COMPLETA DEL FRONTEND ANGULAR
## Sistema de Gestión de Apartamentos

---

## 📁 ESTRUCTURA DE CARPETAS Y ARCHIVOS

```
front/src/app/
├── core/                           # Módulo Core (Singleton)
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── admin.guard.ts
│   │   └── unsaved-changes.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   └── loading.interceptor.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── storage.service.ts
│   │   ├── notification.service.ts
│   │   └── loading.service.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── api-response.model.ts
│   └── core.module.ts
│
├── shared/                         # Módulo Compartido
│   ├── components/
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   └── header.component.css
│   │   ├── sidebar/
│   │   │   ├── sidebar.component.ts
│   │   │   ├── sidebar.component.html
│   │   │   └── sidebar.component.css
│   │   ├── footer/
│   │   │   ├── footer.component.ts
│   │   │   ├── footer.component.html
│   │   │   └── footer.component.css
│   │   ├── loading-spinner/
│   │   │   ├── loading-spinner.component.ts
│   │   │   ├── loading-spinner.component.html
│   │   │   └── loading-spinner.component.css
│   │   ├── confirmation-dialog/
│   │   │   ├── confirmation-dialog.component.ts
│   │   │   ├── confirmation-dialog.component.html
│   │   │   └── confirmation-dialog.component.css
│   │   ├── pagination/
│   │   │   ├── pagination.component.ts
│   │   │   ├── pagination.component.html
│   │   │   └── pagination.component.css
│   │   ├── table/
│   │   │   ├── data-table.component.ts
│   │   │   ├── data-table.component.html
│   │   │   └── data-table.component.css
│   │   ├── breadcrumb/
│   │   │   ├── breadcrumb.component.ts
│   │   │   ├── breadcrumb.component.html
│   │   │   └── breadcrumb.component.css
│   │   ├── alert/
│   │   │   ├── alert.component.ts
│   │   │   ├── alert.component.html
│   │   │   └── alert.component.css
│   │   ├── card/
│   │   │   ├── card.component.ts
│   │   │   ├── card.component.html
│   │   │   └── card.component.css
│   │   └── status-badge/
│   │       ├── status-badge.component.ts
│   │       ├── status-badge.component.html
│   │       └── status-badge.component.css
│   ├── directives/
│   │   ├── tooltip.directive.ts
│   │   ├── click-outside.directive.ts
│   │   └── number-only.directive.ts
│   ├── pipes/
│   │   ├── currency-format.pipe.ts
│   │   ├── date-format.pipe.ts
│   │   ├── filter.pipe.ts
│   │   └── truncate.pipe.ts
│   ├── validators/
│   │   ├── custom-validators.ts
│   │   └── form-validators.ts
│   └── shared.module.ts
│
├── features/                       # Módulos de Funcionalidades
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.css
│   │   │   ├── register/
│   │   │   │   ├── register.component.ts
│   │   │   │   ├── register.component.html
│   │   │   │   └── register.component.css
│   │   │   ├── forgot-password/
│   │   │   │   ├── forgot-password.component.ts
│   │   │   │   ├── forgot-password.component.html
│   │   │   │   └── forgot-password.component.css
│   │   │   └── reset-password/
│   │   │       ├── reset-password.component.ts
│   │   │       ├── reset-password.component.html
│   │   │       └── reset-password.component.css
│   │   ├── auth-routing.module.ts
│   │   └── auth.module.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── stats-card/
│   │   │   │   ├── stats-card.component.ts
│   │   │   │   ├── stats-card.component.html
│   │   │   │   └── stats-card.component.css
│   │   │   ├── revenue-chart/
│   │   │   │   ├── revenue-chart.component.ts
│   │   │   │   ├── revenue-chart.component.html
│   │   │   │   └── revenue-chart.component.css
│   │   │   ├── occupancy-chart/
│   │   │   │   ├── occupancy-chart.component.ts
│   │   │   │   ├── occupancy-chart.component.html
│   │   │   │   └── occupancy-chart.component.css
│   │   │   ├── recent-payments/
│   │   │   │   ├── recent-payments.component.ts
│   │   │   │   ├── recent-payments.component.html
│   │   │   │   └── recent-payments.component.css
│   │   │   ├── pending-tasks/
│   │   │   │   ├── pending-tasks.component.ts
│   │   │   │   ├── pending-tasks.component.html
│   │   │   │   └── pending-tasks.component.css
│   │   │   └── alerts-widget/
│   │   │       ├── alerts-widget.component.ts
│   │   │       ├── alerts-widget.component.html
│   │   │       └── alerts-widget.component.css
│   │   ├── pages/
│   │   │   └── dashboard-home/
│   │   │       ├── dashboard-home.component.ts
│   │   │       ├── dashboard-home.component.html
│   │   │       └── dashboard-home.component.css
│   │   ├── services/
│   │   │   └── dashboard.service.ts
│   │   ├── models/
│   │   │   └── dashboard.model.ts
│   │   ├── dashboard-routing.module.ts
│   │   └── dashboard.module.ts
│   │
│   ├── buildings/
│   │   ├── components/
│   │   │   ├── building-card/
│   │   │   │   ├── building-card.component.ts
│   │   │   │   ├── building-card.component.html
│   │   │   │   └── building-card.component.css
│   │   │   ├── building-form/
│   │   │   │   ├── building-form.component.ts
│   │   │   │   ├── building-form.component.html
│   │   │   │   └── building-form.component.css
│   │   │   └── building-stats/
│   │   │       ├── building-stats.component.ts
│   │   │       ├── building-stats.component.html
│   │   │       └── building-stats.component.css
│   │   ├── pages/
│   │   │   ├── building-list/
│   │   │   │   ├── building-list.component.ts
│   │   │   │   ├── building-list.component.html
│   │   │   │   └── building-list.component.css
│   │   │   ├── building-detail/
│   │   │   │   ├── building-detail.component.ts
│   │   │   │   ├── building-detail.component.html
│   │   │   │   └── building-detail.component.css
│   │   │   ├── building-create/
│   │   │   │   ├── building-create.component.ts
│   │   │   │   ├── building-create.component.html
│   │   │   │   └── building-create.component.css
│   │   │   └── building-edit/
│   │   │       ├── building-edit.component.ts
│   │   │       ├── building-edit.component.html
│   │   │       └── building-edit.component.css
│   │   ├── services/
│   │   │   └── building.service.ts
│   │   ├── models/
│   │   │   └── building.model.ts
│   │   ├── buildings-routing.module.ts
│   │   └── buildings.module.ts
│   │
│   ├── units/
│   │   ├── components/
│   │   │   ├── unit-card/
│   │   │   │   ├── unit-card.component.ts
│   │   │   │   ├── unit-card.component.html
│   │   │   │   └── unit-card.component.css
│   │   │   ├── unit-form/
│   │   │   │   ├── unit-form.component.ts
│   │   │   │   ├── unit-form.component.html
│   │   │   │   └── unit-form.component.css
│   │   │   ├── unit-filter/
│   │   │   │   ├── unit-filter.component.ts
│   │   │   │   ├── unit-filter.component.html
│   │   │   │   └── unit-filter.component.css
│   │   │   └── unit-status-indicator/
│   │   │       ├── unit-status-indicator.component.ts
│   │   │       ├── unit-status-indicator.component.html
│   │   │       └── unit-status-indicator.component.css
│   │   ├── pages/
│   │   │   ├── unit-list/
│   │   │   │   ├── unit-list.component.ts
│   │   │   │   ├── unit-list.component.html
│   │   │   │   └── unit-list.component.css
│   │   │   ├── unit-detail/
│   │   │   │   ├── unit-detail.component.ts
│   │   │   │   ├── unit-detail.component.html
│   │   │   │   └── unit-detail.component.css
│   │   │   ├── unit-create/
│   │   │   │   ├── unit-create.component.ts
│   │   │   │   ├── unit-create.component.html
│   │   │   │   └── unit-create.component.css
│   │   │   ├── unit-edit/
│   │   │   │   ├── unit-edit.component.ts
│   │   │   │   ├── unit-edit.component.html
│   │   │   │   └── unit-edit.component.css
│   │   │   └── vacant-units/
│   │   │       ├── vacant-units.component.ts
│   │   │       ├── vacant-units.component.html
│   │   │       └── vacant-units.component.css
│   │   ├── services/
│   │   │   └── unit.service.ts
│   │   ├── models/
│   │   │   └── unit.model.ts
│   │   ├── units-routing.module.ts
│   │   └── units.module.ts
│   │
│   ├── tenants/
│   │   ├── components/
│   │   │   ├── tenant-card/
│   │   │   │   ├── tenant-card.component.ts
│   │   │   │   ├── tenant-card.component.html
│   │   │   │   └── tenant-card.component.css
│   │   │   ├── tenant-form/
│   │   │   │   ├── tenant-form.component.ts
│   │   │   │   ├── tenant-form.component.html
│   │   │   │   └── tenant-form.component.css
│   │   │   ├── tenant-search/
│   │   │   │   ├── tenant-search.component.ts
│   │   │   │   ├── tenant-search.component.html
│   │   │   │   └── tenant-search.component.css
│   │   │   └── tenant-contracts/
│   │   │       ├── tenant-contracts.component.ts
│   │   │       ├── tenant-contracts.component.html
│   │   │       └── tenant-contracts.component.css
│   │   ├── pages/
│   │   │   ├── tenant-list/
│   │   │   │   ├── tenant-list.component.ts
│   │   │   │   ├── tenant-list.component.html
│   │   │   │   └── tenant-list.component.css
│   │   │   ├── tenant-detail/
│   │   │   │   ├── tenant-detail.component.ts
│   │   │   │   ├── tenant-detail.component.html
│   │   │   │   └── tenant-detail.component.css
│   │   │   ├── tenant-create/
│   │   │   │   ├── tenant-create.component.ts
│   │   │   │   ├── tenant-create.component.html
│   │   │   │   └── tenant-create.component.css
│   │   │   └── tenant-edit/
│   │   │       ├── tenant-edit.component.ts
│   │   │       ├── tenant-edit.component.html
│   │   │       └── tenant-edit.component.css
│   │   ├── services/
│   │   │   └── tenant.service.ts
│   │   ├── models/
│   │   │   └── tenant.model.ts
│   │   ├── tenants-routing.module.ts
│   │   └── tenants.module.ts
│   │
│   ├── contracts/
│   │   ├── components/
│   │   │   ├── contract-card/
│   │   │   │   ├── contract-card.component.ts
│   │   │   │   ├── contract-card.component.html
│   │   │   │   └── contract-card.component.css
│   │   │   ├── contract-form/
│   │   │   │   ├── contract-form.component.ts
│   │   │   │   ├── contract-form.component.html
│   │   │   │   └── contract-form.component.css
│   │   │   ├── contract-timeline/
│   │   │   │   ├── contract-timeline.component.ts
│   │   │   │   ├── contract-timeline.component.html
│   │   │   │   └── contract-timeline.component.css
│   │   │   ├── contract-payments/
│   │   │   │   ├── contract-payments.component.ts
│   │   │   │   ├── contract-payments.component.html
│   │   │   │   └── contract-payments.component.css
│   │   │   └── expiring-contracts/
│   │   │       ├── expiring-contracts.component.ts
│   │   │       ├── expiring-contracts.component.html
│   │   │       └── expiring-contracts.component.css
│   │   ├── pages/
│   │   │   ├── contract-list/
│   │   │   │   ├── contract-list.component.ts
│   │   │   │   ├── contract-list.component.html
│   │   │   │   └── contract-list.component.css
│   │   │   ├── contract-detail/
│   │   │   │   ├── contract-detail.component.ts
│   │   │   │   ├── contract-detail.component.html
│   │   │   │   └── contract-detail.component.css
│   │   │   ├── contract-create/
│   │   │   │   ├── contract-create.component.ts
│   │   │   │   ├── contract-create.component.html
│   │   │   │   └── contract-create.component.css
│   │   │   └── contract-edit/
│   │   │       ├── contract-edit.component.ts
│   │   │       ├── contract-edit.component.html
│   │   │       └── contract-edit.component.css
│   │   ├── services/
│   │   │   └── contract.service.ts
│   │   ├── models/
│   │   │   └── contract.model.ts
│   │   ├── contracts-routing.module.ts
│   │   └── contracts.module.ts
│   │
│   ├── payments/
│   │   ├── components/
│   │   │   ├── payment-card/
│   │   │   │   ├── payment-card.component.ts
│   │   │   │   ├── payment-card.component.html
│   │   │   │   └── payment-card.component.css
│   │   │   ├── payment-form/
│   │   │   │   ├── payment-form.component.ts
│   │   │   │   ├── payment-form.component.html
│   │   │   │   └── payment-form.component.css
│   │   │   ├── transaction-form/
│   │   │   │   ├── transaction-form.component.ts
│   │   │   │   ├── transaction-form.component.html
│   │   │   │   └── transaction-form.component.css
│   │   │   ├── payment-history/
│   │   │   │   ├── payment-history.component.ts
│   │   │   │   ├── payment-history.component.html
│   │   │   │   └── payment-history.component.css
│   │   │   ├── overdue-payments/
│   │   │   │   ├── overdue-payments.component.ts
│   │   │   │   ├── overdue-payments.component.html
│   │   │   │   └── overdue-payments.component.css
│   │   │   └── payment-calendar/
│   │   │       ├── payment-calendar.component.ts
│   │   │       ├── payment-calendar.component.html
│   │   │       └── payment-calendar.component.css
│   │   ├── pages/
│   │   │   ├── payment-list/
│   │   │   │   ├── payment-list.component.ts
│   │   │   │   ├── payment-list.component.html
│   │   │   │   └── payment-list.component.css
│   │   │   ├── payment-detail/
│   │   │   │   ├── payment-detail.component.ts
│   │   │   │   ├── payment-detail.component.html
│   │   │   │   └── payment-detail.component.css
│   │   │   ├── payment-create/
│   │   │   │   ├── payment-create.component.ts
│   │   │   │   ├── payment-create.component.html
│   │   │   │   └── payment-create.component.css
│   │   │   └── payment-register/
│   │   │       ├── payment-register.component.ts
│   │   │       ├── payment-register.component.html
│   │   │       └── payment-register.component.css
│   │   ├── services/
│   │   │   └── payment.service.ts
│   │   ├── models/
│   │   │   └── payment.model.ts
│   │   ├── payments-routing.module.ts
│   │   └── payments.module.ts
│   │
│   ├── expenses/
│   │   ├── components/
│   │   │   ├── expense-card/
│   │   │   │   ├── expense-card.component.ts
│   │   │   │   ├── expense-card.component.html
│   │   │   │   └── expense-card.component.css
│   │   │   ├── expense-form/
│   │   │   │   ├── expense-form.component.ts
│   │   │   │   ├── expense-form.component.html
│   │   │   │   └── expense-form.component.css
│   │   │   ├── expense-summary/
│   │   │   │   ├── expense-summary.component.ts
│   │   │   │   ├── expense-summary.component.html
│   │   │   │   └── expense-summary.component.css
│   │   │   └── expense-chart/
│   │   │       ├── expense-chart.component.ts
│   │   │       ├── expense-chart.component.html
│   │   │       └── expense-chart.component.css
│   │   ├── pages/
│   │   │   ├── expense-list/
│   │   │   │   ├── expense-list.component.ts
│   │   │   │   ├── expense-list.component.html
│   │   │   │   └── expense-list.component.css
│   │   │   ├── expense-detail/
│   │   │   │   ├── expense-detail.component.ts
│   │   │   │   ├── expense-detail.component.html
│   │   │   │   └── expense-detail.component.css
│   │   │   ├── expense-create/
│   │   │   │   ├── expense-create.component.ts
│   │   │   │   ├── expense-create.component.html
│   │   │   │   └── expense-create.component.css
│   │   │   └── expense-analytics/
│   │   │       ├── expense-analytics.component.ts
│   │   │       ├── expense-analytics.component.html
│   │   │       └── expense-analytics.component.css
│   │   ├── services/
│   │   │   └── expense.service.ts
│   │   ├── models/
│   │   │   └── expense.model.ts
│   │   ├── expenses-routing.module.ts
│   │   └── expenses.module.ts
│   │
│   ├── maintenance/
│   │   ├── components/
│   │   │   ├── maintenance-card/
│   │   │   │   ├── maintenance-card.component.ts
│   │   │   │   ├── maintenance-card.component.html
│   │   │   │   └── maintenance-card.component.css
│   │   │   ├── maintenance-form/
│   │   │   │   ├── maintenance-form.component.ts
│   │   │   │   ├── maintenance-form.component.html
│   │   │   │   └── maintenance-form.component.css
│   │   │   ├── maintenance-timeline/
│   │   │   │   ├── maintenance-timeline.component.ts
│   │   │   │   ├── maintenance-timeline.component.html
│   │   │   │   └── maintenance-timeline.component.css
│   │   │   └── priority-badge/
│   │   │       ├── priority-badge.component.ts
│   │   │       ├── priority-badge.component.html
│   │   │       └── priority-badge.component.css
│   │   ├── pages/
│   │   │   ├── maintenance-list/
│   │   │   │   ├── maintenance-list.component.ts
│   │   │   │   ├── maintenance-list.component.html
│   │   │   │   └── maintenance-list.component.css
│   │   │   ├── maintenance-detail/
│   │   │   │   ├── maintenance-detail.component.ts
│   │   │   │   ├── maintenance-detail.component.html
│   │   │   │   └── maintenance-detail.component.css
│   │   │   ├── maintenance-create/
│   │   │   │   ├── maintenance-create.component.ts
│   │   │   │   ├── maintenance-create.component.html
│   │   │   │   └── maintenance-create.component.css
│   │   │   ├── maintenance-pending/
│   │   │   │   ├── maintenance-pending.component.ts
│   │   │   │   ├── maintenance-pending.component.html
│   │   │   │   └── maintenance-pending.component.css
│   │   │   └── maintenance-urgent/
│   │   │       ├── maintenance-urgent.component.ts
│   │   │       ├── maintenance-urgent.component.html
│   │   │       └── maintenance-urgent.component.css
│   │   ├── services/
│   │   │   └── maintenance.service.ts
│   │   ├── models/
│   │   │   └── maintenance.model.ts
│   │   ├── maintenance-routing.module.ts
│   │   └── maintenance.module.ts
│   │
│   ├── reports/
│   │   ├── components/
│   │   │   ├── report-filter/
│   │   │   │   ├── report-filter.component.ts
│   │   │   │   ├── report-filter.component.html
│   │   │   │   └── report-filter.component.css
│   │   │   ├── report-table/
│   │   │   │   ├── report-table.component.ts
│   │   │   │   ├── report-table.component.html
│   │   │   │   └── report-table.component.css
│   │   │   ├── export-buttons/
│   │   │   │   ├── export-buttons.component.ts
│   │   │   │   ├── export-buttons.component.html
│   │   │   │   └── export-buttons.component.css
│   │   │   └── chart-viewer/
│   │   │       ├── chart-viewer.component.ts
│   │   │       ├── chart-viewer.component.html
│   │   │       └── chart-viewer.component.css
│   │   ├── pages/
│   │   │   ├── revenue-report/
│   │   │   │   ├── revenue-report.component.ts
│   │   │   │   ├── revenue-report.component.html
│   │   │   │   └── revenue-report.component.css
│   │   │   ├── occupancy-report/
│   │   │   │   ├── occupancy-report.component.ts
│   │   │   │   ├── occupancy-report.component.html
│   │   │   │   └── occupancy-report.component.css
│   │   │   ├── tenant-report/
│   │   │   │   ├── tenant-report.component.ts
│   │   │   │   ├── tenant-report.component.html
│   │   │   │   └── tenant-report.component.css
│   │   │   ├── payment-report/
│   │   │   │   ├── payment-report.component.ts
│   │   │   │   ├── payment-report.component.html
│   │   │   │   └── payment-report.component.css
│   │   │   ├── expense-report/
│   │   │   │   ├── expense-report.component.ts
│   │   │   │   ├── expense-report.component.html
│   │   │   │   └── expense-report.component.css
│   │   │   └── custom-report/
│   │   │       ├── custom-report.component.ts
│   │   │       ├── custom-report.component.html
│   │   │       └── custom-report.component.css
│   │   ├── services/
│   │   │   └── report.service.ts
│   │   ├── models/
│   │   │   └── report.model.ts
│   │   ├── reports-routing.module.ts
│   │   └── reports.module.ts
│   │
│   ├── settings/
│   │   ├── components/
│   │   │   ├── general-settings/
│   │   │   │   ├── general-settings.component.ts
│   │   │   │   ├── general-settings.component.html
│   │   │   │   └── general-settings.component.css
│   │   │   ├── notification-settings/
│   │   │   │   ├── notification-settings.component.ts
│   │   │   │   ├── notification-settings.component.html
│   │   │   │   └── notification-settings.component.css
│   │   │   ├── email-settings/
│   │   │   │   ├── email-settings.component.ts
│   │   │   │   ├── email-settings.component.html
│   │   │   │   └── email-settings.component.css
│   │   │   └── user-profile/
│   │   │       ├── user-profile.component.ts
│   │   │       ├── user-profile.component.html
│   │   │       └── user-profile.component.css
│   │   ├── pages/
│   │   │   └── settings-home/
│   │   │       ├── settings-home.component.ts
│   │   │       ├── settings-home.component.html
│   │   │       └── settings-home.component.css
│   │   ├── services/
│   │   │   └── settings.service.ts
│   │   ├── models/
│   │   │   └── settings.model.ts
│   │   ├── settings-routing.module.ts
│   │   └── settings.module.ts
│   │
│   └── catalogs/
│       ├── services/
│       │   └── catalog.service.ts
│       ├── models/
│       │   └── catalog.model.ts
│       └── catalogs.module.ts
│
├── layouts/                        # Layouts de la aplicación
│   ├── main-layout/
│   │   ├── main-layout.component.ts
│   │   ├── main-layout.component.html
│   │   └── main-layout.component.css
│   ├── auth-layout/
│   │   ├── auth-layout.component.ts
│   │   ├── auth-layout.component.html
│   │   └── auth-layout.component.css
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

## 📋 DETALLE DE CADA MÓDULO

### 1. CORE MODULE (Singleton)
**Servicios principales del sistema**

#### Guards:
- **auth.guard.ts**: Protege rutas que requieren autenticación
- **admin.guard.ts**: Protege rutas de administrador
- **unsaved-changes.guard.ts**: Previene salir de formularios sin guardar

#### Interceptors:
- **auth.interceptor.ts**: Añade token JWT a las peticiones
- **error.interceptor.ts**: Maneja errores globales
- **loading.interceptor.ts**: Muestra/oculta loading en peticiones HTTP

#### Services:
- **auth.service.ts**: Autenticación y autorización
- **storage.service.ts**: Manejo de localStorage/sessionStorage
- **notification.service.ts**: Toast/alertas globales
- **loading.service.ts**: Estado global de loading

---

### 2. SHARED MODULE
**Componentes, directivas y pipes reutilizables**

#### Componentes:
- **header**: Cabecera con navegación
- **sidebar**: Menú lateral
- **footer**: Pie de página
- **loading-spinner**: Spinner de carga
- **confirmation-dialog**: Modal de confirmación
- **pagination**: Paginación personalizada
- **data-table**: Tabla de datos genérica
- **breadcrumb**: Migas de pan
- **alert**: Alertas/notificaciones
- **card**: Tarjeta contenedora
- **status-badge**: Badge de estado

#### Directives:
- **tooltip.directive.ts**: Tooltip personalizado
- **click-outside.directive.ts**: Detecta clicks fuera del elemento
- **number-only.directive.ts**: Solo permite números

#### Pipes:
- **currency-format.pipe.ts**: Formatea moneda colombiana
- **date-format.pipe.ts**: Formatea fechas
- **filter.pipe.ts**: Filtrado de arrays
- **truncate.pipe.ts**: Trunca texto largo

---

### 3. FEATURES MODULES

#### 3.1 BUILDINGS MODULE (Edificios)
**Endpoints del backend:**
- GET /api/buildings
- GET /api/buildings/:id
- POST /api/buildings
- PUT /api/buildings/:id
- DELETE /api/buildings/:id

**Componentes:**
- **building-card**: Tarjeta de edificio
- **building-form**: Formulario crear/editar
- **building-stats**: Estadísticas del edificio

**Páginas:**
- **building-list**: Lista de edificios
- **building-detail**: Detalle de edificio
- **building-create**: Crear edificio
- **building-edit**: Editar edificio

---

#### 3.2 UNITS MODULE (Unidades)
**Endpoints del backend:**
- GET /api/units
- GET /api/units/:id
- POST /api/units
- PUT /api/units/:id
- DELETE /api/units/:id
- GET /api/units/vacant
- GET /api/units/reports/vacancy

**Componentes:**
- **unit-card**: Tarjeta de unidad
- **unit-form**: Formulario crear/editar
- **unit-filter**: Filtros de búsqueda
- **unit-status-indicator**: Indicador de estado

**Páginas:**
- **unit-list**: Lista de unidades
- **unit-detail**: Detalle de unidad
- **unit-create**: Crear unidad
- **unit-edit**: Editar unidad
- **vacant-units**: Unidades desocupadas

---

#### 3.3 TENANTS MODULE (Arrendatarios)
**Endpoints del backend:**
- GET /api/tenants
- GET /api/tenants/:id
- POST /api/tenants
- PUT /api/tenants/:id
- DELETE /api/tenants/:id

**Componentes:**
- **tenant-card**: Tarjeta de inquilino
- **tenant-form**: Formulario crear/editar
- **tenant-search**: Búsqueda de inquilinos
- **tenant-contracts**: Contratos del inquilino

**Páginas:**
- **tenant-list**: Lista de inquilinos
- **tenant-detail**: Detalle de inquilino
- **tenant-create**: Crear inquilino
- **tenant-edit**: Editar inquilino

---

#### 3.4 CONTRACTS MODULE (Contratos)
**Endpoints del backend:**
- GET /api/contracts
- GET /api/contracts/:id
- POST /api/contracts
- PUT /api/contracts/:id
- POST /api/contracts/:id/finish
- GET /api/contracts/expiring

**Componentes:**
- **contract-card**: Tarjeta de contrato
- **contract-form**: Formulario crear/editar
- **contract-timeline**: Línea de tiempo del contrato
- **contract-payments**: Pagos del contrato
- **expiring-contracts**: Contratos por vencer

**Páginas:**
- **contract-list**: Lista de contratos
- **contract-detail**: Detalle de contrato
- **contract-create**: Crear contrato
- **contract-edit**: Editar contrato

---

#### 3.5 PAYMENTS MODULE (Pagos)
**Endpoints del backend:**
- GET /api/payments
- GET /api/payments/:id
- POST /api/payments
- PUT /api/payments/:id
- POST /api/payments/:id/transactions
- GET /api/payments/overdue
- POST /api/payments/generate-monthly

**Componentes:**
- **payment-card**: Tarjeta de pago
- **payment-form**: Formulario crear pago
- **transaction-form**: Registrar transacción
- **payment-history**: Historial de pagos
- **overdue-payments**: Pagos vencidos
- **payment-calendar**: Calendario de pagos

**Páginas:**
- **payment-list**: Lista de pagos
- **payment-detail**: Detalle de pago
- **payment-create**: Crear pago
- **payment-register**: Registrar pago/transacción

---

#### 3.6 EXPENSES MODULE (Gastos)
**Endpoints del backend:**
- GET /api/expenses
- GET /api/expenses/:id
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id
- GET /api/expenses/summary
- GET /api/expenses/by-category

**Componentes:**
- **expense-card**: Tarjeta de gasto
- **expense-form**: Formulario crear/editar
- **expense-summary**: Resumen de gastos
- **expense-chart**: Gráficos de gastos

**Páginas:**
- **expense-list**: Lista de gastos
- **expense-detail**: Detalle de gasto
- **expense-create**: Crear gasto
- **expense-analytics**: Analítica de gastos

---

#### 3.7 MAINTENANCE MODULE (Mantenimiento)
**Endpoints del backend:**
- GET /api/maintenance-requests
- GET /api/maintenance-requests/:id
- POST /api/maintenance-requests
- PUT /api/maintenance-requests/:id
- GET /api/maintenance-requests/pending
- GET /api/maintenance-requests/urgent
- GET /api/maintenance-requests/stats

**Componentes:**
- **maintenance-card**: Tarjeta de solicitud
- **maintenance-form**: Formulario crear/editar
- **maintenance-timeline**: Línea de tiempo
- **priority-badge**: Badge de prioridad

**Páginas:**
- **maintenance-list**: Lista de solicitudes
- **maintenance-detail**: Detalle de solicitud
- **maintenance-create**: Crear solicitud
- **maintenance-pending**: Solicitudes pendientes
- **maintenance-urgent**: Solicitudes urgentes

---

#### 3.8 REPORTS MODULE (Reportes)
**Endpoints del backend:**
- GET /api/reports/revenue
- GET /api/reports/occupancy
- GET /api/reports/tenants
- GET /api/reports/payments
- GET /api/reports/expenses

**Componentes:**
- **report-filter**: Filtros de reportes
- **report-table**: Tabla de reportes
- **export-buttons**: Botones de exportación
- **chart-viewer**: Visualizador de gráficos

**Páginas:**
- **revenue-report**: Reporte de ingresos
- **occupancy-report**: Reporte de ocupación
- **tenant-report**: Reporte de inquilinos
- **payment-report**: Reporte de pagos
- **expense-report**: Reporte de gastos
- **custom-report**: Reporte personalizado

---

#### 3.9 DASHBOARD MODULE
**Endpoints del backend:**
- GET /api/dashboard/stats
- GET /api/dashboard/buildings
- GET /api/dashboard/revenue
- GET /api/dashboard/top-tenants

**Componentes:**
- **stats-card**: Tarjeta de estadística
- **revenue-chart**: Gráfico de ingresos
- **occupancy-chart**: Gráfico de ocupación
- **recent-payments**: Pagos recientes
- **pending-tasks**: Tareas pendientes
- **alerts-widget**: Widget de alertas

---

#### 3.10 SETTINGS MODULE (Configuración)
**Endpoints del backend:**
- GET /api/settings
- PUT /api/settings/:key

**Componentes:**
- **general-settings**: Configuración general
- **notification-settings**: Configuración de notificaciones
- **email-settings**: Configuración de email
- **user-profile**: Perfil de usuario

---

#### 3.11 CATALOGS MODULE (Catálogos)
**Endpoints del backend:**
- GET /api/catalogs/unit-types
- GET /api/catalogs/payment-statuses
- GET /api/catalogs/expense-categories
- GET /api/catalogs/service-types

**Servicio:**
- **catalog.service.ts**: Obtiene catálogos

---

## 🔐 GUARDS NECESARIOS

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = () => {
  // Verifica si el usuario está autenticado
}

// admin.guard.ts
export const adminGuard: CanActivateFn = () => {
  // Verifica si el usuario es administrador
}

// unsaved-changes.guard.ts
export const unsavedChangesGuard: CanDeactivateFn<any> = () => {
  // Verifica si hay cambios sin guardar
}
```

---

## 🌐 SERVICIOS HTTP

Cada módulo tendrá su servicio correspondiente que consume la API:

```typescript
// Ejemplo: building.service.ts
@Injectable({ providedIn: 'root' })
export class BuildingService {
  private apiUrl = 'http://localhost:3000/api/buildings';

  getAll(params?: any): Observable<any> { }
  getById(id: number): Observable<any> { }
  create(building: Building): Observable<any> { }
  update(id: number, building: Partial<Building>): Observable<any> { }
  delete(id: number): Observable<any> { }
}
```

---

## 📊 MODELOS/INTERFACES

```typescript
// building.model.ts
export interface Building {
  id?: number;
  name: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  total_floors?: number;
  total_units: number;
  max_capacity: number;
  description?: string;
  construction_year?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// unit.model.ts
export interface Unit {
  id?: number;
  building_id: number;
  unit_type_id: number;
  unit_number: string;
  floor: number;
  area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  rental_price: number;
  is_occupied: boolean;
  description?: string;
  features?: any;
  created_at?: string;
  updated_at?: string;
}

// tenant.model.ts
export interface Tenant {
  id?: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  occupation?: string;
  company_name?: string;
  monthly_income?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// contract.model.ts
export interface Contract {
  id?: number;
  unit_id: number;
  tenant_id: number;
  contract_number: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  payment_day: number;
  status: string;
  notes?: string;
  has_rent_increase: boolean;
  rent_increase_percentage?: number;
  rent_increase_frequency_months?: number;
  created_at?: string;
  updated_at?: string;
}

// payment.model.ts
export interface Payment {
  id?: number;
  contract_id: number;
  payment_status_id: number;
  period_month: number;
  period_year: number;
  due_date: string;
  payment_date?: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// expense.model.ts
export interface Expense {
  id?: number;
  building_id: number;
  category_id: number;
  description: string;
  amount: number;
  expense_date: string;
  payment_method?: string;
  reference_number?: string;
  receipt_file_path?: string;
  notes?: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
}

// maintenance.model.ts
export interface MaintenanceRequest {
  id?: number;
  unit_id: number;
  tenant_id?: number;
  category: string;
  priority: string;
  status: string;
  description: string;
  reported_date: string;
  scheduled_date?: string;
  completed_date?: string;
  assigned_to?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// api-response.model.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 🛣️ RUTAS PRINCIPALES

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      { 
        path: 'buildings', 
        loadChildren: () => import('./features/buildings/buildings.module').then(m => m.BuildingsModule)
      },
      { 
        path: 'units', 
        loadChildren: () => import('./features/units/units.module').then(m => m.UnitsModule)
      },
      { 
        path: 'tenants', 
        loadChildren: () => import('./features/tenants/tenants.module').then(m => m.TenantsModule)
      },
      { 
        path: 'contracts', 
        loadChildren: () => import('./features/contracts/contracts.module').then(m => m.ContractsModule)
      },
      { 
        path: 'payments', 
        loadChildren: () => import('./features/payments/payments.module').then(m => m.PaymentsModule)
      },
      { 
        path: 'expenses', 
        loadChildren: () => import('./features/expenses/expenses.module').then(m => m.ExpensesModule)
      },
      { 
        path: 'maintenance', 
        loadChildren: () => import('./features/maintenance/maintenance.module').then(m => m.MaintenanceModule)
      },
      { 
        path: 'reports', 
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule)
      },
      { 
        path: 'settings', 
        loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
      },
    ]
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  { path: '**', redirectTo: 'dashboard' }
];
```

---

## 📦 DEPENDENCIAS NECESARIAS

```json
{
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/router": "^17.0.0",
    "rxjs": "~7.8.0",
    "chart.js": "^4.4.0",
    "ng2-charts": "^5.0.0",
    "ngx-toastr": "^17.0.2",
    "sweetalert2": "^11.0.0"
  }
}
```

---

## ✅ ORDEN DE CREACIÓN RECOMENDADO

1. ✅ **Core Module** (guards, interceptors, servicios core)
2. ✅ **Shared Module** (componentes compartidos, pipes, directivas)
3. ✅ **Layouts** (main-layout, auth-layout)
4. ✅ **Auth Module** (login, register)
5. ✅ **Dashboard Module**
6. ✅ **Catalogs Module** (necesario para otros módulos)
7. ✅ **Buildings Module**
8. ✅ **Units Module**
9. ✅ **Tenants Module**
10. ✅ **Contracts Module**
11. ✅ **Payments Module**
12. ✅ **Expenses Module**
13. ✅ **Maintenance Module**
14. ✅ **Reports Module**
15. ✅ **Settings Module**

---

## 🎨 CONSIDERACIONES DE DISEÑO

- **Framework CSS**: RecomiendoBootstrap 5 o Tailwind CSS
- **Iconos**: Font Awesome o Material Icons
- **Gráficos**: Chart.js con ng2-charts
- **Notificaciones**: ngx-toastr o SweetAlert2
- **Validaciones**: Angular Reactive Forms
- **Estado**: RxJS BehaviorSubjects
- **HTTP**: HttpClient con Interceptors

---

## 🚀 PRÓXIMOS PASOS

Una vez tenga esta estructura, comenzaremos a programar módulo por módulo.

¿Desea que comience a crear los archivos? ¿Qué módulo quiere que desarrollemos primero?
