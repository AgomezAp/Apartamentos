import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Contract, ContractFormData } from '../../models/contract.model';
import { NumberOnlyDirective } from '../../../../shared/directives/number-only.directive';

@Component({
  selector: 'app-contract-form',
  imports: [CommonModule, ReactiveFormsModule, NumberOnlyDirective],
  templateUrl: './contract-form.component.html',
  styleUrl: './contract-form.component.css'
})
export class ContractFormComponent implements OnInit {
  @Input() contract?: Contract;
  @Input() units: any[] = [];
  @Input() tenants: any[] = [];
  @Input() buildings: any[] = [];
  @Output() onSubmit = new EventEmitter<ContractFormData>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() buildingSelected = new EventEmitter<number>();

  contractForm!: FormGroup;
  isEditMode = false;
  filteredUnits: any[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode = !!this.contract;
    this.initForm();
    if (this.contract) {
      this.patchFormValues();
    }
    // Inicializar unidades filtradas
    this.onBuildingChange();
    
    // Debug: Verificar estado del formulario
    console.log('📋 Formulario inicializado');
    console.log('🔍 Estado del campo deposit_amount:', this.contractForm.get('deposit_amount')?.status);
    console.log('💾 Valor del campo deposit_amount:', this.contractForm.get('deposit_amount')?.value);
    console.log('⚙️ Validadores del campo deposit_amount:', this.contractForm.get('deposit_amount')?.validator);
    console.log('📌 Enabled:', this.contractForm.get('deposit_amount')?.enabled);
    console.log('📌 Disabled:', this.contractForm.get('deposit_amount')?.disabled);
  }

  private initForm(): void {
    this.contractForm = this.fb.group({
      building_id: ['', Validators.required],
      unit_id: ['', Validators.required],
      tenant_id: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      monthly_rent: ['', [Validators.required, Validators.min(0)]],
      deposit_amount: ['', [Validators.min(0)]],  // Cambio: usar '' en lugar de 0, y sin required
      payment_day: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      status: ['pending'],
      notes: [''],
      has_rent_increase: [false],
      rent_increase_percentage: [0, [Validators.min(0), Validators.max(100)]],
      rent_increase_frequency_months: [12, [Validators.min(1)]]
    });

    // Escuchar cambios en el edificio
    this.contractForm.get('building_id')?.valueChanges.subscribe(() => {
      this.onBuildingChange();
    });
  }

  private patchFormValues(): void {
    if (this.contract) {
      this.contractForm.patchValue({
        building_id: this.contract.building_id || '',
        unit_id: this.contract.unit_id,
        tenant_id: this.contract.tenant_id,
        start_date: this.formatDateForInput(this.contract.start_date),
        end_date: this.formatDateForInput(this.contract.end_date),
        monthly_rent: null != this.contract.monthly_rent ? this.contract.monthly_rent.toString() : '',  // Convertir a string
        deposit_amount: null != this.contract.deposit_amount ? this.contract.deposit_amount.toString() : '',  // Convertir a string
        payment_day: this.contract.payment_day || 1,
        status: this.contract.status || 'pending',
        notes: this.contract.notes || '',
        has_rent_increase: this.contract.has_rent_increase || false,
        rent_increase_percentage: this.contract.rent_increase_percentage || 0,
        rent_increase_frequency_months: this.contract.rent_increase_frequency_months || 12
      });
      
      // Debug: Verificar estado después de patchValue
      setTimeout(() => {
        console.log('🔍 Después de patchValue:');
        console.log('✅ monthly_rent:', this.contractForm.get('monthly_rent')?.value, 'Enabled:', this.contractForm.get('monthly_rent')?.enabled);
        console.log('✅ deposit_amount:', this.contractForm.get('deposit_amount')?.value, 'Enabled:', this.contractForm.get('deposit_amount')?.enabled);
        console.log('✅ Validez del formulario:', this.contractForm.valid);
        console.log('✅ Estado del control deposit_amount:', this.contractForm.get('deposit_amount')?.status);
      }, 100);
    }
  }

  onBuildingChange(): void {
    const buildingId = this.contractForm.get('building_id')?.value;
    
    if (buildingId) {
      // Filtrar unidades por edificio seleccionado
      this.filteredUnits = this.units.filter(unit => unit.building_id === parseInt(buildingId));
      console.log(`Unidades para edificio ${buildingId}:`, this.filteredUnits.length);
      this.buildingSelected.emit(parseInt(buildingId));
    } else {
      this.filteredUnits = [];
    }
    
    // Limpiar la selección de unidad cuando cambia el edificio
    this.contractForm.get('unit_id')?.reset('');
  }

  private formatDateForInput(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  submit(): void {
    if (this.contractForm.valid) {
      const formValue = this.contractForm.value;
      // No incluir building_id en el payload, solo unit_id y tenant_id
      const payload: ContractFormData = {
        unit_id: formValue.unit_id,
        tenant_id: formValue.tenant_id,
        start_date: formValue.start_date,
        end_date: formValue.end_date,
        monthly_rent: formValue.monthly_rent ? Number(formValue.monthly_rent) : 0,
        deposit_amount: formValue.deposit_amount ? Number(formValue.deposit_amount) : 0,  // Convertir a número
        payment_day: formValue.payment_day,
        status: formValue.status,
        notes: formValue.notes,
        has_rent_increase: formValue.has_rent_increase,
        rent_increase_percentage: formValue.rent_increase_percentage,
        rent_increase_frequency_months: formValue.rent_increase_frequency_months,
      };
      this.onSubmit.emit(payload);
    }
  }

  cancel(): void {
    this.onCancel.emit();
  }

  get hasRentIncrease(): boolean {
    return this.contractForm.get('has_rent_increase')?.value || false;
  }
}
