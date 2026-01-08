import { Request, Response } from 'express';
import UnitModel from '../models/Unit';
import UnitRepository from '../repositories/UnitRepository';
import { ApiResponse, Unit } from '../interfaces';
import { UnitMapper, PaginationMapper } from '../utils/mappers';

class UnitController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const pagination = (req as any).pagination;
      
      // Recopilar filtros del query
      const filters = {
        building_id: req.query.building_id ? parseInt(req.query.building_id as string) : undefined,
        status: req.query.status as string,
        unit_type_id: req.query.unit_type_id ? parseInt(req.query.unit_type_id as string) : undefined,
        search: req.query.search as string,
        min_rent: req.query.min_rent ? parseFloat(req.query.min_rent as string) : undefined,
        max_rent: req.query.max_rent ? parseFloat(req.query.max_rent as string) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
        furnished: req.query.furnished ? req.query.furnished === 'true' : undefined,
      };
      
      const units = await UnitModel.findAll(filters, pagination);
      const total = await UnitModel.count(filters);

      // Normalizar unidades y paginación
      const normalizedUnits = UnitMapper.toDTOList(units);
      const normalizedPagination = PaginationMapper.normalize({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });

      const response: ApiResponse<Unit[]> = {
        success: true,
        data: normalizedUnits,
        pagination: normalizedPagination,
      };

      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const unit = await UnitRepository.findById(id);

      if (!unit) {
        return res.status(404).json({ success: false, error: 'Unidad no encontrada' });
      }

      // Normalizar unidad con todas sus relaciones
      const normalizedUnit = UnitMapper.toDTO(unit);

      return res.json({ success: true, data: normalizedUnit });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const unit: Unit = req.body;
      
      // Validar que building_id está presente
      if (!unit.building_id) {
        return res.status(400).json({
          success: false,
          error: 'building_id es requerido para crear una unidad',
        });
      }

      const id = await UnitModel.create(unit);
      const newUnit = await UnitModel.findById(id);

      // Normalizar unidad creada
      const normalizedUnit = newUnit ? UnitMapper.toDTO(newUnit) : null;

      return res.status(201).json({
        success: true,
        data: normalizedUnit,
        message: 'Unidad creada exitosamente',
      });
    } catch (error: any) {
      // Error de clave duplicada (unidad ya existe en el edificio)
      if (error.code === '23505' && error.constraint === 'units_building_id_unit_number_key') {
        return res.status(400).json({
          success: false,
          error: 'Ya existe una unidad con ese número en el edificio especificado',
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const unit: Partial<Unit> = req.body;

      const oldData = await UnitModel.findById(id);
      req.body.oldData = oldData;

      const updated = await UnitModel.update(id, unit);

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Unidad no encontrada' });
      }

      const updatedUnit = await UnitModel.findById(id);

      // Normalizar unidad actualizada
      const normalizedUnit = updatedUnit ? UnitMapper.toDTO(updatedUnit) : null;

      return res.json({
        success: true,
        data: normalizedUnit,
        message: 'Unidad actualizada exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await UnitModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Unidad no encontrada' });
      }

      return res.json({ success: true, message: 'Unidad eliminada exitosamente' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getVacant(req: Request, res: Response): Promise<Response> {
    try {
      const buildingId = req.query.building_id ? parseInt(req.query.building_id as string) : undefined;
      const units = await UnitModel.findVacant(buildingId);

      // Normalizar unidades
      const normalizedUnits = UnitMapper.toDTOList(units);

      return res.json({ success: true, data: normalizedUnits });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getVacancyReport(_req: Request, res: Response): Promise<Response> {
    try {
      const report = await UnitModel.getVacantReport();
      return res.json({ success: true, data: report });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Búsqueda avanzada con filtros múltiples
   * GET /api/units/search?search=101&city=Bogota&minPrice=800000&maxPrice=1500000&status=vacant
   */
  async search(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        search: req.query.search as string,
        city: req.query.city as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        status: req.query.status as string,
        building_id: req.query.building_id ? parseInt(req.query.building_id as string) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
        minArea: req.query.minArea ? parseFloat(req.query.minArea as string) : undefined,
        maxArea: req.query.maxArea ? parseFloat(req.query.maxArea as string) : undefined,
      };

      const pagination = (req as any).pagination;

      const units = await UnitModel.advancedSearch(filters, pagination);
      const total = await UnitModel.countAdvancedSearch(filters);

      // Normalizar unidades y paginación
      const normalizedUnits = UnitMapper.toDTOList(units);
      const normalizedPagination = PaginationMapper.normalize({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });

      return res.json({
        success: true,
        data: normalizedUnits,
        pagination: normalizedPagination,
        filters: filters, // Devolver filtros aplicados
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new UnitController();
