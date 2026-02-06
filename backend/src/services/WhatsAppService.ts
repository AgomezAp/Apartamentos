/**
 * 📱 Servicio de WhatsApp
 * Envía notificaciones por WhatsApp usando whatsapp-web.js
 * Se conecta mediante código QR
 */

import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import EventEmitter from 'events';
import path from 'path';

interface WhatsAppMessage {
  phone: string;
  message: string;
  media?: Buffer;
  mediaType?: string;
  filename?: string;
}

interface WhatsAppStatus {
  isConnected: boolean;
  isReady: boolean;
  qrCode: string | null;
  lastConnection: Date | null;
  error: string | null;
}

class WhatsAppService extends EventEmitter {
  private client: Client | null = null;
  private status: WhatsAppStatus = {
    isConnected: false,
    isReady: false,
    qrCode: null,
    lastConnection: null,
    error: null,
  };
  private messageQueue: WhatsAppMessage[] = [];
  private isProcessingQueue: boolean = false;

  constructor() {
    super();
  }

  /**
   * Inicializar el cliente de WhatsApp
   */
  async initialize(): Promise<void> {
    // Si ya está conectado y listo, no hacer nada
    if (this.status.isReady && this.client) {
      console.log('✅ WhatsApp ya está conectado y listo');
      return;
    }

    // Si hay un cliente existente pero no está listo, destruirlo primero
    if (this.client) {
      console.log('⚠️ Limpiando sesión anterior...');
      try {
        await this.client.destroy();
      } catch (e) {
        console.log('No se pudo destruir cliente anterior:', e);
      }
      this.client = null;
    }

    console.log('📱 Inicializando servicio de WhatsApp...');

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.join(process.cwd(), '.wwebjs_auth'),
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    // Evento: Código QR generado
    this.client.on('qr', (qr) => {
      console.log('\n📱 ====================================');
      console.log('🔐 ESCANEA ESTE CÓDIGO QR CON WHATSAPP');
      console.log('====================================\n');
      
      // Mostrar QR en terminal
      qrcode.generate(qr, { small: true });
      
      this.status.qrCode = qr;
      this.emit('qr', qr);
    });

    // Evento: Cliente listo
    this.client.on('ready', () => {
      console.log('\n✅ WhatsApp conectado exitosamente!');
      this.status.isConnected = true;
      this.status.isReady = true;
      this.status.qrCode = null;
      this.status.lastConnection = new Date();
      this.status.error = null;
      this.emit('ready');
      
      // Procesar mensajes en cola
      this.processQueue();
    });

    // Evento: Autenticado
    this.client.on('authenticated', () => {
      console.log('🔓 WhatsApp autenticado');
      this.status.isConnected = true;
      this.emit('authenticated');
    });

    // Evento: Fallo de autenticación
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Error de autenticación WhatsApp:', msg);
      this.status.isConnected = false;
      this.status.isReady = false;
      this.status.error = `Auth failure: ${msg}`;
      this.emit('auth_failure', msg);
    });

    // Evento: Desconectado
    this.client.on('disconnected', (reason) => {
      console.log('📴 WhatsApp desconectado:', reason);
      this.status.isConnected = false;
      this.status.isReady = false;
      this.status.error = `Disconnected: ${reason}`;
      this.emit('disconnected', reason);
    });

    // Evento: Mensaje recibido
    this.client.on('message', async (msg) => {
      console.log(`📩 Mensaje recibido de ${msg.from}: ${msg.body}`);
      this.emit('message', msg);
    });

    // Inicializar cliente
    await this.client.initialize();
  }

  /**
   * Obtener estado actual
   */
  getStatus(): WhatsAppStatus {
    return { ...this.status };
  }

  /**
   * Formatear número de teléfono para WhatsApp
   * @param phone Número de teléfono (puede tener o no código de país)
   * @returns Número formateado para WhatsApp (código de país + número + @c.us)
   */
  private formatPhone(phone: string): string {
    // Limpiar espacios, guiones y paréntesis
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Si comienza con +, remover
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // Si el número comienza con 3 y tiene 10 dígitos, es colombiano
    if (/^3\d{9}$/.test(cleaned)) {
      cleaned = '57' + cleaned;
    }
    
    // Si no tiene código de país (menos de 11 dígitos), agregar 57 (Colombia)
    if (cleaned.length === 10) {
      cleaned = '57' + cleaned;
    }
    
    return cleaned + '@c.us';
  }

  /**
   * Enviar mensaje de texto
   */
  async sendMessage(phone: string, message: string): Promise<boolean> {
    const formattedPhone = this.formatPhone(phone);
    
    // Si no está listo, agregar a la cola
    if (!this.status.isReady || !this.client) {
      console.log(`📥 Mensaje agregado a la cola para ${phone}`);
      this.messageQueue.push({ phone, message });
      return true;
    }

    try {
      // Verificar si el número está registrado en WhatsApp
      const isRegistered = await this.client.isRegisteredUser(formattedPhone);
      
      if (!isRegistered) {
        console.warn(`⚠️ El número ${phone} no está registrado en WhatsApp`);
        return false;
      }

      await this.client.sendMessage(formattedPhone, message);
      console.log(`✅ Mensaje enviado a ${phone}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error enviando mensaje a ${phone}:`, error.message);
      return false;
    }
  }

  /**
   * Enviar mensaje con archivo adjunto
   */
  async sendMessageWithMedia(
    phone: string, 
    message: string, 
    mediaBuffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<boolean> {
    const formattedPhone = this.formatPhone(phone);
    
    if (!this.status.isReady || !this.client) {
      console.log(`📥 Mensaje con media agregado a la cola para ${phone}`);
      this.messageQueue.push({ 
        phone, 
        message, 
        media: mediaBuffer,
        mediaType: mimetype,
        filename
      });
      return true;
    }

    try {
      const isRegistered = await this.client.isRegisteredUser(formattedPhone);
      
      if (!isRegistered) {
        console.warn(`⚠️ El número ${phone} no está registrado en WhatsApp`);
        return false;
      }

      const media = new MessageMedia(
        mimetype,
        mediaBuffer.toString('base64'),
        filename
      );

      await this.client.sendMessage(formattedPhone, media, { caption: message });
      console.log(`✅ Mensaje con archivo enviado a ${phone}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error enviando mensaje con media a ${phone}:`, error.message);
      return false;
    }
  }

  /**
   * Procesar cola de mensajes pendientes
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    console.log(`📤 Procesando ${this.messageQueue.length} mensajes en cola...`);

    while (this.messageQueue.length > 0 && this.status.isReady) {
      const msg = this.messageQueue.shift()!;
      
      if (msg.media) {
        await this.sendMessageWithMedia(
          msg.phone, 
          msg.message, 
          msg.media,
          msg.filename || 'archivo',
          msg.mediaType || 'application/octet-stream'
        );
      } else {
        await this.sendMessage(msg.phone, msg.message);
      }
      
      // Esperar 1 segundo entre mensajes para evitar bloqueos
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.isProcessingQueue = false;
  }

  /**
   * Desconectar cliente
   */
  async disconnect(): Promise<void> {
    console.log('📴 Desconectando WhatsApp...');
    
    try {
      if (this.client) {
        // Intentar logout primero para limpiar la sesión
        try {
          await this.client.logout();
          console.log('✅ Logout exitoso');
        } catch (logoutError) {
          console.log('⚠️ No se pudo hacer logout (puede que ya esté desconectado)');
        }
        
        // Destruir el cliente
        try {
          await this.client.destroy();
          console.log('✅ Cliente destruido');
        } catch (destroyError) {
          console.log('⚠️ Error destruyendo cliente:', destroyError);
        }
        
        this.client = null;
      }
      
      // Resetear estado
      this.status = {
        isConnected: false,
        isReady: false,
        qrCode: null,
        lastConnection: null,
        error: null,
      };
      
      console.log('✅ WhatsApp desconectado completamente');
    } catch (error) {
      console.error('❌ Error en desconexión:', error);
      // Forzar reseteo del estado de todas formas
      this.client = null;
      this.status = {
        isConnected: false,
        isReady: false,
        qrCode: null,
        lastConnection: null,
        error: null,
      };
    }
  }

  // ============================================================
  // MÉTODOS DE NOTIFICACIÓN ESPECÍFICOS
  // ============================================================

  /**
   * Enviar confirmación de pago
   */
  async sendPaymentConfirmation(
    phone: string,
    data: {
      tenantName: string;
      amount: number;
      unitNumber: string;
      buildingName: string;
      paymentDate: string;
      referenceNumber?: string;
    }
  ): Promise<boolean> {
    const message = `💰 *Confirmación de Pago*

Hola ${data.tenantName},

Tu pago ha sido registrado exitosamente.

📋 *Detalles:*
• Monto: $${data.amount.toLocaleString('es-CO')}
• Unidad: ${data.unitNumber}
• Edificio: ${data.buildingName}
• Fecha: ${data.paymentDate}
${data.referenceNumber ? `• Referencia: ${data.referenceNumber}` : ''}

¡Gracias por tu pago puntual! 🏠`;

    return this.sendMessage(phone, message);
  }

  /**
   * Enviar recordatorio de pago
   */
  async sendPaymentReminder(
    phone: string,
    data: {
      tenantName: string;
      amount: number;
      unitNumber: string;
      buildingName: string;
      dueDate: string;
      daysUntilDue: number;
    }
  ): Promise<boolean> {
    const urgency = data.daysUntilDue <= 1 ? '🚨' : '⏰';
    
    const message = `${urgency} *Recordatorio de Pago*

Hola ${data.tenantName},

Te recordamos que tu pago está próximo a vencer.

📋 *Detalles:*
• Monto: $${data.amount.toLocaleString('es-CO')}
• Unidad: ${data.unitNumber}
• Edificio: ${data.buildingName}
• Fecha límite: ${data.dueDate}
• Días restantes: ${data.daysUntilDue}

Por favor realiza tu pago a tiempo para evitar recargos. 🙏`;

    return this.sendMessage(phone, message);
  }

  /**
   * Enviar alerta de pago vencido
   */
  async sendOverdueAlert(
    phone: string,
    data: {
      tenantName: string;
      amount: number;
      unitNumber: string;
      buildingName: string;
      dueDate: string;
      daysOverdue: number;
    }
  ): Promise<boolean> {
    const message = `🚨 *Pago Vencido*

Hola ${data.tenantName},

Tu pago se encuentra vencido.

📋 *Detalles:*
• Monto pendiente: $${data.amount.toLocaleString('es-CO')}
• Unidad: ${data.unitNumber}
• Edificio: ${data.buildingName}
• Venció el: ${data.dueDate}
• Días vencido: ${data.daysOverdue}

Por favor contacta a la administración para regularizar tu situación. ⚠️`;

    return this.sendMessage(phone, message);
  }

  /**
   * Enviar alerta de contrato por vencer
   */
  async sendContractExpiryAlert(
    phone: string,
    data: {
      tenantName: string;
      unitNumber: string;
      buildingName: string;
      endDate: string;
      daysUntilExpiry: number;
    }
  ): Promise<boolean> {
    const message = `📄 *Contrato Próximo a Vencer*

Hola ${data.tenantName},

Tu contrato de arrendamiento está próximo a vencer.

📋 *Detalles:*
• Unidad: ${data.unitNumber}
• Edificio: ${data.buildingName}
• Fecha de vencimiento: ${data.endDate}
• Días restantes: ${data.daysUntilExpiry}

Por favor contacta a la administración si deseas renovar tu contrato. 🏠`;

    return this.sendMessage(phone, message);
  }

  /**
   * Enviar mensaje de bienvenida al nuevo inquilino
   */
  async sendWelcomeMessage(
    phone: string,
    data: {
      tenantName: string;
      unitNumber: string;
      buildingName: string;
      buildingAddress: string;
      monthlyRent: number;
      paymentDay: number;
      startDate: string;
    }
  ): Promise<boolean> {
    const message = `👋 *¡Bienvenido!*

Hola ${data.tenantName},

¡Bienvenido/a a ${data.buildingName}!

📋 *Información de tu contrato:*
• Unidad: ${data.unitNumber}
• Dirección: ${data.buildingAddress}
• Renta mensual: $${data.monthlyRent.toLocaleString('es-CO')}
• Día de pago: ${data.paymentDay} de cada mes
• Fecha de inicio: ${data.startDate}

Estamos para servirte. ¡Que disfrutes tu nuevo hogar! 🏡`;

    return this.sendMessage(phone, message);
  }
}

// Exportar instancia singleton
const whatsappService = new WhatsAppService();
export default whatsappService;
export { WhatsAppService, WhatsAppStatus };
