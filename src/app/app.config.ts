import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { CURRENT_USER_PROVIDER, FEEDBACK_PROVIDER, INIT_APP_PROVIDER, REPOSITORY_INITIALIZER, SYSTEM_CONFIG_PROVIDER } from './providers/repository.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    ...INIT_APP_PROVIDER.providers,
    ...CURRENT_USER_PROVIDER.providers,
    ...SYSTEM_CONFIG_PROVIDER.providers,
    ...FEEDBACK_PROVIDER.providers,

    // Inicializador global - debe ir AL FINAL
    ...REPOSITORY_INITIALIZER.providers
  ]
};
