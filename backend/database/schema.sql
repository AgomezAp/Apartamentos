-- ============================================
-- SISTEMA DE GESTIÓN INMOBILIARIA
-- Base de Datos MySQL - Diseño Completo
-- Diseño: Normalizado, Escalable y Auditable
-- ============================================

-- ============================================
-- 1. TABLAS DE CONFIGURACIÓN Y CATÁLOGOS
-- ============================================

-- Tipos de unidades (configurable - NO hardcodeado)
CREATE TABLE unit_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- Apartamento, Apartaestudio, Local Comercial, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tipos de servicios (configurable)
CREATE TABLE service_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- Agua, Luz, Internet, Gas, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categorías de gastos (configurable)
CREATE TABLE expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- Mantenimiento, Reparación, Limpieza, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estados de pago
CREATE TABLE payment_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Pagado, Pendiente, Vencido, Parcial
    color_code VARCHAR(7), -- Para UI: #00FF00
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tipos de alerta
CREATE TABLE alert_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. USUARIOS Y AUTENTICACIÓN
-- ============================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. EDIFICIOS Y UNIDADES
-- ============================================

CREATE TABLE buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    total_floors INT,
    total_units INT,
    max_capacity INT, -- Para alertas de capacidad máxima
    description TEXT,
    construction_year YEAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_city (city),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configuración de tipos de unidades permitidos por edificio
