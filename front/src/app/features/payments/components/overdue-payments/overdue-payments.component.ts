import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../models/payment.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-overdue-payments',
  imports: [CommonModule, RouterModule, CurrencyFormatPipe],
  templateUrl: './overdue-payments.component.html',
  styleUrl: './overdue-payments.component.css'
})
export class OverduePaymentsComponent implements OnInit {
  overduePayments: Payment[] = [];
  loading = false;
  totalOverdue = 0;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadOverduePayments();
  }

  loadOverduePayments(): void {
    this.loading = true;
    this.paymentService.getAll({ status: 'overdue' }).subscribe({
      next: (response) => {
        this.overduePayments = response.data || [];
        this.totalOverdue = (response.data || []).reduce((sum: number, p: any) => sum + p.amount, 0);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading overdue payments:', error);
        this.loading = false;
      }
    });
  }

  getDaysOverdue(dueDate: string | undefined): number {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diff = today.getTime() - due.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  onPaymentUpdate(): void {
    this.loadOverduePayments();
  }
}
