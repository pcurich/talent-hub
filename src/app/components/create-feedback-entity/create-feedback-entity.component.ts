
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackIndexeddbRepository } from '../../repository/feedback.indexeddb.repository';
import { FeedbackEntity, FeedbackType, Seniority, FeedbackProvider, GeneralRating, PerformanceWhat, PerformanceHow, PerformanceAchievements, ActionResponsible, ActionPlanStatus } from '../../model/feedback-entity.model';
import { SystemConfigIndexeddbRepository } from '../../repository/system-config.indexeddb.repository';
import { Squad, TeamMember } from '../../model/current-user.model';

@Component({
  selector: 'app-create-feedback-entity',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],

  templateUrl: './create-feedback-entity.component.html',
  styleUrl: './create-feedback-entity.component.scss'
})
export class CreateFeedbackEntityComponent implements OnInit {
  addActionDisabled = false;
  showSaveActionButton = true;
  private feedbackRepository = inject(FeedbackIndexeddbRepository);
  private router = inject(Router);
  private systemConfig = inject(SystemConfigIndexeddbRepository);

  // Data from navigation state
  squad: Squad = {} as Squad;
  teamMember: TeamMember = {} as TeamMember;

  entity: FeedbackEntity = new FeedbackEntity();
  feedbackForm!: FormGroup;
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


  constructor(private fb: FormBuilder) { }

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

    this.initForm();
  }

  get actionPlan(): FormArray {
    return this.feedbackForm.get('actionPlan') as FormArray;
  }

  private initForm() {
    this.feedbackForm = this.fb.group({
      number: [this.entity.number || '', []],
      squad: [this.entity.squad, Validators.required],
      teamMember: [this.entity.teamMember, Validators.required],
      seniority: [this.entity.seniority, Validators.required],
      poclacDate: [this.entity.poclacDate, Validators.required],
      feedbackProvider: [this.entity.feedbackProvider, Validators.required],
      generalRating: [this.entity.generalRating, Validators.required],
      performance: this.fb.group({
        what: [this.entity.performance?.what, Validators.required],
        how: [this.entity.performance?.how, Validators.required],
        achievements: [this.entity.performance?.achievements, Validators.required],
        details: [this.entity.performance?.details || '', []],
      }),
      feedbackType: [this.entity.feedbackType, Validators.required],
      feedbackDetails: this.fb.group({
        situation: [this.entity.feedbackDetails?.situation || '', Validators.required],
        behavior: [this.entity.feedbackDetails?.behavior || '', Validators.required],
        impact: [this.entity.feedbackDetails?.impact || '', Validators.required],
      }),
      userExpectations: [this.entity.userExpectations || '', Validators.required],
      actionPlan: this.fb.array([])
    });

    // Inicializar actionPlan si ya hay datos
    if (this.entity.actionPlan && this.entity.actionPlan.length > 0) {
      this.entity.actionPlan.forEach(plan => this.addActionPlan(plan));
    }
  }

  addNewActionPlan() {
    // Actualizar this.entity.actionPlan con los valores actuales del FormArray
    this.entity.actionPlan = this.actionPlan.getRawValue();
    console.log('Current Action Plans:', this.entity.actionPlan);
    this.addActionDisabled = false;
    this.showSaveActionButton = false;
  }

  addActionPlan(plan?: any) {
    this.actionPlan.push(this.fb.group({
      actionable: [plan?.actionable || '', Validators.required],
      responsible: [plan?.responsible || null, Validators.required],
      commitmentDate: [plan?.commitmentDate || '', Validators.required],
      status: [plan?.status || null, Validators.required],
      details: [plan?.details || ''],
    }));
    this.addActionDisabled = true;
    this.showSaveActionButton = true;
  }

  removeActionPlan(index: number) {
    this.actionPlan.removeAt(index);
    this.entity.actionPlan = this.actionPlan.getRawValue();
    this.addActionDisabled = false;
  }

  compareFieldOption = (a: any, b: any) => {
    if (!a || !b) return false;
    return a.value === b.value;
  };

  async saveFeedback() {
    if (this.feedbackForm.invalid) {
      return;
    }

    const formValue = this.feedbackForm.getRawValue();

    // Mapear los valores del formulario al modelo
    this.entity.number = formValue.number;
    this.entity.squad = formValue.squad;
    this.entity.teamMember = formValue.teamMember;

    this.entity.seniority = formValue.seniority;
    this.entity.poclacDate = formValue.poclacDate;
    this.entity.feedbackProvider = formValue.feedbackProvider;

    this.entity.generalRating = formValue.generalRating;

    this.entity.performance = formValue.performance;

    this.entity.feedbackType = formValue.feedbackType;
    this.entity.feedbackDetails = formValue.feedbackDetails;

    this.entity.userExpectations = formValue.userExpectations;
    this.entity.actionPlan = formValue.actionPlan;

    try {
      const saved = await this.feedbackRepository.create(this.entity);
      if (saved) {
        console.log('[CreateFeedback] Feedback guardado exitosamente:', this.entity);
        this.router.navigate(['/squad-team-grid']);
      }
    } catch (error) {
      console.error('[CreateFeedback] Error al guardar feedback:', error);
      alert('Error al guardar el feedback. Intente nuevamente.');
    }
  }
}

