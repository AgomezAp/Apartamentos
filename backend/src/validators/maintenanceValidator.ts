import { body } from 'express-validator';
import { executeQuery } from '../config/database';

/**
 * Validador: verificar que la unidad existe
 */
export const unitExistsValidator = body('unit_id')
  .notEmpty()
  .withMessage('El ID de la unidad es requerido')
  .isInt()
  .withMessage('El ID de la unidad debe ser un número entero')
  .custom(async (unitId) => {
    const result = await executeQuery<any[]>(
      'SELECT id FROM units WHERE id = $1 AND is_active = true',
      [unitId]
    );
    if (!result || result.length === 0) {
      throw new Error('La unidad especificada no existe o no está activa');
    }
    return true;
  });

/**
 * Validador: verificar que el inquilino existe
 */
export const tenantExistsValidator = body('tenant_id')
  .notEmpty()
  .withMessage('El ID del inquilino es requerido')
  .isInt()
  .withMessage('El ID del inquilino debe ser un número entero')
  .custom(async (tenantId) => {
    const result = await executeQuery<any[]>(
      'SELECT id FROM tenants WHERE id = $1 AND is_active = true',
      [tenantId]
    );
    if (!result || result.length === 0) {
      throw new Error('El inquilino especificado no existe o no está activo');
    }
    return true;
  });

/**
 * Validadores para crear solicitud de mantenimiento
 */
export const createMaintenanceValidators = [
  unitExistsValidator,
  tenantExistsValidator,
  body('title')
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 5, max: 255 })
    .withMessage('El título debe tener entre 5 y 255 caracteres'),
  body('description')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres'),
  body('category')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isIn([
      'Plomería',
      'Electricidad',
      'Pintura',
      'Carpintería',
      'Cerrajería',
      'Electrodomésticos',
      'Limpieza',
      'Aire Acondicionado',
      'Otros'
    ])
    .withMessage('Categoría no válida'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('La prioridad debe ser: low, medium, high o urgent'),
];

/**
 * Validadores para actualizar solicitud de mantenimiento
 */
export const updateMaintenanceValidators = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 255 })
    .withMessage('El título debe tener entre 5 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('La prioridad debe ser: low, medium, high o urgent'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('El estado debe ser: pending, in_progress, completed o cancelled'),
  body('category')
    .optional()
    .isIn([
      'Plomería',
      'Electricidad',
      'Pintura',
      'Carpintería',
      'Cerrajería',
      'Electrodomésticos',
      'Limpieza',
      'Aire Acondicionado',
      'Otros'
    ])
    .withMessage('Categoría no válida'),
  body('scheduled_date')
    .optional()
    .isISO8601()
    .withMessage('La fecha programada debe tener formato ISO 8601'),
  body('estimated_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo estimado debe ser un número positivo'),
  body('actual_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo real debe ser un número positivo'),
];

/**
 * Validadores para resolver solicitud
 */
export const resolveMaintenanceValidators = [
  body('resolved_by')
    .notEmpty()
    .withMessage('El nombre de quien resuelve es requerido')
    .isString()
    .withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres'),
  body('actual_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo real debe ser un número positivo'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Las notas deben ser texto'),
];
