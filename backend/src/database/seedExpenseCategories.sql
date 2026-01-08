-- Insertar categorías de gastos predefinidas
INSERT INTO expense_categories (name, description, is_active) VALUES
  ('Mantenimiento', 'Gastos de mantenimiento general del edificio', true),
  ('Servicios Públicos', 'Agua, electricidad, gas, internet, etc.', true),
  ('Reparaciones', 'Reparaciones de infraestructura y equipos', true),
  ('Seguros', 'Pólizas de seguro del edificio', true),
  ('Impuestos', 'Impuestos prediales y otros tributos', true),
  ('Limpieza', 'Servicios de limpieza y aseo', true),
  ('Seguridad', 'Servicios de seguridad y vigilancia', true),
  ('Jardinería', 'Mantenimiento de áreas verdes', true),
  ('Administración', 'Gastos administrativos y operativos', true),
  ('Otros', 'Otros gastos no clasificados', true)
ON CONFLICT DO NOTHING;
