import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Servicio de Notificaciones por Email
 * Maneja el envío de emails con templates HTML profesionales
 */
class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Template base HTML para emails
   */
  private getBaseTemplate(title: string, content: string, footerText?: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .success-box {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table th, table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        table th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .highlight {
            color: #667eea;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Sistema de Gestión Inmobiliaria</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            ${footerText || 'Este es un mensaje automático del Sistema de Gestión Inmobiliaria. Por favor no responda a este correo.'}
            <br><br>
            © ${new Date().getFullYear()} Sistema de Gestión Inmobiliaria. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * 1. Notificar pago registrado al inquilino
   */
  async notifyPaymentRegistered(data: {
    tenantEmail: string;
    tenantName: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    periodMonth: number;
    periodYear: number;
    unitNumber: string;
    buildingName: string;
    referenceNumber?: string;
  }): Promise<void> {
    const content = `
      <h2>✅ Pago Registrado Exitosamente</h2>
      <p>Estimado/a <strong>${data.tenantName}</strong>,</p>
      <p>Le confirmamos que hemos registrado su pago correspondiente al período de <strong>${this.getMonthName(data.periodMonth)} ${data.periodYear}</strong>.</p>
      
      <div class="success-box">
        <h3>Detalles del Pago:</h3>
        <table>
          <tr>
            <th>Concepto</th>
            <td>Arriendo ${data.buildingName} - Unidad ${data.unitNumber}</td>
          </tr>
          <tr>
            <th>Período</th>
            <td>${this.getMonthName(data.periodMonth)} ${data.periodYear}</td>
          </tr>
          <tr>
            <th>Monto</th>
            <td class="highlight">$${this.formatMoney(data.amount)}</td>
          </tr>
          <tr>
            <th>Método de Pago</th>
            <td>${data.paymentMethod}</td>
          </tr>
          <tr>
            <th>Fecha de Pago</th>
            <td>${new Date(data.paymentDate).toLocaleDateString('es-CO')}</td>
          </tr>
          ${data.referenceNumber ? `<tr><th>Referencia</th><td>${data.referenceNumber}</td></tr>` : ''}
        </table>
      </div>

      <p>Su recibo de pago ha sido generado y está disponible en el sistema.</p>
      <p><strong>Gracias por su puntualidad en los pagos.</strong></p>
      <p>Cualquier consulta, no dude en contactarnos.</p>
    `;

    await this.sendEmail(
      data.tenantEmail,
      `✅ Confirmación de Pago - ${this.getMonthName(data.periodMonth)} ${data.periodYear}`,
      this.getBaseTemplate('Confirmación de Pago', content)
    );
  }

  /**
   * 2. Notificar al admin cuando un inquilino sube comprobante
   */
  async notifyPaymentProofUploaded(data: {
    adminEmail: string;
    tenantName: string;
    amount: number;
    periodMonth: number;
    periodYear: number;
    unitNumber: string;
    buildingName: string;
    uploadDate: string;
    fileName: string;
  }): Promise<void> {
    const content = `
      <h2>📎 Nuevo Comprobante de Pago Subido</h2>
      <p>Se ha recibido un comprobante de pago pendiente de verificación.</p>
      
      <div class="info-box">
        <h3>Detalles:</h3>
        <table>
          <tr>
            <th>Inquilino</th>
            <td><strong>${data.tenantName}</strong></td>
          </tr>
          <tr>
            <th>Propiedad</th>
            <td>${data.buildingName} - Unidad ${data.unitNumber}</td>
          </tr>
          <tr>
            <th>Período</th>
            <td>${this.getMonthName(data.periodMonth)} ${data.periodYear}</td>
          </tr>
          <tr>
            <th>Monto Declarado</th>
            <td class="highlight">$${this.formatMoney(data.amount)}</td>
          </tr>
          <tr>
            <th>Archivo</th>
            <td>${data.fileName}</td>
          </tr>
          <tr>
            <th>Fecha de Carga</th>
            <td>${new Date(data.uploadDate).toLocaleString('es-CO')}</td>
          </tr>
        </table>
      </div>

      <p><strong>Acción Requerida:</strong> Por favor, revise y valide el comprobante en el sistema.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3010'}/admin/payments" class="button">Ver Comprobante</a>
    `;

    await this.sendEmail(
      data.adminEmail,
      `📎 Nuevo Comprobante - ${data.tenantName}`,
      this.getBaseTemplate('Comprobante de Pago Recibido', content)
    );
  }

  /**
   * 3. Recordatorio de pago 3 días antes del vencimiento
   */
  async sendPaymentReminder(data: {
    tenantEmail: string;
    tenantName: string;
    amount: number;
    dueDate: string;
    periodMonth: number;
    periodYear: number;
    unitNumber: string;
    buildingName: string;
    daysUntilDue: number;
  }): Promise<void> {
    const content = `
      <h2>⏰ Recordatorio de Pago Próximo a Vencer</h2>
      <p>Estimado/a <strong>${data.tenantName}</strong>,</p>
      <p>Le recordamos amablemente que su pago de arriendo vence en <strong class="highlight">${data.daysUntilDue} días</strong>.</p>
      
      <div class="warning-box">
        <h3>Información del Pago:</h3>
        <table>
          <tr>
            <th>Propiedad</th>
            <td>${data.buildingName} - Unidad ${data.unitNumber}</td>
          </tr>
          <tr>
            <th>Período</th>
            <td>${this.getMonthName(data.periodMonth)} ${data.periodYear}</td>
          </tr>
          <tr>
            <th>Monto a Pagar</th>
            <td class="highlight">$${this.formatMoney(data.amount)}</td>
          </tr>
          <tr>
            <th>Fecha de Vencimiento</th>
            <td><strong>${new Date(data.dueDate).toLocaleDateString('es-CO')}</strong></td>
          </tr>
        </table>
      </div>

      <h3>Métodos de Pago Disponibles:</h3>
      <ul>
        <li>💳 Transferencia Bancaria</li>
        <li>💵 Efectivo en oficina</li>
        <li>📧 Consignación</li>
      </ul>

      <p><strong>Importante:</strong> Evite cargos por mora realizando su pago antes de la fecha de vencimiento.</p>
      <p>Si ya realizó el pago, por favor ignore este mensaje.</p>
    `;

    await this.sendEmail(
      data.tenantEmail,
      `⏰ Recordatorio de Pago - Vence en ${data.daysUntilDue} días`,
      this.getBaseTemplate('Recordatorio de Pago', content)
    );
  }

  /**
   * 4. Email de bienvenida al crear nuevo contrato
   */
  async sendContractWelcome(data: {
    tenantEmail: string;
    tenantName: string;
    unitNumber: string;
    buildingName: string;
    buildingAddress: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    paymentDay: number;
    depositAmount: number;
  }): Promise<void> {
    const content = `
      <h2>🎉 ¡Bienvenido a su Nuevo Hogar!</h2>
      <p>Estimado/a <strong>${data.tenantName}</strong>,</p>
      <p>Nos complace confirmar que su contrato de arrendamiento ha sido registrado exitosamente.</p>
      
      <div class="success-box">
        <h3>Detalles de su Contrato:</h3>
        <table>
          <tr>
            <th>Propiedad</th>
            <td><strong>${data.buildingName} - Unidad ${data.unitNumber}</strong></td>
          </tr>
          <tr>
            <th>Dirección</th>
            <td>${data.buildingAddress}</td>
          </tr>
          <tr>
            <th>Fecha de Inicio</th>
            <td>${new Date(data.startDate).toLocaleDateString('es-CO')}</td>
          </tr>
          <tr>
            <th>Fecha de Finalización</th>
            <td>${new Date(data.endDate).toLocaleDateString('es-CO')}</td>
          </tr>
          <tr>
            <th>Renta Mensual</th>
            <td class="highlight">$${this.formatMoney(data.monthlyRent)}</td>
          </tr>
          <tr>
            <th>Día de Pago</th>
            <td>${data.paymentDay} de cada mes</td>
          </tr>
          <tr>
            <th>Depósito</th>
            <td>$${this.formatMoney(data.depositAmount)}</td>
          </tr>
        </table>
      </div>

      <h3>Información Importante:</h3>
      <div class="info-box">
        <ul>
          <li>📅 Su primer pago vence el día <strong>${data.paymentDay}</strong> del próximo mes</li>
          <li>💰 Recibirá recordatorios de pago 3 días antes del vencimiento</li>
          <li>📄 Puede consultar su estado de cuenta en cualquier momento</li>
          <li>🔑 Las llaves estarán disponibles a partir de la fecha de inicio del contrato</li>
        </ul>
      </div>

      <p>Estamos aquí para ayudarle. Ante cualquier duda, no dude en contactarnos.</p>
      <p><strong>¡Le deseamos una feliz estadía en su nuevo hogar!</strong></p>
    `;

    await this.sendEmail(
      data.tenantEmail,
      `🎉 Bienvenido - Contrato de Arrendamiento Confirmado`,
      this.getBaseTemplate('Bienvenida - Nuevo Contrato', content)
    );
  }

  /**
   * 5. Email al finalizar contrato
   */
  async sendContractFinished(data: {
    tenantEmail: string;
    tenantName: string;
    unitNumber: string;
    buildingName: string;
    endDate: string;
    depositAmount: number;
    hasOutstandingBalance: boolean;
    outstandingBalance?: number;
  }): Promise<void> {
    const content = `
      <h2>📋 Finalización de Contrato de Arrendamiento</h2>
      <p>Estimado/a <strong>${data.tenantName}</strong>,</p>
      <p>Le confirmamos que su contrato de arrendamiento ha finalizado según lo acordado.</p>
      
      <div class="info-box">
        <h3>Detalles del Contrato Finalizado:</h3>
        <table>
          <tr>
            <th>Propiedad</th>
            <td>${data.buildingName} - Unidad ${data.unitNumber}</td>
          </tr>
          <tr>
            <th>Fecha de Finalización</th>
            <td>${new Date(data.endDate).toLocaleDateString('es-CO')}</td>
          </tr>
          <tr>
            <th>Depósito</th>
            <td>$${this.formatMoney(data.depositAmount)}</td>
          </tr>
        </table>
      </div>

      ${data.hasOutstandingBalance ? `
        <div class="warning-box">
          <h3>⚠️ Saldo Pendiente</h3>
          <p>Se ha detectado un saldo pendiente de <strong class="highlight">$${this.formatMoney(data.outstandingBalance!)}</strong> que debe ser liquidado antes de la devolución del depósito.</p>
        </div>
      ` : `
        <div class="success-box">
          <h3>✅ Estado de Cuenta Saldado</h3>
          <p>No presenta saldos pendientes. Su depósito será procesado para devolución.</p>
        </div>
      `}

      <h3>Próximos Pasos:</h3>
      <ul>
        <li>🔑 Entrega de llaves en la administración</li>
        <li>🧹 Inspección final del inmueble</li>
        <li>💰 Proceso de devolución de depósito (5-10 días hábiles)</li>
        ${data.hasOutstandingBalance ? '<li>⚠️ Liquidación de saldo pendiente</li>' : ''}
      </ul>

      <p>Agradecemos su confianza y permanencia con nosotros.</p>
      <p><strong>Esperamos haber cumplido con sus expectativas.</strong></p>
    `;

    await this.sendEmail(
      data.tenantEmail,
      `📋 Finalización de Contrato - ${data.buildingName}`,
      this.getBaseTemplate('Finalización de Contrato', content)
    );
  }

  /**
   * 6. Resumen mensual de pagos al admin
   */
  async sendMonthlyPaymentSummary(data: {
    adminEmail: string;
    month: number;
    year: number;
    totalExpected: number;
    totalReceived: number;
    totalPending: number;
    totalOverdue: number;
    collectionRate: number;
    paymentsByBuilding: Array<{
      buildingName: string;
      expected: number;
      received: number;
      pending: number;
    }>;
    overduePayments: Array<{
      tenantName: string;
      unitNumber: string;
      buildingName: string;
      amount: number;
      daysOverdue: number;
    }>;
  }): Promise<void> {
    const buildingRows = data.paymentsByBuilding.map(b => `
      <tr>
        <td>${b.buildingName}</td>
        <td>$${this.formatMoney(b.expected)}</td>
        <td>$${this.formatMoney(b.received)}</td>
        <td>${b.pending > 0 ? `<span style="color: #dc3545;">$${this.formatMoney(b.pending)}</span>` : '-'}</td>
      </tr>
    `).join('');

    const overdueRows = data.overduePayments.slice(0, 10).map(p => `
      <tr>
        <td>${p.tenantName}</td>
        <td>${p.buildingName} - ${p.unitNumber}</td>
        <td>$${this.formatMoney(p.amount)}</td>
        <td><span style="color: #dc3545; font-weight: bold;">${p.daysOverdue} días</span></td>
      </tr>
    `).join('');

    const content = `
      <h2>📊 Resumen Mensual de Pagos - ${this.getMonthName(data.month)} ${data.year}</h2>
      
      <div class="info-box">
        <h3>Resumen General:</h3>
        <table>
          <tr>
            <th>Total Esperado</th>
            <td><strong>$${this.formatMoney(data.totalExpected)}</strong></td>
          </tr>
          <tr>
            <th>Total Recaudado</th>
            <td class="highlight">$${this.formatMoney(data.totalReceived)}</td>
          </tr>
          <tr>
            <th>Pendientes</th>
            <td style="color: #ffc107;">$${this.formatMoney(data.totalPending)}</td>
          </tr>
          <tr>
            <th>Vencidos</th>
            <td style="color: #dc3545;">$${this.formatMoney(data.totalOverdue)}</td>
          </tr>
          <tr>
            <th>Tasa de Recaudo</th>
            <td><strong style="font-size: 18px; color: ${data.collectionRate >= 90 ? '#28a745' : data.collectionRate >= 70 ? '#ffc107' : '#dc3545'};">${data.collectionRate.toFixed(1)}%</strong></td>
          </tr>
        </table>
      </div>

      <h3>Recaudo por Edificio:</h3>
      <table>
        <thead>
          <tr>
            <th>Edificio</th>
            <th>Esperado</th>
            <th>Recaudado</th>
            <th>Pendiente</th>
          </tr>
        </thead>
        <tbody>
          ${buildingRows}
        </tbody>
      </table>

      ${data.overduePayments.length > 0 ? `
        <h3>⚠️ Pagos Vencidos (Top 10):</h3>
        <table>
          <thead>
            <tr>
              <th>Inquilino</th>
              <th>Propiedad</th>
              <th>Monto</th>
              <th>Días de Mora</th>
            </tr>
          </thead>
          <tbody>
            ${overdueRows}
          </tbody>
        </table>
        ${data.overduePayments.length > 10 ? `<p><em>Y ${data.overduePayments.length - 10} pagos vencidos más...</em></p>` : ''}
      ` : '<div class="success-box"><p>✅ No hay pagos vencidos este mes</p></div>'}

      <a href="${process.env.FRONTEND_URL || 'http://localhost:3010'}/admin/reports" class="button">Ver Reporte Completo</a>
    `;

    await this.sendEmail(
      data.adminEmail,
      `📊 Resumen Mensual - ${this.getMonthName(data.month)} ${data.year}`,
      this.getBaseTemplate(`Resumen de Pagos - ${this.getMonthName(data.month)}`, content)
    );
  }

  /**
   * Enviar email genérico
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Sistema Inmobiliario'} <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado a ${to}: ${subject}`);
    } catch (error) {
      console.error(`❌ Error enviando email a ${to}:`, error);
      throw error;
    }
  }

  /**
   * Obtener nombre del mes en español
   */
  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || 'Desconocido';
  }

  /**
   * Formatear dinero en COP
   */
  private formatMoney(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Verificar conexión del servicio de email
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Conexión al servidor de email verificada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando conexión de email:', error);
      return false;
    }
  }
}

export default new NotificationService();
