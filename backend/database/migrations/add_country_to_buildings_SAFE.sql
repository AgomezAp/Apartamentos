-- ============================================
-- MIGRACIÓN: Agregar soporte para campo 'country' en buildings
-- Fecha: 2026-01-05
-- Descripción: Agrega la columna 'country' a la tabla buildings
-- ============================================

-- PASO 1: Verificar si la columna ya existe
DO $$ 
BEGIN
    -- Agregar columna country si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'buildings' 
          AND column_name = 'country'
    ) THEN
        ALTER TABLE buildings ADD COLUMN country VARCHAR(100) DEFAULT 'México';
        RAISE NOTICE '✓ Columna "country" agregada correctamente';
    ELSE
        RAISE NOTICE '⚠ La columna "country" ya existe, omitiendo creación';
    END IF;
END $$;

-- PASO 2: Crear índice para búsquedas por país (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'buildings'
          AND indexname = 'idx_buildings_country'
    ) THEN
        CREATE INDEX idx_buildings_country ON buildings(country);
        RAISE NOTICE '✓ Índice "idx_buildings_country" creado correctamente';
    ELSE
        RAISE NOTICE '⚠ El índice "idx_buildings_country" ya existe';
    END IF;
END $$;

-- PASO 3: Actualizar registros existentes sin país
UPDATE buildings 
SET country = 'México' 
WHERE country IS NULL;

-- PASO 4: Verificación final
DO $$
DECLARE
    column_exists BOOLEAN;
    index_exists BOOLEAN;
    null_count INTEGER;
BEGIN
    -- Verificar columna
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'buildings' 
          AND column_name = 'country'
    ) INTO column_exists;
    
    -- Verificar índice
    SELECT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'buildings'
          AND indexname = 'idx_buildings_country'
    ) INTO index_exists;
    
    -- Contar nulos
    SELECT COUNT(*) 
    INTO null_count
    FROM buildings 
    WHERE country IS NULL;
    
    -- Mostrar resultados
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'RESUMEN DE LA MIGRACIÓN';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Columna "country" existe: %', column_exists;
    RAISE NOTICE 'Índice existe: %', index_exists;
    RAISE NOTICE 'Registros con country NULL: %', null_count;
    
    IF column_exists AND index_exists AND null_count = 0 THEN
        RAISE NOTICE '✓ ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!';
    ELSE
        RAISE WARNING '⚠ La migración completó con advertencias';
    END IF;
    RAISE NOTICE '====================================';
END $$;

-- OPCIONAL: Mostrar algunos registros para verificar
SELECT 
    id,
    name,
    city,
    country,
    created_at
FROM buildings
ORDER BY id
LIMIT 5;
