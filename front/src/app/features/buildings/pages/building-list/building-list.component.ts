import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BuildingService } from '../../services/building.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BuildingCardComponent } from '../../components/building-card/building-card.component';
import { Building } from '../../models/building.model';
import { PaginationData } from '../../../../core/models/api-response.model';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BuildingCardComponent],
  templateUrl: './building-list.component.html',
  styleUrl: './building-list.component.css',
})
export class BuildingListComponent implements OnInit, OnDestroy {
  buildings: Building[] = [];
  isLoading = false;
  searchTerm = '';
  Math = Math; // Exponer Math para usar en template
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Paginación
  pagination: PaginationData = {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  constructor(
    private buildingService: BuildingService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
    
    // Configurar debounce para búsqueda en vivo
    this.searchSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.pagination.currentPage = 1;
        this.loadBuildings();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar edificios
   */
  loadBuildings(): void {
    this.isLoading = true;

    const params = {
      page: this.pagination.currentPage,
      limit: this.pagination.itemsPerPage,
      search: this.searchTerm || undefined,
    };

    this.buildingService.getBuildings(params).subscribe({
      next: (response) => {
        // Mapear propiedades del backend si es necesario
        this.buildings = (response.data || []).map((building) => ({
          ...building,
          id: building.id || (building as any).building_id,
        }));

        // Normalizar paginación (backend puede usar keys diferentes)
        const p = response.pagination || {} as any;
        const normalizedCurrent = p.page ?? p.currentPage ?? 1;
        const normalizedItems = p.limit ?? p.itemsPerPage ?? 12;
        const normalizedTotal = p.total ?? p.totalItems ?? 0;
        const normalizedTotalPages =
          p.totalPages ?? (normalizedItems > 0 ? Math.ceil(normalizedTotal / normalizedItems) : 1);

        this.pagination = {
          page: normalizedCurrent,
          limit: normalizedItems,
          total: normalizedTotal,
          totalPages: normalizedTotalPages,
          currentPage: normalizedCurrent,
          itemsPerPage: normalizedItems,
          totalItems: normalizedTotal,
          hasNextPage: normalizedCurrent < normalizedTotalPages,
          hasPrevPage: normalizedCurrent > 1,
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError(
          'Error al cargar edificios',
          'Error'
        );
      },
    });
  }

  /**
   * Buscar edificios en vivo
   */
  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  /**
   * Buscar edificios
   */
  onSearch(): void {
    this.pagination.currentPage = 1;
    this.loadBuildings();
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  /**
   * Cambiar página
   */
  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.loadBuildings();
  }

  /**
   * Ir a página anterior
   */
  previousPage(): void {
    if (this.pagination.hasPrevPage) {
      this.onPageChange(this.pagination.currentPage - 1);
    }
  }

  /**
   * Ir a página siguiente
   */
  nextPage(): void {
    if (this.pagination.hasNextPage) {
      this.onPageChange(this.pagination.currentPage + 1);
    }
  }

  /**
   * Ver detalle de edificio
   */
  viewBuilding(building: Building): void {
    this.router.navigate(['/buildings', building.id]);
  }

  /**
   * Editar un edificio
   */
  editBuilding(building: Building): void {
    this.router.navigate(['/buildings', building.id, 'edit']);
  }

  /**
   * Eliminar edificio
   */
  deleteBuilding(building: Building): void {
    if (!building.id) return;

    this.notificationService
      .confirm(
        `¿Estás seguro de eliminar el edificio "${building.name}"?`,
        '¡Esta acción no se puede deshacer!'
      )
      .then((confirmed) => {
        if (confirmed && building.id) {
          this.isLoading = true;
          this.buildingService.deleteBuilding(building.id).subscribe({
            next: () => {
              this.notificationService.showSuccess(
                'Edificio eliminado correctamente',
                'Éxito'
              );
              this.loadBuildings();
            },
            error: (error) => {
              this.isLoading = false;
              this.notificationService.showError(
                error.error?.error || 'Error al eliminar el edificio',
                'Error'
              );
            },
          });
        }
      });
  }

  /**
   * Crear nuevo edificio
   */
  createBuilding(): void {
    this.router.navigate(['/buildings/create']);
  }
  getStartIndex(): number {
    if (!this.pagination || this.pagination.totalItems === 0) return 0;
    return (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1;
  }

  getEndIndex(): number {
    if (!this.pagination || this.pagination.totalItems === 0) return 0;
    const end = this.pagination.currentPage * this.pagination.itemsPerPage;
    return end > this.pagination.totalItems ? this.pagination.totalItems : end;
  }
  /**
   * Obtener array de páginas para paginador
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(
      1,
      this.pagination.currentPage - Math.floor(maxPages / 2)
    );
    let endPage = Math.min(
      this.pagination.totalPages,
      startPage + maxPages - 1
    );

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
