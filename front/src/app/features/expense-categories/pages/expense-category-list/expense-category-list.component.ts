import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseCategoryService, ExpenseCategory } from '../../services/expense-category.service';

@Component({
  selector: 'app-expense-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './expense-category-list.component.html',
  styleUrls: ['./expense-category-list.component.css']
})
export class ExpenseCategoryListComponent implements OnInit {
  categories: ExpenseCategory[] = [];
  form!: FormGroup;
  showForm = false;
  editingId: number | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private categoryService: ExpenseCategoryService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      is_active: [true]
    });
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (response: any) => {
        this.categories = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar las categorías';
        console.error(error);
        this.loading = false;
      }
    });
  }

  openForm(category?: ExpenseCategory): void {
    this.showForm = true;
    this.error = null;
    this.successMessage = null;
    if (category) {
      this.editingId = category.id || null;
      this.form.patchValue(category);
    } else {
      this.editingId = null;
      this.form.reset({ is_active: true });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset();
    this.error = null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    const formData = this.form.value;

    if (this.editingId) {
      this.categoryService.update(this.editingId, formData).subscribe({
        next: () => {
          this.successMessage = 'Categoría actualizada exitosamente';
          this.loadCategories();
          this.closeForm();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.error?.error || 'Error al actualizar';
          this.loading = false;
        }
      });
    } else {
      this.categoryService.create(formData).subscribe({
        next: () => {
          this.successMessage = 'Categoría creada exitosamente';
          this.loadCategories();
          this.closeForm();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.error?.error || 'Error al crear';
          this.loading = false;
        }
      });
    }
  }

  deleteCategory(id: number | undefined): void {
    if (!id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return;
    }

    this.loading = true;
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Categoría eliminada exitosamente';
        this.loadCategories();
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.error?.error || 'Error al eliminar';
        this.loading = false;
      }
    });
  }
}
