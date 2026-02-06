import cron from 'node-cron';
import AlertModel from '../models/Alert';
import ContractModel from '../models/Contract';
import PaymentModel from '../models/Payment';
import UnitModel from '../models/Unit';
import { executeQuery } from '../config/database';
import NotificationService from './NotificationService';
import SettingsRepository from '../repositories/SettingsRepository';
import whatsappService from './WhatsAppService';

class AlertService {
  private isRunning: boolean = false;
  private adminPhone: string = process.env.WHATSAPP_ADMIN_PHONE || '573006821133';

  /**
   * Iniciar el servicio de alertas automáticas
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️  El servicio de alertas ya está en ejecución');
      return;
    }

    console.log('🔔 Iniciando servicio de alertas automáticas...');

    // Ejecutar diariamente a las 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('🔍 Verificando condiciones para alertas...');
      await this.checkAllAlerts();
    });

    // Ejecutar cada hora para pagos vencidos
    cron.schedule('0 * * * *', async () => {
      await this.checkOverduePayments();
    });

    // 🔔 Ejecutar diariamente a las 9:00 AM para recordatorios de pago (3 días antes)
    cron.schedule('0 9 * * *', async () => {
      console.log('🔔 Enviando recordatorios de pago...');
      await this.sendPaymentReminders();
    });

    // 📊 Ejecutar el día 1 de cada mes a las 8:00 AM para resumen mensual
    cron.schedule('0 8 1 * *', async () => {
      console.log('📊 Generando resumen mensual...');
      await this.sendMonthlyReport();
    });

    this.isRunning = true;
    console.log('✅ Servicio de alertas iniciado correctamente');
  }

  /**
   * Verificar todas las condiciones de alerta
   */
  async checkAllAlerts(): Promise<void> {
    try {
      await Promise.all([
        this.checkExpiringContracts(),
        this.checkOverduePayments(),
        this.checkVacantUnits(),
        this.checkBuildingCapacity(),
        this.checkProlongedVacancy(),
      ]);
    } catch (error) {
      console.error('Error verificando alertas:', error);
    }
  }

  /**
   * Verificar contratos próximos a vencer
   */
  async checkExpiringContracts(): Promise<void> {
    try {
      // Obtener configuración de días
      const settingResult: any = await executeQuery(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'alert_contract_expiry_days'",
        []
      );
      const daysAhead = parseInt(settingResult[0]?.setting_value || '30');

      const expiringContracts = await ContractModel.findExpiring(daysAhead);

      // Obtener ID del tipo de alerta
      const alertTypeResult: any = await executeQuery(
        "SELECT id FROM alert_types WHERE name = 'Contrato por Vencer' LIMIT 1",
        []
      );
      const alertTypeId = alertTypeResult[0]?.id;

      if (!alertTypeId) return;

      for (const contract of expiringContracts) {
        // Verificar si ya existe una alerta para este contrato
        const existingAlert: any = await executeQuery(
          `SELECT id FROM alerts 
           WHERE contract_id = $1 AND alert_type_id = $2 AND is_resolved = FALSE
           LIMIT 1`,
          [contract.id, alertTypeId]
        );

        if (existingAlert.length === 0) {
          const alertId = await AlertModel.create({
            alert_type_id: alertTypeId,
            title: `Contrato próximo a vencer - ${(contract as any).building_name} ${(contract as any).unit_number}`,
            message: `El contrato de ${(contract as any).tenant_name} vence el ${new Date(contract.end_date).toLocaleDateString('es-CO')} (en ${(contract as any).days_until_expiry} días)`,
            priority: (contract as any).days_until_expiry <= 15 ? 'high' : 'medium',
            contract_id: contract.id,
            unit_id: contract.unit_id,
            metadata: {
              days_until_expiry: (contract as any).days_until_expiry,
              end_date: contract.end_date,
            },
          });

          // Enviar email si el arrendatario tiene correo
          if ((contract as any).tenant_email) {
            await AlertModel.sendEmailAlert(alertId, [(contract as any).tenant_email]);
          }
        }
      }

      console.log(`✅ Verificados ${expiringContracts.length} contratos próximos a vencer`);
    } catch (error) {
      console.error('Error verificando contratos por vencer:', error);
    }
  }

