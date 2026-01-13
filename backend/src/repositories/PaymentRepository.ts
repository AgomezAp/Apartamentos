import { executeQuery, executeUpdate } from '../config/database';
import { Payment, PaymentTransaction } from '../interfaces';

class PaymentRepository {
  /**
   * Obtener pagos con filtros
   */
  async findAll(filters: any): Promise<Payment[]> {
    let query = `
      SELECT p.id, p.contract_id, p.period_month, p.period_year, p.amount_due, p.amount_due as amount, p.due_date, p.payment_date,
             p.payment_status_id, p.payment_method, p.notes, p.created_at, p.updated_at,
             c.monthly_rent, c.unit_id,
             u.unit_number, b.name as building_name,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
             ps.name as status_name
      FROM payments p
      INNER JOIN contracts c ON p.contract_id = c.id
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id 
      LEFT JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.contract_id) {
      query += ` AND p.contract_id = $${paramIndex}`;
      params.push(filters.contract_id);
      paramIndex++;
    }

    if (filters.tenant_id) {
      query += ` AND c.tenant_id = $${paramIndex}`;
      params.push(filters.tenant_id);
      paramIndex++;
    }

    // Mapear status del frontend al status_id de la BD
    // Según la base de datos real:
    // 1 = Pendiente, 2 = Pagado, 3 = Vencido, 4 = Parcial, 5 = Cancelado
    if (filters.status) {
      const statusMap: {[key: string]: number} = {
        'pending': 1,    // Pendiente
        'completed': 2,  // Pagado
        'paid': 2,       // Pagado (alias)
        'overdue': 3,    // Vencido
        'partial': 4,    // Parcial
        'cancelled': 5   // Cancelado
      };
      const statusId = statusMap[filters.status.toLowerCase()];
      if (statusId) {
        query += ` AND p.payment_status_id = $${paramIndex}`;
        params.push(statusId);
        paramIndex++;
      }
    }

    if (filters.payment_method) {
      query += ` AND p.payment_method = $${paramIndex}`;
      params.push(filters.payment_method);
      paramIndex++;
    }

    if (filters.period_year) {
      query += ` AND p.period_year = $${paramIndex}`;
      params.push(filters.period_year);
      paramIndex++;
    }

    if (filters.period_month) {
      query += ` AND p.period_month = $${paramIndex}`;
      params.push(filters.period_month);
      paramIndex++;
    }

    // Filtros de fecha (start_date / date_from)
    if (filters.start_date) {
      query += ` AND p.due_date >= $${paramIndex}`;
      params.push(filters.start_date);
      paramIndex++;
    }

    // Filtros de fecha (end_date / date_to)
    if (filters.end_date) {
      query += ` AND p.due_date <= $${paramIndex}`;
      params.push(filters.end_date);
      paramIndex++;
    }

    query += ` ORDER BY p.period_year DESC, p.period_month DESC`;

    return await executeQuery(query, params);
  }

  /**
   * Obtener pago por ID
   */
  async findById(id: number): Promise<Payment | null> {
    const query = `
      SELECT p.id, p.contract_id, p.period_month, p.period_year, p.amount_due, p.amount_due as amount, p.due_date, p.payment_date,
             p.payment_status_id, p.payment_method, p.notes, p.created_at, p.updated_at,
             c.monthly_rent, c.unit_id,
             u.unit_number, b.name as building_name,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
             ps.name as status_name
      FROM payments p
      INNER JOIN contracts c ON p.contract_id = c.id
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE p.id = $1
    `;
    const results: any[] = await executeQuery(query, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Obtener pagos de una unidad específica (historial de pagos del arrendatario actual)
   */
  async findByUnitId(unitId: number, limit: number = 12): Promise<Payment[]> {
    const query = `
      SELECT p.id, p.contract_id, p.period_month, p.period_year, p.amount_due, p.amount_due as amount, p.due_date, p.payment_date,
             p.payment_status_id, p.payment_method, p.notes, p.created_at, p.updated_at,
             c.monthly_rent, c.unit_id,
             u.unit_number, b.name as building_name,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
             ps.name as status_name
      FROM payments p
      INNER JOIN contracts c ON p.contract_id = c.id
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE u.id = $1
      ORDER BY p.period_year DESC, p.period_month DESC
      LIMIT $2
    `;
    return await executeQuery(query, [unitId, limit]);
  }  /**
   * Crear un nuevo pago
   */
  async create(payment: Payment): Promise<number> {
    const query = `
      INSERT INTO payments (
        contract_id, period_month, period_year, amount_due, amount_paid,
        due_date, payment_date, payment_status_id, payment_method, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const result: any = await executeQuery(query, [
      payment.contract_id,
      payment.period_month,
      payment.period_year,
      payment.amount_due,
      payment.amount_paid || null,
      payment.due_date,
      payment.payment_date || null,
      payment.payment_status_id || 1, // Default: Pendiente
      payment.payment_method || null,
      payment.notes || null,
    ]);
    return result[0].id;
  }

  /**
   * Actualizar un pago
   */
  async update(id: number, payment: Partial<Payment>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (payment.amount_paid !== undefined) {
      fields.push(`amount_paid = $${paramIndex}`);
      values.push(payment.amount_paid);
      paramIndex++;
    }
    if (payment.payment_date !== undefined) {
      fields.push(`payment_date = $${paramIndex}`);
      values.push(payment.payment_date);
      paramIndex++;
    }
    if (payment.payment_status_id !== undefined) {
      fields.push(`payment_status_id = $${paramIndex}`);
      values.push(payment.payment_status_id);
      paramIndex++;
    }
    if (payment.notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      values.push(payment.notes);
      paramIndex++;
    }

    if (fields.length === 0) return false;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE payments SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    const rowCount = await executeUpdate(query, values);
    return rowCount > 0;
  }

  /**
   * Obtener transacciones de un pago
   */
  async getTransactions(paymentId: number): Promise<PaymentTransaction[]> {
    const query = `
      SELECT pt.*, u.full_name as created_by_name, u.email as created_by_email
      FROM payment_transactions pt
      LEFT JOIN users u ON pt.created_by = u.id
      WHERE pt.payment_id = $1
      ORDER BY pt.transaction_date DESC
    `;
    return await executeQuery(query, [paymentId]);
  }

  /**
   * Agregar una transacción a un pago
   */
  async addTransaction(transaction: PaymentTransaction): Promise<number> {
    const query = `
      INSERT INTO payment_transactions (
        payment_id, amount, transaction_date, payment_method,
        reference_number, receipt_file_path, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    const result: any = await executeQuery(query, [
      transaction.payment_id,
      transaction.amount,
      transaction.transaction_date || new Date(),
      transaction.payment_method,
      transaction.reference_number || null,
      transaction.receipt_file_path || null,
      transaction.notes || null,
      transaction.created_by || null,
    ]);

    // Actualizar el monto pagado del pago
    await executeQuery(
      `UPDATE payments 
       SET amount_paid = amount_paid + $1, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [transaction.amount, transaction.payment_id]
    );

    // Actualizar estado si está completamente pagado
    await executeQuery(
      `UPDATE payments 
       SET payment_status_id = (SELECT id FROM payment_statuses WHERE name = 'Pagado' LIMIT 1)
       WHERE id = $1 AND amount_paid >= amount_due`,
      [transaction.payment_id]
    );

    return result[0].id;
  }

