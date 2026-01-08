import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  Expense, 
  ExpenseFormData, 
  ExpenseCategory,
  ExpenseFilter,
  ExpenseSummary,
  ExpenseStatistics
} from '../models/expense.model';
import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  // ==================== GASTOS ====================

  getExpenses(filter?: ExpenseFilter): Observable<PaginatedResponse<Expense>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.building_id) params = params.set('building_id', filter.building_id.toString());
      if (filter.category_id) params = params.set('category_id', filter.category_id.toString());
      if (filter.start_date) params = params.set('start_date', filter.start_date);
      if (filter.end_date) params = params.set('end_date', filter.end_date);
      if (filter.payment_method) params = params.set('payment_method', filter.payment_method);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.limit) params = params.set('limit', filter.limit.toString());
    }

    return this.http.get<PaginatedResponse<Expense>>(this.apiUrl, { params });
  }

  getExpenseById(id: number): Observable<ApiResponse<Expense>> {
    return this.http.get<ApiResponse<Expense>>(`${this.apiUrl}/${id}`);
  }

  getExpensesByBuilding(buildingId: number, filter?: Partial<ExpenseFilter>): Observable<ApiResponse<Expense[]>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.category_id) params = params.set('category_id', filter.category_id.toString());
      if (filter.start_date) params = params.set('start_date', filter.start_date);
      if (filter.end_date) params = params.set('end_date', filter.end_date);
    }

    return this.http.get<ApiResponse<Expense[]>>(`${this.apiUrl}/by-building/${buildingId}`, { params });
  }

  createExpense(expense: ExpenseFormData): Observable<ApiResponse<Expense>> {
    return this.http.post<ApiResponse<Expense>>(this.apiUrl, expense);
  }

  updateExpense(id: number, expense: Partial<ExpenseFormData>): Observable<ApiResponse<Expense>> {
    return this.http.put<ApiResponse<Expense>>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getSummaryByBuilding(buildingId: number, year?: number, month?: number): Observable<ApiResponse<ExpenseSummary>> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());

    return this.http.get<ApiResponse<ExpenseSummary>>(
      `${this.apiUrl}/summary/building/${buildingId}`,
      { params }
    );
  }

  getStatistics(filter?: Partial<ExpenseFilter>): Observable<ApiResponse<ExpenseStatistics>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.building_id) params = params.set('building_id', filter.building_id.toString());
      if (filter.start_date) params = params.set('start_date', filter.start_date);
      if (filter.end_date) params = params.set('end_date', filter.end_date);
    }

    return this.http.get<ApiResponse<ExpenseStatistics>>(`${this.apiUrl}/statistics`, { params });
  }

  /**
   * Obtiene el monto total de gastos sin paginación
   * Útil para mostrar el total real sin importar la página actual
   */
  getTotalAmount(filter?: Partial<ExpenseFilter>): Observable<ApiResponse<{total: number}>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.building_id) params = params.set('building_id', filter.building_id.toString());
      if (filter.category_id) params = params.set('category_id', filter.category_id.toString());
      if (filter.start_date) params = params.set('start_date', filter.start_date);
      if (filter.end_date) params = params.set('end_date', filter.end_date);
      if (filter.payment_method) params = params.set('payment_method', filter.payment_method);
    }

    return this.http.get<ApiResponse<{total: number}>>(`${this.apiUrl}/total-amount`, { params });
  }

  // ==================== CATEGORÍAS ====================

  getCategories(): Observable<ApiResponse<ExpenseCategory[]>> {
    return this.http.get<ApiResponse<ExpenseCategory[]>>(`${this.apiUrl}/categories`);
  }

  getCategoryById(id: number): Observable<ApiResponse<ExpenseCategory>> {
    return this.http.get<ApiResponse<ExpenseCategory>>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(category: Partial<ExpenseCategory>): Observable<ApiResponse<ExpenseCategory>> {
    return this.http.post<ApiResponse<ExpenseCategory>>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: number, category: Partial<ExpenseCategory>): Observable<ApiResponse<ExpenseCategory>> {
    return this.http.put<ApiResponse<ExpenseCategory>>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/categories/${id}`);
  }
}
