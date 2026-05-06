import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

/**
 * Mapeo de nombres de campos a español para mensajes más amigables
 */
const FIELD_NAMES: Record<string, string> = {
  // Campos de inquilinos
  'first_name': 'Nombre',
  'last_name': 'Apellido',
  'document_type': 'Tipo de documento',
  'document_number': 'Número de documento',
  'email': 'Correo electrónico',
  'phone': 'Teléfono fijo',
  'mobile_phone': 'Teléfono móvil',
  'emergency_contact_name': 'Contacto de emergencia',
  'emergency_contact_phone': 'Teléfono de emergencia',
  'occupation': 'Ocupación',
  'company_name': 'Empresa',
  'monthly_income': 'Ingreso mensual',
  
  // Campos de contratos
  'unit_id': 'Unidad',
  'tenant_id': 'Inquilino',
  'start_date': 'Fecha de inicio',
  'end_date': 'Fecha de fin',
  'monthly_rent': 'Renta mensual',
  'deposit_amount': 'Depósito',
  'payment_day': 'Día de pago',
  'status': 'Estado',
  'contract_number': 'Número de contrato',
  
  // Campos de unidades
  'unit_number': 'Número de unidad',
  'building_id': 'Edificio',
  'floor': 'Piso',
  'area': 'Área',
  'bedrooms': 'Habitaciones',
  'bathrooms': 'Baños',
  'rental_price': 'Precio de renta',
  'description': 'Descripción',
  
  // Campos de pagos
  'amount': 'Monto',
  'amount_due': 'Monto a pagar',
  'amount_paid': 'Monto pagado',
  'payment_date': 'Fecha de pago',
  'due_date': 'Fecha de vencimiento',
  'payment_method': 'Método de pago',
  'period_month': 'Mes',
  'period_year': 'Año',
  'contract_id': 'Contrato',
  
  // Campos de edificios
  'name': 'Nombre',
  'address': 'Dirección',
  'city': 'Ciudad',
  'state': 'Departamento/Estado',
  'zip_code': 'Código postal',
  'total_units': 'Total de unidades',
  
  // Campos generales
  'notes': 'Notas',
  'is_active': 'Estado activo',
};

/**
 * Obtiene el nombre amigable de un campo
 */
function getFieldName(field: string): string {
  return FIELD_NAMES[field] || field.replace(/_/g, ' ');
}

/**
 * Formatea un mensaje de error de validación
 */
function formatValidationError(detail: { field: string; message: string; value?: any }): string {
  const fieldName = getFieldName(detail.field);
  let message = detail.message;
  
  // Si el mensaje ya es descriptivo, usarlo directamente
  if (message.includes('requerido') || message.includes('debe') || message.includes('inválido')) {
    return `${fieldName}: ${message}`;
  }
  
  return `${fieldName}: ${message}`;
}

