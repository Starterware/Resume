import { Component, inject, input } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeId, THEMES } from '../../../core/models/theme.model';

/**
 * The row of style names below the sheet.
 *
 * It sits on the metal rather than on the paper, and starts almost invisible:
 * a CV is a document, and a skin picker printed on it would be the first thing
 * a recruiter's eye landed on. Someone looking for it will find it; nobody else
 * has to notice it is there.
 *
 * Faint is a resting state, not a permanent one — the row comes up to full
 * strength on hover and on keyboard focus, and renders at full strength from
 * the start for anyone whose system asks for more contrast or less
 * transparency, so the low-contrast default is never what a visitor is stuck
 * with. The names themselves are proper nouns of the designs and stay in
 * English in every locale, the same way the technology names on the CV do;
 * only the row's accessible label is translated.
 */
@Component({
  selector: 'cv-theme-picker',
  template: `
    <nav class="themes" [attr.aria-label]="label()">
      @for (theme of themes; track theme; let first = $first) {
        <!-- An element rather than a literal between the buttons: Angular
             collapses the whitespace at element boundaries, so a typed dot
             would lose the spaces around it. Drawn outside the buttons so the
             separator is not itself a click target. -->
        @if (!first) {
          <span class="themes__dot" aria-hidden="true">·</span>
        }
        <button
          type="button"
          class="themes__item"
          [class.themes__item--active]="theme === themeService.active()"
          [attr.aria-current]="theme === themeService.active() ? 'true' : null"
          (click)="select(theme)"
        >
          {{ theme }}
        </button>
      }
    </nav>
  `,
  styles: `
    .themes {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: center;
      gap: 0.15rem 0.55rem;
      margin-block-start: 1.8rem;
      font-size: 0.9rem;
      letter-spacing: 0.16em;
      /* Barely there until looked for. Applied to the row rather than to each
         label so the dots fade with the names. */
      opacity: 0.22;
      transition: opacity 220ms ease;
    }

    /* focus-within, not just hover: the row has to appear for a keyboard before
       the button inside it can be read or activated. */
    .themes:hover,
    .themes:focus-within {
      opacity: 1;
    }

    /* Anyone who has asked their system for stronger contrast, or for less
       see-through interface, gets the row at full strength from the start. */
    @media (prefers-contrast: more), (prefers-reduced-transparency: reduce) {
      .themes {
        opacity: 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .themes {
        transition: none;
      }
    }

    /* Bare text, like the language switcher: no border, ground or padding of
       its own, so the row reads as a line of labels rather than four buttons. */
    .themes__item {
      font: inherit;
      padding: 0.1rem 0.15rem;
      border: 0;
      background: none;
      color: var(--picker-text, var(--colour-on-metal-muted));
      text-transform: lowercase;
      cursor: pointer;
    }

    .themes__item:hover {
      color: var(--picker-hover-text, #fff);
    }

    .themes__item--active {
      color: var(--picker-active-text, #fff);
      font-weight: 700;
      cursor: default;
    }

    .themes__dot {
      color: var(--picker-text, var(--colour-on-metal-muted));
    }
  `,
})
export class ThemePicker {
  /** Accessible name for the row, e.g. "Style" — translated per locale. */
  readonly label = input.required<string>();

  protected readonly themeService = inject(ThemeService);
  protected readonly themes = THEMES;

  protected select(theme: ThemeId): void {
    if (theme !== this.themeService.active()) {
      this.themeService.switchTo(theme);
    }
  }
}
