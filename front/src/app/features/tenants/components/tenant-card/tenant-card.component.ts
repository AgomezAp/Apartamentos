import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Tenant } from '../../models/tenant.model';

@Component({
  selector: 'app-tenant-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tenant-card.component.html',
  styleUrls: ['./tenant-card.component.css']
})
export class TenantCardComponent {
  @Input() tenant!: Tenant;
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  onDelete(): void {
    if (confirm(`¿Está seguro de eliminar al inquilino ${this.tenant.full_name}?`)) {
      this.delete.emit(this.tenant.id || this.tenant.tenant_id!);
    }
  }

  onEdit(): void {
    this.edit.emit(this.tenant.id || this.tenant.tenant_id!);
  }

  getStatusClass(): string {
    switch (this.tenant.status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'blacklisted': return 'status-blacklisted';
      default: return '';
    }
  }

  getStatusLabel(): string {
    switch (this.tenant.status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'blacklisted': return 'Lista Negra';
      default: return this.tenant.status || 'Desconocido';
    }
  }

  getInitials(): string {
    const fullName = this.getFullName();
    if (!fullName) return '?';
    
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  }

  getFullName(): string {
    if (this.tenant.full_name) {
      return this.tenant.full_name;
    }
    if (this.tenant.first_name && this.tenant.last_name) {
      return `${this.tenant.first_name} ${this.tenant.last_name}`;
    }
    if (this.tenant.first_name) {
      return this.tenant.first_name;
    }
    if (this.tenant.last_name) {
      return this.tenant.last_name;
    }
    return 'Sin nombre';
  }
}
