import { Request, Response } from 'express';
import PaymentModel from '../models/Payment';
import { Payment, PaymentTransaction } from '../interfaces';
import NotificationService from '../services/NotificationService';
import alertService from '../services/alertService';
import { PaymentMapper } from '../utils/mappers';

class PaymentController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        contract_id: req.query.contract_id ? parseInt(req.query.contract_id as string) : undefined,
        tenant_id: req.query.tenant_id ? parseInt(req.query.tenant_id as string) : undefined,
        status: req.query.status as string,
        payment_method: req.query.payment_method as string,
        start_date: (req.query.start_date || req.query.date_from) as string,
        end_date: (req.query.end_date || req.query.date_to) as string,
        period_year: req.query.year ? parseInt(req.query.year as string) : undefined,
        period_month: req.query.month ? parseInt(req.query.month as string) : undefined,
      };

      const payments = await PaymentModel.findAll(filters);
      
      // Normalizar pagos usando mapper
      const normalizedPayments = PaymentMapper.toEnhancedDTOList(payments);

      return res.json({ success: true, data: normalizedPayments });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      // Validar que id sea un número válido
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID de pago inválido' });
      }
      
      const payment = await PaymentModel.findById(id);

      if (!payment) {
        return res.status(404).json({ success: false, error: 'Pago no encontrado' });
      }

      // Obtener transacciones del pago
      const transactions = await PaymentModel.getTransactions(id);

      // Normalizar pago
      const normalizedPayment = PaymentMapper.toEnhancedDTO(payment);

      return res.json({
        success: true,
        data: {
          ...normalizedPayment,
          transactions,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Obtener historial de pagos de una unidad
   */
  async getByUnitId(req: Request, res: Response): Promise<Response> {
    try {
      const unitId = parseInt(req.params.unitId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;

      if (isNaN(unitId)) {
        return res.status(400).json({ success: false, error: 'ID de unidad inválido' });
      }

      const payments = await PaymentModel.findByUnitId(unitId, limit);

      // Normalizar pagos
      const normalizedPayments = PaymentMapper.toEnhancedDTOList(payments);

      return res.json({ success: true, data: normalizedPayments });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const payment: Payment = req.body;
      
      // Convertir payment_status_id a número si viene como string
      if (payment.payment_status_id) {
        payment.payment_status_id = Number(payment.payment_status_id);
      }
      
      // Determinar el estado correcto basándose en la fecha de vencimiento y el monto pagado
      const dueDate = new Date(payment.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      // Si no se especifica payment_status_id, determinarlo automáticamente
      if (!payment.payment_status_id) {
        if (dueDate > today) {
          // Fecha futura = Pendiente
          payment.payment_status_id = 1;
        } else if (payment.amount_paid && payment.amount_paid >= payment.amount_due) {
          // Ya pagado completo = Pagado
          payment.payment_status_id = 2;
        } else if (payment.amount_paid && payment.amount_paid < payment.amount_due) {
          // Pago parcial = Parcial
          payment.payment_status_id = 4;
        } else if (dueDate < today) {
          // Fecha pasada sin pago = Vencido
          payment.payment_status_id = 3;
        } else {
          // Hoy sin pago = Pendiente
          payment.payment_status_id = 1;
        }
      }
      
      // Si se crea con status completado (2) o parcial (4), asignar payment_date automáticamente
      if ((payment.payment_status_id === 2 || payment.payment_status_id === 4) && !payment.payment_date) {
        payment.payment_date = new Date();
      }
      
      // Si es completado y no tiene amount_paid, usar amount_due
      if (payment.payment_status_id === 2 && !payment.amount_paid) {
        payment.amount_paid = payment.amount_due;
      }
      
      console.log('Creando pago con datos:', {
        status_id: payment.payment_status_id,
        payment_date: payment.payment_date,
        amount_paid: payment.amount_paid
      });
      
      const id = await PaymentModel.create(payment);
      const newPayment = await PaymentModel.findById(id);

      // Normalizar pago creado
      const normalizedPayment = newPayment ? PaymentMapper.toEnhancedDTO(newPayment) : null;

      // 📱 Enviar notificación por WhatsApp al administrador
      if (newPayment && (payment.payment_status_id === 2 || payment.payment_status_id === 4)) {
        // Solo notificar si el pago está completado o parcial (no pendientes)
        try {
          await alertService.notifyPaymentRegistered({
            tenantName: (newPayment as any).tenant_name || 'Inquilino',
            unitNumber: (newPayment as any).unit_number || 'N/A',
            buildingName: (newPayment as any).building_name || 'N/A',
            amount: payment.amount_paid || payment.amount_due,
            paymentMethod: payment.payment_method,
            periodMonth: payment.period_month,
            periodYear: payment.period_year,
          });
        } catch (whatsappError) {
          console.error('Error enviando notificación WhatsApp de pago:', whatsappError);
          // No fallamos el pago si WhatsApp falla
        }
      }

      return res.status(201).json({
        success: true,
        data: normalizedPayment,
        message: 'Pago creado exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      // Validar que id sea un número válido
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID de pago inválido' });
      }
      
      const payment: Partial<Payment> = req.body;

      const oldData = await PaymentModel.findById(id);
      req.body.oldData = oldData;

      // Si se actualiza a status completado (2), automáticamente asignar amount_paid y payment_date
      if (payment.payment_status_id === 2 && oldData) {
        // Asignar amount_paid si no viene en el request
        if (!payment.amount_paid) {
          payment.amount_paid = oldData.amount_due;
        }
        // Asignar payment_date con la fecha actual si no viene en el request
        if (!payment.payment_date) {
          payment.payment_date = new Date();
        }
      }
      
      // Si se actualiza a status parcial (3), también asignar payment_date si no existe
      if (payment.payment_status_id === 3 && oldData && !payment.payment_date) {
        payment.payment_date = new Date();
      }

      const updated = await PaymentModel.update(id, payment);

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Pago no encontrado' });
      }

      const updatedPayment = await PaymentModel.findById(id);

      // Normalizar pago actualizado
      const normalizedPayment = updatedPayment ? PaymentMapper.toEnhancedDTO(updatedPayment) : null;

      return res.json({
        success: true,
        data: normalizedPayment,
        message: 'Pago actualizado exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async addTransaction(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = parseInt(req.params.id);
      
      // Validar ID
      if (isNaN(paymentId)) {
        return res.status(400).json({ success: false, error: 'ID de pago inválido' });
      }

      // Validar que existe el pago
      const existingPayment = await PaymentModel.findById(paymentId);
      if (!existingPayment) {
        return res.status(404).json({ success: false, error: 'Pago no encontrado' });
      }

      // Usar monthly_rent del contrato como el monto total del arriendo
      const monthlyRent = parseFloat((existingPayment as any).monthly_rent) || 0;
      const amountDue = monthlyRent > 0 ? monthlyRent : parseFloat(existingPayment.amount_due.toString());
      const amountPaid = parseFloat((existingPayment as any).amount_paid) || 0;
      const balance = amountDue - amountPaid;

      // Validar monto del abono
      const transactionAmount = parseFloat(req.body.amount);
      if (isNaN(transactionAmount) || transactionAmount <= 0) {
        return res.status(400).json({ success: false, error: 'El monto debe ser mayor a 0' });
      }

      if (transactionAmount > balance) {
        return res.status(400).json({ 
          success: false, 
          error: `El monto ($${transactionAmount.toLocaleString('es-CO')}) excede el saldo pendiente ($${balance.toLocaleString('es-CO')})` 
        });
      }

      const transaction: PaymentTransaction = {
        ...req.body,
        amount: transactionAmount,
        payment_id: paymentId,
        created_by: (req as any).user?.id,
      };

      const id = await PaymentModel.addTransaction(transaction);
      const payment = await PaymentModel.findById(paymentId);

      // Determinar si es pago completo o parcial
      const newAmountPaid = parseFloat((payment as any).amount_paid) || 0;
      const isCompleted = newAmountPaid >= amountDue;

      // 📱 Enviar notificación WhatsApp al administrador
      if (payment) {
        try {
          await alertService.notifyPaymentRegistered({
            tenantName: (payment as any).tenant_name || 'Inquilino',
            unitNumber: (payment as any).unit_number || 'N/A',
            buildingName: (payment as any).building_name || 'N/A',
            amount: transactionAmount,
            paymentMethod: transaction.payment_method,
            periodMonth: payment.period_month,
            periodYear: payment.period_year,
          });
        } catch (whatsappError) {
          console.error('Error enviando notificación WhatsApp:', whatsappError);
        }
      }

      // 🔔 Enviar notificación al inquilino sobre el pago registrado
      if (payment && (payment as any).tenant_email) {
        try {
          await NotificationService.notifyPaymentRegistered({
            tenantEmail: (payment as any).tenant_email,
            tenantName: (payment as any).tenant_name,
            amount: transactionAmount,
            paymentDate: transaction.transaction_date?.toString() || new Date().toISOString(),
            paymentMethod: transaction.payment_method || 'No especificado',
            periodMonth: payment.period_month,
            periodYear: payment.period_year,
            unitNumber: (payment as any).unit_number,
            buildingName: (payment as any).building_name,
            referenceNumber: transaction.reference_number,
          });
        } catch (emailError) {
          console.error('Error enviando notificación de pago:', emailError);
        }
      }

      // Normalizar pago para respuesta
      const normalizedPayment = payment ? PaymentMapper.toEnhancedDTO(payment) : null;

      return res.status(201).json({
        success: true,
        data: { 
          transaction_id: id, 
          payment: normalizedPayment,
          is_completed: isCompleted,
          amount_paid: newAmountPaid,
          balance: amountDue - newAmountPaid
        },
        message: isCompleted 
          ? '✅ Pago completado exitosamente' 
          : `💰 Abono registrado. Saldo pendiente: $${(amountDue - newAmountPaid).toLocaleString('es-CO')}`,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getOverdue(_req: Request, res: Response): Promise<Response> {
    try {
      const overduePayments = await PaymentModel.getOverdue();

      return res.json({ success: true, data: overduePayments });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async generateMonthly(req: Request, res: Response): Promise<Response> {
    try {
      const { contract_id, year, month } = req.body;

      const id = await PaymentModel.generateMonthlyPayments(contract_id, year, month);
      const payment = await PaymentModel.findById(id);

      return res.status(201).json({
        success: true,
        data: payment,
        message: 'Pago mensual generado exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Búsqueda avanzada con filtros múltiples
   * GET /api/payments/search?status=overdue&fromDate=2025-01-01&toDate=2025-12-31&building_id=1
   */
  async search(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        status: req.query.status as string,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        building_id: req.query.building_id ? parseInt(req.query.building_id as string) : undefined,
        tenant_id: req.query.tenant_id ? parseInt(req.query.tenant_id as string) : undefined,
        contract_id: req.query.contract_id ? parseInt(req.query.contract_id as string) : undefined,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        overdueDays: req.query.overdueDays ? parseInt(req.query.overdueDays as string) : undefined,
      };

      const payments = await PaymentModel.advancedSearch(filters);
      const total = await PaymentModel.countAdvancedSearch(filters);

      return res.json({
        success: true,
        data: payments,
        total,
        filters: filters,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Eliminar un pago
   * DELETE /api/payments/:id
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID de pago inválido' });
      }

      // Verificar que el pago existe
      const payment = await PaymentModel.findById(id);
      if (!payment) {
        return res.status(404).json({ success: false, error: 'Pago no encontrado' });
      }

      // Eliminar el pago
      const deleted = await PaymentModel.delete(id);

      if (!deleted) {
        return res.status(500).json({ success: false, error: 'No se pudo eliminar el pago' });
      }

      return res.json({ 
        success: true, 
        message: 'Pago eliminado exitosamente' 
      });
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      
      // Manejar errores de foreign key
      if (error.code === '23503') {
        return res.status(400).json({ 
          success: false, 
          error: 'No se puede eliminar el pago porque tiene transacciones asociadas' 
        });
      }

      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new PaymentController();
