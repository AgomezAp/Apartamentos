import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor de Autenticación
 * Añade el token JWT a todas las peticiones HTTP salientes (excepto login y register)
 * Si el token existe, lo incluye en el header Authorization
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Rutas públicas que no necesitan token
  const publicRoutes = ['/api/auth/login', '/api/auth/register'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
  
  // Si es ruta pública, no agregar token
  if (isPublicRoute) {
    return next(req);
  }
  
  // Obtener el token del servicio de autenticación
  const token = authService.getToken();
  
  // Si existe token, clonar la petición y añadir el header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Continuar con la petición (modificada o no)
  return next(req);
};
