import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Unit, UnitFormData } from '../../models/unit.model';
import { BuildingService } from '../../../buildings/services/building.service';
import { Building } from '../../../buildings/models/building.model';
import { NumberFormatDirective } from '../../../../shared/directives/number-format.directive';
import { CatalogService } from '../../../catalogs/service/catalog.service';
import { UnitType } from '../../../catalogs/service/models/catalog.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NumberFormatDirective],
  templateUrl: './unit-form.component.html',
  styleUrl: './unit-form.component.css'
})

export class UnitFormComponent implements OnInit, OnChanges {
  @Input() unit?: Unit;
  @Input() submitButtonText: string = 'Guardar';
  @Output() formSubmit = new EventEmitter<UnitFormData>();
  @Output() formCancel = new EventEmitter<void>();

  unitForm!: FormGroup;
  buildings: Building[] = [];
  unitTypes: UnitType[] = [];
  isLoading = false;

  statusOptions = [
    { value: 'available', label: 'Disponible' },
    { value: 'occupied', label: 'Ocupada' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'reserved', label: 'Reservada' }
  ];

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private catalogService: CatalogService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBuildings();
    this.loadUnitTypes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unit'] && this.unitForm) {
      this.patchFormValues();
    }
  }

  initForm(): void {
    this.unitForm = this.fb.group({
      building_id: [null, Validators.required],
      unit_number: ['', [Validators.required, Validators.maxLength(20)]],
      floor: [null],
      unit_type_id: ['', Validators.required],
      bedrooms: [null, [Validators.min(0)]],
      bathrooms: [null, [Validators.min(0)]],
      area_sqm: [null, [Validators.min(0)]],
      status: ['available', Validators.required],
      monthly_rent: [null, [Validators.min(0)]],
      deposit_required: [null, [Validators.min(0)]],
      furnished: [false],
      description: [''],
      amenities: [[]] 
    });

    if (this.unit) {
      this.patchFormValues();
    }
  }

  patchFormValues(): void {
    if (this.unit) {
      this.unitForm.patchValue({
        building_id: this.unit.building_id,
        unit_number: this.unit.unit_number,
        floor: this.unit.floor,
        unit_type_id: this.unit.unit_type_id,
        bedrooms: this.unit.bedrooms,
        bathrooms: this.unit.bathrooms,
        area_sqm: this.unit.area_sqm,
        status: this.unit.status,
        monthly_rent: this.unit.monthly_rent,
        deposit_required: this.unit.deposit_required,
        furnished: this.unit.furnished,
        description: this.unit.description,
        amenities: this.unit.amenities || []
      });
    }
  }

  loadBuildings(): void {
    this.buildingService.getBuildings().subscribe({
      next: (response) => {
        this.buildings = response.data || [];
      },
      error: (error) => console.error('Error loading buildings:', error)
    });
  }

  loadUnitTypes(): void {
    this.catalogService.getUnitTypes().subscribe({
      next: (response) => {
        this.unitTypes = response.data || [];
      },
      error: (error) => console.error('Error loading unit types:', error)
    });
  }

  onSubmit(): void {
    if (this.unitForm.valid) {
      const formValue = { ...this.unitForm.value };
      // Limpiar números formateados (solo los campos de texto con formato)
      if (formValue.area_sqm) formValue.area_sqm = Number(String(formValue.area_sqm).replace(/\./g, ''));
      if (formValue.monthly_rent) formValue.monthly_rent = Number(String(formValue.monthly_rent).replace(/\./g, ''));
      if (formValue.deposit_required) formValue.deposit_required = Number(String(formValue.deposit_required).replace(/\./g, ''));
      
      // Debug: ver qué se está enviando
      console.log('📤 Datos del formulario a enviar:', formValue);
      
      this.formSubmit.emit(formValue);
    } else {
      this.markFormGroupTouched(this.unitForm);
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
      'building_id': 'Edificio',
      'unit_number': 'Número de unidad',
      'floor': 'Piso',
      'unit_type_id': 'Tipo de unidad',
      'bedrooms': 'Habitaciones',
      'bathrooms': 'Baños',
      'area_sqm': 'Área (m²)',
      'status': 'Estado',
      'monthly_rent': 'Renta mensual',
      'deposit_required': 'Depósito requerido',
      'furnished': 'Amueblado',
      'description': 'Descripción',
    };

    Object.keys(this.unitForm.controls).forEach(key => {
      const control = this.unitForm.get(key);
      if (control?.invalid) {
        const label = fieldLabels[key] || key;
        if (control.errors?.['required']) {
          errors.push(`• ${label}: Este campo es requerido`);
        } else if (control.errors?.['min']) {
          errors.push(`• ${label}: El valor mínimo es ${control.errors['min'].min}`);
        } else if (control.errors?.['maxlength']) {
          errors.push(`• ${label}: Máximo ${control.errors['maxlength'].requiredLength} caracteres`);
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
    const field = this.unitForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.unitForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['maxLength']) return `Máximo ${field.errors['maxLength'].requiredLength} caracteres`;
    }
    return '';
  }
}
