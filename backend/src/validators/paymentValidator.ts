import { body, ValidationChain } from 'express-validator';
import { dateValidator } from './common';
import { executeQuery } from '../config/database';

/**
 * Validaciones para Pagos (Payments)
 */

// Validar que el contrato existe
const contractExistsValidator = body('contract_id')
  .notEmpty().withMessage('El contract_id es requerido')
  .isInt({ min: 1 }).withMessage('El contract_id debe ser un número entero positivo')
  .custom(async (contractId) => {
    const result: any = await executeQuery(
      'SELECT id FROM contracts WHERE id = $1',
      [contractId]
    );
    
    if (result.length === 0) {
      throw new Error(`El contrato con ID ${contractId} no existe`);
    }
    return true;
  });

// Validar que el mes del período es válido
const periodMonthValidator = body('period_month')
  .notEmpty().withMessage('El mes del período es requerido')
  .isInt({ min: 1, max: 12 }).withMessage('El mes del período debe estar entre 1 y 12');

// Validar que el año del período es válido
const periodYearValidator = body('period_year')
  .notEmpty().withMessage('El año del período es requerido')
  .isInt({ min: 2000, max: 2099 }).withMessage('El año del período debe estar entre 2000 y 2099');

// Validar que el payment status existe
const paymentStatusExistsValidator = body('payment_status_id')
  .notEmpty().withMessage('El payment_status_id es requerido')
  .isInt({ min: 1 }).withMessage('El payment_status_id debe ser un número entero positivo')
  .custom(async (statusId) => {
    const result: any = await executeQuery(
      'SELECT id FROM payment_statuses WHERE id = $1',
      [statusId]
    );
    
    if (result.length === 0) {
      throw new Error(`El estado de pago con ID ${statusId} no existe`);
    }
    return true;
  });

export const createPaymentValidators: ValidationChain[] = [
  // Contract ID (debe existir)
  contractExistsValidator,
  
  // Período (mes y año)
  periodMonthValidator,
  periodYearValidator,
  
  // Fecha de vencimiento
  dateValidator('due_date', true), // Permite fechas pasadas para pagos históricos
  
  // Monto esperado ($50,000 - $50,000,000)
  body('amount_due')
    .trim()
    .notEmpty().withMessage('El monto es requerido')
    .custom((value) => {
      const amount = parseFloat(value);
      
      if (isNaN(amount)) {
        throw new Error('El monto debe ser un número válido');
      }
      
      if (amount < 50000) {
        throw new Error('El monto mínimo es $50,000 COP');
      }
      
      if (amount > 50000000) {
        throw new Error('El monto máximo es $50,000,000 COP');
      }
      
      return true;
    }),
  
  // Estado del pago (debe existir en payment_statuses)
  paymentStatusExistsValidator,
  
  // Notas (opcional)
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
    .escape(),
];

export const updatePaymentValidators: ValidationChain[] = [
  // Todos opcionales en UPDATE
  body('contract_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El contract_id debe ser un número entero positivo')
    .custom(async (contractId) => {
      const result: any = await executeQuery(
        'SELECT id FROM contracts WHERE id = $1',
        [contractId]
      );
      
      if (result.length === 0) {
        throw new Error(`El contrato con ID ${contractId} no existe`);
      }
      return true;
    }),
  
  body('period_month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('El mes del período debe estar entre 1 y 12'),
  
  body('period_year')
    .optional()
    .isInt({ min: 2000, max: 2099 }).withMessage('El año del período debe estar entre 2000 y 2099'),
  
  body('due_date')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('La fecha de vencimiento debe estar en formato YYYY-MM-DD')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('La fecha de vencimiento no es válida');
      }
      return true;
    }),
  
  body('amount_due')
    .optional()
    .custom((value) => {
      const amount = parseFloat(value);
      
      if (isNaN(amount)) {
        throw new Error('El monto debe ser un número válido');
      }
      
      if (amount < 50000) {
        throw new Error('El monto mínimo es $50,000 COP');
      }
      
      if (amount > 50000000) {
        throw new Error('El monto máximo es $50,000,000 COP');
      }
      
      return true;
    }),
  
  body('payment_status_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El payment_status_id debe ser un número entero positivo')
    .custom(async (statusId) => {
      const result: any = await executeQuery(
        'SELECT id FROM payment_statuses WHERE id = $1',
        [statusId]
      );
      
      if (result.length === 0) {
        throw new Error(`El estado de pago con ID ${statusId} no existe`);
      }
      return true;
    }),
  
  body('amount_paid')
    .optional()
    .isFloat({ min: 0, max: 50000000 })
    .withMessage('El monto pagado debe estar entre 0 y $50,000,000'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
    .escape(),
];

/**
 * Validaciones para Transacciones de Pago (Abonos)
 */

export const createTransactionValidators: ValidationChain[] = [
  // Monto de la transacción (debe ser positivo, máx $50,000,000)
  body('amount')
    .trim()
    .notEmpty().withMessage('El monto es requerido')
    .custom((value) => {
      const amount = parseFloat(value);
      
      if (isNaN(amount)) {
        throw new Error('El monto debe ser un número válido');
      }
      
      if (amount <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }
      
      if (amount > 50000000) {
        throw new Error('El monto máximo es $50,000,000 COP');
      }
      
      return true;
    }),
  
  // Método de pago (string, ej: 'cash', 'transfer', 'card')
  body('payment_method')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El método de pago no puede exceder 50 caracteres'),
  
  // Fecha de la transacción (opcional, por defecto fecha actual)
  body('transaction_date')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('La fecha debe estar en formato YYYY-MM-DD'),
  
  // Número de referencia (opcional)
  body('reference_number')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El número de referencia no puede exceder 100 caracteres'),
  
  // Notas (opcional)
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
];
