import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FeedbackEntity } from '../model/feedback-entity.model';

import { SearchEntityComponent } from '../components/search-entity/search-entity.component';
import { DataTableEntityComponent } from '../components/data-table-entity/data-table-entity.component';
import { ModalEntityComponent } from '../components/modal-entity/modal-entity.component';

import { FeedbackIndexeddbRepository } from '../repository/feedback.indexeddb.repository';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SearchEntityComponent,
    DataTableEntityComponent,
    ModalEntityComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private feedbackService = inject(FeedbackIndexeddbRepository);
  private router = inject(Router);

  // Signals
  private searchTerm = signal<string>('');

  // Datos - se actualizan automáticamente cuando entities cambie en el servicio
  allEntities = this.feedbackService.get();

  filteredEntities = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const entities = this.allEntities();

    if (!term) {
      return entities;
    }

    return entities.filter(entity =>
      entity.teamMember?.name?.toLowerCase().includes(term) ||
      entity.teamMember?.registration?.toLowerCase().includes(term) ||
      entity.squad?.name?.toLowerCase().includes(term) ||
      entity.squad?.productOwner?.name?.toLowerCase().includes(term) ||
      entity.feedbackProvider?.label?.toLowerCase().includes(term) ||
      entity.seniority?.label?.toLowerCase().includes(term) ||
      entity.feedbackType?.label?.toLowerCase().includes(term) ||
      entity.generalRating?.label?.toLowerCase().includes(term)
    );
  });

  // Modal
  selectedEntity: FeedbackEntity | null = null;
  isModalOpen = false;

  onSearch(searchTerm: string) {
    this.searchTerm.set(searchTerm);
  }

  onView(entity: FeedbackEntity) {
    this.selectedEntity = entity;
    this.isModalOpen = true;
  }

  onEdit(entity: FeedbackEntity) {
    this.router.navigate(['/update-feedback', entity.id]);
  }

  onDelete(entity: FeedbackEntity) {
    // this.feedbackService.delete(entity.id);
  }

  onCloseModal() {
    this.isModalOpen = false;
    this.selectedEntity = null;
  }
}
