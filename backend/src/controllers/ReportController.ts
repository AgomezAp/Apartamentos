import { Request, Response } from 'express';
import ReportRepository from '../repositories/ReportRepository';
import PdfService from '../services/PdfService';
import ExcelService from '../services/ExcelService';

/**
 * Controlador para Reportes
 */
class ReportController {
  /**
   * GET /api/reports/financial-summary
   * Reporte financiero resumido
   */
  async getFinancialSummary(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      // Validar formato de fechas si se proporcionan
      if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate as string)) {
        res.status(400).json({
          success: false,
          error: 'startDate debe estar en formato YYYY-MM-DD',
        });
        return;
      }

      if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate as string)) {
        res.status(400).json({
          success: false,
          error: 'endDate debe estar en formato YYYY-MM-DD',
        });
        return;
      }

      const report = await ReportRepository.getFinancialSummary(
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      console.error('Error generando reporte financiero:', error);
      res.status(500).json({
        success: false,
        error: 'Error generando reporte financiero',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/reports/occupancy-rate
   * Reporte de tasa de ocupación por edificio
   */
  async getOccupancyRate(_req: Request, res: Response): Promise<void> {
    try {
      const report = await ReportRepository.getOccupancyReport();

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      console.error('Error generando reporte de ocupación:', error);
      res.status(500).json({
        success: false,
        error: 'Error generando reporte de ocupación',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/reports/payment-status
   * Reporte de estado de pagos
   */
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;

      // Validar año
      if (year && (year < 2000 || year > 2100)) {
        res.status(400).json({
          success: false,
          error: 'El año debe estar entre 2000 y 2100',
        });
        return;
      }

      // Validar mes
      if (month && (month < 1 || month > 12)) {
        res.status(400).json({
          success: false,
          error: 'El mes debe estar entre 1 y 12',
        });
        return;
      }

      const report = await ReportRepository.getPaymentStatusReport(year, month);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      console.error('Error generando reporte de pagos:', error);
      res.status(500).json({
        success: false,
        error: 'Error generando reporte de estado de pagos',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/reports/tenant-history/:id
   * Historial completo de un inquilino
   */
  async getTenantHistory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = parseInt(req.params.id);

      if (isNaN(tenantId) || tenantId < 1) {
        res.status(400).json({
          success: false,
          error: 'ID de inquilino inválido',
        });
        return;
      }

      const history = await ReportRepository.getTenantHistory(tenantId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Error generando historial del inquilino:', error);
      
      if (error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Error generando historial del inquilino',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/reports/vacant-units
   * Reporte de unidades vacantes
   */
  async getVacantUnits(_req: Request, res: Response): Promise<void> {
    try {
      const report = await ReportRepository.getVacantUnitsReport();

      res.json({
        success: true,
        data: report,
        summary: {
          totalVacant: report.length,
          totalLostRevenue: report.reduce((sum, u) => sum + u.estimatedLostRevenue, 0),
          averageDaysVacant: report.length > 0
            ? Math.round(
                report
                  .filter(u => u.daysVacant !== null)
                  .reduce((sum, u) => sum + (u.daysVacant || 0), 0) / report.length
              )
            : 0,
        },
      });
    } catch (error: any) {
      console.error('Error generando reporte de unidades vacantes:', error);
      res.status(500).json({
        success: false,
        error: 'Error generando reporte de unidades vacantes',
        details: error.message,
      });
    }
  }

  // ========== EXPORTACIÓN A PDF ==========

  /**
   * GET /api/reports/financial-summary/pdf
   * Exportar resumen financiero a PDF
   */
  async getFinancialSummaryPdf(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate as string)) {
        res.status(400).json({ success: false, error: 'startDate debe estar en formato YYYY-MM-DD' });
        return;
      }

      if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate as string)) {
        res.status(400).json({ success: false, error: 'endDate debe estar en formato YYYY-MM-DD' });
        return;
      }

      const report = await ReportRepository.getFinancialSummary(startDate as string, endDate as string);
      PdfService.generateFinancialSummaryPdf(report, res);
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      res.status(500).json({ success: false, error: 'Error generando PDF', details: error.message });
    }
  }

  /**
   * GET /api/reports/occupancy-rate/pdf
   * Exportar reporte de ocupación a PDF
   */
  async getOccupancyRatePdf(_req: Request, res: Response): Promise<void> {
    try {
      const report = await ReportRepository.getOccupancyReport();
      PdfService.generateOccupancyPdf(report, res);
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      res.status(500).json({ success: false, error: 'Error generando PDF', details: error.message });
    }
  }

  /**
   * GET /api/reports/payment-status/pdf
   * Exportar estado de pagos a PDF
   */
  async getPaymentStatusPdf(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;

      if (year && (year < 2000 || year > 2100)) {
        res.status(400).json({ success: false, error: 'El año debe estar entre 2000 y 2100' });
        return;
      }

      if (month && (month < 1 || month > 12)) {
        res.status(400).json({ success: false, error: 'El mes debe estar entre 1 y 12' });
        return;
      }

      const report = await ReportRepository.getPaymentStatusReport(year, month);
      PdfService.generatePaymentStatusPdf(report, res);
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      res.status(500).json({ success: false, error: 'Error generando PDF', details: error.message });
    }
  }

  /**
   * GET /api/reports/vacant-units/pdf
   * Exportar unidades vacantes a PDF
   */
  async getVacantUnitsPdf(_req: Request, res: Response): Promise<void> {
    try {
      const report = await ReportRepository.getVacantUnitsReport();
      const data = {
        data: report,
        summary: {
          totalVacant: report.length,
          totalLostRevenue: report.reduce((sum, u) => sum + u.estimatedLostRevenue, 0),
          averageDaysVacant: report.length > 0
            ? Math.round(
                report
                  .filter(u => u.daysVacant !== null)
                  .reduce((sum, u) => sum + (u.daysVacant || 0), 0) / report.length
              )
            : 0,
        },
      };
      PdfService.generateVacantUnitsPdf(data, res);
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      res.status(500).json({ success: false, error: 'Error generando PDF', details: error.message });
    }
  }

  // ========== EXPORTACIÓN A EXCEL ==========

  /**
   * GET /api/reports/financial-summary/excel
   * Exportar resumen financiero a Excel
   */
  async getFinancialSummaryExcel(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate as string)) {
        res.status(400).json({ success: false, error: 'startDate debe estar en formato YYYY-MM-DD' });
        return;
      }

      if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate as string)) {
        res.status(400).json({ success: false, error: 'endDate debe estar en formato YYYY-MM-DD' });
        return;
      }

      const report = await ReportRepository.getFinancialSummary(startDate as string, endDate as string);
      await ExcelService.generateFinancialSummaryExcel(report, res);
    } catch (error: any) {
      console.error('Error generando Excel:', error);
      res.status(500).json({ success: false, error: 'Error generando Excel', details: error.message });
    }
  }

  /**
   * GET /api/reports/occupancy-rate/excel
   * Exportar reporte de ocupación a Excel
   */
  async getOccupancyRateExcel(_req: Request, res: Response): Promise<void> {
    try {
      const report = await ReportRepository.getOccupancyReport();
      await ExcelService.generateOccupancyExcel(report, res);
    } catch (error: any) {
      console.error('Error generando Excel:', error);
      res.status(500).json({ success: false, error: 'Error generando Excel', details: error.message });
    }
  }

  /**
   * GET /api/reports/payment-status/excel
   * Exportar estado de pagos a Excel
   */
  async getPaymentStatusExcel(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;

      if (year && (year < 2000 || year > 2100)) {
        res.status(400).json({ success: false, error: 'El año debe estar entre 2000 y 2100' });
        return;
      }

      if (month && (month < 1 || month > 12)) {
        res.status(400).json({ success: false, error: 'El mes debe estar entre 1 y 12' });
        return;
      }

      const report = await ReportRepository.getPaymentStatusReport(year, month);
      await ExcelService.generatePaymentStatusExcel(report, res);
    } catch (error: any) {
      console.error('Error generando Excel:', error);
      res.status(500).json({ success: false, error: 'Error generando Excel', details: error.message });
    }
  }

  /**
   * GET /api/reports/vacant-units/excel
   * Exportar unidades vacantes a Excel
   */
  async getVacantUnitsExcel(_req: Request, res: Response): Promise<void> {
    try {
      const report = await ReportRepository.getVacantUnitsReport();
      const data = {
        data: report,
        summary: {
          totalVacant: report.length,
          totalLostRevenue: report.reduce((sum, u) => sum + u.estimatedLostRevenue, 0),
          averageDaysVacant: report.length > 0
            ? Math.round(
                report
                  .filter(u => u.daysVacant !== null)
                  .reduce((sum, u) => sum + (u.daysVacant || 0), 0) / report.length
              )
            : 0,
        },
      };
      await ExcelService.generateVacantUnitsExcel(data, res);
    } catch (error: any) {
      console.error('Error generando Excel:', error);
      res.status(500).json({ success: false, error: 'Error generando Excel', details: error.message });
    }
  }
}

export default new ReportController();
