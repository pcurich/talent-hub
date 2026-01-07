import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackEntity, FeedbackType, ActionableStatus, ActionResponsible, Seniority, CompanyType, GeneralRating, PerformanceLevel } from '@pcurich/client-storage-indexeddb';
import { FeedbackRepository } from '../../services/feedback.service';

@Component({
  selector: 'app-create-feedback-entity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-feedback-entity.component.html',
  styleUrl: './create-feedback-entity.component.scss'
})
export class CreateFeedbackEntityComponent {
  private feedbackRepository = inject(FeedbackRepository);
  private router = inject(Router);

  entity: FeedbackEntity = new FeedbackEntity();

  // Opciones para los dropdowns
  feedbackTypes: FeedbackType[] = ['Positivo', 'Constructivo', 'Negativo'];
  companies: CompanyType[] = ['BCP', 'Proveedor'];
  seniorities: Seniority[] = ['Junior', 'Semi-Senior', 'Senior', 'Lead', 'Architect'];
  generalRatings: GeneralRating[] = ['Excelente', 'Muy Bueno', 'Bueno', 'Regular', 'Necesita Mejorar'];
  performanceLevels: PerformanceLevel[] = ['Supera Expectativas', 'Cumple Expectativas', 'Por Debajo de Expectativas'];
  actionResponsibles: ActionResponsible[] = ['CL', 'FP', 'PO', 'AC', 'OTHER'];
  actionStatuses: ActionableStatus[] = ['Pendiente', 'En Progreso', 'Completado', 'Cancelado'];

  onSubmit() {
    debugger
    if (this.validateForm()) {
      this.feedbackRepository.create(this.entity);
      alert('Feedback creado exitosamente');
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
    if (!this.entity.squad.trim()) {
      alert('El squad es requerido');
      return false;
    }
    if (!this.entity.productOwner.trim()) {
      alert('El Product Owner es requerido');
      return false;
    }
    if (!this.entity.focalPoint.trim()) {
      alert('El Focal Point es requerido');
      return false;
    }
    if (!this.entity.feedbackProvider.trim()) {
      alert('El Proveedor de Feedback es requerido');
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
