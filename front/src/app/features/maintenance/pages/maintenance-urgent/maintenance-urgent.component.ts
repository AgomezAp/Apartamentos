import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaintenanceService } from '../../services/maintenance.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MaintenanceRequest } from '../../models/miantenance.model';
import { MaintenanceCardComponent } from '../../components/maintenance-card/maintenance-card.component';

@Component({
  selector: 'app-maintenance-urgent',
  imports: [CommonModule, RouterModule, MaintenanceCardComponent],
  templateUrl: './maintenance-urgent.component.html',
  styleUrl: './maintenance-urgent.component.css'
})
export class MaintenanceUrgentComponent implements OnInit {
  requests: MaintenanceRequest[] = [];
  loading = false;

  constructor(
    private maintenanceService: MaintenanceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUrgentRequests();
  }

  loadUrgentRequests(): void {
    this.loading = true;
    this.maintenanceService.getUrgent().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading urgent requests:', error);
        this.loading = false;
      }
    });
  }

  onDelete(requestId: number): void {
    if (confirm('¿Está seguro de eliminar esta solicitud?')) {
      this.maintenanceService.delete(requestId).subscribe({
        next: () => {
          this.loadUrgentRequests();
        },
        error: (error) => {
          console.error('Error deleting request:', error);
          this.notificationService.showError('Error al eliminar la solicitud');
        }
      });
    }
  }

  onResolve(requestId: number): void {
    const resolvedBy = prompt('Ingrese nombre de quien resolvió:');
    const actualCost = prompt('Ingrese costo real:');
    const notes = prompt('Notas de resolución:');
    
    if (resolvedBy) {
      this.maintenanceService.resolve(requestId, {
        resolved_by: resolvedBy,
        actual_cost: actualCost ? parseFloat(actualCost) : undefined,
        notes: notes || undefined
      }).subscribe({
        next: () => {
          this.loadUrgentRequests();
        },
        error: (error) => {
          console.error('Error resolving request:', error);
          this.notificationService.showError('Error al resolver la solicitud');
        }
      });
    }
  }

  onAssign(requestId: number): void {
    const assignedTo = prompt('Ingrese nombre de la persona asignada:');
    if (assignedTo) {
      this.maintenanceService.update(requestId, { assigned_to: assignedTo }).subscribe({
        next: () => {
          this.loadUrgentRequests();
        },
        error: (error) => {
          console.error('Error assigning request:', error);
          this.notificationService.showError('Error al asignar la solicitud');
        }
      });
    }
  }
}
