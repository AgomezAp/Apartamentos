import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { CatalogService } from '../../../catalogs/service/catalog.service';
import { ExpenseFormData, ExpenseCategory } from '../../models/expense.model';
import { Building } from '../../../buildings/models/building.model';
import { ExpenseFormComponent } from '../../components/expense-form/expense-form.component';

@Component({
  selector: 'app-expense-create',
  standalone: true,
  imports: [CommonModule, ExpenseFormComponent],
  templateUrl: './expense-create.component.html',
  styleUrl: './expense-create.component.css'
})
export class ExpenseCreateComponent implements OnInit {
  buildings: Building[] = [];
  categories: ExpenseCategory[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private expenseService: ExpenseService,
    private catalogService: CatalogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loadBuildings();
    this.loadCategories();
  }

  loadBuildings(): void {
    this.catalogService.getBuildings().subscribe({
      next: (response) => {
        this.buildings = response.data || [];
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.error = 'Error al cargar los edificios';
        this.loading = false;
        console.error('Error loading buildings:', error);
      }
    });
  }

  loadCategories(): void {
    this.expenseService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data || [];
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.error = 'Error al cargar las categorías';
        this.loading = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  checkLoadingComplete(): void {
    if (this.buildings.length > 0 && this.categories.length > 0) {
      this.loading = false;
    }
  }

  onSubmit(formData: ExpenseFormData): void {
    this.expenseService.createExpense(formData).subscribe({
      next: (response) => {
        if (response.data?.expense_id) {
          this.router.navigate(['/expenses', response.data.expense_id]);
        }
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/expenses']);
  }
}
