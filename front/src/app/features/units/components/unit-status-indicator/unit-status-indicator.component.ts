import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Unit } from '../../models/unit.model';

@Component({
  selector: 'app-unit-status-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unit-status-indicator.component.html',
  styleUrl: './unit-status-indicator.component.css'
})
export class UnitStatusIndicatorComponent {
  @Input() status!: Unit['status'];
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showLabel: boolean = true;

  getStatusClass(): string {
    return `status-${this.status} size-${this.size}`;
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      'available': 'Disponible',
      'occupied': 'Ocupada',
      'maintenance': 'Mantenimiento',
      'reserved': 'Reservada',
      'vacant': 'Disponible'
    };
    return labels[this.status || 'available'] || this.status || 'Desconocido';
  }

  getStatusIcon(): string {
    const icons: Record<string, string> = {
      'available': '✓',
      'occupied': '●',
      'maintenance': '⚠',
      'reserved': '⏳',
      'vacant': '✓'
    };
    return icons[this.status || 'available'] || '';
  }
}
