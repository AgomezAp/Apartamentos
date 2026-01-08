import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceRequest, MaintenanceTimelineEvent } from '../../models/miantenance.model';

@Component({
  selector: 'app-maintenance-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance-timeline.component.html',
  styleUrl: './maintenance-timeline.component.css'
})
export class MaintenanceTimelineComponent implements OnInit {
  @Input() request!: MaintenanceRequest;
  
  timelineEvents: MaintenanceTimelineEvent[] = [];

  ngOnInit(): void {
    this.generateTimeline();
  }

  generateTimeline(): void {
    this.timelineEvents = [];

    // Created event
    this.timelineEvents.push({
      date: this.request.reported_date,
      event: 'Solicitud Creada',
      description: `Solicitud reportada: ${this.request.title}`,
      user: this.request.tenant_name,
      type: 'created'
    });

    // Assigned event
    if (this.request.assigned_to && this.request.assigned_to_name) {
      this.timelineEvents.push({
        date: this.request.updated_at,
        event: 'Asignado',
        description: `Asignado a ${this.request.assigned_to_name}`,
        user: this.request.assigned_to_name,
        type: 'assigned'
      });
    }

    // Scheduled event
    if (this.request.scheduled_date) {
      this.timelineEvents.push({
        date: this.request.scheduled_date,
        event: 'Fecha Programada',
        description: `Mantenimiento programado para ${this.formatDate(this.request.scheduled_date)}`,
        type: 'scheduled'
      });
    }

    // Status updates
    if (this.request.status === 'in_progress') {
      this.timelineEvents.push({
        date: this.request.updated_at,
        event: 'En Progreso',
        description: 'Trabajo en progreso',
        type: 'updated'
      });
    }

    // Resolved event
    if (this.request.status === 'completed' && this.request.resolved_date) {
      this.timelineEvents.push({
        date: this.request.resolved_date,
        event: 'Resuelto',
        description: `Resuelto por ${this.request.resolved_by_name || 'N/A'}`,
        user: this.request.resolved_by_name,
        type: 'resolved'
      });
    }

    // Cancelled event
    if (this.request.status === 'cancelled') {
      this.timelineEvents.push({
        date: this.request.updated_at,
        event: 'Cancelado',
        description: 'Solicitud cancelada',
        type: 'cancelled'
      });
    }

    // Sort by date (newest first)
    this.timelineEvents.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getEventIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'created': '📝',
      'assigned': '👤',
      'updated': '🔄',
      'scheduled': '📅',
      'resolved': '✅',
      'cancelled': '❌'
    };
    return icons[type] || '🔵';
  }

  getEventClass(type: string): string {
    const classes: { [key: string]: string } = {
      'created': 'event-created',
      'assigned': 'event-assigned',
      'updated': 'event-updated',
      'scheduled': 'event-scheduled',
      'resolved': 'event-resolved',
      'cancelled': 'event-cancelled'
    };
    return classes[type] || 'event-default';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
