import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor de Errores
 * Maneja errores HTTP de forma global
 * - 401: Redirige al login (token expirado o inválido)
 * - 403: Muestra error de permisos
 * - 404: Muestra error de recurso no encontrado
 * - 500: Muestra error del servidor
 * - Otros: Muestra error genérico
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
        console.error('Error del cliente:', error.error.message);
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 0:
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            break;

          case 400:
            // Error de validación o solicitud incorrecta
            if (error.error?.details && Array.isArray(error.error.details)) {
              // Si hay detalles de validación específicos
              const details = error.error.details as Array<{field: string, message: string}>;
              errorMessage = details.map(d => `${d.field}: ${d.message}`).join('\n');
              console.error('❌ Errores de validación:', details);
              
              // NO mostrar notificación automática para errores de validación
              // El componente debería manejarlos
              notificationService.showError('Por favor revisa los campos del formulario', 'Error de validación');
              return throwError(() => error);
            } else {
              errorMessage = error.error?.error || error.error?.message || 'Solicitud incorrecta. Verifica los datos.';
            }
            break;
            
          case 401:
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            authService.logout();
            router.navigate(['/auth/login']);
            break;
            
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
            
          case 404:
            errorMessage = 'El recurso solicitado no fue encontrado.';
            break;
            
          case 422:
            // Error de validación
            errorMessage = error.error?.error || error.error?.message || 'Error de validación.';
            break;
            
          case 500:
            errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
            break;
            
          case 503:
            errorMessage = 'Servicio no disponible temporalmente.';
            break;
            
          default:
            errorMessage = error.error?.error || error.error?.message || errorMessage;
        }
        
        console.error(
          `Error del servidor: Código ${error.status}\n` +
          `Mensaje: ${error.message}`
        );
      }
      
      // Mostrar notificación de error (excepto 401 que ya redirige)
      if (error.status !== 401) {
        notificationService.showError(errorMessage, 'Error');
      }
      
      // Re-lanzar el error para que lo maneje el componente si es necesario
      return throwError(() => error);
    })
  );
};
