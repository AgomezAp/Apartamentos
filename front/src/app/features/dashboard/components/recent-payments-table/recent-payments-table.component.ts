import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../payments/services/payment.service';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

interface RecentPayment {
  id: number;
  payment_date: string;
  tenant_name: string;
  unit_number: string;
  building_name: string;
  payment_method: string;
  amount_paid: number;
  status: string;
}

@Component({
  selector: 'app-recent-payments-table',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './recent-payments-table.component.html',
  styleUrl: './recent-payments-table.component.css'
})
export class RecentPaymentsTableComponent implements OnInit, OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  
  payments: RecentPayment[] = [];
  loading = false;
  error: string | null = null;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadRecentPayments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['startDate'] || changes['endDate']) && !changes['startDate']?.firstChange) {
      this.loadRecentPayments();
    }
  }

  loadRecentPayments(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.paymentService.getAll({
      start_date: this.startDate,
      end_date: this.endDate,
      status: 'completed'
    }).subscribe({
      next: (response: any) => {
        this.payments = (response.data || []).slice(0, 10);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recent payments:', error);
        this.error = 'Error al cargar pagos recientes';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pagado': 'status-paid',
      'Parcial': 'status-partial',
      'Pendiente': 'status-pending'
    };
    return statusMap[status] || 'status-default';
  }

  getMethodIcon(method: string): string {
    const iconMap: { [key: string]: string } = {
      'Efectivo': '💵',
      'Transferencia': '🏦',
      'Tarjeta': '💳',
      'Cheque': '📝'
    };
    return iconMap[method] || '💰';
  }
}
