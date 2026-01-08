import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Components
import { TenantCardComponent } from './components/tenant-card/tenant-card.component';
import { TenantFormComponent } from './components/tenant-form/tenant-form.component';
import { TenantSearchComponent } from './components/tenant-search/tenant-search.component';
import { TenantContractsComponent } from './components/tenant-contracts/tenant-contracts.component';

// Pages
import { TenantListComponent } from './pages/tenant-list/tenant-list.component';
import { TenantCreateComponent } from './pages/tenant-create/tenant-create.component';
import { TenantDetailComponent } from './pages/tenant-detail/tenant-detail.component';
import { TenantEditComponent } from './pages/tenant-edit/tenant-edit.component';

// Services
import { TenantsService } from './services/tenants.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // Standalone components
    TenantCardComponent,
    TenantFormComponent,
    TenantSearchComponent,
    TenantContractsComponent,
    TenantListComponent,
    TenantCreateComponent,
    TenantDetailComponent,
    TenantEditComponent
  ],
  providers: [TenantsService]
})
export class TenantsModule { }