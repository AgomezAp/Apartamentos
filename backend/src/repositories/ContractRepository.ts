import { executeQuery, executeUpdate } from '../config/database';
import { Contract, PaginationParams } from '../interfaces';

class ContractRepository {
  /**
   * Obtener contratos con filtros y paginación
   */
  async findAll(filters: any, pagination: PaginationParams): Promise<Contract[]> {
    const offset = ((pagination.page || 1) - 1) * (pagination.limit || 10);
    let query = `
      SELECT c.*, 
             u.unit_number, b.name as building_name, b.address as building_address,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name, 
             t.email as tenant_email, t.phone as tenant_phone, t.mobile_phone as tenant_mobile_phone
      FROM contracts c
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    if (filters.unit_id) {
      query += ` AND c.unit_id = $${paramIndex}`;
      params.push(filters.unit_id);
      paramIndex++;
    }
    if (filters.tenant_id) {
      query += ` AND c.tenant_id = $${paramIndex}`;
      params.push(filters.tenant_id);
      paramIndex++;
    }

    query += ` ORDER BY c.start_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pagination.limit || 10, offset);

    return await executeQuery(query, params);
  }

  /**
   * Contar contratos con filtros
   */
  async count(filters: any): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM contracts WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    if (filters.unit_id) {
      query += ` AND unit_id = $${paramIndex}`;
      params.push(filters.unit_id);
      paramIndex++;
    }
    if (filters.tenant_id) {
      query += ` AND tenant_id = $${paramIndex}`;
      params.push(filters.tenant_id);
      paramIndex++;
    }

    const result: any = await executeQuery(query, params);
    return parseInt(result[0].count);
  }

  /**
   * Obtener contrato por ID
   */
  async findById(id: number): Promise<Contract | null> {
    const query = `
      SELECT c.*, 
             u.unit_number, b.name as building_name, b.address as building_address,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name, 
             t.email as tenant_email, t.phone as tenant_phone, t.mobile_phone as tenant_mobile_phone
      FROM contracts c
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      WHERE c.id = $1
    `;
    const results: any[] = await executeQuery(query, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Crear un nuevo contrato
   */
  async create(contract: Contract): Promise<number> {
    // Generar número de contrato automáticamente en formato YYYY-NNNNN
    // Buscar el último número de contrato del año actual para evitar duplicados
    const year = new Date().getFullYear();
    const lastContractResult: any = await executeQuery(
      `SELECT contract_number FROM contracts 
       WHERE contract_number LIKE $1 
       ORDER BY contract_number DESC 
       LIMIT 1`,
      [`${year}-%`]
    );
    
    let nextNumber = 1;
    if (lastContractResult.length > 0 && lastContractResult[0].contract_number) {
      // Extraer el número del formato YYYY-NNNNN
      const lastNumber = parseInt(lastContractResult[0].contract_number.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    
    const contractNumber = `${year}-${nextNumber.toString().padStart(5, '0')}`;

    const query = `
      INSERT INTO contracts (
        unit_id, tenant_id, contract_number, start_date, end_date, monthly_rent,
        deposit_amount, payment_day, status, rent_increase_percentage,
        rent_increase_frequency_months, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const result: any = await executeQuery(query, [
      contract.unit_id,
      contract.tenant_id,
      contractNumber,
      contract.start_date,
      contract.end_date,
      contract.monthly_rent,
      contract.deposit_amount || null,
      contract.payment_day || 1,
      contract.status || 'active',
      contract.rent_increase_percentage || null,
      contract.rent_increase_frequency_months || null,
      contract.notes || null,
    ]);
    return result[0].id;
  }

  /**
   * Actualizar un contrato
   */
  async update(id: number, contract: Partial<Contract>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (contract.unit_id !== undefined) {
      fields.push(`unit_id = $${paramIndex}`);
      values.push(contract.unit_id);
      paramIndex++;
    }
    if (contract.tenant_id !== undefined) {
      fields.push(`tenant_id = $${paramIndex}`);
      values.push(contract.tenant_id);
      paramIndex++;
    }
    if (contract.start_date !== undefined) {
      fields.push(`start_date = $${paramIndex}`);
      values.push(contract.start_date);
      paramIndex++;
    }
    if (contract.end_date !== undefined) {
      fields.push(`end_date = $${paramIndex}`);
      values.push(contract.end_date);
      paramIndex++;
    }
    if (contract.monthly_rent !== undefined) {
      fields.push(`monthly_rent = $${paramIndex}`);
      values.push(contract.monthly_rent);
      paramIndex++;
    }
    if (contract.deposit_amount !== undefined) {
      fields.push(`deposit_amount = $${paramIndex}`);
      values.push(contract.deposit_amount);
      paramIndex++;
    }
    if (contract.payment_day !== undefined) {
      fields.push(`payment_day = $${paramIndex}`);
      values.push(contract.payment_day);
      paramIndex++;
    }
    if (contract.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      values.push(contract.status);
      paramIndex++;
    }
    if (contract.notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      values.push(contract.notes);
      paramIndex++;
    }
    if (contract.has_rent_increase !== undefined) {
      fields.push(`has_rent_increase = $${paramIndex}`);
      values.push(contract.has_rent_increase);
      paramIndex++;
    }
    if (contract.rent_increase_percentage !== undefined) {
      fields.push(`rent_increase_percentage = $${paramIndex}`);
      values.push(contract.rent_increase_percentage);
      paramIndex++;
    }
    if (contract.rent_increase_frequency_months !== undefined) {
      fields.push(`rent_increase_frequency_months = $${paramIndex}`);
      values.push(contract.rent_increase_frequency_months);
      paramIndex++;
    }

    if (fields.length === 0) return false;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE contracts SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    const rowCount = await executeUpdate(query, values);
    return rowCount > 0;
  }

  /**
   * Finalizar un contrato
   */
  async finishContract(id: number): Promise<boolean> {
    const query = `
      UPDATE contracts 
      SET status = 'finished', end_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const rowCount = await executeUpdate(query, [id]);
    return rowCount > 0;
  }

  /**
   * Eliminar un contrato
   */
  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM contracts WHERE id = $1`;
    const rowCount = await executeUpdate(query, [id]);
    return rowCount > 0;
  }

  /**
   * Obtener contratos próximos a vencer
   */
  async findExpiring(daysAhead: number): Promise<Contract[]> {
    const query = `
      SELECT c.*, 
             u.unit_number, b.name as building_name,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name, 
             t.email as tenant_email,
             (c.end_date - CURRENT_DATE) as days_until_expiry
      FROM contracts c
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      WHERE c.status = 'active' 
        AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1 * INTERVAL '1 day'
      ORDER BY c.end_date
    `;
    return await executeQuery(query, [daysAhead]);
  }

  /**
   * Búsqueda avanzada de contratos con filtros y ordenamiento
   */
  async advancedSearch(filters: {
    building_id?: number;
    status?: string;
    tenant_id?: number;
    unit_id?: number;
    fromDate?: string;
    toDate?: string;
    minRent?: number;
    maxRent?: number;
    expiringInDays?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<Contract[]> {
    let query = `
      SELECT c.*, 
             u.unit_number, b.id as building_id, b.name as building_name,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name, 
             t.email as tenant_email, t.phone as tenant_phone,
             CASE 
               WHEN c.end_date < CURRENT_DATE THEN 'expired'
               WHEN c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30 THEN 'expiring_soon'
               ELSE 'active'
             END as urgency_status,
             (c.end_date - CURRENT_DATE) as days_until_expiry
      FROM contracts c
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por edificio
    if (filters.building_id) {
      query += ` AND b.id = $${paramIndex}`;
      params.push(filters.building_id);
      paramIndex++;
    }

    // Filtro por estado
    if (filters.status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    // Filtro por inquilino
    if (filters.tenant_id) {
      query += ` AND c.tenant_id = $${paramIndex}`;
      params.push(filters.tenant_id);
      paramIndex++;
    }

    // Filtro por unidad
    if (filters.unit_id) {
      query += ` AND c.unit_id = $${paramIndex}`;
      params.push(filters.unit_id);
      paramIndex++;
    }

    // Filtro por rango de fechas de inicio
    if (filters.fromDate) {
      query += ` AND c.start_date >= $${paramIndex}`;
      params.push(filters.fromDate);
      paramIndex++;
    }
    if (filters.toDate) {
      query += ` AND c.start_date <= $${paramIndex}`;
      params.push(filters.toDate);
      paramIndex++;
    }

    // Filtro por rango de renta mensual
    if (filters.minRent !== undefined) {
      query += ` AND c.monthly_rent >= $${paramIndex}`;
      params.push(filters.minRent);
      paramIndex++;
    }
    if (filters.maxRent !== undefined) {
      query += ` AND c.monthly_rent <= $${paramIndex}`;
      params.push(filters.maxRent);
      paramIndex++;
    }

    // Filtro por contratos próximos a vencer
    if (filters.expiringInDays !== undefined) {
      query += ` AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $${paramIndex} * INTERVAL '1 day'`;
      params.push(filters.expiringInDays);
      paramIndex++;
    }

    // Ordenamiento
    const validSortFields = ['start_date', 'end_date', 'monthly_rent', 'building_name', 'tenant_name', 'status'];
    const sortBy = filters.sortBy && validSortFields.includes(filters.sortBy) ? filters.sortBy : 'start_date';
    const order = filters.order === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortBy} ${order}`;

    return await executeQuery(query, params);
  }

  /**
   * Contar resultados de búsqueda avanzada
   */
  async countAdvancedSearch(filters: {
    building_id?: number;
    status?: string;
    tenant_id?: number;
    unit_id?: number;
    fromDate?: string;
    toDate?: string;
    minRent?: number;
    maxRent?: number;
    expiringInDays?: number;
  }): Promise<number> {
    let query = `
      SELECT COUNT(*) as count
      FROM contracts c
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.building_id) {
      query += ` AND b.id = $${paramIndex}`;
      params.push(filters.building_id);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.tenant_id) {
      query += ` AND c.tenant_id = $${paramIndex}`;
      params.push(filters.tenant_id);
      paramIndex++;
    }

    if (filters.unit_id) {
      query += ` AND c.unit_id = $${paramIndex}`;
      params.push(filters.unit_id);
      paramIndex++;
    }

    if (filters.fromDate) {
      query += ` AND c.start_date >= $${paramIndex}`;
      params.push(filters.fromDate);
      paramIndex++;
    }
    if (filters.toDate) {
      query += ` AND c.start_date <= $${paramIndex}`;
      params.push(filters.toDate);
      paramIndex++;
    }

    if (filters.minRent !== undefined) {
      query += ` AND c.monthly_rent >= $${paramIndex}`;
      params.push(filters.minRent);
      paramIndex++;
    }
    if (filters.maxRent !== undefined) {
      query += ` AND c.monthly_rent <= $${paramIndex}`;
      params.push(filters.maxRent);
      paramIndex++;
    }

    if (filters.expiringInDays !== undefined) {
      query += ` AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $${paramIndex} * INTERVAL '1 day'`;
      params.push(filters.expiringInDays);
      paramIndex++;
    }

    const result: any = await executeQuery(query, params);
    return parseInt(result[0].count);
  }
}

export default new ContractRepository();
