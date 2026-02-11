import { Injectable, Signal } from "@angular/core";
import { HttpStatusCode } from "@angular/common/http";
import { HttpMockEntity } from "@pcurich/client-storage-indexeddb";
import { ISystemConfigRepository } from "../interfaces/system-config.repository.interface";
import {
  SystemConfig,
  ConfigValue,
  createDefaultSystemConfig
} from "../model/system-config.model";
import { APP_CONFIG, SERVICE_CODES } from "../constants/general.constants";
import { BaseIndexeddbRepository } from "./base.indexeddb.repository";

/**
 * Repositorio IndexedDB para la configuración del sistema.
 * Gestiona el CRUD de SystemConfig, que contiene ConfigGroups y FieldOptions.
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo maneja persistencia de SystemConfig
 * - Open/Closed: Extiende BaseIndexeddbRepository sin modificarlo
 * - Liskov Substitution: Implementa ISystemConfigRepository completamente
 * - Interface Segregation: Interface específica para config del sistema
 * - Dependency Inversion: Depende de abstracciones (ISystemConfigRepository)
 */
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

  /**
   * Verifica si existe una configuración guardada en IndexedDB.
   */
  async exists(): Promise<boolean> {
    try {
      await this.ensureDatabase();
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

  /**
   * Crea una nueva configuración del sistema en IndexedDB.
   * Si no existe, crea con valores por defecto.
   */
  async create(config: SystemConfig): Promise<boolean> {
    try {
      const entityToSave = { ...config };

      if (!entityToSave.createdAt) {
        entityToSave.createdAt = new Date();
      }
      entityToSave.updatedAt = new Date();

      await this.ensureDatabase();

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

  /**
   * Actualiza la configuración del sistema existente.
   */
  async update(config: SystemConfig): Promise<boolean> {
    try {
      await this.ensureDatabase();

      const entities = await this.httpMockService!.findByServiceCode(this.SERVICE_CODE);

      if (!entities || entities.length === 0) {
        console.warn('[SystemConfigRepository] No existe config, creando nueva...');
        return await this.create(config);
      }

      const existingEntity = entities[0];
      const updatedConfig: SystemConfig = {
        ...config,
        updatedAt: new Date(),
        updateTimestamp: function() { this.updatedAt = new Date(); }
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
      return false;
    }
  }

  /**
   * Obtiene el valor de un campo específico de la configuración.
   * @param fieldKey - Key del campo a buscar
   */
  getFieldValue(fieldKey: string): ConfigValue | undefined {
    const config = this.entity();
    return config.values?.find(v => v.fieldKey === fieldKey);
  }

  /**
   * Actualiza el valor de un campo específico.
   * @param fieldKey - Key del campo a actualizar
   * @param value - Nuevo valor
   */
  async updateFieldValue(
    fieldKey: string,
    value: string | number | boolean | string[] | null
  ): Promise<boolean> {
    try {
      const currentEntity = this.entity();
      const config: SystemConfig = {
        ...currentEntity,
        updateTimestamp: function() { this.updatedAt = new Date(); }
      };
      const valueIndex = config.values.findIndex(v => v.fieldKey === fieldKey);

      if (valueIndex === -1) {
        // Campo no existe, agregarlo
        config.values.push({
          fieldKey,
          value,
          updatedAt: new Date()
        });
      } else {
        // Actualizar campo existente
        config.values[valueIndex] = {
          ...config.values[valueIndex],
          value,
          updatedAt: new Date()
        };
      }

      return await this.update(config);

    } catch (error) {
      console.error('[SystemConfigRepository] Error al actualizar campo:', error);
      return false;
    }
  }

  /**
   * Resetea la configuración a los valores por defecto.
   */
  async resetToDefaults(): Promise<boolean> {
    try {
      const defaultConfig = createDefaultSystemConfig();

      // Mantener el ID si existe una config previa
      const currentConfig = this.entity();
      if (currentConfig?.id) {
        defaultConfig.id = currentConfig.id;
      }

      const exists = await this.exists();
      if (exists) {
        return await this.update(defaultConfig);
      } else {
        return await this.create(defaultConfig);
      }

    } catch (error) {
      console.error('[SystemConfigRepository] Error al resetear config:', error);
      return false;
    }
  }

  /**
   * Sobrescribe refreshEntities para crear config por defecto si no existe.
   */
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
