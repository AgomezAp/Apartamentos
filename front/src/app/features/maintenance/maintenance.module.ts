import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MaintenanceRoutingModule } from './maintenance-routing.module';
import { MaintenanceService } from './services/maintenance.service';

// Components
import { MaintenanceCardComponent } from './components/maintenance-card/maintenance-card.component';
import { MaintenanceFormComponent } from './components/maintenance-form/maintenance-form.component';
import { MaintenanceTimelineComponent } from './components/maintenance-timeline/maintenance-timeline.component';
import { PriorityBadgeComponent } from './components/priority-badge/priority-badge.component';

// Pages
import { MaintenanceListComponent } from './pages/maintenance-list/maintenance-list.component';
import { MaintenanceCreateComponent } from './pages/maintenance-create/maintenance-create.component';
import { MaintenanceDetailComponent } from './pages/maintenance-detail/maintenance-detail.component';
import { MaintenancePendingComponent } from './pages/maintenance-pending/maintenance-pending.component';
import { MaintenanceUrgentComponent } from './pages/maintenance-urgent/maintenance-urgent.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaintenanceRoutingModule,
    // Standalone components
    MaintenanceCardComponent,
    MaintenanceFormComponent,
    MaintenanceTimelineComponent,
    PriorityBadgeComponent,
    MaintenanceListComponent,
    MaintenanceCreateComponent,
    MaintenanceDetailComponent,
    MaintenancePendingComponent,
    MaintenanceUrgentComponent
  ],
  providers: [
    MaintenanceService
  ]
})
export class MaintenanceModule { }
