import { InjectionToken } from '@angular/core';

/**
 * Reads a JSON document from the site's data directory.
 *
 * Two implementations exist because the same code runs in two places: during
 * the build, prerendering reads the files straight off disk; in the browser,
 * the same paths are fetched over HTTP. Keeping this behind a token is also
 * the seam where a real HTTP API could be swapped in later without touching
 * a single component.
 *
 * @param relativePath path below the data root, e.g. `data/cv.fr.json`
 * @returns the parsed document, or `null` when it does not exist
 */
export interface DataLoader {
  loadJson<T>(relativePath: string): Promise<T | null>;
}

export const DATA_LOADER = new InjectionToken<DataLoader>('DATA_LOADER');
