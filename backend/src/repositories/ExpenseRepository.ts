import { executeQuery } from '../config/database';

interface IExpense {
  id?: number;
  building_id: number;
  category_id: number;
  description: string;
  amount: number;
  expense_date: Date;
  payment_method?: string;
  reference_number?: string;
  receipt_file_path?: string;
  notes?: string;
  created_by: number;
}

interface IExpenseCategory {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
}

class ExpenseRepository {
  /**
   * Crear un nuevo gasto
   */
  async create(expense: IExpense): Promise<any> {
    const query = `
      INSERT INTO expenses (
        building_id, category_id, description, amount, expense_date,
        payment_method, reference_number, receipt_file_path, notes, created_by, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      expense.building_id,
      expense.category_id,
      expense.description,
      expense.amount,
      expense.expense_date,
      expense.payment_method || null,
      expense.reference_number || null,
      expense.receipt_file_path || null,
      expense.notes || null,
      expense.created_by
    ];

    const result = await executeQuery(query, values) as any[];
    return result[0];
  }

  /**
   * Obtener todos los gastos con filtros opcionales
   */
  async findAll(filters?: {
    building_id?: number;
    category_id?: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let query = `
      SELECT 
        e.id, e.building_id, e.category_id, e.description, e.amount, 
        e.expense_date, e.payment_method, e.notes, 
        e.receipt_file_path, e.created_by, e.created_at, e.updated_at,
        b.name as building_name,
        b.address as building_address,
        ec.name as category_name,
        u.full_name as created_by_name,
        u.email as created_by_email
      FROM expenses e
      INNER JOIN buildings b ON e.building_id = b.id
      INNER JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.building_id) {
      query += ` AND e.building_id = $${paramIndex}`;
      values.push(filters.building_id);
      paramIndex++;
    }

    if (filters?.category_id) {
      query += ` AND e.category_id = $${paramIndex}`;
      values.push(filters.category_id);
      paramIndex++;
    }

    if (filters?.start_date) {
      query += ` AND e.expense_date >= $${paramIndex}`;
      values.push(filters.start_date);
      paramIndex++;
    }

    if (filters?.end_date) {
      query += ` AND e.expense_date <= $${paramIndex}`;
      values.push(filters.end_date);
      paramIndex++;
    }

