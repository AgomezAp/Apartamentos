import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { RecentPayment } from '../../models/dashboard.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-recent-payments',
  imports: [CommonModule, RouterModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './recent-payments.component.html',
  styleUrl: './recent-payments.component.css'
})
export class RecentPaymentsComponent implements OnInit {
  payments: RecentPayment[] = [];
  loading = false;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.getRecentPayments(10).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.payments = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar pagos recientes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      case 'partial': return 'Parcial';
      default: return status;
    }
  }
}
