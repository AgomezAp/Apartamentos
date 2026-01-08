import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BuildingService } from '../../services/building.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BuildingFormComponent } from '../../components/building-form/building-form.component';
import { Building, BuildingFormData } from '../../models/building.model';

@Component({
  selector: 'app-building-edit',
  standalone: true,
  imports: [CommonModule, BuildingFormComponent],
  templateUrl: './building-edit.component.html',
  styleUrl: './building-edit.component.css'
})
export class BuildingEditComponent implements OnInit {
  building?: Building;
  isLoading = false;
  buildingId!: number;

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
   * Actualizar edificio
   */
  onSubmit(formData: BuildingFormData): void {
    this.isLoading = true;

    this.buildingService.updateBuilding(this.buildingId, formData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(
          'Edificio actualizado correctamente',
          'Éxito'
        );
        this.router.navigate(['/buildings', this.buildingId]);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError(
          error.error?.error || 'Error al actualizar el edificio',
          'Error'
        );
      }
    });
  }

  /**
   * Cancelar edición
   */
  onCancel(): void {
    this.router.navigate(['/buildings', this.buildingId]);
  }
}
