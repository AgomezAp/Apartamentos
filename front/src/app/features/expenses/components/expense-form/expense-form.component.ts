import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Expense, ExpenseFormData, PaymentMethods } from '../../models/expense.model';
import { Building } from '../../../buildings/models/building.model';
import { BuildingService } from '../../../buildings/services/building.service';
import { ExpenseCategoryService, ExpenseCategory } from '../../../expense-categories/services/expense-category.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.css'
})
export class ExpenseFormComponent implements OnInit {
  @Input() expense?: Expense;
  @Input() buildings: Building[] = [];
  @Output() submit = new EventEmitter<ExpenseFormData>();
  @Output() cancel = new EventEmitter<void>();

  expenseForm!: FormGroup;
  paymentMethods = PaymentMethods;
  loading = false;
  categories: ExpenseCategory[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseCategoryService: ExpenseCategoryService,
    private buildingService: BuildingService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadBuildings();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.expenseForm = this.fb.group({
      building_id: [this.expense?.building_id || '', Validators.required],
      category_id: [this.expense?.category_id || '', Validators.required],
      description: [this.expense?.description || '', [Validators.required, Validators.minLength(3)]],
      amount: [this.expense?.amount || '', [Validators.required, Validators.min(0.01)]],
      expense_date: [this.expense?.expense_date?.split('T')[0] || today, Validators.required],
      payment_method: [this.expense?.payment_method || 'cash', Validators.required],
      reference_number: [this.expense?.reference_number || ''],
      notes: [this.expense?.notes || '']
    });
  }

  loadCategories(): void {
    this.expenseCategoryService.getAll().subscribe({
      next: (response) => {
        console.log('Respuesta categorías:', response);
        this.categories = response.data || [];
        console.log('Categorías cargadas:', this.categories);
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
      }
    });
  }

  loadBuildings(): void {
    if (this.buildings.length === 0) {
      this.buildingService.getBuildings().subscribe({
        next: (response) => {
          this.buildings = response.data || [];
          console.log('Edificios cargados:', this.buildings);
        },
        error: (error) => {
          console.error('Error cargando edificios:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.loading = true;
      this.submit.emit(this.expenseForm.value);
    } else {
      this.markFormGroupTouched(this.expenseForm);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.expenseForm.get(fieldName);
    if (control?.hasError('required')) return 'Este campo es requerido';
    if (control?.hasError('min')) return 'El valor mínimo es 0.01';
    if (control?.hasError('minlength')) return 'Mínimo 3 caracteres';
    return '';
  }
}
