/**
 * 📱 Controlador de WhatsApp
 * Maneja las operaciones de WhatsApp (conexión, estado, envío de mensajes)
 */

import { Request, Response } from 'express';
import whatsappService from '../services/WhatsAppService';
import alertService from '../services/alertService';
import QRCode from 'qrcode';

class WhatsAppController {
  /**
   * Inicializar conexión de WhatsApp
   * POST /api/whatsapp/connect
   */
  async connect(_req: Request, res: Response): Promise<Response> {
    try {
      const status = whatsappService.getStatus();
      
      if (status.isConnected) {
        return res.json({
          success: true,
          message: 'WhatsApp ya está conectado',
          data: status,
        });
      }

      // Inicializar el servicio (esto generará el código QR)
      await whatsappService.initialize();

      return res.json({
        success: true,
        message: 'Inicializando WhatsApp. Escanea el código QR.',
        data: whatsappService.getStatus(),
      });
    } catch (error: any) {
      console.error('Error conectando WhatsApp:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener estado de conexión
   * GET /api/whatsapp/status
   */
  async getStatus(_req: Request, res: Response): Promise<Response> {
    try {
      const status = whatsappService.getStatus();
      
      return res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      console.error('Error obteniendo estado de WhatsApp:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener código QR para conectar
   * GET /api/whatsapp/qr
   */
  async getQR(_req: Request, res: Response): Promise<Response> {
    try {
      const status = whatsappService.getStatus();
      
      if (status.isReady) {
        return res.json({
          success: true,
          message: 'WhatsApp ya está conectado, no se necesita QR',
          data: { qrCode: null, isConnected: true },
        });
      }

      if (!status.qrCode) {
        return res.json({
          success: true,
          message: 'Código QR aún no generado. Espera o inicia la conexión.',
          data: { qrCode: null, isConnected: false },
        });
      }

      // Generar imagen QR como base64
      const qrImageBase64 = await QRCode.toDataURL(status.qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return res.json({
        success: true,
        data: { qrCode: qrImageBase64, isConnected: false },
      });
    } catch (error: any) {
      console.error('Error obteniendo QR:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Desconectar WhatsApp
   * POST /api/whatsapp/disconnect
   */
  async disconnect(_req: Request, res: Response): Promise<Response> {
    try {
      await whatsappService.disconnect();
      
      return res.json({
        success: true,
        message: 'WhatsApp desconectado',
      });
    } catch (error: any) {
      console.error('Error desconectando WhatsApp:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Enviar mensaje de prueba
   * POST /api/whatsapp/test
   */
  async sendTestMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere phone y message',
        });
      }

      const sent = await whatsappService.sendMessage(phone, message);

      return res.json({
        success: sent,
        message: sent ? 'Mensaje enviado correctamente' : 'No se pudo enviar el mensaje',
      });
    } catch (error: any) {
      console.error('Error enviando mensaje de prueba:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Enviar confirmación de pago
   * POST /api/whatsapp/payment-confirmation
   */
  async sendPaymentConfirmation(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, tenantName, amount, unitNumber, buildingName, paymentDate, referenceNumber } = req.body;

      if (!phone || !tenantName || !amount || !unitNumber || !buildingName || !paymentDate) {
        return res.status(400).json({
          success: false,
          error: 'Faltan campos requeridos',
        });
      }

      const sent = await whatsappService.sendPaymentConfirmation(phone, {
        tenantName,
        amount: parseFloat(amount),
        unitNumber,
        buildingName,
        paymentDate,
        referenceNumber,
      });

      return res.json({
        success: sent,
        message: sent ? 'Confirmación de pago enviada' : 'No se pudo enviar la confirmación',
      });
    } catch (error: any) {
      console.error('Error enviando confirmación de pago:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Enviar recordatorio de pago
   * POST /api/whatsapp/payment-reminder
   */
  async sendPaymentReminder(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, tenantName, amount, unitNumber, buildingName, dueDate, daysUntilDue } = req.body;

      if (!phone || !tenantName || !amount || !unitNumber || !buildingName || !dueDate) {
        return res.status(400).json({
          success: false,
          error: 'Faltan campos requeridos',
        });
      }

      const sent = await whatsappService.sendPaymentReminder(phone, {
        tenantName,
        amount: parseFloat(amount),
        unitNumber,
        buildingName,
        dueDate,
        daysUntilDue: parseInt(daysUntilDue) || 3,
      });

      return res.json({
        success: sent,
        message: sent ? 'Recordatorio enviado' : 'No se pudo enviar el recordatorio',
      });
    } catch (error: any) {
      console.error('Error enviando recordatorio:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Enviar alerta de prueba al administrador
   * POST /api/whatsapp/test-alert
   */
  async sendTestAlert(_req: Request, res: Response): Promise<Response> {
    try {
      const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '573006821133';
      
      const sent = await alertService.sendTestAlert();

      return res.json({
        success: sent,
        message: sent 
          ? `Alerta de prueba enviada al número ${adminPhone}` 
          : 'No se pudo enviar la alerta. Verifica que WhatsApp esté conectado.',
        adminPhone: adminPhone,
      });
    } catch (error: any) {
      console.error('Error enviando alerta de prueba:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Ejecutar verificación de alertas manualmente
   * POST /api/whatsapp/run-alerts
   */
  async runAlerts(_req: Request, res: Response): Promise<Response> {
    try {
      await alertService.runNow();

      return res.json({
        success: true,
        message: 'Verificación de alertas ejecutada. Revisa los logs del servidor.',
      });
    } catch (error: any) {
      console.error('Error ejecutando alertas:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new WhatsAppController();
