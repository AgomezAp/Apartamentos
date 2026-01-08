import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { PaymentFormData } from '../../models/payment.model';
import { PaymentFormComponent } from '../../components/payment-form/payment-form.component';
import { Contract } from '../../../contracts/models/contract.model';
import { Tenant } from '../../../tenants/models/tenant.model';
import { Unit } from '../../../units/models/unit.model';
import { ContractService } from '../../../contracts/services/contract.service';
import { TenantsService } from '../../../tenants/services/tenants.service';
import { UnitService } from '../../../units/services/unit.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-payment-create',
  imports: [CommonModule, RouterModule, PaymentFormComponent],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.css'
})
export class PaymentCreateComponent implements OnInit {
  contracts: Contract[] = [];
  tenants: Tenant[] = [];
  units: Unit[] = [];
  loading = false;
  isSubmitting = false; // Guard para prevenir doble submit

  constructor(
    private paymentService: PaymentService,
    private contractService: ContractService,
    private tenantsService: TenantsService,
    private unitService: UnitService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadContracts();
    this.loadTenants();
    this.loadUnits();
  }

  loadContracts(): void {
    this.contractService.getContracts(1, 1000).subscribe({
      next: (response: any) => {
        this.contracts = response.data || response.items || [];
      },
      error: (error: any) => {
        console.error('Error loading contracts:', error);
      }
    });
  }

  loadTenants(): void {
    this.tenantsService.getTenants().subscribe({
      next: (response: any) => {
        this.tenants = response.data || response || [];
      },
      error: (error: any) => {
        console.error('Error loading tenants:', error);
      }
    });
  }

  loadUnits(): void {
    this.unitService.getUnits({}, { limit: 1000 }).subscribe({
      next: (response: any) => {
        this.units = response.data || response.items || [];
      },
      error: (error: any) => {
        console.error('Error loading units:', error);
      }
    });
  }

  onSubmit(formData: PaymentFormData): void {
    console.log('🔵 onSubmit called - Starting payment creation');
    console.log('📋 Form data received:', formData);
    
    // Guard para prevenir múltiples llamadas
    if (this.isSubmitting) {
      console.warn('⚠️ Submit already in progress, ignoring duplicate call');
      return;
    }
    
    // Validar que los datos no sean undefined
    if (!formData.contract_id || !formData.amount_due || !formData.due_date) {
      console.error('❌ Invalid form data - missing required fields:', formData);
      this.notificationService.showError('Datos de formulario inválidos. Por favor complete todos los campos.');
      return;
    }
    
    this.loading = true;
    this.isSubmitting = true;
    
    console.log('🚀 Calling PaymentService.create() with:', formData);
    
    this.paymentService.create(formData).subscribe({
      next: (response: any) => {
        console.log('✅ SUCCESS callback - Payment created:', response);
        this.loading = false;
        this.isSubmitting = false;
        this.notificationService.showSuccess('Pago creado exitosamente');
        this.router.navigate(['/payments']);
      },
      error: (error: any) => {
        console.error('❌ ERROR callback - Error creating payment:', error);
        
        // Mostrar detalles de validación si existen
        if (error?.error?.details && Array.isArray(error.error.details)) {
          const errorDetails = error.error.details.map((d: any) => `• ${d.field}: ${d.message}`).join('\n');
          console.error('Validation errors:', errorDetails);
          this.notificationService.showError(`Errores de validación:\n${errorDetails}`, 'Error al crear pago');
        } else {
          const errorMsg = error?.error?.error || error?.error?.message || 'Error al crear el pago';
          this.notificationService.showError(errorMsg);
        }
        
        this.loading = false;
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('🔵 COMPLETE callback - Observable completed');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/payments']);
  }
}
