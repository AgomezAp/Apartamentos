import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RolesService } from '../../../../core/services/roles.service';
import { RegisterData } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  passwordStrength: number = 0;
  strengthClass: string = '';
  strengthText: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
    ,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
    this.registerForm.get('password')?.valueChanges.subscribe((value) => {
      this.calculatePasswordStrength(value || '');
    });
  }

  /**
   * Inicializar formulario de registro
   */
  private initForm(): void {
    this.registerForm = this.fb.group(
      {
        full_name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''], // Sin validación - campo completamente opcional
        role_id: [null],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }
  calculatePasswordStrength(password: string): void {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    this.passwordStrength = Math.min(strength, 4);

    if (this.passwordStrength <= 1) {
      this.strengthClass = 'weak';
      this.strengthText = 'Débil';
    } else if (this.passwordStrength <= 2) {
      this.strengthClass = 'medium';
      this.strengthText = 'Media';
    } else if (this.passwordStrength <= 3) {
      this.strengthClass = 'medium';
      this.strengthText = 'Buena';
    } else {
      this.strengthClass = 'strong';
      this.strengthText = 'Fuerte';
    }
  }
  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(
    form: FormGroup
  ): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Submit del formulario
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    const registerData: RegisterData = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(
          'Cuenta creada exitosamente. Por favor inicia sesión.',
          'Registro Exitoso'
        );
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.error || 'Error al crear la cuenta';
        this.notificationService.showError(errorMessage, 'Error de Registro');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // Cargar roles para el select
  roles: Array<{ id: number; name: string; description?: string }> = [];

  private loadRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.roles = res.data;
        }
      },
      error: (err) => {
        console.error('Error cargando roles', err);
      },
    });
  }

  /**
   * Alternar visibilidad de la contraseña
   */
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  /**
   * Marcar todos los campos como tocados
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
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
    const control = this.registerForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);

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

    if (control.hasError('pattern') && field === 'phone') {
      return 'Ingresa un teléfono válido de 10 dígitos';
    }

    if (control.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }
}
