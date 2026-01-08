import { executeQuery } from '../config/database';
import ISetting, { SettingValue } from '../models/Setting';

/**
 * Repositorio para gestionar configuraciones del sistema
 */
class SettingsRepository {
  /**
   * Obtener todas las configuraciones
   */
  async getAllSettings(): Promise<Record<string, SettingValue>> {
    const query = `
      SELECT key, value, data_type, description, category, is_editable
      FROM settings
      ORDER BY category, key
    `;

    const rows = await executeQuery<ISetting[]>(query);
    const settings: Record<string, SettingValue> = {};

    rows.forEach((row: ISetting) => {
      settings[row.key] = this.parseValue(row.value, row.data_type);
    });

    return settings;
  }

  /**
   * Obtener configuraciones por categoría
   */
  async getByCategory(category: string): Promise<Record<string, SettingValue>> {
    const query = `
      SELECT key, value, data_type, description, category, is_editable
      FROM settings
      WHERE category = $1
      ORDER BY key
    `;

    const rows = await executeQuery<ISetting[]>(query, [category]);
    const settings: Record<string, SettingValue> = {};

    rows.forEach((row: ISetting) => {
      settings[row.key] = this.parseValue(row.value, row.data_type);
    });

    return settings;
  }

  /**
   * Obtener configuración individual
   */
  async getSetting(key: string): Promise<SettingValue | null> {
    const query = `
      SELECT value, data_type
      FROM settings
      WHERE key = $1
    `;

    const rows = await executeQuery<Array<{value: string; data_type: string}>>(query, [key]);
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return this.parseValue(row.value, row.data_type);
  }

  /**
   * Obtener configuración completa (con metadatos)
   */
  async getSettingFull(key: string): Promise<ISetting | null> {
    const query = `
      SELECT *
      FROM settings
      WHERE key = $1
    `;

    const rows = await executeQuery<ISetting[]>(query, [key]);
    
    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  /**
   * Actualizar configuración
   */
  async updateSetting(key: string, value: SettingValue): Promise<boolean> {
    // Verificar que existe y es editable
    const checkQuery = `
      SELECT is_editable, data_type
      FROM settings
      WHERE key = $1
    `;

    const rows = await executeQuery<Array<{is_editable: boolean; data_type: string}>>(checkQuery, [key]);
    
    if (rows.length === 0) {
      throw new Error(`Configuración '${key}' no encontrada`);
    }

    const setting = rows[0];
    
    if (!setting.is_editable) {
      throw new Error(`Configuración '${key}' no es editable`);
    }

    // Convertir valor a string según tipo
    const stringValue = this.valueToString(value, setting.data_type);

    const updateQuery = `
      UPDATE settings
      SET value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE key = $2
    `;

    await executeQuery(updateQuery, [stringValue, key]);
    return true;
  }

  /**
   * Actualizar múltiples configuraciones
   */
  async updateMultiple(settings: Record<string, SettingValue>): Promise<{ updated: number; errors: string[] }> {
    let updated = 0;
    const errors: string[] = [];

    for (const [key, value] of Object.entries(settings)) {
      try {
        await this.updateSetting(key, value);
        updated++;
      } catch (error: any) {
        errors.push(`${key}: ${error.message}`);
      }
    }

    return { updated, errors };
  }

  /**
   * Obtener configuraciones agrupadas por categoría
   */
  async getGroupedByCategory(): Promise<Record<string, Record<string, any>>> {
    const query = `
      SELECT 
        key,
        value,
        data_type,
        description,
        category,
        is_editable
      FROM settings
      ORDER BY category, key
    `;

    const rows = await executeQuery<ISetting[]>(query);
    const grouped: Record<string, Record<string, any>> = {};

    rows.forEach((row: ISetting) => {
      if (!grouped[row.category]) {
        grouped[row.category] = {};
      }

      grouped[row.category][row.key] = {
        value: this.parseValue(row.value, row.data_type),
        description: row.description,
        is_editable: row.is_editable,
        data_type: row.data_type,
      };
    });

    return grouped;
  }

  /**
   * Verificar si una configuración existe
   */
  async exists(key: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(SELECT 1 FROM settings WHERE key = $1) as exists
    `;

    const rows = await executeQuery<Array<{exists: boolean}>>(query, [key]);
    return rows[0].exists;
  }

  /**
   * Crear nueva configuración (solo admin)
   */
  async createSetting(setting: Omit<ISetting, 'setting_id' | 'created_at' | 'updated_at'>): Promise<ISetting> {
    const query = `
      INSERT INTO settings (key, value, data_type, description, category, is_editable, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const rows = await executeQuery<ISetting[]>(query, [
      setting.key,
      setting.value,
      setting.data_type,
      setting.description || null,
      setting.category,
      setting.is_editable,
    ]);

    return rows[0];
  }

  /**
   * Parsear valor según tipo de dato
   */
  private parseValue(value: string, dataType: string): SettingValue {
    switch (dataType) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      case 'string':
      default:
        return value;
    }
  }

  /**
   * Convertir valor a string según tipo
   */
  private valueToString(value: SettingValue, dataType: string): string {
    switch (dataType) {
      case 'number':
      case 'boolean':
        return String(value);
      case 'json':
        return JSON.stringify(value);
      case 'string':
      default:
        return String(value);
    }
  }
}

export default new SettingsRepository();
