import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor de Loading
 * Muestra/oculta el spinner de carga durante las peticiones HTTP
 * - Incrementa el contador al iniciar una petición
 * - Decrementa el contador al finalizar (éxito o error)
 * - El LoadingService controla la visibilidad del spinner según el contador
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Verificar si la petición debe ignorar el loading
  // Se puede añadir un header personalizado para ignorar el loading
  const skipLoading = req.headers.has('X-Skip-Loading');
  
  if (!skipLoading) {
    // Mostrar loading
    loadingService.show();
  }
  
  return next(req).pipe(
    finalize(() => {
      if (!skipLoading) {
        // Ocultar loading cuando termine (éxito o error)
        loadingService.hide();
      }
    })
  );
};
