import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantFormComponent } from '../../components/tenant-form/tenant-form.component';
import { TenantsService } from '../../services/tenants.service';
import { Tenant } from '../../models/tenant.model';

@Component({
  selector: 'app-tenant-edit',
  standalone: true,
  imports: [CommonModule, TenantFormComponent],
  templateUrl: './tenant-edit.component.html',
  styleUrl: './tenant-edit.component.css'
})
export class TenantEditComponent implements OnInit {
  tenant: Tenant | null = null;
  isLoading = false;
  isSubmitting = false;

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
        this.tenant = response.data || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar inquilino:', error);
        this.isLoading = false;
        alert('Error al cargar el inquilino');
        this.router.navigate(['/tenants']);
      }
    });
  }

  onFormSubmit(tenantData: Partial<Tenant>): void {
    if (!this.tenant) return;

    this.isSubmitting = true;
    
    // Mapear campos del frontend al backend
    const [firstName, ...lastNameParts] = (tenantData.full_name || '').split(' ');
    const lastName = lastNameParts.join(' ') || firstName;
    
    // Limpiar espacios en teléfono
    const cleanPhone = (tenantData.phone || '').replace(/\s+/g, '');
    
    // Detectar si el número es móvil (comienza con 3 y tiene 10 dígitos)
    // Si es móvil, enviarlo en mobile_phone y dejar phone vacío
    const isMobileNumber = /^3\d{9}$/.test(cleanPhone);
    
    const tenantPayload: any = {
      ...tenantData,
      first_name: firstName,
      last_name: lastName,
      document_number: tenantData.identification_number,
      document_type: tenantData.identification_type,
      phone: isMobileNumber ? '' : cleanPhone, // Si es móvil, vacío
      mobile_phone: isMobileNumber ? cleanPhone : tenantData.phone, // Si es móvil, asignarlo aquí
    };
    
    // Eliminar campos del frontend para evitar confusiones
    delete tenantPayload.full_name;
    delete tenantPayload.identification_number;
    delete tenantPayload.identification_type;
    
    console.log('📤 Enviando inquilino con datos:', tenantPayload);
    
    this.tenantsService.updateTenant(this.tenant.id || this.tenant.tenant_id!, tenantPayload).subscribe({
      next: (response) => {
        console.log('Inquilino actualizado exitosamente:', response);
        this.isSubmitting = false;
        // Navegar a la página de detalles
        this.router.navigate(['/tenants', this.tenant!.id || this.tenant!.tenant_id]);
      },
      error: (error) => {
        console.error('Error al actualizar inquilino:', error);
        this.isSubmitting = false;
        alert('Error al actualizar el inquilino. Por favor, intenta nuevamente.');
      }
    });
  }

  onFormCancel(): void {
    if (this.tenant) {
      this.router.navigate(['/tenants', this.tenant.id || this.tenant.tenant_id]);
    } else {
      this.router.navigate(['/tenants']);
    }
  }
}
