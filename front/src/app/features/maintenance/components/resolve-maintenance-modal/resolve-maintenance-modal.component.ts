import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resolve-maintenance-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './resolve-maintenance-modal.component.html',
  styleUrl: './resolve-maintenance-modal.component.css'
})
export class ResolveMaintenanceModalComponent {
  @Output() submit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  isVisible = false;
  resolveForm: FormGroup;
  formattedCost: string = '';

  constructor(private fb: FormBuilder) {
    this.resolveForm = this.fb.group({
      resolved_by: ['', [Validators.required, Validators.minLength(3)]],
      actual_cost: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      notes: ['']
    });
  }

  show(): void {
    this.isVisible = true;
    this.resolveForm.reset();
  }

  hide(): void {
    this.isVisible = false;
    this.resolveForm.reset();
  }

  onCancel(): void {
    this.hide();
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.resolveForm.invalid) return;

    const formData = this.resolveForm.value;
    const data: any = {
      resolved_by: formData.resolved_by
    };

    // Solo incluir campos si tienen valor
    if (formData.actual_cost) {
      data.actual_cost = parseFloat(formData.actual_cost);
    }
    if (formData.notes) {
      data.notes = formData.notes;
    }

    this.submit.emit(data);
    this.hide();
  }

  getFieldError(fieldName: string): string {
    const control = this.resolveForm.get(fieldName);
    
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return `${fieldName === 'resolved_by' ? 'Nombre' : 'Campo'} es requerido`;
    }
    if (control.hasError('minlength')) {
      return `Mínimo 3 caracteres`;
    }
    if (control.hasError('pattern')) {
      return 'Ingrese un número válido';
    }

    return 'Error en este campo';
  }

  onCostInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/,/g, ''); // Remover comas existentes
    const numericValue = value.replace(/[^0-9.]/g, ''); // Solo números y punto decimal
    
    // Actualizar el valor del formulario (sin formato)
    this.resolveForm.patchValue({ actual_cost: numericValue }, { emitEvent: false });
    
    // Formatear para mostrar
    if (numericValue) {
      const parts = numericValue.split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const decimalPart = parts[1] !== undefined ? '.' + parts[1] : '';
      this.formattedCost = integerPart + decimalPart;
    } else {
      this.formattedCost = '';
    }
  }

  onCostBlur(): void {
    const value = this.resolveForm.get('actual_cost')?.value;
    if (value) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Formatear manteniendo los decimales que el usuario ingresó
        const formatted = numValue.toLocaleString('en-US');
        this.formattedCost = formatted;
        this.resolveForm.patchValue({ actual_cost: numValue.toString() }, { emitEvent: false });
      }
    }
  }
}
