-- Crear tabla de configuraciones del sistema
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

-- Índices
CREATE INDEX idx_settings_category ON settings(category);

-- Comentarios
COMMENT ON TABLE settings IS 'Configuraciones del sistema';
COMMENT ON COLUMN settings.key IS 'Clave única de la configuración';
COMMENT ON COLUMN settings.value IS 'Valor de la configuración (almacenado como string)';
COMMENT ON COLUMN settings.data_type IS 'Tipo de dato para conversión: string, number, boolean, json';
COMMENT ON COLUMN settings.category IS 'Categoría: general, contracts, payments, uploads, notifications';
COMMENT ON COLUMN settings.is_editable IS 'Indica si el usuario puede modificar este setting';

-- Insertar configuraciones por defecto
INSERT INTO settings (key, value, data_type, description, category, is_editable) VALUES
-- Contratos
('alert_contract_expiry_days', '30', 'number', 'Días antes del vencimiento para alertar sobre contratos que expiran', 'contracts', true),
('default_contract_duration', '12', 'number', 'Duración por defecto de contratos en meses', 'contracts', true),
('min_contract_duration', '1', 'number', 'Duración mínima de contratos en meses', 'contracts', false),

-- Pagos
('late_payment_penalty_rate', '0.03', 'number', 'Tasa de penalización por mora diaria (3% = 0.03)', 'payments', true),
('payment_grace_period_days', '5', 'number', 'Días de gracia antes de aplicar mora', 'payments', true),
('allowed_payment_methods', '["efectivo", "transferencia", "cheque", "tarjeta"]', 'json', 'Métodos de pago permitidos', 'payments', true),

-- Uploads
('max_upload_file_size', '5242880', 'number', 'Tamaño máximo de archivo en bytes (5MB = 5242880)', 'uploads', true),
('allowed_file_extensions', '["jpg", "jpeg", "png", "gif", "pdf"]', 'json', 'Extensiones de archivo permitidas', 'uploads', true),
('upload_path', 'uploads', 'string', 'Ruta base para archivos subidos', 'uploads', false),

-- Notificaciones
('email_notifications_enabled', 'true', 'boolean', 'Habilitar notificaciones por email', 'notifications', true),
('notify_payment_due_days', '3', 'number', 'Días antes del vencimiento para notificar pago', 'notifications', true),
('notify_contract_expiry_days', '30', 'number', 'Días antes del vencimiento para notificar contrato', 'notifications', true),

-- General
('app_name', 'Sistema de Gestión de Apartamentos', 'string', 'Nombre de la aplicación', 'general', true),
('timezone', 'America/Bogota', 'string', 'Zona horaria del sistema', 'general', true),
('currency', 'COP', 'string', 'Moneda del sistema', 'general', false),
('date_format', 'YYYY-MM-DD', 'string', 'Formato de fecha', 'general', true),
('max_records_per_page', '50', 'number', 'Máximo de registros por página en listados', 'general', true)

ON CONFLICT (key) DO NOTHING;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();
