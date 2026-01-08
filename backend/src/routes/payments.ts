import { Router } from 'express';
import PaymentController from '../controllers/PaymentController';
import { auditMiddleware, handleValidationErrors } from '../middleware';
import { createPaymentValidators, updatePaymentValidators, createTransactionValidators } from '../validators/paymentValidator';

const router = Router();

// Rutas específicas primero
router.get('/search', PaymentController.search);
router.get('/overdue', PaymentController.getOverdue);
router.post('/generate-monthly', auditMiddleware('payments'), PaymentController.generateMonthly);

// Rutas con parámetros dinámicos
router.get('/unit/:unitId', PaymentController.getByUnitId);
router.post('/:id/transactions', createTransactionValidators, handleValidationErrors, auditMiddleware('payment_transactions'), PaymentController.addTransaction);

// Rutas CRUD generales
router.get('/', PaymentController.getAll);
router.get('/:id', PaymentController.getById);
router.post('/', createPaymentValidators, handleValidationErrors, auditMiddleware('payments'), PaymentController.create);
router.put('/:id', updatePaymentValidators, handleValidationErrors, auditMiddleware('payments'), PaymentController.update);
router.delete('/:id', auditMiddleware('payments'), PaymentController.delete);

export default router;
