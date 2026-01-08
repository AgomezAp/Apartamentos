import { Request, Response } from 'express';
import { executeQuery, executeUpdate } from '../config/database';

class UnitTypeController {
  /**
   * Obtener todos los tipos de unidad
   */
  async getAll(_req: Request, res: Response): Promise<Response> {
    try {
      const query = `
        SELECT id, name, description, is_active, created_at, updated_at
        FROM unit_types
        ORDER BY name ASC
      `;
      const results = await executeQuery(query, []);
      
      return res.json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Crear un nuevo tipo de unidad
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description } = req.body;

      // Validar que no esté vacío
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'El nombre del tipo de unidad es requerido',
        });
      }

      const query = `
        INSERT INTO unit_types (name, description, is_active, created_at, updated_at)
        VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, name, description, is_active, created_at, updated_at
      `;

      const results: any = await executeQuery(query, [name.trim(), description || null]);
      
      if (results.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Error al crear el tipo de unidad',
        });
      }

      return res.status(201).json({
        success: true,
        data: results[0],
        message: 'Tipo de unidad creado exitosamente',
      });
    } catch (error: any) {
      // Verificar si es error de duplicado
      if (error.code === '23505' && error.constraint === 'unit_types_name_key') {
        return res.status(400).json({
          success: false,
          error: 'Este tipo de unidad ya existe',
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Actualizar un tipo de unidad
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { name, description, is_active } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'El nombre del tipo de unidad es requerido',
        });
      }

      const query = `
        UPDATE unit_types
        SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, name, description, is_active, created_at, updated_at
      `;

      const results: any = await executeQuery(query, [
        name.trim(),
        description || null,
        is_active !== undefined ? is_active : true,
        id,
      ]);

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de unidad no encontrado',
        });
      }

      return res.json({
        success: true,
        data: results[0],
        message: 'Tipo de unidad actualizado exitosamente',
      });
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'unit_types_name_key') {
        return res.status(400).json({
          success: false,
          error: 'Este tipo de unidad ya existe',
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Eliminar un tipo de unidad
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Verificar si hay unidades con este tipo
      const checkQuery = `
        SELECT COUNT(*) as count FROM units WHERE unit_type_id = $1 AND is_active = TRUE
      `;
      const checkResult: any = await executeQuery(checkQuery, [id]);

      if (checkResult[0].count > 0) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar este tipo de unidad porque hay unidades asignadas',
        });
      }

      const query = `DELETE FROM unit_types WHERE id = $1`;
      const rowCount = await executeUpdate(query, [id]);

      if (rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de unidad no encontrado',
        });
      }

      return res.json({
        success: true,
        message: 'Tipo de unidad eliminado exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new UnitTypeController();