  /**
   * Verificar pagos vencidos
   */
  async checkOverduePayments(): Promise<void> {
    try {
      const overduePayments = await PaymentModel.getOverdue();

      // Obtener ID del tipo de alerta
      const alertTypeResult: any = await executeQuery(
        "SELECT id FROM alert_types WHERE name = 'Pago Vencido' LIMIT 1",
        []
      );
      const alertTypeId = alertTypeResult[0]?.id;

      if (!alertTypeId) return;

      for (const payment of overduePayments) {
        // Verificar si ya existe una alerta para este pago
        const existingAlert: any = await executeQuery(
          `SELECT id FROM alerts 
           WHERE payment_id = $1 AND alert_type_id = $2 AND is_resolved = FALSE
           LIMIT 1`,
          [(payment as any).payment_id, alertTypeId]
        );

        if (existingAlert.length === 0) {
          const priority = (payment as any).days_overdue > 7 ? 'critical' : 'high';

          const alertId = await AlertModel.create({
            alert_type_id: alertTypeId,
            title: `Pago vencido - ${(payment as any).building_name} ${(payment as any).unit_number}`,
            message: `Pago de ${(payment as any).tenant_name} vencido desde hace ${(payment as any).days_overdue} días. Saldo pendiente: $${(payment as any).balance.toLocaleString('es-CO')}`,
            priority,
            payment_id: (payment as any).payment_id,
            contract_id: (payment as any).contract_id,
            metadata: {
              days_overdue: (payment as any).days_overdue,
              balance: (payment as any).balance,
              due_date: (payment as any).due_date,
            },
          });

          // Enviar email
          if ((payment as any).tenant_email) {
            await AlertModel.sendEmailAlert(alertId, [(payment as any).tenant_email]);
          }
        }
      }

      console.log(`✅ Verificados ${overduePayments.length} pagos vencidos`);
    } catch (error) {
      console.error('Error verificando pagos vencidos:', error);
    }
  }

  /**
   * Verificar unidades desocupadas
   */
  async checkVacantUnits(): Promise<void> {
    try {
      const vacantUnits = await UnitModel.findVacant();

      // Obtener ID del tipo de alerta
      const alertTypeResult: any = await executeQuery(
        "SELECT id FROM alert_types WHERE name = 'Unidad Desocupada' LIMIT 1",
        []
      );
      const alertTypeId = alertTypeResult[0]?.id;

      if (!alertTypeId) return;

      for (const unit of vacantUnits) {
        // Verificar si ya existe una alerta reciente (últimos 7 días)
        const existingAlert: any = await executeQuery(
          `SELECT id FROM alerts 
           WHERE unit_id = $1 AND alert_type_id = $2 
           AND created_at > NOW() - INTERVAL '7 days'
           LIMIT 1`,
          [unit.id, alertTypeId]
        );

        if (existingAlert.length === 0) {
          await AlertModel.create({
            alert_type_id: alertTypeId,
            title: `Unidad desocupada - ${(unit as any).building_name} ${unit.unit_number}`,
            message: `La unidad ${unit.unit_number} está desocupada. Canon: $${unit.rental_price.toLocaleString('es-CO')}`,
            priority: 'medium',
            unit_id: unit.id,
            building_id: unit.building_id,
          });
        }
      }

      console.log(`✅ Verificadas ${vacantUnits.length} unidades desocupadas`);
    } catch (error) {
      console.error('Error verificando unidades desocupadas:', error);
    }
  }

