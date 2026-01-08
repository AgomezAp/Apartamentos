import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TenantsService } from '../../services/tenants.service';
import { Tenant, TENANT_STATUS } from '../../models/tenant.model';
import { TenantContractsComponent } from '../../components/tenant-contracts/tenant-contracts.component';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TenantContractsComponent,
    DateFormatPipe,
  ],
  templateUrl: './tenant-detail.component.html',
  styleUrl: './tenant-detail.component.css',
})
export class TenantDetailComponent implements OnInit {
  tenant: Tenant | null = null;
  isLoading = false;
  tenantStatuses = TENANT_STATUS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantsService: TenantsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTenant(Number(id));
    }
  }

  private loadTenant(id: number): void {
    this.isLoading = true;
    this.tenantsService.getTenantById(id).subscribe({
      next: (response) => {
        this.tenant = response.data ?? null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar inquilino:', error);
        this.isLoading = false;
        alert('Error al cargar el inquilino');
        this.router.navigate(['/tenants']);
      },
    });
  }

  getStatusConfig(status: string) {
    return (
      this.tenantStatuses.find((s) => s.value === status) ||
      this.tenantStatuses[0]
    );
  }

  editTenant(): void {
    if (this.tenant) {
      this.router.navigate([
        '/tenants',
        this.tenant.id || this.tenant.tenant_id,
        'edit',
      ]);
    }
  }
  getInitials(fullName: string): string {
    if (!fullName) return '??';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }
  deleteTenant(): void {
    if (!this.tenant) return;

    const confirmDelete = confirm(
      `¿Estás seguro de que deseas eliminar al inquilino "${this.tenant.full_name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmDelete) {
      this.tenantsService
        .deleteTenant(this.tenant.id || this.tenant.tenant_id!)
        .subscribe({
          next: () => {
            console.log('Inquilino eliminado exitosamente');
            this.router.navigate(['/tenants']);
          },
          error: (error) => {
            console.error('Error al eliminar inquilino:', error);
            alert(
              'Error al eliminar el inquilino. Puede tener contratos activos.'
            );
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/tenants']);
  }
}
