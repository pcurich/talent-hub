import { Injectable, Signal } from "@angular/core";
import { HttpStatusCode } from "@angular/common/http";
import { HttpMockEntity } from "@pcurich/client-storage-indexeddb";
import { ISystemConfigRepository } from "../interfaces/system-config.repository.interface";
import {
  ConfigField,
  ConfigGroup,
  SystemConfig,
  createDefaultSystemConfig
} from "../model/system-config.model";
import { APP_CONFIG, SERVICE_CODES } from "../constants/general.constants";
import { BaseIndexeddbRepository } from "./base.indexeddb.repository";

@Injectable({
  providedIn: 'root'
})
export class SystemConfigIndexeddbRepository
  extends BaseIndexeddbRepository<SystemConfig>
  implements ISystemConfigRepository {

  protected readonly SERVICE_CODE = SERVICE_CODES.SC_GET_SYSTEM_CONFIG;
  protected readonly DEFAULT_VALUE: SystemConfig = createDefaultSystemConfig();

  protected getDefaultValue(): SystemConfig {
    return createDefaultSystemConfig();
  }

  async exists(): Promise<boolean> {
    try {
      const entities = await this.httpMockService!.findByServiceCode(this.SERVICE_CODE);

      if (!entities || entities.length === 0) {
        return false;
      }

      const configSignal = this.toSignal(entities, 'GET');
      return !!configSignal()?.id;
    } catch (error) {
      console.error('[SystemConfigRepository] Error en exists():', error);
      return false;
    }
  }

  async create(config: SystemConfig): Promise<boolean> {
    try {
      const entityToSave = { ...config };

      if (!entityToSave.createdAt) {
        entityToSave.createdAt = new Date();
      }
      entityToSave.updatedAt = new Date();

      const newEntity: Partial<HttpMockEntity> = {
        serviceCode: this.SERVICE_CODE,
        method: 'GET',
        url: `/system-config/${config.id}`,
        responseBody: JSON.stringify(entityToSave),
        httpCodeResponseValue: HttpStatusCode.Ok,
        name: APP_CONFIG.APP_MOCK_NAME,
        delayMs: 0,
      };

      const entity = await this.httpMockService!.createMock(newEntity);
      this.entity.set(config);
      console.log('[SystemConfigRepository] Config creada en IndexedDB con ID:', entity.id);
      return true;

    } catch (err) {
      console.error('[SystemConfigRepository] Error al crear config:', err);
      return false;
    }
  }

  async update(config: SystemConfig): Promise<boolean> {
    try {
      debugger;
      const entities = await this.httpMockService!.findByServiceCode(this.SERVICE_CODE);

      if (!entities || entities.length === 0) {
        console.warn('[SystemConfigRepository] No existe config, creando nueva...');
        return await this.create(config);
      }

      const existingEntity = entities[0];
      const updatedConfig: SystemConfig = {
        ...config,
        updatedAt: new Date(),
        updateTimestamp: function () { this.updatedAt = new Date(); }
      };

      const updatedEntity = {
        ...existingEntity,
        responseBody: JSON.stringify(updatedConfig)
      } as HttpMockEntity;

      await this.httpMockService!.updateMock(updatedEntity);
      this.entity.set(updatedConfig);
      console.log('[SystemConfigRepository] Config actualizada correctamente');
      return true;

    } catch (error) {
      console.error('[SystemConfigRepository] Error al actualizar config:', error);
      return await this.create(config);
    }
  }

  getGroup(keyGroup: string): ConfigGroup | undefined {
    const config = this.entity();
    return config.groups?.find(g => g.key === keyGroup);
  }


  getField(keyGroup: string, keyConfigField: string): ConfigField | undefined {
    const group = this.getGroup(keyGroup);
    if (!group) {
      return undefined;
    }
    return group.fields?.find(f => f.key === keyConfigField);
  }

  async updateFieldValue(
    fieldKey: string,
    value: string | number | boolean | string[] | null
  ): Promise<boolean> {
    try {
      const currentEntity = this.entity();
      const config: SystemConfig = {
        ...currentEntity,
        groups: structuredClone(currentEntity.groups),
        updateTimestamp: function () { this.updatedAt = new Date(); }
      };

      // Buscar y actualizar el campo en los grupos
      let fieldFound = false;
      for (const group of config.groups || []) {
        const fieldIndex = group.fields?.findIndex(f => f.key === fieldKey) ?? -1;
        if (fieldIndex !== -1) {
          group.fields[fieldIndex].defaultValue = value;
          fieldFound = true;
          break;
        }
      }

      if (!fieldFound) {
        console.warn(`[SystemConfigRepository] Campo '${fieldKey}' no encontrado en ningún grupo`);
        return false;
      }

      return await this.update(config);

    } catch (error) {
      console.error('[SystemConfigRepository] Error al actualizar campo:', error);
      return false;
    }
  }

  async resetToDefaults(): Promise<boolean> {
    try {
      const defaultConfig = createDefaultSystemConfig();
      return await this.update(defaultConfig);

    } catch (error) {
      console.error('[SystemConfigRepository] Error al resetear config:', error);
      return false;
    }
  }

  protected override async refreshEntities(): Promise<void> {
    try {
      const httpMocks = await this.httpMockService?.findByServiceCode(this.SERVICE_CODE);

      if (httpMocks && httpMocks.length > 0) {
        const entity: SystemConfig = JSON.parse(httpMocks[0].responseBody);
        this.entity.set(entity);
        console.log('[SystemConfigRepository] Config cargada desde IndexedDB');
      } else {
        // No existe config, crear con valores por defecto
        const defaultConfig = createDefaultSystemConfig();
        this.entity.set(defaultConfig);
        await this.create(defaultConfig);
        console.log('[SystemConfigRepository] Config por defecto creada');
      }
    } catch (error) {
      console.error('[SystemConfigRepository] Error al refrescar config:', error);
      this.entity.set(this.DEFAULT_VALUE);
    }
  }
}
