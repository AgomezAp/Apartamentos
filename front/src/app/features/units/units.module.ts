import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Components
import { UnitCardComponent } from './components/unit-card/unit-card.component';
import { UnitFilterComponent } from './components/unit-filter/unit-filter.component';
import { UnitFormComponent } from './components/unit-form/unit-form.component';
import { UnitStatusIndicatorComponent } from './components/unit-status-indicator/unit-status-indicator.component';

// Pages
import { UnitListComponent } from './pages/unit-list/unit-list.component';
import { UnitCreateComponent } from './pages/unit-create/unit-create.component';
import { UnitDetailComponent } from './pages/unit-detail/unit-detail.component';
import { UnitEditComponent } from './pages/unit-edit/unit-edit.component';
import { VacantUnitsComponent } from './pages/vacant-units/vacant-units.component';

// Services
import { UnitService } from './services/unit.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // Standalone Components
    UnitCardComponent,
    UnitFilterComponent,
    UnitFormComponent,
    UnitStatusIndicatorComponent,
    UnitListComponent,
    UnitCreateComponent,
    UnitDetailComponent,
    UnitEditComponent,
    VacantUnitsComponent
  ],
  providers: [
    UnitService
  ]
})
export class UnitsModule { }