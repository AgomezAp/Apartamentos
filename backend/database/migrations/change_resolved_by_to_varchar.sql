-- Migración: Cambiar resolved_by de INT a VARCHAR
-- Fecha: 2026-01-07
-- Descripción: Cambia el campo resolved_by de referencia a users(id) a VARCHAR(255) 
--              para guardar el nombre de quien resolvió directamente

-- Primero eliminar la foreign key constraint
ALTER TABLE maintenance_requests 
DROP CONSTRAINT IF EXISTS maintenance_requests_resolved_by_fkey;

-- Cambiar el tipo de columna a VARCHAR
ALTER TABLE maintenance_requests 
ALTER COLUMN resolved_by TYPE VARCHAR(255);

-- Agregar comentario explicativo
COMMENT ON COLUMN maintenance_requests.resolved_by IS 'Nombre de la persona que resolvió el mantenimiento';
