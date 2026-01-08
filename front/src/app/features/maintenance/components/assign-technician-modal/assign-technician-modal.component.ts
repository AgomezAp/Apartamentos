import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-assign-technician-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assign-technician-modal.component.html',
  styleUrl: './assign-technician-modal.component.css'
})
export class AssignTechnicianModalComponent {
  @Output() assign = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  technicianForm: FormGroup;
  isVisible = false;

  constructor(private fb: FormBuilder) {
    this.technicianForm = this.fb.group({
      assigned_to_name: ['', [Validators.required, Validators.minLength(3)]],
      assigned_to_phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      assigned_to_company: [''],
      assigned_to_email: ['', [Validators.email]]
    });
  }

  show(): void {
    this.isVisible = true;
    this.technicianForm.reset();
  }

  hide(): void {
    this.isVisible = false;
    this.technicianForm.reset();
  }

  onSubmit(): void {
    if (this.technicianForm.valid) {
      const formValue = this.technicianForm.value;
      
      // Limpiar valores vacíos
      const data: any = {
        assigned_to_name: formValue.assigned_to_name,
        status: 'in_progress'
      };

      if (formValue.assigned_to_phone) {
        data.assigned_to_phone = formValue.assigned_to_phone;
      }
      if (formValue.assigned_to_company) {
        data.assigned_to_company = formValue.assigned_to_company;
      }
      if (formValue.assigned_to_email) {
        data.assigned_to_email = formValue.assigned_to_email;
      }

      this.assign.emit(data);
      this.hide();
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.hide();
  }

  getFieldError(fieldName: string): string {
    const field = this.technicianForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['pattern']) return 'Formato inválido (10 dígitos)';
    if (field.errors['email']) return 'Email inválido';

    return '';
  }
}
