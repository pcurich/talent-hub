import { Injectable, Signal, signal } from '@angular/core';
import { createIndexedDbServices, FeedbackEntity, FeedbackService } from '@pcurich/client-storage-indexeddb'
import { FEEDBACK_DB_CONFIG } from '@pcurich/client-storage-indexeddb'
import { IFeedbackRepository } from '../interfaces/feedback.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class FeedbackRepository implements IFeedbackRepository {
  private feedbackService!: FeedbackService;
  private entities = signal<FeedbackEntity[]>([]);
  private selectedEntity = signal<FeedbackEntity | undefined>(undefined);
  private initPromise: Promise<void>;
  private isInitialized = false;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize() {
    try {
      await this.initService();
      this.isInitialized = true;
      await this.refreshEntities();
    } catch (error) {
      console.error('Error inicializando FeedbackRepository:', error);
    }
  }

  private async initService() {
    const cfg = FEEDBACK_DB_CONFIG;
    const dataTableName = cfg.stores[0].name;
    const keyPath = cfg.stores[0].keyPath;
    const { dbContext } = await createIndexedDbServices(cfg);
    this.feedbackService = new FeedbackService(dbContext, dataTableName, keyPath);
    console.log('FeedbackService inicializado correctamente');
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initPromise;
    }
  }

  // Método para refrescar el caché desde IndexedDB
  private async refreshEntities() {
    try {
      // debugger;
      const feedbacks = await this.feedbackService.getAllFeedbacks();
      this.entities.set(feedbacks || []);
      console.log(`${feedbacks?.length || 0} feedbacks cargados desde IndexedDB`);
    } catch (error) {
      console.error('Error al refrescar entidades:', error);
      this.entities.set([]);
    }
  }

  getEntities(): Signal<FeedbackEntity[]> {
    return this.entities.asReadonly();
  }

  getAll(): FeedbackEntity[] {
    debugger;
    return this.entities();
  }

  getById(id: number): FeedbackEntity | undefined {
    return this.entities().find(entity => entity.id === id);
  }

  getSelectedEntity(): Signal<FeedbackEntity | undefined> {
    return this.selectedEntity.asReadonly();
  }

  setSelectedEntity(entity: FeedbackEntity | undefined): void {
    this.selectedEntity.set(entity);
  }

  create(entity: FeedbackEntity): FeedbackEntity {
    this.ensureInitialized().then(async () => {
      try {
        // Crear una copia de la entidad sin el id para que IndexedDB lo auto-genere
        const entityToSave = { ...entity };

        // Eliminar el id para que autoIncrement funcione
        delete (entityToSave as any).id;

        // Asegurar que las fechas estén correctamente establecidas
        if (!entityToSave.createdAt) {
          entityToSave.createdAt = new Date();
        }
        entityToSave.updatedAt = new Date();

        // Crear en IndexedDB
        const id = await this.feedbackService.createFeedback(entityToSave);

        // Recargar desde IndexedDB para tener el estado real
        await this.refreshEntities();

        console.log('Feedback creado en IndexedDB con ID:', id);
      } catch (err) {
        console.error('Error al crear feedback:', err);
      }
    });

    return entity;
  }

  update(entity: FeedbackEntity): void {
    this.ensureInitialized().then(async () => {
      try {
        entity.updateTimestamp();

        // Actualizar en IndexedDB
        await this.feedbackService.updateFeedback(entity);

        // Recargar desde IndexedDB para tener el estado real
        await this.refreshEntities();

        console.log('Feedback actualizado en IndexedDB:', entity.id);
      } catch (err) {
        console.error('Error al actualizar feedback:', err);
      }
    });
  }

  delete(id: number): void {
    this.ensureInitialized().then(async () => {
      try {
        // Eliminar de IndexedDB
        await this.feedbackService.deleteFeedback(id.toString());

        // Recargar desde IndexedDB para reflejar la eliminación
        await this.refreshEntities();

        console.log('Feedback eliminado de IndexedDB:', id);
      } catch (err) {
        console.error('Error al eliminar feedback:', err);
      }
    });
  }

  searchEntities(searchTerm: string): FeedbackEntity[] {
    if (!searchTerm.trim()) {
      return this.entities();
    }

    const term = searchTerm.toLowerCase();
    return this.entities().filter(entity =>
      entity.teamMember?.toLowerCase().includes(term) ||
      entity.squad?.toLowerCase().includes(term) ||
      entity.registration?.toLowerCase().includes(term) ||
      entity.productOwner?.toLowerCase().includes(term) ||
      entity.focalPoint?.toLowerCase().includes(term)
    );
  }

  downloadAllFeedbacks(): void {
    this.ensureInitialized().then(() => {
      try {
        const feedbacks = this.entities();

        const jsonData = JSON.stringify(feedbacks, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `feedbacks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        console.log('Feedbacks descargados exitosamente');
      } catch (err) {
        console.error('Error al descargar feedbacks:', err);
      }
    });
  }

  // Método público para refrescar manualmente si es necesario
  async refresh(): Promise<void> {
    await this.ensureInitialized();
    await this.refreshEntities();
  }
}