  /**
   * Obtener pagos vencidos
   */
  async getOverdue(): Promise<any[]> {
    const query = `
      SELECT p.*,
             c.unit_id, c.tenant_id,
             u.unit_number, b.name as building_name,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name, t.email as tenant_email,
             (p.amount_due - p.amount_paid) as balance,
             (CURRENT_DATE - p.due_date) as days_overdue
      FROM payments p
      INNER JOIN contracts c ON p.contract_id = c.id
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      WHERE p.due_date < CURRENT_DATE 
        AND p.amount_paid < p.amount_due
      ORDER BY p.due_date
    `;
    return await executeQuery(query);
  }

  /**
   * Generar pagos mensuales para un contrato
   */
  async generateMonthlyPayments(contractId: number, year: number, month: number): Promise<number> {
    // Verificar si ya existe el pago
    const existing: any = await executeQuery(
      `SELECT id FROM payments 
       WHERE contract_id = $1 AND period_year = $2 AND period_month = $3`,
      [contractId, year, month]
    );

    if (existing.length > 0) {
      return existing[0].id;
    }

    // Obtener datos del contrato
    const contractData: any = await executeQuery(
      'SELECT monthly_rent, payment_day FROM contracts WHERE id = $1',
      [contractId]
    );

    if (contractData.length === 0) {
      throw new Error('Contrato no encontrado');
    }

    const { monthly_rent, payment_day } = contractData[0];
    const dueDate = new Date(year, month - 1, payment_day || 1);

    // Crear el pago
    const query = `
      INSERT INTO payments (
        contract_id, period_month, period_year, amount_due, due_date, payment_status_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const result: any = await executeQuery(query, [
      contractId,
      month,
      year,
      monthly_rent,
      dueDate,
    ]);

    return result[0].id;
  }

  /**
   * Búsqueda avanzada de pagos con filtros
   */
  async advancedSearch(filters: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    building_id?: number;
    tenant_id?: number;
    contract_id?: number;
    minAmount?: number;
    maxAmount?: number;
    overdueDays?: number;
  }): Promise<Payment[]> {
    let query = `
      SELECT p.*, 
             c.monthly_rent, c.unit_id, c.tenant_id,
             u.unit_number, b.id as building_id, b.name as building_name,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name, t.email as tenant_email,
             ps.name as status_name,
             (p.amount_due - p.amount_paid) as balance,
             CASE 
               WHEN p.due_date < CURRENT_DATE AND p.amount_paid < p.amount_due 
               THEN (CURRENT_DATE - p.due_date) 
               ELSE 0 
             END as days_overdue
      FROM payments p
      INNER JOIN contracts c ON p.contract_id = c.id
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por estado
    if (filters.status) {
      if (filters.status === 'overdue') {
        query += ` AND p.due_date < CURRENT_DATE AND p.amount_paid < p.amount_due`;
      } else {
        query += ` AND ps.name = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }
    }

    // Filtro por rango de fechas (due_date)
    if (filters.fromDate) {
      query += ` AND p.due_date >= $${paramIndex}`;
      params.push(filters.fromDate);
      paramIndex++;
    }
    if (filters.toDate) {
      query += ` AND p.due_date <= $${paramIndex}`;
      params.push(filters.toDate);
      paramIndex++;
    }

    // Filtro por edificio
    if (filters.building_id) {
      query += ` AND b.id = $${paramIndex}`;
      params.push(filters.building_id);
      paramIndex++;
    }

    // Filtro por inquilino
    if (filters.tenant_id) {
      query += ` AND c.tenant_id = $${paramIndex}`;
      params.push(filters.tenant_id);
      paramIndex++;
    }

    // Filtro por contrato
    if (filters.contract_id) {
      query += ` AND p.contract_id = $${paramIndex}`;
      params.push(filters.contract_id);
      paramIndex++;
    }

    // Filtro por rango de monto
    if (filters.minAmount !== undefined) {
      query += ` AND p.amount_due >= $${paramIndex}`;
      params.push(filters.minAmount);
      paramIndex++;
    }
    if (filters.maxAmount !== undefined) {
      query += ` AND p.amount_due <= $${paramIndex}`;
      params.push(filters.maxAmount);
      paramIndex++;
    }

    // Filtro por días de mora
    if (filters.overdueDays !== undefined) {
      query += ` AND (CURRENT_DATE - p.due_date) >= $${paramIndex}`;
      params.push(filters.overdueDays);
      paramIndex++;
    }

    query += ` ORDER BY p.due_date DESC, p.period_year DESC, p.period_month DESC`;

    return await executeQuery(query, params);
  }

  /**
   * Contar resultados de búsqueda avanzada
   */
  async countAdvancedSearch(filters: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    building_id?: number;
    tenant_id?: number;
    contract_id?: number;
    minAmount?: number;
    maxAmount?: number;
    overdueDays?: number;
  }): Promise<number> {
    let query = `
      SELECT COUNT(*) as count
      FROM payments p
      INNER JOIN contracts c ON p.contract_id = c.id
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      LEFT JOIN payment_statuses ps ON p.payment_status_id = ps.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      if (filters.status === 'overdue') {
        query += ` AND p.due_date < CURRENT_DATE AND p.amount_paid < p.amount_due`;
      } else {
        query += ` AND ps.name = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }
    }

    if (filters.fromDate) {
      query += ` AND p.due_date >= $${paramIndex}`;
      params.push(filters.fromDate);
      paramIndex++;
    }
    if (filters.toDate) {
      query += ` AND p.due_date <= $${paramIndex}`;
      params.push(filters.toDate);
      paramIndex++;
    }

    if (filters.building_id) {
      query += ` AND b.id = $${paramIndex}`;
      params.push(filters.building_id);
      paramIndex++;
    }

    if (filters.tenant_id) {
      query += ` AND c.tenant_id = $${paramIndex}`;
      params.push(filters.tenant_id);
      paramIndex++;
    }

    if (filters.contract_id) {
      query += ` AND p.contract_id = $${paramIndex}`;
      params.push(filters.contract_id);
      paramIndex++;
    }

    if (filters.minAmount !== undefined) {
      query += ` AND p.amount_due >= $${paramIndex}`;
      params.push(filters.minAmount);
      paramIndex++;
    }
    if (filters.maxAmount !== undefined) {
      query += ` AND p.amount_due <= $${paramIndex}`;
      params.push(filters.maxAmount);
      paramIndex++;
    }

    if (filters.overdueDays !== undefined) {
      query += ` AND (CURRENT_DATE - p.due_date) >= $${paramIndex}`;
      params.push(filters.overdueDays);
      paramIndex++;
    }

    const result: any = await executeQuery(query, params);
    return parseInt(result[0].count);
  }

  /**
   * Eliminar un pago
   */
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM payments WHERE id = $1';
    const result = await executeUpdate(query, [id]);
    return result > 0;
  }
}

export default new PaymentRepository();
