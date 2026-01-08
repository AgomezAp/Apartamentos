import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TenantFormComponent } from '../../components/tenant-form/tenant-form.component';
import { TenantsService } from '../../services/tenants.service';
import { Tenant } from '../../models/tenant.model';

@Component({
  selector: 'app-tenant-create',
  standalone: true,
  imports: [CommonModule, TenantFormComponent],
  templateUrl: './tenant-create.component.html',
  styleUrl: './tenant-create.component.css'
})
export class TenantCreateComponent {
  isSubmitting = false;

  constructor(
    private tenantsService: TenantsService,
    private router: Router
  ) {}

  onFormSubmit(tenantData: Partial<Tenant>): void {
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
    
    // Eliminar campos del frontend que no usa el backend
    delete tenantPayload.full_name;
    delete tenantPayload.identification_number;
    delete tenantPayload.identification_type;
    
    console.log('📤 Enviando inquilino con datos:', tenantPayload);
    
    this.tenantsService.createTenant(tenantPayload).subscribe({
      next: (response) => {
        console.log('Inquilino creado exitosamente:', response);
        this.isSubmitting = false;
        // Navegar a la página de detalles del inquilino creado
        if (response.data?.id || response.data?.tenant_id) {
          this.router.navigate(['/tenants', response.data.id || response.data.tenant_id]);
        } else {
          this.router.navigate(['/tenants']);
        }
      },
      error: (error) => {
        console.error('Error al crear inquilino:', error);
        this.isSubmitting = false;
        alert('Error al crear el inquilino. Por favor, intenta nuevamente.');
      }
    });
  }

  onFormCancel(): void {
    this.router.navigate(['/tenants']);
  }
}
