import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { ContractFormData } from '../../models/contract.model';
import { ContractFormComponent } from '../../components/contract-form/contract-form.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { UnitService } from '../../../units/services/unit.service';
import { TenantsService } from '../../../tenants/services/tenants.service';
import { BuildingService } from '../../../buildings/services/building.service';

@Component({
  selector: 'app-contracts-create',
  imports: [CommonModule, ContractFormComponent],
  templateUrl: './contracts-create.component.html',
  styleUrl: './contracts-create.component.css'
})
export class ContractsCreateComponent implements OnInit {
  units: any[] = [];
  tenants: any[] = [];
  buildings: any[] = [];
  loading = false;

  constructor(
    private contractService: ContractService,
    private unitService: UnitService,
    private tenantsService: TenantsService,
    private buildingService: BuildingService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
    this.loadUnits();
    this.loadTenants();
  }

  loadBuildings(): void {
    this.loading = true;
    this.buildingService.getBuildings({ limit: 1000 }).subscribe({
      next: (response) => {
        if (response.data) {
          this.buildings = response.data;
          console.log('✅ Edificios cargados:', this.buildings.length);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar edificios:', error);
        this.notificationService.showError('Error al cargar edificios');
        this.loading = false;
      }
    });
  }

  loadUnits(): void {
    this.loading = true;
    // Cargar todas las unidades sin filtros de paginación
    this.unitService.getUnits(undefined, { limit: 1000 }).subscribe({
      next: (response) => {
        if (response.data) {
          this.units = response.data;
          console.log('✅ Unidades cargadas:', this.units.length);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar unidades:', error);
        this.notificationService.showError('Error al cargar unidades');
        this.loading = false;
      }
    });
  }

  loadTenants(): void {
    this.loading = true;
    // Cargar todos los inquilinos sin filtros
    this.tenantsService.getTenants(undefined, { limit: 1000 }).subscribe({
      next: (response) => {
        if (response.data) {
          this.tenants = response.data;
          console.log('✅ Inquilinos cargados:', this.tenants.length);
          console.log('📋 Primer inquilino:', this.tenants[0]);
        } else {
          console.warn('⚠️ No hay datos en response.data');
          this.tenants = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar inquilinos:', error);
        this.notificationService.showError('Error al cargar inquilinos');
        this.tenants = [];
        this.loading = false;
      }
    });
  }

  onSubmit(formData: ContractFormData): void {
    this.loading = true;
    this.contractService.createContract(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Contrato creado exitosamente');
          this.router.navigate(['/contracts']);
        }
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error al crear contrato');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/contracts']);
  }
}
