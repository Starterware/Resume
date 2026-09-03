import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lang, LANGUAGES } from '../../core/models/cv.model';

/**
 * Shown for unknown paths, and copied to `404.html` after the build so that
 * GitHub Pages serves it for URLs that never reached the router.
 *
 * The copy is trilingual and hardcoded on purpose: a 404 must render even when
 * the data files are the thing that failed to load.
 */
@Component({
  selector: 'cv-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <p class="not-found__code">404</p>
      @for (message of messages; track message.lang) {
        <p class="not-found__message" [attr.lang]="message.lang">
          {{ message.text }}
          <a [routerLink]="['/', message.lang]">{{ message.link }}</a>
        </p>
      }
    </div>
  `,
  styles: `
    .not-found {
      max-width: 34rem;
      margin: 6rem auto;
      padding: 0 1.5rem;
      text-align: center;
    }

    .not-found__code {
      font-size: 3rem;
      font-weight: 600;
      margin: 0 0 1.5rem;
      color: var(--colour-muted);
    }

    .not-found__message {
      margin: 0 0 0.6rem;
      color: var(--colour-muted);
    }
  `,
})
export class NotFoundPage {
  protected readonly messages: { lang: Lang; text: string; link: string }[] = [
    { lang: 'en', text: 'This page does not exist.', link: 'Go to the CV' },
    { lang: 'fr', text: "Cette page n'existe pas.", link: 'Aller au CV' },
    { lang: 'nl', text: 'Deze pagina bestaat niet.', link: 'Ga naar het cv' },
  ];

  protected readonly languages = LANGUAGES;
}
