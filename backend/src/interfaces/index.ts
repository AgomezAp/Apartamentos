// ============================================
// INTERFACES PRINCIPALES DEL SISTEMA
// ============================================

export interface User {
  id?: number;
  email: string;
  password_hash?: string;
  full_name: string;
  phone?: string;
  is_active?: boolean;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface Building {
  id?: number;
  name: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  total_floors?: number;
  total_units?: number;
  max_capacity?: number;
  description?: string;
  construction_year?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  // Estadísticas opcionales (vienen de getWithStats o findAll)
  units_count?: number;
  occupied_units?: number;
  vacant_units?: number;
  occupancy_rate?: number;
  active_contracts_count?: number;
}

export interface UnitType {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Unit {
  id?: number;
  building_id: number;
  unit_type_id: number;
  unit_number: string;
  floor?: number;
  area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  rental_price: number;
  is_occupied?: boolean;
  occupation_status?: 'occupied' | 'vacant' | 'maintenance' | 'reserved';
  description?: string;
  features?: any;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  // Datos relacionales (del JOIN en repository)
  building_name?: string;
  type_name?: string;
  current_tenant?: string;
  tenant_id?: number;
  current_contract_id?: number;
  contract_end_date?: Date;
}

export interface Tenant {
  id?: number;
  // Campos originales de la base de datos
  document_type?: string;
  document_number: string;
  // Alias para compatibilidad con frontend
  identification_type?: string;
  identification_number?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  occupation?: string;
  company_name?: string;
  monthly_income?: number;
  notes?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Contract {
  id?: number;
  unit_id: number;
  tenant_id: number;
  contract_number?: string;
  start_date: Date;
  end_date: Date;
  monthly_rent: number;
  deposit_amount?: number;
  payment_day?: number;
  status?: 'active' | 'finished' | 'cancelled' | 'pending';
  notes?: string;
  contract_file_path?: string;
  has_rent_increase?: boolean;
  rent_increase_percentage?: number;
  rent_increase_frequency_months?: number;
  next_increase_date?: Date;
  created_at?: Date;
  updated_at?: Date;
  // Campos relacionados (del JOIN con tenants y units)
  tenant_name?: string;
  tenant_email?: string;
  unit_number?: string;
  building_name?: string;
  building_id?: number;
}

export interface Payment {
  id?: number;
  contract_id: number;
  payment_status_id: number;
  period_month: number;
  period_year: number;
  due_date: Date;
  payment_date?: Date;
  amount_due: number;
  amount?: number; // Alias para compatibilidad con el frontend
  amount_paid?: number;
  balance?: number;
  payment_method?: string;
  reference_number?: string;
  status?: string; // Status enum para el frontend
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PaymentTransaction {
  id?: number;
  payment_id: number;
  transaction_date: Date;
  amount: number;
  payment_method?: string;
  reference_number?: string;
  receipt_file_path?: string;
  notes?: string;
  created_by?: number;
  created_at?: Date;
}

export interface Expense {
  id?: number;
  expense_category_id: number;
  unit_id?: number;
  building_id?: number;
  description: string;
  amount: number;
  expense_date: Date;
  invoice_number?: string;
  vendor?: string;
  payment_method?: string;
  notes?: string;
  receipt_file_path?: string;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ServiceType {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface MonthlyService {
  id?: number;
  unit_id: number;
  service_type_id: number;
  period_month: number;
  period_year: number;
  consumption?: number;
  unit_of_measure?: string;
  cost: number;
  invoice_number?: string;
  due_date?: Date;
  payment_date?: Date;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Alert {
  id?: number;
  alert_type_id: number;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'sent' | 'read' | 'dismissed';
  building_id?: number;
  unit_id?: number;
  contract_id?: number;
  payment_id?: number;
  tenant_id?: number;
  email_sent?: boolean;
  email_sent_at?: Date;
  metadata?: any;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuditLog {
  id?: number;
  user_id?: number;
  action: string;
  table_name: string;
  record_id: number;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export interface SystemSetting {
  id?: number;
  setting_key: string;
  setting_value?: string;
  data_type?: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  is_public?: boolean;
  updated_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

// ============================================
// INTERFACES DE RESPUESTA API
// ============================================

export interface ApiResponse<T = any> {
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

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface FilterParams {
  [key: string]: any;
}

// ============================================
// INTERFACES DE REPORTES
// ============================================

export interface UnitOccupancyReport {
  unit_id: number;
  unit_number: string;
  building_name: string;
  unit_type: string;
  occupation_status: string;
  days_vacant?: number;
  last_occupied_date?: Date;
  rental_price: number;
}

export interface ExpenseReport {
  period: string;
  category: string;
  total_amount: number;
  count: number;
  building_name?: string;
  unit_number?: string;
}

export interface ServiceReport {
  period: string;
  service_type: string;
  total_cost: number;
  total_consumption?: number;
  unit_count: number;
}

export interface PaymentReport {
  period: string;
  total_expected: number;
  total_collected: number;
  total_pending: number;
  total_overdue: number;
  collection_rate: number;
}

// ============================================
// INTERFACES DE DASHBOARD
// ============================================

export interface DashboardStats {
  total_buildings: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
  active_contracts: number;
  pending_payments: number;
  overdue_payments: number;
  total_monthly_income: number;
  alerts_count: number;
}
