import { executeQuery, executeUpdate } from '../config/database';
import { Tenant, PaginationParams } from '../interfaces';

interface TenantFilters {
  status?: string;
  search?: string;
}

class TenantRepository {
  /**
   * Obtener todos los inquilinos con paginación y filtros
   */
  async findAll(params: PaginationParams & TenantFilters = {}): Promise<Tenant[]> {
    const offset = (((params.page || 1) - 1) * (params.limit || 10));
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    let query = `
      SELECT DISTINCT
        t.*,
        c.id as current_contract_id,
        c.status as contract_status,
        u.unit_number,
        u.id as unit_id,
        b.name as building_name,
        b.id as building_id
      FROM tenants t
      LEFT JOIN contracts c ON t.id = c.tenant_id AND c.status = 'active'
      LEFT JOIN units u ON c.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE t.is_active = TRUE
    `;

    // Aplicar filtros
    if (params.status) {
      query += ` AND c.status = $${paramIndex++}`;
      queryParams.push(params.status);
    }

    if (params.search) {
      query += ` AND (
        LOWER(CONCAT(t.first_name, ' ', t.last_name)) LIKE LOWER($${paramIndex}) OR
        LOWER(t.email) LIKE LOWER($${paramIndex + 1}) OR
        LOWER(t.document_number) LIKE LOWER($${paramIndex + 2})
      )`;
      const searchTerm = `%${params.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    query += ` ORDER BY t.last_name, t.first_name
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(params.limit || 10, offset);

    return await executeQuery(query, queryParams);
  }

  /**
   * Contar total de inquilinos con filtros
   */
  async count(filters: TenantFilters = {}): Promise<number> {
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    let query = `
      SELECT COUNT(DISTINCT t.id) as count FROM tenants t
      LEFT JOIN contracts c ON t.id = c.tenant_id AND c.status = 'active'
      LEFT JOIN units u ON c.unit_id = u.id
      WHERE t.is_active = TRUE
    `;

    if (filters.status) {
      query += ` AND c.status = $${paramIndex++}`;
      queryParams.push(filters.status);
    }

    if (filters.search) {
      query += ` AND (
        LOWER(CONCAT(t.first_name, ' ', t.last_name)) LIKE LOWER($${paramIndex}) OR
        LOWER(t.email) LIKE LOWER($${paramIndex + 1}) OR
        LOWER(t.document_number) LIKE LOWER($${paramIndex + 2})
      )`;
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    const result: any = await executeQuery(query, queryParams);
    return parseInt(result[0].count);
  }

  /**
   * Obtener inquilino por ID
   */
  async findById(id: number): Promise<Tenant | null> {
    const results: any[] = await executeQuery(
      'SELECT * FROM tenants WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Buscar inquilino por documento
   */
  async findByDocument(documentNumber: string): Promise<Tenant | null> {
    const results: any[] = await executeQuery(
      'SELECT * FROM tenants WHERE document_number = $1 AND is_active = TRUE',
      [documentNumber]
    );
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Crear un nuevo inquilino
   */
  async create(tenant: Tenant): Promise<number> {
    const query = `
      INSERT INTO tenants (
        document_type, document_number, first_name, last_name,
        email, phone, mobile_phone, emergency_contact_name,
        emergency_contact_phone, occupation, company_name,
        monthly_income, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const result: any = await executeQuery(query, [
      tenant.document_type || null,
      tenant.document_number,
      tenant.first_name,
      tenant.last_name,
      tenant.email || null,
      tenant.phone || null,
      tenant.mobile_phone || null,
      tenant.emergency_contact_name || null,
      tenant.emergency_contact_phone || null,
      tenant.occupation || null,
      tenant.company_name || null,
      tenant.monthly_income || null,
      tenant.notes || null,
    ]);
    return result[0].id;
  }

  /**
   * Actualizar un inquilino
   */
  async update(id: number, tenant: Partial<Tenant>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (tenant.document_type !== undefined) {
      fields.push(`document_type = $${paramIndex}`);
      values.push(tenant.document_type);
      paramIndex++;
    }
    if (tenant.document_number !== undefined) {
      fields.push(`document_number = $${paramIndex}`);
      values.push(tenant.document_number);
      paramIndex++;
    }
    if (tenant.first_name !== undefined) {
      fields.push(`first_name = $${paramIndex}`);
      values.push(tenant.first_name);
      paramIndex++;
    }
    if (tenant.last_name !== undefined) {
      fields.push(`last_name = $${paramIndex}`);
      values.push(tenant.last_name);
      paramIndex++;
    }
    if (tenant.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      values.push(tenant.email);
      paramIndex++;
    }
    if (tenant.phone !== undefined) {
      fields.push(`phone = $${paramIndex}`);
      values.push(tenant.phone);
      paramIndex++;
    }
    if (tenant.mobile_phone !== undefined) {
      fields.push(`mobile_phone = $${paramIndex}`);
      values.push(tenant.mobile_phone);
      paramIndex++;
    }
    if (tenant.emergency_contact_name !== undefined) {
      fields.push(`emergency_contact_name = $${paramIndex}`);
      values.push(tenant.emergency_contact_name);
      paramIndex++;
    }
    if (tenant.emergency_contact_phone !== undefined) {
      fields.push(`emergency_contact_phone = $${paramIndex}`);
      values.push(tenant.emergency_contact_phone);
      paramIndex++;
    }
    if (tenant.occupation !== undefined) {
      fields.push(`occupation = $${paramIndex}`);
      values.push(tenant.occupation);
      paramIndex++;
    }
    if (tenant.company_name !== undefined) {
      fields.push(`company_name = $${paramIndex}`);
      values.push(tenant.company_name);
      paramIndex++;
    }
    if (tenant.monthly_income !== undefined) {
      fields.push(`monthly_income = $${paramIndex}`);
      values.push(tenant.monthly_income);
      paramIndex++;
    }
    if (tenant.notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      values.push(tenant.notes);
      paramIndex++;
    }

    if (fields.length === 0) return false;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE tenants SET ${fields.join(', ')} WHERE id = $${paramIndex} AND is_active = TRUE`;
    const rowCount = await executeUpdate(query, values);
    return rowCount > 0;
  }

  /**
   * Eliminar (soft delete) un inquilino
   */
  async delete(id: number): Promise<boolean> {
    // Hard delete - elimina físicamente el registro de la base de datos
    const rowCount = await executeUpdate(
      'DELETE FROM tenants WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }

  /**
   * Búsqueda avanzada de inquilinos con filtros
   */
  async advancedSearch(filters: {
    search?: string;
    documentType?: string;
    status?: 'active' | 'inactive';
    occupation?: string;
    minIncome?: number;
    maxIncome?: number;
  }, pagination: PaginationParams): Promise<Tenant[]> {
    const offset = ((pagination.page || 1) - 1) * (pagination.limit || 10);
    let query = `
      SELECT t.*,
             CASE 
               WHEN EXISTS (
                 SELECT 1 FROM contracts c 
                 WHERE c.tenant_id = t.id AND c.status = 'active'
               ) THEN 'active'
               ELSE 'inactive'
             END as contract_status
      FROM tenants t
      WHERE t.is_active = TRUE
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Búsqueda por texto (nombre, apellido, email, teléfono)
    if (filters.search) {
      query += ` AND (
        t.first_name ILIKE $${paramIndex} OR 
        t.last_name ILIKE $${paramIndex} OR
        t.email ILIKE $${paramIndex} OR
        t.phone ILIKE $${paramIndex} OR
        t.mobile_phone ILIKE $${paramIndex} OR
        t.document_number ILIKE $${paramIndex}
      )`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Filtro por tipo de documento
    if (filters.documentType) {
      query += ` AND t.document_type = $${paramIndex}`;
      params.push(filters.documentType);
      paramIndex++;
    }

    // Filtro por ocupación
    if (filters.occupation) {
      query += ` AND t.occupation ILIKE $${paramIndex}`;
      params.push(`%${filters.occupation}%`);
      paramIndex++;
    }

    // Filtro por rango de ingresos
    if (filters.minIncome !== undefined) {
      query += ` AND t.monthly_income >= $${paramIndex}`;
      params.push(filters.minIncome);
      paramIndex++;
    }
    if (filters.maxIncome !== undefined) {
      query += ` AND t.monthly_income <= $${paramIndex}`;
      params.push(filters.maxIncome);
      paramIndex++;
    }

    // Filtro por estado (si tiene contrato activo o no)
    if (filters.status === 'active') {
      query += ` AND EXISTS (
        SELECT 1 FROM contracts c 
        WHERE c.tenant_id = t.id AND c.status = 'active'
      )`;
    } else if (filters.status === 'inactive') {
      query += ` AND NOT EXISTS (
        SELECT 1 FROM contracts c 
        WHERE c.tenant_id = t.id AND c.status = 'active'
      )`;
    }

    query += ` ORDER BY t.last_name, t.first_name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pagination.limit || 10, offset);

    return await executeQuery(query, params);
  }

  /**
   * Contar resultados de búsqueda avanzada
   */
  async countAdvancedSearch(filters: {
    search?: string;
    documentType?: string;
    status?: 'active' | 'inactive';
    occupation?: string;
    minIncome?: number;
    maxIncome?: number;
  }): Promise<number> {
    let query = `
      SELECT COUNT(*) as count
      FROM tenants t
      WHERE t.is_active = TRUE
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.search) {
      query += ` AND (
        t.first_name ILIKE $${paramIndex} OR 
        t.last_name ILIKE $${paramIndex} OR
        t.email ILIKE $${paramIndex} OR
        t.phone ILIKE $${paramIndex} OR
        t.mobile_phone ILIKE $${paramIndex} OR
        t.document_number ILIKE $${paramIndex}
      )`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.documentType) {
      query += ` AND t.document_type = $${paramIndex}`;
      params.push(filters.documentType);
      paramIndex++;
    }

    if (filters.occupation) {
      query += ` AND t.occupation ILIKE $${paramIndex}`;
      params.push(`%${filters.occupation}%`);
      paramIndex++;
    }

    if (filters.minIncome !== undefined) {
      query += ` AND t.monthly_income >= $${paramIndex}`;
      params.push(filters.minIncome);
      paramIndex++;
    }
    if (filters.maxIncome !== undefined) {
      query += ` AND t.monthly_income <= $${paramIndex}`;
      params.push(filters.maxIncome);
      paramIndex++;
    }

    if (filters.status === 'active') {
      query += ` AND EXISTS (
        SELECT 1 FROM contracts c 
        WHERE c.tenant_id = t.id AND c.status = 'active'
      )`;
    } else if (filters.status === 'inactive') {
      query += ` AND NOT EXISTS (
        SELECT 1 FROM contracts c 
        WHERE c.tenant_id = t.id AND c.status = 'active'
      )`;
    }

    const result: any = await executeQuery(query, params);
    return parseInt(result[0].count);
  }
}

export default new TenantRepository();
