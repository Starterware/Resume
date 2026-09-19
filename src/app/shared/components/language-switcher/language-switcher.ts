import { Component, inject } from '@angular/core';
import { Lang } from '../../../core/models/cv.model';
import { LanguageService } from '../../../core/services/language.service';

/** Locale names are written in their own language, never translated. */
const ENDONYMS: Record<Lang, string> = {
  en: 'English',
  fr: 'Français',
  nl: 'Nederlands',
};

@Component({
  selector: 'cv-language-switcher',
  template: `
    <nav class="languages" aria-label="Language">
      @for (lang of languageService.available; track lang) {
        <button
          type="button"
          class="languages__item"
          [class.languages__item--active]="lang === languageService.lang()"
          [attr.aria-current]="lang === languageService.lang() ? 'true' : null"
          [attr.aria-label]="endonyms[lang]"
          [attr.title]="endonyms[lang]"
          (click)="switch(lang)"
        >
          {{ lang.toUpperCase() }}
        </button>
      }
    </nav>
  `,
  styles: `
    .languages {
      display: flex;
      align-items: baseline;
    }

    /* Bare text, not chrome: the codes carry no border, ground or padding of
       their own, so the switcher reads as a quiet line of labels rather than a
       row of controls competing with the name beside it. The visible text is
       the locale code; the endonym is the accessible name. */
    /* Colours come in as custom properties so the host can retheme the codes
       for a dark or coloured masthead. Custom properties cross the style
       encapsulation boundary; ordinary parent selectors would not. */
    .languages__item {
      font: inherit;
      font-size: var(--switcher-size, 0.79rem);
      letter-spacing: 0.1em;
      padding: 0.1rem 0.6rem;
      border: 0;
      background: none;
      color: var(--switcher-text, var(--colour-muted));
      cursor: pointer;
    }

    /* A hairline between codes rather than a gap alone, so three short words
       do not read as one. Drawn on the separator, not as a border, to keep the
       ends of the row flush. */
    .languages__item + .languages__item {
      border-inline-start: 1px solid var(--switcher-separator, var(--grey-300));
    }

    .languages__item:hover {
      color: var(--switcher-hover-text, var(--colour-text));
    }

    .languages__item--active {
      color: var(--switcher-active-text, var(--colour-text));
      font-weight: 700;
      cursor: default;
    }
  `,
})
export class LanguageSwitcher {
  protected readonly languageService = inject(LanguageService);
  protected readonly endonyms = ENDONYMS;

  protected switch(lang: Lang): void {
    if (lang !== this.languageService.lang()) {
      this.languageService.switchTo(lang);
    }
  }
}
