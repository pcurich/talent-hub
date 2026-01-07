import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackEntity } from '@pcurich/client-storage-indexeddb';

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

  getActionPlanStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Completado': 'status-completed',
      'En Progreso': 'status-progress',
      'Pendiente': 'status-pending',
      'Cancelado': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  }
}
