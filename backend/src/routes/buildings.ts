import { Router } from 'express';
import BuildingController from '../controllers/BuildingController';
import { paginationMiddleware, auditMiddleware, handleValidationErrors } from '../middleware';
import { createBuildingValidators, updateBuildingValidators } from '../validators/buildingValidator';

const router = Router();

// Aplicar middleware de paginación a todas las rutas GET que lo necesiten
router.get('/', paginationMiddleware, BuildingController.getAll);
router.get('/:id/stats', BuildingController.getStats);
router.get('/:id', BuildingController.getById);
router.post('/', createBuildingValidators, handleValidationErrors, auditMiddleware('buildings'), BuildingController.create);
router.put('/:id', updateBuildingValidators, handleValidationErrors, auditMiddleware('buildings'), BuildingController.update);
router.delete('/:id', auditMiddleware('buildings'), BuildingController.delete);

export default router;
