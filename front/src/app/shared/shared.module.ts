import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import all shared components
import { AlertComponent } from './components/alert/alert.component';
import { BreadcumbComponent } from './components/breadcumb/breadcumb.component';
import { CardComponent } from './components/card/card.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { TableComponent } from './components/table/table.component';

// Import all shared directives
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { NumberOnlyDirective } from './directives/number-only.directive';
import { TooltipDirective } from './directives/tooltip.directive';

// Import all shared pipes
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

// Export validators
export * from './validators/custom-validators';
export * from './validators/form-validators';

// Array of all shared components
const SHARED_COMPONENTS = [
  AlertComponent,
  BreadcumbComponent,
  CardComponent,
  ConfirmationDialogComponent,
  FooterComponent,
  HeaderComponent,
  LoadingSpinnerComponent,
  PaginationComponent,
  SidebarComponent,
  StatusBadgeComponent,
  TableComponent
];

// Array of all shared directives
const SHARED_DIRECTIVES = [
  ClickOutsideDirective,
  NumberOnlyDirective,
  TooltipDirective
];

// Array of all shared pipes
const SHARED_PIPES = [
  CurrencyFormatPipe,
  DateFormatPipe,
  FilterPipe,
  TruncatePipe
];

@NgModule({
  imports: [
    CommonModule,
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES
  ],
  exports: [
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES
  ]
})
export class SharedModule { }
