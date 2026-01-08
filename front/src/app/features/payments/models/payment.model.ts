export interface Payment {
  id?: number;
  payment_id?: number; // Alias para compatibilidad
  contract_id: number;
  tenant_id?: number;
  unit_id?: number;
  amount: number;
  amount_due?: number; // Del backend - monto debido
  amount_paid?: number; // Del backend - monto pagado
  balance?: number; // Del backend - saldo pendiente
  payment_date?: string;
  due_date?: string;
  payment_method?: string;
  reference_number?: string;
  status?: 'pending' | 'partial' | 'completed' | 'overdue' | 'cancelled' | 'paid';
  payment_status?: string; // Del backend
  payment_status_id?: number; // Del backend
  status_name?: string; // Del backend - nombre del estado
  period_month?: number; // Del backend - mes del período
  period_year?: number; // Del backend - año del período
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Relations
  tenant_name?: string;
  unit_number?: string;
  building_name?: string;
  monthly_rent?: number; // Del contrato
}

export interface PaymentFormData {
  contract_id: number;
  period_month: number;
  period_year: number;
  amount_due: number;
  due_date: string;
  payment_status_id: number;
  payment_method?: string;
  notes?: string;
}

export interface PaymentFilter {
  status?: string;
  tenant_id?: number;
  unit_id?: number;
  building_id?: number;
  contract_id?: number;
  start_date?: string;
  end_date?: string;
  date_from?: string;
  date_to?: string;
  payment_method?: string;
}

export interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  pending_amount: number;
  overdue_amount: number;
  completed_amount: number;
  pending_count: number;
  overdue_count: number;
  completed_count: number;
}

export interface MonthlyPayment {
  month: string;
  year: number;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface Transaction {
  transaction_id: number;
  payment_id: number;
  amount: number;
  transaction_date: string;
  transaction_type: 'payment' | 'refund' | 'adjustment';
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface TransactionFormData {
  payment_id: number;
  amount: number;
  transaction_date: string;
  transaction_type: 'payment' | 'refund' | 'adjustment';
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

export interface PaymentCalendarDay {
  date: Date;
  payments: Payment[];
  total_amount: number;
  has_overdue: boolean;
  is_current_month: boolean;
}

export const PaymentMethods = [
  { value: 'Efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'Transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
  { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito', icon: '💳' },
  { value: 'Cheque', label: 'Cheque', icon: '📝' }
];

export const PaymentStatuses = [
  { value: 'pending', label: 'Pendiente', color: '#f39c12' },
  { value: 'partial', label: 'Parcial', color: '#3498db' },
  { value: 'completed', label: 'Completado', color: '#27ae60' }
];

export const TransactionTypes = [
  { value: 'payment', label: 'Pago', icon: '💰' },
  { value: 'refund', label: 'Reembolso', icon: '↩️' },
  { value: 'adjustment', label: 'Ajuste', icon: '⚙️' }
];
