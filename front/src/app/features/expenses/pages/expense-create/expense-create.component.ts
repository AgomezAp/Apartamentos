import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { CatalogService } from '../../../catalogs/service/catalog.service';
import { ExpenseFormData } from '../../models/expense.model';
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
  loading = true;
  error: string | null = null;

  constructor(
    private expenseService: ExpenseService,
    private catalogService: CatalogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  loadBuildings(): void {
    this.catalogService.getBuildings().subscribe({
      next: (response) => {
        this.buildings = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los edificios';
        this.loading = false;
        console.error('Error loading buildings:', error);
      }
    });
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
