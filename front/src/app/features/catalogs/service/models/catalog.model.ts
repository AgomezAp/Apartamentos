/**
 * Catalog Models
 * Modelos para la gestión de catálogos del sistema
 */

// ==================== UNIT TYPES ====================

export interface UnitType {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UnitTypeFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

// ==================== SERVICE TYPES ====================

export interface ServiceType {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceTypeFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

// ==================== PAYMENT STATUSES ====================

export interface PaymentStatus {
  id?: number;
  name: string;
  description?: string;
  color_code?: string;
  created_at?: string;
}

export interface PaymentStatusFormData {
  name: string;
  description?: string;
  color_code?: string;
}

// ==================== ALERT TYPES ====================

export interface AlertType {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AlertTypeFormData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
}

// ==================== USERS ====================

export interface User {
  id?: number;
  email: string;
  full_name: string;
  phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  is_active?: boolean;
}

// ==================== EXPENSE CATEGORIES ====================

export interface ExpenseCategory {
  expense_category_id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCategoryFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

// ==================== GENERAL CATALOG ====================

export interface Catalog {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Campos opcionales adicionales
  icon?: string;
  color?: string;
  color_code?: string;
}

export interface CatalogFormData {
  name: string;
  description?: string;
  is_active?: boolean;
  icon?: string;
  color?: string;
  color_code?: string;
}

export type CatalogType = 
  | 'unit-types' 
  | 'service-types' 
  | 'payment-statuses' 
  | 'alert-types' 
  | 'users'
  | 'expense-categories';