import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnitTypeService, UnitType } from '../../services/unit-type.service';

@Component({
  selector: 'app-unit-type-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './unit-type-list.component.html',
  styleUrls: ['./unit-type-list.component.css']
})
export class UnitTypeListComponent implements OnInit {
  unitTypes: UnitType[] = [];
  form!: FormGroup;
  showForm = false;
  editingId: number | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private unitTypeService: UnitTypeService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadUnitTypes();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      is_active: [true]
    });
  }

  loadUnitTypes(): void {
    this.loading = true;
    this.unitTypeService.getAll().subscribe({
      next: (response: any) => {
        this.unitTypes = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar los tipos de unidades';
        console.error(error);
        this.loading = false;
      }
    });
  }

  openForm(unitType?: UnitType): void {
    this.showForm = true;
    this.error = null;
    this.successMessage = null;
    if (unitType) {
      this.editingId = unitType.id || null;
      this.form.patchValue(unitType);
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
      this.unitTypeService.update(this.editingId, formData).subscribe({
        next: () => {
          this.successMessage = 'Tipo de unidad actualizado exitosamente';
          this.loadUnitTypes();
          this.closeForm();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.error?.error || 'Error al actualizar';
          this.loading = false;
        }
      });
    } else {
      this.unitTypeService.create(formData).subscribe({
        next: () => {
          this.successMessage = 'Tipo de unidad creado exitosamente';
          this.loadUnitTypes();
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

  deleteUnitType(id: number | undefined): void {
    if (!id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este tipo de unidad?')) {
      return;
    }

    this.loading = true;
    this.unitTypeService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Tipo de unidad eliminado exitosamente';
        this.loadUnitTypes();
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.error?.error || 'Error al eliminar';
        this.loading = false;
      }
    });
  }
}
