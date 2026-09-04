import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Cv, Lang } from '../../core/models/cv.model';
import { LoadedDeepDive } from '../../core/models/deep-dive.model';
import { Section } from '../../shared/components/section/section';
import { ThemePicker } from '../../shared/components/theme-picker/theme-picker';

@Component({
  selector: 'cv-deep-dive-page',
  imports: [RouterLink, Section, ThemePicker],
  templateUrl: './deep-dive-page.html',
  styleUrl: './deep-dive-page.scss',
})
export class DeepDivePage {
  readonly lang = input.required<Lang>();
  /** Inherited from the parent locale route, for the interface strings. */
  readonly cv = input.required<Cv | null>();
  readonly deepDive = input.required<LoadedDeepDive | null>();

  /**
   * The follow-ups this story actually answers, in a fixed order so the
   * questions read the same way from one deep dive to the next.
   */
  protected readonly followUps = computed(() => {
    const content = this.deepDive()?.content;
    if (!content) {
      return [];
    }

    return ([
      'whyThisApproach',
      'challenge',
      'hardestBug',
      'teamReaction',
      'whatNext',
      'differently',
      'learned',
      'aboutYourself',
      'enjoyed',
    ] as const)
      .map((key) => ({ key, answer: content[key] ?? [] }))
      .filter((item) => item.answer.length > 0);
  });

  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const loaded = this.deepDive();
      if (!loaded) {
        return;
      }
      this.title.setTitle(loaded.content.title);
      // When English stands in for a missing translation, the served content is
      // English and the lang attribute has to say so for screen readers.
      this.document.documentElement.lang = loaded.content.lang;
    });
  }
}
