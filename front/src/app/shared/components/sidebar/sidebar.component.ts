import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WhatsAppService, WhatsAppStatus } from '../../../features/settings/services/whatsapp.service';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  badge?: string | number;
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed: boolean = false;
  
  // WhatsApp
  whatsappStatus: WhatsAppStatus | null = null;
  whatsappQRImage: string | null = null;
  showWhatsAppPanel = false;
  connectingWhatsApp = false;
  sendingTestAlert = false;
  testAlertMessage: string | null = null;
  testAlertSuccess = false;
  private pollingSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private whatsappService: WhatsAppService
  ) {}

  @Input() menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: '📈', route: '/dashboard' },
    { label: 'Edificios', icon: '🏛️', route: '/buildings' },
    { label: 'Unidades', icon: '🏢', route: '/units' },
    { label: 'Inquilinos', icon: '👥', route: '/tenants' },
    { label: 'Contratos', icon: '📝', route: '/contracts' },
    { label: 'Pagos', icon: '💵', route: '/payments' },
    { label: 'Gastos', icon: '📊', route: '/expenses' },
    { label: 'Mantenimiento', icon: '🔧', route: '/maintenance' },
    { label: 'Reportes', icon: '📊', route: '/reports' },
    {
      label: 'Catálogos',
      icon: '📚',
      expanded: false,
      children: [
        { label: 'Tipos de Unidades', icon: '🏠', route: '/unit-types' },
        { label: 'Categorías de Mantenimiento', icon: '💰', route: '/expense-categories' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadWhatsAppStatus();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  toggleMenuItem(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

  // WhatsApp Methods
  toggleWhatsAppPanel(): void {
    this.showWhatsAppPanel = !this.showWhatsAppPanel;
    if (this.showWhatsAppPanel) {
      this.loadWhatsAppStatus();
    }
  }

  loadWhatsAppStatus(): void {
    this.whatsappService.getStatus().subscribe({
      next: (response) => {
        this.whatsappStatus = response.data || null;
        if (this.whatsappStatus?.isReady) {
          this.whatsappQRImage = null;
          this.connectingWhatsApp = false;
          this.stopPolling();
        }
      },
      error: (err) => {
        console.error('Error al obtener estado de WhatsApp:', err);
      }
    });
  }

  connectWhatsApp(): void {
    // Si ya está conectado, no hacer nada
    if (this.whatsappStatus?.isReady) {
      console.log('WhatsApp ya está conectado');
      return;
    }
    
    this.connectingWhatsApp = true;
    this.whatsappQRImage = null;
    
    this.whatsappService.connect().subscribe({
      next: (response) => {
        // Si ya estaba conectado, actualizar estado y no hacer polling
        if (response.data?.isReady) {
          this.whatsappStatus = response.data;
          this.connectingWhatsApp = false;
          return;
        }
        // Iniciar polling para obtener el QR solo si no está conectado
        this.startQRPolling();
      },
      error: (err) => {
        console.error('Error al conectar WhatsApp:', err);
        this.connectingWhatsApp = false;
        this.loadWhatsAppStatus();
      }
    });
  }

  disconnectWhatsApp(): void {
    this.connectingWhatsApp = false;
    this.whatsappQRImage = null;
    
    this.whatsappService.disconnect().subscribe({
      next: () => {
        this.whatsappStatus = {
          isConnected: false,
          isReady: false,
          qrCode: null,
          lastConnection: null,
          error: null
        };
        this.stopPolling();
        console.log('WhatsApp desconectado');
      },
      error: (err) => {
        console.error('Error al desconectar WhatsApp:', err);
        this.loadWhatsAppStatus();
      }
    });
  }

  private startQRPolling(): void {
    this.stopPolling();
    
    this.pollingSubscription = interval(2000).pipe(
      switchMap(() => this.whatsappService.getQR()),
      takeWhile(() => !this.whatsappStatus?.isReady, true)
    ).subscribe({
      next: (response) => {
        if (response.data?.qrCode) {
          this.whatsappQRImage = response.data.qrCode;
          this.connectingWhatsApp = false;
        }
        this.loadWhatsAppStatus();
      },
      error: (err) => {
        console.error('Error en polling de QR:', err);
        this.connectingWhatsApp = false;
      }
    });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  sendTestAlert(): void {
    this.sendingTestAlert = true;
    this.testAlertMessage = null;

    this.whatsappService.sendTestAlert().subscribe({
      next: (response: any) => {
        this.sendingTestAlert = false;
        this.testAlertSuccess = response.success;
        this.testAlertMessage = response.success 
          ? `✅ Mensaje enviado a ${response.data?.adminPhone || 'admin'}` 
          : '❌ No se pudo enviar';
        
        setTimeout(() => {
          this.testAlertMessage = null;
        }, 5000);
      },
      error: (err: any) => {
        this.sendingTestAlert = false;
        this.testAlertSuccess = false;
        this.testAlertMessage = '❌ Error al enviar';
        console.error('Error enviando alerta de prueba:', err);
        
        setTimeout(() => {
          this.testAlertMessage = null;
        }, 5000);
      }
    });
  }
}
