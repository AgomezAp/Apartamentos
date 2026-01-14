import { executeQuery } from '../config/database';

/**
 * Repository para reportes de ingresos
 */
class IncomeRepository {
  /**
   * Obtener ingresos por período (solo dinero que entra)
   * Incluye pagos completados y parciales
   * @param startDate Fecha de inicio (YYYY-MM-DD)
   * @param endDate Fecha de fin (YYYY-MM-DD)
   */
  async getIncomeByPeriod(startDate: string, endDate: string, buildingId?: number): Promise<any> {
    try {
      // Filtrar por payment_date (cuando se pagó realmente) O por due_date si payment_date es null
      // Esto incluye pagos que se hicieron en el período seleccionado
      const result: any = await executeQuery(
        `SELECT 
          p.id as payment_id,
          p.due_date,
          p.payment_date,
          p.amount_due,
          p.amount_paid,
          (p.amount_due - p.amount_paid) as balance,
          ps.name as status,
          b.name as building,
          u.unit_number as unit,
          CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
          t.email as tenant_email,
          p.payment_method
        FROM payments p
        JOIN payment_statuses ps ON p.payment_status_id = ps.id
        JOIN contracts c ON p.contract_id = c.id
        JOIN units u ON c.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        JOIN tenants t ON c.tenant_id = t.id
        WHERE ps.name IN ('Pagado', 'Completado', 'Parcial')
          AND (
            -- Si tiene payment_date, filtrar por esa fecha (cuando realmente se pagó)
            (p.payment_date IS NOT NULL AND p.payment_date >= $1 AND p.payment_date <= $2)
            OR
            -- Si no tiene payment_date pero está completado/parcial, usar due_date como fallback
            (p.payment_date IS NULL AND p.due_date >= $1 AND p.due_date <= $2)
          )
          
          /* Filtro por edificio si se proporcionó */
          ${buildingId ? 'AND b.id = $3' : ''}
        ORDER BY COALESCE(p.payment_date, p.due_date) DESC`, (buildingId ? [startDate, endDate, buildingId] : [startDate, endDate])
      );

      const completedPayments = result.filter((p: any) => p.status === 'Pagado' || p.status === 'Completado');
      const partialPayments = result.filter((p: any) => p.status === 'Parcial');

      const totalCompleted = completedPayments.reduce((sum: number, p: any) => 
        sum + parseFloat(p.amount_paid || 0), 0);
      const totalPartial = partialPayments.reduce((sum: number, p: any) => 
        sum + parseFloat(p.amount_paid || 0), 0);

      return {
        period: { startDate, endDate },
        summary: {
          totalIncome: totalCompleted + totalPartial,
          totalCompleted: totalCompleted,
          totalPartial: totalPartial,
          completedCount: completedPayments.length,
          partialCount: partialPayments.length,
          totalPayments: result.length,
        },
        payments: result.map((row: any) => ({
          paymentId: row.payment_id,
          dueDate: row.due_date,
          amountDue: parseFloat(row.amount_due),
          amountPaid: parseFloat(row.amount_paid),
          balance: parseFloat(row.balance),
          status: row.status === 'Pagado' || row.status === 'Completado' ? 'Completado' : row.status,
          building: row.building,
          unit: row.unit,
          tenant: row.tenant_name,
          tenantEmail: row.tenant_email,
          paymentMethod: row.payment_method,
        })),
      };
    } catch (error) {
      console.error('Error obteniendo ingresos por período:', error);
      throw error;
    }
  }

