import { Request, Response } from 'express';
import MaintenanceRepository from '../repositories/MaintenanceRepository';

class MaintenanceController {
  /**
   * GET /api/maintenance-requests
   * Obtener todas las solicitudes de mantenimiento
   */
  async getAll(req: Request, res: Response) {
    try {
      const { status, priority, unit_id, tenant_id, category } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (unit_id) filters.unit_id = parseInt(unit_id as string);
      if (tenant_id) filters.tenant_id = parseInt(tenant_id as string);
      if (category) filters.category = category;

      const requests: any[] = await MaintenanceRepository.getAll(filters);

      res.json({
        success: true,
        data: requests,
        total: requests.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes de mantenimiento',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/maintenance-requests/pending
   * Obtener solicitudes pendientes
   */
  async getPending(_req: Request, res: Response) {
    try {
      const requests: any[] = await MaintenanceRepository.getPending();
      res.json({
        success: true,
        data: requests,
        total: requests.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes pendientes',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/maintenance-requests/urgent
   * Obtener solicitudes urgentes
   */
  async getUrgent(_req: Request, res: Response) {
    try {
      const requests: any[] = await MaintenanceRepository.getUrgent();
      res.json({
        success: true,
        data: requests,
        total: requests.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes urgentes',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/maintenance-requests/stats
   * Obtener estadísticas por categoría
   */
  async getStats(_req: Request, res: Response) {
    try {
      const stats: any[] = await MaintenanceRepository.getStatsByCategory();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/maintenance-requests/unit/:unitId
   * Obtener solicitudes por unidad
   */
  async getByUnit(req: Request, res: Response) {
    try {
      const unitId = parseInt(req.params.unitId);
      const requests: any[] = await MaintenanceRepository.getByUnit(unitId);
      res.json({
        success: true,
        data: requests,
        total: requests.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes de la unidad',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/maintenance-requests/tenant/:tenantId
   * Obtener solicitudes por inquilino
   */
  async getByTenant(req: Request, res: Response) {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const requests: any[] = await MaintenanceRepository.getByTenant(tenantId);
      res.json({
        success: true,
        data: requests,
        total: requests.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes del inquilino',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/maintenance-requests/:id
   * Obtener solicitud por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const request: any = await MaintenanceRepository.getById(id);

      if (!request) {
        res.status(404).json({
          success: false,
          message: 'Solicitud de mantenimiento no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitud de mantenimiento',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/maintenance-requests
   * Crear nueva solicitud de mantenimiento
   */
  async create(req: Request, res: Response) {
    try {
      const newRequest = await MaintenanceRepository.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Solicitud de mantenimiento creada exitosamente',
        data: newRequest,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al crear solicitud de mantenimiento',
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/maintenance-requests/:id
   * Actualizar solicitud de mantenimiento
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      console.log('=== MAINTENANCE UPDATE ===');
      console.log('ID:', id);
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('Body keys:', Object.keys(req.body));
      const updated: any = await MaintenanceRepository.update(id, req.body);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Solicitud de mantenimiento no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Solicitud de mantenimiento actualizada exitosamente',
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating maintenance request:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar solicitud de mantenimiento',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/maintenance-requests/:id/resolve
   * Marcar solicitud como resuelta
   */
  async resolve(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { resolved_by, actual_cost, notes } = req.body;

      if (!resolved_by) {
        res.status(400).json({
          success: false,
          message: 'El campo resolved_by es requerido',
        });
        return;
      }

      const resolved: any = await MaintenanceRepository.resolve(
        id,
        resolved_by,
        actual_cost,
        notes
      );

      if (!resolved) {
        res.status(404).json({
          success: false,
          message: 'Solicitud de mantenimiento no encontrada',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Solicitud de mantenimiento resuelta exitosamente',
        data: resolved,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al resolver solicitud de mantenimiento',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/maintenance-requests/:id
   * Eliminar solicitud de mantenimiento
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await MaintenanceRepository.delete(id);
      res.json({
        success: true,
        message: 'Solicitud de mantenimiento eliminada exitosamente',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar solicitud de mantenimiento',
        error: error.message,
      });
    }
  }
}

export default new MaintenanceController();
