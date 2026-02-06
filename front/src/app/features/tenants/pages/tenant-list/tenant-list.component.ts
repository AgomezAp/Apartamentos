import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TenantsService } from '../../services/tenants.service';
import { TenantCardComponent } from '../../components/tenant-card/tenant-card.component';
import { Tenant, TenantSearchFilter } from '../../models/tenant.model';
import { PaginationData } from '../../../../core/models/api-response.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TenantCardComponent],
  templateUrl: './tenant-list.component.html',
  styleUrl: './tenant-list.component.css'
})
export class TenantListComponent implements OnInit, OnDestroy {
  tenants: Tenant[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter: string = 'all';
  
  private searchSubject = new Subject<string>();
  private statusSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  pagination: PaginationData = {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  };

  constructor(
    private tenantsService: TenantsService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTenants();
    
    // Configurar debounce para búsqueda en vivo
    this.searchSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.pagination.page = 1;
        this.loadTenants();
      });
    
    // Configurar cambio de estado sin debounce
    this.statusSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.statusFilter = status;
        this.pagination.page = 1;
        this.loadTenants();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTenants(): void {
    this.isLoading = true;
    const filter: TenantSearchFilter = {};
    
    if (this.searchTerm) {
      filter.search_term = this.searchTerm;
    }
    
    if (this.statusFilter !== 'all') {
      filter.status = this.statusFilter as any;
    }

    this.tenantsService.getTenants(filter, {
      page: this.pagination.page,
      limit: this.pagination.limit
    }).subscribe({
      next: (response) => {
        // Mapear propiedades del backend si es necesario
        this.tenants = (response.data || []).map(tenant => ({
          ...tenant,
          id: tenant.id || (tenant as any).tenant_id
        }));
        if (response.pagination) {
          this.pagination = response.pagination;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
        this.notificationService.showError('No se pudieron cargar los inquilinos');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.pagination.page = 1;
    this.loadTenants();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onStatusChange(status: string): void {
    this.statusSubject.next(status);
  }

  onEdit(tenantId: number): void {
    this.router.navigate(['/tenants', tenantId, 'edit']);
  }

  onDelete(tenantId: number): void {
    // Primero confirmar con el usuario
    if (!confirm('¿Está seguro que desea eliminar este inquilino?')) {
      return;
    }
    
    this.tenantsService.deleteTenant(tenantId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Inquilino eliminado exitosamente');
        this.loadTenants();
      },
      error: (error) => {
        console.error('Error deleting tenant:', error);
        
        // Manejar error específico de contratos activos
        if (error.error?.details?.contracts) {
          const contracts = error.error.details.contracts;
          const contractsInfo = contracts.map((c: any) => 
            `${c.contract_number} (${c.status === 'active' ? 'Activo' : 'Pendiente'})`
          ).join(', ');
          
          this.notificationService.showError(
            `Este inquilino tiene contratos que debe finalizar primero: ${contractsInfo}`,
            'No se puede eliminar',
            10000 // Mostrar por 10 segundos
          );
        }
        // El interceptor ya muestra otros errores
      }
    });
  }

  createTenant(): void {
    this.router.navigate(['/tenants/create']);
  }

  nextPage(): void {
    if (this.pagination.page < this.pagination.totalPages) {
      this.pagination.page++;
      this.loadTenants();
    }
  }

  prevPage(): void {
    if (this.pagination.page > 1) {
      this.pagination.page--;
      this.loadTenants();
    }
  }
}
