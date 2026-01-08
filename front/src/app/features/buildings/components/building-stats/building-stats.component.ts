import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Building } from '../../models/building.model';

@Component({
  selector: 'app-building-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './building-stats.component.html',
  styleUrl: './building-stats.component.css'
})
export class BuildingStatsComponent {
  @Input() building?: Building;
  @Input() loading: boolean = false;

  /**
   * Obtener porcentaje de ocupación
   */
  getOccupancyPercentage(): number {
    if (!this.building || !this.building.total_units || this.building.total_units === 0) {
      return 0;
    }
    const occupied = this.building.occupied_units || 0;
    return Math.round((occupied / this.building.total_units) * 100);
  }

  /**
   * Obtener clase de ocupación
   */
  getOccupancyClass(): string {
    const percentage = this.getOccupancyPercentage();
    if (percentage >= 80) return 'status-success';
    if (percentage >= 50) return 'status-warning';
    return 'status-danger';
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount?: number): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
}
