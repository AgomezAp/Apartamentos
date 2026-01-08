import { Request, Response } from 'express';
import BuildingModel from '../models/Building';
import { ApiResponse, Building } from '../interfaces';
import { BuildingMapper, PaginationMapper } from '../utils/mappers';

class BuildingController {
  /**
   * Obtener todos los edificios
   */
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const pagination = (req as any).pagination;
      const search = req.query.search as string | undefined;
      
      const buildings = await BuildingModel.findAll({ ...pagination, search });
      const total = await BuildingModel.count(search);

      // Normalizar edificios y paginación
      const normalizedBuildings = BuildingMapper.toDTOList(buildings);
      const normalizedPagination = PaginationMapper.normalize({
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      });

      const response: ApiResponse<Building[]> = {
        success: true,
        data: normalizedBuildings,
        pagination: normalizedPagination,
      };

      return res.json(response);
    } catch (error: any) {
      console.error('Error obteniendo edificios:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener un edificio por ID
   */
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const building = await BuildingModel.getWithStats(id);

      if (!building) {
        return res.status(404).json({
          success: false,
          error: 'Edificio no encontrado',
        });
      }

      // Normalizar con mapper
      const normalizedBuilding = BuildingMapper.toDTO(building);

      return res.json({
        success: true,
        data: normalizedBuilding,
      });
    } catch (error: any) {
      console.error('Error obteniendo edificio:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de un edificio
   */
  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const building = await BuildingModel.getWithStats(id);

      if (!building) {
        return res.status(404).json({
          success: false,
          error: 'Edificio no encontrado',
        });
      }

      // Normalizar con mapper
      const normalizedBuilding = BuildingMapper.toDTO(building);

      return res.json({
        success: true,
        data: normalizedBuilding,
      });
    } catch (error: any) {
      console.error('Error obteniendo estadísticas del edificio:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Crear un nuevo edificio
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      // Normalizar datos del frontend
      const normalizedData = BuildingMapper.fromDTO(req.body);
      const id = await BuildingModel.create(normalizedData as Building);

      const newBuilding = await BuildingModel.findById(id);

      return res.status(201).json({
        success: true,
        data: newBuilding,
        message: 'Edificio creado exitosamente',
      });
    } catch (error: any) {
      console.error('Error creando edificio:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Actualizar un edificio
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      // Normalizar datos del frontend
      const normalizedData = BuildingMapper.fromDTO(req.body);

      // Verificar que el edificio existe antes de actualizar
      const oldData = await BuildingModel.findById(id);
      if (!oldData) {
        return res.status(404).json({
          success: false,
          error: 'Edificio no encontrado',
        });
      }

      req.body.oldData = oldData;

      const updated = await BuildingModel.update(id, normalizedData as Partial<Building>);

      if (!updated) {
        return res.status(500).json({
          success: false,
          error: 'Error al actualizar el edificio',
        });
      }

      // Obtener el edificio actualizado
      const updatedBuilding = await BuildingModel.getWithStats(id);

      // Normalizar con mapper
      const normalizedBuilding = BuildingMapper.toDTO(updatedBuilding);

      return res.json({
        success: true,
        data: normalizedBuilding,
        message: 'Edificio actualizado exitosamente',
      });
    } catch (error: any) {
      console.error('Error actualizando edificio:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Eliminar un edificio (soft delete)
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar que el edificio existe antes de eliminar
      const building = await BuildingModel.findById(id);
      if (!building) {
        return res.status(404).json({
          success: false,
          error: 'Edificio no encontrado',
        });
      }

      const deleted = await BuildingModel.delete(id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Error al eliminar el edificio',
        });
      }

      return res.json({
        success: true,
        message: 'Edificio eliminado exitosamente',
      });
    } catch (error: any) {
      console.error('Error eliminando edificio:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new BuildingController();