CREATE TABLE building_unit_type_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    unit_type_id INT NOT NULL,
    is_allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_type_id) REFERENCES unit_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_building_unit_type (building_id, unit_type_id),
    INDEX idx_building (building_id),
    INDEX idx_unit_type (unit_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    unit_type_id INT NOT NULL,
    unit_number VARCHAR(50) NOT NULL, -- Número o identificador
    floor INT,
    area_sqm DECIMAL(10, 2), -- Área en metros cuadrados
    bedrooms INT,
    bathrooms INT,
    rental_price DECIMAL(12, 2) NOT NULL, -- Canon de arrendamiento
    is_occupied BOOLEAN DEFAULT FALSE,
    occupation_status ENUM('occupied', 'vacant', 'maintenance', 'reserved') DEFAULT 'vacant',
    description TEXT,
    features JSON, -- Características adicionales flexibles
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_type_id) REFERENCES unit_types(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_building_unit (building_id, unit_number),
    INDEX idx_building (building_id),
    INDEX idx_type (unit_type_id),
    INDEX idx_status (occupation_status),
    INDEX idx_floor (floor),
    INDEX idx_occupied (is_occupied)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Servicios incluidos por unidad
CREATE TABLE unit_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    service_type_id INT NOT NULL,
    is_included BOOLEAN DEFAULT TRUE, -- Si está incluido en el arriendo
    monthly_cost DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_unit_service (unit_id, service_type_id),
    INDEX idx_unit (unit_id),
    INDEX idx_service_type (service_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. ARRENDATARIOS Y CONTRATOS
-- ============================================

CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_document (document_number),
    INDEX idx_email (email),
    INDEX idx_name (last_name, first_name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    tenant_id INT NOT NULL,
    contract_number VARCHAR(100) UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(12, 2) NOT NULL,
    deposit_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_day INT DEFAULT 1, -- Día del mes para pago
    status ENUM('active', 'finished', 'cancelled', 'pending') DEFAULT 'pending',
    notes TEXT,
    contract_file_path VARCHAR(500), -- Ruta al archivo PDF del contrato
    -- Preparado para futuras cláusulas de aumento
    has_rent_increase BOOLEAN DEFAULT FALSE,
    rent_increase_percentage DECIMAL(5, 2) DEFAULT 0.00,
    rent_increase_frequency_months INT DEFAULT 12,
    next_increase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
    INDEX idx_unit (unit_id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_end_date (end_date) -- Para alertas de vencimiento
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. PAGOS
-- ============================================

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    payment_status_id INT NOT NULL,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_status_id) REFERENCES payment_statuses(id) ON DELETE RESTRICT,
    INDEX idx_contract (contract_id),
    INDEX idx_status (payment_status_id),
    INDEX idx_period (period_year, period_month),
    INDEX idx_due_date (due_date), -- Para alertas de vencimiento
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Histórico de pagos parciales
CREATE TABLE payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    transaction_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_payment (payment_id),
    INDEX idx_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. GASTOS Y SERVICIOS
-- ============================================

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_category_id INT NOT NULL,
    unit_id INT, -- NULL si es gasto de edificio
    building_id INT, -- NULL si es gasto de unidad específica
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATE NOT NULL,
    invoice_number VARCHAR(100),
    vendor VARCHAR(255),
    payment_method VARCHAR(50),
    notes TEXT,
    receipt_file_path VARCHAR(500),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CHECK (unit_id IS NOT NULL OR building_id IS NOT NULL), -- Al menos uno debe estar definido
    INDEX idx_category (expense_category_id),
    INDEX idx_unit (unit_id),
    INDEX idx_building (building_id),
    INDEX idx_date (expense_date),
    INDEX idx_vendor (vendor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Control mensual de servicios
CREATE TABLE monthly_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    service_type_id INT NOT NULL,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_unit_service_period (unit_id, service_type_id, period_year, period_month),
    INDEX idx_unit (unit_id),
    INDEX idx_service (service_type_id),
    INDEX idx_period (period_year, period_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. ALERTAS
-- ============================================

CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'sent', 'read', 'dismissed') DEFAULT 'pending',
    -- Referencias flexibles
    building_id INT,
    unit_id INT,
    contract_id INT,
    payment_id INT,
    tenant_id INT,
    -- Email
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP NULL,
    -- Metadatos
    metadata JSON, -- Información adicional flexible
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_type_id) REFERENCES alert_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_type (alert_type_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_building (building_id),
    INDEX idx_unit (unit_id),
    INDEX idx_contract (contract_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. AUDITORÍA Y LOGS
-- ============================================

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, etc.
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    old_values JSON, -- Valores antes del cambio
    new_values JSON, -- Valores después del cambio
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_table (table_name),
    INDEX idx_record (record_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. CONFIGURACIÓN DEL SISTEMA
-- ============================================

CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Si es accesible sin autenticación
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    DATEDIFF(CURDATE(), p.due_date) AS days_overdue,
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
  AND p.due_date < CURDATE()
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
    DATEDIFF(CURDATE(), 
        (SELECT MAX(end_date) 
         FROM contracts 
         WHERE unit_id = u.id AND status = 'finished')
    ) AS days_vacant
FROM units u
INNER JOIN unit_types ut ON u.unit_type_id = ut.id
INNER JOIN buildings b ON u.building_id = b.id
WHERE u.occupation_status = 'vacant'
  AND u.is_active = TRUE
ORDER BY days_vacant DESC;

-- ============================================
-- 11. DATOS INICIALES (SEED)
-- ============================================

-- Estados de pago predeterminados
INSERT INTO payment_statuses (name, color_code, description) VALUES
('Pagado', '#28a745', 'Pago completado'),
('Pendiente', '#ffc107', 'Pago pendiente'),
('Vencido', '#dc3545', 'Pago vencido'),
('Parcial', '#17a2b8', 'Pago parcial realizado');

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
-- 12. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ============================================

-- Trigger para actualizar estado de ocupación al crear contrato activo
DELIMITER //
CREATE TRIGGER trg_contract_activate 
AFTER UPDATE ON contracts
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
        UPDATE units SET 
            is_occupied = TRUE,
            occupation_status = 'occupied'
        WHERE id = NEW.unit_id;
    END IF;
    
    IF NEW.status IN ('finished', 'cancelled') AND OLD.status = 'active' THEN
        UPDATE units SET 
            is_occupied = FALSE,
            occupation_status = 'vacant'
        WHERE id = NEW.unit_id;
    END IF;
END//

-- Trigger para actualizar estado de pago según el balance
CREATE TRIGGER trg_payment_update_status
BEFORE UPDATE ON payments
FOR EACH ROW
BEGIN
    DECLARE paid_status_id INT;
    DECLARE pending_status_id INT;
    DECLARE overdue_status_id INT;
    DECLARE partial_status_id INT;
    
    SELECT id INTO paid_status_id FROM payment_statuses WHERE name = 'Pagado' LIMIT 1;
    SELECT id INTO pending_status_id FROM payment_statuses WHERE name = 'Pendiente' LIMIT 1;
    SELECT id INTO overdue_status_id FROM payment_statuses WHERE name = 'Vencido' LIMIT 1;
    SELECT id INTO partial_status_id FROM payment_statuses WHERE name = 'Parcial' LIMIT 1;
    
    -- Si está completamente pagado
    IF NEW.amount_paid >= NEW.amount_due THEN
        SET NEW.payment_status_id = paid_status_id;
    -- Si está parcialmente pagado
    ELSEIF NEW.amount_paid > 0 AND NEW.amount_paid < NEW.amount_due THEN
        SET NEW.payment_status_id = partial_status_id;
    -- Si está vencido
    ELSEIF NEW.due_date < CURDATE() THEN
        SET NEW.payment_status_id = overdue_status_id;
    -- Si está pendiente
    ELSE
        SET NEW.payment_status_id = pending_status_id;
    END IF;
END//

DELIMITER ;

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices compuestos para consultas comunes
CREATE INDEX idx_contract_unit_status ON contracts(unit_id, status);
CREATE INDEX idx_payment_contract_status ON payments(contract_id, payment_status_id);
CREATE INDEX idx_expense_date_category ON expenses(expense_date, expense_category_id);
CREATE INDEX idx_unit_building_status ON units(building_id, occupation_status);

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
