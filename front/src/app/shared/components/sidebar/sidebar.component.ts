import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  badge?: string | number;
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() collapsed: boolean = false;

  constructor(private authService: AuthService) {}
  @Input() menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: '📈', route: '/dashboard' },
    { label: 'Edificios', icon: '🏛️', route: '/buildings' },
    { label: 'Unidades', icon: '🏢', route: '/units' },
    { label: 'Inquilinos', icon: '👥', route: '/tenants' },
    { label: 'Contratos', icon: '📝', route: '/contracts' },
    { label: 'Pagos', icon: '💵', route: '/payments' },
    { label: 'Gastos', icon: '📊', route: '/expenses' },
    { label: 'Mantenimiento', icon: '🔧', route: '/maintenance' },
    { label: 'Reportes', icon: '📊', route: '/reports' },
    { label: 'Configuración', icon: '⚙️', route: '/settings' },
    {
      label: 'Catálogos',
      icon: '📚',
      expanded: false,
      children: [
        { label: 'Tipos de Unidades', icon: '🏠', route: '/unit-types' },
        { label: 'Categorías de Mantenimiento', icon: '💰', route: '/expense-categories' }
      ]
    }
  ];

  toggleMenuItem(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
