/**
 * Contract Models
 * Modelos para la gestión de contratos de arrendamiento
 */

export type ContractStatus = 'active' | 'finished' | 'cancelled' | 'pending';

export interface Contract {
  id?: number;
  contract_id?: number;
  unit_id: number;
  tenant_id: number;
  contract_number?: string;
  start_date: string | Date;
  end_date: string | Date;
  monthly_rent: number;
  deposit_amount?: number;
  payment_day?: number;
  status?: ContractStatus;
  notes?: string;
  contract_file_path?: string;
  has_rent_increase?: boolean;
  rent_increase_percentage?: number;
  rent_increase_frequency_months?: number;
  next_increase_date?: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
  
  // Datos relacionados (joins del backend)
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  unit_number?: string;
  building_name?: string;
  building_id?: number;
  building_address?: string;
}

export interface ContractFormData {
  unit_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount?: number;
  payment_day?: number;
  status?: ContractStatus;
  notes?: string;
  has_rent_increase?: boolean;
  rent_increase_percentage?: number;
  rent_increase_frequency_months?: number;
}

export interface ContractFilter {
  status?: ContractStatus;
  unit_id?: number;
  tenant_id?: number;
  building_id?: number;
  fromDate?: string;
  toDate?: string;
  minRent?: number;
  maxRent?: number;
  expiringInDays?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ContractStats {
  total_contracts: number;
  active_contracts: number;
  expired_contracts: number;
  expiring_soon: number;
  total_monthly_income: number;
  average_rent: number;
}

export interface ExpiringContract {
  id: number;
  contract_number: string;
  tenant_name: string;
  unit_number: string;
  building_name: string;
  end_date: string;
  days_until_expiry: number;
  monthly_rent: number;
  status: ContractStatus;
}

export interface ContractPaymentInfo {
  contract_id: number;
  total_payments: number;
  paid_payments: number;
  pending_payments: number;
  overdue_payments: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
}
