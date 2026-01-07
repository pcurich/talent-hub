import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CreateFeedbackEntityComponent } from './components/create-feedback-entity/create-feedback-entity.component';
import { UpdateFeedbackEntityComponent } from './components/update-feedback-entity/update-feedback-entity.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create-feedback', component: CreateFeedbackEntityComponent },
  { path: 'update-feedback/:id', component: UpdateFeedbackEntityComponent },
  { path: '**', redirectTo: '' }
];
