import { Request, Response } from 'express';
import { executeQuery } from '../config/database';

class CatalogController {
  // ==================== UNIT TYPES ====================
  
  async getUnitTypes(_req: Request, res: Response): Promise<Response> {
    try {
      const data = await executeQuery(
        'SELECT * FROM unit_types WHERE is_active = true ORDER BY name',
        []
      ) as any[];
      
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createUnitType(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description } = req.body;
      
      const result = await executeQuery(
        'INSERT INTO unit_types (name, description, is_active, created_at, updated_at) VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
        [name, description || null]
      ) as any[];
      
      return res.status(201).json({ 
        success: true, 
        data: result[0],
        message: 'Tipo de unidad creado exitosamente'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateUnitType(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;
      
      const result = await executeQuery(
        'UPDATE unit_types SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [name, description, is_active, id]
      ) as any[];
      
      return res.json({ 
        success: true, 
        data: result[0],
        message: 'Tipo de unidad actualizado'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteUnitType(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      await executeQuery(
        'UPDATE unit_types SET is_active = false WHERE id = $1',
        [id]
      );
      
      return res.json({ success: true, message: 'Tipo de unidad desactivado' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ==================== SERVICE TYPES ====================
  
  async getServiceTypes(_req: Request, res: Response): Promise<Response> {
    try {
      const data = await executeQuery(
        'SELECT * FROM service_types WHERE is_active = true ORDER BY name',
        []
      ) as any[];
      
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createServiceType(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description } = req.body;
      
      const result = await executeQuery(
        'INSERT INTO service_types (name, description, is_active, created_at, updated_at) VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
        [name, description || null]
      ) as any[];
      
      return res.status(201).json({ 
        success: true, 
        data: result[0],
        message: 'Tipo de servicio creado exitosamente'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateServiceType(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;
      
      const result = await executeQuery(
        'UPDATE service_types SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [name, description, is_active, id]
      ) as any[];
      
      return res.json({ 
        success: true, 
        data: result[0],
        message: 'Tipo de servicio actualizado'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteServiceType(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      await executeQuery(
        'UPDATE service_types SET is_active = false WHERE id = $1',
        [id]
      );
      
      return res.json({ success: true, message: 'Tipo de servicio desactivado' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ==================== PAYMENT STATUSES ====================
  
  async getPaymentStatuses(_req: Request, res: Response): Promise<Response> {
    try {
      const data = await executeQuery(
        'SELECT * FROM payment_statuses ORDER BY name',
        []
      ) as any[];
      
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createPaymentStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, color_code } = req.body;
      
      const result = await executeQuery(
        'INSERT INTO payment_statuses (name, description, color_code, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
        [name, description || null, color_code || null]
      ) as any[];
      
      return res.status(201).json({ 
        success: true, 
        data: result[0],
        message: 'Estado de pago creado exitosamente'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updatePaymentStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description, color_code } = req.body;
      
      const result = await executeQuery(
        'UPDATE payment_statuses SET name = COALESCE($1, name), description = COALESCE($2, description), color_code = COALESCE($3, color_code) WHERE id = $4 RETURNING *',
        [name, description, color_code, id]
      ) as any[];
      
      return res.json({ 
        success: true, 
        data: result[0],
        message: 'Estado de pago actualizado'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deletePaymentStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      await executeQuery(
        'DELETE FROM payment_statuses WHERE id = $1',
        [id]
      );
      
      return res.json({ success: true, message: 'Estado de pago eliminado' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ==================== ALERT TYPES ====================
  
  async getAlertTypes(_req: Request, res: Response): Promise<Response> {
    try {
      const data = await executeQuery(
        'SELECT * FROM alert_types WHERE is_active = true ORDER BY name',
        []
      ) as any[];
      
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createAlertType(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, icon, color } = req.body;
      
      const result = await executeQuery(
        'INSERT INTO alert_types (name, description, icon, color, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
        [name, description || null, icon || null, color || null]
      ) as any[];
      
      return res.status(201).json({ 
        success: true, 
        data: result[0],
        message: 'Tipo de alerta creado exitosamente'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateAlertType(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description, icon, color, is_active } = req.body;
      
      const result = await executeQuery(
        'UPDATE alert_types SET name = $1, description = $2, icon = $3, color = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
        [name, description, icon, color, is_active, id]
      ) as any[];
      
      return res.json({ 
        success: true, 
        data: result[0],
        message: 'Tipo de alerta actualizado'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteAlertType(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      await executeQuery(
        'UPDATE alert_types SET is_active = false WHERE id = $1',
        [id]
      );
      
      return res.json({ success: true, message: 'Tipo de alerta desactivado' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ==================== USERS ====================
  
  async getUsers(_req: Request, res: Response): Promise<Response> {
    try {
      const data = await executeQuery(
        'SELECT id, email, full_name, phone, is_active, created_at FROM users WHERE is_active = true ORDER BY full_name',
        []
      ) as any[];
      
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, full_name, phone } = req.body;
      
      // Nota: En producción, hashear el password con bcrypt
      const result = await executeQuery(
        'INSERT INTO users (email, password_hash, full_name, phone, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, email, full_name, phone, is_active, created_at',
        [email, password, full_name, phone || null]
      ) as any[];
      
      return res.status(201).json({ 
        success: true, 
        data: result[0],
        message: 'Usuario creado exitosamente'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { email, full_name, phone, is_active } = req.body;
      
      const result = await executeQuery(
        'UPDATE users SET email = COALESCE($1, email), full_name = COALESCE($2, full_name), phone = COALESCE($3, phone), is_active = COALESCE($4, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, email, full_name, phone, is_active',
        [email, full_name, phone, is_active, id]
      ) as any[];
      
      return res.json({ 
        success: true, 
        data: result[0],
        message: 'Usuario actualizado'
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      await executeQuery(
        'UPDATE users SET is_active = false WHERE id = $1',
        [id]
      );
      
      return res.json({ success: true, message: 'Usuario desactivado' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new CatalogController();
