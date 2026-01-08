import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsService } from './services/settings.service';

// Pages
import { SettingsHomeComponent } from './pages/settings-home/settings-home.component';

// Components
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';
import { EmailSettingsComponent } from './components/email-settings/email-settings.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    // Standalone components
    SettingsHomeComponent,
    GeneralSettingsComponent,
    EmailSettingsComponent,
    NotificationSettingsComponent,
    UserProfileComponent
  ],
  providers: [SettingsService]
})
export class SettingsModule { }
