import { Request, Response } from 'express';
import SettingsRepository from '../repositories/SettingsRepository';

/**
 * Controlador para Configuraciones del Sistema
 */
class SettingsController {
  /**
   * GET /api/settings
   * Obtener todas las configuraciones
   */
  async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      const { category, grouped } = req.query;

      let settings;

      if (grouped === 'true') {
        // Retornar agrupado por categoría
        settings = await SettingsRepository.getGroupedByCategory();
      } else if (category) {
        // Filtrar por categoría específica
        settings = await SettingsRepository.getByCategory(category as string);
      } else {
        // Todas las configuraciones
        settings = await SettingsRepository.getAllSettings();
      }

      res.json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      console.error('Error obteniendo configuraciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo configuraciones',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/settings/:key
   * Obtener configuración individual
   */
  async getSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { full } = req.query;

      if (full === 'true') {
        // Retornar con metadatos
        const setting = await SettingsRepository.getSettingFull(key);

        if (!setting) {
          res.status(404).json({
            success: false,
            error: `Configuración '${key}' no encontrada`,
          });
          return;
        }

        res.json({
          success: true,
          data: setting,
        });
      } else {
        // Solo valor
        const value = await SettingsRepository.getSetting(key);

        if (value === null) {
          res.status(404).json({
            success: false,
            error: `Configuración '${key}' no encontrada`,
          });
          return;
        }

        res.json({
          success: true,
          data: { [key]: value },
        });
      }
    } catch (error: any) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo configuración',
        details: error.message,
      });
    }
  }

  /**
   * PUT /api/settings
   * Actualizar múltiples configuraciones
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = req.body;

      if (!settings || typeof settings !== 'object') {
        res.status(400).json({
          success: false,
          error: 'Body debe ser un objeto con las configuraciones a actualizar',
        });
        return;
      }

      const result = await SettingsRepository.updateMultiple(settings);

      if (result.errors.length > 0) {
        res.status(207).json({
          success: true,
          message: `${result.updated} configuraciones actualizadas`,
          data: {
            updated: result.updated,
            errors: result.errors,
          },
        });
        return;
      }

      res.json({
        success: true,
        message: `${result.updated} configuraciones actualizadas correctamente`,
        data: {
          updated: result.updated,
        },
      });
    } catch (error: any) {
      console.error('Error actualizando configuraciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error actualizando configuraciones',
        details: error.message,
      });
    }
  }

  /**
   * PUT /api/settings/:key
   * Actualizar configuración individual
   */
  async updateSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (value === undefined || value === null) {
        res.status(400).json({
          success: false,
          error: 'El campo "value" es requerido',
        });
        return;
      }

      await SettingsRepository.updateSetting(key, value);

      res.json({
        success: true,
        message: `Configuración '${key}' actualizada correctamente`,
        data: { [key]: value },
      });
    } catch (error: any) {
      console.error('Error actualizando configuración:', error);

      if (error.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
        return;
      }

      if (error.message.includes('no es editable')) {
        res.status(403).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Error actualizando configuración',
        details: error.message,
      });
    }
  }

  /**
   * POST /api/settings
   * Crear nueva configuración (solo admin)
   */
  async createSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key, value, data_type, description, category, is_editable } = req.body;

      if (!key || !value || !data_type || !category) {
        res.status(400).json({
          success: false,
          error: 'Los campos key, value, data_type y category son requeridos',
        });
        return;
      }

      // Verificar que no exista
      const exists = await SettingsRepository.exists(key);
      if (exists) {
        res.status(409).json({
          success: false,
          error: `La configuración '${key}' ya existe`,
        });
        return;
      }

      const newSetting = await SettingsRepository.createSetting({
        key,
        value,
        data_type,
        description: description || '',
        category,
        is_editable: is_editable !== false,
      });

      res.status(201).json({
        success: true,
        message: 'Configuración creada correctamente',
        data: newSetting,
      });
    } catch (error: any) {
      console.error('Error creando configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error creando configuración',
        details: error.message,
      });
    }
  }
}

export default new SettingsController();