    query += ` ORDER BY e.expense_date DESC, e.created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramIndex}`;
      values.push(filters.offset);
    }

    return executeQuery(query, values);
  }

  /**
   * Contar total de gastos con filtros (para paginación)
   */
  async countWithFilters(filters?: {
    building_id?: number;
    category_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<number> {
    let query = `
      SELECT COUNT(*) as total
      FROM expenses e
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.building_id) {
      query += ` AND e.building_id = $${paramIndex}`;
      values.push(filters.building_id);
      paramIndex++;
    }

    if (filters?.category_id) {
      query += ` AND e.category_id = $${paramIndex}`;
      values.push(filters.category_id);
      paramIndex++;
    }

    if (filters?.start_date) {
      query += ` AND e.expense_date >= $${paramIndex}`;
      values.push(filters.start_date);
      paramIndex++;
    }

    if (filters?.end_date) {
      query += ` AND e.expense_date <= $${paramIndex}`;
      values.push(filters.end_date);
      paramIndex++;
    }

    const result = await executeQuery(query, values) as any[];
    return result[0]?.total || 0;
  }
  async findById(id: number): Promise<any> {
    const query = `
      SELECT 
        e.id, e.building_id, e.category_id, e.description, e.amount, 
        e.expense_date, e.payment_method, e.notes, 
        e.receipt_file_path, e.created_by, e.created_at, e.updated_at,
        b.name as building_name,
        b.address as building_address,
        ec.name as category_name,
        ec.description as category_description,
        u.full_name as created_by_name,
        u.email as created_by_email
      FROM expenses e
      INNER JOIN buildings b ON e.building_id = b.id
      INNER JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = $1
    `;

    const result = await executeQuery(query, [id]) as any[];
    return result[0];
  }

  /**
   * Obtener gastos por edificio
   */
  async findByBuilding(buildingId: number, filters?: {
    start_date?: string;
    end_date?: string;
    category_id?: number;
  }): Promise<any[]> {
    let query = `
      SELECT 
        e.id, e.building_id, e.category_id, e.description, e.amount, 
        e.expense_date, e.payment_method, e.notes, 
        e.receipt_file_path, e.created_by, e.created_at, e.updated_at,
        ec.name as category_name,
        u.full_name as created_by_name,
        u.email as created_by_email
      FROM expenses e
      INNER JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.building_id = $1
    `;

    const values: any[] = [buildingId];
    let paramIndex = 2;

    if (filters?.category_id) {
      query += ` AND e.category_id = $${paramIndex}`;
      values.push(filters.category_id);
      paramIndex++;
    }

    if (filters?.start_date) {
      query += ` AND e.expense_date >= $${paramIndex}`;
      values.push(filters.start_date);
      paramIndex++;
    }

    if (filters?.end_date) {
      query += ` AND e.expense_date <= $${paramIndex}`;
      values.push(filters.end_date);
    }

    query += ` ORDER BY e.expense_date DESC`;

    return executeQuery(query, values);
  }

  /**
   * Obtener resumen de gastos por edificio
   */
  async getSummaryByBuilding(buildingId: number, year?: number, month?: number): Promise<any> {
    let query = `
      SELECT 
        COUNT(*) as total_expenses,
        SUM(e.amount) as total_amount,
        ec.name as category_name,
        ec.id as category_id
      FROM expenses e
      INNER JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.building_id = $1
    `;

    const values: any[] = [buildingId];
    let paramIndex = 2;

    if (year) {
      query += ` AND EXTRACT(YEAR FROM e.expense_date) = $${paramIndex}`;
      values.push(year);
      paramIndex++;
    }

    if (month) {
      query += ` AND EXTRACT(MONTH FROM e.expense_date) = $${paramIndex}`;
      values.push(month);
    }

    query += ` GROUP BY ec.id, ec.name ORDER BY total_amount DESC`;

    return executeQuery(query, values);
  }

  /**
   * Actualizar un gasto
   */
  async update(id: number, expense: Partial<IExpense>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (expense.building_id !== undefined) {
      fields.push(`building_id = $${paramIndex}`);
      values.push(expense.building_id);
      paramIndex++;
    }

    if (expense.category_id !== undefined) {
      fields.push(`category_id = $${paramIndex}`);
      values.push(expense.category_id);
      paramIndex++;
    }

    if (expense.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(expense.description);
      paramIndex++;
    }

    if (expense.amount !== undefined) {
      fields.push(`amount = $${paramIndex}`);
      values.push(expense.amount);
      paramIndex++;
    }

    if (expense.expense_date !== undefined) {
      fields.push(`expense_date = $${paramIndex}`);
      values.push(expense.expense_date);
      paramIndex++;
    }

    if (expense.payment_method !== undefined) {
      fields.push(`payment_method = $${paramIndex}`);
      values.push(expense.payment_method);
      paramIndex++;
    }

    if (expense.reference_number !== undefined) {
      fields.push(`reference_number = $${paramIndex}`);
      values.push(expense.reference_number);
      paramIndex++;
    }

    if (expense.receipt_file_path !== undefined) {
      fields.push(`receipt_file_path = $${paramIndex}`);
      values.push(expense.receipt_file_path);
      paramIndex++;
    }

    if (expense.notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      values.push(expense.notes);
      paramIndex++;
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE expenses
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await executeQuery(query, values) as any[];
    return result[0];
  }

  /**
   * Eliminar un gasto
   */
  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM expenses WHERE id = $1`;
    await executeQuery(query, [id]);
    return true;
  }

  /**
   * Obtener estadísticas de gastos
   */
  async getStatistics(filters?: {
    building_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    // Construir la cláusula WHERE base
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.building_id) {
      whereClause += ` AND building_id = $${paramIndex}`;
      values.push(filters.building_id);
      paramIndex++;
    }

    if (filters?.start_date) {
      whereClause += ` AND expense_date >= $${paramIndex}`;
      values.push(filters.start_date);
      paramIndex++;
    }

    if (filters?.end_date) {
      whereClause += ` AND expense_date <= $${paramIndex}`;
      values.push(filters.end_date);
      paramIndex++;
    }

    // 1. Obtener estadísticas generales
    const generalQuery = `
      SELECT 
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        MIN(amount) as min_expense,
        MAX(amount) as max_expense,
        MIN(expense_date) as first_expense_date,
        MAX(expense_date) as last_expense_date
      FROM expenses
      ${whereClause}
    `;

    const generalResult = await executeQuery(generalQuery, values) as any[];
    const generalStats = generalResult[0] || {
      total_expenses: 0,
      total_amount: 0,
      average_amount: 0,
      min_expense: 0,
      max_expense: 0
    };

    // Convertir valores a números
    generalStats.total_expenses = Number(generalStats.total_expenses) || 0;
    generalStats.total_amount = parseFloat(generalStats.total_amount) || 0;
    generalStats.average_amount = parseFloat(generalStats.average_amount) || 0;
    generalStats.min_expense = parseFloat(generalStats.min_expense) || 0;
    generalStats.max_expense = parseFloat(generalStats.max_expense) || 0;

    // 2. Obtener tendencia mensual
    const monthlyQuery = `
      SELECT 
        EXTRACT(YEAR FROM expense_date)::int as year,
        EXTRACT(MONTH FROM expense_date)::int as month,
        TO_CHAR(expense_date, 'Mon') as month_name,
        SUM(amount) as total,
        COUNT(*) as count
      FROM expenses
      ${whereClause}
      GROUP BY EXTRACT(YEAR FROM expense_date), EXTRACT(MONTH FROM expense_date), TO_CHAR(expense_date, 'Mon')
      ORDER BY year DESC, month DESC
    `;

    const monthlyResult = await executeQuery(monthlyQuery, values) as any[];
    const monthlyTrend = monthlyResult.map(row => ({
      year: Number(row.year),
      month: Number(row.month),
      month_name: row.month_name,
      total: parseFloat(row.total) || 0,
      count: Number(row.count)
    })).reverse();

    // 3. Obtener gastos por categoría
    const simpleCategoryQuery = `
      SELECT 
        ec.id as category_id,
        ec.name as category_name,
        COUNT(e.id) as count,
        COALESCE(SUM(e.amount), 0) as total_amount
      FROM expense_categories ec
      LEFT JOIN expenses e ON ec.id = e.category_id
      WHERE 1=1
        ${filters?.building_id ? 'AND e.building_id = $1' : ''}
        ${filters?.start_date ? `AND e.expense_date >= ${filters?.building_id ? '$2' : '$1'}` : ''}
        ${filters?.end_date ? `AND e.expense_date <= ${filters?.building_id ? (filters?.start_date ? '$3' : '$2') : (filters?.start_date ? '$2' : '$1')}` : ''}
      GROUP BY ec.id, ec.name
      HAVING COUNT(e.id) > 0
      ORDER BY total_amount DESC
    `;

    const categoryValues: any[] = [];
    if (filters?.building_id) categoryValues.push(filters.building_id);
    if (filters?.start_date) categoryValues.push(filters.start_date);
    if (filters?.end_date) categoryValues.push(filters.end_date);

    const categoryResult = await executeQuery(simpleCategoryQuery, categoryValues) as any[];
    
    // Calcular total para porcentajes
    const totalByCategory = categoryResult.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0);
    const byCategory = categoryResult.map(row => ({
      category_id: Number(row.category_id),
      category_name: row.category_name,
      count: Number(row.count),
      total_amount: parseFloat(row.total_amount) || 0,
      percentage: totalByCategory > 0 ? (parseFloat(row.total_amount) / totalByCategory * 100) : 0
    }));

    // 4. Obtener gastos por método de pago
    const paymentMethodQuery = `
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM expenses
      ${whereClause}
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `;

    const paymentResult = await executeQuery(paymentMethodQuery, values) as any[];
    
    // Calcular total para porcentajes
    const totalByPayment = paymentResult.reduce((sum, pay) => sum + parseFloat(pay.total_amount), 0);
    const byPaymentMethod = paymentResult.map(row => ({
      payment_method: row.payment_method,
      count: Number(row.count),
      total_amount: parseFloat(row.total_amount) || 0,
      percentage: totalByPayment > 0 ? (parseFloat(row.total_amount) / totalByPayment * 100) : 0
    }));

    return {
      total_expenses: generalStats.total_expenses,
      total_amount: generalStats.total_amount,
      average_amount: generalStats.average_amount,
      max_expense: generalStats.max_expense,
      min_expense: generalStats.min_expense,
      monthly_trend: monthlyTrend,
      by_category: byCategory,
      by_payment_method: byPaymentMethod
    };
  }

  // ==================== CATEGORÍAS ====================

  /**
   * Obtener todas las categorías de gastos
   */
  async getCategories(activeOnly: boolean = true): Promise<any[]> {
    let query = `
      SELECT id as expense_category_id, name, description, is_active, created_at, updated_at 
      FROM expense_categories
    `;

    if (activeOnly) {
      query += ` WHERE is_active = true`;
    }

    query += ` ORDER BY name ASC`;

    return executeQuery(query);
  }

  /**
   * Obtener una categoría por ID
   */
  async getCategoryById(id: number): Promise<any> {
    const query = `SELECT * FROM expense_categories WHERE id = $1`;
    const result = await executeQuery(query, [id]) as any[];
    return result[0];
  }

  /**
   * Crear una categoría de gasto
   */
  async createCategory(category: IExpenseCategory): Promise<any> {
    const query = `
      INSERT INTO expense_categories (name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [
      category.name,
      category.description || null,
      category.is_active !== undefined ? category.is_active : true
    ];

    const result = await executeQuery(query, values) as any[];
    return result[0];
  }

  /**
   * Actualizar una categoría
   */
  async updateCategory(id: number, category: Partial<IExpenseCategory>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (category.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(category.name);
      paramIndex++;
    }

    if (category.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(category.description);
      paramIndex++;
    }

    if (category.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      values.push(category.is_active);
      paramIndex++;
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE expense_categories
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await executeQuery(query, values) as any[];
    return result[0];
  }

  /**
   * Eliminar una categoría
   */
  async deleteCategory(id: number): Promise<boolean> {
    const query = `DELETE FROM expense_categories WHERE id = $1`;
    await executeQuery(query, [id]);
    return true;
  }

  /**
   * Obtener la suma total de montos con filtros (para mostrar monto total)
   */
  async getTotalAmountWithFilters(filters?: {
    building_id?: number;
    category_id?: number;
    start_date?: string;
    end_date?: string;
    payment_method?: string;
  }): Promise<number> {
    let query = `
      SELECT SUM(e.amount) as total
      FROM expenses e
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.building_id) {
      query += ` AND e.building_id = $${paramIndex}`;
      values.push(filters.building_id);
      paramIndex++;
    }

    if (filters?.category_id) {
      query += ` AND e.category_id = $${paramIndex}`;
      values.push(filters.category_id);
      paramIndex++;
    }

    if (filters?.start_date) {
      query += ` AND e.expense_date >= $${paramIndex}`;
      values.push(filters.start_date);
      paramIndex++;
    }

    if (filters?.end_date) {
      query += ` AND e.expense_date <= $${paramIndex}`;
      values.push(filters.end_date);
      paramIndex++;
    }

    if (filters?.payment_method) {
      query += ` AND e.payment_method = $${paramIndex}`;
      values.push(filters.payment_method);
      paramIndex++;
    }

    const result = await executeQuery(query, values) as any[];
    return parseFloat(result[0]?.total) || 0;
  }
}

export default new ExpenseRepository();
