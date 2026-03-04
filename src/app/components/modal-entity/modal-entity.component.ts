import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackEntity } from '../../model/feedback-entity.model';

@Component({
  selector: 'app-modal-entity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-entity.component.html',
  styleUrl: './modal-entity.component.scss'
})
export class ModalEntityComponent {
  entity = input.required<FeedbackEntity | null>();
  isOpen = input.required<boolean>();

  close = output<void>();

  onClose() {
    this.close.emit();
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-PE');
  }

  getActionPlanStatusClass(status: any): string {
    if (!status?.value) return 'status-default';
    const statusMap: { [key: string]: string } = {
      'completed': 'status-completed',
      'in_progress': 'status-progress',
      'pending': 'status-pending',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status.value] || 'status-default';
  }
}
