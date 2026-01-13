import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaintenanceService } from '../../services/maintenance.service';
import { MaintenanceFormData } from '../../models/miantenance.model';
import { MaintenanceFormComponent } from '../../components/maintenance-form/maintenance-form.component';
import { BuildingService } from '../../../buildings/services/building.service';
import { UnitService } from '../../../units/services/unit.service';
import { TenantsService } from '../../../tenants/services/tenants.service';
import { Unit } from '../../../units/models/unit.model';
import { Tenant } from '../../../tenants/models/tenant.model';
import { Building } from '../../../buildings/models/building.model';

@Component({
  selector: 'app-maintenance-create',
  imports: [CommonModule, RouterModule, MaintenanceFormComponent],
  templateUrl: './maintenance-create.component.html',
  styleUrl: './maintenance-create.component.css'
})
export class MaintenanceCreateComponent implements OnInit {
  buildings: Building[] = [];
  units: Unit[] = [];
  tenants: Tenant[] = [];
  loading = false;
  selectedBuildingId: number | null = null;
  selectedUnitId: number | null = null;

  constructor(
    private maintenanceService: MaintenanceService,
    private buildingService: BuildingService,
    private unitService: UnitService,
    private tenantsService: TenantsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  loadBuildings(): void {
    this.buildingService.getBuildings().subscribe({
      next: (response) => {
        if (response.data) {
          this.buildings = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading buildings:', error);
      }
    });
  }

  onBuildingChange(buildingId: number): void {
    this.selectedBuildingId = buildingId;
    this.selectedUnitId = null;
    this.units = [];
    this.tenants = [];

    if (buildingId) {
      this.loadUnitsByBuilding(buildingId);
    }
  }

  loadUnitsByBuilding(buildingId: number): void {
    this.unitService.getUnitsByBuilding(buildingId, { limit: 1000 }).subscribe({
      next: (response) => {
        if (response.data) {
          this.units = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading units:', error);
      }
    });
  }

  onUnitChange(unitId: number): void {
    this.selectedUnitId = unitId;
    this.tenants = [];

    if (unitId) {
      this.loadTenants();
    }
  }

  loadTenants(): void {
    this.tenantsService.getTenants({}, { limit: 1000 }).subscribe({
      next: (response) => {
        if (response.data) {
          this.tenants = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
      }
    });
  }

  onSubmit(formData: MaintenanceFormData): void {
    this.loading = true;
    this.maintenanceService.create(formData).subscribe({
      next: (response) => {
        console.log('Maintenance request created:', response);
        this.router.navigate(['/maintenance']);
      },
   /*    error: (error) => {
        console.error('Error creating maintenance request:', error);
        alert('Error al crear la solicitud de mantenimiento');
        this.loading = false;
      } */
    });
  }

  onCancel(): void {
    this.router.navigate(['/maintenance']);
  }
}
