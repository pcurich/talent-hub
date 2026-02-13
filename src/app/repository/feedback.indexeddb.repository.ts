import { Injectable } from '@angular/core';
import { FeedbackEntity, HttpMockEntity } from '@pcurich/client-storage-indexeddb'
import { IFeedbackRepository } from '../interfaces/feedback.repository.interface';
import { BaseIndexeddbRepository } from './base.indexeddb.repository';
import { APP_CONFIG, SERVICE_CODES } from '../constants/general.constants';
import { HttpStatusCode } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FeedbackRepository
  extends BaseIndexeddbRepository<FeedbackEntity[]>
  implements IFeedbackRepository {

  protected readonly SERVICE_CODE = SERVICE_CODES.SC_GET_FEEDBACKS;
  protected override DEFAULT_VALUE: FeedbackEntity[] = [];

  protected override getDefaultValue(): FeedbackEntity[] {
    return [];
  }

  async create(feedBack: FeedbackEntity): Promise<boolean> {
    try {
      // Crear una copia de la entidad sin el id para que IndexedDB lo auto-genere
      const entityToSave = { ...feedBack };

      if (!entityToSave.createdAt) {
        entityToSave.createdAt = new Date();
      }
      entityToSave.updatedAt = new Date();

      // Asegurar que las fechas estén correctamente establecidas
      if (!entityToSave.createdAt) {
        entityToSave.createdAt = new Date();
      }
      entityToSave.updatedAt = new Date();

      // Crear en IndexedDB
      const newEntity: Partial<HttpMockEntity> = {
        serviceCode: this.SERVICE_CODE,
        method: 'GET',
        url: `/feedback/${feedBack.id}`,
        responseBody: JSON.stringify(entityToSave),
        httpCodeResponseValue: HttpStatusCode.Ok,
        name: APP_CONFIG.APP_MOCK_NAME,
        delayMs: 0,
      };

      const entity = await this.httpMockService!.createMock(newEntity);
      this.entity.update(list => [...list, feedBack]);
      console.log('[FeedbackRepository] Feedback creada en IndexedDB con ID:', entity.id);
      return Promise.resolve(true);
    } catch (err) {
      console.error('[FeedbackRepository] Error al crear feedback:', err);
      return Promise.reject(false);
    }
  }

  async update(entity: FeedbackEntity): Promise<boolean> {
    try {
      debugger;
      const entities = await this.httpMockService!.findByServiceCode(this.SERVICE_CODE);

      if (!entities || entities.length === 0) {
        console.warn('[FeedbackRepository] No existe Feedback, creando nueva...');
        return await this.create(entity);
      }

      const existingEntity = entities[0];
      const updatedConfig: FeedbackEntity = {
        ...entity,
        updatedAt: new Date(),
        updateTimestamp: function () { this.updatedAt = new Date(); }
      };

      const updatedEntity = {
        ...existingEntity,
        responseBody: JSON.stringify(updatedConfig)
      } as HttpMockEntity;

      await this.httpMockService!.updateMock(updatedEntity);
      this.entity.update(list => list.map(item => item.id === updatedConfig.id ? updatedConfig : item));
      console.log('[FeedbackRepository] Feedback actualizada correctamente');
      return Promise.resolve(true);

    } catch (error) {
      console.error('[FeedbackRepository] Error al actualizar feedback:', error);
      return Promise.reject(false);
    }

  }

  //   searchEntities(searchTerm: string): FeedbackEntity[] {
  //     if (!searchTerm.trim()) {
  //       return this.entities();
  //     }

  //     const term = searchTerm.toLowerCase();
  //     return this.entities().filter(entity =>
  //       entity.teamMember?.toLowerCase().includes(term) ||
  //       entity.squad?.toLowerCase().includes(term) ||
  //       entity.registration?.toLowerCase().includes(term) ||
  //       entity.productOwner?.toLowerCase().includes(term) ||
  //       entity.focalPoint?.toLowerCase().includes(term)
  // );
  //     }
  //   }
  //   }

  // downloadAllFeedbacks(): void {
  //   this.ensureInitialized().then(() => {
  //     try {
  //       const feedbacks = this.entities();

  //       const jsonData = JSON.stringify(feedbacks, null, 2);
  //       const blob = new Blob([jsonData], { type: 'application/json' });
  //       const url = window.URL.createObjectURL(blob);

  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = `feedbacks-${new Date().toISOString().split('T')[0]}.json`;
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);

  //       window.URL.revokeObjectURL(url);

  //       console.log('Feedbacks descargados exitosamente');
  //     } catch (err) {
  //       console.error('Error al descargar feedbacks:', err);
  //     }
  //   });
  // }


}
