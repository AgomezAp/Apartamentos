import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { EmailSettings } from '../../models/settings.model';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email-settings.component.html',
  styleUrl: './email-settings.component.css'
})
export class EmailSettingsComponent implements OnInit {
  emailForm!: FormGroup;
  testEmailForm!: FormGroup;
  loading = false;
  testing = false;
  successMessage = '';
  errorMessage = '';
  testMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadEmailSettings();
  }

  private initializeForms(): void {
    this.emailForm = this.fb.group({
      smtp_host: ['', Validators.required],
      smtp_port: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      smtp_secure: [true],
      smtp_user: ['', [Validators.required, Validators.email]],
      smtp_password: [''],
      from_email: ['', [Validators.required, Validators.email]],
      from_name: ['', Validators.required],
      reply_to: ['', Validators.email],
      enabled: [true]
    });

    this.testEmailForm = this.fb.group({
      test_email: ['', [Validators.required, Validators.email]]
    });
  }

  private loadEmailSettings(): void {
    this.loading = true;
    this.settingsService.getEmailSettings().subscribe({
      next: (settings) => {
        this.emailForm.patchValue({
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_secure: settings.smtp_secure,
          smtp_user: settings.smtp_user,
          from_email: settings.from_email,
          from_name: settings.from_name,
          reply_to: settings.reply_to,
          enabled: settings.enabled
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar configuración de correo';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.emailForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const settings: Partial<EmailSettings> = this.emailForm.value;

      this.settingsService.updateEmailSettings(settings).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            // Limpiar campo de contraseña después de guardar
            this.emailForm.patchValue({ smtp_password: '' });
          } else {
            this.errorMessage = response.message || 'Error al actualizar configuración';
          }
          this.loading = false;
          this.clearMessagesAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Error al actualizar configuración de correo';
          this.loading = false;
          this.clearMessagesAfterDelay();
        }
      });
    } else {
      this.markFormGroupTouched(this.emailForm);
    }
  }

  onTestEmail(): void {
    if (this.testEmailForm.valid) {
      this.testing = true;
      this.testMessage = '';

      const testEmail = this.testEmailForm.value.test_email;

      this.settingsService.testEmailConfiguration(testEmail).subscribe({
        next: (response) => {
          this.testMessage = response.message;
          this.testing = false;
          setTimeout(() => {
            this.testMessage = '';
          }, 5000);
        },
        error: () => {
          this.testMessage = 'Error al enviar correo de prueba';
          this.testing = false;
          setTimeout(() => {
            this.testMessage = '';
          }, 5000);
        }
      });
    } else {
      this.markFormGroupTouched(this.testEmailForm);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }

  // Getters para validación en template
  get smtp_host() { return this.emailForm.get('smtp_host'); }
  get smtp_port() { return this.emailForm.get('smtp_port'); }
  get smtp_user() { return this.emailForm.get('smtp_user'); }
  get from_email() { return this.emailForm.get('from_email'); }
  get from_name() { return this.emailForm.get('from_name'); }
  get reply_to() { return this.emailForm.get('reply_to'); }
  get test_email() { return this.testEmailForm.get('test_email'); }
}
