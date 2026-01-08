export interface Expense {
  id?: number; // Del backend
  expense_id?: number; // Legacy/fallback
  building_id: number;
  expense_category_id?: number;
  category_id?: number;
  unit_id?: number;
  description: string;
  amount: number;
  expense_date: string;
  invoice_number?: string;
  vendor?: string;
  payment_method?: string;
  reference_number?: string;
  receipt_file_path?: string;
  notes?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  // Relations
  building_name?: string;
  building_address?: string;
  category_name?: string;
  category_description?: string;
  created_by_name?: string;
  created_by_email?: string;
}

export interface ExpenseFormData {
  building_id: number;
  category_id: number;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string;
  reference_number?: string;
  receipt_file_path?: string;
  notes?: string;
}

export interface ExpenseCategory {
  category_id: number;
  category_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFilter {
  building_id?: number;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseSummary {
  building_id: number;
  building_name: string;
  total_expenses: number;
  total_amount: number;
  by_category: CategorySummary[];
  by_month?: MonthSummary[];
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  count: number;
  total_amount: number;
  percentage: number;
}

export interface MonthSummary {
  month: number;
  year: number;
  month_name: string;
  total: number;
  count: number;
}

export interface ExpenseStatistics {
  total_expenses: number;
  total_amount: number;
  average_amount: number;
  max_expense: number;
  min_expense: number;
  by_category: CategorySummary[];
  by_payment_method: PaymentMethodSummary[];
  monthly_trend: MonthSummary[];
}

export interface PaymentMethodSummary {
  payment_method: string;
  count: number;
  total_amount: number;
  percentage: number;
}

export const PaymentMethods = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'check', label: 'Cheque' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'other', label: 'Otro' }
];