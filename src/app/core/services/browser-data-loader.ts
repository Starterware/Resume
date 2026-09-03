import { DOCUMENT, inject, Service } from '@angular/core';
import { DataLoader } from '../tokens/data-loader';

/** Fetches data files over HTTP, resolved against the document base URI. */
@Service({ autoProvided: false })
export class BrowserDataLoader implements DataLoader {
  private readonly document = inject(DOCUMENT);

  async loadJson<T>(relativePath: string): Promise<T | null> {
    const url = new URL(relativePath, this.document.baseURI).toString();
    const response = await fetch(url);

    // A missing translation is an expected outcome, not an error.
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to load ${relativePath}: ${response.status}`);
    }
    return (await response.json()) as T;
  }
}
