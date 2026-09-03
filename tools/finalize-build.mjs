import { access, copyFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browserDist = join(repoRoot, 'dist/resume/browser');

/** Routes that must exist as real files, since GitHub Pages cannot rewrite. */
const requiredRoutes = [
  '',
  'not-found',
  'en',
  'fr',
  'nl',
  'en/print',
  'fr/print',
  'nl/print',
  'en/story',
  'fr/story',
  'nl/story',
];

async function main() {
  // GitHub Pages runs Jekyll by default, which silently drops files and
  // directories beginning with an underscore.
  await writeFile(join(browserDist, '.nojekyll'), '');

  // Pages serves 404.html for any URL with no file behind it. Reusing the
  // prerendered not-found page keeps that response looking like the site.
  await copyFile(join(browserDist, 'not-found/index.html'), join(browserDist, '404.html'));

  const deepDiveRoutes = [];
  for (const lang of ['en', 'fr', 'nl']) {
    const dir = join(browserDist, lang, 'deep-dive');
    try {
      for (const slug of await readdir(dir)) {
        deepDiveRoutes.push(`${lang}/deep-dive/${slug}`);
      }
    } catch {
      // a locale with no deep dives is fine
    }
  }

  const missing = [];
  for (const route of [...requiredRoutes, ...deepDiveRoutes]) {
    try {
      await access(join(browserDist, route, 'index.html'));
    } catch {
      missing.push(`/${route}`);
    }
  }

  if (missing.length > 0) {
    console.error('Missing prerendered routes:\n  ' + missing.join('\n  '));
    console.error('These would 404 on GitHub Pages. Check getPrerenderParams in app.routes.server.ts.');
    process.exit(1);
  }

  console.log(`  ✔ .nojekyll, 404.html, ${requiredRoutes.length + deepDiveRoutes.length} routes verified`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
