import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams 
} from '../../../core/models/api-response.model';
import { Unit, UnitFormData, UnitStats, UnitFilter } from '../models/unit.model';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private readonly API_URL = `${environment.apiUrl}/units`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener lista de unidades con paginación y filtros
   */
  getUnits(filter?: UnitFilter, params?: PaginationParams): Observable<PaginatedResponse<Unit>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    if (filter) {
      if (filter.building_id) httpParams = httpParams.set('building_id', filter.building_id.toString());
      if (filter.status) httpParams = httpParams.set('status', filter.status);
      if (filter.unit_type_id) httpParams = httpParams.set('unit_type_id', filter.unit_type_id.toString());
      if (filter.min_rent) httpParams = httpParams.set('min_rent', filter.min_rent.toString());
      if (filter.max_rent) httpParams = httpParams.set('max_rent', filter.max_rent.toString());
      if (filter.bedrooms) httpParams = httpParams.set('bedrooms', filter.bedrooms.toString());
      if (filter.furnished !== undefined) httpParams = httpParams.set('furnished', filter.furnished.toString());
      if (filter.search) httpParams = httpParams.set('search', filter.search);
    }

    return this.http.get<PaginatedResponse<Unit>>(this.API_URL, { params: httpParams });
  }

  /**
   * Obtener unidad por ID
   */
  getUnitById(id: number): Observable<ApiResponse<Unit>> {
    return this.http.get<ApiResponse<Unit>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener unidades por edificio
   */
  getUnitsByBuilding(buildingId: number, params?: PaginationParams): Observable<PaginatedResponse<Unit>> {
    return this.getUnits({ building_id: buildingId }, params);
  }

  /**
   * Obtener unidades disponibles
   */
  getAvailableUnits(buildingId?: number, params?: PaginationParams): Observable<PaginatedResponse<Unit>> {
    return this.getUnits({ building_id: buildingId, status: 'available' }, params);
  }

  /**
   * Crear nueva unidad
   */
  createUnit(unit: UnitFormData): Observable<ApiResponse<Unit>> {
    return this.http.post<ApiResponse<Unit>>(this.API_URL, unit);
  }

  /**
   * Actualizar unidad
   */
  updateUnit(id: number, unit: Partial<UnitFormData>): Observable<ApiResponse<Unit>> {
    return this.http.put<ApiResponse<Unit>>(`${this.API_URL}/${id}`, unit);
  }

  /**
   * Eliminar unidad
   */
  deleteUnit(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener estadísticas de unidades
   */
  getUnitStats(buildingId?: number): Observable<ApiResponse<UnitStats>> {
    const params = buildingId ? new HttpParams().set('building_id', buildingId.toString()) : undefined;
    return this.http.get<ApiResponse<UnitStats>>(`${this.API_URL}/stats`, { params });
  }

  /**
   * Cambiar estado de unidad
   */
  changeUnitStatus(id: number, status: Unit['status']): Observable<ApiResponse<Unit>> {
    return this.http.patch<ApiResponse<Unit>>(`${this.API_URL}/${id}/status`, { status });
  }
}
