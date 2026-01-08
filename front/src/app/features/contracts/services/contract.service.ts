import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';
import { 
  Contract, 
  ContractFormData, 
  ContractFilter,
  ContractStats,
  ExpiringContract,
  ContractPaymentInfo
} from '../models/contract.model';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private readonly API_URL = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los contratos con paginación y filtros
   */
  getContracts(page: number = 1, limit: number = 10, filters?: ContractFilter): Observable<PaginatedResponse<Contract>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.unit_id) params = params.set('unit_id', filters.unit_id.toString());
      if (filters.tenant_id) params = params.set('tenant_id', filters.tenant_id.toString());
    }

    return this.http.get<PaginatedResponse<Contract>>(this.API_URL, { params }).pipe(
      map(response => {
        // Mapear los datos para asegurar que tengan los campos esperados
        if (response.data && Array.isArray(response.data)) {
          response.data = response.data.map(contract => ({
            ...contract,
            // Construir tenant_name si no viene del backend
            tenant_name: contract.tenant_name || 
              (contract.tenant_name ? contract.tenant_name : 'No especificado'),
            // El backend debería traer unit_number desde el join con units
            unit_number: contract.unit_number || 'N/A',
            // El backend debería traer building_name desde el join con buildings
            building_name: contract.building_name || ''
          }));
        }
        return response;
      })
    );
  }

  /**
   * Obtener contrato por ID
   */
  getContractById(id: number): Observable<ApiResponse<Contract>> {
    return this.http.get<ApiResponse<Contract>>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevo contrato
   */
  createContract(data: ContractFormData): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(this.API_URL, data);
  }

  /**
   * Actualizar contrato existente
   */
  updateContract(id: number, data: Partial<ContractFormData>): Observable<ApiResponse<Contract>> {
    return this.http.put<ApiResponse<Contract>>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Eliminar contrato
   */
  deleteContract(id: number): Observable<ApiResponse<void>> {
    const url = `${this.API_URL}/${id}`;
    console.log('ContractService.deleteContract() - Calling DELETE:', url);
    return this.http.delete<ApiResponse<void>>(url);
  }

  /**
   * Finalizar contrato
   */
  finishContract(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${id}/finish`, {});
  }

  /**
   * Obtener contratos por vencer
   */
  getExpiringContracts(days: number = 30): Observable<ApiResponse<ExpiringContract[]>> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ApiResponse<ExpiringContract[]>>(`${this.API_URL}/expiring`, { params });
  }

  /**
   * Búsqueda avanzada de contratos
   */
  searchContracts(filters: ContractFilter): Observable<ApiResponse<Contract[]>> {
    let params = new HttpParams();

    if (filters.building_id) params = params.set('building_id', filters.building_id.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.tenant_id) params = params.set('tenant_id', filters.tenant_id.toString());
    if (filters.unit_id) params = params.set('unit_id', filters.unit_id.toString());
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    if (filters.minRent) params = params.set('minRent', filters.minRent.toString());
    if (filters.maxRent) params = params.set('maxRent', filters.maxRent.toString());
    if (filters.expiringInDays) params = params.set('expiringInDays', filters.expiringInDays.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.order) params = params.set('order', filters.order);

    return this.http.get<ApiResponse<Contract[]>>(`${this.API_URL}/search`, { params });
  }

  /**
   * Obtener contratos activos
   */
  getActiveContracts(): Observable<ApiResponse<Contract[]>> {
    const params = new HttpParams().set('status', 'active');
    return this.http.get<ApiResponse<Contract[]>>(this.API_URL, { params });
  }

  /**
   * Obtener contratos por unidad
   */
  getContractsByUnit(unitId: number): Observable<ApiResponse<Contract[]>> {
    const params = new HttpParams().set('unit_id', unitId.toString());
    return this.http.get<ApiResponse<Contract[]>>(this.API_URL, { params });
  }

  /**
   * Obtener contratos por inquilino
   */
  getContractsByTenant(tenantId: number): Observable<ApiResponse<Contract[]>> {
    const params = new HttpParams().set('tenant_id', tenantId.toString());
    return this.http.get<ApiResponse<Contract[]>>(this.API_URL, { params });
  }

  /**
   * Subir archivo de contrato
   */
  uploadContractFile(id: number, file: File): Observable<ApiResponse<{ filePath: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ filePath: string }>>(`${this.API_URL}/${id}/upload`, formData);
  }

  /**
   * Obtener estadísticas de contratos
   */
  getContractStats(): Observable<ApiResponse<ContractStats>> {
    return this.http.get<ApiResponse<ContractStats>>(`${this.API_URL}/stats`);
  }

  /**
   * Obtener información de pagos de un contrato
   */
  getContractPayments(id: number): Observable<ApiResponse<ContractPaymentInfo>> {
    return this.http.get<ApiResponse<ContractPaymentInfo>>(`${this.API_URL}/${id}/payments`);
  }
}
