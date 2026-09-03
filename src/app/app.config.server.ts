import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ServerDataLoader } from './core/services/server-data-loader';
import { DATA_LOADER } from './core/tokens/data-loader';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Overrides the browser loader: during prerendering there is no HTTP
    // server to fetch from, so the data comes off the filesystem.
    { provide: DATA_LOADER, useClass: ServerDataLoader },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
