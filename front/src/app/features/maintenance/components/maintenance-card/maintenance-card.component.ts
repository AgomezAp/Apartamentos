import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaintenanceRequest } from '../../models/miantenance.model';
import { PriorityBadgeComponent } from '../priority-badge/priority-badge.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-maintenance-card',
  standalone: true,
  imports: [CommonModule, RouterModule, PriorityBadgeComponent, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './maintenance-card.component.html',
  styleUrl: './maintenance-card.component.css'
})
export class MaintenanceCardComponent {
  @Input() request!: MaintenanceRequest;
  @Output() delete = new EventEmitter<number>();
  @Output() resolve = new EventEmitter<number>();
  @Output() assign = new EventEmitter<number>();

  onDelete(): void {
    if (confirm(`¿Está seguro de eliminar la solicitud "${this.request.title}"?`)) {
      this.delete.emit(this.request.request_id);
    }
  }

  onResolve(): void {
    this.resolve.emit(this.request.request_id);
  }

  onAssign(): void {
    this.assign.emit(this.request.request_id);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'status-pending',
      'in_progress': 'status-progress',
      'completed': 'status-resolved',
      'cancelled': 'status-cancelled'
    };
    return classes[status] || 'status-pending';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En Progreso',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
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

  getDaysElapsed(date: string): number {
    const reported = new Date(date);
    const now = new Date();
    const diff = now.getTime() - reported.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
