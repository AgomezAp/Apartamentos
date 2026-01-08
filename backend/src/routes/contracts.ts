import { Router } from 'express';
import ContractController from '../controllers/ContractController';
import { paginationMiddleware, auditMiddleware, handleValidationErrors } from '../middleware';
import { createContractValidators, updateContractValidators } from '../validators/contractValidator';

const router = Router();

// Rutas específicas primero (sin parámetros dinámicos)
router.get('/search', ContractController.search);
router.get('/expiring', ContractController.getExpiring);

// Rutas con parámetros dinámicos después
router.get('/', paginationMiddleware, ContractController.getAll);
router.post('/', createContractValidators, handleValidationErrors, auditMiddleware('contracts'), ContractController.create);

// Rutas con /:id - las rutas con subrutas deben ir ANTES que las genéricas
router.post('/:id/finish', auditMiddleware('contracts'), ContractController.finish);
router.get('/:id/payments', ContractController.getPayments);

// Rutas genéricas con /:id al final
router.get('/:id', ContractController.getById);
router.put('/:id', updateContractValidators, handleValidationErrors, auditMiddleware('contracts'), ContractController.update);
router.delete('/:id', auditMiddleware('contracts'), ContractController.delete);

export default router;
