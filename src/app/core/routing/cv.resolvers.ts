import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Cv, isLang } from '../models/cv.model';
import { LoadedDeepDive } from '../models/deep-dive.model';
import { CvDataService } from '../services/cv-data.service';

/**
 * Resolvers rather than in-component loading: prerendering needs the data to
 * be settled before the component renders, otherwise the emitted HTML is an
 * empty shell and the whole point of static generation is lost.
 */
export const cvResolver: ResolveFn<Cv | null> = async (route) => {
  const lang = route.paramMap.get('lang');
  if (!isLang(lang)) {
    return null;
  }
  return inject(CvDataService).loadCv(lang);
};

export const deepDiveResolver: ResolveFn<LoadedDeepDive | null> = async (route) => {
  const router = inject(Router);
  const lang = route.paramMap.get('lang');
  const slug = route.paramMap.get('slug');

  if (!isLang(lang) || !slug) {
    return null;
  }

  const loaded = await inject(CvDataService).loadDeepDive(slug, lang);
  if (!loaded) {
    // A slug with no file in any language is a dead link, not an empty page.
    router.navigateByUrl('/not-found');
    return null;
  }
  return loaded;
};
