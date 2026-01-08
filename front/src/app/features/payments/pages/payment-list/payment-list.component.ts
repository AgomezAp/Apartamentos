import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { Payment, PaymentFilter, PaymentStatuses, PaymentMethods } from '../../models/payment.model';
import { PaymentCardComponent } from '../../components/payment-card/payment-card.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-list',
  imports: [CommonModule, RouterModule, FormsModule, PaymentCardComponent, CurrencyFormatPipe],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.css'
})
export class PaymentListComponent implements OnInit, OnDestroy {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  loading = false;
  
  // Filters
  filter: PaymentFilter = {};
  searchTenant: string = '';
  statuses = PaymentStatuses;
  paymentMethods = PaymentMethods;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;

  // Estadísticas
  summary = {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  };

  private dateSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
    
    // Configurar debounce para cambios de fecha
    this.dateSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadPayments();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getAll(this.filter).subscribe({
      next: (response: any) => {
        // Extraer array de pagos de la respuesta del API
        const payments = response?.data || response || [];
        this.payments = Array.isArray(payments) ? payments : [];
        
        // Aplicar filtro por nombre de inquilino
        this.applyTenantFilter();
        
        this.totalItems = this.filteredPayments.length;
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading payments:', error);
        this.loading = false;
      }
    });
  }

  applyTenantFilter(): void {
    if (this.searchTenant && this.searchTenant.trim()) {
      const searchLower = this.searchTenant.toLowerCase().trim();
      this.filteredPayments = this.payments.filter(payment => 
        payment.tenant_name?.toLowerCase().includes(searchLower)
      );
    } else {
      this.filteredPayments = [...this.payments];
    }
  }

  calculateStatistics(): void {
    this.summary = {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0
    };

    this.filteredPayments.forEach(payment => {
      const amount = payment.amount || payment.amount_due || 0;
      
      // Siempre sumar al total
      this.summary.total += amount;
      
      // Contar por status (el campo mapeado del backend)
      // El backend mapea: Pagado→completed, Pendiente→pending, Parcial→partial, Vencido→overdue
      switch (payment.status) {
        case 'completed':
        case 'paid':
          this.summary.completed++;
          break;
        case 'pending':
          this.summary.pending++;
          break;
        case 'partial':
          this.summary.pending++; // Los parciales se cuentan como pendientes
          break;
        case 'overdue':
          this.summary.overdue++;
          break;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadPayments();
  }

  onDateChange(): void {
    this.dateSubject.next('');
  }

  clearFilters(): void {
    this.filter = {};
    this.searchTenant = '';
    this.currentPage = 1;
    this.loadPayments();
  }

  onDelete(paymentId: number | undefined): void {
    if (!paymentId) return;
    this.paymentService.delete(paymentId).subscribe({
      next: () => {
        this.loadPayments();
      },
      error: (error: any) => {
        console.error('Error deleting payment:', error);
        alert('Error al eliminar el pago');
      }
    });
  }

  onMarkCompleted(paymentId: number | undefined): void {
    if (!paymentId) return;
    
    // payment_status_id: 2 = Pagado/Completado
    this.paymentService.update(paymentId, { 
      payment_status_id: 2, 
      payment_date: new Date().toISOString() 
    }).subscribe({
      next: () => {
        this.loadPayments();
      },
      error: (error: any) => {
        console.error('Error updating payment:', error);
        alert('Error al actualizar el pago');
      }
    });
  }

  get paginatedPayments(): Payment[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPayments.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
