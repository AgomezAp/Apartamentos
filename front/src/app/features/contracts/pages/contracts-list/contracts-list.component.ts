import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContractService } from '../../services/contract.service';
import { Contract, ContractFilter } from '../../models/contract.model';
import { ContractCardComponent } from '../../components/contract-card/contract-card.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-contracts-list',
  imports: [CommonModule, RouterModule, FormsModule, ContractCardComponent],
  templateUrl: './contracts-list.component.html',
  styleUrl: './contracts-list.component.css',
})
export class ContractsListComponent implements OnInit {
  contracts: Contract[] = [];
  loading = false;
  error = '';
  searchTerm: string = '';
  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Filtros
  filters: ContractFilter = {};
  statusFilter = '';

  constructor(
    private contractService: ContractService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading = true;
    this.error = '';

    const filters: ContractFilter = {};
    if (this.statusFilter) {
      filters.status = this.statusFilter as any;
    }

    this.contractService
      .getContracts(this.currentPage, this.itemsPerPage, filters)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.contracts = response.data;
            if (response.pagination) {
              this.totalItems = response.pagination.total;
              this.totalPages = response.pagination.totalPages;
            }
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar contratos';
          this.notificationService.showError(this.error);
          this.loading = false;
          console.error(err);
        },
      });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadContracts();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.filters = {};
    this.currentPage = 1;
    this.loadContracts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadContracts();
  }

  onFinishContract(id: number): void {
    this.contractService.finishContract(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess(
            'Contrato finalizado exitosamente'
          );
          this.loadContracts();
        }
      },
      error: (err) => {
        this.notificationService.showError('Error al finalizar contrato');
        console.error(err);
      },
    });
  }

  onEditContract(id: number): void {
    this.router.navigate(['/contracts', id, 'edit']);
  }

  onDeleteContract(id: number): void {
    console.log('onDeleteContract called with id:', id);
    this.contractService.deleteContract(id).subscribe({
      next: (response) => {
        console.log('Delete response:', response);
        if (response.success) {
          this.notificationService.showSuccess('Contrato eliminado exitosamente');
          this.loadContracts(); // Recargar la lista
        }
      },
      error: (err) => {
        console.error('Delete error:', err);
        const errorMsg = err?.error?.error || 'Error al eliminar contrato';
        this.notificationService.showError(errorMsg);
      },
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
