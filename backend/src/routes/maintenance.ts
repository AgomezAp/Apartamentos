import { Router } from 'express';
import MaintenanceController from '../controllers/MaintenanceController';
import { auditMiddleware, handleValidationErrors } from '../middleware';
import {
  createMaintenanceValidators,
  updateMaintenanceValidators,
  resolveMaintenanceValidators,
} from '../validators/maintenanceValidator';

const router = Router();

/**
 * GET /api/maintenance-requests
 * Obtener todas las solicitudes de mantenimiento
 * Query params opcionales:
 *   - status: pending, in_progress, completed, cancelled
 *   - priority: low, medium, high, urgent
 *   - unit_id: filtrar por unidad
 *   - tenant_id: filtrar por inquilino
 *   - category: filtrar por categoría
 */
router.get('/', MaintenanceController.getAll);

/**
 * GET /api/maintenance-requests/pending
 * Obtener solicitudes pendientes
 */
router.get('/pending', MaintenanceController.getPending);

/**
 * GET /api/maintenance-requests/urgent
 * Obtener solicitudes urgentes
 */
router.get('/urgent', MaintenanceController.getUrgent);

/**
 * GET /api/maintenance-requests/stats
 * Obtener estadísticas por categoría
 */
router.get('/stats', MaintenanceController.getStats);

/**
 * GET /api/maintenance-requests/unit/:unitId
 * Obtener solicitudes por unidad
 */
router.get('/unit/:unitId', MaintenanceController.getByUnit);

/**
 * GET /api/maintenance-requests/tenant/:tenantId
 * Obtener solicitudes por inquilino
 */
router.get('/tenant/:tenantId', MaintenanceController.getByTenant);

/**
 * GET /api/maintenance-requests/:id
 * Obtener solicitud específica por ID
 */
router.get('/:id', MaintenanceController.getById);

/**
 * POST /api/maintenance-requests
 * Crear nueva solicitud de mantenimiento
 * Body:
 *   - unit_id: ID de la unidad (requerido)
 *   - tenant_id: ID del inquilino (requerido)
 *   - title: Título de la solicitud (requerido, 5-255 caracteres)
 *   - description: Descripción del problema (requerido, mín 10 caracteres)
 *   - category: Categoría (requerido: Plomería, Electricidad, etc.)
 *   - priority: Prioridad (opcional: low, medium, high, urgent)
 *   - scheduled_date: Fecha programada (opcional)
 *   - assigned_to: ID del usuario asignado (opcional)
 *   - estimated_cost: Costo estimado (opcional)
 *   - notes: Notas adicionales (opcional)
 *   - attachments: Archivos adjuntos JSON (opcional)
 */
router.post(
  '/',
  createMaintenanceValidators,
  handleValidationErrors,
  auditMiddleware('maintenance_requests'),
  MaintenanceController.create
);

/**
 * PUT /api/maintenance-requests/:id
 * Actualizar solicitud de mantenimiento
 * Body: Campos opcionales a actualizar
 */
router.put(
  '/:id',
  updateMaintenanceValidators,
  handleValidationErrors,
  auditMiddleware('maintenance_requests'),
  MaintenanceController.update
);

/**
 * POST /api/maintenance-requests/:id/resolve
 * Marcar solicitud como resuelta
 * Body:
 *   - resolved_by: ID del usuario que resuelve (requerido)
 *   - actual_cost: Costo real (opcional)
 *   - notes: Notas de resolución (opcional)
 */
router.post(
  '/:id/resolve',
  resolveMaintenanceValidators,
  handleValidationErrors,
  auditMiddleware('maintenance_requests'),
  MaintenanceController.resolve
);

/**
 * DELETE /api/maintenance-requests/:id
 * Eliminar solicitud de mantenimiento
 */
router.delete(
  '/:id',
  auditMiddleware('maintenance_requests'),
  MaintenanceController.delete
);

export default router;
