import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Contract } from '../../models/contract.model';

@Component({
  selector: 'app-contract-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './contract-card.component.html',
  styleUrl: './contract-card.component.css'
})
export class ContractCardComponent {
  @Input() contract!: Contract;
  @Output() onFinish = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<number>();
  @Output() onDelete = new EventEmitter<number>();
  Math = Math;

  getStatusClass(): string {
    switch (this.contract.status) {
      case 'active': return 'status-active';
      case 'finished': return 'status-finished';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getStatusLabel(): string {
    switch (this.contract.status) {
      case 'active': return 'Activo';
      case 'finished': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      case 'pending': return 'Pendiente';
      default: return this.contract.status || '';
    }
  }

  getDaysRemaining(): number {
    if (!this.contract.end_date) return 0;
    const endDate = new Date(this.contract.end_date);
    const today = new Date();
    const diff = endDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isExpiringSoon(): boolean {
    const days = this.getDaysRemaining();
    return days > 0 && days <= 30;
  }

  isExpired(): boolean {
    return this.getDaysRemaining() < 0;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES');
  }

  formatAmount(amount: number | undefined): string {
    if (!amount) return '$0.00';
    return `$${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  finish(): void {
    if (this.contract.id && confirm('¿Está seguro de finalizar este contrato?')) {
      this.onFinish.emit(this.contract.id);
    }
  }

  edit(): void {
    console.log('ContractCard.edit() called for contract id:', this.contract.id);
    if (this.contract.id) {
      this.onEdit.emit(this.contract.id);
    }
  }

  delete(): void {
    console.log('ContractCard.delete() called for contract id:', this.contract.id);
    if (this.contract.id && confirm('¿Está seguro de eliminar este contrato?')) {
      console.log('User confirmed deletion, emitting onDelete event');
      this.onDelete.emit(this.contract.id);
    } else {
      console.log('User cancelled deletion or contract has no id');
    }
  }
}