  /**
   * Verificar capacidad máxima de edificios
   */
  async checkBuildingCapacity(): Promise<void> {
    try {
      const query = `
        SELECT b.id, b.name, b.max_capacity,
               COUNT(CASE WHEN u.is_occupied = TRUE THEN 1 END) as occupied_count
        FROM buildings b
        INNER JOIN units u ON b.id = u.building_id AND u.is_active = TRUE
        WHERE b.is_active = TRUE AND b.max_capacity IS NOT NULL
        GROUP BY b.id, b.name, b.max_capacity
        HAVING COUNT(CASE WHEN u.is_occupied = TRUE THEN 1 END) >= b.max_capacity
      `;

      const fullBuildings: any = await executeQuery(query);

      const alertTypeResult: any = await executeQuery(
        "SELECT id FROM alert_types WHERE name = 'Capacidad Máxima' LIMIT 1",
        []
      );
      const alertTypeId = alertTypeResult[0]?.id;

      if (!alertTypeId) return;

      for (const building of fullBuildings) {
        const existingAlert: any = await executeQuery(
          `SELECT id FROM alerts 
           WHERE building_id = $1 AND alert_type_id = $2 AND is_resolved = FALSE
           LIMIT 1`,
          [building.id, alertTypeId]
        );

        if (existingAlert.length === 0) {
          await AlertModel.create({
            alert_type_id: alertTypeId,
            title: `Capacidad máxima alcanzada - ${building.name}`,
            message: `El edificio ${building.name} ha alcanzado su capacidad máxima (${building.max_capacity} unidades ocupadas)`,
            priority: 'high',
            building_id: building.id,
            metadata: {
              max_capacity: building.max_capacity,
              occupied_count: building.occupied_count,
            },
          });
        }
      }

      console.log(`✅ Verificados edificios en capacidad máxima`);
    } catch (error) {
      console.error('Error verificando capacidad de edificios:', error);
    }
  }

  /**
   * Verificar unidades con desocupación prolongada
   */
  async checkProlongedVacancy(): Promise<void> {
    try {
      // Usar 15 días desde env o default
      const thresholdDays = parseInt(process.env.VACANT_UNIT_ALERT_DAYS || '15');

      const prolongedVacantUnits = await UnitModel.getVacantReport();
      const criticalUnits = prolongedVacantUnits.filter(
        (unit: any) => unit.days_vacant >= thresholdDays
      );

      const alertTypeResult: any = await executeQuery(
        "SELECT id FROM alert_types WHERE name = 'Unidad Desocupada Prolongada' LIMIT 1",
        []
      );
      const alertTypeId = alertTypeResult[0]?.id;

      if (!alertTypeId) return;

      for (const unit of criticalUnits) {
        const existingAlert: any = await executeQuery(
          `SELECT id FROM alerts 
           WHERE unit_id = $1 AND alert_type_id = $2 
           AND created_at > NOW() - INTERVAL '7 days'
           LIMIT 1`,
          [(unit as any).id, alertTypeId]
        );

        if (existingAlert.length === 0) {
          // Crear alerta en BD
          await AlertModel.create({
            alert_type_id: alertTypeId,
            title: `Unidad desocupada por tiempo prolongado - ${(unit as any).building_name} ${(unit as any).unit_number}`,
            message: `La unidad ${(unit as any).unit_number} lleva ${(unit as any).days_vacant} días desocupada`,
            priority: 'critical',
            unit_id: (unit as any).id,
            building_id: (unit as any).building_id,
            metadata: {
              days_vacant: (unit as any).days_vacant,
              last_occupied_date: (unit as any).last_occupied_date,
            },
          });

          // 📱 Enviar alerta por WhatsApp al administrador
          await this.sendVacantUnitWhatsAppAlert(unit);
        }
      }

      console.log(`✅ Verificadas ${criticalUnits.length} unidades con desocupación prolongada (>${thresholdDays} días)`);
    } catch (error) {
      console.error('Error verificando desocupación prolongada:', error);
    }
  }

  /**
   * 📱 Enviar alerta de unidad desocupada por WhatsApp
   */
  private async sendVacantUnitWhatsAppAlert(unit: any): Promise<void> {
    try {
      const message = `🏠 *ALERTA DE DESOCUPACIÓN*\n\n` +
        `📍 *Edificio:* ${unit.building_name}\n` +
        `🚪 *Unidad:* ${unit.unit_number}\n` +
        `📅 *Días desocupada:* ${unit.days_vacant} días\n` +
        `💰 *Canon mensual:* $${unit.rental_price?.toLocaleString('es-CO') || 'N/A'}\n\n` +
        `⚠️ Esta unidad lleva más de 15 días sin inquilino.\n` +
        `_Se recomienda revisar la disponibilidad y promocionarla._`;

      const sent = await whatsappService.sendMessage(this.adminPhone, message);
      
      if (sent) {
        console.log(`📱 Alerta de desocupación enviada por WhatsApp para unidad ${unit.unit_number}`);
      }
    } catch (error) {
      console.error('Error enviando alerta de desocupación por WhatsApp:', error);
    }
  }

