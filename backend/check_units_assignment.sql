-- Script de diagnóstico: Verificar unidades sin asignar a edificios

-- 1. Contar unidades sin building_id (NULL)
SELECT COUNT(*) as unidades_sin_edificio
FROM units
WHERE building_id IS NULL OR building_id = 0;

-- 2. Listar todas las unidades sin asignar
SELECT id, unit_number, building_id, unit_type_id, is_occupied, occupation_status
FROM units
WHERE building_id IS NULL OR building_id = 0
ORDER BY id;

-- 3. Ver distribución de unidades por edificio
SELECT 
  b.id as building_id,
  b.name as building_name,
  COUNT(u.id) as unidades_asignadas,
  b.total_units as unidades_planeadas,
  COUNT(CASE WHEN u.occupation_status = 'occupied' THEN 1 END) as ocupadas,
  COUNT(CASE WHEN u.occupation_status = 'vacant' THEN 1 END) as vacantes
FROM buildings b
LEFT JOIN units u ON b.id = u.building_id AND u.is_active = TRUE
WHERE b.is_active = TRUE
GROUP BY b.id, b.name, b.total_units
ORDER BY b.name;

-- 4. Verificar si hay unidades huérfanas (referencias a edificios inexistentes)
SELECT u.id, u.unit_number, u.building_id
FROM units u
LEFT JOIN buildings b ON u.building_id = b.id
WHERE b.id IS NULL AND u.building_id IS NOT NULL
ORDER BY u.building_id;
