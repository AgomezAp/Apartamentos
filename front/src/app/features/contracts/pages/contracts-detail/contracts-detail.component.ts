import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { Contract } from '../../models/contract.model';
import { ContractTimelineComponent } from '../../components/contract-timeline/contract-timeline.component';
import { ContractPaymentsComponent } from '../../components/contract-payments/contract-payments.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-contracts-detail',
  imports: [CommonModule, RouterModule, ContractTimelineComponent, ContractPaymentsComponent],
  templateUrl: './contracts-detail.component.html',
  styleUrl: './contracts-detail.component.css'
})
export class ContractsDetailComponent implements OnInit {
  contract?: Contract;
  loading = false;
  error = '';
  contractId!: number;
  activeTab = 'info';

  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.contractId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.contractId) {
      this.loadContract();
    }
  }

  loadContract(): void {
    this.loading = true;
    this.error = '';
    this.contractService.getContractById(this.contractId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.contract = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar contrato';
        this.notificationService.showError(this.error);
        this.loading = false;
        console.error(err);
      }
    });
  }

  finishContract(): void {
    if (confirm('¿Está seguro de finalizar este contrato?')) {
      this.contractService.finishContract(this.contractId).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Contrato finalizado exitosamente');
            this.loadContract();
          }
        },
        error: (err) => {
          this.notificationService.showError('Error al finalizar contrato');
          console.error(err);
        }
      });
    }
  }

  deleteContract(): void {
    console.log('deleteContract() called - contractId:', this.contractId);
    
    if (confirm('¿Está seguro de que desea eliminar este contrato? Esta acción no se puede deshacer.')) {
      console.log('User confirmed deletion, calling service...');
      
      this.contractService.deleteContract(this.contractId).subscribe({
        next: (response) => {
          console.log('Delete response:', response);
          if (response.success) {
            this.notificationService.showSuccess('Contrato eliminado exitosamente');
            this.router.navigate(['/contracts']);
          }
        },
        error: (err) => {
          console.error('Delete error:', err);
          const errorMsg = err?.error?.error || 'Error al eliminar contrato';
          this.notificationService.showError(errorMsg);
        }
      });
    } else {
      console.log('User cancelled deletion');
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatAmount(amount: number | undefined): string {
    if (!amount) return '$0.00';
    return `$${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'finished': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      case 'pending': return 'Pendiente';
      default: return status || '';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'finished': return 'status-finished';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }
}
