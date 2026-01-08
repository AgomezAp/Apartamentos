import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../../services/settings.service';

interface SettingsCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-settings-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings-home.component.html',
  styleUrl: './settings-home.component.css'
})
export class SettingsHomeComponent implements OnInit {
  settingsCards: SettingsCard[] = [
    {
      id: 'general',
      icon: '⚙️',
      title: 'Configuración General',
      description: 'Información de la empresa, preferencias regionales y logo',
      route: '/settings/general',
      color: '#667eea'
    },
    {
      id: 'email',
      icon: '📧',
      title: 'Configuración de Correo',
      description: 'Servidor SMTP y configuración de envío de emails',
      route: '/settings/email',
      color: '#f093fb'
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: 'Notificaciones',
      description: 'Personaliza alertas de pagos, contratos y mantenimiento',
      route: '/settings/notifications',
      color: '#4facfe'
    },
    {
      id: 'profile',
      icon: '👤',
      title: 'Perfil de Usuario',
      description: 'Información personal, preferencias y cambio de contraseña',
      route: '/settings/profile',
      color: '#43e97b'
    }
  ];

  // Información del sistema
  systemInfo = {
    version: '1.0.0',
    lastUpdate: new Date(),
    environment: 'Production'
  };

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    // Cargar configuraciones iniciales
    this.settingsService.getGeneralSettings().subscribe();
  }
}
