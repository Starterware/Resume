import { Service } from '@angular/core';
import { DataLoader } from '../tokens/data-loader';
import { readDataFile } from './data-file.server';

/**
 * Reads data files from disk during prerendering.
 *
 * Provided only in `app.config.server.ts`, never in `app.config.ts` — that is
 * what keeps `node:fs` out of the browser bundle.
 */
@Service({ autoProvided: false })
export class ServerDataLoader implements DataLoader {
  loadJson<T>(relativePath: string): Promise<T | null> {
    return readDataFile<T>(relativePath);
  }
}
