import { Request, Response } from 'express';
import path from 'path';
import { executeQuery } from '../config/database';
import NotificationService from '../services/NotificationService';

class UploadController {
  /**
   * Subir comprobante de pago
   */
  async uploadReceipt(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se recibió ningún archivo'
        });
      }

      const { payment_id } = req.body;

      // Obtener información del archivo
      const file = req.file;
      
      // Construir la ruta relativa que se guardará en la BD
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const relativePath = `/uploads/receipts/${year}/${month}/${file.filename}`;

      // 🔔 Si se proporcionó payment_id, enviar notificación al admin
      if (payment_id) {
        try {
          // Obtener datos del pago para la notificación
          const paymentData: any[] = await executeQuery(`
            SELECT 
              p.id, p.amount_due, p.period_month, p.period_year,
              u.unit_number, b.name as building_name,
              CONCAT(t.first_name, ' ', t.last_name) as tenant_name
            FROM payments p
            INNER JOIN contracts c ON p.contract_id = c.id
            INNER JOIN units u ON c.unit_id = u.id
            INNER JOIN buildings b ON u.building_id = b.id
            INNER JOIN tenants t ON c.tenant_id = t.id
            WHERE p.id = $1
          `, [payment_id]);

          if (paymentData.length > 0) {
            const payment = paymentData[0];
            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

            if (adminEmail) {
              await NotificationService.notifyPaymentProofUploaded({
                adminEmail: adminEmail,
                tenantName: payment.tenant_name,
                unitNumber: payment.unit_number,
                buildingName: payment.building_name,
                amount: payment.amount_due,
                periodMonth: payment.period_month,
                periodYear: payment.period_year,
                uploadDate: now.toISOString(),
                fileName: file.originalname,
              });

              console.log(`✅ Notificación de comprobante enviada al admin: ${adminEmail}`);
            }
          }
        } catch (emailError) {
          // No fallar la subida si el email falla
          console.error('Error enviando notificación de comprobante:', emailError);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Comprobante subido exitosamente',
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: relativePath,
          uploadedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error subiendo comprobante:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Descargar/ver comprobante
   */
  async getReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { year, month, filename } = req.params;
      
      // Construir ruta completa del archivo
      const filePath = path.join(
        __dirname,
        '../../uploads/receipts',
        year,
        month,
        filename
      );

      // Verificar si el archivo existe
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: 'Comprobante no encontrado'
        });
        return;
      }

      // Enviar el archivo
      res.sendFile(filePath);
    } catch (error: any) {
      console.error('Error obteniendo comprobante:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Subir documento de contrato (PDF)
   */
  async uploadContract(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se recibió ningún archivo'
        });
      }

      const { contract_id } = req.body;
      const file = req.file;
      
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const relativePath = `/uploads/contracts/${year}/${month}/${file.filename}`;

      return res.status(200).json({
        success: true,
        message: 'Contrato subido exitosamente',
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: relativePath,
          contractId: contract_id,
          uploadedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error subiendo contrato:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Subir documento de identificación del inquilino
   */
  async uploadTenantId(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se recibió ningún archivo'
        });
      }

      const { tenant_id } = req.body;
      const file = req.file;
      
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const relativePath = `/uploads/tenant-ids/${year}/${month}/${file.filename}`;

      return res.status(200).json({
        success: true,
        message: 'Documento de identidad subido exitosamente',
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: relativePath,
          tenantId: tenant_id,
          uploadedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error subiendo documento de identidad:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Subir foto de edificio
   */
  async uploadBuildingPhoto(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se recibió ningún archivo'
        });
      }

      const { building_id } = req.body;
      const file = req.file;
      
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const relativePath = `/uploads/building-photos/${year}/${month}/${file.filename}`;

      return res.status(200).json({
        success: true,
        message: 'Foto de edificio subida exitosamente',
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: relativePath,
          buildingId: building_id,
          uploadedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error subiendo foto de edificio:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Subir foto de unidad
   */
  async uploadUnitPhoto(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se recibió ningún archivo'
        });
      }

      const { unit_id } = req.body;
      const file = req.file;
      
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const relativePath = `/uploads/unit-photos/${year}/${month}/${file.filename}`;

      return res.status(200).json({
        success: true,
        message: 'Foto de unidad subida exitosamente',
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: relativePath,
          unitId: unit_id,
          uploadedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error subiendo foto de unidad:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener archivo genérico
   */
  async getFile(req: Request, res: Response): Promise<void> {
    try {
      const { type, year, month, filename } = req.params;
      
      // Validar tipo de archivo
      const validTypes = ['receipts', 'contracts', 'tenant-ids', 'building-photos', 'unit-photos'];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de archivo no válido'
        });
        return;
      }
      
      // Construir ruta completa del archivo
      const filePath = path.join(
        __dirname,
        `../../uploads/${type}`,
        year,
        month,
        filename
      );

      // Verificar si el archivo existe
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: 'Archivo no encontrado'
        });
        return;
      }

      // Enviar el archivo
      res.sendFile(filePath);
    } catch (error: any) {
      console.error('Error obteniendo archivo:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(req: Request, res: Response): Promise<Response> {
    try {
      const { type, year, month, filename } = req.params;
      
      // Validar tipo de archivo
      const validTypes = ['receipts', 'contracts', 'tenant-ids', 'building-photos', 'unit-photos'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de archivo no válido'
        });
      }
      
      // Construir ruta completa del archivo
      const filePath = path.join(
        __dirname,
        `../../uploads/${type}`,
        year,
        month,
        filename
      );

      // Verificar si el archivo existe
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Archivo no encontrado'
        });
      }

      // Eliminar el archivo
      fs.unlinkSync(filePath);

      return res.status(200).json({
        success: true,
        message: 'Archivo eliminado exitosamente',
        data: {
          type,
          filename,
          deletedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error eliminando archivo:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new UploadController();
