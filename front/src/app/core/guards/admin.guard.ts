import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard de Administrador
 * Protege las rutas que requieren permisos de administrador
 * Verifica que el usuario esté autenticado Y tenga rol de admin
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Primero verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  // Verificar si tiene rol de administrador
  if (authService.isAdmin()) {
    return true;
  }

  // Si no es admin, mostrar mensaje y redirigir al dashboard
  notificationService.showError(
    'No tienes permisos para acceder a esta sección',
    'Acceso Denegado'
  );
  
  router.navigate(['/dashboard']);
  return false;
};
