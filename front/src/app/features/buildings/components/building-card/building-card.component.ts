import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Building } from '../../models/building.model';

@Component({
  selector: 'app-building-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './building-card.component.html',
  styleUrl: './building-card.component.css',
})
export class BuildingCardComponent {
  @Input() building!: Building;
  @Input() showActions: boolean = true;
  @Output() onEdit = new EventEmitter<Building>();
  @Output() onDelete = new EventEmitter<Building>();
  @Output() onView = new EventEmitter<Building>();

  private imageErrorOccurred = false; // Bandera para evitar bucle infinito

  /**
   * Emitir evento de edición
   */
  editBuilding(): void {
    this.onEdit.emit(this.building);
  }

  /**
   * Emitir evento de eliminación
   */
  deleteBuilding(): void {
    this.onDelete.emit(this.building);
  }

  /**
   * Emitir evento de visualización
   */
  viewBuilding(): void {
    this.onView.emit(this.building);
  }

  /**
   * Obtener clase de estado del edificio
   */
  getStatusClass(): string {
    return this.building.is_active ? 'status-active' : 'status-inactive';
  }

  /**
   * Obtener texto de estado
   */
  getStatusText(): string {
    return this.building.is_active ? 'Activo' : 'Inactivo';
  }

  /**
   * Calcular porcentaje de ocupación
   */
  getOccupancyPercentage(): number {
    // Si tenemos occupancy_rate del backend, usarlo directamente
    if (
      this.building.occupancy_rate !== undefined &&
      this.building.occupancy_rate !== null
    ) {
      return Math.round(this.building.occupancy_rate);
    }

    // Si no, calcular basado en units_count
    const totalUnits =
      this.building.units_count || this.building.total_units || 0;
    if (!totalUnits || totalUnits === 0) {
      return 0;
    }
    const occupied = this.building.occupied_units || 0;
    return Math.round((occupied / totalUnits) * 100);
  }

  /**
   * Obtener clase de ocupación
   */
  getOccupancyClass(): string {
    const percentage = this.getOccupancyPercentage();
    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  }

  /**
   * Manejar error de imagen
   * Usa SVG placeholder inline para evitar bucle infinito
   */
  onImageError(event: Event): void {
    if (this.imageErrorOccurred) {
      return; // Evitar bucle infinito
    }

    this.imageErrorOccurred = true;
    const img = event.target as HTMLImageElement;

    // Usar imagen SVG inline como placeholder
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn4+iIEVkaWZpY2lvPC90ZXh0Pjwvc3ZnPg==';
  }
}
