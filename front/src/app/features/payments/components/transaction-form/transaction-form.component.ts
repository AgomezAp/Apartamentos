import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Transaction, TransactionFormData, PaymentMethods, TransactionTypes } from '../../models/payment.model';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-transaction-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})
export class TransactionFormComponent implements OnInit {
  @Input() transaction?: Transaction;
  @Input() payment?: Payment;
  @Output() submit = new EventEmitter<TransactionFormData>();
  @Output() cancel = new EventEmitter<void>();

  transactionForm!: FormGroup;
  paymentMethods = PaymentMethods;
  transactionTypes = TransactionTypes;
  loading = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      payment_id: [this.payment?.id || this.payment?.payment_id || this.transaction?.payment_id || '', Validators.required],
      amount: [this.transaction?.amount || '', [Validators.required, Validators.min(0)]],
      transaction_date: [this.transaction?.transaction_date?.split('T')[0] || new Date().toISOString().split('T')[0], Validators.required],
      transaction_type: [this.transaction?.transaction_type || 'payment', Validators.required],
      payment_method: [this.transaction?.payment_method || 'cash', Validators.required],
      reference_number: [this.transaction?.reference_number || ''],
      notes: [this.transaction?.notes || '']
    });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.submit.emit(this.transactionForm.value);
    } else {
      this.markFormGroupTouched(this.transactionForm);
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
    const control = this.transactionForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }
}
