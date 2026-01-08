-- Script para actualizar el estado de ocupación de las unidades
-- que tienen contratos activos pero no están marcadas como ocupadas

-- Actualizar unidades con contratos activos a 'occupied'
UPDATE units u
SET occupation_status = 'occupied',
    tenant_id = (SELECT c.tenant_id FROM contracts c 
                 WHERE c.unit_id = u.id 
                 AND c.status = 'active' 
                 ORDER BY c.created_at DESC 
                 LIMIT 1),
    updated_at = CURRENT_TIMESTAMP
WHERE u.id IN (
    SELECT DISTINCT c.unit_id 
    FROM contracts c 
    WHERE c.status = 'active'
)
AND u.occupation_status != 'occupied';

-- Mostrar unidades actualizadas
SELECT u.id, u.unit_number, u.occupation_status, u.tenant_id, b.name as building_name
FROM units u
JOIN buildings b ON u.building_id = b.id
ORDER BY b.name, u.unit_number;
