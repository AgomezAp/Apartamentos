import { body, ValidationChain } from 'express-validator';
import { dateValidator, dateRangeValidator, moneyAmountValidator } from './common';
import { executeQuery } from '../config/database';

/**
 * Validaciones para Contratos (Contracts)
 */

// Validar que la unidad existe y está disponible
const unitExistsAndAvailableValidator = body('unit_id')
  .notEmpty().withMessage('El unit_id es requerido')
  .isInt({ min: 1 }).withMessage('El unit_id debe ser un número entero positivo')
  .custom(async (unitId) => {
    const result: any = await executeQuery(
      'SELECT id, occupation_status FROM units WHERE id = $1 AND is_active = true',
      [unitId]
    );
    
    if (result.length === 0) {
      throw new Error(`La unidad con ID ${unitId} no existe o no está activa`);
    }
    
    // Permitir occupied para actualizar contratos existentes
    // Solo validar en creación que no esté ocupada se hace en el controller
    
    return true;
  });

// Validar que el inquilino existe
const tenantExistsValidator = body('tenant_id')
  .notEmpty().withMessage('El tenant_id es requerido')
  .isInt({ min: 1 }).withMessage('El tenant_id debe ser un número entero positivo')
  .custom(async (tenantId) => {
    const result: any = await executeQuery(
      'SELECT id FROM tenants WHERE id = $1 AND is_active = true',
      [tenantId]
    );
    
    if (result.length === 0) {
      throw new Error(`El inquilino con ID ${tenantId} no existe o no está activo`);
    }
    return true;
  });

export const createContractValidators: ValidationChain[] = [
  // Unit ID (debe existir)
  unitExistsAndAvailableValidator,
  
  // Tenant ID (debe existir)
  tenantExistsValidator,
  
  // Fecha de inicio (permitir fechas pasadas según requerimiento)
  dateValidator('start_date', true), // true = permite fechas pasadas
  
  // Fecha de fin (debe ser posterior a start_date, mínimo 1 mes)
  dateValidator('end_date', true), // true = permite fechas pasadas
  dateRangeValidator('start_date', 'end_date', 1), // Mínimo 1 mes
  
  // Renta mensual ($50,000 - $50,000,000)
  moneyAmountValidator('monthly_rent', true),
  
  // Depósito ($50,000 - $50,000,000) - OPCIONAL: algunos contratos no requieren depósito
  moneyAmountValidator('deposit_amount', false),
  
  // Día de pago (1-31)
  body('payment_day')
    .notEmpty().withMessage('El día de pago es requerido')
    .isInt({ min: 1, max: 31 })
    .withMessage('El día de pago debe estar entre 1 y 31'),
  
  // Estado del contrato
  body('status')
    .trim()
    .notEmpty().withMessage('El estado del contrato es requerido')
    .isIn(['active', 'pending', 'finished', 'cancelled'])
    .withMessage('Estado inválido. Valores permitidos: active, pending, finished, cancelled'),
  
  // Notas (opcional)
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
    .escape(),
];

export const updateContractValidators: ValidationChain[] = [
  // Todos opcionales en UPDATE
  body('unit_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El unit_id debe ser un número entero positivo')
    .custom(async (unitId) => {
      const result: any = await executeQuery(
        'SELECT id FROM units WHERE id = $1 AND is_active = true',
        [unitId]
      );
      
      if (result.length === 0) {
        throw new Error(`La unidad con ID ${unitId} no existe o no está activa`);
      }
      return true;
    }),
  
  body('tenant_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El tenant_id debe ser un número entero positivo')
    .custom(async (tenantId) => {
      const result: any = await executeQuery(
        'SELECT id FROM tenants WHERE id = $1 AND is_active = true',
        [tenantId]
      );
      
      if (result.length === 0) {
        throw new Error(`El inquilino con ID ${tenantId} no existe o no está activo`);
      }
      return true;
    }),
  
  body('start_date')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('La fecha de inicio debe estar en formato YYYY-MM-DD')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('La fecha de inicio no es válida');
      }
      return true;
    }),
  
  body('end_date')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('La fecha final debe estar en formato YYYY-MM-DD')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      if (isNaN(endDate.getTime())) {
        throw new Error('La fecha final no es válida');
      }
      
      // Si también se actualiza start_date, validar el rango
      if (req.body.start_date) {
        const startDate = new Date(req.body.start_date);
        if (endDate <= startDate) {
          throw new Error('La fecha final debe ser posterior a la fecha inicial');
        }
        
        const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          (endDate.getMonth() - startDate.getMonth());
        
        if (diffMonths < 1) {
          throw new Error('El contrato debe tener una duración mínima de 1 mes');
        }
      }
      
      return true;
    }),
  
  moneyAmountValidator('monthly_rent', false),
  
  moneyAmountValidator('deposit_amount', false),
  
  body('payment_day')
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('El día de pago debe estar entre 1 y 31'),
  
  body('status')
    .optional()
    .trim()
    .isIn(['active', 'pending', 'finished', 'cancelled'])
    .withMessage('Estado inválido. Valores permitidos: active, pending, finished, cancelled'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
    .escape(),
];
