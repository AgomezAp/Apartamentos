import { executeQuery } from '../config/database';

/**
 * Repository para consultas del Dashboard
 */
class DashboardRepository {
  /**
   * Obtener estadísticas generales del sistema
   */
  async getGeneralStats(): Promise<any> {
    try {
      // Total de edificios activos
      const buildingsResult: any = await executeQuery(
        'SELECT COUNT(*) as total FROM buildings WHERE is_active = true',
        []
      );

      // Total de unidades y su estado
      const unitsResult: any = await executeQuery(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN occupation_status = 'occupied' THEN 1 ELSE 0 END) as occupied,
          SUM(CASE WHEN occupation_status = 'vacant' THEN 1 ELSE 0 END) as vacant,
          SUM(CASE WHEN occupation_status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
          SUM(CASE WHEN occupation_status = 'reserved' THEN 1 ELSE 0 END) as reserved
        FROM units 
        WHERE is_active = true`,
        []
      );

      // Total de inquilinos activos
      const tenantsResult: any = await executeQuery(
        'SELECT COUNT(*) as total FROM tenants WHERE is_active = true',
        []
      );

      // Contratos activos
      const activeContractsResult: any = await executeQuery(
        "SELECT COUNT(*) as total FROM contracts WHERE status = 'active'",
        []
      );

      // Contratos próximos a vencer (30 días)
      const expiringContractsResult: any = await executeQuery(
        `SELECT COUNT(*) as total 
         FROM contracts 
         WHERE status = 'active' 
         AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`,
        []
      );

      // Total de ingresos esperados este mes
      const currentMonth = new Date();
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const expectedRevenueResult: any = await executeQuery(
        `SELECT COALESCE(SUM(amount_due), 0) as total
         FROM payments
         WHERE EXTRACT(YEAR FROM due_date) = $1
         AND EXTRACT(MONTH FROM due_date) = $2`,
        [year, month]
      );

      // Total de ingresos recibidos este mes
      const receivedRevenueResult: any = await executeQuery(
        `SELECT COALESCE(SUM(amount_paid), 0) as total
         FROM payments
         WHERE EXTRACT(YEAR FROM due_date) = $1
         AND EXTRACT(MONTH FROM due_date) = $2`,
        [year, month]
      );

      // Pagos vencidos
      const overduePaymentsResult: any = await executeQuery(
        `SELECT COUNT(*) as total
         FROM payments p
         JOIN payment_statuses ps ON p.payment_status_id = ps.id
         WHERE ps.name IN ('Pendiente', 'Parcial')
         AND p.due_date < CURRENT_DATE`,
        []
      );

      // Tasa de ocupación promedio
      const totalUnits = parseInt(unitsResult[0]?.total || 0);
      const occupiedUnits = parseInt(unitsResult[0]?.occupied || 0);
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      // Calcular ingresos y tasas
      const expectedRevenue = parseFloat(expectedRevenueResult[0]?.total || 0);
      const receivedRevenue = parseFloat(receivedRevenueResult[0]?.total || 0);
      const pendingRevenue = expectedRevenue - receivedRevenue;

      return {
        total_buildings: parseInt(buildingsResult[0]?.total || 0),
        total_units: totalUnits,
        occupied_units: occupiedUnits,
        available_units: parseInt(unitsResult[0]?.vacant || 0),
        occupancy_rate: parseFloat(occupancyRate.toFixed(2)),
        total_tenants: parseInt(tenantsResult[0]?.total || 0),
        active_tenants: parseInt(tenantsResult[0]?.total || 0),
        active_contracts: parseInt(activeContractsResult[0]?.total || 0),
        expired_contracts: 0,
        expiring_soon: parseInt(expiringContractsResult[0]?.total || 0),
        total_monthly_income: expectedRevenue,
        current_month_revenue: receivedRevenue,
        revenue_growth_rate: 0,
        pending_payments: parseInt(overduePaymentsResult[0]?.total || 0),
        pending_payments_count: parseInt(overduePaymentsResult[0]?.total || 0),
        pending_payments_amount: pendingRevenue,
        overdue_payments: parseInt(overduePaymentsResult[0]?.total || 0),
        collected_this_month: receivedRevenue,
        pending_amount: pendingRevenue,
        overdue_amount: 0,
        active_maintenance_requests: 0,
        pending_maintenance: 0,
        total_expenses_this_month: 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas por edificio
   */
  async getStatsByBuilding(): Promise<any[]> {
    try {
      const result: any = await executeQuery(
        `SELECT 
          b.id,
          b.name as building_name,
          b.address,
          COUNT(u.id) as total_units,
          SUM(CASE WHEN u.occupation_status = 'occupied' THEN 1 ELSE 0 END) as occupied_units,
          SUM(CASE WHEN u.occupation_status = 'vacant' THEN 1 ELSE 0 END) as vacant_units,
          CASE 
            WHEN COUNT(u.id) > 0 
            THEN ROUND((SUM(CASE WHEN u.occupation_status = 'occupied' THEN 1 ELSE 0 END)::numeric / COUNT(u.id)::numeric) * 100, 2)
            ELSE 0 
          END as occupancy_rate,
          COALESCE(SUM(u.rental_price), 0) as total_rental_value
        FROM buildings b
        LEFT JOIN units u ON b.id = u.building_id AND u.is_active = true
        WHERE b.is_active = true
        GROUP BY b.id, b.name, b.address
        ORDER BY b.name`,
        []
      );

      return result.map((row: any) => ({
        id: row.id,
        building_name: row.building_name,
        address: row.address,
        total_units: parseInt(row.total_units),
        occupied_units: parseInt(row.occupied_units),
        vacant_units: parseInt(row.vacant_units),
        occupancy_rate: parseFloat(row.occupancy_rate),
        monthly_income: parseFloat(row.total_rental_value),
      }));
    } catch (error) {
      console.error('Error obteniendo estadísticas por edificio:', error);
      throw error;
    }
  }

  /**
   * Obtener ingresos de los últimos 12 meses
   */
  async getRevenueByMonth(months: number = 12): Promise<any[]> {
    try {
      const result: any = await executeQuery(
        `SELECT 
          TO_CHAR(due_date, 'YYYY-MM') as month,
          EXTRACT(YEAR FROM due_date) as year,
          EXTRACT(MONTH FROM due_date) as month_number,
          COALESCE(SUM(amount_due), 0) as expected,
          COALESCE(SUM(amount_paid), 0) as received,
          COUNT(*) as total_payments
        FROM payments
        WHERE due_date >= CURRENT_DATE - INTERVAL '${months} months'
        GROUP BY TO_CHAR(due_date, 'YYYY-MM'), EXTRACT(YEAR FROM due_date), EXTRACT(MONTH FROM due_date)
        ORDER BY year DESC, month_number DESC
        LIMIT $1`,
        [months]
      );

      return result.map((row: any) => ({
        month: row.month,
        year: parseInt(row.year),
        expected_revenue: parseFloat(row.expected || 0),
        collected_revenue: parseFloat(row.received || 0),
        pending_revenue: parseFloat(row.expected || 0) - parseFloat(row.received || 0),
        collection_rate: row.expected > 0 ? parseFloat(((row.received / row.expected) * 100).toFixed(2)) : 0,
      }));
    } catch (error) {
      console.error('Error obteniendo ingresos por mes:', error);
      throw error;
    }
  }

  /**
   * Obtener top inquilinos por puntualidad de pago
   */
  async getTopTenantsByPaymentPunctuality(limit: number = 10): Promise<any[]> {
    try {
      const result: any = await executeQuery(
        `SELECT 
          t.id,
          CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
          t.email,
          t.phone,
          COUNT(p.id) as total_payments,
          SUM(CASE WHEN ps.name = 'Completado' AND pt.transaction_date <= p.due_date THEN 1 ELSE 0 END) as on_time_payments,
          CASE 
            WHEN COUNT(p.id) > 0 
            THEN ROUND((SUM(CASE WHEN ps.name = 'Completado' AND pt.transaction_date <= p.due_date THEN 1 ELSE 0 END)::numeric / COUNT(p.id)::numeric) * 100, 2)
            ELSE 0 
          END as punctuality_rate
        FROM tenants t
        JOIN contracts c ON t.id = c.tenant_id
        JOIN payments p ON c.id = p.contract_id
        JOIN payment_statuses ps ON p.payment_status_id = ps.id
        LEFT JOIN payment_transactions pt ON p.id = pt.payment_id
        WHERE t.is_active = true
        GROUP BY t.id, t.first_name, t.last_name, t.email, t.phone
        HAVING COUNT(p.id) >= 3
        ORDER BY punctuality_rate DESC
        LIMIT $1`,
        [limit]
      );

      return result.map((row: any) => ({
        tenantId: row.id,
        tenantName: row.tenant_name,
        email: row.email,
        phone: row.phone,
        totalPayments: parseInt(row.total_payments),
        onTimePayments: parseInt(row.on_time_payments),
        punctualityRate: parseFloat(row.punctuality_rate),
      }));
    } catch (error) {
      console.error('Error obteniendo top inquilinos:', error);
      throw error;
    }
  }
}

export default new DashboardRepository();
