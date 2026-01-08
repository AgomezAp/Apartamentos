import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { NotificationSettings, NOTIFICATION_FREQUENCIES } from '../../models/settings.model';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.css'
})
export class NotificationSettingsComponent implements OnInit {
  notificationForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  frequencies = NOTIFICATION_FREQUENCIES;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadNotificationSettings();
  }

  private initializeForm(): void {
    this.notificationForm = this.fb.group({
      email_notifications: [true],
      payment_reminders: [true],
      payment_reminder_days: [5],
      contract_expiry_alerts: [true],
      contract_expiry_days: [30],
      maintenance_alerts: [true],
      overdue_payment_alerts: [true],
      new_tenant_alerts: [true],
      unit_vacancy_alerts: [true],
      notification_frequency: ['immediate']
    });
  }

  private loadNotificationSettings(): void {
    this.loading = true;
    this.settingsService.getNotificationSettings().subscribe({
      next: (settings) => {
        this.notificationForm.patchValue(settings);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar configuración de notificaciones';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.notificationForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const settings: Partial<NotificationSettings> = this.notificationForm.value;

      this.settingsService.updateNotificationSettings(settings).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
          } else {
            this.errorMessage = response.message || 'Error al actualizar configuración';
          }
          this.loading = false;
          this.clearMessagesAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Error al actualizar configuración de notificaciones';
          this.loading = false;
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }

  // Métodos auxiliares para el template
  get payment_reminders() { return this.notificationForm.get('payment_reminders'); }
  get contract_expiry_alerts() { return this.notificationForm.get('contract_expiry_alerts'); }
}
