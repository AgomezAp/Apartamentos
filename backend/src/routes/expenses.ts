import { Router } from 'express';
import ExpenseController from '../controllers/ExpenseController';
import { handleValidationErrors } from '../middleware';
import {
  createExpenseValidation,
  updateExpenseValidation,
  createCategoryValidation,
  updateCategoryValidation
} from '../validators/expenseValidator';

const router = Router();

/**
 * Rutas de gastos
 */

// Obtener estadísticas de gastos
router.get('/statistics', ExpenseController.getStatistics);

// Obtener resumen de gastos por edificio
router.get('/summary/building/:id', ExpenseController.getSummaryByBuilding);

// Obtener gastos por edificio
router.get('/by-building/:id', ExpenseController.findByBuilding);

/**
 * Rutas de categorías de gastos (ANTES de las rutas con :id)
 */

// Listar todas las categorías
router.get('/categories', ExpenseController.getCategories);

// Crear una categoría
router.post('/categories', createCategoryValidation, handleValidationErrors, ExpenseController.createCategory);

// Obtener una categoría por ID
router.get('/categories/:id', ExpenseController.getCategoryById);

// Actualizar una categoría
router.put('/categories/:id', updateCategoryValidation, handleValidationErrors, ExpenseController.updateCategory);

// Eliminar una categoría
router.delete('/categories/:id', ExpenseController.deleteCategory);

/**
 * Rutas de gastos con parámetros (DESPUÉS de /categories)
 */

// Crear un nuevo gasto
router.post('/', createExpenseValidation, handleValidationErrors, ExpenseController.create);

// Listar todos los gastos
router.get('/', ExpenseController.findAll);

// Obtener monto total de gastos con filtros
router.get('/total-amount', ExpenseController.getTotalAmount);

// Obtener un gasto por ID
router.get('/:id', ExpenseController.findById);

// Actualizar un gasto
router.put('/:id', updateExpenseValidation, handleValidationErrors, ExpenseController.update);

// Eliminar un gasto
router.delete('/:id', ExpenseController.delete);

export default router;
