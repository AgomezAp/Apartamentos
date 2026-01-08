import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { GeneralSettings, CURRENCIES, LANGUAGES, TIMEZONES, DATE_FORMATS, TIME_FORMATS } from '../../models/settings.model';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.css'
})
export class GeneralSettingsComponent implements OnInit {
  generalForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  logoPreview: string | null = null;
  selectedFile: File | null = null;

  // Opciones para los selects
  currencies = CURRENCIES;
  languages = LANGUAGES;
  timezones = TIMEZONES;
  dateFormats = DATE_FORMATS;
  timeFormats = TIME_FORMATS;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadGeneralSettings();
  }

  private initializeForm(): void {
    this.generalForm = this.fb.group({
      company_name: ['', Validators.required],
      company_email: ['', [Validators.required, Validators.email]],
      company_phone: ['', Validators.required],
      company_address: ['', Validators.required],
      tax_id: ['', Validators.required],
      currency: ['USD', Validators.required],
      language: ['es', Validators.required],
      timezone: ['America/New_York', Validators.required],
      date_format: ['DD/MM/YYYY', Validators.required],
      time_format: ['12h', Validators.required],
      logo_url: ['']
    });
  }

  private loadGeneralSettings(): void {
    this.loading = true;
    this.settingsService.getGeneralSettings().subscribe({
      next: (settings) => {
        this.generalForm.patchValue(settings);
        if (settings.logo_url) {
          this.logoPreview = settings.logo_url;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar configuración general';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.generalForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const settings: Partial<GeneralSettings> = this.generalForm.value;

      this.settingsService.updateGeneralSettings(settings).subscribe({
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
          this.errorMessage = 'Error al actualizar configuración general';
          this.loading = false;
          this.clearMessagesAfterDelay();
        }
      });
    } else {
      this.markFormGroupTouched(this.generalForm);
    }
  }

  onLogoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Por favor seleccione un archivo de imagen válido';
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'El archivo no debe superar 2MB';
        return;
      }

      this.selectedFile = file;

      // Previsualizar imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onUploadLogo(): void {
    if (this.selectedFile) {
      this.loading = true;
      this.settingsService.uploadLogo(this.selectedFile).subscribe({
        next: (response) => {
          this.generalForm.patchValue({ logo_url: response.logo_url });
          this.successMessage = 'Logo actualizado exitosamente';
          this.selectedFile = null;
          this.loading = false;
          this.clearMessagesAfterDelay();
        },
        error: () => {
          this.errorMessage = 'Error al subir logo';
          this.loading = false;
          this.clearMessagesAfterDelay();
        }
      });
    }
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
  get company_name() { return this.generalForm.get('company_name'); }
  get company_email() { return this.generalForm.get('company_email'); }
  get company_phone() { return this.generalForm.get('company_phone'); }
  get company_address() { return this.generalForm.get('company_address'); }
  get tax_id() { return this.generalForm.get('tax_id'); }
}
