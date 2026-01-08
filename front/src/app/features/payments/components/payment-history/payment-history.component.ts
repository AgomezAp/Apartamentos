import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import { Payment, PaymentMethods } from '../../models/payment.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-payment-history',
  imports: [CommonModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.css'
})
export class PaymentHistoryComponent implements OnInit {
  @Input() tenantId?: number;
  @Input() unitId?: number;
  @Input() limit: number = 10;

  payments: Payment[] = [];
  loading = false;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    const filter: any = { status: 'completed' };
    
    if (this.tenantId) {
      filter.tenant_id = this.tenantId;
    }
    if (this.unitId) {
      filter.unit_id = this.unitId;
    }

    this.paymentService.getAll(filter).subscribe({
      next: (response:any) => {
        const paymentData = response.data || [];
        this.payments = paymentData.slice(0, this.limit);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading payment history:', error);
        this.loading = false;
      }
    });
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

  get totalAmount(): number {
    return this.payments.reduce((sum, p) => sum + p.amount, 0);
  }
}