/**
 * Interceptor de Errores Mejorado
 * Muestra mensajes específicos y detallados al usuario
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🔴 Error HTTP interceptado:', {
        status: error.status,
        url: error.url,
        error: error.error
      });

      // No mostrar notificación por defecto - solo en casos específicos
      let shouldShowNotification = true;
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente (red, etc.)
        notificationService.showError(
          'Error de conexión. Por favor verifica tu internet e intenta de nuevo.',
          'Error de Red'
        );
        return throwError(() => error);
      }

      // Error del lado del servidor
      switch (error.status) {
        case 0:
          notificationService.showError(
            'No se pudo conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.',
            'Sin Conexión',
            8000
          );
          shouldShowNotification = false;
          break;

        case 400:
          // Errores de validación o solicitud incorrecta
          handleBadRequestError(error, notificationService);
          shouldShowNotification = false;
          break;
          
        case 401:
          // Verificar si la solicitud es a una ruta de autenticación del backend
          const isAuthApiRoute = req.url.includes('/auth/login') || 
                                 req.url.includes('/auth/register') || 
                                 req.url.includes('/auth/refresh');
          
          if (isAuthApiRoute) {
            // Para rutas de auth del backend, mostrar el mensaje específico
            const loginErrorMsg = error.error?.error || error.error?.message || 'Credenciales inválidas';
            notificationService.showError(loginErrorMsg, 'Error de Autenticación');
            shouldShowNotification = false;
          } else if (authService.isAuthenticated()) {
            // El usuario tenía una sesión válida que expiró en el servidor — redirigir al login
            authService.logout();
            notificationService.showWarning(
              'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
              'Sesión Expirada',
              6000
            );
            router.navigate(['/auth/login'], {
              queryParams: { sessionExpired: 'true', returnUrl: router.url }
            });
            shouldShowNotification = false;
          } else {
            // El usuario no estaba autenticado (token ausente o ya expirado localmente)
            // No redirigir — puede estar en una página pública (reset-password, etc.)
            authService.logoutSilently();
            shouldShowNotification = false;
          }
          break;
          
        case 403:
          notificationService.showError(
            'No tienes permisos para realizar esta acción. Contacta al administrador si crees que esto es un error.',
            'Acceso Denegado'
          );
          shouldShowNotification = false;
          break;
          
        case 404:
          const notFoundMsg = error.error?.error || 'El recurso solicitado no fue encontrado.';
          notificationService.showError(notFoundMsg, 'No Encontrado');
          shouldShowNotification = false;
          break;
          
        case 409:
          // Conflicto - registro duplicado, etc.
          const conflictMsg = error.error?.error || 'Ya existe un registro con estos datos.';
          notificationService.showError(conflictMsg, 'Conflicto');
          shouldShowNotification = false;
          break;
          
        case 422:
          // Error de validación semántica
          handleValidationError(error, notificationService);
          shouldShowNotification = false;
          break;
          
        case 500:
          notificationService.showError(
            'Ocurrió un error en el servidor. Por favor intenta de nuevo más tarde.',
            'Error del Servidor',
            8000
          );
          shouldShowNotification = false;
          break;
          
        case 502:
        case 503:
        case 504:
          notificationService.showError(
            'El servicio no está disponible temporalmente. Por favor intenta en unos minutos.',
            'Servicio No Disponible',
            8000
          );
          shouldShowNotification = false;
          break;
          
        default:
          if (shouldShowNotification) {
            const defaultMsg = error.error?.error || error.error?.message || 'Ha ocurrido un error inesperado.';
            notificationService.showError(defaultMsg, 'Error');
          }
      }
      
      return throwError(() => error);
    })
  );
};

/**
 * Maneja errores 400 Bad Request
 */
function handleBadRequestError(error: HttpErrorResponse, notificationService: NotificationService): void {
  const errorData = error.error;
  
  // Caso 1: Error con detalles de contratos activos (eliminar inquilino)
  if (errorData?.details?.contracts) {
    const contracts = errorData.details.contracts;
    const contractsList = contracts.map((c: any) => 
      `• ${c.contract_number} (${c.status === 'active' ? 'Activo' : 'Pendiente'})`
    ).join('\n');
    
    notificationService.showError(
      `${errorData.error}\n\nContratos:\n${contractsList}\n\n${errorData.details.hint || ''}`,
      'No se puede eliminar',
      12000
    );
    return;
  }
  
  // Caso 2: Array de errores de validación del backend
  if (errorData?.details && Array.isArray(errorData.details)) {
    const details = errorData.details as Array<{ field: string; message: string; value?: any }>;
    
    if (details.length === 1) {
      // Un solo error - mostrar directamente
      notificationService.showError(
        formatValidationError(details[0]),
        'Error de Validación'
      );
    } else {
      // Múltiples errores - mostrar cada uno
      const errorMessages = details.map(d => `• ${formatValidationError(d)}`).join('\n');
      notificationService.showError(
        `Por favor corrige los siguientes errores:\n\n${errorMessages}`,
        'Errores de Validación',
        10000
      );
    }
    return;
  }
  
  // Caso 3: Mensaje de error simple
  const simpleMessage = errorData?.error || errorData?.message || 'Los datos enviados no son válidos.';
  notificationService.showError(simpleMessage, 'Error');
}

/**
 * Maneja errores 422 Unprocessable Entity
 */
function handleValidationError(error: HttpErrorResponse, notificationService: NotificationService): void {
  const errorData = error.error;
  
  if (errorData?.details && Array.isArray(errorData.details)) {
    const details = errorData.details as Array<{ field: string; message: string }>;
    const errorMessages = details.map(d => `• ${formatValidationError(d)}`).join('\n');
    
    notificationService.showError(
      `Errores de validación:\n\n${errorMessages}`,
      'Datos Inválidos',
      10000
    );
  } else {
    const message = errorData?.error || errorData?.message || 'Los datos proporcionados no son válidos.';
    notificationService.showError(message, 'Error de Validación');
  }
}
