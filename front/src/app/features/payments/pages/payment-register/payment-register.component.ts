import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { Payment, PaymentFilter, MonthlyPayment } from '../../models/payment.model';
import { PaymentHistoryComponent } from '../../components/payment-history/payment-history.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-payment-register',
  imports: [CommonModule, RouterModule, FormsModule, PaymentHistoryComponent, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './payment-register.component.html',
  styleUrl: './payment-register.component.css'
})
export class PaymentRegisterComponent implements OnInit {
  payments: Payment[] = [];
  monthlyData: MonthlyPayment[] = [];
  loading = false;
  
  // Filters
  filter: PaymentFilter = {
    start_date: this.getFirstDayOfMonth(),
    end_date: this.getLastDayOfMonth()
  };

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadMonthlyData();
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getAll(this.filter).subscribe({
      next: (response) => {
        this.payments = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.loading = false;
      }
    });
  }

  loadMonthlyData(): void {
    // TODO: Implement getMonthlyPayments in PaymentService
    // this.paymentService.getMonthlyPayments().subscribe({
    //   next: (data) => {
    //     this.monthlyData = data;
    //   },
    //   error: (error) => {
    //     console.error('Error loading monthly data:', error);
    //   }
    // });
  }

  applyFilters(): void {
    this.loadPayments();
  }

  clearFilters(): void {
    this.filter = {
      start_date: this.getFirstDayOfMonth(),
      end_date: this.getLastDayOfMonth()
    };
    this.loadPayments();
  }

  exportToExcel(): void {
    // TODO: Implement Excel export
    alert('Funcionalidad de exportación en desarrollo');
  }

  exportToPDF(): void {
    // TODO: Implement PDF export
    alert('Funcionalidad de exportación en desarrollo');
  }

  getFirstDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  }

  getLastDayOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  get summary() {
    return {
      total: this.payments.reduce((sum, p) => sum + p.amount, 0),
      count: this.payments.length,
      completed: this.payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      pending: this.payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      overdue: this.payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0)
    };
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Desconocido';
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'completed': 'Completado',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string | undefined): string {
    return `status-${status || 'unknown'}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
