-- ============================================
-- SISTEMA DE GESTIÓN INMOBILIARIA
-- Base de Datos PostgreSQL - Diseño Completo
-- Diseño: Normalizado, Escalable y Auditable
-- ============================================

-- ============================================
-- 1. TABLAS DE CONFIGURACIÓN Y CATÁLOGOS
-- ============================================

-- Tipos de unidades (configurable - NO hardcodeado)
CREATE TABLE unit_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- Apartamento, Apartaestudio, Local Comercial, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_unit_types_active ON unit_types(is_active);
CREATE INDEX idx_unit_types_name ON unit_types(name);

-- Tipos de servicios (configurable)
CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- Agua, Luz, Internet, Gas, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_types_active ON service_types(is_active);

-- Categorías de gastos (configurable)
CREATE TABLE expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- Mantenimiento, Reparación, Limpieza, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expense_categories_active ON expense_categories(is_active);

-- Estados de pago
CREATE TABLE payment_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Pagado, Pendiente, Vencido, Parcial
    color_code VARCHAR(7), -- Para UI: #00FF00
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_statuses_name ON payment_statuses(name);

-- Tipos de alerta
CREATE TABLE alert_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_types_priority ON alert_types(priority);

-- ============================================
-- 2. USUARIOS Y AUTENTICACIÓN
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================
-- 3. EDIFICIOS Y UNIDADES
-- ============================================

CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'México',
    total_floors INT,
    total_units INT,
    max_capacity INT, -- Para alertas de capacidad máxima
    description TEXT,
    construction_year INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buildings_name ON buildings(name);
CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_country ON buildings(country);
CREATE INDEX idx_buildings_active ON buildings(is_active);

-- Configuración de tipos de unidades permitidos por edificio
CREATE TABLE building_unit_type_config (
    id SERIAL PRIMARY KEY,
    building_id INT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    unit_type_id INT NOT NULL REFERENCES unit_types(id) ON DELETE CASCADE,
    is_allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (building_id, unit_type_id)
);

CREATE INDEX idx_building_unit_type_config_building ON building_unit_type_config(building_id);
CREATE INDEX idx_building_unit_type_config_unit_type ON building_unit_type_config(unit_type_id);

CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    building_id INT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    unit_type_id INT NOT NULL REFERENCES unit_types(id) ON DELETE RESTRICT,
    unit_number VARCHAR(50) NOT NULL, -- Número o identificador
    floor INT,
    area_sqm DECIMAL(10, 2), -- Área en metros cuadrados
    bedrooms INT,
    bathrooms INT,
    rental_price DECIMAL(12, 2) NOT NULL, -- Canon de arrendamiento
    is_occupied BOOLEAN DEFAULT FALSE,
    occupation_status VARCHAR(20) CHECK (occupation_status IN ('occupied', 'vacant', 'maintenance', 'reserved')) DEFAULT 'vacant',
    description TEXT,
    features JSONB, -- Características adicionales flexibles
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (building_id, unit_number)
);

CREATE INDEX idx_units_building ON units(building_id);
CREATE INDEX idx_units_type ON units(unit_type_id);
CREATE INDEX idx_units_status ON units(occupation_status);
CREATE INDEX idx_units_floor ON units(floor);
CREATE INDEX idx_units_occupied ON units(is_occupied);

-- Servicios incluidos por unidad
CREATE TABLE unit_services (
    id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    service_type_id INT NOT NULL REFERENCES service_types(id) ON DELETE RESTRICT,
    is_included BOOLEAN DEFAULT TRUE, -- Si está incluido en el arriendo
    monthly_cost DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (unit_id, service_type_id)
);

CREATE INDEX idx_unit_services_unit ON unit_services(unit_id);
CREATE INDEX idx_unit_services_service_type ON unit_services(service_type_id);

-- ============================================
-- 4. ARRENDATARIOS Y CONTRATOS
-- ============================================

CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(50), -- CC, NIT, Pasaporte, etc.
    document_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile_phone VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    occupation VARCHAR(100),
    company_name VARCHAR(255),
    monthly_income DECIMAL(12, 2),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_document ON tenants(document_number);
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_name ON tenants(last_name, first_name);
CREATE INDEX idx_tenants_active ON tenants(is_active);

CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    contract_number VARCHAR(100) UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(12, 2) NOT NULL,
    deposit_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_day INT DEFAULT 1, -- Día del mes para pago
    status VARCHAR(20) CHECK (status IN ('active', 'finished', 'cancelled', 'pending')) DEFAULT 'pending',
    notes TEXT,
    contract_file_path VARCHAR(500), -- Ruta al archivo PDF del contrato
    -- Preparado para futuras cláusulas de aumento
    has_rent_increase BOOLEAN DEFAULT FALSE,
    rent_increase_percentage DECIMAL(5, 2) DEFAULT 0.00,
    rent_increase_frequency_months INT DEFAULT 12,
    next_increase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_unit ON contracts(unit_id);
CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);
CREATE INDEX idx_contracts_end_date ON contracts(end_date); -- Para alertas de vencimiento

-- ============================================
-- 5. PAGOS
-- ============================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    payment_status_id INT NOT NULL REFERENCES payment_statuses(id) ON DELETE RESTRICT,
    period_month INT NOT NULL, -- 1-12
    period_year INT NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    amount_due DECIMAL(12, 2) NOT NULL,
    amount_paid DECIMAL(12, 2) DEFAULT 0.00,
    balance DECIMAL(12, 2) GENERATED ALWAYS AS (amount_due - amount_paid) STORED,
    payment_method VARCHAR(50), -- Efectivo, Transferencia, Cheque, etc.
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_status ON payments(payment_status_id);
CREATE INDEX idx_payments_period ON payments(period_year, period_month);
CREATE INDEX idx_payments_due_date ON payments(due_date); -- Para alertas de vencimiento
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- Histórico de pagos parciales
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_transactions_payment ON payment_transactions(payment_id);
CREATE INDEX idx_payment_transactions_date ON payment_transactions(transaction_date);

-- ============================================
-- 6. GASTOS Y SERVICIOS
-- ============================================

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    expense_category_id INT NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    unit_id INT REFERENCES units(id) ON DELETE CASCADE, -- NULL si es gasto de edificio
    building_id INT REFERENCES buildings(id) ON DELETE CASCADE, -- NULL si es gasto de unidad específica
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATE NOT NULL,
    invoice_number VARCHAR(100),
    vendor VARCHAR(255),
    payment_method VARCHAR(50),
    notes TEXT,
    receipt_file_path VARCHAR(500),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (unit_id IS NOT NULL OR building_id IS NOT NULL) -- Al menos uno debe estar definido
);

