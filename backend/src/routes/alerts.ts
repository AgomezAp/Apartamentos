import { Router } from 'express';
import { executeQuery } from '../config/database';

const router = Router();

/**
 * GET /api/alerts
 * Obtener alertas con paginación
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const isRead = req.query.isRead;
    const isResolved = req.query.isResolved;

    let query = `
      SELECT a.*, 
             at.name as alert_type_name, 
             at.icon, 
             at.color,
             b.name as building_name,
             u.unit_number
      FROM alerts a
      INNER JOIN alert_types at ON a.alert_type_id = at.id
      LEFT JOIN buildings b ON a.building_id = b.id
      LEFT JOIN units u ON a.unit_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (isRead !== undefined) {
      query += ` AND a.is_read = $${paramIndex}`;
      params.push(isRead === 'true');
      paramIndex++;
    }

    if (isResolved !== undefined) {
      query += ` AND a.is_resolved = $${paramIndex}`;
      params.push(isResolved === 'true');
      paramIndex++;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const alerts = await executeQuery(query, params);

    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM alerts a
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countIndex = 1;

    if (isRead !== undefined) {
      countQuery += ` AND a.is_read = $${countIndex}`;
      countParams.push(isRead === 'true');
      countIndex++;
    }

    if (isResolved !== undefined) {
      countQuery += ` AND a.is_resolved = $${countIndex}`;
      countParams.push(isResolved === 'true');
    }

    const countResult: any[] = await executeQuery(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0');

    res.json({
      success: true,
      data: alerts,
      pagination: {
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener alertas',
      details: error.message,
    });
  }
});

/**
 * GET /api/alerts/:id
 * Obtener alerta por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT a.*, 
             at.name as alert_type_name, 
             at.icon, 
             at.color,
             b.name as building_name,
             u.unit_number
      FROM alerts a
      INNER JOIN alert_types at ON a.alert_type_id = at.id
      LEFT JOIN buildings b ON a.building_id = b.id
      LEFT JOIN units u ON a.unit_id = u.id
      WHERE a.id = $1
    `;

    const alerts: any[] = await executeQuery(query, [id]);

    if (alerts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alerta no encontrada',
      });
    }

    return res.json({
      success: true,
      data: alerts[0],
    });
  } catch (error: any) {
    console.error('Error obteniendo alerta:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener alerta',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/alerts/:id/read
 * Marcar alerta como leída
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      'UPDATE alerts SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Alerta marcada como leída',
    });
  } catch (error: any) {
    console.error('Error actualizando alerta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar alerta',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/alerts/:id/resolve
 * Marcar alerta como resuelta
 */
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      'UPDATE alerts SET is_resolved = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Alerta marcada como resuelta',
    });
  } catch (error: any) {
    console.error('Error actualizando alerta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar alerta',
      details: error.message,
    });
  }
});

export default router;
