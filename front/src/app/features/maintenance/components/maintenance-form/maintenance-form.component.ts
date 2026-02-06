import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaintenanceRequest, MaintenanceFormData, MaintenancePriorities } from '../../models/miantenance.model';
import { Unit } from '../../../units/models/unit.model';
import { Tenant } from '../../../tenants/models/tenant.model';
import { Building } from '../../../buildings/models/building.model';
import { ExpenseCategoryService, ExpenseCategory } from '../../../expense-categories/services/expense-category.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './maintenance-form.component.html',
  styleUrl: './maintenance-form.component.css'
})
export class MaintenanceFormComponent implements OnInit {
  @Input() request?: MaintenanceRequest;
  @Input() buildings: Building[] = [];
  @Input() units: Unit[] = [];
  @Input() tenants: Tenant[] = [];
  @Output() buildingChange = new EventEmitter<number>();
  @Output() unitChange = new EventEmitter<number>();
  @Output() submit = new EventEmitter<MaintenanceFormData>();
  @Output() cancel = new EventEmitter<void>();

  maintenanceForm!: FormGroup;
  categories: ExpenseCategory[] = [];
  priorities = MaintenancePriorities;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private expenseCategoryService: ExpenseCategoryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();
  }

  loadCategories(): void {
    this.expenseCategoryService.getAll().subscribe({
      next: (response) => {
        this.categories = response.data || [];
        console.log('Categorías cargadas:', this.categories);
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
      }
    });
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.maintenanceForm = this.fb.group({
      building_id: [this.request?.building_name || '', Validators.required],
      unit_id: [this.request?.unit_id || '', Validators.required],
      tenant_id: [this.request?.tenant_id || '', []], // No requiere validación, puede estar vacío
      category: [this.request?.category || '', Validators.required],
      priority: [this.request?.priority || 'medium', Validators.required],
      title: [this.request?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [this.request?.description || '', [Validators.required, Validators.minLength(10)]],
      scheduled_date: [this.request?.scheduled_date?.split('T')[0] || ''],
      estimated_cost: [this.request?.estimated_cost || ''],
      assigned_to: [this.request?.assigned_to || '']
    });
  }

  onBuildingChange(buildingId: string): void {
    if (buildingId) {
      this.buildingChange.emit(parseInt(buildingId));
    }
  }

  onUnitChange(unitId: string): void {
    if (unitId) {
      this.unitChange.emit(parseInt(unitId));
    }
  }

  onSubmit(): void {
    if (this.maintenanceForm.valid) {
      this.loading = true;
      const formValue = this.maintenanceForm.value;
      
      // Convertir valores a números
      const formData: MaintenanceFormData = {
        building_id: parseInt(formValue.building_id),
        unit_id: parseInt(formValue.unit_id),
        tenant_id: formValue.tenant_id ? parseInt(formValue.tenant_id) : undefined,
        category: formValue.category,
        priority: formValue.priority,
        title: formValue.title,
        description: formValue.description,
        scheduled_date: formValue.scheduled_date || undefined,
        estimated_cost: formValue.estimated_cost ? parseFloat(formValue.estimated_cost) : undefined,
        assigned_to: formValue.assigned_to || undefined
      };
      
      this.submit.emit(formData);
    } else {
      this.markFormGroupTouched(this.maintenanceForm);
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
      'unit_id': 'Unidad',
      'tenant_id': 'Inquilino',
      'category': 'Categoría',
      'priority': 'Prioridad',
      'title': 'Título',
      'description': 'Descripción',
      'scheduled_date': 'Fecha programada',
      'estimated_cost': 'Costo estimado',
      'assigned_to': 'Asignado a',
    };

    Object.keys(this.maintenanceForm.controls).forEach(key => {
      const control = this.maintenanceForm.get(key);
      if (control?.invalid) {
        const label = fieldLabels[key] || key;
        if (control.errors?.['required']) {
          errors.push(`• ${label}: Este campo es requerido`);
        } else if (control.errors?.['minlength']) {
          errors.push(`• ${label}: Mínimo ${control.errors['minlength'].requiredLength} caracteres`);
        } else {
          errors.push(`• ${label}: Valor inválido`);
        }
      }
    });

    return errors;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.maintenanceForm.get(fieldName);
    if (control?.hasError('required')) return 'Este campo es requerido';
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
}
