import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UnitType {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UnitTypeService {
  private apiUrl = `${environment.apiUrl}/unit-types`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los tipos de unidades
   */
  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  /**
   * Obtener un tipo de unidad por ID
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo tipo de unidad
   */
  create(unitType: UnitType): Observable<any> {
    return this.http.post<any>(this.apiUrl, unitType);
  }

  /**
   * Actualizar un tipo de unidad
   */
  update(id: number, unitType: Partial<UnitType>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, unitType);
  }

  /**
   * Eliminar un tipo de unidad
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
