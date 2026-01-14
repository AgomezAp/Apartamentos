import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Servicio de Notificaciones por Email
 * Maneja el envío de emails con templates HTML profesionales
 * Colores Corporativos: #141414 (Negro) y #FFD600 (Amarillo)
 */
class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Template base HTML para emails con colores corporativos
   */
  private getBaseTemplate(
    title: string,
    content: string,
    footerText?: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* =====================================================
           RESET Y BASE
           ===================================================== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Fira Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #141414;
            background-color: #f4f4f5;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }

        /* =====================================================
           CONTENEDOR PRINCIPAL
           ===================================================== */
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(20, 20, 20, 0.15);
        }

        /* =====================================================
           HEADER - COLORES CORPORATIVOS
           ===================================================== */
        .header {
            background: linear-gradient(135deg, #141414 0%, #2a2a2a 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
            position: relative;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: #FFD600;
        }

        .header h1 {
            margin: 0;
            font-family: 'Century Gothic', 'CenturyGothic', 'AppleGothic', sans-serif;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }

        .header .logo-icon {
            font-size: 32px;
            margin-bottom: 10px;
            display: block;
        }

        .header .subtitle {
            font-size: 14px;
            color: #a1a1aa;
            margin-top: 8px;
        }

        /* =====================================================
           CONTENIDO PRINCIPAL
           ===================================================== */
        .content {
            padding: 32px;
        }

        .content h2 {
            font-family: 'Century Gothic', 'CenturyGothic', 'AppleGothic', sans-serif;
            font-size: 22px;
            color: #141414;
            margin-bottom: 16px;
            font-weight: 700;
        }

        .content h3 {
            font-family: 'Century Gothic', 'CenturyGothic', 'AppleGothic', sans-serif;
            font-size: 16px;
            color: #141414;
            margin: 24px 0 12px 0;
            font-weight: 600;
        }

        .content p {
            margin-bottom: 16px;
            color: #3f3f46;
            font-size: 15px;
        }

        .content ul {
            margin: 16px 0;
            padding-left: 20px;
        }

        .content li {
            margin-bottom: 10px;
            color: #3f3f46;
            font-size: 15px;
        }

        /* =====================================================
           BOTÓN PRINCIPAL - ESTILO CORPORATIVO
           ===================================================== */
        .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #FFD600;
            color: #141414;
            text-decoration: none;
            border-radius: 10px;
            margin: 24px 0;
            font-weight: 700;
            font-size: 15px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 214, 0, 0.3);
        }

        .button:hover {
            background-color: #ccab00;
            box-shadow: 0 6px 20px rgba(255, 214, 0, 0.4);
        }

        /* Botón secundario (oscuro) */
        .button-dark {
            background-color: #141414;
            color: #FFD600;
            box-shadow: 0 4px 15px rgba(20, 20, 20, 0.3);
        }

        .button-dark:hover {
            background-color: #2a2a2a;
        }

        /* =====================================================
           CAJAS DE INFORMACIÓN
           ===================================================== */
        .info-box {
            background-color: #fafafa;
            border-left: 4px solid #FFD600;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
        }

        .info-box h3 {
            color: #141414;
            margin-top: 0;
            margin-bottom: 16px;
        }

        /* Caja de advertencia */
        .warning-box {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
        }

        .warning-box h3 {
            color: #92400e;
            margin-top: 0;
        }

        /* Caja de éxito */
        .success-box {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
        }

        .success-box h3 {
            color: #065f46;
            margin-top: 0;
        }

        /* Caja de error */
        .error-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 10px 10px 0;
        }

        .error-box h3 {
            color: #991b1b;
            margin-top: 0;
        }

        /* =====================================================
           TABLAS
           ===================================================== */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 14px;
        }

        table th {
            background-color: #141414;
            color: #ffffff;
            padding: 14px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        table th:first-child {
            border-radius: 8px 0 0 0;
        }

        table th:last-child {
            border-radius: 0 8px 0 0;
        }

        table td {
            padding: 14px 16px;
            text-align: left;
            border-bottom: 1px solid #e4e4e7;
            color: #3f3f46;
        }

        table tbody tr:hover {
            background-color: rgba(255, 214, 0, 0.05);
        }

        table tbody tr:last-child td {
            border-bottom: none;
        }

        table tbody tr:last-child td:first-child {
            border-radius: 0 0 0 8px;
        }

        table tbody tr:last-child td:last-child {
            border-radius: 0 0 8px 0;
        }

        /* Tabla simple (dentro de cajas) */
        .info-box table,
        .success-box table,
        .warning-box table,
        .error-box table {
            margin: 0;
            background: transparent;
        }

        .info-box table th,
        .success-box table th,
        .warning-box table th,
        .error-box table th {
            background-color: transparent;
            color: #141414;
            padding: 10px 12px 10px 0;
            border-bottom: 1px solid rgba(20, 20, 20, 0.1);
            width: 40%;
        }

        .info-box table td,
        .success-box table td,
        .warning-box table td,
        .error-box table td {
            padding: 10px 0;
            border-bottom: 1px solid rgba(20, 20, 20, 0.1);
        }

        /* =====================================================
           HIGHLIGHT Y BADGES
           ===================================================== */
        .highlight {
            color: #141414;
            font-weight: 700;
            background: linear-gradient(transparent 60%, rgba(255, 214, 0, 0.4) 60%);
            padding: 0 4px;
        }

        .highlight-yellow {
            color: #92400e;
            font-weight: 700;
        }

        .highlight-success {
            color: #065f46;
            font-weight: 700;
        }

        .highlight-error {
            color: #991b1b;
            font-weight: 700;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-success {
            background-color: #d1fae5;
            color: #065f46;
        }

        .badge-warning {
            background-color: #fef3c7;
            color: #92400e;
        }

        .badge-error {
            background-color: #fee2e2;
            color: #991b1b;
        }

        .badge-info {
            background-color: #FFD600;
            color: #141414;
        }

        /* =====================================================
           FOOTER
           ===================================================== */
        .footer {
            background-color: #141414;
            padding: 24px 32px;
            text-align: center;
            font-size: 13px;
            color: #a1a1aa;
        }

        .footer a {
            color: #FFD600;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        .footer .divider {
            height: 1px;
            background: #3f3f46;
            margin: 16px 0;
        }

        .footer .copyright {
            font-size: 12px;
            color: #71717a;
        }

        .footer .social-links {
            margin: 16px 0;
        }

        .footer .social-links a {
            margin: 0 8px;
            font-size: 18px;
        }

        /* =====================================================
           DIVISORES
           ===================================================== */
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e4e4e7, transparent);
            margin: 24px 0;
        }

        .divider-yellow {
            height: 3px;
            background: linear-gradient(90deg, transparent, #FFD600, transparent);
            margin: 24px 0;
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }

            .header {
                padding: 24px 20px;
            }

            .header h1 {
                font-size: 20px;
            }

            .content {
                padding: 24px 20px;
            }

            .content h2 {
                font-size: 20px;
            }

            .button {
                display: block;
                text-align: center;
            }

            table {
                font-size: 13px;
            }

            table th,
            table td {
                padding: 10px 12px;
            }

            .footer {
                padding: 20px;
            }
        }

        /* =====================================================
           ANIMACIONES (para clientes que soporten)
           ===================================================== */
        @media (prefers-reduced-motion: no-preference) {
            .button {
                transition: all 0.3s ease;
            }

            .button:hover {
                transform: translateY(-2px);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo-icon">🏢</span>
            <h1>Sistema de Gestión Inmobiliaria</h1>
            <p class="subtitle">Administración Profesional de Propiedades</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            ${
              footerText ||
              "Este es un mensaje automático del Sistema de Gestión Inmobiliaria.<br>Por favor no responda a este correo."
            }
            <div class="divider"></div>
            <p class="copyright">
                © ${new Date().getFullYear()} Sistema de Gestión Inmobiliaria.<br>
                Todos los derechos reservados.
            </p>
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
      <p>Le confirmamos que hemos registrado su pago correspondiente al período de <span class="highlight">${this.getMonthName(
        data.periodMonth
      )} ${data.periodYear}</span>.</p>
      
      <div class="success-box">
        <h3>📄 Detalles del Pago</h3>
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
            <td><span class="highlight">$${this.formatMoney(
              data.amount
            )}</span></td>
          </tr>
          <tr>
            <th>Método de Pago</th>
            <td>${data.paymentMethod}</td>
          </tr>
          <tr>
            <th>Fecha de Pago</th>
            <td>${new Date(data.paymentDate).toLocaleDateString("es-CO")}</td>
          </tr>
          ${
            data.referenceNumber
              ? `<tr><th>Referencia</th><td><code>${data.referenceNumber}</code></td></tr>`
              : ""
          }
        </table>
      </div>

      <p>Su recibo de pago ha sido generado y está disponible en el sistema.</p>
      
      <div class="divider-yellow"></div>
      
      <p><strong>¡Gracias por su puntualidad en los pagos!</strong></p>
      <p>Cualquier consulta, no dude en contactarnos.</p>
    `;

    await this.sendEmail(
      data.tenantEmail,
      `✅ Confirmación de Pago - ${this.getMonthName(data.periodMonth)} ${
        data.periodYear
      }`,
      this.getBaseTemplate("Confirmación de Pago", content)
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
        <h3>📋 Detalles del Comprobante</h3>
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
            <td><span class="highlight">$${this.formatMoney(
              data.amount
            )}</span></td>
          </tr>
          <tr>
            <th>Archivo</th>
            <td>📄 ${data.fileName}</td>
          </tr>
          <tr>
            <th>Fecha de Carga</th>
            <td>${new Date(data.uploadDate).toLocaleString("es-CO")}</td>
          </tr>
        </table>
      </div>

      <div class="warning-box">
        <h3>⚡ Acción Requerida</h3>
        <p>Por favor, revise y valide el comprobante en el sistema lo antes posible.</p>
      </div>

      <center>
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:4200"
        }/admin/payments" class="button">
          Ver Comprobante
        </a>
      </center>
    `;

    await this.sendEmail(
      data.adminEmail,
      `📎 Nuevo Comprobante - ${data.tenantName}`,
      this.getBaseTemplate("Comprobante de Pago Recibido", content)
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
      <p>Le recordamos amablemente que su pago de arriendo vence en <span class="badge badge-warning">${
        data.daysUntilDue
      } días</span></p>
      
      <div class="warning-box">
        <h3>💰 Información del Pago</h3>
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
            <td><span class="highlight">$${this.formatMoney(
              data.amount
            )}</span></td>
          </tr>
          <tr>
            <th>Fecha de Vencimiento</th>
            <td><strong style="color: #92400e;">${new Date(
              data.dueDate
            ).toLocaleDateString("es-CO")}</strong></td>
          </tr>
        </table>
      </div>

      <h3>💳 Métodos de Pago Disponibles</h3>
      <ul>
        <li>💳 Transferencia Bancaria</li>
        <li>💵 Efectivo en oficina</li>
        <li>🏦 Consignación bancaria</li>
        <li>📱 Pago en línea</li>
      </ul>

      <div class="info-box">
        <p><strong>💡 Importante:</strong> Evite cargos por mora realizando su pago antes de la fecha de vencimiento.</p>
      </div>

      <p style="color: #71717a; font-size: 13px;">Si ya realizó el pago, por favor ignore este mensaje.</p>
    `;

    await this.sendEmail(
      data.tenantEmail,
      `⏰ Recordatorio de Pago - Vence en ${data.daysUntilDue} días`,
      this.getBaseTemplate("Recordatorio de Pago", content)
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
        <h3>📋 Detalles de su Contrato</h3>
        <table>
          <tr>
            <th>Propiedad</th>
            <td><strong>${data.buildingName} - Unidad ${
      data.unitNumber
    }</strong></td>
          </tr>
          <tr>
            <th>Dirección</th>
            <td>📍 ${data.buildingAddress}</td>
          </tr>
          <tr>
            <th>Fecha de Inicio</th>
            <td>${new Date(data.startDate).toLocaleDateString("es-CO")}</td>
          </tr>
          <tr>
            <th>Fecha de Finalización</th>
            <td>${new Date(data.endDate).toLocaleDateString("es-CO")}</td>
          </tr>
          <tr>
            <th>Renta Mensual</th>
            <td><span class="highlight">$${this.formatMoney(
              data.monthlyRent
            )}</span></td>
          </tr>
          <tr>
            <th>Día de Pago</th>
            <td><span class="badge badge-info">${
              data.paymentDay
            } de cada mes</span></td>
          </tr>
          <tr>
            <th>Depósito</th>
            <td>$${this.formatMoney(data.depositAmount)}</td>
          </tr>
        </table>
      </div>

      <h3>📌 Información Importante</h3>
      <div class="info-box">
        <ul style="margin: 0; padding-left: 20px;">
          <li>📅 Su primer pago vence el día <strong>${
            data.paymentDay
          }</strong> del próximo mes</li>
          <li>🔑 Las llaves estarán disponibles a partir de la fecha de inicio del contrato</li>
        </ul>
      </div>

      <div class="divider-yellow"></div>

      <p>Estamos aquí para ayudarle. Ante cualquier duda, no dude en contactarnos.</p>
      <p><strong>¡Le deseamos una feliz estadía en su nuevo hogar! 🏠</strong></p>

    `;

    await this.sendEmail(
      data.tenantEmail,
      `🎉 Bienvenido - Contrato de Arrendamiento Confirmado`,
      this.getBaseTemplate("Bienvenida - Nuevo Contrato", content)
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
        <h3>📄 Detalles del Contrato Finalizado</h3>
        <table>
          <tr>
            <th>Propiedad</th>
            <td>${data.buildingName} - Unidad ${data.unitNumber}</td>
          </tr>
          <tr>
            <th>Fecha de Finalización</th>
            <td>${new Date(data.endDate).toLocaleDateString("es-CO")}</td>
          </tr>
          <tr>
            <th>Depósito</th>
            <td>$${this.formatMoney(data.depositAmount)}</td>
          </tr>
        </table>
      </div>

      ${
        data.hasOutstandingBalance
          ? `
        <div class="error-box">
          <h3>⚠️ Saldo Pendiente</h3>
          <p>Se ha detectado un saldo pendiente de <strong class="highlight-error">$${this.formatMoney(
            data.outstandingBalance!
          )}</strong> que debe ser liquidado antes de la devolución del depósito.</p>
        </div>
      `
          : `
        <div class="success-box">
          <h3>✅ Estado de Cuenta Saldado</h3>
          <p>No presenta saldos pendientes. Su depósito será procesado para devolución.</p>
        </div>
      `
      }

      <h3>📋 Próximos Pasos</h3>
      <ul>
        <li>🔑 Entrega de llaves en la administración</li>
        <li>🧹 Inspección final del inmueble</li>
        <li>💰 Proceso de devolución de depósito (5-10 días hábiles)</li>
        ${
          data.hasOutstandingBalance
            ? "<li>⚠️ Liquidación de saldo pendiente</li>"
            : ""
        }
      </ul>

      <div class="divider-yellow"></div>

      <p>Agradecemos su confianza y permanencia con nosotros.</p>
      <p><strong>Esperamos haber cumplido con sus expectativas. ¡Éxitos!</strong></p>
    `;

    await this.sendEmail(
      data.tenantEmail,
      `📋 Finalización de Contrato - ${data.buildingName}`,
      this.getBaseTemplate("Finalización de Contrato", content)
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
    const buildingRows = data.paymentsByBuilding
      .map(
        (b) => `
      <tr>
        <td><strong>${b.buildingName}</strong></td>
        <td>$${this.formatMoney(b.expected)}</td>
        <td style="color: #065f46;">$${this.formatMoney(b.received)}</td>
        <td>${
          b.pending > 0
            ? `<span style="color: #991b1b;">$${this.formatMoney(
                b.pending
              )}</span>`
            : '<span style="color: #065f46;">-</span>'
        }</td>
      </tr>
    `
      )
      .join("");

    const overdueRows = data.overduePayments
      .slice(0, 10)
      .map(
        (p) => `
      <tr>
        <td>${p.tenantName}</td>
        <td>${p.buildingName} - ${p.unitNumber}</td>
        <td>$${this.formatMoney(p.amount)}</td>
        <td><span class="badge badge-error">${p.daysOverdue} días</span></td>
      </tr>
    `
      )
      .join("");
    const rateBadge =
      data.collectionRate >= 90
        ? "badge-success"
        : data.collectionRate >= 70
        ? "badge-warning"
        : "badge-error";

    const content = `
      <h2>📊 Resumen Mensual de Pagos</h2>
      <p style="font-size: 18px; margin-bottom: 24px;">
        <span class="badge badge-info">${this.getMonthName(data.month)} ${
      data.year
    }</span>
      </p>
      
      <div class="info-box">
        <h3>📈 Resumen General</h3>
        <table>
          <tr>
            <th>Total Esperado</th>
            <td><strong>$${this.formatMoney(data.totalExpected)}</strong></td>
          </tr>
          <tr>
            <th>Total Recaudado</th>
            <td><span class="highlight-success">$${this.formatMoney(
              data.totalReceived
            )}</span></td>
          </tr>
          <tr>
            <th>Pendientes</th>
            <td style="color: #92400e;">$${this.formatMoney(
              data.totalPending
            )}</td>
          </tr>
          <tr>
            <th>Vencidos</th>
            <td style="color: #991b1b;">$${this.formatMoney(
              data.totalOverdue
            )}</td>
          </tr>
          <tr>
            <th>Tasa de Recaudo</th>
            <td>
              <span class="badge ${rateBadge}" style="font-size: 16px; padding: 6px 16px;">
                ${data.collectionRate.toFixed(1)}%
              </span>
            </td>
          </tr>
        </table>
      </div>

      <h3>🏢 Recaudo por Edificio</h3>
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

      ${
        data.overduePayments.length > 0
          ? `
        <div class="warning-box">
          <h3>⚠️ Pagos Vencidos (Top 10)</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Inquilino</th>
              <th>Propiedad</th>
              <th>Monto</th>
              <th>Mora</th>
            </tr>
          </thead>
          <tbody>
            ${overdueRows}
          </tbody>
        </table>
        ${
          data.overduePayments.length > 10
            ? `<p style="color: #71717a; font-size: 13px;"><em>Y ${
                data.overduePayments.length - 10
              } pagos vencidos más...</em></p>`
            : ""
        }
      `
          : `
        <div class="success-box">
          <h3>✅ Excelente</h3>
          <p>No hay pagos vencidos este mes. ¡Felicitaciones!</p>
        </div>
      `
      }

      <center>
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:4200"
        }/admin/reports" class="button">
          Ver Reporte Completo
        </a>
      </center>
    `;

    await this.sendEmail(
      data.adminEmail,
      `📊 Resumen Mensual - ${this.getMonthName(data.month)} ${data.year}`,
      this.getBaseTemplate(
        `Resumen de Pagos - ${this.getMonthName(data.month)}`,
        content
      )
    );
  }

  /**
   * Enviar email genérico
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || "Sistema Inmobiliario"} <${
          process.env.EMAIL_USER
        }>`,
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
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[month - 1] || "Desconocido";
  }

  /**
   * Formatear dinero en COP
   */
  private formatMoney(amount: number): string {
    return new Intl.NumberFormat("es-CO", {
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
      console.log("✅ Conexión al servidor de email verificada");
      return true;
    } catch (error) {
      console.error("❌ Error verificando conexión de email:", error);
      return false;
    }
  }
}

export default new NotificationService();
