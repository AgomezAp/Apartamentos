import { executeQuery } from '../config/database';

/**
 * Script para ejecutar migración de settings
 */
async function runMigration() {
  try {
    console.log('🔧 Ejecutando migración de settings...');

    // Crear tabla settings
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        data_type VARCHAR(20) NOT NULL DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
        description TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'general',
        is_editable BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla settings creada');

    // Crear índices
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);`);
    console.log('✅ Índices creados');

    // Insertar configuraciones por defecto
    const defaultSettings = [
      // Contratos
      { key: 'alert_contract_expiry_days', value: '30', data_type: 'number', description: 'Días antes del vencimiento para alertar sobre contratos que expiran', category: 'contracts', is_editable: true },
      { key: 'default_contract_duration', value: '12', data_type: 'number', description: 'Duración por defecto de contratos en meses', category: 'contracts', is_editable: true },
      { key: 'min_contract_duration', value: '1', data_type: 'number', description: 'Duración mínima de contratos en meses', category: 'contracts', is_editable: false },
      
      // Pagos
      { key: 'late_payment_penalty_rate', value: '0.03', data_type: 'number', description: 'Tasa de penalización por mora diaria (3% = 0.03)', category: 'payments', is_editable: true },
      { key: 'payment_grace_period_days', value: '5', data_type: 'number', description: 'Días de gracia antes de aplicar mora', category: 'payments', is_editable: true },
      { key: 'allowed_payment_methods', value: '["efectivo", "transferencia", "cheque", "tarjeta"]', data_type: 'json', description: 'Métodos de pago permitidos', category: 'payments', is_editable: true },
      
      // Uploads
      { key: 'max_upload_file_size', value: '5242880', data_type: 'number', description: 'Tamaño máximo de archivo en bytes (5MB = 5242880)', category: 'uploads', is_editable: true },
      { key: 'allowed_file_extensions', value: '["jpg", "jpeg", "png", "gif", "pdf"]', data_type: 'json', description: 'Extensiones de archivo permitidas', category: 'uploads', is_editable: true },
      { key: 'upload_path', value: 'uploads', data_type: 'string', description: 'Ruta base para archivos subidos', category: 'uploads', is_editable: false },
      
      // Notificaciones
      { key: 'email_notifications_enabled', value: 'true', data_type: 'boolean', description: 'Habilitar notificaciones por email', category: 'notifications', is_editable: true },
      { key: 'notify_payment_due_days', value: '3', data_type: 'number', description: 'Días antes del vencimiento para notificar pago', category: 'notifications', is_editable: true },
      { key: 'notify_contract_expiry_days', value: '30', data_type: 'number', description: 'Días antes del vencimiento para notificar contrato', category: 'notifications', is_editable: true },
      
      // General
      { key: 'app_name', value: 'Sistema de Gestión de Apartamentos', data_type: 'string', description: 'Nombre de la aplicación', category: 'general', is_editable: true },
      { key: 'timezone', value: 'America/Bogota', data_type: 'string', description: 'Zona horaria del sistema', category: 'general', is_editable: true },
      { key: 'currency', value: 'COP', data_type: 'string', description: 'Moneda del sistema', category: 'general', is_editable: false },
      { key: 'date_format', value: 'YYYY-MM-DD', data_type: 'string', description: 'Formato de fecha', category: 'general', is_editable: true },
      { key: 'max_records_per_page', value: '50', data_type: 'number', description: 'Máximo de registros por página en listados', category: 'general', is_editable: true },
    ];

    for (const setting of defaultSettings) {
      await executeQuery(
        `INSERT INTO settings (key, value, data_type, description, category, is_editable)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO NOTHING`,
        [setting.key, setting.value, setting.data_type, setting.description, setting.category, setting.is_editable]
      );
    }
    console.log('✅ Configuraciones por defecto insertadas');

    // Crear trigger para updated_at
    await executeQuery(`
      CREATE OR REPLACE FUNCTION update_settings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await executeQuery(`
      DROP TRIGGER IF EXISTS trigger_update_settings_updated_at ON settings;
      CREATE TRIGGER trigger_update_settings_updated_at
          BEFORE UPDATE ON settings
          FOR EACH ROW
          EXECUTE FUNCTION update_settings_updated_at();
    `);
    console.log('✅ Trigger updated_at creado');

    // Verificar configuraciones
    const result = await executeQuery('SELECT COUNT(*) as count FROM settings');
    const count = (result as any)?.rows?.[0]?.count || 0;
    console.log(`✅ Total configuraciones: ${count}`);

    console.log('\n🎉 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();
