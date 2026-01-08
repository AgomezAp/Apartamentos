import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { Alert } from '../../models/dashboard.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-alerts-widget',
  imports: [CommonModule, RouterModule, DateFormatPipe],
  templateUrl: './alerts-widget.component.html',
  styleUrl: './alerts-widget.component.css'
})
export class AlertsWidgetComponent implements OnInit {
  alerts: Alert[] = [];
  loading = false;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.getAlerts(10).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.alerts = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar alertas';
        this.loading = false;
        console.error(err);
      }
    });
  }

  markAsRead(alert: Alert): void {
    if (alert.id) {
      this.dashboardService.markAlertAsRead(alert.id).subscribe({
        next: () => {
          alert.is_read = true;
        },
        error: (err) => {
          this.notificationService.showError('Error al marcar alerta como leída');
          console.error(err);
        }
      });
    }
  }

  getSeverityClass(severity: string): string {
    return `severity-${severity}`;
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '🔔';
    }
  }
}
