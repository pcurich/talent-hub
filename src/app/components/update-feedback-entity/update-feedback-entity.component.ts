import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackIndexeddbRepository } from '../../repository/feedback.indexeddb.repository';
import { ActionPlan, ActionPlanStatus, ActionResponsible, FeedbackEntity, FeedbackType, GeneralRating, PerformanceAchievements, PerformanceHow, PerformanceWhat, Seniority, FeedbackProvider } from '../../model/feedback-entity.model';
import { FeedbackOptionsUtil } from '../../util/feedback-options.util';

@Component({
  selector: 'app-update-feedback-entity',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './update-feedback-entity.component.html',
  styleUrl: './update-feedback-entity.component.scss'
})
export class UpdateFeedbackEntityComponent implements OnInit {
  private feedbackService = inject(FeedbackIndexeddbRepository);
  private systemConfig = inject(FeedbackOptionsUtil);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  entity: FeedbackEntity = new FeedbackEntity();
  entityId: number = 0;
  feedbackForm!: FormGroup;
  addActionDisabled = false;
  showSaveActionButton = true;

  // Opciones para los dropdowns desde SystemConfig
  get seniorityOptions(): Seniority[] { return this.systemConfig.seniorityOptions; }
  get feedbackProviderOptions(): FeedbackProvider[] { return this.systemConfig.feedbackProviderOptions; }
  get generalRatingOptions(): GeneralRating[] { return this.systemConfig.generalRatingOptions; }
  get performanceWhatOptions(): PerformanceWhat[] { return this.systemConfig.performanceLevelOptions; }
  get performanceHowOptions(): PerformanceHow[] { return this.systemConfig.performanceLevelOptions; }
  get performanceAchievementsOptions(): PerformanceAchievements[] { return this.systemConfig.performanceLevelOptions; }
  get feedbackTypeOptions(): FeedbackType[] { return this.systemConfig.feedbackTypeOptions; }
  get actionResponsibleOptions(): ActionResponsible[] { return this.systemConfig.actionResponsibleOptions; }
  get actionStatusOptions(): ActionPlanStatus[] { return this.systemConfig.actionStatusOptions; }

  ngOnInit() {
    this.entityId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    if (this.entityId) {
      this.loadEntity();
    }
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

  loadEntity() {
    // TODO: cargar entidad por ID desde el repositorio
  }

  async onSubmit() {
    if (this.feedbackForm.invalid) {
      return;
    }

    const formValue = this.feedbackForm.getRawValue();

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
      const saved = await this.feedbackService.update(this.entity);
      if (saved) {
        console.log('[UpdateFeedback] Feedback actualizado exitosamente:', this.entity);
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('[UpdateFeedback] Error al actualizar feedback:', error);
      alert('Error al actualizar el feedback. Intente nuevamente.');
    }
  }

  addNewActionPlan() {
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

  cancel() {
    if (confirm('¿Está seguro de cancelar? Se perderán los cambios no guardados.')) {
      this.router.navigate(['/']);
    }
  }

  compareFieldOption = (a: any, b: any) => {
    if (!a || !b) return false;
    return a.value === b.value;
  };
}
