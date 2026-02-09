

import { ApplicationConfig } from '@angular/core';
import { CURRENT_USER_REPOSITORY, INIT_APP_REPOSITORY } from '../tokens/repository.tokens';
import { InitAppIndexeddbRepository } from '../repository/init.indexeddb.repository';
import { CurrentUserIndexeddbRepository } from '../repository/current-user.indexeddb.repository';

export const INIT_APP_PROVIDER: ApplicationConfig = {
  providers: [
    {
      provide: INIT_APP_REPOSITORY,
      useClass: InitAppIndexeddbRepository
    }
  ]
};

export const CURRENT_USER_PROVIDER: ApplicationConfig = {
  providers: [
    {
      provide: CURRENT_USER_REPOSITORY,
      useClass: CurrentUserIndexeddbRepository
    }
  ]
};
