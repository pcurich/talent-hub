import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackRepository } from '../../services/feedback.service';
import { FeedbackEntity, FeedbackType, ActionableStatus, ActionResponsible, Seniority, CompanyType, GeneralRating, PerformanceLevel } from '@pcurich/client-storage-indexeddb';

@Component({
  selector: 'app-update-feedback-entity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-feedback-entity.component.html',
  styleUrl: './update-feedback-entity.component.scss'
})
export class UpdateFeedbackEntityComponent implements OnInit {
  private feedbackService = inject(FeedbackRepository);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  entity: FeedbackEntity = new FeedbackEntity();
  entityId: number = 0;

  // Opciones para los dropdowns
  feedbackTypes: FeedbackType[] = ['Positivo', 'Constructivo', 'Negativo'];
  companies: CompanyType[] = ['BCP', 'Proveedor'];
  seniorities: Seniority[] = ['Junior', 'Semi-Senior', 'Senior', 'Lead', 'Architect'];
  generalRatings: GeneralRating[] = ['Excelente', 'Muy Bueno', 'Bueno', 'Regular', 'Necesita Mejorar'];
  performanceLevels: PerformanceLevel[] = ['Supera Expectativas', 'Cumple Expectativas', 'Por Debajo de Expectativas'];
  actionResponsibles: ActionResponsible[] = ['CL', 'FP', 'PO', 'AC', 'OTHER'];
  actionStatuses: ActionableStatus[] = ['Pendiente', 'En Progreso', 'Completado', 'Cancelado'];

  ngOnInit() {
    this.entityId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    if (this.entityId) {
      this.loadEntity();
    }
  }

  loadEntity() {
    const entity = this.feedbackService.getById(this.entityId);
    if (entity) {
      this.entity = entity;
    } else {
      alert('Entidad no encontrada');
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.validateForm()) {
      this.entity.updateTimestamp();
      this.feedbackService.update(this.entity);
      alert('Feedback actualizado exitosamente');
      this.router.navigate(['/']);
    }
  }

  validateForm(): boolean {
    if (!this.entity.teamMember.trim()) {
      alert('El nombre del Team Member es requerido');
      return false;
    }
    if (!this.entity.registration.trim()) {
      alert('El registro es requerido');
      return false;
    }
    return true;
  }

  addActionPlan() {
    this.entity.actionPlan.push({
      actionable: '',
      responsible: 'CL',
      commitmentDate: new Date(),
      status: 'Pendiente',
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
