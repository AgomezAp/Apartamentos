import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BuildingsRoutingModule } from './buildings-routing.module';

// Components
import { BuildingCardComponent } from './components/building-card/building-card.component';
import { BuildingFormComponent } from './components/building-form/building-form.component';
import { BuildingStatsComponent } from './components/building-stats/building-stats.component';

// Pages
import { BuildingListComponent } from './pages/building-list/building-list.component';
import { BuildingCreateComponent } from './pages/building-create/building-create.component';
import { BuildingEditComponent } from './pages/building-edit/building-edit.component';
import { BuildingDetailComponent } from './pages/building-detail/building-detail.component';

/**
 * BuildingsModule
 * 
 * Módulo de edificios que contiene:
 * - Lista de edificios con paginación
 * - Crear edificio
 * - Editar edificio
 * - Ver detalle de edificio
 * - Estadísticas de edificios
 */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BuildingsRoutingModule,
    // Componentes standalone
    BuildingCardComponent,
    BuildingFormComponent,
    BuildingStatsComponent,
    BuildingListComponent,
    BuildingCreateComponent,
    BuildingEditComponent,
    BuildingDetailComponent
  ]
})
export class BuildingsModule { }