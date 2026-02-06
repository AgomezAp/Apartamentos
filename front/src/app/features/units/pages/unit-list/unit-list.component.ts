import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UnitService } from '../../services/unit.service';
import { UnitCardComponent } from '../../components/unit-card/unit-card.component';
import { Unit, UnitFilter } from '../../models/unit.model';
import { PaginationData } from '../../../../core/models/api-response.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-unit-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UnitCardComponent],
  templateUrl: './unit-list.component.html',
  styleUrl: './unit-list.component.css'
})
export class UnitListComponent implements OnInit, OnDestroy {
  units: Unit[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter: string = 'all';
  
  private searchSubject = new Subject<string>();
  private statusSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
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
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUnits();
    
    // Configurar debounce para búsqueda en vivo
    this.searchSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.pagination.page = 1;
        this.loadUnits();
      });
    
    // Configurar cambio de estado sin debounce
    this.statusSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.statusFilter = status;
        this.pagination.page = 1;
        this.loadUnits();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUnits(): void {
    this.isLoading = true;
    const filter: UnitFilter = {};
    
    if (this.searchTerm) {
      filter.search = this.searchTerm;
    }
    
    if (this.statusFilter !== 'all') {
      filter.status = this.statusFilter;
    }

    this.unitService.getUnits(filter, {
      page: this.pagination.page,
      limit: this.pagination.limit
    }).subscribe({
      next: (response) => {
        // Mapear propiedades del backend si es necesario
        this.units = (response.data || []).map(unit => ({
          ...unit,
          id: unit.id || (unit as any).unit_id
        }));
        if (response.pagination) {
          this.pagination = response.pagination;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading units:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.pagination.page = 1;
    this.loadUnits();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onStatusChange(status: string): void {
    this.statusSubject.next(status);
  }

  onEdit(unitId: number): void {
    this.router.navigate(['/units', unitId, 'edit']);
  }

  onDelete(unitId: number): void {
    if (!confirm('¿Está seguro que desea eliminar esta unidad?')) {
      return;
    }
    
    this.unitService.deleteUnit(unitId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Unidad eliminada exitosamente');
        this.loadUnits();
      },
      error: (error) => {
        console.error('Error deleting unit:', error);
        // El interceptor ya muestra el error
      }
    });
  }

  createUnit(): void {
    this.router.navigate(['/units/create']);
  }

  nextPage(): void {
    if (this.pagination.page < this.pagination.totalPages) {
      this.pagination.page++;
      this.loadUnits();
    }
  }

  prevPage(): void {
    if (this.pagination.page > 1) {
      this.pagination.page--;
      this.loadUnits();
    }
  }
}