  /**
   * Obtener tendencia de ingresos (últimos N meses)
   */
  async getIncomeTrend(months: number = 6): Promise<any> {
    try {
      // Usar COALESCE para usar payment_date si existe, sino due_date
      const result: any = await executeQuery(
        `SELECT 
          EXTRACT(YEAR FROM COALESCE(p.payment_date, p.due_date)) as year,
          EXTRACT(MONTH FROM COALESCE(p.payment_date, p.due_date)) as month,
          COUNT(p.id) as total_payments,
          COALESCE(SUM(CASE WHEN ps.name IN ('Pagado', 'Completado') THEN p.amount_paid ELSE 0 END), 0) as completed_income,
          COALESCE(SUM(CASE WHEN ps.name = 'Parcial' THEN p.amount_paid ELSE 0 END), 0) as partial_income,
          COALESCE(SUM(p.amount_paid), 0) as total_income,
          COUNT(CASE WHEN ps.name IN ('Pagado', 'Completado') THEN 1 END) as completed_count,
          COUNT(CASE WHEN ps.name = 'Parcial' THEN 1 END) as partial_count
        FROM payments p
        JOIN payment_statuses ps ON p.payment_status_id = ps.id
        WHERE ps.name IN ('Pagado', 'Completado', 'Parcial')
          AND COALESCE(p.payment_date, p.due_date) >= CURRENT_DATE - INTERVAL '${months} months'
        GROUP BY EXTRACT(YEAR FROM COALESCE(p.payment_date, p.due_date)), EXTRACT(MONTH FROM COALESCE(p.payment_date, p.due_date))
        ORDER BY year DESC, month DESC
        LIMIT $1`,
        [months]
      );

      return result.map((row: any) => ({
        year: parseInt(row.year),
        month: parseInt(row.month),
        totalIncome: parseFloat(row.total_income),
        completedIncome: parseFloat(row.completed_income),
        partialIncome: parseFloat(row.partial_income),
        totalPayments: parseInt(row.total_payments),
        completedCount: parseInt(row.completed_count),
        partialCount: parseInt(row.partial_count),
      }));
    } catch (error) {
      console.error('Error obteniendo tendencia de ingresos:', error);
      throw error;
    }
  }

  /**
   * Obtener gastos por período (dinero que sale)
   * Incluye gastos y mantenimiento
   * @param startDate Fecha de inicio (YYYY-MM-DD)
   * @param endDate Fecha de fin (YYYY-MM-DD)
   */
  async getExpensesByPeriod(startDate: string, endDate: string, buildingId?: number): Promise<any> {
    try {
      // Obtener gastos regulares
      const expensesResult: any = await executeQuery(
        `SELECT 
          ex.id,
          ex.description,
          ex.amount,
          ex.expense_date,
          ec.name as category,
          b.name as building,
          'Gasto' as type
        FROM expenses ex
        JOIN expense_categories ec ON ex.category_id = ec.id
        LEFT JOIN buildings b ON ex.building_id = b.id
        WHERE ex.expense_date >= $1 AND ex.expense_date <= $2
          ${buildingId ? 'AND ex.building_id = $3' : ''}
        ORDER BY ex.expense_date DESC`,
        (buildingId ? [startDate, endDate, buildingId] : [startDate, endDate])
      );

      // Obtener gastos de mantenimiento
      const maintenanceResult: any = await executeQuery(
        `SELECT 
          mr.id,
          mr.description,
          mr.estimated_cost as amount,
          mr.completed_date as expense_date,
          'Mantenimiento' as category,
          b.name as building,
          u.unit_number as unit,
          'Mantenimiento' as type
        FROM maintenance_requests mr
        JOIN units u ON mr.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE mr.completed_date >= $1 AND mr.completed_date <= $2
          AND mr.status = 'completed'
          AND mr.estimated_cost IS NOT NULL
          ${buildingId ? 'AND b.id = $3' : ''}
        ORDER BY mr.completed_date DESC`,
        (buildingId ? [startDate, endDate, buildingId] : [startDate, endDate])
      );

      const expenses = expensesResult.map((row: any) => ({
        id: row.id,
        description: row.description,
        amount: parseFloat(row.amount),
        date: row.expense_date,
        category: row.category,
        building: row.building,
        type: row.type,
      }));

      const maintenance = maintenanceResult.map((row: any) => ({
        id: row.id,
        description: row.description,
        amount: parseFloat(row.amount || 0),
        date: row.expense_date,
        category: row.category,
        building: row.building,
        unit: row.unit,
        type: row.type,
      }));

      const allExpenses = [...expenses, ...maintenance];
      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      const totalMaintenance = maintenance.reduce((sum: number, e: any) => sum + e.amount, 0);

      return {
        period: { startDate, endDate },
        summary: {
          totalExpenses: totalExpenses + totalMaintenance,
          expensesAmount: totalExpenses,
          maintenanceAmount: totalMaintenance,
          expensesCount: expenses.length,
          maintenanceCount: maintenance.length,
          totalItems: allExpenses.length,
        },
        items: allExpenses.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      };
    } catch (error) {
      console.error('Error obteniendo gastos por período:', error);
      throw error;
    }
  }

