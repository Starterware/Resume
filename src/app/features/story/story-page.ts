import { Component, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Cv, Lang } from '../../core/models/cv.model';
import { ThemePicker } from '../../shared/components/theme-picker/theme-picker';

/**
 * The career narrative, on a page of its own so it has a URL worth sending.
 *
 * The prose lives in `profile.narrative` of the CV file rather than a file of
 * its own: it is written per locale like everything else there, and the
 * validator already holds the three files to the same shape. Moving it to
 * `public/data/narrative.{lang}.json` would buy the deep dives' fallback — the
 * ability to publish it in one language first — at the cost of a loader, a
 * resolver and a third data shape.
 */
@Component({
  selector: 'cv-story-page',
  imports: [RouterLink, ThemePicker],
  templateUrl: './story-page.html',
  styleUrl: './story-page.scss',
})
export class StoryPage {
  readonly lang = input.required<Lang>();
  /** Inherited from the parent locale route. */
  readonly cv = input.required<Cv | null>();

  private readonly title = inject(Title);

  constructor() {
    effect(() => {
      const cv = this.cv();
      if (cv) {
        this.title.setTitle(`${cv.ui.narrative.title} — ${cv.profile.name}`);
      }
    });
  }
}
