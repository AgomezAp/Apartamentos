import { Request, Response } from 'express';
import ExpenseRepository from '../repositories/ExpenseRepository';
import { ExpenseMapper, PaginationMapper } from '../utils/mappers';

class ExpenseController {
  /**
   * Crear un nuevo gasto
   * POST /api/expenses
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        building_id,
        category_id,
        description,
        amount,
        expense_date,
        payment_method,
        reference_number,
        receipt_file_path,
        notes
      } = req.body;

      // Usuario que crea el gasto (en producción vendría del token JWT)
      const created_by = 1;

      const expense = await ExpenseRepository.create({
        building_id,
        category_id,
        description,
        amount,
        expense_date,
        payment_method,
        reference_number,
        receipt_file_path,
        notes,
        created_by
      });

      // Normalizar gasto creado
      const normalizedExpense = ExpenseMapper.toEnhancedDTO(expense);

      return res.status(201).json({
        success: true,
        message: 'Gasto registrado exitosamente',
        data: normalizedExpense
      });
    } catch (error: any) {
      console.error('Error creando gasto:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Listar todos los gastos con filtros
   * GET /api/expenses
   */
  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const {
        building_id,
        category_id,
        start_date,
        end_date,
        page = 1,
        limit = 50
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const expenses = await ExpenseRepository.findAll({
        building_id: building_id ? Number(building_id) : undefined,
        category_id: category_id ? Number(category_id) : undefined,
        start_date: start_date as string,
        end_date: end_date as string,
        limit: Number(limit),
        offset: offset
      });

      // Obtener el total real de gastos con los filtros aplicados
      const totalCount = await ExpenseRepository.countWithFilters({
        building_id: building_id ? Number(building_id) : undefined,
        category_id: category_id ? Number(category_id) : undefined,
        start_date: start_date as string,
        end_date: end_date as string,
      });
      
      // Normalizar gastos
      const normalizedExpenses = ExpenseMapper.toEnhancedDTOList(expenses);
      const normalizedPagination = PaginationMapper.normalize({
        page: Number(page),
        limit: Number(limit),
        total: totalCount,  // Usar el total real, no solo los de la página actual
      });

      return res.status(200).json({
        success: true,
        data: normalizedExpenses,
        pagination: normalizedPagination
      });
    } catch (error: any) {
      console.error('Error obteniendo gastos:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener un gasto por ID
   * GET /api/expenses/:id
   */
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const numId = Number(id);
      
      // Validar que id sea un número válido
      if (isNaN(numId)) {
        return res.status(400).json({ success: false, error: 'ID de gasto inválido' });
      }
      
      const expense = await ExpenseRepository.findById(numId);

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Gasto no encontrado'
        });
      }

      // Normalizar gasto
      const normalizedExpense = ExpenseMapper.toEnhancedDTO(expense);

      return res.status(200).json({
        success: true,
        data: normalizedExpense
      });
    } catch (error: any) {
      console.error('Error obteniendo gasto:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener gastos por edificio
   * GET /api/expenses/by-building/:id
   */
  async findByBuilding(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const numId = Number(id);
      
      // Validar que id sea un número válido
      if (isNaN(numId)) {
        return res.status(400).json({ success: false, error: 'ID de edificio inválido' });
      }
      
      const { category_id, start_date, end_date } = req.query;

      const expenses = await ExpenseRepository.findByBuilding(numId, {
        category_id: category_id ? Number(category_id) : undefined,
        start_date: start_date as string,
        end_date: end_date as string
      });
      
      // Normalizar gastos
      const normalizedExpenses = ExpenseMapper.toEnhancedDTOList(expenses);

      return res.status(200).json({
        success: true,
        data: normalizedExpenses
      });
    } catch (error: any) {
      console.error('Error obteniendo gastos del edificio:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener resumen de gastos por edificio
   * GET /api/expenses/summary/building/:id
   */
  async getSummaryByBuilding(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { year, month } = req.query;

      const summary = await ExpenseRepository.getSummaryByBuilding(
        Number(id),
        year ? Number(year) : undefined,
        month ? Number(month) : undefined
      );

      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      console.error('Error obteniendo resumen de gastos:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualizar un gasto
   * PUT /api/expenses/:id
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const expense = await ExpenseRepository.update(Number(id), updateData);

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Gasto no encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Gasto actualizado exitosamente',
        data: expense
      });
    } catch (error: any) {
      console.error('Error actualizando gasto:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Eliminar un gasto
   * DELETE /api/expenses/:id
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      await ExpenseRepository.delete(Number(id));

      return res.status(200).json({
        success: true,
        message: 'Gasto eliminado exitosamente'
      });
    } catch (error: any) {
      console.error('Error eliminando gasto:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de gastos
   * GET /api/expenses/statistics
   */
  async getStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const { building_id, start_date, end_date } = req.query;

      const stats = await ExpenseRepository.getStatistics({
        building_id: building_id ? Number(building_id) : undefined,
        start_date: start_date as string,
        end_date: end_date as string
      });

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // ==================== CATEGORÍAS ====================

  /**
   * Obtener todas las categorías de gastos
   * GET /api/expenses/categories
   */
  async getCategories(req: Request, res: Response): Promise<Response> {
    try {
      const { all } = req.query;
      const activeOnly = all !== 'true';

      const categories = await ExpenseRepository.getCategories(activeOnly);

      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error: any) {
      console.error('Error obteniendo categorías:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener una categoría por ID
   * GET /api/expenses/categories/:id
   */
  async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await ExpenseRepository.getCategoryById(Number(id));

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error: any) {
      console.error('Error obteniendo categoría:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crear una categoría de gasto
   * POST /api/expenses/categories
   */
  async createCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, is_active } = req.body;

      const category = await ExpenseRepository.createCategory({
        name,
        description,
        is_active
      });

      return res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: category
      });
    } catch (error: any) {
      console.error('Error creando categoría:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualizar una categoría
   * PUT /api/expenses/categories/:id
   */
  async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const category = await ExpenseRepository.updateCategory(Number(id), updateData);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: category
      });
    } catch (error: any) {
      console.error('Error actualizando categoría:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Eliminar una categoría
   * DELETE /api/expenses/categories/:id
   */
  async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      await ExpenseRepository.deleteCategory(Number(id));

      return res.status(200).json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });
    } catch (error: any) {
      console.error('Error eliminando categoría:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener monto total de gastos con filtros
   * GET /api/expenses/total-amount
   */
  async getTotalAmount(req: Request, res: Response): Promise<Response> {
    try {
      const {
        building_id,
        category_id,
        start_date,
        end_date,
        payment_method
      } = req.query;

      const total = await ExpenseRepository.getTotalAmountWithFilters({
        building_id: building_id ? Number(building_id) : undefined,
        category_id: category_id ? Number(category_id) : undefined,
        start_date: start_date as string,
        end_date: end_date as string,
        payment_method: payment_method as string
      });

      return res.status(200).json({
        success: true,
        data: { total }
      });
    } catch (error: any) {
      console.error('Error obteniendo monto total:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new ExpenseController();
