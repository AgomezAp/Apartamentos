/**
 * Report Model
 * Interfaces para reportes y gráficas
 */

// Re-export from report.module.ts
export type { ReportFilter } from './report.module';
export { ReportTypes } from './report.module';
export type { Report, ReportParameters, PaymentReport, MaintenanceReport, ExportOptions } from './report.module';

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  type?: 'bar' | 'pie' | 'doughnut' | 'line';
}

export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export type ChartColors = {
  primary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  palette: string[];
  [key: string]: string | string[];
}

export interface FinancialReport {
  period: string;
  total_income: number;
  total_expenses: number;
  net_profit: number;
  occupancy_rate: number;
}

export interface OccupancyReport {
  building_id: number;
  building_name: string;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_percentage: number;
  occupancy_rate?: number;
  units_by_status?: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export const DEFAULT_CHART_COLORS: ChartColors = {
  primary: '#667eea',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',
  palette: ['#667eea', '#27ae60', '#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#1abc9c', '#34495e']
};
