import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Payment, PaymentFormData } from '../../models/payment.model';
import { Contract } from '../../../contracts/models/contract.model';
import { Tenant } from '../../../tenants/models/tenant.model';
import { Unit } from '../../../units/models/unit.model';
import { NumberFormatDirective } from '../../../../shared/directives/number-format.directive';

@Component({
  selector: 'app-payment-form',
  imports: [CommonModule, ReactiveFormsModule, NumberFormatDirective],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.css'
})
export class PaymentFormComponent implements OnInit {
  @Input() payment?: Payment;
  @Input() contracts: Contract[] = [];
  @Input() tenants: Tenant[] = [];
  @Input() units: Unit[] = [];
  @Output() submit = new EventEmitter<PaymentFormData>();
  @Output() cancel = new EventEmitter<void>();

  paymentForm!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.setupContractChangeListener();
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      contract_id: [this.payment?.contract_id || '', Validators.required],
      tenant_id: [this.payment?.tenant_id || '', Validators.required],
      tenant_id_hidden: [this.payment?.tenant_id || '', Validators.required],
      unit_id: [this.payment?.unit_id || '', Validators.required],
      unit_id_hidden: [this.payment?.unit_id || '', Validators.required],
      amount_due: [this.payment?.amount_due || this.payment?.amount || '', [Validators.required, this.minValidator(50000)]],
      due_date: [this.payment?.due_date?.split('T')[0] || '', Validators.required],
      payment_status_id: [this.payment?.payment_status_id || 1, Validators.required], // 1 = Pendiente por defecto
      payment_method: [this.payment?.payment_method || ''],
      notes: [this.payment?.notes || '']
    });
  }

  /**
   * Validador personalizado para monto que acepta formato con puntos de miles
   */
  private minValidator(minValue: number) {
    return (control: any) => {
      if (!control.value) {
        return null;
      }
      
      // Remover puntos de miles para parseación
      const cleanValue = control.value.toString().replace(/\./g, '');
      const numValue = Number(cleanValue);
      
      if (isNaN(numValue)) {
        return { invalidNumber: true };
      }
      
      return numValue >= minValue ? null : { min: { min: minValue, actual: numValue } };
    };
  }

  /**
   * Escuchar cambios en contract_id y llenar automáticamente los datos relacionados
   */
  private setupContractChangeListener(): void {
    this.paymentForm.get('contract_id')?.valueChanges.subscribe((contractId) => {
      if (contractId) {
        // Buscar el contrato seleccionado
        const selectedContract = this.contracts.find(c => c.id === parseInt(contractId));
        
        if (selectedContract) {
          // Obtener los nombres/números para mostrar
          const tenantDisplay = selectedContract.tenant_name || 'Desconocido';
          const unitDisplay = selectedContract.unit_number || 'Desconocida';
          
          // Actualizar automáticamente los campos del formulario incluyendo el monto
          const monthlyRent = selectedContract.monthly_rent || 0;
          
          this.paymentForm.patchValue({
            tenant_id: tenantDisplay,
            tenant_id_hidden: selectedContract.tenant_id,
            unit_id: unitDisplay,
            unit_id_hidden: selectedContract.unit_id,
            amount_due: monthlyRent.toString(),
            payment_status_id: 1 // Pendiente por defecto (se actualizará automáticamente según fecha)
          }, { emitEvent: false });
          
          console.log('✅ Datos del contrato cargados automáticamente:', {
            tenant_id: selectedContract.tenant_id,
            tenant_name: selectedContract.tenant_name,
            unit_id: selectedContract.unit_id,
            unit_number: selectedContract.unit_number
          });
        }
      }
    });

    // Auto-detectar estado basándose en fecha de vencimiento y monto
    const updatePaymentStatus = () => {
      const dueDate = this.paymentForm.get('due_date')?.value;
      const amountDue = this.paymentForm.get('amount_due')?.value;
      const contractId = this.paymentForm.get('contract_id')?.value;
      
      if (!dueDate || !amountDue || !contractId) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateObj = new Date(dueDate);
      dueDateObj.setHours(0, 0, 0, 0);
      
      const selectedContract = this.contracts.find(c => c.id === parseInt(contractId));
      if (!selectedContract || !selectedContract.monthly_rent) return;
      
      const cleanAmountDue = amountDue.toString().replace(/\./g, '');
      const amount = Number(cleanAmountDue);
      const monthlyRent = selectedContract.monthly_rent;
      
      // Determinar estado según fecha y monto
      if (dueDateObj > today) {
        // Fecha futura = Pendiente
        this.paymentForm.patchValue({ payment_status_id: 1 }, { emitEvent: false });
      } else if (amount < monthlyRent) {
        // Pago parcial
        this.paymentForm.patchValue({ payment_status_id: 4 }, { emitEvent: false });
      } else {
        // Pago completo
        this.paymentForm.patchValue({ payment_status_id: 2 }, { emitEvent: false });
      }
    };
    
    // Escuchar cambios en monto
    this.paymentForm.get('amount_due')?.valueChanges.subscribe(() => updatePaymentStatus());
    
    // Escuchar cambios en fecha de vencimiento
    this.paymentForm.get('due_date')?.valueChanges.subscribe(() => updatePaymentStatus());
  }

  onSubmit(): void {
    console.log('🔷 PaymentFormComponent.onSubmit() called');
    console.log('Form valid:', this.paymentForm.valid);
    console.log('Form values:', this.paymentForm.value);
    
    if (this.paymentForm.valid) {
      // Obtener los valores del formulario
      const formValue = { ...this.paymentForm.value };
      
      // Limpiar el formato del amount_due antes de enviar
      const cleanAmount = formValue.amount_due.toString().replace(/\./g, '');
      const amountDue = Number(cleanAmount);
      
      // Parsear las fechas para obtener mes y año
      const dueDate = new Date(formValue.due_date);
      const periodMonth = dueDate.getMonth() + 1; // getMonth() retorna 0-11
      const periodYear = dueDate.getFullYear();
      
      // Construir el payload que espera el backend
      const payload: any = {
        contract_id: parseInt(formValue.contract_id, 10),
        period_month: periodMonth,
        period_year: periodYear,
        amount_due: amountDue,
        due_date: formValue.due_date,
        payment_status_id: parseInt(formValue.payment_status_id, 10),
        payment_method: formValue.payment_method || undefined,
        notes: formValue.notes || undefined
      };
      
      // Log para debugging
      console.log('📤 Payload construido en form component:', payload);
      console.log('🚀 Emitiendo evento submit...');
      
      this.submit.emit(payload);
    } else {
      console.log('❌ Formulario inválido');
      this.markFormGroupTouched(this.paymentForm);
    }
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
    const control = this.paymentForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      const error = control.getError('min');
      return `El valor mínimo es ${error.min.toLocaleString()}`;
    }
    if (control?.hasError('invalidNumber')) {
      return 'El valor debe ser un número válido';
    }
    return '';
  }
}
