import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UpdateFeedbackEntityComponent } from './components/update-feedback-entity/update-feedback-entity.component';
import { ExcelSettingsComponent } from './components/excel-settings/excel-settings.component';
import { FieldOptionsManagerComponent } from './components/field-options-manager/field-options-manager.component';
import { InitAppComponent } from './components/init-app/init-app.component';
import { LoginComponent } from './components/login/login';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';
import { WizardLayoutComponent } from './layouts/wizard-layout/wizard-layout';
import { CurrentUserComponent } from './components/current-user/current-user.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SystemConfigComponent } from './components/system-config/system-config.component';
import { SquadTeamGridComponent } from './components/squad-team-grid/squad-team-grid.component';
import { CreateFeedbackEntityComponent } from './components/create-feedback-entity/create-feedback-entity.component';
import { ShowFeedbackEntityComponent } from './components/show-feedback-entity/show-feedback-entity.component';


export const routes: Routes = [

    // Rutas con AuthLayout (sin navbar)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }

    ]
  },

    // Rutas con WizardLayout (solo wizard, sin navbar)
  {
    path: 'init',
    component: WizardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: InitAppComponent }
    ]
  },

  // Rutas con MainLayout (con navbar)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'profile', component: CurrentUserComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'squad-team-grid', component: SquadTeamGridComponent },
      { path: 'create-feedback', component: CreateFeedbackEntityComponent },
      { path: 'show-feedback/:registration', component: ShowFeedbackEntityComponent },
      // { path: 'update-feedback/:id', component: UpdateFeedbackEntityComponent },
      { path: 'excel-settings', component: ExcelSettingsComponent },
      { path: 'field-options', component: FieldOptionsManagerComponent },
      { path: 'settings', component: SystemConfigComponent }
    ]
  },

  { path: '**', redirectTo: '/login' }

];
