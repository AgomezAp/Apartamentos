import { Router } from 'express';
import UnitTypeController from '../controllers/UnitTypeController';

const router = Router();

router.get('/', UnitTypeController.getAll);
router.post('/', UnitTypeController.create);
router.put('/:id', UnitTypeController.update);
router.delete('/:id', UnitTypeController.delete);

export default router;
