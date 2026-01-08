import { body, ValidationChain } from 'express-validator';
import { requiredStringValidator, moneyAmountValidator } from './common';
import { executeQuery } from '../config/database';

/**
 * Validaciones para Unidades (Units)
 */

// Validar que el edificio existe
const buildingExistsValidator = body('building_id')
  .notEmpty().withMessage('El building_id es requerido')
  .isInt({ min: 1 }).withMessage('El building_id debe ser un número entero positivo')
  .custom(async (buildingId) => {
    const result = await executeQuery<any[]>(
      'SELECT id FROM buildings WHERE id = $1 AND is_active = true',
      [buildingId]
    );
    
    if (!result || result.length === 0) {
      throw new Error(`El edificio con ID ${buildingId} no existe o no está activo`);
    }
    return true;
  });

// Validar que el tipo de unidad existe
const unitTypeExistsValidator = body('unit_type_id')
  .notEmpty().withMessage('El unit_type_id es requerido')
  .isInt({ min: 1 }).withMessage('El unit_type_id debe ser un número entero positivo')
  .custom(async (unitTypeId) => {
    console.log('🔍 Validando unit_type_id:', unitTypeId);
    const result = await executeQuery<any[]>(
      'SELECT id FROM unit_types WHERE id = $1 AND is_active = true',
      [unitTypeId]
    );
    console.log('📊 Resultado de la query:', result);
    console.log('📏 Longitud del resultado:', result?.length);
    
    if (!result || result.length === 0) {
      console.log('❌ No se encontró el unit_type_id:', unitTypeId);
      throw new Error(`El tipo de unidad con ID ${unitTypeId} no existe o no está activo`);
    }
    console.log('✅ Unit_type_id válido:', unitTypeId);
    return true;
  });

export const createUnitValidators: ValidationChain[] = [
  // Building ID (debe existir)
  buildingExistsValidator,
  
  // Unit Type ID (debe existir)
  unitTypeExistsValidator,
  
  // Número de unidad
  requiredStringValidator('unit_number', 1, 20),
  
  // Piso (opcional)
  body('floor')
    .optional()
    .isInt({ min: -5, max: 200 })
    .withMessage('El piso debe estar entre -5 (sótanos) y 200'),
  
  // Área en m² (opcional)
  body('area_sqm')
    .optional()
    .isFloat({ min: 1, max: 10000 })
    .withMessage('El área debe estar entre 1 y 10,000 m²'),
  
  // Habitaciones (opcional)
  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Las habitaciones deben estar entre 0 y 20'),
  
  // Baños (opcional)
  body('bathrooms')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Los baños deben estar entre 0 y 10'),
  
  // Precio de arriendo ($50,000 - $50,000,000)
  moneyAmountValidator('rental_price', true),
  
  // Estado de ocupación
  body('occupation_status')
    .trim()
    .notEmpty().withMessage('El estado de ocupación es requerido')
    .isIn(['vacant', 'occupied', 'maintenance', 'reserved'])
    .withMessage('Estado de ocupación inválido. Valores permitidos: vacant, occupied, maintenance, reserved'),
  
  // Descripción (opcional)
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
    .escape(),
];

export const updateUnitValidators: ValidationChain[] = [
  // Todos opcionales en UPDATE, pero si se envían deben ser válidos
  body('building_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El building_id debe ser un número entero positivo')
    .custom(async (buildingId) => {
      const result = await executeQuery<any[]>(
        'SELECT id FROM buildings WHERE id = $1 AND is_active = true',
        [buildingId]
      );
      
      if (!result || result.length === 0) {
        throw new Error(`El edificio con ID ${buildingId} no existe o no está activo`);
      }
      return true;
    }),
  
  body('unit_type_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El unit_type_id debe ser un número entero positivo')
    .custom(async (unitTypeId) => {
      const result = await executeQuery<any[]>(
        'SELECT id FROM unit_types WHERE id = $1 AND is_active = true',
        [unitTypeId]
      );
      
      if (!result || result.length === 0) {
        throw new Error(`El tipo de unidad con ID ${unitTypeId} no existe o no está activo`);
      }
      return true;
    }),
  
  body('unit_number')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('El número de unidad debe tener entre 1 y 20 caracteres')
    .escape(),
  
  body('floor')
    .optional()
    .isInt({ min: -5, max: 200 })
    .withMessage('El piso debe estar entre -5 (sótanos) y 200'),
  
  body('area_sqm')
    .optional()
    .isFloat({ min: 1, max: 10000 })
    .withMessage('El área debe estar entre 1 y 10,000 m²'),
  
  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Las habitaciones deben estar entre 0 y 20'),
  
  body('bathrooms')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Los baños deben estar entre 0 y 10'),
  
  moneyAmountValidator('rental_price', false), // Opcional en update
  
  body('occupation_status')
    .optional()
    .trim()
    .isIn(['vacant', 'occupied', 'maintenance', 'reserved'])
    .withMessage('Estado de ocupación inválido. Valores permitidos: vacant, occupied, maintenance, reserved'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
    .escape(),
];
