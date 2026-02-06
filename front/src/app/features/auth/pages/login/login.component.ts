import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoginCredentials } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  redirectMessage: string | null = null;
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Limpiar cualquier dato de autenticación previo al llegar al login
    // Esto previene problemas con tokens viejos o corruptos
    this.clearOldAuthData();
    
    // Inicializar el formulario PRIMERO (siempre, para evitar errores en la plantilla)
    this.initForm();
    
    // Verificar mensajes de redirección
    this.checkRedirectMessage();
  }

  /**
   * Limpiar datos de autenticación previos
   */
  private clearOldAuthData(): void {
    // Solo limpiar si no venimos de una sesión expirada (para no mostrar doble mensaje)
    const params = this.route.snapshot.queryParams;
    if (!params['sessionExpired']) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  /**
   * Verificar si hay mensaje de redirección
   */
  private checkRedirectMessage(): void {
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.redirectMessage = params['message'];
        this.notificationService.showInfo(
          params['message'],
          'Inicio de Sesión Requerido'
        );
      }
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
      if (params['sessionExpired']) {
        this.notificationService.showWarning(
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          'Sesión Expirada'
        );
      }
    });
  }

  /**
   * Inicializar formulario de login
   */
  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  /**
   * Submit del formulario
   */
  onSubmit(): void {
    console.log('🔵 onSubmit llamado, isLoading:', this.isLoading);
    
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    // Prevenir múltiples envíos
    if (this.isLoading) {
      console.log('⚠️ Ya hay un login en progreso, ignorando');
      return;
    }

    this.isLoading = true;
    const credentials: LoginCredentials = this.loginForm.value;
    console.log('📤 Enviando credenciales para:', credentials.email);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso, respuesta:', response);
        if (response.success) {
          this.notificationService.showSuccess(
            'Bienvenido al sistema',
            'Login Exitoso'
          );
          
          // Redirigir a la URL guardada o al dashboard
          console.log('🚀 Navegando a:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (error) => {
        console.log('❌ Login error:', error);
        this.isLoading = false;
        // El interceptor ya maneja el mensaje de error para 401
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Alternar visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    
    if (!control || !control.touched) return '';

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control.hasError('email')) {
      return 'Ingresa un email válido';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    return '';
  }
}
