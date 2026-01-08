import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PaymentsRoutingModule } from './payments-routing.module';

// Services
import { PaymentService } from './services/payment.service';

// Components
import { OverduePaymentsComponent } from './components/overdue-payments/overdue-payments.component';
import { PaymentCalendarComponent } from './components/payment-calendar/payment-calendar.component';
import { PaymentCardComponent } from './components/payment-card/payment-card.component';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';

// Pages
import { PaymentListComponent } from './pages/payment-list/payment-list.component';
import { PaymentCreateComponent } from './pages/payment-create/payment-create.component';
import { PaymentDetailComponent } from './pages/payment-detail/payment-detail.component';
import { PaymentRegisterComponent } from './pages/payment-register/payment-register.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PaymentsRoutingModule,
    // Components
    OverduePaymentsComponent,
    PaymentCalendarComponent,
    PaymentCardComponent,
    PaymentFormComponent,
    PaymentHistoryComponent,
    TransactionFormComponent,
    // Pages
    PaymentListComponent,
    PaymentCreateComponent,
    PaymentDetailComponent,
    PaymentRegisterComponent
  ],
  exports: [
    // Export components that might be used in other modules
    OverduePaymentsComponent,
    PaymentCalendarComponent,
    PaymentCardComponent,
    PaymentHistoryComponent
  ],
  providers: [
    PaymentService
  ]
})
export class PaymentsModule { }
