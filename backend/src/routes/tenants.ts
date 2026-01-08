import { Router } from 'express';
import TenantController from '../controllers/TenantController';
import ContractController from '../controllers/ContractController';
import { paginationMiddleware, handleValidationErrors } from '../middleware';
import { createTenantValidators, updateTenantValidators } from '../validators/tenantValidator';

const router = Router();

router.get('/', paginationMiddleware, TenantController.getAll);
router.get('/search', paginationMiddleware, TenantController.search);
router.get('/:id', TenantController.getById);
router.get('/:id/contracts', ContractController.getByTenantId);
router.get('/:id/contracts/active', ContractController.getActiveTenantContract);
router.post('/', createTenantValidators, handleValidationErrors, TenantController.create);
router.put('/:id', updateTenantValidators, handleValidationErrors, TenantController.update);
router.delete('/:id', TenantController.delete);

export default router;