  /**
   * Obtener balance (ingresos vs gastos)
   * @param startDate Fecha de inicio (YYYY-MM-DD)
   * @param endDate Fecha de fin (YYYY-MM-DD)
   */
  async getIncomeVsExpenses(startDate: string, endDate: string, buildingId?: number): Promise<any> {
    try {
      const income = await this.getIncomeByPeriod(startDate, endDate, buildingId);
      const expenses = await this.getExpensesByPeriod(startDate, endDate, buildingId);

      const totalIncome = income.summary.totalIncome;
      const totalExpenses = expenses.summary.totalExpenses;
      const netIncome = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 
        ? parseFloat(((netIncome / totalIncome) * 100).toFixed(2)) 
        : 0;

      return {
        period: { startDate, endDate },
        income: {
          total: totalIncome,
          completed: income.summary.totalCompleted,
          partial: income.summary.totalPartial,
          paymentsCount: income.summary.totalPayments,
        },
        expenses: {
          total: totalExpenses,
          regular: expenses.summary.expensesAmount,
          maintenance: expenses.summary.maintenanceAmount,
          itemsCount: expenses.summary.totalItems,
        },
        balance: {
          netIncome: netIncome,
          profitMargin: profitMargin,
          status: netIncome >= 0 ? 'positive' : 'negative',
        },
      };
    } catch (error) {
      console.error('Error calculando balance:', error);
      throw error;
    }
  }

