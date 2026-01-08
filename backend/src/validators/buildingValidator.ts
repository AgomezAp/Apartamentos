import { body, ValidationChain } from 'express-validator';
import { requiredStringValidator } from './common';

/**
 * Validaciones para Edificios (Buildings)
 */

export const createBuildingValidators: ValidationChain[] = [
  // Nombre del edificio
  requiredStringValidator('name', 2, 255),
  
  // Dirección
  requiredStringValidator('address', 5, 500),
  
  // Ciudad (opcional)
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad debe tener entre 2 y 100 caracteres')
    .escape(),
  
  // Estado/Departamento (opcional)
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El departamento debe tener entre 2 y 100 caracteres')
    .escape(),
  
  // Código postal (opcional)
  body('postal_code')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('El código postal debe tener 6 dígitos'),
  
  // País (opcional)
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El país debe tener entre 2 y 100 caracteres')
    .escape(),
  
  // Total de pisos (opcional, pero si se envía debe ser válido)
  body('total_floors')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('El total de pisos debe estar entre 1 y 200'),
  
  // Total de unidades (opcional)
  body('total_units')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('El total de unidades debe estar entre 1 y 1000'),
  
  // Capacidad máxima (opcional)
  body('max_capacity')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('La capacidad máxima debe estar entre 1 y 10000'),
  
  // Descripción (opcional)
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
    .escape(),
  
  // Año de construcción (opcional)
  body('construction_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage(`El año de construcción debe estar entre 1900 y ${new Date().getFullYear() + 5}`),
];

export const updateBuildingValidators: ValidationChain[] = [
  // Todos los campos son opcionales en UPDATE
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres')
    .escape(),
  
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('La dirección debe tener entre 5 y 500 caracteres')
    .escape(),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad debe tener entre 2 y 100 caracteres')
    .escape(),
  
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El departamento debe tener entre 2 y 100 caracteres')
    .escape(),
  
  body('postal_code')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('El código postal debe tener 6 dígitos'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El país debe tener entre 2 y 100 caracteres')
    .escape(),
  
  body('total_floors')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('El total de pisos debe estar entre 1 y 200'),
  
  body('total_units')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('El total de unidades debe estar entre 1 y 1000'),
  
  body('max_capacity')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('La capacidad máxima debe estar entre 1 y 10000'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
    .escape(),
  
  body('construction_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage(`El año de construcción debe estar entre 1900 y ${new Date().getFullYear() + 5}`),
];
