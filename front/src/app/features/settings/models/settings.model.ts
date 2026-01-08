export interface GeneralSettings {
  setting_id: number;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  tax_id: string;
  currency: string;
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  logo_url?: string;
}

export interface EmailSettings {
  setting_id: number;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_password?: string;
  from_email: string;
  from_name: string;
  reply_to?: string;
  enabled: boolean;
  test_email?: string;
}

export interface NotificationSettings {
  setting_id: number;
  email_notifications: boolean;
  payment_reminders: boolean;
  payment_reminder_days: number;
  contract_expiry_alerts: boolean;
  contract_expiry_days: number;
  maintenance_alerts: boolean;
  overdue_payment_alerts: boolean;
  new_tenant_alerts: boolean;
  unit_vacancy_alerts: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly';
}

export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  created_at: Date;
  last_login?: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  language: string;
  dashboard_layout?: string;
  items_per_page: number;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SettingsUpdateResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Constantes para configuración
export const CURRENCIES = [
  { value: 'USD', label: 'USD - Dólar Americano', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'MXN', label: 'MXN - Peso Mexicano', symbol: '$' },
  { value: 'COP', label: 'COP - Peso Colombiano', symbol: '$' },
  { value: 'ARS', label: 'ARS - Peso Argentino', symbol: '$' }
];

export const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' }
];

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México' },
  { value: 'America/Bogota', label: 'Bogotá' },
  { value: 'America/Lima', label: 'Lima' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' }
];

export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: '31/12/2025' },
  { value: 'MM/DD/YYYY', label: '12/31/2025' },
  { value: 'YYYY-MM-DD', label: '2025-12-31' },
  { value: 'DD-MM-YYYY', label: '31-12-2025' }
];

export const TIME_FORMATS = [
  { value: '12h', label: '12 horas (1:00 PM)' },
  { value: '24h', label: '24 horas (13:00)' }
];

export const NOTIFICATION_FREQUENCIES = [
  { value: 'immediate', label: 'Inmediata' },
  { value: 'daily', label: 'Diaria' },
  { value: 'weekly', label: 'Semanal' }
];