  /**
   * Obtener tendencia de balance (últimos N meses)
   */
  async getBalanceTrend(months: number = 6): Promise<any> {
    try {
      const currentDate = new Date();
      const results = [];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // Construir fechas de inicio y fin del mes
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

        const balance = await this.getIncomeVsExpenses(startDate, endDate);
        results.push({
          year,
          month,
          income: balance.income.total,
          expenses: balance.expenses.total,
          netIncome: balance.balance.netIncome,
          profitMargin: balance.balance.profitMargin,
        });
      }

      return results;
    } catch (error) {
      console.error('Error obteniendo tendencia de balance:', error);
      throw error;
    }
  }

  /**
   * Obtener tendencia de balance por período (agrupado por mes)
   * @param startDate Fecha de inicio (YYYY-MM-DD)
   * @param endDate Fecha de fin (YYYY-MM-DD)
   */
  async getBalanceTrendByPeriod(startDate: string, endDate: string, buildingId?: number): Promise<any> {
    try {
      // Obtener ingresos agrupados por mes
      const incomeResult: any = await executeQuery(
        `SELECT 
          EXTRACT(YEAR FROM p.due_date) as year,
          EXTRACT(MONTH FROM p.due_date) as month,
          COALESCE(SUM(p.amount_paid), 0) as total_income
        FROM payments p
        JOIN contracts c ON p.contract_id = c.id
        JOIN units u ON c.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        JOIN payment_statuses ps ON p.payment_status_id = ps.id
        WHERE ps.name IN ('Pagado', 'Parcial')
          AND p.due_date >= $1 AND p.due_date <= $2
          ${buildingId ? 'AND b.id = $3' : ''}
        GROUP BY EXTRACT(YEAR FROM p.due_date), EXTRACT(MONTH FROM p.due_date)
        ORDER BY year, month`,
        (buildingId ? [startDate, endDate, buildingId] : [startDate, endDate])
      );

      // Obtener gastos agrupados por mes
      const expensesResult: any = await executeQuery(
        `SELECT 
          EXTRACT(YEAR FROM ex.expense_date) as year,
          EXTRACT(MONTH FROM ex.expense_date) as month,
          COALESCE(SUM(ex.amount), 0) as total_expenses
        FROM expenses ex
        LEFT JOIN buildings b ON ex.building_id = b.id
        WHERE ex.expense_date >= $1 AND ex.expense_date <= $2
          ${buildingId ? 'AND ex.building_id = $3' : ''}
        GROUP BY EXTRACT(YEAR FROM ex.expense_date), EXTRACT(MONTH FROM ex.expense_date)
        ORDER BY year, month`,
        (buildingId ? [startDate, endDate, buildingId] : [startDate, endDate])
      );

      // Obtener mantenimiento agrupado por mes
      const maintenanceResult: any = await executeQuery(
        `SELECT 
          EXTRACT(YEAR FROM mr.completed_date) as year,
          EXTRACT(MONTH FROM mr.completed_date) as month,
          COALESCE(SUM(mr.estimated_cost), 0) as total_maintenance
        FROM maintenance_requests mr
        JOIN units u ON mr.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE mr.status = 'completed'
          AND mr.completed_date >= $1 AND mr.completed_date <= $2
          AND mr.estimated_cost IS NOT NULL
          ${buildingId ? 'AND b.id = $3' : ''}
        GROUP BY EXTRACT(YEAR FROM mr.completed_date), EXTRACT(MONTH FROM mr.completed_date)
        ORDER BY year, month`,
        (buildingId ? [startDate, endDate, buildingId] : [startDate, endDate])
      );

      // Crear un mapa de todos los meses en el período
      const monthsMap = new Map<string, any>();

      // Agregar ingresos
      incomeResult.forEach((row: any) => {
        const key = `${row.year}-${row.month}`;
        monthsMap.set(key, {
          year: parseInt(row.year),
          month: parseInt(row.month),
          income: parseFloat(row.total_income),
          expenses: 0,
          maintenanceExpenses: 0
        });
      });

      // Agregar gastos
      expensesResult.forEach((row: any) => {
        const key = `${row.year}-${row.month}`;
        if (monthsMap.has(key)) {
          monthsMap.get(key).expenses = parseFloat(row.total_expenses);
        } else {
          monthsMap.set(key, {
            year: parseInt(row.year),
            month: parseInt(row.month),
            income: 0,
            expenses: parseFloat(row.total_expenses),
            maintenanceExpenses: 0
          });
        }
      });

      // Agregar mantenimiento
      maintenanceResult.forEach((row: any) => {
        const key = `${row.year}-${row.month}`;
        if (monthsMap.has(key)) {
          monthsMap.get(key).maintenanceExpenses = parseFloat(row.total_maintenance);
        } else {
          monthsMap.set(key, {
            year: parseInt(row.year),
            month: parseInt(row.month),
            income: 0,
            expenses: 0,
            maintenanceExpenses: parseFloat(row.total_maintenance)
          });
        }
      });

      // Convertir a array y calcular totales
      const results = Array.from(monthsMap.values()).map(item => {
        const totalExpenses = item.expenses + item.maintenanceExpenses;
        const netIncome = item.income - totalExpenses;
        const profitMargin = item.income > 0 
          ? parseFloat(((netIncome / item.income) * 100).toFixed(2)) 
          : 0;

        return {
          year: item.year,
          month: item.month,
          income: item.income,
          expenses: totalExpenses,
          maintenanceExpenses: item.maintenanceExpenses,
          netIncome: netIncome,
          profitMargin: profitMargin,
        };
      });

      // Ordenar por año y mes
      results.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      return results;
    } catch (error) {
      console.error('Error obteniendo tendencia de balance por período:', error);
      throw error;
    }
  }
}

export default new IncomeRepository();
