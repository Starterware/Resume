import { RenderMode, ServerRoute } from '@angular/ssr';
import { Cv, LANGUAGES } from './core/models/cv.model';
import { readDataFile } from './core/services/data-file.server';

/**
 * Every route is prerendered to a static HTML file.
 *
 * GitHub Pages has no rewrite rules, so a URL with no file behind it is a hard
 * 404 for the visitor. The deep-dive parameters are therefore derived from the
 * CV data itself rather than hand-listed — add a slug to a `deepDives` array
 * and the corresponding page is generated on the next build.
 */
const localeParams = LANGUAGES.map((lang) => ({ lang }));

async function deepDiveParams(): Promise<{ lang: string; slug: string }[]> {
  const params: { lang: string; slug: string }[] = [];

  for (const lang of LANGUAGES) {
    const cv = await readDataFile<Cv>(`data/cv.${lang}.json`);
    const slugs = new Set(
      cv?.experience.flatMap((company) =>
        company.roles.flatMap((role) => (role.deepDives ?? []).map((link) => link.slug)),
      ) ?? [],
    );
    for (const slug of slugs) {
      params.push({ lang, slug });
    }
  }

  return params;
}

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'not-found', renderMode: RenderMode.Prerender },
  {
    path: ':lang',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => localeParams,
  },
  {
    path: ':lang/print',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => localeParams,
  },
  {
    path: ':lang/story',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => localeParams,
  },
  {
    path: ':lang/deep-dive/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: deepDiveParams,
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
