import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TenantsService } from '../../services/tenants.service';
import { TenantContract, CONTRACT_STATUS } from '../../models/tenant.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-tenant-contracts',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './tenant-contracts.component.html',
  styleUrl: './tenant-contracts.component.css'
})
export class TenantContractsComponent implements OnInit {
  @Input() tenantId!: number;

  contracts: TenantContract[] = [];
  activeContract: TenantContract | null = null;
  isLoading = false;
  contractStatuses = CONTRACT_STATUS;

  constructor(private tenantsService: TenantsService) {}

  ngOnInit(): void {
    if (this.tenantId) {
      this.loadContracts();
      this.loadActiveContract();
    }
  }

  private loadContracts(): void {
    this.isLoading = true;
    this.tenantsService.getTenantContracts(this.tenantId).subscribe({
      next: (response) => {
        this.contracts = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar contratos:', error);
        this.isLoading = false;
      }
    });
  }

  private loadActiveContract(): void {
    this.tenantsService.getActiveContract(this.tenantId).subscribe({
      next: (response) => {
        this.activeContract = response.data || null;
      },
      error: (error) => {
        console.error('Error al cargar contrato activo:', error);
      }
    });
  }

  getStatusConfig(status: string) {
    return this.contractStatuses.find(s => s.value === status) || this.contractStatuses[0];
  }

  getDurationInMonths(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
    return months;
  }

  isExpiringSoon(contract: TenantContract): boolean {
    if (contract.status !== 'active') return false;
    const endDate = new Date(contract.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }
}
