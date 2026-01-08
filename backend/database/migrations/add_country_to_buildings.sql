-- Migración: Agregar campo country a la tabla buildings
-- Fecha: 2026-01-05
-- Descripción: Agregar soporte para almacenar el país del edificio

-- Agregar columna country si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'buildings' AND column_name = 'country'
    ) THEN
        ALTER TABLE buildings ADD COLUMN country VARCHAR(100) DEFAULT 'México';
        COMMENT ON COLUMN buildings.country IS 'País donde está ubicado el edificio';
    END IF;
END $$;

-- Crear índice para búsquedas por país
CREATE INDEX IF NOT EXISTS idx_buildings_country ON buildings(country);

-- Actualizar registros existentes sin país
UPDATE buildings SET country = 'México' WHERE country IS NULL;
