import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { CURRENT_USER_REPOSITORY, INIT_APP_REPOSITORY, INITIALIZABLE_REPOSITORIES, SYSTEM_CONFIG_REPOSITORY } from '../tokens/repository.tokens';
import { InitAppIndexeddbRepository } from '../repository/init.indexeddb.repository';
import { CurrentUserIndexeddbRepository } from '../repository/current-user.indexeddb.repository';
import { SystemConfigIndexeddbRepository } from '../repository/system-config.indexeddb.repository';
import { STORAGE_KEYS } from '../constants/general.constants';

export const INIT_APP_PROVIDER: ApplicationConfig = {
  providers: [
    {
      provide: INIT_APP_REPOSITORY,
      useClass: InitAppIndexeddbRepository
    }
  ]
};

/**
 * Provider para el repositorio de CurrentUser.
 * Registra el repositorio tanto en su token específico como en el multi-provider de inicializables.
 */
export const CURRENT_USER_PROVIDER: ApplicationConfig = {
  providers: [
    CurrentUserIndexeddbRepository,
    {
      provide: CURRENT_USER_REPOSITORY,
      useExisting: CurrentUserIndexeddbRepository
    },
    {
      provide: INITIALIZABLE_REPOSITORIES,
      useExisting: CurrentUserIndexeddbRepository,
      multi: true
    }
  ]
};

/**
 * Provider para el repositorio de SystemConfig.
 * Gestiona la configuración del sistema (ConfigGroups, FieldOptions, etc.)
 */
export const SYSTEM_CONFIG_PROVIDER: ApplicationConfig = {
  providers: [
    SystemConfigIndexeddbRepository,
    {
      provide: SYSTEM_CONFIG_REPOSITORY,
      useExisting: SystemConfigIndexeddbRepository
    },
    {
      provide: INITIALIZABLE_REPOSITORIES,
      useExisting: SystemConfigIndexeddbRepository,
      multi: true
    }
  ]
};

/**
 * Provider global que inicializa todos los repositorios registrados.
 * Implementa el Open/Closed Principle: agregar repos no requiere modificar este código.
 */
export const REPOSITORY_INITIALIZER: ApplicationConfig = {
  providers: [
    provideAppInitializer(async () => {
      const repositories = inject(INITIALIZABLE_REPOSITORIES, { optional: true }) || [];
      const registration = localStorage.getItem(STORAGE_KEYS.CURRENT_REGISTRATION) || '';

      // Inicializar todos los repositorios en paralelo con el registration
      await Promise.all(
        repositories.map(repo => repo.initService(registration))
      );

      console.log(`${repositories.length} repositorio(s) inicializado(s) para: ${registration || 'sin registro'}`);
    })
  ]
};
