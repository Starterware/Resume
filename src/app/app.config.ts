import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { BrowserDataLoader } from './core/services/browser-data-loader';
import { ThemeService } from './core/services/theme.service';
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
      // Every in-site link carries the query string forward, because the query
      // string is where the chosen style lives — without this, picking a look
      // and then following "read my full story" would drop it. It is a default,
      // so a navigation that means to rewrite the query still says so itself;
      // the guard's redirect to /not-found returns a UrlTree and is unaffected,
      // which is right — a broken link should not arrive wearing a theme.
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        defaultQueryParamsHandling: 'preserve',
      }),
    ),
    provideClientHydration(withEventReplay()),
    { provide: DATA_LOADER, useClass: BrowserDataLoader },
    // Constructing it is the point: it then watches the URL for `?theme=` for
    // the life of the app. The picker injects it too, but the theme has to be
    // on the page before any component asks for it.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
