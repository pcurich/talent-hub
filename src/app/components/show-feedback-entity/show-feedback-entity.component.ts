import { Component, ElementRef, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackIndexeddbRepository } from '../../repository/feedback.indexeddb.repository';
import { Squad, TeamMember } from '../../model/current-user.model';
import {
  ActionPlanStatus,
  ActionResponsible,
  FeedbackEntity,
  FeedbackProvider,
  FeedbackType,
  GeneralRating,
  PerformanceAchievements,
  PerformanceHow,
  PerformanceWhat,
  Seniority
} from '../../model/feedback-entity.model';
import { FeedbackOptionsUtil } from '../../util/feedback-options.util';

@Component({
  selector: 'app-show-feedback-entity',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './show-feedback-entity.component.html',
  styleUrl: './show-feedback-entity.component.scss'
})
export class ShowFeedbackEntityComponent implements OnInit {
  @ViewChild('uploadExcelInput') uploadExcelInput!: ElementRef<HTMLInputElement>;

  private feedbackService = inject(FeedbackIndexeddbRepository);
  private feedbackOptions = inject(FeedbackOptionsUtil);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  squad: Squad = {} as Squad;
  teamMember: TeamMember = {} as TeamMember;

  selectedFeedback = signal<FeedbackEntity | null>(null);
  feedbackForm: FormGroup = new FormGroup({});
  addActionDisabled = false;
  showSaveActionButton = true;

  // Opciones para los dropdowns desde SystemConfig
  get seniorityOptions(): Seniority[] { return this.feedbackOptions.seniorityOptions; }
  get feedbackProviderOptions(): FeedbackProvider[] { return this.feedbackOptions.feedbackProviderOptions; }
  get generalRatingOptions(): GeneralRating[] { return this.feedbackOptions.generalRatingOptions; }
  get performanceWhatOptions(): PerformanceWhat[] { return this.feedbackOptions.performanceLevelOptions; }
  get performanceHowOptions(): PerformanceHow[] { return this.feedbackOptions.performanceLevelOptions; }
  get performanceAchievementsOptions(): PerformanceAchievements[] { return this.feedbackOptions.performanceLevelOptions; }
  get feedbackTypeOptions(): FeedbackType[] { return this.feedbackOptions.feedbackTypeOptions; }
  get actionResponsibleOptions(): ActionResponsible[] { return this.feedbackOptions.actionResponsibleOptions; }
  get actionStatusOptions(): ActionPlanStatus[] { return this.feedbackOptions.actionStatusOptions; }

  // Lista de feedbacks filtrados por teamMember
  feedbacks = computed<FeedbackEntity[]>(() => {
    const all = this.feedbackService.get()() as FeedbackEntity[];
    if (!this.teamMember?.registration) return all;
    return all.filter(fb => fb.teamMember?.registration === this.teamMember.registration);
  });

  async ngOnInit() {
    const registration = this.route.snapshot.params['registration'];
    const state = history.state;
    if (state?.squad) this.squad = state.squad;
    if (state?.teamMember) this.teamMember = state.teamMember;

    // Cargar feedbacks para este teamMember y actualizar el signal
    await this.feedbackService.findByRegistration(registration ?? this.teamMember.registration);

    // Seleccionar el primer feedback automáticamente
    const list = this.feedbacks();
    if (list.length > 0) {
      this.selectFeedback(list[0]);
    }
  }

  selectFeedback(feedback: FeedbackEntity) {
    this.selectedFeedback.set(feedback);
    this.initForm(feedback);
  }

  private initForm(entity: FeedbackEntity) {
    this.feedbackForm = this.fb.group({
      number: [entity.number || '', []],
      squad: [entity.squad, Validators.required],
      teamMember: [entity.teamMember, Validators.required],
      seniority: [entity.seniority, Validators.required],
      poclacDate: [entity.poclacDate, Validators.required],
      feedbackProvider: [entity.feedbackProvider, Validators.required],
      generalRating: [entity.generalRating, Validators.required],
      performance: this.fb.group({
        what: [entity.performance?.what, Validators.required],
        how: [entity.performance?.how, Validators.required],
        achievements: [entity.performance?.achievements, Validators.required],
        details: [entity.performance?.details || '', []],
      }),
      feedbackType: [entity.feedbackType, Validators.required],
      feedbackDetails: this.fb.group({
        situation: [entity.feedbackDetails?.situation || '', Validators.required],
        behavior: [entity.feedbackDetails?.behavior || '', Validators.required],
        impact: [entity.feedbackDetails?.impact || '', Validators.required],
      }),
      userExpectations: [entity.userExpectations || '', Validators.required],
      actionPlan: this.fb.array([])
    });

    if (entity.actionPlan && entity.actionPlan.length > 0) {
      entity.actionPlan.forEach(plan => this.addActionPlan(plan));
    }
  }

  async onSubmit() {
    debugger;
    if (this.feedbackForm.invalid) return;

    const formValue = this.feedbackForm.getRawValue();
    const entity = this.selectedFeedback();
    if (!entity) return;

    entity.number = formValue.number;
    entity.squad = formValue.squad;
    entity.teamMember = formValue.teamMember;
    entity.seniority = formValue.seniority;
    entity.poclacDate = formValue.poclacDate;
    entity.feedbackProvider = formValue.feedbackProvider;
    entity.generalRating = formValue.generalRating;
    entity.performance = formValue.performance;
    entity.feedbackType = formValue.feedbackType;
    entity.feedbackDetails = formValue.feedbackDetails;
    entity.userExpectations = formValue.userExpectations;
    entity.actionPlan = formValue.actionPlan;

    try {
      const saved = await this.feedbackService.update(entity);
      if (saved) {
        console.log('[ShowFeedback] Feedback actualizado exitosamente:', entity);
        alert('Feedback actualizado correctamente.');
      }
    } catch (error) {
      console.error('[ShowFeedback] Error al actualizar feedback:', error);
      alert('Error al actualizar el feedback. Intente nuevamente.');
    }
  }

  get actionPlan(): FormArray {
    return this.feedbackForm.get('actionPlan') as FormArray;
  }

  addNewActionPlan() {
    const entity = this.selectedFeedback();
    if (entity) {
      entity.actionPlan = this.actionPlan.getRawValue();
    }
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
    const entity = this.selectedFeedback();
    if (entity) {
      entity.actionPlan = this.actionPlan.getRawValue();
    }
    this.addActionDisabled = false;
  }

  goBack() {
    this.router.navigate(['/squad-team-grid']);
  }

  compareFieldOption = (a: any, b: any) => {
    if (!a || !b) return false;
    return a.value === b.value;
  };
}
