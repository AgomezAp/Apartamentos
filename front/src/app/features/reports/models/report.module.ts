// Report Interfaces
export interface Report {
  report_id: number;
  report_type: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  generated_by: number;
  generated_at: string;
  parameters?: ReportParameters;
  data?: any;
}

export interface ReportParameters {
  building_id?: number;
  unit_id?: number;
  tenant_id?: number;
  status?: string;
  category?: string;
  group_by?: 'month' | 'quarter' | 'year';
  include_details?: boolean;
}

export interface ReportFilter {
  report_type?: string;
  start_date?: string;
  end_date?: string;
  building_id?: number;
  unit_id?: number;
  tenant_id?: number;
  status?: string;
}

// Financial Report Data
export interface FinancialReport {
  period: string;
  income: {
    rent: number;
    services: number;
    other: number;
    total: number;
  };
  expenses: {
    maintenance: number;
    services: number;
    administration: number;
    other: number;
    total: number;
  };
  net: number;
  profit_margin: number;
}

// Occupancy Report Data
export interface OccupancyReport {
  building_id?: number;
  building_name?: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  units_by_status: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

// Payment Report Data
export interface PaymentReport {
  period: string;
  total_expected: number;
  total_collected: number;
  total_pending: number;
  total_overdue: number;
  collection_rate: number;
  payments_by_status: {
    status: string;
    amount: number;
    count: number;
  }[];
}

// Maintenance Report Data
export interface MaintenanceReport {
  period: string;
  total_requests: number;
  completed: number;
  pending: number;
  in_progress: number;
  cancelled: number;
  avg_resolution_time: number;
  requests_by_priority: {
    priority: string;
    count: number;
    percentage: number;
  }[];
  requests_by_category: {
    category: string;
    count: number;
    avg_cost: number;
  }[];
}

// Chart Data
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  type: 'line' | 'bar' | 'pie' | 'doughnut';
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Export Options
export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  filename: string;
  data: any;
  title?: string;
  subtitle?: string;
}

// Report Types Constant
export const ReportTypes = [
  { value: 'financial', label: 'Reporte Financiero', icon: '💰' },
  { value: 'occupancy', label: 'Reporte de Ocupación', icon: '🏢' },
  { value: 'payment', label: 'Reporte de Pagos', icon: '💳' },
  { value: 'maintenance', label: 'Reporte de Mantenimiento', icon: '🔧' },
  { value: 'tenant', label: 'Reporte de Inquilinos', icon: '👥' },
  { value: 'expense', label: 'Reporte de Gastos', icon: '📊' }
] as const;

// Chart Colors
export const ChartColors = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#27ae60',
  danger: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  palette: [
    '#667eea',
    '#764ba2',
    '#27ae60',
    '#e74c3c',
    '#f39c12',
    '#3498db',
    '#9b59b6',
    '#1abc9c',
    '#e67e22',
    '#34495e'
  ]
};
