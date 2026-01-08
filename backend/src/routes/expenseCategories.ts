import { Router } from 'express';
import ExpenseCategoryController from '../controllers/ExpenseCategoryController';

const router = Router();

router.get('/', ExpenseCategoryController.getAll);
router.post('/', ExpenseCategoryController.create);
router.put('/:id', ExpenseCategoryController.update);
router.delete('/:id', ExpenseCategoryController.delete);

export default router;
