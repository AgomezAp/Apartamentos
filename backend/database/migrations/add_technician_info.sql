-- ============================================
-- MIGRATION: Agregar información de técnico/tercero asignado
-- ============================================

-- Agregar campos para información del técnico asignado
ALTER TABLE maintenance_requests
ADD COLUMN IF NOT EXISTS assigned_to_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS assigned_to_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS assigned_to_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS assigned_to_email VARCHAR(255);

-- Comentarios
COMMENT ON COLUMN maintenance_requests.assigned_to_name IS 'Nombre del técnico/persona asignada (para terceros no registrados)';
COMMENT ON COLUMN maintenance_requests.assigned_to_phone IS 'Teléfono del técnico asignado';
COMMENT ON COLUMN maintenance_requests.assigned_to_company IS 'Empresa del técnico asignado';
COMMENT ON COLUMN maintenance_requests.assigned_to_email IS 'Email del técnico asignado';
