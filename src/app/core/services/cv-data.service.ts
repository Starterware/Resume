import { inject, Service, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Cv, DEFAULT_LANG, Lang } from '../models/cv.model';
import { DeepDive, LoadedDeepDive } from '../models/deep-dive.model';
import { DATA_LOADER } from '../tokens/data-loader';

/**
 * The single entry point for CV content.
 *
 * Every document fetched during prerendering is written into TransferState and
 * picked up by the hydrating client, so a visitor's browser makes no data
 * request at all for the page it landed on.
 */
@Service()
export class CvDataService {
  private readonly loader = inject(DATA_LOADER);
  private readonly transferState = inject(TransferState);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  async loadCv(lang: Lang): Promise<Cv | null> {
    return this.transferred(`cv:${lang}`, () => this.loader.loadJson<Cv>(`data/cv.${lang}.json`));
  }

  /**
   * Loads a deep dive, falling back to English when the requested locale has
   * not been translated yet. The fallback is deliberate: it lets a story go
   * live as soon as one language is ready instead of blocking on all three.
   */
  async loadDeepDive(slug: string, lang: Lang): Promise<LoadedDeepDive | null> {
    return this.transferred(`deepdive:${slug}:${lang}`, async () => {
      const requested = await this.readDeepDive(slug, lang);
      if (requested) {
        return { content: requested, requestedLang: lang, fallback: false };
      }

      if (lang === DEFAULT_LANG) {
        return null;
      }

      const fallback = await this.readDeepDive(slug, DEFAULT_LANG);
      return fallback ? { content: fallback, requestedLang: lang, fallback: true } : null;
    });
  }

  private readDeepDive(slug: string, lang: Lang): Promise<DeepDive | null> {
    return this.loader.loadJson<DeepDive>(`data/deepdive/${slug}.${lang}.json`);
  }

  /**
   * Runs `load` once on the server, hands the result to the client through the
   * prerendered HTML, and consumes it there so a later navigation re-fetches
   * rather than serving stale state.
   */
  private async transferred<T>(key: string, load: () => Promise<T | null>): Promise<T | null> {
    const stateKey = makeStateKey<T | null>(key);

    if (this.transferState.hasKey(stateKey)) {
      const value = this.transferState.get(stateKey, null);
      this.transferState.remove(stateKey);
      return value;
    }

    const value = await load();
    if (this.isServer) {
      this.transferState.set(stateKey, value);
    }
    return value;
  }
}
