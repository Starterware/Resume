import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Cv, Lang } from '../../core/models/cv.model';
import { ExperienceCard } from '../../shared/components/experience-card/experience-card';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { LogoChip } from '../../shared/components/logo/logo';
import { Section } from '../../shared/components/section/section';
import { PrettyUrlPipe } from '../../shared/pipes/pretty-url-pipe';

@Component({
  selector: 'cv-page',
  imports: [ExperienceCard, LanguageSwitcher, LogoChip, PrettyUrlPipe, RouterLink, Section],
  templateUrl: './cv-page.html',
  styleUrl: './cv-page.scss',
})
export class CvPage {
  /** Bound from the route parameter by `withComponentInputBinding`. */
  readonly lang = input.required<Lang>();
  /** Bound from the `cv` key of the route's resolved data. */
  readonly cv = input.required<Cv | null>();

  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    // Runs during prerendering too, so each generated HTML file carries its own
    // title, description and lang attribute rather than a shared default.
    effect(() => {
      const cv = this.cv();
      if (!cv) {
        return;
      }

      this.title.setTitle(`${cv.profile.name} — ${cv.profile.title}`);
      this.meta.updateTag({ name: 'description', content: cv.profile.summary });
      this.document.documentElement.lang = this.lang();
    });
  }
}
