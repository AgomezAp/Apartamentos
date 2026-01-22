import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Payment, PaymentMethods } from '../../models/payment.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-payment-card',
  imports: [CommonModule, RouterModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './payment-card.component.html',
  styleUrl: './payment-card.component.css'
})
export class PaymentCardComponent {
  @Input() payment!: Payment;
  @Input() receiptCount: number = 0;
  @Output() delete = new EventEmitter<number>();
  @Output() markCompleted = new EventEmitter<number>();

  onDelete(): void {
    if (confirm('¿Está seguro de eliminar este pago?')) {
      this.delete.emit(this.payment.id || this.payment.payment_id!);
    }
  }

  onMarkCompleted(): void {
    if (confirm('¿Marcar este pago como completado?')) {
      this.markCompleted.emit(this.payment.id || this.payment.payment_id!);
    }
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    const classes: { [key: string]: string } = {
      'pending': 'status-pending',
      'partial': 'status-partial',
      'completed': 'status-completed',
      'overdue': 'status-overdue',
      'cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Desconocido';
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'partial': 'Parcial',
      'completed': 'Completado',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getPaymentMethodIcon(method: string | undefined): string {
    if (!method) return '📋';
    const pm = PaymentMethods.find(m => m.value === method);
    return pm?.icon || '📋';
  }

  getPaymentMethodLabel(method: string | undefined): string {
    if (!method) return 'No especificado';
    const pm = PaymentMethods.find(m => m.value === method);
    return pm?.label || method;
  }

  getDaysUntilDue(dueDate: string | undefined): number {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: string | undefined, status: string | undefined): boolean {
    if (!status || !dueDate) return false;
    return status === 'overdue' || (status === 'pending' && new Date(dueDate) < new Date());
  }
}
