/**
 * 📱 Componente de configuración de WhatsApp
 * Muestra el código QR y maneja la conexión
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhatsAppService, WhatsAppStatus } from '../../services/whatsapp.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subscription } from 'rxjs';
import QRCode from 'qrcode';

@Component({
  selector: 'app-whatsapp-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-settings.component.html',
  styleUrl: './whatsapp-settings.component.css'
})
export class WhatsAppSettingsComponent implements OnInit, OnDestroy {
  status: WhatsAppStatus | null = null;
  qrCodeImage: string | null = null;
  loading = false;
  connecting = false;
  
  // Prueba de mensaje
  testPhone = '';
  testMessage = '¡Hola! Este es un mensaje de prueba del sistema de gestión inmobiliaria. 🏠';
  sendingTest = false;
  
  private pollingSubscription?: Subscription;

  constructor(
    private whatsappService: WhatsAppService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadStatus();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  /**
   * Cargar estado actual
   */
  loadStatus(): void {
    this.loading = true;
    this.whatsappService.getStatus().subscribe({
      next: (response) => {
        this.status = response.data || null;
        this.loading = false;
        
        if (this.status?.qrCode) {
          this.generateQRImage(this.status.qrCode);
        }
      },
      error: (error) => {
        console.error('Error cargando estado:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Conectar WhatsApp
   */
  connect(): void {
    this.connecting = true;
    this.whatsappService.connect().subscribe({
      next: (response) => {
        this.status = response.data || null;
        this.connecting = false;
        
        if (this.status?.qrCode) {
          this.generateQRImage(this.status.qrCode);
          this.startPolling();
        } else if (this.status?.isConnected) {
          this.notificationService.showSuccess('WhatsApp ya está conectado');
        } else {
          // Iniciar polling para obtener el QR
          this.startPolling();
        }
      },
      error: (error) => {
        console.error('Error conectando:', error);
        this.connecting = false;
        this.notificationService.showError('Error al conectar WhatsApp');
      }
    });
  }

  /**
   * Desconectar WhatsApp
   */
  disconnect(): void {
    if (confirm('¿Estás seguro de desconectar WhatsApp?')) {
      this.whatsappService.disconnect().subscribe({
        next: () => {
          this.status = null;
          this.qrCodeImage = null;
          this.stopPolling();
          this.notificationService.showSuccess('WhatsApp desconectado');
        },
        error: (error) => {
          console.error('Error desconectando:', error);
          this.notificationService.showError('Error al desconectar');
        }
      });
    }
  }

  /**
   * Enviar mensaje de prueba
   */
  sendTestMessage(): void {
    if (!this.testPhone || !this.testMessage) {
      this.notificationService.showWarning('Ingresa número y mensaje');
      return;
    }

    this.sendingTest = true;
    this.whatsappService.sendTestMessage(this.testPhone, this.testMessage).subscribe({
      next: (response) => {
        this.sendingTest = false;
        if (response.success) {
          this.notificationService.showSuccess('Mensaje enviado');
        } else {
          this.notificationService.showError('No se pudo enviar el mensaje');
        }
      },
      error: (error) => {
        console.error('Error enviando mensaje:', error);
        this.sendingTest = false;
        this.notificationService.showError('Error al enviar mensaje');
      }
    });
  }

  /**
   * Generar imagen del código QR
   */
  private async generateQRImage(qrData: string): Promise<void> {
    try {
      this.qrCodeImage = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#141414',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('Error generando QR:', error);
      this.qrCodeImage = null;
    }
  }

  /**
   * Iniciar polling para actualizar estado
   */
  private startPolling(): void {
    this.stopPolling();
    
    this.pollingSubscription = this.whatsappService.startPolling().subscribe({
      next: (status) => {
        this.status = status;
        
        if (status.qrCode) {
          this.generateQRImage(status.qrCode);
        }
        
        if (status.isReady) {
          this.qrCodeImage = null;
          this.notificationService.showSuccess('¡WhatsApp conectado exitosamente!');
          this.stopPolling();
        }
      },
      error: (error) => {
        console.error('Error en polling:', error);
      }
    });
  }

  /**
   * Detener polling
   */
  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  /**
   * Formatear fecha
   */
  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-CO');
  }
}
