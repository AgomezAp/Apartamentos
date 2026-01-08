-- ============================================
-- TABLA: MAINTENANCE REQUESTS (Solicitudes de Mantenimiento)
-- ============================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
    id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    category VARCHAR(100) NOT NULL,
    reported_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scheduled_date TIMESTAMP,
    completed_date TIMESTAMP,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    resolved_by INT REFERENCES users(id) ON DELETE SET NULL,
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    notes TEXT,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_unit ON maintenance_requests(unit_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenant ON maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_category ON maintenance_requests(category);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_reported ON maintenance_requests(reported_date);

-- Comentarios
COMMENT ON TABLE maintenance_requests IS 'Solicitudes de mantenimiento y reparaciones reportadas por inquilinos';
COMMENT ON COLUMN maintenance_requests.priority IS 'Prioridad: low, medium, high, urgent';
COMMENT ON COLUMN maintenance_requests.status IS 'Estado: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN maintenance_requests.category IS 'Categoría: Plomería, Electricidad, Pintura, Carpintería, etc.';
