import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FeedbackEntity } from '@pcurich/client-storage-indexeddb';

import { SearchEntityComponent } from '../components/search-entity/search-entity.component';
import { DataTableEntityComponent } from '../components/data-table-entity/data-table-entity.component';
import { ModalEntityComponent } from '../components/modal-entity/modal-entity.component';

import { FeedbackRepository } from '../repository/feedback.indexeddb.repository';

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
  private feedbackService = inject(FeedbackRepository);
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
      entity.teamMember?.toLowerCase().includes(term) ||
      entity.registration?.toLowerCase().includes(term) ||
      entity.squad?.toLowerCase().includes(term) ||
      entity.productOwner?.toLowerCase().includes(term) ||
      entity.focalPoint?.toLowerCase().includes(term) ||
      entity.company?.toLowerCase().includes(term)
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
