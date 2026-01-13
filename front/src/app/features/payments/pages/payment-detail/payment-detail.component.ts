import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { Payment, Transaction, PaymentMethods } from '../../models/payment.model';
import { TransactionFormComponent } from '../../components/transaction-form/transaction-form.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-payment-detail',
  imports: [CommonModule, RouterModule, TransactionFormComponent, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.css'
})
export class PaymentDetailComponent implements OnInit {
  payment: Payment | null = null;
  transactions: Transaction[] = [];
  loading = false;
  showTransactionForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPayment(parseInt(id));
      this.loadTransactions(parseInt(id));
    }
  }

  loadPayment(id: number): void {
    this.loading = true;
    this.paymentService.getById(id).subscribe({
      next: (response: any) => {
        // Extraer pago de la respuesta del API
        this.payment = response?.data || response;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading payment:', error);
        this.loading = false;
        alert('Error al cargar el pago');
        this.router.navigate(['/payments']);
      }
    });
  }

  loadTransactions(paymentId: number): void {
    this.paymentService.getTransactions(paymentId).subscribe({
      next: (response: any) => {
        // Extraer transacciones de la respuesta del API
        this.transactions = response?.data || response || [];
      },
      error: (error: any) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  onDelete(): void {
    if (this.payment && confirm('¿Está seguro de eliminar este pago?')) {
      this.paymentService.delete(this.payment.id || this.payment.payment_id!).subscribe({
        next: () => {
          this.router.navigate(['/payments']);
        },
        error: (error: any) => {
          console.error('Error deleting payment:', error);
          alert('Error al eliminar el pago');
        }
      });
    }
  }

  onEdit(): void {
    if (this.payment) {
      this.router.navigate(['/payments', this.payment.id || this.payment.payment_id, 'edit']);
    }
  }

  onMarkCompleted(): void {
    if (!this.payment) return;
    
    this.paymentService.update(this.payment.id || this.payment.payment_id!, { 
      payment_status_id: 2,  // 2 = Pagado/Completado
      payment_date: new Date().toISOString().split('T')[0]  // Solo la fecha, sin hora
    }).subscribe({
      next: () => {
        this.loadPayment(this.payment!.id || this.payment!.payment_id!);
      },
      error: (error: any) => {
        console.error('Error updating payment:', error);
        alert('Error al actualizar el pago');
      }
    });
  }

  onCancel(): void {
    if (!this.payment) return;
    
    if (confirm('¿Está seguro de cancelar este pago?')) {
      this.paymentService.update(this.payment.id || this.payment.payment_id!, { status: 'cancelled' }).subscribe({
        next: () => {
          this.loadPayment(this.payment!.id || this.payment!.payment_id!);
        },
        error: (error: any) => {
          console.error('Error cancelling payment:', error);
          alert('Error al cancelar el pago');
        }
      });
    }
  }

  toggleTransactionForm(): void {
    this.showTransactionForm = !this.showTransactionForm;
  }

  onTransactionSubmit(formData: any): void {
    this.paymentService.createTransaction(formData).subscribe({
      next: () => {
        this.showTransactionForm = false;
        if (this.payment) {
          this.loadTransactions(this.payment.id || this.payment.payment_id!);
        }
      },
      error: (error: any) => {
        console.error('Error creating transaction:', error);
        alert('Error al crear la transacción');
      }
    });
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Desconocido';
    const labels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'completed': 'Completado',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-unknown';
    return `status-${status}`;
  }

  getPaymentMethodLabel(method: string | undefined): string {
    if (!method) return 'No especificado';
    const pm = PaymentMethods.find(m => m.value === method);
    return pm?.label || method;
  }

  getPaymentMethodIcon(method: string | undefined): string {
    if (!method) return '💳';
    const pm = PaymentMethods.find(m => m.value === method);
    return pm?.icon || '💳';
  }

  getDaysUntilDue(): number | null {
    if (!this.payment?.due_date) return null;
    const due = new Date(this.payment.due_date);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
