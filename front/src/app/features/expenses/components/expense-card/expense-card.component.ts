import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Expense } from '../../models/expense.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './expense-card.component.html',
  styleUrl: './expense-card.component.css'
})
export class ExpenseCardComponent {
  @Input() expense!: Expense;
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  onDelete(): void {
    if (confirm(`¿Está seguro de eliminar el gasto "${this.expense.description}"?`)) {
      const expenseId = this.expense.id || this.expense.expense_id;
      if (expenseId) {
        this.delete.emit(expenseId);
      }
    }
  }

  onEdit(): void {
    const expenseId = this.expense.id || this.expense.expense_id;
    if (expenseId) {
      this.edit.emit(expenseId);
    }
  }

  getPaymentMethodLabel(method: string | undefined): string {
    if (!method) return 'No especificado';
    const methods: { [key: string]: string } = {
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'check': 'Cheque',
      'card': 'Tarjeta',
      'other': 'Otro'
    };
    return methods[method] || method;
  }

  getPaymentMethodIcon(method: string | undefined): string {
    if (!method) return '💰';
    const icons: { [key: string]: string } = {
      'cash': '💵',
      'transfer': '💳',
      'check': '📄',
      'card': '💳',
      'other': '💰'
    };
    return icons[method] || '💰';
  }

}