  /**
   * 🔔 Enviar recordatorios de pago 3 días antes del vencimiento
   */
  async sendPaymentReminders(): Promise<void> {
    try {
      // Obtener configuración de días de anticipación
      const reminderDays = await SettingsRepository.getSetting('notify_payment_due_days') as number || 3;

      // Buscar pagos que vencen en X días
      const upcomingPayments: any[] = await executeQuery(`
        SELECT 
          p.id, p.amount_due, p.due_date, p.period_month, p.period_year,
          u.unit_number, b.name as building_name,
          t.email as tenant_email, CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
          (p.due_date - CURRENT_DATE) as days_until_due
        FROM payments p
        INNER JOIN contracts c ON p.contract_id = c.id
        INNER JOIN units u ON c.unit_id = u.id
        INNER JOIN buildings b ON u.building_id = b.id
        INNER JOIN tenants t ON c.tenant_id = t.id
        WHERE p.payment_status_id = (SELECT id FROM payment_statuses WHERE name = 'Pendiente' LIMIT 1)
          AND p.due_date = CURRENT_DATE + INTERVAL '${reminderDays} days'
          AND t.email IS NOT NULL
      `);

      for (const payment of upcomingPayments) {
        try {
          await NotificationService.sendPaymentReminder({
            tenantEmail: payment.tenant_email,
            tenantName: payment.tenant_name,
            amount: payment.amount_due,
            dueDate: payment.due_date,
            periodMonth: payment.period_month,
            periodYear: payment.period_year,
            unitNumber: payment.unit_number,
            buildingName: payment.building_name,
            daysUntilDue: payment.days_until_due,
          });
        } catch (error) {
          console.error(`Error enviando recordatorio a ${payment.tenant_email}:`, error);
        }
      }

      console.log(`✅ Enviados ${upcomingPayments.length} recordatorios de pago`);
    } catch (error) {
      console.error('Error enviando recordatorios de pago:', error);
    }
  }

