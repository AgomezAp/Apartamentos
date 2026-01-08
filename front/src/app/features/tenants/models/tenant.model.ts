export interface Tenant {
  id?: number;
  tenant_id?: number; // Alias para compatibilidad
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  mobile_phone?: string;
  identification_number?: string;
  document_number?: string; // Alias del backend
  identification_type?: 'CC' | 'CE' | 'TI' | 'NIT' | 'PP' | 'PEP';
  document_type?: 'CC' | 'CE' | 'TI' | 'NIT' | 'PP' | 'PEP'; // Alias del backend
  date_of_birth?: Date;
  nationality?: string;
  occupation?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  photo_url?: string;
  status?: 'active' | 'inactive' | 'blacklisted';
  is_active?: boolean; // Del backend
  created_at?: Date;
  updated_at?: Date;
  notes?: string;
  // Información de contrato actual
  current_contract_id?: number;
  contract_status?: string;
  unit_number?: string;
  unit_id?: number;
  building_name?: string;
  building_id?: number;
}

export interface TenantContract {
  contract_id: number;
  tenant_id: number;
  unit_id: number;
  unit_number?: string;
  building_name?: string;
  start_date: Date;
  end_date: Date;
  monthly_rent: number;
  deposit_amount: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  contract_type: 'fixed' | 'indefinite' | 'temporary';
  payment_day: number;
  auto_renewal: boolean;
  signed_date?: Date;
  termination_date?: Date;
  termination_reason?: string;
}

export interface TenantPayment {
  payment_id: number;
  tenant_id: number;
  contract_id: number;
  amount: number;
  payment_date: Date;
  period_start: Date;
  period_end: Date;
  payment_method: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  reference_number?: string;
}

export interface TenantDocument {
  document_id: number;
  tenant_id: number;
  document_type: 'identification' | 'proof_of_income' | 'reference' | 'contract' | 'other';
  file_name: string;
  file_url: string;
  uploaded_at: Date;
  notes?: string;
}

export interface TenantSearchFilter {
  search_term?: string;
  status?: string;
  has_active_contract?: boolean;
  building_id?: number;
  unit_id?: number;
}

export interface TenantStats {
  total_tenants: number;
  active_tenants: number;
  inactive_tenants: number;
  with_active_contracts: number;
  blacklisted: number;
  total_monthly_rent: number;
  average_monthly_rent: number;
}

export interface TenantHistory {
  history_id: number;
  tenant_id: number;
  action: 'created' | 'updated' | 'contract_signed' | 'contract_terminated' | 'payment' | 'complaint' | 'maintenance_request';
  description: string;
  created_at: Date;
  created_by: string;
  metadata?: any;
}

// Constantes
export const IDENTIFICATION_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PP', label: 'Pasaporte' },
  { value: 'PEP', label: 'Permiso Especial de Permanencia' }
];

export const TENANT_STATUS = [
  { value: 'active', label: 'Activo', icon: '✅', color: '#27ae60' },
  { value: 'inactive', label: 'Inactivo', icon: '⏸️', color: '#95a5a6' },
  { value: 'blacklisted', label: 'Lista Negra', icon: '🚫', color: '#e74c3c' }
];

export const CONTRACT_STATUS = [
  { value: 'active', label: 'Activo', icon: '✅', color: '#27ae60' },
  { value: 'expired', label: 'Vencido', icon: '⏰', color: '#e67e22' },
  { value: 'terminated', label: 'Terminado', icon: '🔴', color: '#e74c3c' },
  { value: 'pending', label: 'Pendiente', icon: '⏳', color: '#f39c12' }
];

export const CONTRACT_TYPES = [
  { value: 'fixed', label: 'Plazo Fijo' },
  { value: 'indefinite', label: 'Indefinido' },
  { value: 'temporary', label: 'Temporal' }
];
