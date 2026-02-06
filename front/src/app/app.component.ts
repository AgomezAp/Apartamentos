import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'front';
  sidebarCollapsed = false;
  showNavigation = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Escuchar cambios de ruta para mostrar/ocultar sidebar y header
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Ocultar sidebar y header en rutas de autenticación
        this.showNavigation = !event.url.includes('/auth');
      });

    // Verificar la ruta actual al inicializar
    this.showNavigation = !this.router.url.includes('/auth');
  }

  onToggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onLogout() {
    // placeholder for logout handling — emit or call auth service as needed
    console.log('logout requested');
  }
}
