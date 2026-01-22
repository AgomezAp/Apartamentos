import { Request, Response } from 'express';
import PaymentReceiptModel from '../models/PaymentReceiptModel';
import PaymentModel from '../models/PaymentModel';
import path from 'path';
import fs from 'fs';

class PaymentReceiptController {
  /**
   * Subir comprobante(s) para un pago
   */
  async upload(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = parseInt(req.params.paymentId);
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionaron archivos',
        });
      }

      // Verificar que el pago existe
      const payment = await PaymentModel.findByPk(paymentId);
      if (!payment) {
        // Eliminar archivos subidos
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
      }

      // Guardar registros de comprobantes
      const receipts = await Promise.all(
        files.map(file => {
          const relativePath = file.path.replace(/\\/g, '/').split('uploads/')[1];
          return PaymentReceiptModel.create({
            payment_id: paymentId,
            file_path: relativePath,
            original_name: file.originalname,
            file_size: file.size,
          });
        })
      );

      return res.status(201).json({
        success: true,
        data: receipts,
        message: `${receipts.length} comprobante(s) subido(s) exitosamente`,
      });
    } catch (error: any) {
      console.error('Error subiendo comprobantes:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Listar comprobantes de un pago
   */
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = parseInt(req.params.paymentId);

      const receipts = await PaymentReceiptModel.findAll({
        where: { payment_id: paymentId },
        order: [['uploaded_at', 'DESC']],
      });

      return res.json({
        success: true,
        data: receipts,
      });
    } catch (error: any) {
      console.error('Error listando comprobantes:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Descargar un comprobante
   */
  async download(req: Request, res: Response): Promise<void> {
    try {
      const receiptId = parseInt(req.params.id);

      const receipt = await PaymentReceiptModel.findByPk(receiptId);
      if (!receipt) {
        res.status(404).json({
          success: false,
          error: 'Comprobante no encontrado',
        });
        return;
      }

      const filePath = path.join(__dirname, '../../uploads', receipt.file_path);
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: 'Archivo no encontrado en el servidor',
        });
        return;
      }

      res.download(filePath, receipt.original_name);
    } catch (error: any) {
      console.error('Error descargando comprobante:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Eliminar un comprobante
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const receiptId = parseInt(req.params.id);

      const receipt = await PaymentReceiptModel.findByPk(receiptId);
      if (!receipt) {
        return res.status(404).json({
          success: false,
          error: 'Comprobante no encontrado',
        });
      }

      // Eliminar archivo físico
      const filePath = path.join(__dirname, '../../uploads', receipt.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Eliminar registro de BD
      await receipt.destroy();

      return res.json({
        success: true,
        message: 'Comprobante eliminado exitosamente',
      });
    } catch (error: any) {
      console.error('Error eliminando comprobante:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new PaymentReceiptController();
