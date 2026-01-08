import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Unit } from '../../models/unit.model';

@Component({
  selector: 'app-unit-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './unit-card.component.html',
  styleUrl: './unit-card.component.css'
})
export class UnitCardComponent {
  @Input() unit!: Unit;
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  onDelete(): void {
    if (confirm(`¿Está seguro de eliminar la unidad ${this.unit.unit_number}?`)) {
      this.delete.emit(this.unit.id || this.unit.unit_id!);
    }
  }

  onEdit(): void {
    this.edit.emit(this.unit.id || this.unit.unit_id!);
  }

  getStatusClass(): string {
    const status = this.unit.occupation_status || this.unit.status || 'unknown';
    return `status-${status}`;
  }

  getStatusLabel(): string {
    const status = this.unit.occupation_status || this.unit.status;
    switch (status) {
      case 'occupied': return 'Ocupada';
      case 'vacant': return 'Disponible';
      case 'maintenance': return 'Mantenimiento';
      case 'reserved': return 'Reservada';
      case 'available': return 'Disponible';
      default: return status || 'Desconocido';
    }
  }
}
