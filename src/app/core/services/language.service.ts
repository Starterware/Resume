import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_LANG, isLang, Lang, LANGUAGES } from '../models/cv.model';

/**
 * Holds the locale for the current view and rewrites URLs when it changes.
 *
 * The locale is the first URL segment, so switching languages is a navigation
 * rather than a state change — which keeps every page independently linkable
 * and lets the prerenderer emit a real HTML file per language.
 */
@Service()
export class LanguageService {
  private readonly router = inject(Router);
  private readonly current = signal<Lang>(DEFAULT_LANG);

  readonly lang = this.current.asReadonly();
  readonly available = LANGUAGES;

  /** Locales other than the active one, for rendering the switcher. */
  readonly alternatives = computed(() => LANGUAGES.filter((lang) => lang !== this.current()));

  setLang(lang: Lang): void {
    this.current.set(lang);
  }

  /** Swaps the locale segment of the current URL, keeping the rest of the path. */
  switchTo(lang: Lang): void {
    const [path, query] = this.router.url.split('?');
    const segments = path.split('/').filter(Boolean);

    if (segments.length > 0 && isLang(segments[0])) {
      segments[0] = lang;
    } else {
      segments.unshift(lang);
    }

    this.router.navigateByUrl(`/${segments.join('/')}${query ? `?${query}` : ''}`);
  }

  /**
   * Picks the best supported locale from the browser's preferences.
   * Used only by the root redirect; every other route carries its own locale.
   */
  static preferredFrom(preferences: readonly string[]): Lang {
    for (const preference of preferences) {
      const base = preference.toLowerCase().split('-')[0];
      if (isLang(base)) {
        return base;
      }
    }
    return DEFAULT_LANG;
  }
}
