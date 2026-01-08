import { Router } from 'express';
import IncomeController from '../controllers/IncomeController';

const router = Router();

/**
 * GET /api/income/period
 * Obtener ingresos por período específico (año y mes)
 * Query params:
 *   - year: año (opcional, default: año actual)
 *   - month: mes 1-12 (opcional, default: mes actual)
 * 
 * Retorna: Solo los pagos completados y parciales (dinero que realmente entró)
 */
router.get('/period', IncomeController.getIncomeByPeriod);

/**
 * GET /api/income/trend
 * Obtener tendencia de ingresos (últimos N meses)
 * Query params:
 *   - months: número de meses (opcional, default: 6, máximo: 24)
 * 
 * Retorna: Array con ingresos mensuales de los últimos N meses
 */
router.get('/trend', IncomeController.getIncomeTrend);

/**
 * GET /api/income/expenses
 * Obtener gastos por período (incluye gastos regulares y mantenimiento)
 * Query params:
 *   - year: año (opcional, default: año actual)
 *   - month: mes 1-12 (opcional, default: mes actual)
 * 
 * Retorna: Gastos y mantenimientos completados del período
 */
router.get('/expenses', IncomeController.getExpensesByPeriod);

/**
 * GET /api/income/balance
 * Obtener balance de ingresos vs gastos por período
 * Query params:
 *   - year: año (opcional, default: año actual)
 *   - month: mes 1-12 (opcional, default: mes actual)
 * 
 * Retorna: Comparación de ingresos, gastos y balance neto
 */
router.get('/balance', IncomeController.getIncomeVsExpenses);

/**
 * GET /api/income/balance-trend
 * Obtener tendencia de balance (últimos N meses)
 * Query params:
 *   - months: número de meses (opcional, default: 6, máximo: 24)
 * 
 * Retorna: Array con balance mensual de los últimos N meses
 */
router.get('/balance-trend', IncomeController.getBalanceTrend);

/**
 * GET /api/income/balance-trend-period
 * Obtener tendencia de balance por período (agrupado por mes)
 * Query params:
 *   - start_date: fecha de inicio (YYYY-MM-DD)
 *   - end_date: fecha de fin (YYYY-MM-DD)
 * 
 * Retorna: Array con balance mensual del período seleccionado
 */
router.get('/balance-trend-period', IncomeController.getBalanceTrendByPeriod);

export default router;
