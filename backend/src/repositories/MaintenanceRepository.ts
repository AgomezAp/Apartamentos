import { executeQuery } from '../config/database';

interface MaintenanceRequest {
  id?: number;
  unit_id: number;
  tenant_id?: number | null;  // Nullable para unidades desocupadas
  title: string;
  description: string;
  priority?: string;
  status?: string;
  category: string;
  reported_date?: Date;
  scheduled_date?: Date | null;
  completed_date?: Date | null;
  assigned_to?: number | null;
  assigned_to_name?: string | null;  // Nombre del técnico/tercero
  assigned_to_phone?: string | null; // Teléfono del técnico
  assigned_to_company?: string | null; // Empresa del técnico
  assigned_to_email?: string | null; // Email del técnico
  resolved_by?: number | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  notes?: string | null;
  attachments?: any;
}

/**
 * Helper para mapear 'id' a 'request_id' en respuestas
 */
function mapToRequestId(row: any): any {
  if (!row) return null;
  const mapped = { ...row };
  if ('id' in mapped) {
    mapped.request_id = mapped.id;
    delete mapped.id;
  }
  return mapped;
}

class MaintenanceRepository {
  async getAll(filters: {
    status?: string;
    priority?: string;
    unit_id?: number;
    tenant_id?: number;
    category?: string;
  }): Promise<any[]> {
    let query = `
      SELECT 
        mr.id as request_id,
        mr.unit_id,
        mr.tenant_id,
        mr.title,
        mr.description,
        mr.priority,
        mr.status,
        mr.category,
        mr.reported_date,
        mr.scheduled_date,
        mr.completed_date,
        mr.assigned_to,
        mr.assigned_to_name,
        mr.assigned_to_phone,
        mr.assigned_to_company,
        mr.assigned_to_email,
        mr.resolved_by,
        mr.estimated_cost,
        mr.actual_cost,
        mr.notes,
        mr.attachments,
        mr.created_at,
        mr.updated_at,
        u.unit_number,
        b.name as building_name,
        CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
        t.email as tenant_email,
        COALESCE(mr.assigned_to_name, assignee.full_name) as assigned_to_display_name
      FROM maintenance_requests mr
      LEFT JOIN units u ON mr.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN tenants t ON mr.tenant_id = t.id
      LEFT JOIN users assignee ON mr.assigned_to = assignee.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND mr.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.priority) {
      query += ` AND mr.priority = $${paramIndex}`;
      params.push(filters.priority);
      paramIndex++;
    }

    if (filters.unit_id) {
      query += ` AND mr.unit_id = $${paramIndex}`;
      params.push(filters.unit_id);
      paramIndex++;
    }

    if (filters.tenant_id) {
      query += ` AND mr.tenant_id = $${paramIndex}`;
      params.push(filters.tenant_id);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND mr.category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    query += ' ORDER BY mr.created_at DESC';

    return await executeQuery(query, params);
  }

  async getById(id: number): Promise<any | null> {
    const result: any[] = await executeQuery(
      `
      SELECT 
        mr.id as request_id,
        mr.unit_id,
        mr.tenant_id,
        mr.title,
        mr.description,
        mr.priority,
        mr.status,
        mr.category,
        mr.reported_date,
        mr.scheduled_date,
        mr.completed_date,
        mr.assigned_to,
        mr.assigned_to_name,
        mr.assigned_to_phone,
        mr.assigned_to_company,
        mr.assigned_to_email,
        mr.resolved_by,
        mr.estimated_cost,
        mr.actual_cost,
        mr.notes,
        mr.attachments,
        mr.created_at,
        mr.updated_at,
        u.unit_number,
        b.name as building_name,
        CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
        t.email as tenant_email,
        t.phone as tenant_phone,
        COALESCE(mr.assigned_to_name, assignee.full_name) as assigned_to_display_name
      FROM maintenance_requests mr
      LEFT JOIN units u ON mr.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN tenants t ON mr.tenant_id = t.id
      LEFT JOIN users assignee ON mr.assigned_to = assignee.id
      WHERE mr.id = $1
      `,
      [id]
    );
    return result.length > 0 ? result[0] : null;
  }

  async create(maintenanceRequest: MaintenanceRequest): Promise<any> {
    const result: any[] = await executeQuery(
      `
      INSERT INTO maintenance_requests (
        unit_id, tenant_id, title, description, priority, status, category,
        reported_date, scheduled_date, assigned_to, estimated_cost, notes,
        attachments, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [
        maintenanceRequest.unit_id,
        maintenanceRequest.tenant_id || null,  // Permitir null para unidades desocupadas
        maintenanceRequest.title,
        maintenanceRequest.description,
        maintenanceRequest.priority || 'medium',
        maintenanceRequest.status || 'pending',
        maintenanceRequest.category,
        maintenanceRequest.reported_date || new Date(),
        maintenanceRequest.scheduled_date || null,
        maintenanceRequest.assigned_to || null,
        maintenanceRequest.estimated_cost || null,
        maintenanceRequest.notes || null,
        maintenanceRequest.attachments ? JSON.stringify(maintenanceRequest.attachments) : null,
      ]
    );
    return mapToRequestId(result[0]);
  }

  async update(id: number, maintenanceRequest: Partial<MaintenanceRequest>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const updateableFields = [
      'title', 'description', 'priority', 'status', 'category',
      'scheduled_date', 'completed_date', 'assigned_to', 'assigned_to_name',
      'assigned_to_phone', 'assigned_to_company', 'assigned_to_email', 
      'resolved_by', 'estimated_cost', 'actual_cost', 'notes', 'attachments'
    ];

    updateableFields.forEach(field => {
      if (maintenanceRequest[field as keyof MaintenanceRequest] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(
          field === 'attachments' && maintenanceRequest[field]
            ? JSON.stringify(maintenanceRequest[field])
            : maintenanceRequest[field as keyof MaintenanceRequest]
        );
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result: any[] = await executeQuery(
      `UPDATE maintenance_requests SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return mapToRequestId(result[0]);
  }

  async resolve(id: number, resolvedBy: string, actualCost?: number, notes?: string): Promise<any> {
    const result: any[] = await executeQuery(
      `
      UPDATE maintenance_requests 
      SET status = 'completed',
          completed_date = CURRENT_TIMESTAMP,
          resolved_by = $1,
          actual_cost = $2,
          notes = COALESCE($3, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
      `,
      [resolvedBy, actualCost || null, notes || null, id]
    );
    return mapToRequestId(result[0]);
  }

  async delete(id: number): Promise<boolean> {
    await executeQuery('DELETE FROM maintenance_requests WHERE id = $1', [id]);
    return true;
  }

  async getPending(): Promise<any[]> {
    return await this.getAll({ status: 'pending' });
  }

  async getByUnit(unitId: number): Promise<any[]> {
    return await this.getAll({ unit_id: unitId });
  }

  async getByTenant(tenantId: number): Promise<any[]> {
    return await this.getAll({ tenant_id: tenantId });
  }

  async getUrgent(): Promise<any[]> {
    return await this.getAll({ priority: 'urgent' });
  }

  async getStatsByCategory(): Promise<any[]> {
    return await executeQuery(
      `
      SELECT 
        category,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        AVG(actual_cost) FILTER (WHERE actual_cost IS NOT NULL) as avg_cost
      FROM maintenance_requests
      GROUP BY category
      ORDER BY total DESC
      `
    );
  }
}

export default new MaintenanceRepository();
