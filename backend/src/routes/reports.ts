import { Router } from 'express';
import ReportController from '../controllers/ReportController';

const router = Router();

// ========== REPORTES JSON ==========

/**
 * GET /api/reports/financial-summary
 * Resumen financiero con colección de ingresos
 * Query params:
 *   - startDate: fecha inicio (YYYY-MM-DD) opcional
 *   - endDate: fecha fin (YYYY-MM-DD) opcional
 */
router.get('/financial-summary', ReportController.getFinancialSummary);

/**
 * GET /api/reports/occupancy-rate
 * Reporte de tasa de ocupación por edificio
 */
router.get('/occupancy-rate', ReportController.getOccupancyRate);

/**
 * GET /api/reports/payment-status
 * Reporte de estado de pagos
 * Query params:
 *   - year: año (opcional)
 *   - month: mes 1-12 (opcional)
 */
router.get('/payment-status', ReportController.getPaymentStatus);

/**
 * GET /api/reports/tenant-history/:id
 * Historial completo de un inquilino
 * Params:
 *   - id: ID del inquilino
 */
router.get('/tenant-history/:id', ReportController.getTenantHistory);

/**
 * GET /api/reports/vacant-units
 * Reporte de unidades vacantes con ingresos perdidos
 */
router.get('/vacant-units', ReportController.getVacantUnits);

// ========== EXPORTACIÓN A PDF ==========

/**
 * GET /api/reports/financial-summary/pdf
 * Exportar resumen financiero a PDF
 */
router.get('/financial-summary/pdf', ReportController.getFinancialSummaryPdf);

/**
 * GET /api/reports/occupancy-rate/pdf
 * Exportar reporte de ocupación a PDF
 */
router.get('/occupancy-rate/pdf', ReportController.getOccupancyRatePdf);

/**
 * GET /api/reports/payment-status/pdf
 * Exportar estado de pagos a PDF
 */
router.get('/payment-status/pdf', ReportController.getPaymentStatusPdf);

/**
 * GET /api/reports/vacant-units/pdf
 * Exportar unidades vacantes a PDF
 */
router.get('/vacant-units/pdf', ReportController.getVacantUnitsPdf);

// ========== EXPORTACIÓN A EXCEL ==========

/**
 * GET /api/reports/financial-summary/excel
 * Exportar resumen financiero a Excel
 */
router.get('/financial-summary/excel', ReportController.getFinancialSummaryExcel);

/**
 * GET /api/reports/occupancy-rate/excel
 * Exportar reporte de ocupación a Excel
 */
router.get('/occupancy-rate/excel', ReportController.getOccupancyRateExcel);

/**
 * GET /api/reports/payment-status/excel
 * Exportar estado de pagos a Excel
 */
router.get('/payment-status/excel', ReportController.getPaymentStatusExcel);

/**
 * GET /api/reports/vacant-units/excel
 * Exportar unidades vacantes a Excel
 */
router.get('/vacant-units/excel', ReportController.getVacantUnitsExcel);

export default router;
