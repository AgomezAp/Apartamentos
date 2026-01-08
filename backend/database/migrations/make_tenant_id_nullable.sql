-- ============================================
-- MIGRATION: Make tenant_id nullable in maintenance_requests
-- Permite crear solicitudes de mantenimiento para unidades desocupadas
-- ============================================

ALTER TABLE maintenance_requests
ALTER COLUMN tenant_id DROP NOT NULL;

-- Agregar comentario explicativo
COMMENT ON COLUMN maintenance_requests.tenant_id IS 'ID del inquilino - NULLABLE para unidades desocupadas o en preparación';