  /**
   * 📊 Generar y enviar resumen mensual al administrador
   */
  async sendMonthlyReport(): Promise<void> {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const month = lastMonth.getMonth() + 1;
      const year = lastMonth.getFullYear();

      // Obtener email del administrador desde settings
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      
      if (!adminEmail) {
        console.warn('⚠️ No se ha configurado un email de administrador');
        return;
      }

      // Obtener estadísticas de pagos del mes pasado
      const stats: any[] = await executeQuery(`
        SELECT 
          COUNT(*) as total_payments,
          SUM(p.amount_due) as total_expected,
          SUM(p.amount_paid) as total_received,
          SUM(CASE WHEN p.amount_paid < p.amount_due THEN (p.amount_due - p.amount_paid) ELSE 0 END) as total_pending,
          SUM(CASE WHEN p.due_date < CURRENT_DATE AND p.amount_paid < p.amount_due 
              THEN (p.amount_due - p.amount_paid) ELSE 0 END) as total_overdue
        FROM payments p
        WHERE p.period_month = $1 AND p.period_year = $2
      `, [month, year]);

      const stat = stats[0];
      const collectionRate = stat.total_expected > 0 
        ? (stat.total_received / stat.total_expected) * 100 
        : 0;

      // Obtener estadísticas por edificio
      const buildingStats: any[] = await executeQuery(`
        SELECT 
          b.name as building_name,
          SUM(p.amount_due) as expected,
          SUM(p.amount_paid) as received,
          SUM(CASE WHEN p.amount_paid < p.amount_due THEN (p.amount_due - p.amount_paid) ELSE 0 END) as pending
        FROM payments p
        INNER JOIN contracts c ON p.contract_id = c.id
        INNER JOIN units u ON c.unit_id = u.id
        INNER JOIN buildings b ON u.building_id = b.id
        WHERE p.period_month = $1 AND p.period_year = $2
        GROUP BY b.id, b.name
        ORDER BY b.name
      `, [month, year]);

      // Obtener pagos vencidos
      const overduePayments: any[] = await executeQuery(`
        SELECT 
          CONCAT(t.first_name, ' ', t.last_name) as tenant_name,
          u.unit_number,
          b.name as building_name,
          (p.amount_due - p.amount_paid) as amount,
          (CURRENT_DATE - p.due_date) as days_overdue
        FROM payments p
        INNER JOIN contracts c ON p.contract_id = c.id
        INNER JOIN units u ON c.unit_id = u.id
        INNER JOIN buildings b ON u.building_id = b.id
        INNER JOIN tenants t ON c.tenant_id = t.id
        WHERE p.period_month = $1 
          AND p.period_year = $2 
          AND p.due_date < CURRENT_DATE
          AND p.amount_paid < p.amount_due
        ORDER BY days_overdue DESC
      `, [month, year]);

      // Enviar resumen
      await NotificationService.sendMonthlyPaymentSummary({
        adminEmail: adminEmail,
        month: month,
        year: year,
        totalExpected: parseFloat(stat.total_expected) || 0,
        totalReceived: parseFloat(stat.total_received) || 0,
        totalPending: parseFloat(stat.total_pending) || 0,
        totalOverdue: parseFloat(stat.total_overdue) || 0,
        collectionRate: collectionRate,
        paymentsByBuilding: buildingStats.map(b => ({
          buildingName: b.building_name,
          expected: parseFloat(b.expected) || 0,
          received: parseFloat(b.received) || 0,
          pending: parseFloat(b.pending) || 0,
        })),
        overduePayments: overduePayments.map(p => ({
          tenantName: p.tenant_name,
          unitNumber: p.unit_number,
          buildingName: p.building_name,
          amount: parseFloat(p.amount) || 0,
          daysOverdue: parseInt(p.days_overdue) || 0,
        })),
      });

      console.log(`✅ Resumen mensual enviado a ${adminEmail}`);
    } catch (error) {
      console.error('Error generando resumen mensual:', error);
    }
  }

  /**
   * 📱 Notificar pago registrado por WhatsApp al administrador
   */
  async notifyPaymentRegistered(paymentData: {
    tenantName: string;
    unitNumber: string;
    buildingName: string;
    amount: number;
    paymentMethod?: string;
    periodMonth: number;
    periodYear: number;
  }): Promise<void> {
    try {
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const monthName = monthNames[paymentData.periodMonth - 1] || paymentData.periodMonth;

      const message = `💵 *PAGO REGISTRADO*\n\n` +
        `👤 *Inquilino:* ${paymentData.tenantName}\n` +
        `📍 *Edificio:* ${paymentData.buildingName}\n` +
        `🚪 *Unidad:* ${paymentData.unitNumber}\n` +
        `💰 *Monto:* $${paymentData.amount.toLocaleString('es-CO')}\n` +
        `📅 *Periodo:* ${monthName} ${paymentData.periodYear}\n` +
        `💳 *Método:* ${paymentData.paymentMethod || 'No especificado'}\n` +
        `🕐 *Fecha:* ${new Date().toLocaleString('es-CO')}\n\n` +
        `✅ _Pago registrado exitosamente en el sistema._`;

      const sent = await whatsappService.sendMessage(this.adminPhone, message);
      
      if (sent) {
        console.log(`📱 Notificación de pago enviada por WhatsApp para ${paymentData.tenantName}`);
      }
    } catch (error) {
      console.error('Error enviando notificación de pago por WhatsApp:', error);
    }
  }

  /**
   * 📱 Enviar alerta de prueba por WhatsApp
   */
  async sendTestAlert(message?: string): Promise<boolean> {
    try {
      const testMessage = message || 
        `🧪 *MENSAJE DE PRUEBA*\n\n` +
        `✅ El sistema de alertas por WhatsApp está funcionando correctamente.\n\n` +
        `📱 Número configurado: ${this.adminPhone}\n` +
        `🕐 Fecha: ${new Date().toLocaleString('es-CO')}`;

      const sent = await whatsappService.sendMessage(this.adminPhone, testMessage);
      
      if (sent) {
        console.log(`📱 Mensaje de prueba enviado a ${this.adminPhone}`);
      }
      
      return sent;
    } catch (error) {
      console.error('Error enviando mensaje de prueba:', error);
      return false;
    }
  }

  /**
   * Ejecutar verificación inmediata (para testing)
   */
  async runNow(): Promise<void> {
    console.log('🔔 Ejecutando verificación de alertas...');
    await this.checkAllAlerts();
    console.log('✅ Verificación completada');
  }
}

export default new AlertService();
