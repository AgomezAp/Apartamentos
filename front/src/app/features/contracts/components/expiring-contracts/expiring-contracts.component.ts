import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExpiringContract } from '../../models/contract.model';
import { ContractService } from '../../services/contract.service';

@Component({
  selector: 'app-expiring-contracts',
  imports: [CommonModule, RouterModule],
  templateUrl: './expiring-contracts.component.html',
  styleUrl: './expiring-contracts.component.css'
})
export class ExpiringContractsComponent implements OnInit {
  @Input() days: number = 30;
  expiringContracts: ExpiringContract[] = [];
  loading = false;
  error = '';

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.loadExpiringContracts();
  }

  loadExpiringContracts(): void {
    this.loading = true;
    this.error = '';
    this.contractService.getExpiringContracts(this.days).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.expiringContracts = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar contratos por vencer';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getUrgencyClass(daysUntilExpiry: number): string {
    if (daysUntilExpiry <= 7) return 'urgent';
    if (daysUntilExpiry <= 15) return 'warning';
    return 'normal';
  }

  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
}
