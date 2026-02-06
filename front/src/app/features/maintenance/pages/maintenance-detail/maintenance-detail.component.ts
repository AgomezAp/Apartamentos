import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaintenanceService } from '../../services/maintenance.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MaintenanceRequest } from '../../models/miantenance.model';
import { MaintenanceTimelineComponent } from '../../components/maintenance-timeline/maintenance-timeline.component';
import { PriorityBadgeComponent } from '../../components/priority-badge/priority-badge.component';
import { ResolveMaintenanceModalComponent } from '../../components/resolve-maintenance-modal/resolve-maintenance-modal.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-maintenance-detail',
  imports: [CommonModule, RouterModule, MaintenanceTimelineComponent, PriorityBadgeComponent, ResolveMaintenanceModalComponent, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './maintenance-detail.component.html',
  styleUrl: './maintenance-detail.component.css'
})
export class MaintenanceDetailComponent implements OnInit {
  request: MaintenanceRequest | null = null;
  loading = false;

  @ViewChild(ResolveMaintenanceModalComponent) resolveModal!: ResolveMaintenanceModalComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private maintenanceService: MaintenanceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRequest(parseInt(id));
    }
  }

  loadRequest(id: number): void {
    this.loading = true;
    this.maintenanceService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.request = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading maintenance request:', error);
        this.loading = false;
        this.notificationService.showError('Error al cargar la solicitud');
        this.router.navigate(['/maintenance']);
      }
    });
  }

  onDelete(): void {
    if (this.request && confirm('¿Está seguro de eliminar esta solicitud?')) {
      this.maintenanceService.delete(this.request.request_id).subscribe({
        next: () => {
          this.router.navigate(['/maintenance']);
        },
        error: (error) => {
          console.error('Error deleting request:', error);
          this.notificationService.showError('Error al eliminar la solicitud');
        }
      });
    }
  }

  onEdit(): void {
    if (this.request) {
      this.router.navigate(['/maintenance', this.request.request_id, 'edit']);
    }
  }

  updateScheduledDate(event: any): void {
    if (!this.request) return;
    
    let scheduledDate = event.target.value;
    
    if (scheduledDate) {
      // Si no hay hora especificada, agregar hora por defecto 19:00
      if (!scheduledDate.includes('T')) {
        scheduledDate += 'T19:00';
      }
      
      // Convertir datetime-local a ISO string
      const dateObj = new Date(scheduledDate);
      const isoString = dateObj.toISOString();
      
      this.maintenanceService.update(this.request.request_id, {
        scheduled_date: isoString
      }).subscribe({
        next: () => {
          this.loadRequest(this.request!.request_id);
        },
        error: (error) => {
          console.error('Error updating scheduled date:', error);
          this.notificationService.showError('Error al actualizar la fecha programada');
        }
      });
    }
  }

  clearScheduledDate(): void {
    if (!this.request) return;
    
    if (confirm('¿Está seguro de quitar la fecha programada?')) {
      this.maintenanceService.update(this.request.request_id, {
        scheduled_date: undefined
      }).subscribe({
        next: () => {
          this.loadRequest(this.request!.request_id);
        },
        error: (error) => {
          console.error('Error clearing scheduled date:', error);
          this.notificationService.showError('Error al quitar la fecha programada');
        }
      });
    }
  }

  onResolve(): void {
    if (!this.request) return;
    this.resolveModal.show();
  }

  handleResolveSubmit(data: any): void {
    if (!this.request) return;
    
    this.maintenanceService.resolve(this.request.request_id, data).subscribe({
      next: () => {
        this.loadRequest(this.request!.request_id);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En Progreso',
      'on_hold': 'En Espera',
      'resolved': 'Resuelta',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'plumbing': 'Plomería',
      'electrical': 'Eléctrico',
      'appliance': 'Electrodomésticos',
      'structural': 'Estructural',
      'cleaning': 'Limpieza',
      'other': 'Otro'
    };
    return labels[category] || category;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'plumbing': '🚧',
      'electrical': '⚡',
      'appliance': '📧',
      'structural': '🏗️',
      'cleaning': '🧹',
      'other': '🔧'
    };
    return icons[category] || '🔧';
  }
}
