import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard de Autenticación
 * Protege las rutas que requieren que el usuario esté autenticado
 * Si el usuario no está autenticado, lo redirige al login con un mensaje
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Verificar si el usuario está autenticado
  if (authService.isAuthenticated()) {
    return true;
  }

  // Mostrar mensaje al usuario
  notificationService.showWarning(
    'Debes iniciar sesión para acceder a esta página',
    'Sesión Requerida'
  );

  // Guardar la URL a la que intentaba acceder para redirigir después del login
  const returnUrl = state.url;
  
  // Redirigir al login con la URL de retorno y un mensaje
  router.navigate(['/auth/login'], { 
    queryParams: { 
      returnUrl,
      message: 'Por favor inicia sesión para continuar'
    } 
  });
  
  return false;
};
