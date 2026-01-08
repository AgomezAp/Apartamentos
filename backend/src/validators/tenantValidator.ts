import { body, ValidationChain } from 'express-validator';
import {
  emailValidator,
  mobilePhoneValidator,
  landlinePhoneValidator,
  documentNumberValidator,
  documentTypeValidator,
  requiredStringValidator,
} from './common';

/**
 * Validaciones para Inquilinos (Tenants)
 */

export const createTenantValidators: ValidationChain[] = [
  // Tipo de documento
  documentTypeValidator('document_type'),
  
  // Número de documento
  documentNumberValidator('document_number'),
  
  // Nombre
  requiredStringValidator('first_name', 2, 100),
  
  // Apellido
  requiredStringValidator('last_name', 2, 100),
  
  // Email (NO permite temporales)
  emailValidator('email'),
  
  // Teléfono fijo (opcional pero validado si se envía)
  landlinePhoneValidator('phone'),
  
  // Teléfono móvil (opcional pero validado si se envía)
  mobilePhoneValidator('mobile_phone'),
  
  // Contacto de emergencia - Nombre (opcional)
  body('emergency_contact_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre del contacto de emergencia debe tener entre 2 y 255 caracteres')
    .escape(),
  
  // Contacto de emergencia - Teléfono (opcional, pero si se envía debe ser móvil válido)
  body('emergency_contact_phone')
    .optional()
    .trim()
    .matches(/^3\d{9}$/)
    .withMessage('El teléfono de emergencia debe ser un móvil válido (10 dígitos comenzando con 3)'),
  
  // Ocupación (opcional)
  body('occupation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ocupación debe tener entre 2 y 100 caracteres')
    .escape(),
  
  // Nombre de la empresa (opcional)
  body('company_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre de la empresa debe tener entre 2 y 255 caracteres')
    .escape(),
  
  // Ingreso mensual (opcional pero si se envía debe ser válido)
  body('monthly_income')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El ingreso mensual debe ser un valor positivo'),
  
  // Notas (opcional)
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
    .escape(),
];

export const updateTenantValidators: ValidationChain[] = [
  // Todos los campos son opcionales en UPDATE
  body('document_type')
    .optional()
    .trim()
    .isIn(['CC', 'CE', 'TI', 'NIT', 'PP', 'PEP'])
    .withMessage('Tipo de documento inválido. Valores permitidos: CC, CE, TI, NIT, PP, PEP'),
  
  body('document_number')
    .optional()
    .trim()
    .matches(/^\d{6,15}$/)
    .withMessage('El documento debe contener solo números (6-15 dígitos)'),
  
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .escape(),
  
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .escape(),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('El formato del email no es válido')
    .normalizeEmail()
    .custom((value) => {
      const BLOCKED_DOMAINS = [
        'yopmail.com', 'guerrillamail.com', 'mailinator.com',
        'temp-mail.org', 'throwaway.email', '10minutemail.com',
      ];
      const domain = value.split('@')[1]?.toLowerCase();
      if (BLOCKED_DOMAINS.includes(domain)) {
        throw new Error('No se permiten emails temporales');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      const bogotaPattern = /^1\d{6}$/;
      const withCodePattern = /^60\d{8}$/;
      if (bogotaPattern.test(value) || withCodePattern.test(value)) {
        return true;
      }
      throw new Error('El teléfono fijo debe ser 7 dígitos para Bogotá o 10 dígitos con indicativo');
    }),
  
  body('mobile_phone')
    .optional()
    .trim()
    .matches(/^3\d{9}$/)
    .withMessage('El móvil debe tener 10 dígitos comenzando con 3'),
  
  body('emergency_contact_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre del contacto de emergencia debe tener entre 2 y 255 caracteres')
    .escape(),
  
  body('emergency_contact_phone')
    .optional()
    .trim()
    .matches(/^3\d{9}$/)
    .withMessage('El teléfono de emergencia debe ser un móvil válido'),
  
  body('occupation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ocupación debe tener entre 2 y 100 caracteres')
    .escape(),
  
  body('company_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre de la empresa debe tener entre 2 y 255 caracteres')
    .escape(),
  
  body('monthly_income')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El ingreso mensual debe ser un valor positivo'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
    .escape(),
];
