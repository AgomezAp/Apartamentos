import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta raíz - redirige al login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Rutas de autenticación
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/pages/auth.module').then(m => m.AuthModule)
  },

  // Dashboard - ruta protegida
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard-home/dashboard-home.component')
      .then(m => m.DashboardHomeComponent)
  },

  // Edificios
  {
    path: 'buildings',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/buildings/pages/building-list/building-list.component')
          .then(m => m.BuildingListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/buildings/pages/building-create/building-create.component')
          .then(m => m.BuildingCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/buildings/pages/building-detail/building-detail.component')
          .then(m => m.BuildingDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/buildings/pages/building-edit/building-edit.component')
          .then(m => m.BuildingEditComponent)
      }
    ]
  },

  // Unidades
  {
    path: 'units',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/units/pages/unit-list/unit-list.component')
          .then(m => m.UnitListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/units/pages/unit-create/unit-create.component')
          .then(m => m.UnitCreateComponent)
      },
      {
        path: 'vacant',
        loadComponent: () => import('./features/units/pages/vacant-units/vacant-units.component')
          .then(m => m.VacantUnitsComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/units/pages/unit-detail/unit-detail.component')
          .then(m => m.UnitDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/units/pages/unit-edit/unit-edit.component')
          .then(m => m.UnitEditComponent)
      }
    ]
  },

  // Inquilinos
  {
    path: 'tenants',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/tenants/pages/tenant-list/tenant-list.component')
          .then(m => m.TenantListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/tenants/pages/tenant-create/tenant-create.component')
          .then(m => m.TenantCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/tenants/pages/tenant-detail/tenant-detail.component')
          .then(m => m.TenantDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/tenants/pages/tenant-edit/tenant-edit.component')
          .then(m => m.TenantEditComponent)
      }
    ]
  },

  // Contratos
  {
    path: 'contracts',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/contracts/pages/contracts-list/contracts-list.component')
          .then(m => m.ContractsListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/contracts/pages/contracts-create/contracts-create.component')
          .then(m => m.ContractsCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/contracts/pages/contracts-detail/contracts-detail.component')
          .then(m => m.ContractsDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/contracts/pages/contracts-edit/contracts-edit.component')
          .then(m => m.ContractsEditComponent)
      }
    ]
  },

  // Pagos
  {
    path: 'payments',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/payments/pages/payment-list/payment-list.component')
          .then(m => m.PaymentListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/payments/pages/payment-create/payment-create.component')
          .then(m => m.PaymentCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/payments/pages/payment-detail/payment-detail.component')
          .then(m => m.PaymentDetailComponent)
      }
    ]
  },

  // Gastos
  {
    path: 'expenses',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/expenses/pages/expense-list/expense-list.component')
          .then(m => m.ExpenseListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/expenses/pages/expense-create/expense-create.component')
          .then(m => m.ExpenseCreateComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/expenses/pages/expense-analytics/expense-analytics.component')
          .then(m => m.ExpenseAnalyticsComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/expenses/pages/expense-detail/expense-detail.component')
          .then(m => m.ExpenseDetailComponent)
      }
    ]
  },

  // Mantenimiento
  {
    path: 'maintenance',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/maintenance/pages/maintenance-list/maintenance-list.component')
          .then(m => m.MaintenanceListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/maintenance/pages/maintenance-create/maintenance-create.component')
          .then(m => m.MaintenanceCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/maintenance/pages/maintenance-detail/maintenance-detail.component')
          .then(m => m.MaintenanceDetailComponent)
      }
    ]
  },

  // Reportes
  {
    path: 'reports',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/reports/pages/income-report/income-report.component')
          .then(m => m.IncomeReportComponent)
      },
      {
        path: 'income',
        loadComponent: () => import('./features/reports/pages/income-report/income-report.component')
          .then(m => m.IncomeReportComponent)
      },
      {
        path: 'revenue',
        loadComponent: () => import('./features/reports/pages/revenue-report/revenue-report.component')
          .then(m => m.RevenueReportComponent)
      },
      {
        path: 'occupancy',
        loadComponent: () => import('./features/reports/pages/occupancy-report/occupancy-report.component')
          .then(m => m.OccupancyReportComponent)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./features/reports/pages/expense-report/expense-report.component')
          .then(m => m.ExpenseReportComponent)
      },
      {
        path: 'tenants',
        loadComponent: () => import('./features/reports/pages/tenant-report/tenant-report.component')
          .then(m => m.TenantReportComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/reports/pages/payment-report/payment-report.component')
          .then(m => m.PaymentReportComponent)
      }
    ]
  },

  // Configuración
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/pages/settings-home/settings-home.component')
      .then(m => m.SettingsHomeComponent)
  },

  // Catálogos
  {
    path: 'catalogs',
    loadChildren: () => import('./features/catalogs/catalogs.module').then(m => m.CatalogsModule)
  },

  // Ruta 404 - No encontrado
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

