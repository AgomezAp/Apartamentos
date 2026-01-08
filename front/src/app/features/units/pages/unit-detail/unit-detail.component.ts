import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UnitService } from '../../services/unit.service';
import { PaymentService } from '../../../payments/services/payment.service';
import { Unit } from '../../models/unit.model';
import { Payment } from '../../../payments/models/payment.model';

@Component({
  selector: 'app-unit-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './unit-detail.component.html',
  styleUrl: './unit-detail.component.css'
})
export class UnitDetailComponent implements OnInit {
  unit: Unit | null = null;
  payments: Payment[] = [];
  isLoading = false;
  isLoadingPayments = false;
  unitId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private unitService: UnitService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.unitId = isNaN(id) ? parseInt(id, 10) : +id;
      
      if (isNaN(this.unitId)) {
        console.error('Invalid unit ID:', id);
        this.router.navigate(['/units']);
        return;
      }
      
      this.loadUnit();
    });
  }

  loadUnit(): void {
    this.isLoading = true;
    this.unitService.getUnitById(this.unitId).subscribe({
      next: (response) => {
        this.unit = response.data || null;
        this.isLoading = false;
        
        // Cargar pagos si hay un contrato activo
        if (this.unit && this.unit.current_contract_id) {
          this.loadPayments();
        }
      },
      error: (error) => {
        console.error('Error loading unit:', error);
        this.isLoading = false;
      }
    });
  }

  loadPayments(): void {
    if (!this.unitId) return;
    
    this.isLoadingPayments = true;
    this.paymentService.getByUnitId(this.unitId, 12).subscribe({
      next: (response) => {
        this.payments = response.data || [];
        this.isLoadingPayments = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.isLoadingPayments = false;
      }
    });
  }

  editUnit(): void {
    this.router.navigate(['/units', this.unitId, 'edit']);
  }

  deleteUnit(): void {
    if (confirm('¿Está seguro de eliminar esta unidad?')) {
      this.unitService.deleteUnit(this.unitId).subscribe({
        next: () => {
          this.router.navigate(['/units']);
        },
        error: (error) => {
          console.error('Error deleting unit:', error);
          alert('Error al eliminar la unidad');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/units']);
  }

  /**
   * Obtener texto del estado de ocupación
   */
  getOccupationStatusText(): string {
    const status = this.unit?.occupation_status || this.unit?.status;
    switch (status) {
      case 'occupied': return 'Ocupada';
      case 'vacant': return 'Disponible';
      case 'maintenance': return 'Mantenimiento';
      case 'reserved': return 'Reservada';
      case 'available': return 'Disponible';
      default: return status || 'Desconocido';
    }
  }

  /**
   * Obtener clase CSS para el estado
   */
  getOccupationStatusClass(): string {
    const status = this.unit?.occupation_status || this.unit?.status;
    return `status-${status}`;
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount?: number): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  /**
   * Obtener estado del pago
   */
  getPaymentStatusText(status?: string): string {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      case 'partial': return 'Parcial';
      default: return status || 'Desconocido';
    }
  }

  /**
   * Obtener clase CSS para estado de pago
   */
  getPaymentStatusClass(status?: string): string {
    return `payment-${status}`;
  }
}
