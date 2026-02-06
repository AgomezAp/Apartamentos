import { body, ValidationChain } from 'express-validator';

/**
 * Validaciones comunes reutilizables
 */

// Lista de dominios de email temporales bloqueados
const BLOCKED_EMAIL_DOMAINS = [
  'yopmail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  '10minutemail.com',
  'maildrop.cc',
  'tempmail.com',
  'getnada.com',
  'trashmail.com',
];

/**
 * Validar email - NO permite temporales
 */
export const emailValidator = (field: string = 'email'): ValidationChain =>
  body(field)
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El formato del email no es válido')
    .normalizeEmail()
    .custom((value) => {
      const domain = value.split('@')[1]?.toLowerCase();
      if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
        throw new Error('No se permiten emails temporales. Use un email válido como Gmail, Outlook, etc.');
      }
      return true;
    });

/**
 * Validar teléfono móvil Colombia (10 dígitos, empieza con 3)
 * Formato: 3XX XXX XXXX
 */
export const mobilePhoneValidator = (field: string = 'mobile_phone'): ValidationChain =>
  body(field)
    .optional()
    .trim()
    .matches(/^3\d{9}$/).withMessage('El número móvil debe tener 10 dígitos y comenzar con 3 (ej: 3012345678)');

/**
 * Validar teléfono fijo Colombia
 * - Bogotá: 1 XXX XXXX (7 dígitos) o 601 XXX XXXX (10 dígitos con indicativo)
 * - Otras ciudades: 60X XXX XXXX (10 dígitos)
 */
export const landlinePhoneValidator = (field: string = 'phone'): ValidationChain =>
  body(field)
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true; // Es opcional
      
      // Fijo Bogotá: 7 dígitos empezando con 1
      const bogotaPattern = /^1\d{6}$/;
      // Fijo con indicativo: 10 dígitos empezando con 60
      const withCodePattern = /^60\d{8}$/;
      
      if (bogotaPattern.test(value) || withCodePattern.test(value)) {
        return true;
      }
      
      throw new Error('El teléfono fijo debe ser: 7 dígitos para Bogotá (ej: 1234567) o 10 dígitos con indicativo (ej: 6012345678)');
    });

/**
 * Validar número de documento (solo números, 6-15 caracteres)
 */
export const documentNumberValidator = (field: string = 'document_number'): ValidationChain =>
  body(field)
    .trim()
    .notEmpty().withMessage('El número de documento es requerido')
    .matches(/^\d{6,15}$/).withMessage('El documento debe contener solo números (6-15 dígitos)');

/**
 * Validar tipo de documento
 */
export const documentTypeValidator = (field: string = 'document_type'): ValidationChain =>
  body(field)
    .trim()
    .notEmpty().withMessage('El tipo de documento es requerido')
    .isIn(['CC', 'CE', 'TI', 'NIT', 'PP', 'PEP'])
    .withMessage('Tipo de documento inválido. Valores permitidos: CC, CE, TI, NIT, PP, PEP');

/**
 * Validar monto monetario (entre $50,000 y $50,000,000 COP)
 * Si required=false, permite valores vacíos, null, 0 o sin el campo
 */
export const moneyAmountValidator = (field: string = 'amount', required: boolean = true): ValidationChain => {
  const validator = body(field)
    .trim()
    .custom((value) => {
      // Si el campo es opcional y no tiene valor válido, permitirlo
      if (!required && (value === '' || value === null || value === undefined || value === '0' || value === 0)) {
        return true;
      }
      
      const amount = parseFloat(value);
      
      if (isNaN(amount)) {
        throw new Error('El monto debe ser un número válido');
      }
      
      // Permitir monto 0 para casos especiales (contratos sin depósito, rentas gratuitas, etc.)
      if (amount < 0) {
        throw new Error('El monto no puede ser negativo');
      }
      
      if (amount > 50000000) {
        throw new Error('El monto máximo es $50,000,000 COP');
      }
      
      return true;
    });

  return required ? validator : validator.optional();
};

/**
 * Validar que un monto sea positivo
 */
export const positiveAmountValidator = (field: string = 'amount'): ValidationChain =>
  body(field)
    .trim()
    .notEmpty().withMessage(`El ${field} es requerido`)
    .isFloat({ min: 0.01 }).withMessage(`El ${field} debe ser mayor a 0`);

/**
 * Validar fecha en formato YYYY-MM-DD
 */
export const dateValidator = (field: string, allowPast: boolean = false): ValidationChain => {
  const validator = body(field)
    .trim()
    .notEmpty().withMessage(`La fecha ${field} es requerida`)
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage(`La fecha ${field} debe estar en formato YYYY-MM-DD`)
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`La fecha ${field} no es válida`);
      }
      return true;
    });

  if (!allowPast) {
    validator.custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        throw new Error(`La fecha ${field} no puede ser anterior a hoy`);
      }
      return true;
    });
  }

  return validator;
};

/**
 * Validar que end_date sea mayor a start_date
 */
export const dateRangeValidator = (
  startField: string = 'start_date',
  endField: string = 'end_date',
  minMonths: number = 1
): ValidationChain =>
  body(endField).custom((endDate, { req }) => {
    const startDate = new Date(req.body[startField]);
    const end = new Date(endDate);
    
    if (end <= startDate) {
      throw new Error(`La fecha final debe ser posterior a la fecha inicial`);
    }
    
    // Calcular diferencia en meses
    const diffMonths = (end.getFullYear() - startDate.getFullYear()) * 12 + 
                       (end.getMonth() - startDate.getMonth());
    
    if (diffMonths < minMonths) {
      throw new Error(`El contrato debe tener una duración mínima de ${minMonths} mes(es)`);
    }
    
    return true;
  });

/**
 * Validar que un string no esté vacío
 */
export const requiredStringValidator = (field: string, minLength: number = 2, maxLength: number = 255): ValidationChain =>
  body(field)
    .trim()
    .notEmpty().withMessage(`El campo ${field} es requerido`)
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`El campo ${field} debe tener entre ${minLength} y ${maxLength} caracteres`)
    .escape(); // Sanitización básica contra XSS

/**
 * Validar número entero positivo
 */
export const positiveIntegerValidator = (field: string, required: boolean = true): ValidationChain => {
  const validator = body(field)
    .trim()
    .custom((value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1) {
        throw new Error(`El campo ${field} debe ser un número entero positivo`);
      }
      return true;
    });

  return required ? validator : validator.optional();
};

/**
 * Validar booleano
 */
export const booleanValidator = (field: string, required: boolean = false): ValidationChain => {
  const validator = body(field)
    .custom((value) => {
      if (value === undefined || value === null) {
        if (required) {
          throw new Error(`El campo ${field} es requerido`);
        }
        return true;
      }
      
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        throw new Error(`El campo ${field} debe ser true o false`);
      }
      return true;
    });

  return validator;
};
