import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Cv, Lang } from '../../core/models/cv.model';
import { MonthYearPipe } from '../../shared/pipes/month-year-pipe';
import { PrettyUrlPipe } from '../../shared/pipes/pretty-url-pipe';

/**
 * The A4 source for the generated PDFs, laid out to match the original
 * `cv.html` this project was built from.
 *
 * It is a separate component rather than a print stylesheet over the web page
 * because the two are different documents: the PDF is a curated subset
 * (`includeInPdf`) on paper, and it deliberately drops the aggregate Skills,
 * Projects and Interests sections — the per-employer skill strips already
 * carry the keywords an applicant tracking system looks for.
 */
@Component({
  selector: 'cv-print-page',
  imports: [MonthYearPipe, PrettyUrlPipe],
  templateUrl: './print-page.html',
  styleUrl: './print-page.scss',
})
export class PrintPage {
  readonly lang = input.required<Lang>();
  readonly cv = input.required<Cv | null>();

  /**
   * Companies with only the roles marked for print, and companies whose roles
   * are all excluded dropped entirely.
   */
  protected readonly experience = computed(() =>
    (this.cv()?.experience ?? [])
      .map((company) => ({
        ...company,
        roles: company.roles.filter((role) => role.includeInPdf),
      }))
      .filter((company) => company.roles.length > 0),
  );
  /**
   * The source CV sets the surname in bold and the given name light, so the
   * name is split on its last space. A name whose family part is more than one
   * word would need the split to live in the data instead.
   */
  protected readonly nameParts = computed(() => {
    const full = this.cv()?.profile.name ?? '';
    const cut = full.lastIndexOf(' ');
    return cut === -1
      ? { given: full, family: '' }
      : { given: full.slice(0, cut), family: full.slice(cut + 1) };
  });

  protected readonly education = computed(() =>
    (this.cv()?.education ?? [])
      .map((institution) => ({
        ...institution,
        degrees: institution.degrees.filter((degree) => degree.includeInPdf),
      }))
      .filter((institution) => institution.degrees.length > 0),
  );

  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);

  constructor() {
    effect(() => {
      const cv = this.cv();
      // The page title becomes the PDF's document title, which is what a
      // reader sees in their viewer's title bar and file properties.
      if (cv) {
        this.title.setTitle(`${cv.profile.name} — ${cv.profile.title}`);
      }

      this.document.documentElement.lang = this.lang();
      // Signals to the PDF job that this page is print layout, so the shared
      // page chrome and background can be suppressed.
      this.document.body.classList.add('is-print');
    });
  }
}
