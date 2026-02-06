import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Expense } from '../../models/expense.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './expense-detail.component.html',
  styleUrl: './expense-detail.component.css'
})
export class ExpenseDetailComponent implements OnInit {
  expense: Expense | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadExpense();
  }

  loadExpense(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de gasto no válido';
      this.loading = false;
      return;
    }

    this.expenseService.getExpenseById(Number(id)).subscribe({
      next: (response) => {
        if (response.data) {
          this.expense = {
            ...response.data,
            expense_id: response.data.expense_id || response.data.id
          } as Expense;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el gasto';
        this.loading = false;
        console.error('Error loading expense:', error);
      }
    });
  }

  onDelete(): void {
    if (!this.expense) return;

    if (confirm(`¿Está seguro de eliminar el gasto "${this.expense.description}"?`)) {
      const expenseId = this.expense.id || this.expense.expense_id;
      if (!expenseId) {
        this.error = 'No se puede eliminar: ID no válido';
        return;
      }
      this.expenseService.deleteExpense(expenseId).subscribe({
        next: () => {
          this.router.navigate(['/expenses']);
        },
        error: (error) => {
          this.notificationService.showError('Error al eliminar el gasto');
          console.error('Error deleting expense:', error);
        }
      });
    }
  }

  onEdit(): void {
    if (this.expense) {
      const expenseId = this.expense.id || this.expense.expense_id;
      this.router.navigate(['/expenses', expenseId, 'edit']);
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
