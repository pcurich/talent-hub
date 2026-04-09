import { Injectable, Signal } from "@angular/core";
import { HttpStatusCode } from "@angular/common/http";
import { HttpMockEntity } from "@pcurich/client-storage-indexeddb";
import { ICurrentUserRepository } from "../interfaces/current-user.repository.interface";
import { CurrentUser, PersonMatch } from "../model/current-user.model";
import { APP_CONFIG, SERVICE_CODES } from "../constants/general.constants";
import { BaseIndexeddbRepository } from "./base.indexeddb.repository";

@Injectable({
  providedIn: 'root'
})
export class CurrentUserIndexeddbRepository
  extends BaseIndexeddbRepository<CurrentUser>
  implements ICurrentUserRepository {

  protected readonly SERVICE_CODE = SERVICE_CODES.SC_GET_CURRENT_USER;
  protected readonly DEFAULT_VALUE = {} as CurrentUser;

  protected getDefaultValue(): CurrentUser {
    return this.DEFAULT_VALUE;
  }

  override async exists(registration?: string): Promise<boolean> {
    if (registration) {
      await this.ensureDatabase(registration);
    }
    return super.exists();
  }

  async create(currentUser: CurrentUser): Promise<boolean> {
    try {
      const entityToSave = { ...currentUser };

      if (!entityToSave.createdAt) {
        entityToSave.createdAt = new Date();
      }
      entityToSave.updatedAt = new Date();

      await this.ensureDatabase(currentUser.user.registration);

      const newEntity: Partial<HttpMockEntity> = {
        serviceCode: this.SERVICE_CODE,
        method: 'GET',
        url: `/current-user/${currentUser.user.registration}`,
        responseBody: JSON.stringify(entityToSave),
        httpCodeResponseValue: HttpStatusCode.Ok,
        name: APP_CONFIG.APP_MOCK_NAME,
        delayMs: 0,
      };

      const entity = await this.httpMockService!.createMock(newEntity);
      this.entity.set(currentUser);
      console.log('Entity creado en IndexedDB con ID:', entity.id);
      return true;

    } catch (err) {
      console.error('Error al crear CurrentUser:', err);
      return false;
    }
  }

  async findByRegistration(registration: string): Promise<PersonMatch> {
    const currentUser = this.entity();

    if (currentUser.user?.registration === registration) {
      return { person: currentUser.user, role: 'user' };
    }

    if (currentUser.directManager?.registration === registration) {
      return { person: currentUser.directManager, role: 'directManager' };
    }

    for (const squad of currentUser.squads || []) {
      const teamMember = squad.teamMembers?.find(tm => tm.registration === registration);
      if (teamMember) {
        return { person: teamMember, role: 'teamMember', squadName: squad.name };
      }
    }

    return { person: null, role: null };
  }

  async update(currentUser: CurrentUser): Promise<boolean> {
    try {
      await this.ensureDatabase(currentUser.user.registration);

      const entities = await this.httpMockService!.findByServiceCode(this.SERVICE_CODE);

      if (!entities || entities.length === 0) {
        console.error('No se encontró el usuario para actualizar');
        return false;
      }

      const existingEntity = entities[0];
      const entityToSave = { ...currentUser };
      entityToSave.updatedAt = new Date();

      existingEntity.responseBody = JSON.stringify(entityToSave);
      existingEntity.updatedAt = new Date();

      await this.httpMockService!.updateMock(existingEntity);
      this.entity.set(currentUser);
      console.log('Entity actualizado en IndexedDB con ID:', existingEntity.id);
      return true;

    } catch (err) {
      console.error('Error al actualizar CurrentUser:', err);
      return false;
    }
  }
}
