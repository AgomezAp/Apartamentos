import { body, ValidationChain } from 'express-validator';
import { executeQuery } from '../config/database';

/**
 * Validaciones para crear un gasto
 */
export const createExpenseValidation: ValidationChain[] = [
  // ID del edificio
  body('building_id')
    .notEmpty()
    .withMessage('El ID del edificio es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del edificio debe ser un número válido')
    .custom(async (buildingId: number) => {
      const result = await executeQuery(
        'SELECT id FROM buildings WHERE id = $1',
        [buildingId]
      ) as any[];
      if (result.length === 0) {
        throw new Error('El edificio no existe');
      }
      return true;
    }),

  // ID de la categoría
  body('category_id')
    .notEmpty()
    .withMessage('El ID de la categoría es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría debe ser un número válido')
    .custom(async (categoryId: number) => {
      const result = await executeQuery(
        'SELECT id FROM expense_categories WHERE id = $1 AND is_active = true',
        [categoryId]
      ) as any[];
      if (result.length === 0) {
        throw new Error('La categoría no existe o no está activa');
      }
      return true;
    }),

  // Descripción
  body('description')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isString()
    .withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('La descripción debe tener entre 5 y 1000 caracteres')
    .escape(),

  // Monto
  body('amount')
    .notEmpty()
    .withMessage('El monto es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a 0')
    .custom((value: number) => {
      if (value > 999999999.99) {
        throw new Error('El monto es demasiado alto');
      }
      return true;
    }),

  // Fecha del gasto
  body('expense_date')
    .notEmpty()
    .withMessage('La fecha del gasto es requerida')
    .isISO8601()
    .withMessage('La fecha debe estar en formato válido (YYYY-MM-DD)')
    .custom((value: string) => {
      const expenseDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (expenseDate > today) {
        throw new Error('La fecha del gasto no puede ser futura');
      }

      return true;
    }),

  // Método de pago (opcional)
  body('payment_method')
    .optional()
    .isString()
    .withMessage('El método de pago debe ser texto')
    .trim()
    .isLength({ max: 50 })
    .withMessage('El método de pago no puede exceder 50 caracteres')
    .escape(),

  // Número de referencia (opcional)
  body('reference_number')
    .optional()
    .isString()
    .withMessage('El número de referencia debe ser texto')
    .trim()
    .isLength({ max: 100 })
    .withMessage('El número de referencia no puede exceder 100 caracteres')
    .escape(),

  // Ruta del comprobante (opcional)
  body('receipt_file_path')
    .optional()
    .isString()
    .withMessage('La ruta del comprobante debe ser texto')
    .trim()
    .isLength({ max: 500 })
    .withMessage('La ruta del comprobante no puede exceder 500 caracteres'),

  // Notas (opcional)
  body('notes')
    .optional()
    .isString()
    .withMessage('Las notas deben ser texto')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
    .escape()
];

/**
 * Validaciones para actualizar un gasto
 */
export const updateExpenseValidation: ValidationChain[] = [
  // ID del edificio (opcional)
  body('building_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del edificio debe ser un número válido')
    .custom(async (buildingId: number) => {
      const result = await executeQuery(
        'SELECT id FROM buildings WHERE id = $1',
        [buildingId]
      ) as any[];
      if (result.length === 0) {
        throw new Error('El edificio no existe');
      }
      return true;
    }),

  // ID de la categoría (opcional)
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría debe ser un número válido')
    .custom(async (categoryId: number) => {
      const result = await executeQuery(
        'SELECT id FROM expense_categories WHERE id = $1 AND is_active = true',
        [categoryId]
      ) as any[];
      if (result.length === 0) {
        throw new Error('La categoría no existe o no está activa');
      }
      return true;
    }),

  // Descripción (opcional)
  body('description')
    .optional()
    .isString()
    .withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('La descripción debe tener entre 5 y 1000 caracteres')
    .escape(),

  // Monto (opcional)
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a 0')
    .custom((value: number) => {
      if (value > 999999999.99) {
        throw new Error('El monto es demasiado alto');
      }
      return true;
    }),

  // Fecha del gasto (opcional)
  body('expense_date')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe estar en formato válido (YYYY-MM-DD)')
    .custom((value: string) => {
      const expenseDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (expenseDate > today) {
        throw new Error('La fecha del gasto no puede ser futura');
      }

      return true;
    }),

  // Método de pago (opcional)
  body('payment_method')
    .optional()
    .isString()
    .withMessage('El método de pago debe ser texto')
    .trim()
    .isLength({ max: 50 })
    .withMessage('El método de pago no puede exceder 50 caracteres')
    .escape(),

  // Número de referencia (opcional)
  body('reference_number')
    .optional()
    .isString()
    .withMessage('El número de referencia debe ser texto')
    .trim()
    .isLength({ max: 100 })
    .withMessage('El número de referencia no puede exceder 100 caracteres')
    .escape(),

  // Ruta del comprobante (opcional)
  body('receipt_file_path')
    .optional()
    .isString()
    .withMessage('La ruta del comprobante debe ser texto')
    .trim()
    .isLength({ max: 500 })
    .withMessage('La ruta del comprobante no puede exceder 500 caracteres'),

  // Notas (opcional)
  body('notes')
    .optional()
    .isString()
    .withMessage('Las notas deben ser texto')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
    .escape()
];

/**
 * Validaciones para crear una categoría
 */
export const createCategoryValidation: ValidationChain[] = [
  // Nombre
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isString()
    .withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .escape(),

  // Descripción (opcional)
  body('description')
    .optional()
    .isString()
    .withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .escape(),

  // Estado activo (opcional)
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('El estado debe ser verdadero o falso')
];

/**
 * Validaciones para actualizar una categoría
 */
export const updateCategoryValidation: ValidationChain[] = [
  // Nombre (opcional)
  body('name')
    .optional()
    .isString()
    .withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .escape(),

  // Descripción (opcional)
  body('description')
    .optional()
    .isString()
    .withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .escape(),

  // Estado activo (opcional)
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('El estado debe ser verdadero o falso')
];
