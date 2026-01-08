import { executeQuery } from '../config/database';

/**
 * Repository para reportes detallados
 */
class ReportRepository {
  /**
   * Reporte financiero - Resumen de ingresos
   */
  async getFinancialSummary(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any[] = [];
      let dateFilter = '';

      if (startDate && endDate) {
        dateFilter = 'WHERE p.due_date BETWEEN $1 AND $2';
        params.push(startDate, endDate);
      }

      const result: any = await executeQuery(
        `SELECT 
          COUNT(p.id) as total_payments,
          COALESCE(SUM(p.amount_due), 0) as total_expected,
          COALESCE(SUM(p.amount_paid), 0) as total_received,
          COALESCE(SUM(p.amount_due - p.amount_paid), 0) as total_pending,
          COUNT(CASE WHEN ps.name = 'Completado' THEN 1 END) as completed_payments,
          COUNT(CASE WHEN ps.name = 'Pendiente' THEN 1 END) as pending_payments,
          COUNT(CASE WHEN ps.name = 'Parcial' THEN 1 END) as partial_payments,
          COUNT(CASE WHEN ps.name IN ('Pendiente', 'Parcial') AND p.due_date < CURRENT_DATE THEN 1 END) as overdue_payments
        FROM payments p
        JOIN payment_statuses ps ON p.payment_status_id = ps.id
        ${dateFilter}`,
        params
      );

      const row = result[0];
      const totalExpected = parseFloat(row.total_expected || 0);
      const totalReceived = parseFloat(row.total_received || 0);

      return {
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        summary: {
          totalPayments: parseInt(row.total_payments),
          totalExpected: totalExpected,
          totalReceived: totalReceived,
          totalPending: parseFloat(row.total_pending || 0),
          collectionRate: totalExpected > 0 ? parseFloat(((totalReceived / totalExpected) * 100).toFixed(2)) : 0,
        },
        paymentStatus: {
          completed: parseInt(row.completed_payments || 0),
          pending: parseInt(row.pending_payments || 0),
          partial: parseInt(row.partial_payments || 0),
          overdue: parseInt(row.overdue_payments || 0),
        },
      };
    } catch (error) {
      console.error('Error generando reporte financiero:', error);
      throw error;
    }
  }

  /**
   * Reporte de ocupación por edificio
   */
  async getOccupancyReport(): Promise<any[]> {
    try {
      const result: any = await executeQuery(
        `SELECT 
          b.id as building_id,
          b.name as building_name,
          b.address,
          b.total_units as designed_capacity,
          COUNT(u.id) as current_units,
          SUM(CASE WHEN u.occupation_status = 'occupied' THEN 1 ELSE 0 END) as occupied,
          SUM(CASE WHEN u.occupation_status = 'vacant' THEN 1 ELSE 0 END) as vacant,
          SUM(CASE WHEN u.occupation_status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
          SUM(CASE WHEN u.occupation_status = 'reserved' THEN 1 ELSE 0 END) as reserved,
          CASE 
            WHEN COUNT(u.id) > 0 
            THEN ROUND((SUM(CASE WHEN u.occupation_status = 'occupied' THEN 1 ELSE 0 END)::numeric / COUNT(u.id)::numeric) * 100, 2)
            ELSE 0 
          END as occupancy_rate,
          COALESCE(SUM(CASE WHEN u.occupation_status = 'occupied' THEN u.rental_price ELSE 0 END), 0) as current_monthly_income,
          COALESCE(SUM(u.rental_price), 0) as potential_monthly_income
        FROM buildings b
        LEFT JOIN units u ON b.id = u.building_id AND u.is_active = true
        WHERE b.is_active = true
        GROUP BY b.id, b.name, b.address, b.total_units
        ORDER BY occupancy_rate DESC, b.name`,
        []
      );

      return result.map((row: any) => {
        const currentIncome = parseFloat(row.current_monthly_income);
        const potentialIncome = parseFloat(row.potential_monthly_income);
        const lostRevenue = potentialIncome - currentIncome;

        return {
          buildingId: row.building_id,
          buildingName: row.building_name,
          address: row.address,
          designedCapacity: parseInt(row.designed_capacity || 0),
          currentUnits: parseInt(row.current_units),
          occupied: parseInt(row.occupied),
          vacant: parseInt(row.vacant),
          maintenance: parseInt(row.maintenance),
          reserved: parseInt(row.reserved),
          occupancyRate: parseFloat(row.occupancy_rate),
          currentMonthlyIncome: currentIncome,
          potentialMonthlyIncome: potentialIncome,
          lostRevenue: lostRevenue,
          utilizationRate: row.designed_capacity > 0 
            ? parseFloat(((row.current_units / row.designed_capacity) * 100).toFixed(2)) 
            : 0,
        };
      });
    } catch (error) {
      console.error('Error generando reporte de ocupación:', error);
      throw error;
    }
  }

  /**
   * Reporte de estado de pagos
   */
  async getPaymentStatusReport(year?: number, month?: number): Promise<any> {
    try {
      const params: any[] = [];
      let dateFilter = '';

      if (year && month) {
        dateFilter = 'AND EXTRACT(YEAR FROM p.due_date) = $1 AND EXTRACT(MONTH FROM p.due_date) = $2';
        params.push(year, month);
      }

      const paymentsResult: any = await executeQuery(
        `SELECT 
          p.id,
          p.due_date,
          p.amount_due,
          p.amount_paid,
          (p.amount_due - p.amount_paid) as balance,
          ps.name as status,
          b.name as building_name,
          u.unit_number,
          CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
          t.email as tenant_email,
          t.mobile_phone as tenant_phone,
          CASE 
            WHEN p.due_date < CURRENT_DATE AND ps.name IN ('Pendiente', 'Parcial') 
            THEN CURRENT_DATE - p.due_date 
            ELSE 0 
          END as days_overdue
        FROM payments p
        JOIN payment_statuses ps ON p.payment_status_id = ps.id
        JOIN contracts c ON p.contract_id = c.id
        JOIN units u ON p.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        JOIN tenants t ON c.tenant_id = t.id
        WHERE 1=1 ${dateFilter}
        ORDER BY 
          CASE ps.name 
            WHEN 'Pendiente' THEN 1 
            WHEN 'Parcial' THEN 2 
            WHEN 'Completado' THEN 3 
          END,
          p.due_date`,
        params
      );

      // Agrupar por estado
      const byStatus = {
        pending: paymentsResult.filter((p: any) => p.status === 'Pendiente'),
        partial: paymentsResult.filter((p: any) => p.status === 'Parcial'),
        completed: paymentsResult.filter((p: any) => p.status === 'Completado'),
        overdue: paymentsResult.filter((p: any) => p.days_overdue > 0),
      };

      return {
        period: year && month ? { year, month } : null,
        summary: {
          total: paymentsResult.length,
          pending: byStatus.pending.length,
          partial: byStatus.partial.length,
          completed: byStatus.completed.length,
          overdue: byStatus.overdue.length,
        },
        payments: paymentsResult.map((row: any) => ({
          paymentId: row.id,
          dueDate: row.due_date,
          amountDue: parseFloat(row.amount_due),
          amountPaid: parseFloat(row.amount_paid),
          balance: parseFloat(row.balance),
          status: row.status,
          daysOverdue: parseInt(row.days_overdue),
          building: row.building_name,
          unit: row.unit_number,
          tenant: {
            name: row.tenant_name,
            email: row.tenant_email,
            phone: row.tenant_phone,
          },
        })),
      };
    } catch (error) {
      console.error('Error generando reporte de estado de pagos:', error);
      throw error;
    }
  }

  /**
   * Historial completo de un inquilino
   */
  async getTenantHistory(tenantId: number): Promise<any> {
    try {
      // Información del inquilino
      const tenantResult: any = await executeQuery(
        `SELECT 
          id,
          document_type,
          document_number,
          CONCAT(first_name, ' ', last_name) as full_name,
          email,
          phone,
          mobile_phone,
          occupation,
          company_name,
          monthly_income,
          created_at
        FROM tenants
        WHERE id = $1`,
        [tenantId]
      );

      if (tenantResult.length === 0) {
        throw new Error(`Inquilino con ID ${tenantId} no encontrado`);
      }

      const tenant = tenantResult[0];

      // Contratos del inquilino
      const contractsResult: any = await executeQuery(
        `SELECT 
          c.id,
          c.start_date,
          c.end_date,
          c.monthly_rent,
          c.deposit_amount,
          c.status,
          b.name as building_name,
          u.unit_number,
          EXTRACT(MONTH FROM AGE(c.end_date, c.start_date)) as duration_months
        FROM contracts c
        JOIN units u ON c.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE c.tenant_id = $1
        ORDER BY c.start_date DESC`,
        [tenantId]
      );

      // Historial de pagos
      const paymentsResult: any = await executeQuery(
        `SELECT 
          p.id,
          p.due_date,
          p.amount_due,
          p.amount_paid,
          ps.name as status,
          c.id as contract_id,
          b.name as building_name,
          u.unit_number
        FROM payments p
        JOIN payment_statuses ps ON p.payment_status_id = ps.id
        JOIN contracts c ON p.contract_id = c.id
        JOIN units u ON p.unit_id = u.id
        JOIN buildings b ON u.building_id = b.id
        WHERE c.tenant_id = $1
        ORDER BY p.due_date DESC`,
        [tenantId]
      );

      // Transacciones de pago
      const transactionsResult: any = await executeQuery(
        `SELECT 
          pt.id,
          pt.amount,
          pt.transaction_date,
          tm.name as method,
          pt.reference_number,
          p.id as payment_id
        FROM payment_transactions pt
        JOIN transaction_methods tm ON pt.transaction_method_id = tm.id
        JOIN payments p ON pt.payment_id = p.id
        JOIN contracts c ON p.contract_id = c.id
        WHERE c.tenant_id = $1
        ORDER BY pt.transaction_date DESC`,
        [tenantId]
      );

      // Calcular estadísticas
      const totalPaid = paymentsResult.reduce((sum: number, p: any) => sum + parseFloat(p.amount_paid || 0), 0);
      const totalDue = paymentsResult.reduce((sum: number, p: any) => sum + parseFloat(p.amount_due || 0), 0);
      const totalPending = totalDue - totalPaid;
      const completedPayments = paymentsResult.filter((p: any) => p.status === 'Completado').length;
      const paymentPunctuality = paymentsResult.length > 0 
        ? parseFloat(((completedPayments / paymentsResult.length) * 100).toFixed(2)) 
        : 0;

      return {
        tenant: {
          id: tenant.id,
          documentType: tenant.document_type,
          documentNumber: tenant.document_number,
          fullName: tenant.full_name,
          email: tenant.email,
          phone: tenant.phone,
          mobilePhone: tenant.mobile_phone,
          occupation: tenant.occupation,
          companyName: tenant.company_name,
          monthlyIncome: parseFloat(tenant.monthly_income || 0),
          memberSince: tenant.created_at,
        },
        statistics: {
          totalContracts: contractsResult.length,
          activeContracts: contractsResult.filter((c: any) => c.status === 'active').length,
          totalPayments: paymentsResult.length,
          totalPaid: totalPaid,
          totalDue: totalDue,
          totalPending: totalPending,
          paymentPunctuality: paymentPunctuality,
          totalTransactions: transactionsResult.length,
        },
        contracts: contractsResult.map((row: any) => ({
          contractId: row.id,
          startDate: row.start_date,
          endDate: row.end_date,
          monthlyRent: parseFloat(row.monthly_rent),
          depositAmount: parseFloat(row.deposit_amount),
          status: row.status,
          building: row.building_name,
          unit: row.unit_number,
          durationMonths: parseInt(row.duration_months || 0),
        })),
        payments: paymentsResult.map((row: any) => ({
          paymentId: row.id,
          dueDate: row.due_date,
          amountDue: parseFloat(row.amount_due),
          amountPaid: parseFloat(row.amount_paid),
          status: row.status,
          contractId: row.contract_id,
          building: row.building_name,
          unit: row.unit_number,
        })),
        transactions: transactionsResult.map((row: any) => ({
          transactionId: row.id,
          amount: parseFloat(row.amount),
          date: row.transaction_date,
          method: row.method,
          referenceNumber: row.reference_number,
          paymentId: row.payment_id,
        })),
      };
    } catch (error) {
      console.error('Error generando historial del inquilino:', error);
      throw error;
    }
  }

  /**
   * Reporte de unidades vacantes con días sin ocupar
   */
  async getVacantUnitsReport(): Promise<any[]> {
    try {
      const result: any = await executeQuery(
        `SELECT 
          u.id,
          u.unit_number,
          b.name as building_name,
          b.address,
          ut.name as unit_type,
          u.bedrooms,
          u.bathrooms,
          u.rental_price,
          u.occupation_status,
          COALESCE(
            CURRENT_DATE - MAX(c.end_date),
            999
          ) as days_vacant
        FROM units u
        JOIN buildings b ON u.building_id = b.id
        JOIN unit_types ut ON u.unit_type_id = ut.id
        LEFT JOIN contracts c ON u.id = c.unit_id AND c.status = 'finished'
        WHERE u.is_active = true AND u.occupation_status = 'vacant'
        GROUP BY u.id, u.unit_number, b.name, b.address, ut.name, u.bedrooms, u.bathrooms, u.rental_price, u.occupation_status
        ORDER BY days_vacant DESC, u.rental_price DESC`,
        []
      );

      return result.map((row: any) => {
        const daysVacant = parseInt(row.days_vacant);
        const rentalPrice = parseFloat(row.rental_price);
        const lostRevenue = daysVacant !== 999 
          ? parseFloat((rentalPrice / 30 * daysVacant).toFixed(2)) 
          : 0;

        return {
          unitId: row.id,
          unitNumber: row.unit_number,
          building: row.building_name,
          address: row.address,
          unitType: row.unit_type,
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          rentalPrice: rentalPrice,
          status: row.occupation_status,
          daysVacant: daysVacant !== 999 ? daysVacant : null,
          estimatedLostRevenue: lostRevenue,
        };
      });
    } catch (error) {
      console.error('Error generando reporte de unidades vacantes:', error);
      throw error;
    }
  }
}

export default new ReportRepository();
