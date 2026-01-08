import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ExpenseService } from './services/expense.service';

// Pages
import { ExpenseListComponent } from './pages/expense-list/expense-list.component';
import { ExpenseCreateComponent } from './pages/expense-create/expense-create.component';
import { ExpenseDetailComponent } from './pages/expense-detail/expense-detail.component';
import { ExpenseAnalyticsComponent } from './pages/expense-analytics/expense-analytics.component';

// Components
import { ExpenseCardComponent } from './components/expense-card/expense-card.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ExpenseSummaryComponent } from './components/expense-summary/expense-summary.component';
import { ExpenseChartComponent } from './components/expense-chart/expense-chart.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // Standalone components
    ExpenseListComponent,
    ExpenseCreateComponent,
    ExpenseDetailComponent,
    ExpenseAnalyticsComponent,
    ExpenseCardComponent,
    ExpenseFormComponent,
    ExpenseSummaryComponent,
    ExpenseChartComponent
  ],
  providers: [
    ExpenseService
  ]
})
export class ExpensesModule { }