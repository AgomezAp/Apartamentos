import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UnitService } from '../../services/unit.service';
import { UnitCardComponent } from '../../components/unit-card/unit-card.component';
import { Unit } from '../../models/unit.model';
import { PaginationData } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-vacant-units',
  standalone: true,
  imports: [CommonModule, RouterModule, UnitCardComponent],
  templateUrl: './vacant-units.component.html',
  styleUrl: './vacant-units.component.css'
})
export class VacantUnitsComponent implements OnInit {
  units: Unit[] = [];
  isLoading = false;
  
  pagination: PaginationData = {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  };

  constructor(
    private unitService: UnitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVacantUnits();
  }

  loadVacantUnits(): void {
    this.isLoading = true;
    
    this.unitService.getAvailableUnits(undefined, {
      page: this.pagination.page,
      limit: this.pagination.limit
    }).subscribe({
      next: (response) => {
        this.units = response.data || [];
        if (response.pagination) {
          this.pagination = response.pagination;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vacant units:', error);
        this.isLoading = false;
      }
    });
  }

  onEdit(unitId: number): void {
    this.router.navigate(['/units', unitId, 'edit']);
  }

  onDelete(unitId: number): void {
    this.unitService.deleteUnit(unitId).subscribe({
      next: () => {
        this.loadVacantUnits();
      },
      error: (error) => {
        console.error('Error deleting unit:', error);
      }
    });
  }

  createUnit(): void {
    this.router.navigate(['/units/create']);
  }

  nextPage(): void {
    if (this.pagination.page < this.pagination.totalPages) {
      this.pagination.page++;
      this.loadVacantUnits();
    }
  }

  prevPage(): void {
    if (this.pagination.page > 1) {
      this.pagination.page--;
      this.loadVacantUnits();
    }
  }
}