CREATE INDEX idx_expenses_category ON expenses(expense_category_id);
CREATE INDEX idx_expenses_unit ON expenses(unit_id);
CREATE INDEX idx_expenses_building ON expenses(building_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_vendor ON expenses(vendor);

-- Control mensual de servicios
CREATE TABLE monthly_services (
    id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    service_type_id INT NOT NULL REFERENCES service_types(id) ON DELETE RESTRICT,
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    consumption DECIMAL(10, 2), -- KWh, m3, GB, etc.
    unit_of_measure VARCHAR(20), -- KWh, m3, GB, etc.
    cost DECIMAL(12, 2) NOT NULL,
    invoice_number VARCHAR(100),
    due_date DATE,
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (unit_id, service_type_id, period_year, period_month)
);

CREATE INDEX idx_monthly_services_unit ON monthly_services(unit_id);
CREATE INDEX idx_monthly_services_service ON monthly_services(service_type_id);
CREATE INDEX idx_monthly_services_period ON monthly_services(period_year, period_month);

-- ============================================
-- 7. ALERTAS
-- ============================================

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    alert_type_id INT NOT NULL REFERENCES alert_types(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'read', 'dismissed')) DEFAULT 'pending',
    -- Referencias flexibles
    building_id INT REFERENCES buildings(id) ON DELETE CASCADE,
    unit_id INT REFERENCES units(id) ON DELETE CASCADE,
    contract_id INT REFERENCES contracts(id) ON DELETE CASCADE,
    payment_id INT REFERENCES payments(id) ON DELETE CASCADE,
    tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
    -- Email
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP NULL,
    -- Metadatos
    metadata JSONB, -- Información adicional flexible
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_type ON alerts(alert_type_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_alerts_building ON alerts(building_id);
CREATE INDEX idx_alerts_unit ON alerts(unit_id);
CREATE INDEX idx_alerts_contract ON alerts(contract_id);
CREATE INDEX idx_alerts_created ON alerts(created_at);

-- ============================================
-- 8. AUDITORÍA Y LOGS
-- ============================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, etc.
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    old_values JSONB, -- Valores antes del cambio
    new_values JSONB, -- Valores después del cambio
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- 9. CONFIGURACIÓN DEL SISTEMA
-- ============================================

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    data_type VARCHAR(20) CHECK (data_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Si es accesible sin autenticación
    updated_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- ============================================
-- 10. VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista de unidades con información completa
CREATE VIEW v_units_full AS
SELECT 
    u.id,
    u.unit_number,
    u.floor,
    u.area_sqm,
    u.rental_price,
    u.occupation_status,
    u.is_occupied,
    ut.name AS unit_type_name,
    b.id AS building_id,
    b.name AS building_name,
    b.address AS building_address,
    b.city AS building_city,
    -- Contrato activo
    c.id AS active_contract_id,
    c.contract_number,
    c.start_date AS contract_start,
    c.end_date AS contract_end,
    -- Arrendatario
    t.id AS tenant_id,
    CONCAT(t.first_name, ' ', t.last_name) AS tenant_name,
    t.email AS tenant_email,
    t.phone AS tenant_phone
FROM units u
INNER JOIN unit_types ut ON u.unit_type_id = ut.id
INNER JOIN buildings b ON u.building_id = b.id
LEFT JOIN contracts c ON u.id = c.unit_id AND c.status = 'active'
LEFT JOIN tenants t ON c.tenant_id = t.id
WHERE u.is_active = TRUE;

-- Vista de pagos pendientes y vencidos
CREATE VIEW v_overdue_payments AS
SELECT 
    p.id AS payment_id,
    p.due_date,
    p.amount_due,
    p.amount_paid,
    p.balance,
    CURRENT_DATE - p.due_date AS days_overdue,
    c.id AS contract_id,
    c.contract_number,
    u.unit_number,
    b.name AS building_name,
    CONCAT(t.first_name, ' ', t.last_name) AS tenant_name,
    t.email AS tenant_email,
    t.phone AS tenant_phone
FROM payments p
INNER JOIN contracts c ON p.contract_id = c.id
INNER JOIN units u ON c.unit_id = u.id
INNER JOIN buildings b ON u.building_id = b.id
INNER JOIN tenants t ON c.tenant_id = t.id
INNER JOIN payment_statuses ps ON p.payment_status_id = ps.id
WHERE ps.name IN ('Pendiente', 'Vencido', 'Parcial')
  AND p.due_date < CURRENT_DATE
  AND p.balance > 0
ORDER BY p.due_date ASC;

-- Vista de unidades desocupadas
CREATE VIEW v_vacant_units AS
SELECT 
    u.id,
    u.unit_number,
    u.floor,
    u.rental_price,
    ut.name AS unit_type_name,
    b.name AS building_name,
    b.city AS building_city,
    -- Último contrato
    (SELECT MAX(end_date) 
     FROM contracts 
     WHERE unit_id = u.id AND status = 'finished') AS last_occupied_date,
    CURRENT_DATE - 
        (SELECT MAX(end_date) 
         FROM contracts 
         WHERE unit_id = u.id AND status = 'finished')
     AS days_vacant
FROM units u
INNER JOIN unit_types ut ON u.unit_type_id = ut.id
INNER JOIN buildings b ON u.building_id = b.id
WHERE u.occupation_status = 'vacant'
  AND u.is_active = TRUE
ORDER BY days_vacant DESC;

-- ============================================
-- 11. FUNCIONES PARA AUTO-ACTUALIZACIÓN
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger de updated_at a todas las tablas relevantes
CREATE TRIGGER update_unit_types_updated_at BEFORE UPDATE ON unit_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON service_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unit_services_updated_at BEFORE UPDATE ON unit_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_services_updated_at BEFORE UPDATE ON monthly_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. TRIGGERS PARA LÓGICA DE NEGOCIO
-- ============================================

-- Trigger para actualizar estado de ocupación al activar/finalizar contrato
CREATE OR REPLACE FUNCTION update_unit_occupation_on_contract_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el contrato se activa
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        UPDATE units SET 
            is_occupied = TRUE,
            occupation_status = 'occupied'
        WHERE id = NEW.unit_id;
    END IF;
    
    -- Si el contrato se finaliza o cancela
    IF NEW.status IN ('finished', 'cancelled') AND OLD.status = 'active' THEN
        UPDATE units SET 
            is_occupied = FALSE,
            occupation_status = 'vacant'
        WHERE id = NEW.unit_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contract_activate 
AFTER UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION update_unit_occupation_on_contract_change();

-- Trigger para actualizar estado de pago según el balance
CREATE OR REPLACE FUNCTION update_payment_status_on_amount_change()
RETURNS TRIGGER AS $$
DECLARE
    paid_status_id INT;
    pending_status_id INT;
    overdue_status_id INT;
    partial_status_id INT;
BEGIN
    SELECT id INTO paid_status_id FROM payment_statuses WHERE name = 'Pagado' LIMIT 1;
    SELECT id INTO pending_status_id FROM payment_statuses WHERE name = 'Pendiente' LIMIT 1;
    SELECT id INTO overdue_status_id FROM payment_statuses WHERE name = 'Vencido' LIMIT 1;
    SELECT id INTO partial_status_id FROM payment_statuses WHERE name = 'Parcial' LIMIT 1;
    
    -- Si está completamente pagado
    IF NEW.amount_paid >= NEW.amount_due THEN
        NEW.payment_status_id = paid_status_id;
    -- Si está parcialmente pagado
    ELSIF NEW.amount_paid > 0 AND NEW.amount_paid < NEW.amount_due THEN
        NEW.payment_status_id = partial_status_id;
    -- Si está vencido
    ELSIF NEW.due_date < CURRENT_DATE THEN
        NEW.payment_status_id = overdue_status_id;
    -- Si está pendiente
    ELSE
        NEW.payment_status_id = pending_status_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_update_status
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_payment_status_on_amount_change();

-- ============================================
-- 13. DATOS INICIALES (SEED)
-- ============================================

-- Estados de pago predeterminados (IDs explícitos para consistencia)
INSERT INTO payment_statuses (id, name, color_code, description) VALUES
(1, 'Pendiente', '#ffc107', 'Pago pendiente'),
(2, 'Pagado', '#28a745', 'Pago completado'),
(3, 'Vencido', '#dc3545', 'Pago vencido'),
(4, 'Parcial', '#17a2b8', 'Pago parcial realizado')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, color_code = EXCLUDED.color_code, description = EXCLUDED.description;

-- Tipos de alerta predeterminados
INSERT INTO alert_types (name, description, priority) VALUES
('Unidad Desocupada', 'Una unidad ha quedado desocupada', 'medium'),
('Capacidad Máxima', 'El edificio ha alcanzado su capacidad máxima', 'high'),
('Contrato por Vencer', 'Un contrato está próximo a vencerse', 'medium'),
('Pago Vencido', 'Un pago ha vencido', 'high'),
('Unidad Desocupada Prolongada', 'Una unidad lleva mucho tiempo desocupada', 'critical');

-- Tipos de unidad comunes
INSERT INTO unit_types (name, description) VALUES
('Apartamento', 'Apartamento residencial estándar'),
('Apartaestudio', 'Apartamento de una sola habitación'),
('Local Comercial', 'Local para uso comercial'),
('Oficina', 'Espacio para oficinas'),
('Bodega', 'Espacio de almacenamiento');

-- Tipos de servicio comunes
INSERT INTO service_types (name, description) VALUES
('Agua', 'Servicio de acueducto'),
('Luz', 'Servicio de energía eléctrica'),
('Gas', 'Servicio de gas natural'),
('Internet', 'Servicio de internet'),
('Administración', 'Cuota de administración'),
('Aseo', 'Servicio de aseo'),
('Vigilancia', 'Servicio de vigilancia');

-- Categorías de gastos comunes
INSERT INTO expense_categories (name, description) VALUES
('Mantenimiento', 'Gastos de mantenimiento general'),
('Reparación', 'Gastos de reparaciones'),
('Limpieza', 'Gastos de limpieza'),
('Seguridad', 'Gastos de seguridad'),
('Servicios Públicos', 'Gastos de servicios públicos'),
('Administrativo', 'Gastos administrativos'),
('Legal', 'Gastos legales'),
('Otro', 'Otros gastos');

-- Configuraciones del sistema
INSERT INTO system_settings (setting_key, setting_value, data_type, description) VALUES
('alert_vacant_unit_threshold_days', '60', 'number', 'Días para alertar sobre unidad desocupada'),
('alert_contract_expiry_days', '30', 'number', 'Días antes del vencimiento del contrato para alertar'),
('alert_payment_due_days', '5', 'number', 'Días antes del vencimiento de pago para alertar'),
('smtp_host', '', 'string', 'Servidor SMTP para emails'),
('smtp_port', '587', 'number', 'Puerto SMTP'),
('smtp_user', '', 'string', 'Usuario SMTP'),
('smtp_password', '', 'string', 'Contraseña SMTP'),
('alert_email_from', '', 'string', 'Email remitente de alertas'),
('company_name', 'Gestión Inmobiliaria', 'string', 'Nombre de la empresa'),
('currency_symbol', '$', 'string', 'Símbolo de moneda');

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices compuestos para consultas comunes
CREATE INDEX idx_contract_unit_status ON contracts(unit_id, status);
CREATE INDEX idx_payment_contract_status ON payments(contract_id, payment_status_id);
CREATE INDEX idx_expense_date_category ON expenses(expense_date, expense_category_id);
CREATE INDEX idx_unit_building_status ON units(building_id, occupation_status);

-- ============================================
-- FIN DEL SCHEMA POSTGRESQL
-- ============================================
