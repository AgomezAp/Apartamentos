/**
 * Dashboard Models
 * Modelos para el dashboard y estadísticas del sistema
 */

export interface DashboardStats {
  total_buildings: number;
  total_units: number;
  occupied_units: number;
  available_units: number;
  occupancy_rate: number;
  total_tenants: number;
  active_tenants: number;
  active_contracts: number;
  expired_contracts: number;
  expiring_soon: number;
  total_monthly_income: number;
  current_month_revenue: number | null;
  revenue_growth_rate: number;
  pending_payments: number;
  pending_payments_count: number;
  pending_payments_amount: number;
  overdue_payments: number;
  collected_this_month: number;
  pending_amount: number;
  overdue_amount: number;
  active_maintenance_requests: number;
  pending_maintenance: number;
  total_expenses_this_month: number;
}

export interface BuildingStats {
  building_id: number;
  building_name: string;
  total_units: number;
  occupied_units: number;
  occupancy_rate: number;
  monthly_income: number;
  pending_payments: number;
  active_contracts: number;
}

export interface RevenueData {
  month: string;
  year: number;
  expected_revenue: number;
  collected_revenue: number;
  pending_revenue: number;
  collection_rate: number;
}

export interface TopTenant {
  tenant_id: number;
  tenant_name: string;
  unit_number: string;
  building_name: string;
  total_payments: number;
  on_time_payments: number;
  late_payments: number;
  punctuality_rate: number;
  total_paid: number;
}

export interface RecentPayment {
  id: number;
  tenant_name: string;
  unit_number: string;
  building_name: string;
  amount: number;
  payment_date: string;
  period_month: number;
  period_year: number;
  status: string;
}

export interface PendingTask {
  id: number;
  type: 'payment' | 'maintenance' | 'contract' | 'inspection';
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  entity_id?: number;
  entity_name?: string;
}

export interface Alert {
  id: number;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  is_read: boolean;
  entity_type?: string;
  entity_id?: number;
}

export interface OccupancyData {
  building_name: string;
  total_units: number;
  occupied_units: number;
  available_units: number;
  occupancy_rate: number;
}

export interface DashboardFilters {
  building_id?: number;
  date_from?: string;
  date_to?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
}
