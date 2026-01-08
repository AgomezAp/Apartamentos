import { Request, Response } from 'express';
import IncomeRepository from '../repositories/IncomeRepository';

/**
 * Controlador para Reportes de Ingresos
 */
class IncomeController {
  /**
   * GET /api/income/period
   * Obtener ingresos por período específico
   * Query params: start_date, end_date (formato: YYYY-MM-DD)
   */
  async getIncomeByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Se requieren start_date y end_date',
        });
        return;
      }

      // Validar formato de fechas
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        res.status(400).json({
          success: false,
          error: 'Las fechas deben estar en formato YYYY-MM-DD',
        });
        return;
      }

      const data = await IncomeRepository.getIncomeByPeriod(startDate, endDate);

      res.json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      console.error('Error obteniendo ingresos por período:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo ingresos por período',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/income/trend
   * Obtener tendencia de ingresos (últimos N meses)
   * Query params: months (default: 6)
   */
  async getIncomeTrend(req: Request, res: Response): Promise<void> {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;

      if (months < 1 || months > 24) {
        res.status(400).json({
          success: false,
          error: 'El número de meses debe estar entre 1 y 24',
        });
        return;
      }

      const data = await IncomeRepository.getIncomeTrend(months);

      res.json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      console.error('Error obteniendo tendencia de ingresos:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo tendencia de ingresos',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/income/expenses
   * Obtener gastos por período
   * Query params: start_date, end_date (YYYY-MM-DD)
   */
  async getExpensesByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      // Validar que las fechas existan
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Se requieren start_date y end_date en formato YYYY-MM-DD',
        });
        return;
      }

      // Validar formato de fechas
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        res.status(400).json({
          success: false,
          error: 'Las fechas deben estar en formato YYYY-MM-DD',
        });
        return;
      }

      const data = await IncomeRepository.getExpensesByPeriod(startDate, endDate);

      res.json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      console.error('Error obteniendo gastos por período:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo gastos por período',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/income/balance
   * Obtener balance (ingresos vs gastos) por período
   * Query params: start_date, end_date (formato: YYYY-MM-DD)
   */
  async getIncomeVsExpenses(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Se requieren start_date y end_date',
        });
        return;
      }

      // Validar formato de fechas
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        res.status(400).json({
          success: false,
          error: 'Las fechas deben estar en formato YYYY-MM-DD',
        });
        return;
      }

      const data = await IncomeRepository.getIncomeVsExpenses(startDate, endDate);

      res.json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      console.error('Error obteniendo balance:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo balance de ingresos vs gastos',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/income/balance-trend
   * Obtener tendencia de balance (últimos N meses)
   * Query params: months (default: 6)
   */
  async getBalanceTrend(req: Request, res: Response): Promise<void> {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;

      if (months < 1 || months > 24) {
        res.status(400).json({
          success: false,
          error: 'El número de meses debe estar entre 1 y 24',
        });
        return;
      }

      const data = await IncomeRepository.getBalanceTrend(months);

      res.json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      console.error('Error obteniendo tendencia de balance:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo tendencia de balance',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/income/balance-trend-period
   * Obtener tendencia de balance por período (agrupado por mes)
   * Query params: start_date, end_date (YYYY-MM-DD)
   */
  async getBalanceTrendByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Se requieren start_date y end_date en formato YYYY-MM-DD',
        });
        return;
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        res.status(400).json({
          success: false,
          error: 'Las fechas deben estar en formato YYYY-MM-DD',
        });
        return;
      }

      const data = await IncomeRepository.getBalanceTrendByPeriod(startDate, endDate);

      res.json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      console.error('Error obteniendo tendencia de balance por período:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo tendencia de balance por período',
        details: error.message,
      });
    }
  }
}

export default new IncomeController();
