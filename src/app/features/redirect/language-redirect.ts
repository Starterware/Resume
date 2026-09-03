import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Lang, LANGUAGES } from '../../core/models/cv.model';
import { LanguageService } from '../../core/services/language.service';

/**
 * The site root. Prerenders to a real page listing the three locales, then
 * redirects to the visitor's preferred one once JavaScript runs.
 *
 * GitHub Pages has no server-side redirect rules, so this has to happen in the
 * page — and it has to still work without JavaScript, hence the visible links.
 */
@Component({
  selector: 'cv-language-redirect',
  imports: [RouterLink],
  template: `
    <div class="chooser">
      <h1 class="chooser__heading">Curriculum vitae</h1>
      <ul class="chooser__list">
        @for (lang of languages; track lang) {
          <li><a [routerLink]="['/', lang]" [attr.lang]="lang">{{ endonyms[lang] }}</a></li>
        }
      </ul>
    </div>
  `,
  styles: `
    .chooser {
      max-width: 46rem;
      margin: 6rem auto;
      padding: 0 1.5rem;
      text-align: center;
    }

    .chooser__heading {
      font-size: 1.3rem;
      font-weight: 500;
      margin: 0 0 1.5rem;
    }

    .chooser__list {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }
  `,
})
export class LanguageRedirect {
  protected readonly languages = LANGUAGES;
  protected readonly endonyms: Record<Lang, string> = {
    en: 'English',
    fr: 'Français',
    nl: 'Nederlands',
  };

  constructor() {
    const router = inject(Router);

    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const preferred = LanguageService.preferredFrom(navigator.languages ?? [navigator.language]);
      // replaceUrl so the back button leaves the site instead of bouncing here.
      router.navigate(['/', preferred], { replaceUrl: true });
    }
  }
}
