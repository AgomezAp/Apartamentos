/**
 * 📱 Rutas de WhatsApp
 * Endpoints para manejar la conexión y envío de mensajes por WhatsApp
 */

import { Router } from 'express';
import WhatsAppController from '../controllers/WhatsAppController';

const router = Router();

// Nota: Las rutas ya están protegidas globalmente en routes/index.ts

/**
 * @route   POST /api/whatsapp/connect
 * @desc    Inicializar conexión de WhatsApp
 * @access  Private (Admin)
 */
router.post('/connect', WhatsAppController.connect);

/**
 * @route   GET /api/whatsapp/status
 * @desc    Obtener estado de conexión de WhatsApp
 * @access  Private (Admin)
 */
router.get('/status', WhatsAppController.getStatus);

/**
 * @route   GET /api/whatsapp/qr
 * @desc    Obtener código QR para conectar WhatsApp
 * @access  Private (Admin)
 */
router.get('/qr', WhatsAppController.getQR);

/**
 * @route   POST /api/whatsapp/disconnect
 * @desc    Desconectar WhatsApp
 * @access  Private (Admin)
 */
router.post('/disconnect', WhatsAppController.disconnect);

/**
 * @route   POST /api/whatsapp/test
 * @desc    Enviar mensaje de prueba
 * @access  Private (Admin)
 * @body    { phone: string, message: string }
 */
router.post('/test', WhatsAppController.sendTestMessage);

/**
 * @route   POST /api/whatsapp/payment-confirmation
 * @desc    Enviar confirmación de pago por WhatsApp
 * @access  Private
 * @body    { phone, tenantName, amount, unitNumber, buildingName, paymentDate, referenceNumber? }
 */
router.post('/payment-confirmation', WhatsAppController.sendPaymentConfirmation);

/**
 * @route   POST /api/whatsapp/payment-reminder
 * @desc    Enviar recordatorio de pago por WhatsApp
 * @access  Private
 * @body    { phone, tenantName, amount, unitNumber, buildingName, dueDate, daysUntilDue }
 */
router.post('/payment-reminder', WhatsAppController.sendPaymentReminder);

/**
 * @route   POST /api/whatsapp/test-alert
 * @desc    Enviar alerta de prueba al administrador
 * @access  Private (Admin)
 */
router.post('/test-alert', WhatsAppController.sendTestAlert);

/**
 * @route   POST /api/whatsapp/run-alerts
 * @desc    Ejecutar verificación de alertas manualmente
 * @access  Private (Admin)
 */
router.post('/run-alerts', WhatsAppController.runAlerts);

export default router;
