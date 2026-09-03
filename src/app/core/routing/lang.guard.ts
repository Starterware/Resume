import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isLang } from '../models/cv.model';
import { LanguageService } from '../services/language.service';

/**
 * Rejects URLs whose locale segment is not one we publish, and records the
 * active locale for the rest of the view. Unknown locales go to /not-found
 * rather than silently redirecting, so a broken link stays visibly broken.
 */
export const langGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const languageService = inject(LanguageService);
  const lang = route.paramMap.get('lang');

  if (!isLang(lang)) {
    return router.parseUrl('/not-found');
  }

  languageService.setLang(lang);
  return true;
};
