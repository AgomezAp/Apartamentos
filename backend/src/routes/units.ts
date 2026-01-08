import { Router } from 'express';
import UnitController from '../controllers/UnitController';
import { paginationMiddleware, auditMiddleware, handleValidationErrors } from '../middleware';
import { createUnitValidators, updateUnitValidators } from '../validators/unitValidator';

const router = Router();

router.get('/', paginationMiddleware, UnitController.getAll);
router.get('/search', paginationMiddleware, UnitController.search);
router.get('/vacant', UnitController.getVacant);
router.get('/reports/vacancy', UnitController.getVacancyReport);
router.get('/:id', UnitController.getById);
router.post('/', createUnitValidators, handleValidationErrors, auditMiddleware('units'), UnitController.create);
router.put('/:id', updateUnitValidators, handleValidationErrors, auditMiddleware('units'), UnitController.update);
router.delete('/:id', auditMiddleware('units'), UnitController.delete);

export default router;
