import { Request, Response } from 'express';
import { executeQuery, executeUpdate } from '../config/database';

class ExpenseCategoryController {
  /**
   * Obtener todas las categorías de gastos
   */
  async getAll(_req: Request, res: Response): Promise<Response> {
    try {
      const query = `
        SELECT id, name, description, is_active, created_at, updated_at
        FROM expense_categories
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
   * Crear una nueva categoría de gasto
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description } = req.body;

      // Validar que no esté vacío
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'El nombre de la categoría es requerido',
        });
      }

      const query = `
        INSERT INTO expense_categories (name, description, is_active, created_at, updated_at)
        VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, name, description, is_active, created_at, updated_at
      `;

      const results: any = await executeQuery(query, [name.trim(), description || null]);
      
      if (results.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Error al crear la categoría',
        });
      }

      return res.status(201).json({
        success: true,
        data: results[0],
        message: 'Categoría creada exitosamente',
      });
    } catch (error: any) {
      // Verificar si es error de duplicado
      if (error.code === '23505' && error.constraint === 'expense_categories_name_key') {
        return res.status(400).json({
          success: false,
          error: 'Esta categoría ya existe',
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Actualizar una categoría de gasto
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { name, description, is_active } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'El nombre de la categoría es requerido',
        });
      }

      const query = `
        UPDATE expense_categories
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
          error: 'Categoría no encontrada',
        });
      }

      return res.json({
        success: true,
        data: results[0],
        message: 'Categoría actualizada exitosamente',
      });
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'expense_categories_name_key') {
        return res.status(400).json({
          success: false,
          error: 'Esta categoría ya existe',
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Eliminar una categoría de gasto
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Verificar si hay gastos con esta categoría
      const checkQuery = `
        SELECT COUNT(*) as count FROM expenses WHERE expense_category_id = $1
      `;
      const checkResult: any = await executeQuery(checkQuery, [id]);

      if (checkResult[0].count > 0) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar esta categoría porque hay gastos asignados',
        });
      }

      const query = `DELETE FROM expense_categories WHERE id = $1`;
      const rowCount = await executeUpdate(query, [id]);

      if (rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Categoría no encontrada',
        });
      }

      return res.json({
        success: true,
        message: 'Categoría eliminada exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new ExpenseCategoryController();
