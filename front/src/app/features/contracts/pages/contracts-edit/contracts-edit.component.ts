import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { Contract, ContractFormData } from '../../models/contract.model';
import { ContractFormComponent } from '../../components/contract-form/contract-form.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { UnitService } from '../../../units/services/unit.service';
import { TenantsService } from '../../../tenants/services/tenants.service';
import { BuildingService } from '../../../buildings/services/building.service';

@Component({
  selector: 'app-contracts-edit',
  imports: [CommonModule, RouterModule, ContractFormComponent],
  templateUrl: './contracts-edit.component.html',
  styleUrl: './contracts-edit.component.css'
})
export class ContractsEditComponent implements OnInit {
  contract?: Contract;
  units: any[] = [];
  tenants: any[] = [];
  buildings: any[] = [];
  loading = false;
  contractId!: number;

  constructor(
    private contractService: ContractService,
    private unitService: UnitService,
    private tenantsService: TenantsService,
    private buildingService: BuildingService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.contractId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.contractId) {
      this.loadContract();
      this.loadBuildings();
      this.loadUnits();
      this.loadTenants();
    }
  }

  loadContract(): void {
    this.loading = true;
    this.contractService.getContractById(this.contractId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.contract = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar contrato');
        this.loading = false;
        console.error(err);
      }
    });
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
    this.contractService.updateContract(this.contractId, formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Contrato actualizado exitosamente');
          this.router.navigate(['/contracts', this.contractId]);
        }
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error al actualizar contrato');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/contracts', this.contractId]);
  }
}
