import { Routes } from '@angular/router';
import { cvResolver, deepDiveResolver } from './core/routing/cv.resolvers';
import { langGuard } from './core/routing/lang.guard';
import { CvPage } from './features/cv/cv-page';
import { DeepDivePage } from './features/deep-dive/deep-dive-page';
import { NotFoundPage } from './features/not-found/not-found-page';
import { PrintPage } from './features/print/print-page';
import { StoryPage } from './features/story/story-page';
import { LanguageRedirect } from './features/redirect/language-redirect';

/**
 * The locale is the first path segment, which makes every page independently
 * linkable and lets the prerenderer emit one HTML file per language.
 *
 * `/not-found` sits above `:lang` so it is not swallowed by the locale param;
 * the build copies its prerendered output to `404.html` for GitHub Pages.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LanguageRedirect },
  { path: 'not-found', component: NotFoundPage },
  {
    path: ':lang',
    canActivate: [langGuard],
    resolve: { cv: cvResolver },
    runGuardsAndResolvers: 'paramsChange',
    children: [
      { path: '', component: CvPage },
      { path: 'print', component: PrintPage },
      { path: 'story', component: StoryPage },
      {
        path: 'deep-dive/:slug',
        component: DeepDivePage,
        resolve: { deepDive: deepDiveResolver },
      },
      // No wildcard child here on purpose: an unmatched path under a valid
      // locale backtracks to the top-level wildcard, which keeps the server
      // route table free of an unprerenderable ':lang/**' entry.
    ],
  },
  { path: '**', redirectTo: '/not-found' },
];
