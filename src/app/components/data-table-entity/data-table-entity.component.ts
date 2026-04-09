import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackEntity } from '../../model/feedback-entity.model';

@Component({
  selector: 'app-data-table-entity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table-entity.component.html',
  styleUrl: './data-table-entity.component.scss'
})
export class DataTableEntityComponent {
  entities = input.required<FeedbackEntity[]>();

  view = output<FeedbackEntity>();
  edit = output<FeedbackEntity>();
  delete = output<FeedbackEntity>();

  showDeleteModal = false;
  entityToDelete: FeedbackEntity | null = null;

  onView(entity: FeedbackEntity) {
    this.view.emit(entity);
  }

  onEdit(entity: FeedbackEntity) {
    debugger
    console.log('Editing entity:', entity);
    this.edit.emit(entity);
  }

  onDeleteClick(entity: FeedbackEntity) {
    this.entityToDelete = entity;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.entityToDelete) {
      this.delete.emit(this.entityToDelete);
      this.closeDeleteModal();
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.entityToDelete = null;
  }

  formatDate(date: Date | string): string {
    debugger;
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
