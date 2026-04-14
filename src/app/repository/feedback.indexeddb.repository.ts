import { Injectable } from '@angular/core';
import { IFeedbackRepository } from '../interfaces/feedback.repository.interface';
import { BaseIndexeddbRepository } from './base.indexeddb.repository';
import { APP_CONFIG, SERVICE_CODES } from '../constants/general.constants';
import { HttpStatusCode } from '@angular/common/http';
import { FeedbackEntity, TeamMemberProfile } from '../model/feedback-entity.model';
import { HttpMockEntity } from '@pcurich/client-storage-indexeddb';

@Injectable({
  providedIn: 'root'
})
export class FeedbackIndexeddbRepository extends BaseIndexeddbRepository<FeedbackEntity[]> implements IFeedbackRepository {

  protected readonly SERVICE_CODE = SERVICE_CODES.SC_GET_FEEDBACKS;
  protected override DEFAULT_VALUE: FeedbackEntity[] = [];

  protected override getDefaultValue(): FeedbackEntity[] {
    return [];
  }

  async create(feedBack: FeedbackEntity): Promise<boolean> {
    try {
      await this.ensureDatabase();

      // Crear una copia de la entidad sin el id para que IndexedDB lo auto-genere
      const entityToSave = { ...feedBack };

      if (!entityToSave.createdAt) {
        entityToSave.createdAt = new Date();
      }
      entityToSave.updatedAt = new Date();

      // Crear en IndexedDB
      const newEntity: Partial<HttpMockEntity> = {
        serviceCode: this.SERVICE_CODE,
        method: 'GET',
        url: `/${this.SERVICE_CODE.toLowerCase()}]/${feedBack.teamMember.registration}  `,
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
      await this.ensureDatabase();

      const entities = await this.httpMockService!.findByServiceCode(this.SERVICE_CODE + '_' + entity.teamMember.registration);

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

  async findByRegistration(registration: string): Promise<TeamMemberProfile | null> {
    await this.ensureDatabase();

    const feedbacks = (this.entity() as FeedbackEntity[])
      .filter(f => f.teamMember?.registration === registration);

    if (feedbacks.length === 0) return null;

    const { teamMember, squad } = feedbacks[0];
    return { ...teamMember, squad, feedbacks };
  }

}
