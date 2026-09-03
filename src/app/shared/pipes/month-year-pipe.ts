import { Pipe, PipeTransform } from '@angular/core';
import { Lang } from '../../core/models/cv.model';

/**
 * Belgian locale variants, so dates read the way they do locally
 * ("januari 2023", not "January 2023") and use day-month order.
 */
const INTL_LOCALES: Record<Lang, string> = {
  en: 'en-GB',
  fr: 'fr-BE',
  nl: 'nl-BE',
};

/** Formats an ISO year-month ("2023-01") as a localised month and year. */
@Pipe({ name: 'monthYear' })
export class MonthYearPipe implements PipeTransform {
  transform(value: string | null | undefined, lang: Lang, fallback = ''): string {
    if (!value) {
      return fallback;
    }

    const [year, month] = value.split('-').map(Number);
    if (!year || !month) {
      return value;
    }

    return new Intl.DateTimeFormat(INTL_LOCALES[lang], {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  }
}
