import { InjectionToken } from '@angular/core';
import { IInitAppRepository } from '../interfaces/init.repository.interface';
import { ICurrentUserRepository } from '../interfaces/current-user.repository.interface';

export const INIT_APP_REPOSITORY = new InjectionToken<IInitAppRepository>('INIT_APP_REPOSITORY');
export const CURRENT_USER_REPOSITORY = new InjectionToken<ICurrentUserRepository>('CURRENT_USER_REPOSITORY');
