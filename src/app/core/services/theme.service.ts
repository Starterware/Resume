import { isPlatformBrowser } from '@angular/common';
import { computed, DOCUMENT, effect, inject, PLATFORM_ID, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import {
  DEFAULT_THEME,
  isThemeId,
  THEME_FONTS,
  themeClass,
  ThemeId,
  THEMES,
} from '../models/theme.model';

/** Element id prefix for an injected font stylesheet, so each is added once. */
const FONTS_ID_PREFIX = 'theme-fonts-';

/**
 * Applies the look asked for in the query string — `?theme=nature`,
 * `?theme=medieval`, `?theme=miami`, or nothing for the site's own steel.
 *
 * It is a query param rather than a stored preference so the URL stays the
 * whole state: the link is shareable, dropping the param restores the ordinary
 * site, and nothing lingers in a visitor's browser. `LanguageService.switchTo`
 * already carries the query string across locale switches, so the chosen look
 * survives the language switcher.
 *
 * Everything here is browser-only. Prerendered URLs have no query string, so
 * the generated HTML — and the PDF, which is printed from `/print` — is exactly
 * what it was before the themes existed.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** The root route sees the query string for every page, on every navigation. */
  private readonly requested = toSignal(
    this.router.routerState.root.queryParamMap.pipe(map((params) => params.get('theme'))),
    { initialValue: null },
  );

  /** What is actually on the page — never a half-applied or unknown theme. */
  readonly active = computed(() => ThemeService.resolve(this.requested()));

  constructor() {
    effect(() => this.apply(this.active()));
  }

  /**
   * Maps a `?theme=` value to a theme. Anything unrecognised is the ordinary
   * site, so a stray or misspelled param never leaves a half-theme behind.
   */
  static resolve(theme: string | null | undefined): ThemeId {
    const name = theme?.trim().toLowerCase();
    return isThemeId(name) ? name : DEFAULT_THEME;
  }

  /**
   * Rewrites the current URL's `theme` param, keeping the path and any other
   * query it carries.
   *
   * `replaceUrl` on purpose: picking a look is not somewhere you navigated to,
   * and without it the back button would walk back through every style tried
   * instead of returning to the page before this one.
   */
  switchTo(theme: ThemeId): void {
    this.router.navigate([], {
      queryParams: { theme: theme === DEFAULT_THEME ? null : theme },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private apply(theme: ThemeId): void {
    if (!this.isBrowser) {
      return;
    }

    // On <html>, not <body>: a theme sets its own root font size, and `rem`
    // resolves against the root element, so a class on the body could not
    // scale the type the components are written in.
    for (const candidate of THEMES) {
      const className = themeClass(candidate);
      if (className) {
        this.document.documentElement.classList.toggle(className, candidate === theme);
      }
    }

    this.loadFonts(theme);
  }

  /** Left in place once loaded: switching back and forth should not refetch. */
  private loadFonts(theme: ThemeId): void {
    const href = THEME_FONTS[theme];
    const id = `${FONTS_ID_PREFIX}${theme}`;
    if (!href || this.document.getElementById(id)) {
      return;
    }

    const link = this.document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    this.document.head.appendChild(link);
  }
}
