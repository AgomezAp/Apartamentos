import { Router } from 'express';
import DashboardController from '../controllers/DashboardController';

const router = Router();

/**
 * GET /api/dashboard/stats
 * Obtener estadísticas generales del dashboard
 */
router.get('/stats', DashboardController.getGeneralStats);

/**
 * GET /api/dashboard/buildings
 * Obtener estadísticas por edificio
 */
router.get('/buildings', DashboardController.getStatsByBuilding);

/**
 * GET /api/dashboard/revenue
 * Obtener ingresos por mes
 * Query params:
 *   - months: número de meses (1-24), default 12
 */
router.get('/revenue', DashboardController.getRevenueByMonth);

/**
 * GET /api/dashboard/top-tenants
 * Obtener top inquilinos por puntualidad en pagos
 * Query params:
 *   - limit: número de inquilinos (1-50), default 10
 */
router.get('/top-tenants', DashboardController.getTopTenants);

/**
 * GET /api/dashboard/tasks
 * Obtener tareas pendientes (pagos vencidos, contratos por vencer, etc.)
 */
router.get('/tasks', async (_req, res) => {
  try {
    const { executeQuery } = require('../config/database');
    
    // Obtener pagos vencidos
    const overduePayments = await executeQuery(`
      SELECT p.id, p.amount_due, p.amount_paid, p.due_date,
             c.unit_id,
             u.unit_number,
             b.name as building_name,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name
      FROM payments p
      INNER JOIN contracts c ON p.contract_id = c.id
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      WHERE p.due_date < CURRENT_DATE 
        AND p.amount_paid < p.amount_due
      ORDER BY p.due_date ASC
      LIMIT 10
    `);

    // Obtener contratos por vencer (próximos 30 días)
    const expiringContracts = await executeQuery(`
      SELECT c.id, c.start_date, c.end_date,
             u.unit_number,
             b.name as building_name,
             CONCAT(t.first_name, ' ', t.last_name) as tenant_name
      FROM contracts c
      INNER JOIN units u ON c.unit_id = u.id
      INNER JOIN buildings b ON u.building_id = b.id
      INNER JOIN tenants t ON c.tenant_id = t.id
      WHERE c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        AND c.status = 'active'
      ORDER BY c.end_date ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overduePayments: overduePayments.map((p: any) => ({
          id: p.id,
          type: 'overdue_payment',
          title: `Pago vencido - ${p.building_name} ${p.unit_number}`,
          description: `${p.tenant_name} - Vencido el ${new Date(p.due_date).toLocaleDateString()}`,
          priority: 'high',
          dueDate: p.due_date,
          amount: p.amount_due - p.amount_paid,
        })),
        expiringContracts: expiringContracts.map((c: any) => ({
          id: c.id,
          type: 'expiring_contract',
          title: `Contrato por vencer - ${c.building_name} ${c.unit_number}`,
          description: `${c.tenant_name} - Vence el ${new Date(c.end_date).toLocaleDateString()}`,
          priority: 'medium',
          dueDate: c.end_date,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tareas',
      details: error.message,
    });
  }
});

export default router;
