import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { CURRENT_USER_PROVIDER, INIT_APP_PROVIDER } from './providers/repository.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    ...INIT_APP_PROVIDER.providers,
    ...CURRENT_USER_PROVIDER.providers
  ]
};
