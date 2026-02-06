import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UnitFormComponent } from '../../components/unit-form/unit-form.component';
import { UnitService } from '../../services/unit.service';
import { UnitFormData } from '../../models/unit.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-unit-create',
  standalone: true,
  imports: [CommonModule, UnitFormComponent],
  templateUrl: './unit-create.component.html',
  styleUrl: './unit-create.component.css'
})
export class UnitCreateComponent {
  isSubmitting = false;

  constructor(
    private unitService: UnitService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onFormSubmit(formData: UnitFormData): void {
    this.isSubmitting = true;
    
    // Mapear estado del frontend al backend
    const statusMapping: Record<string, string> = {
      'available': 'vacant',
      'occupied': 'occupied',
      'maintenance': 'maintenance',
      'reserved': 'reserved'
    };
    
    const backendStatus = statusMapping[formData.status] || 'vacant';
    
    // Mapear campos del frontend al backend
    const unitPayload = {
      ...formData,
      rental_price: formData.monthly_rent,
      occupation_status: backendStatus,
      is_occupied: backendStatus === 'occupied'
    };
    
    // Eliminar campos del frontend que no usa el backend
    delete (unitPayload as any).monthly_rent;
    delete (unitPayload as any).status;
    
    console.log('📤 Enviando unidad con datos:', unitPayload);
    
    this.unitService.createUnit(unitPayload as any).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notificationService.showSuccess('Unidad creada exitosamente');
          this.router.navigate(['/units', response.data.id || response.data.unit_id]);
        }
      },
      error: (error) => {
        console.error('Error creating unit:', error);
        this.isSubmitting = false;
        // El interceptor ya muestra el error
      }
    });
  }

  onFormCancel(): void {
    this.router.navigate(['/units']);
  }
}
