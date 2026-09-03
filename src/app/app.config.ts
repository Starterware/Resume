import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { BrowserDataLoader } from './core/services/browser-data-loader';
import { DATA_LOADER } from './core/tokens/data-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Resolved data and route params flow into component inputs, so pages
      // stay plain and testable instead of reading ActivatedRoute themselves.
      withComponentInputBinding(),
      // Child routes inherit the locale param and the resolved CV from :lang.
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideClientHydration(withEventReplay()),
    { provide: DATA_LOADER, useClass: BrowserDataLoader },
  ],
};
