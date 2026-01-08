/**
 * Interface para Settings del sistema
 */
export interface ISetting {
  setting_id?: number;
  key: string;
  value: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: string;
  is_editable: boolean;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Tipo para valores parseados de settings
 */
export type SettingValue = string | number | boolean | any;

export default ISetting;
