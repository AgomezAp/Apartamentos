import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Building, BuildingFormData } from '../../models/building.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-building-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './building-form.component.html',
  styleUrl: './building-form.component.css'
})
export class BuildingFormComponent implements OnInit, OnChanges {
  @Input() building?: Building;
  @Input() isEditMode: boolean = false;
  @Output() onSubmit = new EventEmitter<BuildingFormData>();
  @Output() onCancel = new EventEmitter<void>();

  buildingForm!: FormGroup;
  isLoading = false;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['building'] && this.buildingForm) {
      this.updateFormValues();
    }
  }

  /**
   * Inicializar formulario
   */
  private initForm(): void {
    this.buildingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zip_code: ['', [Validators.pattern(/^[0-9]{6}$/)]],
      country: ['Colombia'],
      total_units: [0, [Validators.required, Validators.min(1)]],
      year_built: ['', [Validators.min(1900), Validators.max(this.currentYear)]],
      floors: ['', [Validators.min(1)]],
      description: [''],
      amenities: [''],
      is_active: [true]
    });

    if (this.building) {
      this.updateFormValues();
    }
  }

  /**
   * Actualizar valores del formulario
   */
  private updateFormValues(): void {
    if (this.building) {
      this.buildingForm.patchValue({
        name: this.building.name,
        address: this.building.address,
        city: this.building.city,
        state: this.building.state,
        zip_code: this.building.zip_code,
        country: this.building.country || 'Colombia',
        total_units: this.building.total_units,
        year_built: this.building.year_built,
        floors: this.building.floors,
        description: this.building.description,
        amenities: this.building.amenities,
        is_active: this.building.is_active !== false
      });
    }
  }

  /**
   * Submit del formulario
   */
  submitForm(): void {
    if (this.buildingForm.invalid) {
      this.markFormGroupTouched(this.buildingForm);
      // Mostrar errores específicos al usuario
      const errorMessages = this.getFormValidationErrors();
      if (errorMessages.length > 0) {
        this.notificationService.showError(
          `Por favor corrige los siguientes errores:\n\n${errorMessages.join('\n')}`,
          'Formulario incompleto'
        );
      }
      return;
    }

    const formData: BuildingFormData = this.buildingForm.value;
    this.onSubmit.emit(formData);
  }

  /**
   * Obtiene los mensajes de error de validación del formulario
   */
  private getFormValidationErrors(): string[] {
    const errors: string[] = [];
    const fieldLabels: Record<string, string> = {
      'name': 'Nombre',
      'address': 'Dirección',
      'city': 'Ciudad',
      'state': 'Departamento',
      'zip_code': 'Código postal',
      'country': 'País',
      'total_units': 'Total de unidades',
      'year_built': 'Año de construcción',
      'floors': 'Número de pisos',
      'description': 'Descripción',
      'amenities': 'Amenidades',
    };

    Object.keys(this.buildingForm.controls).forEach(key => {
      const control = this.buildingForm.get(key);
      if (control?.invalid) {
        const label = fieldLabels[key] || key;
        if (control.errors?.['required']) {
          errors.push(`• ${label}: Este campo es requerido`);
        } else if (control.errors?.['minlength']) {
          errors.push(`• ${label}: Mínimo ${control.errors['minlength'].requiredLength} caracteres`);
        } else if (control.errors?.['min']) {
          errors.push(`• ${label}: El valor mínimo es ${control.errors['min'].min}`);
        } else if (control.errors?.['max']) {
          errors.push(`• ${label}: El valor máximo es ${control.errors['max'].max}`);
        } else if (control.errors?.['pattern']) {
          errors.push(`• ${label}: Formato inválido`);
        } else {
          errors.push(`• ${label}: Valor inválido`);
        }
      }
    });

    return errors;
  }

  /**
   * Cancelar formulario
   */
  cancel(): void {
    this.onCancel.emit();
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
   * Verificar si un campo tiene error
   */
  hasError(field: string, error: string): boolean {
    const control = this.buildingForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  /**
   * Obtener mensaje de error
   */
  getErrorMessage(field: string): string {
    const control = this.buildingForm.get(field);
    
    if (!control || !control.touched) return '';

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (control.hasError('min')) {
      const min = control.getError('min').min;
      return `El valor mínimo es ${min}`;
    }

    if (control.hasError('max')) {
      const max = control.getError('max').max;
      return `El valor máximo es ${max}`;
    }

    if (control.hasError('pattern') && field === 'zip_code') {
      return 'Código postal inválido (6 dígitos)';
    }
    
    return '';
  }

  /**
   * Resetear formulario
   */
  resetForm(): void {
    this.buildingForm.reset({
      country: 'Colombia',
      is_active: true
    });
  }
}
