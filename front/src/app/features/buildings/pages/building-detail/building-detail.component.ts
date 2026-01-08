import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BuildingService } from '../../services/building.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BuildingStatsComponent } from '../../components/building-stats/building-stats.component';
import { Building, BuildingStats } from '../../models/building.model';

@Component({
  selector: 'app-building-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BuildingStatsComponent],
  templateUrl: './building-detail.component.html',
  styleUrl: './building-detail.component.css'
})
export class BuildingDetailComponent implements OnInit {
  building?: Building;
  isLoading = false;
  isLoadingStats = false;
  buildingId!: number;
  selectedTab: 'info' | 'stats' | 'units' = 'info';

  constructor(
    private buildingService: BuildingService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.buildingId = +params['id'];
      if (this.buildingId) {
        this.loadBuilding();
        this.loadStats();
      }
    });
  }

  /**
   * Cargar edificio
   */
  loadBuilding(): void {
    this.isLoading = true;

    this.buildingService.getBuildingById(this.buildingId).subscribe({
      next: (response) => {
        this.building = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError(
          'Error al cargar el edificio',
          'Error'
        );
        this.router.navigate(['/buildings']);
      }
    });
  }

  /**
   * Cargar estadísticas
   */
  loadStats(): void {
    this.isLoadingStats = true;

    this.buildingService.getBuildingStats(this.buildingId).subscribe({
      next: (response) => {
        // El building con estadísticas reemplaza completamente el anterior
        this.building = response.data;
        this.isLoadingStats = false;
      },
      error: (error) => {
        this.isLoadingStats = false;
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  /**
   * Editar edificio
   */
  editBuilding(): void {
    this.router.navigate(['/buildings', this.buildingId, 'edit']);
  }

  /**
   * Eliminar edificio
   */
  deleteBuilding(): void {
    if (!this.building) return;

    this.notificationService.confirm(
      `¿Estás seguro de eliminar el edificio "${this.building.name}"?`,
      '¡Esta acción no se puede deshacer!'
    ).then((confirmed) => {
      if (confirmed) {
        this.isLoading = true;
        this.buildingService.deleteBuilding(this.buildingId).subscribe({
          next: () => {
            this.notificationService.showSuccess(
              'Edificio eliminado correctamente',
              'Éxito'
            );
            this.router.navigate(['/buildings']);
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.showError(
              error.error?.error || 'Error al eliminar el edificio',
              'Error'
            );
          }
        });
      }
    });
  }

  /**
   * Volver a la lista
   */
  goBack(): void {
    this.router.navigate(['/buildings']);
  }

  /**
   * Cambiar tab activo
   */
  selectTab(tab: 'info' | 'stats' | 'units'): void {
    this.selectedTab = tab;
  }

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
   * Ver unidades del edificio
   */
  viewUnits(): void {
    this.router.navigate(['/units'], { 
      queryParams: { building_id: this.buildingId } 
    });
  }
}
