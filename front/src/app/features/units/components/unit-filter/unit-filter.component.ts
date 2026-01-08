import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitFilter } from '../../models/unit.model';
import { BuildingService } from '../../../buildings/services/building.service';
import { Building } from '../../../buildings/models/building.model';

@Component({
  selector: 'app-unit-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-filter.component.html',
  styleUrl: './unit-filter.component.css'
})
export class UnitFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<UnitFilter>();

  filter: UnitFilter = {};
  buildings: Building[] = [];

  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'available', label: 'Disponible' },
    { value: 'occupied', label: 'Ocupada' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'reserved', label: 'Reservada' }
  ];

  bedroomOptions = [
    { value: null, label: 'Todas' },
    { value: 1, label: '1 habitación' },
    { value: 2, label: '2 habitaciones' },
    { value: 3, label: '3 habitaciones' },
    { value: 4, label: '4+ habitaciones' }
  ];

  constructor(private buildingService: BuildingService) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  loadBuildings(): void {
    this.buildingService.getBuildings().subscribe({
      next: (response) => {
        this.buildings = response.data || [];
      },
      error: (error) => console.error('Error loading buildings:', error)
    });
  }

  onFilterChange(): void {
    this.filterChange.emit(this.filter);
  }

  clearFilters(): void {
    this.filter = {};
    this.filterChange.emit(this.filter);
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.filter).some(key => this.filter[key as keyof UnitFilter] != null);
  }
}
