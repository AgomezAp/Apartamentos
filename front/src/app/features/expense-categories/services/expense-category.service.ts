import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ExpenseCategory {
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
export class ExpenseCategoryService {
  private apiUrl = `${environment.apiUrl}/expense-categories`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las categorías de gastos
   */
  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  /**
   * Obtener una categoría por ID
   */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva categoría
   */
  create(category: ExpenseCategory): Observable<any> {
    return this.http.post<any>(this.apiUrl, category);
  }

  /**
   * Actualizar una categoría
   */
  update(id: number, category: Partial<ExpenseCategory>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, category);
  }

  /**
   * Eliminar una categoría
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
