import { Router, Request, Response } from 'express';
import RoleModel from '../models/RoleModel';

const router = Router();

/**
 * GET /api/roles
 * Devuelve la lista de roles
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const roles = await RoleModel.findAll({ attributes: ['id', 'name', 'description'] });
    res.json({ success: true, data: roles });
  } catch (err: any) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ success: false, error: 'Error obteniendo roles' });
  }
});

export default router;
