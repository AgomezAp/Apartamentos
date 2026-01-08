import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractPaymentInfo } from '../../models/contract.model';
import { ContractService } from '../../services/contract.service';

@Component({
  selector: 'app-contract-payments',
  imports: [CommonModule],
  templateUrl: './contract-payments.component.html',
  styleUrl: './contract-payments.component.css'
})
export class ContractPaymentsComponent implements OnInit {
  @Input() contractId!: number;
  paymentInfo?: ContractPaymentInfo;
  loading = false;
  error = '';

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    if (this.contractId) {
      this.loadPaymentInfo();
    }
  }

  loadPaymentInfo(): void {
    this.loading = true;
    this.error = '';
    this.contractService.getContractPayments(this.contractId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.paymentInfo = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar información de pagos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getPaymentProgress(): number {
    if (!this.paymentInfo || this.paymentInfo.total_payments === 0) return 0;
    return (this.paymentInfo.paid_payments / this.paymentInfo.total_payments) * 100;
  }

  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
