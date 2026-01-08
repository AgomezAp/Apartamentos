-- Insertar tipos de unidad predefinidos
INSERT INTO unit_types (name, description, is_active) VALUES
  ('Apartamento', 'Unidad residencial estándar', true),
  ('Penthouse', 'Apartamento en el último piso con características premium', true),
  ('Estudio', 'Unidad de un solo ambiente', true),
  ('Loft', 'Espacio abierto de dos niveles', true),
  ('Dúplex', 'Unidad de dos pisos', true),
  ('Local Comercial', 'Espacio para uso comercial', true),
  ('Oficina', 'Espacio para uso de oficina', true),
  ('Parqueadero', 'Espacio de estacionamiento', true),
  ('Bodega', 'Espacio de almacenamiento', true)
ON CONFLICT (name) DO NOTHING;
