import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Tenant, IDENTIFICATION_TYPES, TENANT_STATUS } from '../../models/tenant.model';

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

  constructor(private fb: FormBuilder) {}

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
      const formValue: any = { ...this.tenant };
      if (this.tenant.date_of_birth) {
        formValue.date_of_birth = new Date(this.tenant.date_of_birth).toISOString().split('T')[0];
      }
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
    }
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
