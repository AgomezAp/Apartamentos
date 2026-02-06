import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitFormComponent } from '../../components/unit-form/unit-form.component';
import { UnitService } from '../../services/unit.service';
import { Unit, UnitFormData } from '../../models/unit.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-unit-edit',
  standalone: true,
  imports: [CommonModule, UnitFormComponent],
  templateUrl: './unit-edit.component.html',
  styleUrl: './unit-edit.component.css'
})
export class UnitEditComponent implements OnInit {
  unit: Unit | null = null;
  isLoading = false;
  isSubmitting = false;
  unitId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private unitService: UnitService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.unitId = +params['id'];
      this.loadUnit();
    });
  }

  loadUnit(): void {
    this.isLoading = true;
    this.unitService.getUnitById(this.unitId).subscribe({
      next: (response) => {
        this.unit = response.data || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading unit:', error);
        this.isLoading = false;
      }
    });
  }

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
    
    console.log('📤 Actualizando unidad con datos:', unitPayload);
    
    this.unitService.updateUnit(this.unitId, unitPayload as any).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Unidad actualizada exitosamente');
          this.router.navigate(['/units', this.unitId]);
        }
      },
      error: (error) => {
        console.error('Error updating unit:', error);
        this.isSubmitting = false;
        // El interceptor ya muestra el error
      }
    });
  }

  onFormCancel(): void {
    this.router.navigate(['/units', this.unitId]);
  }
}
