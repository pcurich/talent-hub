import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackRepository } from '../../repository/feedback.indexeddb.repository';
import { FeedbackEntity, FeedbackType, Seniority, FeedbackProvider, GeneralRating, PerformanceWhat, PerformanceHow, PerformanceAchievements, ActionResponsible, ActionPlanStatus } from '../../model/feedback-entity.model';
import { SystemConfigIndexeddbRepository } from '../../repository/system-config.indexeddb.repository';
import { Squad, TeamMember } from '../../model/current-user.model';
import { FieldOption } from '../../model/system-config-entity.model';

@Component({
  selector: 'app-create-feedback-entity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-feedback-entity.component.html',
  styleUrl: './create-feedback-entity.component.scss'
})
export class CreateFeedbackEntityComponent implements OnInit {
  private feedbackRepository = inject(FeedbackRepository);
  private router = inject(Router);
  private systemConfig = inject(SystemConfigIndexeddbRepository);

  // Data from navigation state
  squad: Squad = {} as Squad;
  teamMember: TeamMember = {} as TeamMember;

  entity: FeedbackEntity = new FeedbackEntity();

  // Opciones para los dropdowns
  seniorityOptions: Seniority[] = this.systemConfig.getField('team_members', 'team_members_seniority')?.options || [];
  feedbackProviderOptions: FeedbackProvider[] = this.systemConfig.getField('feedback', 'feedback_provider')?.options || [];
  generalRatingOptions: GeneralRating[] = this.systemConfig.getField('feedback', 'feedback_general_rating')?.options || [];
  performanceWhatOptions: PerformanceWhat[] = this.systemConfig.getField('feedback', 'feedback_performance_level')?.options || [];
  performanceHowOptions: PerformanceHow[] = this.systemConfig.getField('feedback', 'feedback_performance_level')?.options || [];
  performanceAchievementsOptions: PerformanceAchievements[] = this.systemConfig.getField('feedback', 'feedback_performance_level')?.options || [];
  feedbackTypeOptions: FeedbackType[] = this.systemConfig.getField('feedback', 'feedback_default_type')?.options || [];
  actionResponsibleOptions: ActionResponsible[] = this.systemConfig.getField('feedback', 'feedback_action_responsible')?.options || [];
  actionStatusOptions: ActionPlanStatus[] = this.systemConfig.getField('feedback', 'feedback_action_status')?.options || [];

  ngOnInit(): void {
    // Get data from navigation state using history.state
    const state = history.state;

    if (state?.squad) {
      this.squad = state.squad;
    }
    if (state?.teamMember) {
      this.teamMember = state.teamMember;
    }

    // Validate required data
    if (!this.squad?.name || !this.teamMember?.name) {
      alert('Error: Se requiere información del squad y team member');
      this.router.navigate(['/squad-team-grid']);
      return;
    }

    this.entity.squad = this.squad;
    this.entity.teamMember = this.teamMember;
    this.entity.poclacDate = new Date();
  }

  compareFieldOption(o1: FieldOption, o2: FieldOption): boolean {
    return o1 && o2 ? o1.value === o2.value : o1 === o2;
  }

  onSubmit() {
    debugger
    if (this.validateForm()) {
      // this.feedbackRepository.create(this.entity);
      alert('Feedback creado exitosamente');
      this.router.navigate(['/']);
    }
  }

  validateForm(): boolean {
    // if (!this.entity.teamMember.trim()) {
    //   alert('El nombre del Team Member es requerido');
    //   return false;
    // }
    // if (!this.entity.registration.trim()) {
    //   alert('El registro es requerido');
    //   return false;
    // }
    // if (!this.entity.squad.trim()) {
    //   alert('El squad es requerido');
    //   return false;
    // }
    // if (!this.entity.productOwner.trim()) {
    //   alert('El Product Owner es requerido');
    //   return false;
    // }
    // if (!this.entity.focalPoint.trim()) {
    //   alert('El Focal Point es requerido');
    //   return false;
    // }
    // if (!this.entity.feedbackProvider.trim()) {
    //   alert('El Proveedor de Feedback es requerido');
    //   return false;
    // }
    return true;
  }

  addActionPlan() {
    this.entity.actionPlan.push({
      actionable: '',
      responsible: this.actionResponsibleOptions[0] || { value: '', label: '---', description: '', color: '', order: 0 },
      commitmentDate: new Date(),
      status: this.actionStatusOptions[0] || { value: '', label: '---', description: '', color: '', order: 0 },
      details: ''
    });
  }

  removeActionPlan(index: number) {
    this.entity.actionPlan.splice(index, 1);
  }

  cancel() {
    if (confirm('¿Está seguro de cancelar? Se perderán los cambios no guardados.')) {
      this.router.navigate(['/']);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
