import { Router } from 'express';
import PaymentReceiptController from '../controllers/PaymentReceiptController';
import { uploadPaymentReceipt } from '../config/multer';

const router = Router();

/**
 * POST /api/payments/:paymentId/receipts
 * Subir comprobante(s) para un pago
 */
router.post(
  '/:paymentId/receipts',
  uploadPaymentReceipt.array('receipts', 10), // Máximo 10 archivos
  PaymentReceiptController.upload
);

/**
 * GET /api/payments/:paymentId/receipts
 * Listar comprobantes de un pago
 */
router.get('/:paymentId/receipts', PaymentReceiptController.list);

/**
 * GET /api/payment-receipts/:id/download
 * Descargar un comprobante
 */
router.get('/receipts/:id/download', PaymentReceiptController.download);

/**
 * DELETE /api/payment-receipts/:id
 * Eliminar un comprobante
 */
router.delete('/receipts/:id', PaymentReceiptController.delete);

export default router;
