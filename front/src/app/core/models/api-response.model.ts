/**
 * Modelo de Respuesta API
 * Interfaces para las respuestas estándar del backend
 */

/**
 * Interfaz principal de respuesta de la API
 * @template T - Tipo de datos que contiene la respuesta
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationData;
}

/**
 * Datos de paginación
 */
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  // Propiedades adicionales computadas (para compatibilidad)
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Parámetros de paginación para peticiones
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string; // Para búsquedas
}

/**
 * Parámetros de filtrado genéricos
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Respuesta de error detallada
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  statusCode?: number;
}

/**
 * Respuesta exitosa genérica
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Respuesta con lista paginada
 */
export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: PaginationData;
  message?: string;
}

/**
 * Opciones para peticiones HTTP
 */
export interface RequestOptions {
  params?: PaginationParams & FilterParams;
  headers?: { [key: string]: string };
  skipLoading?: boolean;
}
