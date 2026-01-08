import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams 
} from '../../../core/models/api-response.model';
import { 
  Building, 
  BuildingStats, 
  BuildingFormData,
  BuildingDashboard 
} from '../models/building.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private readonly API_URL = `${environment.apiUrl}/buildings`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener lista de edificios con paginación
   */
  getBuildings(params?: PaginationParams): Observable<PaginatedResponse<Building>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<PaginatedResponse<Building>>(this.API_URL, { params: httpParams });
  }

  /**
   * Obtener edificio por ID
   */
  getBuildingById(id: number): Observable<ApiResponse<Building>> {
    return this.http.get<ApiResponse<Building>>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear nuevo edificio
   */
  createBuilding(data: BuildingFormData): Observable<ApiResponse<Building>> {
    // El backend ahora acepta los nombres de campos del frontend directamente
    return this.http.post<ApiResponse<Building>>(this.API_URL, data);
  }

  /**
   * Actualizar edificio existente
   */
  updateBuilding(id: number, data: Partial<BuildingFormData>): Observable<ApiResponse<Building>> {
    // El backend ahora acepta los nombres de campos del frontend directamente
    return this.http.put<ApiResponse<Building>>(`${this.API_URL}/${id}`, data);
  }

  /**
   * Eliminar edificio
   */
  deleteBuilding(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener estadísticas de un edificio
   */
  getBuildingStats(id: number): Observable<ApiResponse<Building>> {
    return this.http.get<ApiResponse<Building>>(`${this.API_URL}/${id}/stats`);
  }

  /**
   * Obtener dashboard de un edificio
   */
  getBuildingDashboard(id: number): Observable<ApiResponse<BuildingDashboard>> {
    return this.http.get<ApiResponse<BuildingDashboard>>(`${this.API_URL}/${id}/dashboard`);
  }

  /**
   * Subir foto del edificio
   */
  uploadBuildingPhoto(buildingId: number, file: File): Observable<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('building_id', buildingId.toString());

    return this.http.post<ApiResponse<{ url: string }>>(
      `${environment.apiUrl}/uploads/building-photo`, 
      formData
    );
  }

  /**
   * Buscar edificios
   */
  searchBuildings(searchTerm: string): Observable<PaginatedResponse<Building>> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<PaginatedResponse<Building>>(this.API_URL, { params });
  }

  /**
   * Obtener edificios activos
   */
  getActiveBuildings(): Observable<PaginatedResponse<Building>> {
    const params = new HttpParams().set('is_active', 'true');
    return this.http.get<PaginatedResponse<Building>>(this.API_URL, { params });
  }
}
