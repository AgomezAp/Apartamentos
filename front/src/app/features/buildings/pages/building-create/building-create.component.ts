import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BuildingService } from '../../services/building.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BuildingFormComponent } from '../../components/building-form/building-form.component';
import { BuildingFormData } from '../../models/building.model';

@Component({
  selector: 'app-building-create',
  standalone: true,
  imports: [CommonModule, BuildingFormComponent],
  templateUrl: './building-create.component.html',
  styleUrl: './building-create.component.css'
})
export class BuildingCreateComponent {
  isLoading = false;

  constructor(
    private buildingService: BuildingService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  /**
   * Crear edificio
   */
  onSubmit(formData: BuildingFormData): void {
    this.isLoading = true;

    this.buildingService.createBuilding(formData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(
          'Edificio creado correctamente',
          'Éxito'
        );
        this.router.navigate(['/buildings']);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError(
          error.error?.error || 'Error al crear el edificio',
          'Error'
        );
      }
    });
  }

  /**
   * Cancelar creación
   */
  onCancel(): void {
    this.router.navigate(['/buildings']);
  }
}
