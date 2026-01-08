import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { PendingTask } from '../../models/dashboard.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-pending-tasks',
  imports: [CommonModule, RouterModule, DateFormatPipe],
  templateUrl: './pending-tasks.component.html',
  styleUrl: './pending-tasks.component.css'
})
export class PendingTasksComponent implements OnInit {
  Math = Math;
  tasks: PendingTask[] = [];
  loading = false;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.getPendingTasks().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data: any = response.data;
          // El backend devuelve un objeto con overduePayments y expiringContracts
          const tasks: PendingTask[] = [];
          
          if (data.overduePayments && Array.isArray(data.overduePayments)) {
            tasks.push(...data.overduePayments.map((p: any) => ({
              id: p.id,
              type: 'payment',
              title: p.title,
              description: p.description,
              priority: p.priority || 'high',
              due_date: p.dueDate,
              entity_name: '',
              amount: p.amount
            })));
          }
          
          if (data.expiringContracts && Array.isArray(data.expiringContracts)) {
            tasks.push(...data.expiringContracts.map((c: any) => ({
              id: c.id,
              type: 'contract',
              title: c.title,
              description: c.description,
              priority: c.priority || 'medium',
              due_date: c.dueDate,
              entity_name: '',
              amount: 0
            })));
          }
          
          this.tasks = tasks;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar tareas pendientes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'urgent': return '🔥';
      case 'high': return '⚠️';
      case 'medium': return '🔵';
      case 'low': return 'ℹ️';
      default: return '📌';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'payment': return '💵';
      case 'maintenance': return '🔧';
      case 'contract': return '📝';
      case 'inspection': return '🔍';
      default: return '📌';
    }
  }

  getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: string): boolean {
    return this.getDaysUntilDue(dueDate) < 0;
  }
}
