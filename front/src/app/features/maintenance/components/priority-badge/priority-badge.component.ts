import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priority-badge.component.html',
  styleUrl: './priority-badge.component.css'
})
export class PriorityBadgeComponent {
  @Input() priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  @Input() showIcon: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  getPriorityClass(): string {
    return `priority-${this.priority} size-${this.size}`;
  }

  getPriorityLabel(): string {
    const labels: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return labels[this.priority] || this.priority;
  }

  getPriorityIcon(): string {
    const icons: { [key: string]: string } = {
      'low': '🔵',
      'medium': '🟡',
      'high': '🟠',
      'urgent': '🔴'
    };
    return icons[this.priority] || '🔵';
  }
}
