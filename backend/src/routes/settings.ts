import { Router } from 'express';
import SettingsController from '../controllers/SettingsController';

const router = Router();

/**
 * GET /api/settings
 * Obtener todas las configuraciones
 * Query params:
 *   - category: filtrar por categoría (general, contracts, payments, uploads, notifications)
 *   - grouped: retornar agrupado por categoría (true/false)
 */
router.get('/', SettingsController.getAllSettings);

/**
 * GET /api/settings/:key
 * Obtener configuración individual
 * Query params:
 *   - full: retornar con metadatos (description, is_editable, etc.)
 */
router.get('/:key', SettingsController.getSetting);

/**
 * PUT /api/settings
 * Actualizar múltiples configuraciones
 * Body: { key1: value1, key2: value2, ... }
 */
router.put('/', SettingsController.updateSettings);

/**
 * PUT /api/settings/:key
 * Actualizar configuración individual
 * Body: { value: nuevoValor }
 */
router.put('/:key', SettingsController.updateSetting);

/**
 * POST /api/settings
 * Crear nueva configuración (solo admin)
 * Body: { key, value, data_type, description, category, is_editable }
 */
router.post('/', SettingsController.createSetting);

export default router;
