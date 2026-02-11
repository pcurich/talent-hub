import { InjectionToken } from '@angular/core';
import { IInitAppRepository } from '../interfaces/init.repository.interface';
import { ICurrentUserRepository } from '../interfaces/current-user.repository.interface';
import { ISystemConfigRepository } from '../interfaces/system-config.repository.interface';
import { IInitializable } from '../interfaces/initializable.interface';

export const INIT_APP_REPOSITORY = new InjectionToken<IInitAppRepository>('INIT_APP_REPOSITORY');
export const CURRENT_USER_REPOSITORY = new InjectionToken<ICurrentUserRepository>('CURRENT_USER_REPOSITORY');
export const SYSTEM_CONFIG_REPOSITORY = new InjectionToken<ISystemConfigRepository>('SYSTEM_CONFIG_REPOSITORY');

/**
 * Token multi-provider para registrar todos los repositorios inicializables.
 * Permite agregar nuevos repositorios sin modificar código existente (Open/Closed Principle).
 */
export const INITIALIZABLE_REPOSITORIES = new InjectionToken<IInitializable[]>('INITIALIZABLE_REPOSITORIES');
