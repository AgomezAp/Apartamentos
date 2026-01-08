import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  emailSent = false;
  private readonly API_URL = environment.apiUrl || 'http://localhost:3010/api';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializar formulario
   */
  private initForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Submit del formulario
   */
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.value.email;

    this.http.post(`${this.API_URL}/auth/forgot-password`, { email }).subscribe({
      next: (response) => {
        this.emailSent = true;
        this.notificationService.showSuccess(
          'Se ha enviado un enlace de recuperación a tu correo electrónico',
          'Email Enviado'
        );
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.error || 'Error al enviar el email';
        this.notificationService.showError(errorMessage, 'Error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Volver al login
   */
  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Marcar todos los campos como tocados
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo tiene un error específico
   */
  hasError(field: string, error: string): boolean {
    const control = this.forgotPasswordForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  /**
   * Obtener mensaje de error
   */
  getErrorMessage(field: string): string {
    const control = this.forgotPasswordForm.get(field);
    
    if (!control || !control.touched) return '';

    if (control.hasError('required')) {
      return 'El email es requerido';
    }
    
    if (control.hasError('email')) {
      return 'Ingresa un email válido';
    }
    
    return '';
  }
}
