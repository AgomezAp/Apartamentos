import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tenant, IDENTIFICATION_TYPES, TENANT_STATUS } from '../../models/tenant.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-form.component.html',
  styleUrl: './tenant-form.component.css'
})
export class TenantFormComponent implements OnInit {
  @Input() tenant?: Tenant;
  @Input() submitButtonText: string = 'Guardar Inquilino';
  @Output() formSubmit = new EventEmitter<Partial<Tenant>>();
  @Output() formCancel = new EventEmitter<void>();

  tenantForm!: FormGroup;
  identificationTypes = IDENTIFICATION_TYPES;
  tenantStatuses = TENANT_STATUS;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.tenant) {
      this.patchFormValues();
    }
  }

  private initForm(): void {
    this.tenantForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]],
      identification_number: ['', [Validators.required, Validators.maxLength(50)]],
      identification_type: ['CC', Validators.required],
      date_of_birth: [''],
      nationality: ['', Validators.maxLength(50)],
      occupation: ['', Validators.maxLength(100)],
      emergency_contact_name: ['', Validators.maxLength(200)],
      emergency_contact_phone: ['', Validators.maxLength(20)],
      emergency_contact_relationship: ['', Validators.maxLength(50)],
      status: ['active', Validators.required],
      notes: ['', Validators.maxLength(1000)]
    });
  }

  private patchFormValues(): void {
    if (this.tenant) {
      // Construir full_name desde first_name y last_name
      const fullName = this.tenant.full_name || 
        `${this.tenant.first_name || ''} ${this.tenant.last_name || ''}`.trim();
      
      // Obtener el teléfono (puede estar en phone o mobile_phone)
      const phone = this.tenant.phone || this.tenant.mobile_phone || '';
      
      // Obtener el status (convertir is_active a status si es necesario)
      let status = this.tenant.status;
      if (!status && this.tenant.is_active !== undefined) {
        status = this.tenant.is_active ? 'active' : 'inactive';
      }
      
      const formValue: any = {
        full_name: fullName,
        email: this.tenant.email,
        phone: phone,
        identification_number: this.tenant.identification_number || this.tenant.document_number,
        identification_type: this.tenant.identification_type || this.tenant.document_type || 'CC',
        date_of_birth: this.tenant.date_of_birth 
          ? new Date(this.tenant.date_of_birth).toISOString().split('T')[0] 
          : '',
        nationality: this.tenant.nationality || '',
        occupation: this.tenant.occupation || '',
        emergency_contact_name: this.tenant.emergency_contact_name || '',
        emergency_contact_phone: this.tenant.emergency_contact_phone || '',
        emergency_contact_relationship: this.tenant.emergency_contact_relationship || '',
        status: status || 'active',
        notes: this.tenant.notes || ''
      };
      
      this.tenantForm.patchValue(formValue);
    }
  }

  onSubmit(): void {
    if (this.tenantForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.tenantForm.value;
      
      // Convertir fecha de nacimiento a Date si existe
      if (formData.date_of_birth) {
        formData.date_of_birth = new Date(formData.date_of_birth);
      }

      this.formSubmit.emit(formData);
      this.isSubmitting = false;
    } else {
      this.markFormGroupTouched(this.tenantForm);
      // Mostrar errores específicos al usuario
      const errorMessages = this.getFormValidationErrors();
      if (errorMessages.length > 0) {
        this.notificationService.showError(
          `Por favor corrige los siguientes errores:\n\n${errorMessages.join('\n')}`,
          'Formulario incompleto'
        );
      }
    }
  }

  /**
   * Obtiene los mensajes de error de validación del formulario
   */
  private getFormValidationErrors(): string[] {
    const errors: string[] = [];
    const fieldLabels: Record<string, string> = {
      'full_name': 'Nombre completo',
      'email': 'Correo electrónico',
      'phone': 'Teléfono',
      'identification_number': 'Número de identificación',
      'identification_type': 'Tipo de identificación',
      'date_of_birth': 'Fecha de nacimiento',
      'nationality': 'Nacionalidad',
      'occupation': 'Ocupación',
      'emergency_contact_name': 'Contacto de emergencia',
      'emergency_contact_phone': 'Teléfono de emergencia',
      'emergency_contact_relationship': 'Relación con contacto',
      'status': 'Estado',
      'notes': 'Notas',
    };

    Object.keys(this.tenantForm.controls).forEach(key => {
      const control = this.tenantForm.get(key);
      if (control?.invalid) {
        const label = fieldLabels[key] || key;
        if (control.errors?.['required']) {
          errors.push(`• ${label}: Este campo es requerido`);
        } else if (control.errors?.['email']) {
          errors.push(`• ${label}: Formato de correo inválido`);
        } else if (control.errors?.['maxlength']) {
          errors.push(`• ${label}: Máximo ${control.errors['maxlength'].requiredLength} caracteres`);
        } else if (control.errors?.['min']) {
          errors.push(`• ${label}: El valor mínimo es ${control.errors['min'].min}`);
        } else {
          errors.push(`• ${label}: Valor inválido`);
        }
      }
    });

    return errors;
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tenantForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.tenantForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    }
    return '';
  }

  resetForm(): void {
    this.tenantForm.reset({
      identification_type: 'CC',
      status: 'active'
    });
  }
}
