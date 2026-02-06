import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { CatalogService } from '../../../catalogs/service/catalog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  Expense,
  ExpenseFilter,
} from '../../models/expense.model';
import { ExpenseCategory } from '../../../catalogs/service/models/catalog.model';
import { Building } from '../../../buildings/models/building.model';
import { ExpenseCardComponent } from '../../components/expense-card/expense-card.component';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ExpenseCardComponent],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css',
})
export class ExpenseListComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  buildings: Building[] = [];
  categories: ExpenseCategory[] = [];

  viewMode: 'grid' | 'list' = 'grid';
  itemsPerPageOptions = [10, 25, 50, 100, 0]; // 0 = Todos (12 items per page)

  filter: ExpenseFilter = {
    page: 1,
    limit: 25,
  };

  loading = true;
  error: string | null = null;
  totalPages = 1;
  totalExpenses = 0;
  totalAmountAll = 0;  // Monto total de TODOS los gastos (sin paginación)

  startDate = '';
  endDate = '';

  private dateSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private expenseService: ExpenseService,
    private catalogService: CatalogService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();

    this.dateSubject
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.filter.page = 1;
        this.loadExpenses();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== GETTERS PARA PAGINACIÓN ==========

  /**
   * Retorna los expenses de la página actual
   */
  get paginatedExpenses(): Expense[] {
    return this.expenses;
  }

  /**
   * Indica si se debe mostrar la paginación
   */
  get showPagination(): boolean {
    return this.totalPages > 1;
  }

  // ========== LOAD DATA ==========

  loadInitialData(): void {
    this.loadBuildings();
    this.loadCategories();
    this.loadExpenses();
  }

  loadBuildings(): void {
    this.catalogService.getBuildings().subscribe({
      next: (response) => {
        this.buildings = response.data || [];
      },
      error: (error) => {
        console.error('Error loading buildings:', error);
      },
    });
  }

  loadCategories(): void {
    this.catalogService.getExpenseCategories().subscribe({
      next: (response) => {
        this.categories = response.data || [];
        console.log('Categorías de gastos cargadas en lista:', this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  loadExpenses(): void {
    this.loading = true;
    this.error = null;

    const filterWithDates: any = { ...this.filter };

    if (this.startDate) filterWithDates.start_date = this.startDate;
    if (this.endDate) filterWithDates.end_date = this.endDate;

    if (
      !filterWithDates.building_id ||
      filterWithDates.building_id === '' ||
      filterWithDates.building_id === 'undefined'
    ) {
      delete filterWithDates.building_id;
    } else {
      filterWithDates.building_id = Number(filterWithDates.building_id);
    }

    if (
      !filterWithDates.category_id ||
      filterWithDates.category_id === '' ||
      filterWithDates.category_id === 'undefined'
    ) {
      delete filterWithDates.category_id;
    } else {
      filterWithDates.category_id = Number(filterWithDates.category_id);
    }

    this.expenseService.getExpenses(filterWithDates).subscribe({
      next: (response) => {
        this.expenses = (response.data || []).map((e: any) => ({
          ...e,
          expense_id: e.expense_id || e.id,
          amount:
            typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount,
        }));
        this.totalExpenses = response.pagination?.total || this.expenses.length;
        this.totalPages = Math.ceil(
          this.totalExpenses / (this.filter.limit || 25)
        );
        
        // Obtener el monto total sin paginación
        this.loadTotalAmount(filterWithDates);
        
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los gastos';
        this.loading = false;
        console.error('Error loading expenses:', error);
      },
    });
  }

  /**
   * Carga el monto total de TODOS los gastos (sin paginación)
   */
  loadTotalAmount(filter: any): void {
    this.expenseService.getTotalAmount(filter).subscribe({
      next: (response) => {
        this.totalAmountAll = response.data?.total || 0;
      },
      error: (error) => {
        console.error('Error loading total amount:', error);
        // En caso de error, sumar los gastos actuales como fallback
        this.totalAmountAll = this.getPageTotalAmount();
      },
    });
  }

  // ========== EVENT HANDLERS ==========

  onFilterChange(): void {
    this.filter.page = 1;
    this.loadExpenses();
  }

  onDateChange(): void {
    this.dateSubject.next();
  }

  /**
   * Cambio de página - Paginación del backend
   */
  onPageChange(page: number): void {
    this.filter.page = page;
    this.loadExpenses();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Cambio de items por página del backend
   * Si selecciona "Todos" (0), usar 12 items por página en backend
   */
  onItemsPerPageChange(): void {
    this.filter.page = 1;

    if (this.filter.limit === 0) {
      // "Todos" = 12 items por página
      this.filter.limit = 12;
    }
    this.loadExpenses();
  }

  toggleViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onDeleteExpense(expenseId: number): void {
    if (!confirm('¿Está seguro de eliminar este gasto?')) {
      return;
    }

    this.expenseService.deleteExpense(expenseId).subscribe({
      next: () => {
        this.loadExpenses();
      },
      error: (error) => {
        this.notificationService.showError('Error al eliminar el gasto');
        console.error('Error deleting expense:', error);
      },
    });
  }

  onEditExpense(expenseId: number): void {
    // Navigation handled by router
  }

  clearFilters(): void {
    this.filter = {
      page: 1,
      limit: 25,
    };
    this.startDate = '';
    this.endDate = '';
    this.loadExpenses();
  }

  getItemsPerPageLabel(option: number): string {
    return option === 0 ? 'Todos los resultados' : `${option} resultados`;
  }

  /**
   * Retorna el monto total de TODOS los gastos (sin importar paginación)
   */
  getTotalAmount(): number {
    return this.totalAmountAll;
  }

  /**
   * Calcula el monto total de la página actual
   */
  getPageTotalAmount(): number {
    if (!Array.isArray(this.expenses)) return 0;
    return this.expenses.reduce((sum, expense) => {
      const amount =
        typeof expense.amount === 'string'
          ? parseFloat(expense.amount)
          : expense.amount;
      return sum + (amount || 0);
    }, 0);
  }

  getExpenseId(expense: any): number {
    return (expense.expense_id as number) || (expense.id as number);
  }

  shouldShowPageNumber(page: number): boolean {
    const current = this.filter?.page || 1;
    const total = this.totalPages || 1;

    // Siempre mostrar primera y última
    if (page === 1 || page === total) return true;

    // Mostrar páginas cercanas a la actual (±2)
    if (Math.abs(page - current) <= 2) return true;

    return false;
  }

  /**
   * Determina si debe mostrar puntos suspensivos
   */
  shouldShowEllipsis(page: number): boolean {
    const current = this.filter?.page || 1;
    const total = this.totalPages || 1;

    // Mostrar ellipsis después de página 1 si hay gap
    if (page === 1 && current > 4) return true;

    // Mostrar ellipsis antes de última página si hay gap
    if (page === total - 1 && current < total - 3) return true;

    return false;
  }
  // Responsive: Forzar grid en móvil
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (window.innerWidth <= 768) {
      this.viewMode = 'grid';
    }
  }
}
