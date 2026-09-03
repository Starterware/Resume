import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

/**
 * Reads a data file from disk at build time.
 *
 * Shared by the server `DataLoader` and by the prerender parameter functions,
 * which run outside the injector and so cannot go through DI. The prerender
 * worker's working directory differs between `ng build` and `ng serve`, so
 * candidate roots are tried in order rather than assuming one.
 */
const CANDIDATE_ROOTS = [
  resolve(process.cwd(), 'public'),
  resolve(process.cwd(), 'dist/resume/browser'),
  resolve(process.cwd(), '../browser'),
];

export async function readDataFile<T>(relativePath: string): Promise<T | null> {
  for (const root of CANDIDATE_ROOTS) {
    try {
      return JSON.parse(await readFile(join(root, relativePath), 'utf-8')) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }
  return null;
}
