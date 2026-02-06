import { Request, Response } from 'express';
import TenantModel from '../models/Tenant';
import { Tenant } from '../interfaces';
import { TenantMapper, PaginationMapper } from '../utils/mappers';
import { executeQuery } from '../config/database';

class TenantController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const pagination = (req as any).pagination;
      
      // Recopilar filtros
      const filters = {
        status: req.query.status as string,
        search: req.query.search as string,
      };

      const tenants = await TenantModel.findAll({ ...pagination, ...filters });
      const total = await TenantModel.count(filters);

      // Normalizar inquilinos y paginación
      const normalizedTenants = TenantMapper.toDTOList(tenants);
      const normalizedPagination = PaginationMapper.normalize({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });

      const response = {
        success: true,
        data: normalizedTenants,
        pagination: normalizedPagination,
      };

      return res.json(response);
    } catch (error: any) {
      console.error('Error obteniendo inquilinos:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const tenant = await TenantModel.findById(id);

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Inquilino no encontrado',
        });
      }

      // Normalizar inquilino
      const normalizedTenant = TenantMapper.toDTO(tenant);

      return res.json({
        success: true,
        data: normalizedTenant,
      });
    } catch (error: any) {
      console.error('Error obteniendo inquilino:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const tenant: Tenant = req.body;

      // Verificar si ya existe un inquilino con ese documento
      const existingTenant = await TenantModel.findByDocument(tenant.document_number);
      if (existingTenant) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un inquilino con ese número de documento',
        });
      }

      const id = await TenantModel.create(tenant);
      const newTenant = await TenantModel.findById(id);

      // Normalizar inquilino creado
      const normalizedTenant = newTenant ? TenantMapper.toDTO(newTenant) : null;

      return res.status(201).json({
        success: true,
        data: normalizedTenant,
        message: 'Inquilino creado exitosamente',
      });
    } catch (error: any) {
      console.error('Error creando inquilino:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const tenant: Partial<Tenant> = req.body;

      // Verificar que el inquilino existe antes de actualizar
      const oldData = await TenantModel.findById(id);
      if (!oldData) {
        return res.status(404).json({
          success: false,
          error: 'Inquilino no encontrado',
        });
      }

      const updated = await TenantModel.update(id, tenant);

      if (!updated) {
        return res.status(500).json({
          success: false,
          error: 'Error al actualizar el inquilino',
        });
      }

      const updatedTenant = await TenantModel.findById(id);

      // Normalizar inquilino actualizado
      const normalizedTenant = updatedTenant ? TenantMapper.toDTO(updatedTenant) : null;

      return res.json({
        success: true,
        data: normalizedTenant,
        message: 'Inquilino actualizado exitosamente',
      });
    } catch (error: any) {
      console.error('Error actualizando inquilino:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Verificar que el inquilino existe antes de eliminar
      const tenant = await TenantModel.findById(id);
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Inquilino no encontrado',
        });
      }

      // Verificar si el inquilino tiene contratos activos o pendientes
      const activeContracts: any[] = await executeQuery(
        `SELECT c.id, c.contract_number, c.status, u.unit_number, b.name as building_name
         FROM contracts c
         INNER JOIN units u ON c.unit_id = u.id
         INNER JOIN buildings b ON u.building_id = b.id
         WHERE c.tenant_id = $1 AND c.status IN ('active', 'pending')
         ORDER BY c.start_date DESC`,
        [id]
      );

      if (activeContracts.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar el inquilino porque tiene contratos activos o pendientes',
          details: {
            message: 'Primero debe finalizar o cancelar los siguientes contratos:',
            contracts: activeContracts,
            hint: 'Vaya a la sección de Contratos y finalice o cancele los contratos asociados antes de eliminar el inquilino.'
          }
        });
      }

      const deleted = await TenantModel.delete(id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Error al eliminar el inquilino',
        });
      }

      return res.json({
        success: true,
        message: 'Inquilino eliminado exitosamente',
      });
    } catch (error: any) {
      console.error('Error eliminando inquilino:', error);
      
      // Manejar error de foreign key si la validación anterior no lo capturó
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar el inquilino porque tiene registros asociados (contratos, pagos, etc.)',
          details: {
            hint: 'Primero debe eliminar o reasignar los registros relacionados.'
          }
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Búsqueda avanzada con filtros múltiples
   * GET /api/tenants/search?search=Juan&documentType=CC&status=active&minIncome=2000000
   */
  async search(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        search: req.query.search as string,
        documentType: req.query.documentType as string,
        status: req.query.status as 'active' | 'inactive',
        occupation: req.query.occupation as string,
        minIncome: req.query.minIncome ? parseFloat(req.query.minIncome as string) : undefined,
        maxIncome: req.query.maxIncome ? parseFloat(req.query.maxIncome as string) : undefined,
      };

      const pagination = (req as any).pagination;

      const tenants = await TenantModel.advancedSearch(filters, pagination);
      const total = await TenantModel.countAdvancedSearch(filters);

      // Normalizar inquilinos y paginación
      const normalizedTenants = TenantMapper.toDTOList(tenants);
      const normalizedPagination = PaginationMapper.normalize({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });

      return res.json({
        success: true,
        data: normalizedTenants,
        pagination: normalizedPagination,
        filters: filters,
      });
    } catch (error: any) {
      console.error('Error en búsqueda avanzada de inquilinos:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new TenantController();
