import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantSearchFilter, TENANT_STATUS } from '../../models/tenant.model';
import { BuildingService } from '../../../buildings/services/building.service';
import { Building } from '../../../buildings/models/building.model';

@Component({
  selector: 'app-tenant-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-search.component.html',
  styleUrl: './tenant-search.component.css'
})
export class TenantSearchComponent implements OnInit {
  @Output() searchChange = new EventEmitter<TenantSearchFilter>();
  @Output() clearSearch = new EventEmitter<void>();

  filter: TenantSearchFilter = {};
  buildings: Building[] = [];
  tenantStatuses = TENANT_STATUS;
  isExpanded = false;

  constructor(private buildingService: BuildingService) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  private loadBuildings(): void {
    this.buildingService.getBuildings().subscribe({
      next: (response: any) => {
        this.buildings = response.data || [];
      },
      error: (error: any) => {
        console.error('Error al cargar edificios:', error);
      }
    });
  }

  onSearch(): void {
    this.searchChange.emit(this.filter);
  }

  onClear(): void {
    this.filter = {};
    this.clearSearch.emit();
    this.searchChange.emit(this.filter);
  }

  toggleFilters(): void {
    this.isExpanded = !this.isExpanded;
  }

  hasActiveFilters(): boolean {
    return !!(this.filter.search_term || this.filter.status || 
              this.filter.building_id || this.filter.has_active_contract !== undefined);
  }
}
