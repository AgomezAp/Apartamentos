import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams 
} from '../../../core/models/api-response.model';
import { 
  Tenant, 
  TenantContract, 
  TenantPayment, 
  TenantDocument, 
  TenantSearchFilter 
} from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantsService {
  private readonly API_URL = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  // ========== CRUD de Inquilinos ==========
  
  /**
   * Obtener lista de inquilinos con filtros y paginación
   */
  getTenants(filter?: TenantSearchFilter, params?: PaginationParams): Observable<PaginatedResponse<Tenant>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    if (filter) {
      if (filter.search_term) httpParams = httpParams.set('search', filter.search_term);
      if (filter.status) httpParams = httpParams.set('status', filter.status);
      if (filter.building_id) httpParams = httpParams.set('building_id', filter.building_id.toString());
    }

    return this.http.get<PaginatedResponse<Tenant>>(this.API_URL, { params: httpParams }).pipe(
      map(response => {
        // Construir full_name si no existe, usando first_name y last_name
        if (response.data && Array.isArray(response.data)) {
          response.data = response.data.map(tenant => ({
            ...tenant,
            full_name: tenant.full_name || `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim()
          }));
        }
        return response;
      })
    );
  }

  /**
   * Obtener inquilino por ID
   */
  getTenantById(id: number): Observable<ApiResponse<Tenant>> {
    return this.http.get<ApiResponse<Tenant>>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevo inquilino
   */
  createTenant(tenant: Partial<Tenant>): Observable<ApiResponse<Tenant>> {
    return this.http.post<ApiResponse<Tenant>>(this.API_URL, tenant);
  }

  /**
   * Actualizar inquilino
   */
  updateTenant(id: number, tenant: Partial<Tenant>): Observable<ApiResponse<Tenant>> {
    return this.http.put<ApiResponse<Tenant>>(`${this.API_URL}/${id}`, tenant);
  }

  /**
   * Eliminar inquilino
   */
  deleteTenant(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  // ========== Contratos del Inquilino ==========

  /**
   * Obtener contratos de un inquilino
   */
  getTenantContracts(tenantId: number): Observable<ApiResponse<TenantContract[]>> {
    return this.http.get<ApiResponse<TenantContract[]>>(`${this.API_URL}/${tenantId}/contracts`);
  }

  /**
   * Obtener contrato activo de un inquilino
   */
  getActiveContract(tenantId: number): Observable<ApiResponse<TenantContract | null>> {
    return this.http.get<ApiResponse<TenantContract | null>>(`${this.API_URL}/${tenantId}/contracts/active`);
  }

  // ========== Pagos del Inquilino ==========

  /**
   * Obtener historial de pagos de un inquilino
   */

  getTenantPayments(tenantId: number): Observable<ApiResponse<TenantPayment[]>> {
    return this.http.get<ApiResponse<TenantPayment[]>>(`${this.API_URL}/${tenantId}/payments`);
  }

  // ========== Documentos del Inquilino ==========

  /**
   * Obtener documentos de un inquilino
   */
  getTenantDocuments(tenantId: number): Observable<ApiResponse<TenantDocument[]>> {
    return this.http.get<ApiResponse<TenantDocument[]>>(`${this.API_URL}/${tenantId}/documents`);
  }

  /**
   * Subir documento de inquilino
   */
  uploadDocument(tenantId: number, file: File, documentType: string): Observable<ApiResponse<TenantDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    return this.http.post<ApiResponse<TenantDocument>>(`${this.API_URL}/${tenantId}/documents`, formData);
  }

  /**
   * Eliminar documento
   */
  deleteDocument(tenantId: number, documentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${tenantId}/documents/${documentId}`);
  }

  // ========== Búsqueda ==========

  /**
   * Buscar inquilinos por término
   */
  searchTenants(searchTerm: string, params?: PaginationParams): Observable<PaginatedResponse<Tenant>> {
    return this.getTenants({ search_term: searchTerm }, params);
  }
}

