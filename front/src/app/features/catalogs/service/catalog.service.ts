import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  UnitType,
  UnitTypeFormData,
  ServiceType,
  ServiceTypeFormData,
  PaymentStatus,
  PaymentStatusFormData,
  AlertType,
  AlertTypeFormData,
  User,
  UserFormData,
  ExpenseCategory,
  ExpenseCategoryFormData
} from './models/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly API_URL = `${environment.apiUrl}/catalogs`;
  private readonly EXPENSES_URL = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) { }

  // ==================== UNIT TYPES ====================

  /**
   * Obtener tipos de unidades
   */
  getUnitTypes(): Observable<ApiResponse<UnitType[]>> {
    return this.http.get<ApiResponse<UnitType[]>>(`${this.API_URL}/unit-types`);
  }

  /**
   * Crear tipo de unidad
   */
  createUnitType(data: UnitTypeFormData): Observable<ApiResponse<UnitType>> {
    return this.http.post<ApiResponse<UnitType>>(`${this.API_URL}/unit-types`, data);
  }

  /**
   * Actualizar tipo de unidad
   */
  updateUnitType(id: number, data: Partial<UnitTypeFormData>): Observable<ApiResponse<UnitType>> {
    return this.http.put<ApiResponse<UnitType>>(`${this.API_URL}/unit-types/${id}`, data);
  }

  /**
   * Eliminar tipo de unidad
   */
  deleteUnitType(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/unit-types/${id}`);
  }

  // ==================== SERVICE TYPES ====================

  /**
   * Obtener tipos de servicios
   */
  getServiceTypes(): Observable<ApiResponse<ServiceType[]>> {
    return this.http.get<ApiResponse<ServiceType[]>>(`${this.API_URL}/service-types`);
  }

  /**
   * Crear tipo de servicio
   */
  createServiceType(data: ServiceTypeFormData): Observable<ApiResponse<ServiceType>> {
    return this.http.post<ApiResponse<ServiceType>>(`${this.API_URL}/service-types`, data);
  }

  /**
   * Actualizar tipo de servicio
   */
  updateServiceType(id: number, data: Partial<ServiceTypeFormData>): Observable<ApiResponse<ServiceType>> {
    return this.http.put<ApiResponse<ServiceType>>(`${this.API_URL}/service-types/${id}`, data);
  }

  /**
   * Eliminar tipo de servicio
   */
  deleteServiceType(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/service-types/${id}`);
  }

  // ==================== PAYMENT STATUSES ====================

  /**
   * Obtener estados de pagos
   */
  getPaymentStatuses(): Observable<ApiResponse<PaymentStatus[]>> {
    return this.http.get<ApiResponse<PaymentStatus[]>>(`${this.API_URL}/payment-statuses`);
  }

  /**
   * Crear estado de pago
   */
  createPaymentStatus(data: PaymentStatusFormData): Observable<ApiResponse<PaymentStatus>> {
    return this.http.post<ApiResponse<PaymentStatus>>(`${this.API_URL}/payment-statuses`, data);
  }

  /**
   * Actualizar estado de pago
   */
  updatePaymentStatus(id: number, data: Partial<PaymentStatusFormData>): Observable<ApiResponse<PaymentStatus>> {
    return this.http.put<ApiResponse<PaymentStatus>>(`${this.API_URL}/payment-statuses/${id}`, data);
  }

  /**
   * Eliminar estado de pago
   */
  deletePaymentStatus(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/payment-statuses/${id}`);
  }

  // ==================== ALERT TYPES ====================

  /**
   * Obtener tipos de alertas
   */
  getAlertTypes(): Observable<ApiResponse<AlertType[]>> {
    return this.http.get<ApiResponse<AlertType[]>>(`${this.API_URL}/alert-types`);
  }

  /**
   * Crear tipo de alerta
   */
  createAlertType(data: AlertTypeFormData): Observable<ApiResponse<AlertType>> {
    return this.http.post<ApiResponse<AlertType>>(`${this.API_URL}/alert-types`, data);
  }

  /**
   * Actualizar tipo de alerta
   */
  updateAlertType(id: number, data: Partial<AlertTypeFormData>): Observable<ApiResponse<AlertType>> {
    return this.http.put<ApiResponse<AlertType>>(`${this.API_URL}/alert-types/${id}`, data);
  }

  /**
   * Eliminar tipo de alerta
   */
  deleteAlertType(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/alert-types/${id}`);
  }

  // ==================== USERS ====================

  /**
   * Obtener usuarios
   */
  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.API_URL}/users`);
  }

  /**
   * Crear usuario
   */
  createUser(data: UserFormData): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.API_URL}/users`, data);
  }

  /**
   * Actualizar usuario
   */
  updateUser(id: number, data: Partial<UserFormData>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/users/${id}`, data);
  }

  /**
   * Eliminar usuario
   */
  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/users/${id}`);
  }

  // ==================== EXPENSE CATEGORIES ====================

  /**
   * Obtener categorías de gastos
   */
  getExpenseCategories(): Observable<ApiResponse<ExpenseCategory[]>> {
    return this.http.get<ApiResponse<ExpenseCategory[]>>(`${this.EXPENSES_URL}/categories`);
  }

  /**
   * Crear categoría de gasto
   */
  createExpenseCategory(data: ExpenseCategoryFormData): Observable<ApiResponse<ExpenseCategory>> {
    return this.http.post<ApiResponse<ExpenseCategory>>(`${this.EXPENSES_URL}/categories`, data);
  }

  /**
   * Actualizar categoría de gasto
   */
  updateExpenseCategory(id: number, data: Partial<ExpenseCategoryFormData>): Observable<ApiResponse<ExpenseCategory>> {
    return this.http.put<ApiResponse<ExpenseCategory>>(`${this.EXPENSES_URL}/categories/${id}`, data);
  }

  /**
   * Eliminar categoría de gasto
   */
  deleteExpenseCategory(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.EXPENSES_URL}/categories/${id}`);
  }

  // ==================== BUILDINGS ====================

  /**
   * Obtener edificios (para catálogos/selects)
   */
  getBuildings(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/buildings`);
  }
}
