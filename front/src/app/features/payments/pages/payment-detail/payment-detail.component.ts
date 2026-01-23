import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Payment, Transaction, PaymentMethods } from '../../models/payment.model';
import { TransactionFormComponent } from '../../components/transaction-form/transaction-form.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-payment-detail',
  imports: [CommonModule, RouterModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.css'
})
export class PaymentDetailComponent implements OnInit {
  payment: Payment | null = null;
  transactions: Transaction[] = [];
  receipts: any[] = [];
  loading = false;
  showTransactionForm = false;
  uploadingReceipts = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPayment(parseInt(id));
      this.loadTransactions(parseInt(id));
      this.loadReceipts(parseInt(id));
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

  loadReceipts(paymentId: number): void {
    this.paymentService.getReceipts(paymentId).subscribe({
      next: (response: any) => {
        this.receipts = response?.data || [];
      },
      error: (error: any) => {
        console.error('Error loading receipts:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0 || !this.payment?.id) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf') {
        this.notificationService.showError(`${file.name} no es un archivo PDF`, 'Archivo no válido');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.notificationService.showError(`${file.name} excede el límite de 10MB`, 'Archivo muy grande');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    this.uploadingReceipts = true;
    this.paymentService.uploadReceipts(this.payment.id!, validFiles).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.notificationService.showSuccess(response.message || 'Comprobantes subidos', 'Éxito');
          this.loadReceipts(this.payment!.id!);
        }
        this.uploadingReceipts = false;
        event.target.value = '';
      },
      error: (err: any) => {
        console.error('Error uploading receipts:', err);
        this.notificationService.showError(err.error?.error || 'Error subiendo comprobantes', 'Error');
        this.uploadingReceipts = false;
        event.target.value = '';
      }
    });
  }

  deleteReceipt(receiptId: number): void {
    if (!confirm('¿Está seguro de eliminar este comprobante?')) return;

    this.paymentService.deleteReceipt(receiptId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Comprobante eliminado', 'Éxito');
        if (this.payment) {
          this.loadReceipts(this.payment.id || this.payment.payment_id!);
        }
      },
      error: (error: any) => {
        this.notificationService.showError(error.error?.error || 'Error eliminando comprobante', 'Error');
      }
    });
  }

  getDownloadUrl(receiptId: number): string {
    return this.paymentService.downloadReceipt(receiptId);
  }

  downloadReceipt(receipt: any): void {
    if (!receipt?.id) return;
    this.paymentService.downloadReceiptFile(receipt.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = receipt.original_name || 'comprobante.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.notificationService.showError(err?.error || 'Error descargando comprobante', 'Error');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
