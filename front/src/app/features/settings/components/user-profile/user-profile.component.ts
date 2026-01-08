import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { UserProfile, PasswordChange, LANGUAGES } from '../../models/settings.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = false;
  changingPassword = false;
  successMessage = '';
  errorMessage = '';
  passwordMessage = '';
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  languages = LANGUAGES;
  currentUser: UserProfile | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      preferences: this.fb.group({
        theme: ['light'],
        notifications_enabled: [true],
        language: ['es'],
        items_per_page: [10]
      })
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password');
    const confirmPassword = form.get('confirm_password');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadUserProfile(): void {
    this.loading = true;
    this.settingsService.getUserProfile().subscribe({
      next: (profile) => {
        this.currentUser = profile;
        this.profileForm.patchValue({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          preferences: profile.preferences || {}
        });
        if (profile.avatar_url) {
          this.avatarPreview = profile.avatar_url;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar perfil de usuario';
        this.loading = false;
      }
    });
  }

  onSubmitProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const profile: Partial<UserProfile> = this.profileForm.value;

      this.settingsService.updateUserProfile(profile).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
          } else {
            this.errorMessage = response.message || 'Error al actualizar perfil';
          }
          this.loading = false;
          this.clearMessagesAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Error al actualizar perfil de usuario';
          this.loading = false;
          this.clearMessagesAfterDelay();
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  onSubmitPassword(): void {
    if (this.passwordForm.valid) {
      this.changingPassword = true;
      this.passwordMessage = '';

      const passwordData: PasswordChange = this.passwordForm.value;

      this.settingsService.changePassword(passwordData).subscribe({
        next: (response) => {
          if (response.success) {
            this.passwordMessage = response.message;
            this.passwordForm.reset();
          } else {
            this.passwordMessage = response.message || 'Error al cambiar contraseña';
          }
          this.changingPassword = false;
          setTimeout(() => {
            this.passwordMessage = '';
          }, 5000);
        },
        error: () => {
          this.passwordMessage = 'Error al cambiar contraseña';
          this.changingPassword = false;
          setTimeout(() => {
            this.passwordMessage = '';
          }, 5000);
        }
      });
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  onAvatarSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Por favor seleccione un archivo de imagen válido';
        return;
      }

      // Validar tamaño (máximo 1MB)
      if (file.size > 1 * 1024 * 1024) {
        this.errorMessage = 'El archivo no debe superar 1MB';
        return;
      }

      this.selectedFile = file;

      // Previsualizar imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onUploadAvatar(): void {
    if (this.selectedFile) {
      this.loading = true;
      this.settingsService.uploadAvatar(this.selectedFile).subscribe({
        next: (response) => {
          this.successMessage = 'Avatar actualizado exitosamente';
          this.selectedFile = null;
          this.loading = false;
          this.clearMessagesAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Error al subir avatar';
          this.loading = false;
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }

  // Getters para validación en template
  get full_name() { return this.profileForm.get('full_name'); }
  get email() { return this.profileForm.get('email'); }
  get phone() { return this.profileForm.get('phone'); }
  get current_password() { return this.passwordForm.get('current_password'); }
  get new_password() { return this.passwordForm.get('new_password'); }
  get confirm_password() { return this.passwordForm.get('confirm_password'); }
}
