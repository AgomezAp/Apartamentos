import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../services/maintenance.service';
import { MaintenanceRequest, MaintenanceFilter, MaintenanceCategories, MaintenancePriorities, MaintenanceStatuses } from '../../models/miantenance.model';
import { MaintenanceCardComponent } from '../../components/maintenance-card/maintenance-card.component';
import { AssignTechnicianModalComponent } from '../../components/assign-technician-modal/assign-technician-modal.component';
import { ResolveMaintenanceModalComponent } from '../../components/resolve-maintenance-modal/resolve-maintenance-modal.component';

@Component({
  selector: 'app-maintenance-list',
  imports: [CommonModule, RouterModule, FormsModule, MaintenanceCardComponent, AssignTechnicianModalComponent, ResolveMaintenanceModalComponent],
  templateUrl: './maintenance-list.component.html',
  styleUrl: './maintenance-list.component.css'
})
export class MaintenanceListComponent implements OnInit {
  @ViewChild(AssignTechnicianModalComponent) assignModal!: AssignTechnicianModalComponent;
  @ViewChild(ResolveMaintenanceModalComponent) resolveModal!: ResolveMaintenanceModalComponent;
  
  requests: MaintenanceRequest[] = [];
  loading = false;
  selectedRequestId: number | null = null;
  selectedResolveRequestId: number | null = null;
  
  // Filters
  filter: MaintenanceFilter = {};
  categories = MaintenanceCategories;
  priorities = MaintenancePriorities;
  statuses = MaintenanceStatuses;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;

  constructor(private maintenanceService: MaintenanceService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.maintenanceService.getAll(this.filter).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.requests = response.data;
          this.totalItems = response.data.length;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading maintenance requests:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  clearFilters(): void {
    this.filter = {};
    this.currentPage = 1;
    this.loadRequests();
  }

  onDelete(requestId: number): void {
    if (confirm('¿Está seguro de eliminar esta solicitud?')) {
      this.maintenanceService.delete(requestId).subscribe({
        next: () => {
          this.loadRequests();
        },
        error: (error) => {
          console.error('Error deleting request:', error);
          alert('Error al eliminar la solicitud');
        }
      });
    }
  }

  onResolve(requestId: number): void {
    this.selectedResolveRequestId = requestId;
    this.resolveModal.show();
  }

  handleResolveSubmit(data: any): void {
    if (this.selectedResolveRequestId === null) return;
    
    this.maintenanceService.resolve(this.selectedResolveRequestId, data).subscribe({
      next: () => {
        this.loadRequests();
        this.selectedResolveRequestId = null;
      },
      error: (error) => {
        console.error('Error resolving request:', error);
        alert('Error al resolver la solicitud');
      }
    });
  }

  handleResolveCancel(): void {
    this.selectedResolveRequestId = null;
  }

  onAssign(requestId: number): void {
    this.selectedRequestId = requestId;
    this.assignModal.show();
  }

  handleAssign(technicianData: any): void {
    if (this.selectedRequestId) {
      this.maintenanceService.update(this.selectedRequestId, technicianData).subscribe({
        next: () => {
          this.loadRequests();
          alert('Técnico asignado correctamente');
          this.selectedRequestId = null;
        },
        error: (error) => {
          console.error('Error assigning request:', error);
          alert('Error al asignar la solicitud');
          this.selectedRequestId = null;
        }
      });
    }
  }

  handleCancelAssign(): void {
    this.selectedRequestId = null;
  }

  get paginatedRequests(): MaintenanceRequest[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.requests.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Calcular total de gastos estimados
  get totalEstimatedCost(): number {
    return this.requests.reduce((total, request) => {
      const cost = Number(request.estimated_cost) || 0;
      return total + cost;
    }, 0);
  }

  // Calcular total de gastos reales (solo solicitudes completadas)
  get totalActualCost(): number {
    return this.requests.reduce((total, request) => {
      const cost = Number(request.actual_cost) || 0;
      return total + cost;
    }, 0);
  }
}
