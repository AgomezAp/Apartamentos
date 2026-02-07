import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Payment, PaymentFormData } from '../../models/payment.model';
import { Contract } from '../../../contracts/models/contract.model';
import { Tenant } from '../../../tenants/models/tenant.model';
import { Unit } from '../../../units/models/unit.model';
import { NumberFormatDirective } from '../../../../shared/directives/number-format.directive';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../../../core/services/notification.service';

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
  @Input() buildings: any[] = [];
  @Output() submit = new EventEmitter<PaymentFormData>();
  @Output() cancel = new EventEmitter<void>();
  @Output() buildingChange = new EventEmitter<number | undefined>();

  paymentForm!: FormGroup;
  loading = false;
  
  // Comprobantes
  receipts: any[] = [];
  uploadingReceipts = false;
  // Archivos seleccionados en modo creación (sin payment.id)
  pendingReceipts: File[] = [];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupContractChangeListener();
    this.setupBuildingChangeListener();
    if (this.payment?.id) {
      this.loadReceipts();
    }
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      building_id: [(this.payment as any)?.building_id || ''],
      contract_id: [this.payment?.contract_id || '', Validators.required],
      tenant_id: [this.payment?.tenant_id || '', Validators.required],
      tenant_id_hidden: [this.payment?.tenant_id || '', Validators.required],
      unit_id: [this.payment?.unit_id || '', Validators.required],
      unit_id_hidden: [this.payment?.unit_id || '', Validators.required],
      amount_due: [this.payment?.amount_due || this.payment?.amount || '', [Validators.required, this.minValidator(0)]],
      due_date: [this.payment?.due_date?.split('T')[0] || '', Validators.required],
      payment_status_id: [this.payment?.payment_status_id || 1, Validators.required], // 1 = Pendiente por defecto
      payment_method: [this.payment?.payment_method || ''],
      notes: [this.payment?.notes || '']
    });
  }

  private setupBuildingChangeListener(): void {
    this.paymentForm.get('building_id')?.valueChanges.subscribe((buildingId) => {
      // Reset contract and related fields when building changes
      this.paymentForm.patchValue({ contract_id: '', tenant_id: '', tenant_id_hidden: '', unit_id: '', unit_id_hidden: '' }, { emitEvent: false });
      const id = buildingId ? parseInt(buildingId, 10) : undefined;
      this.buildingChange.emit(id);
      console.log('PaymentFormComponent: building changed, emitted buildingChange =', id);
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
          
          // Formatear el monto con puntos de miles (920000 -> 920.000)
          const formattedRent = Math.round(monthlyRent).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          
          this.paymentForm.patchValue({
            tenant_id: tenantDisplay,
            tenant_id_hidden: selectedContract.tenant_id,
            unit_id: unitDisplay,
            unit_id_hidden: selectedContract.unit_id,
            amount_due: formattedRent,
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
      
      // Incluir comprobantes pendientes si estamos creando
      const hasPendingReceipts = this.pendingReceipts && this.pendingReceipts.length > 0;
      const payloadWithReceipts: any = hasPendingReceipts ? { ...payload, pending_receipts: this.pendingReceipts } : payload;
      this.submit.emit(payloadWithReceipts);
    } else {
      console.log('❌ Formulario inválido');
      this.markFormGroupTouched(this.paymentForm);
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
      'contract_id': 'Contrato',
      'tenant_id': 'Inquilino',
      'unit_id': 'Unidad',
      'amount_due': 'Monto a pagar',
      'due_date': 'Fecha de vencimiento',
      'payment_status_id': 'Estado del pago',
      'payment_method': 'Método de pago',
      'notes': 'Notas',
    };

    Object.keys(this.paymentForm.controls).forEach(key => {
      // Saltar los campos ocultos
      if (key.endsWith('_hidden')) return;
      
      const control = this.paymentForm.get(key);
      if (control?.invalid) {
        const label = fieldLabels[key] || key;
        if (control.errors?.['required']) {
          errors.push(`• ${label}: Este campo es requerido`);
        } else if (control.errors?.['min']) {
          errors.push(`• ${label}: El valor mínimo es ${control.errors['min'].min?.toLocaleString()}`);
        } else if (control.errors?.['invalidNumber']) {
          errors.push(`• ${label}: Debe ser un número válido`);
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

  // ========== Gestión de Comprobantes ==========
  loadReceipts(): void {
    if (!this.payment?.id) return;
    
    this.paymentService.getReceipts(this.payment.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.receipts = response.data || [];
        }
      },
      error: (err) => {
        console.error('Error cargando comprobantes:', err);
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    // Validar tamaño y tipo
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf') {
        this.notificationService.showError(`${file.name} no es un archivo PDF`, 'Archivo no válido');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.notificationService.showError(`${file.name} excede el límite de 10MB`, 'Archivo muy grande');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Si estamos editando (payment.id existe), subir inmediatamente
    if (this.payment?.id) {
      this.uploadingReceipts = true;
      this.paymentService.uploadReceipts(this.payment.id, validFiles).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(response.message || 'Comprobantes subidos', 'Éxito');
            this.loadReceipts();
          }
          this.uploadingReceipts = false;
          event.target.value = ''; // Reset input
        },
        error: (err) => {
          this.notificationService.showError(err.error?.error || 'Error subiendo comprobantes', 'Error');
          this.uploadingReceipts = false;
          event.target.value = '';
        }
      });
      return;
    }

    // En modo creación, guardar archivos para subir después de crear el pago
    this.pendingReceipts.push(...validFiles);
    this.notificationService.showSuccess(`${validFiles.length} archivo(s) preparado(s) para subir al crear el pago`);
    event.target.value = '';
  }

  deleteReceipt(receiptId: number): void {
    if (!confirm('¿Está seguro de eliminar este comprobante?')) return;

    this.paymentService.deleteReceipt(receiptId).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Comprobante eliminado', 'Éxito');
          this.loadReceipts();
        }
      },
      error: (err) => {
        this.notificationService.showError(err.error?.error || 'Error eliminando comprobante', 'Error');
      }
    });
  }

  getDownloadUrl(receiptId: number): string {
    return this.paymentService.downloadReceipt(receiptId);
  }

  downloadReceipt(receipt: any): void {
    if (!receipt?.id) return;
    this.paymentService.downloadReceiptFile(receipt.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = receipt.original_name || 'comprobante.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.notificationService.showError(err?.error || 'Error descargando comprobante', 'Error');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Remover archivo pendiente en modo creación
  removePending(index: number): void {
    this.pendingReceipts.splice(index, 1);
  }
}
