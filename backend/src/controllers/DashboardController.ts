import { Request, Response } from 'express';
import DashboardRepository from '../repositories/DashboardRepository';

/**
 * Controlador para el Dashboard
 */
class DashboardController {
  /**
   * GET /api/dashboard/stats
   * Obtener estadísticas generales del sistema
   */
  async getGeneralStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await DashboardRepository.getGeneralStats();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas del dashboard',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/buildings
   * Obtener estadísticas por edificio
   */
  async getStatsByBuilding(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await DashboardRepository.getStatsByBuilding();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error obteniendo estadísticas por edificio:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas por edificio',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/revenue
   * Obtener ingresos de los últimos N meses
   */
  async getRevenueByMonth(req: Request, res: Response): Promise<void> {
    try {
      const months = parseInt(req.query.months as string) || 12;
      
      if (months < 1 || months > 24) {
        res.status(400).json({
          success: false,
          error: 'El parámetro months debe estar entre 1 y 24',
        });
        return;
      }

      const revenue = await DashboardRepository.getRevenueByMonth(months);
      
      res.json({
        success: true,
        data: revenue,
      });
    } catch (error: any) {
      console.error('Error obteniendo ingresos por mes:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo datos de ingresos',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/top-tenants
   * Obtener top inquilinos por puntualidad de pago
   */
  async getTopTenants(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          error: 'El parámetro limit debe estar entre 1 y 50',
        });
        return;
      }

      const tenants = await DashboardRepository.getTopTenantsByPaymentPunctuality(limit);
      
      res.json({
        success: true,
        data: tenants,
      });
    } catch (error: any) {
      console.error('Error obteniendo top inquilinos:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo top inquilinos',
        details: error.message,
      });
    }
  }
}

export default new DashboardController();
