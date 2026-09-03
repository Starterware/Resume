import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(repoRoot, 'public/data');
const languages = ['en', 'fr', 'nl'];
const reference = 'en';

/**
 * Checks the three locale files against each other before the build runs.
 *
 * Ids drive routing and translations are edited one file at a time, so the
 * realistic failure here is drift — an entry added in English and forgotten in
 * Dutch, or a deep dive linked from a slug that has no file. Both produce a
 * broken page rather than a build error, which is why this exists.
 */
const errors = [];

function compareIds(label, cvs) {
  const expected = cvs[reference][label].map((entry) => entry.id);

  for (const lang of languages) {
    const actual = cvs[lang][label].map((entry) => entry.id);
    if (actual.join('|') !== expected.join('|')) {
      errors.push(
        `${label}: ids differ between ${reference} and ${lang}\n` +
          `    ${reference}: ${expected.join(', ')}\n` +
          `    ${lang}: ${actual.join(', ')}`,
      );
    }
  }
}

/** Recursively collects the leaf paths of an object, for key-set comparison. */
function leafPaths(value, prefix = '') {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

async function main() {
  const cvs = {};
  const uis = {};
  for (const lang of languages) {
    cvs[lang] = JSON.parse(await readFile(join(dataDir, `cv.${lang}.json`), 'utf-8'));
    // A locale whose interface strings are missing renders a page of blanks,
    // so the read failing here is the intended outcome.
    uis[lang] = JSON.parse(await readFile(join(dataDir, `ui.${lang}.json`), 'utf-8'));
  }

  for (const label of ['experience', 'education']) {
    compareIds(label, cvs);
  }

  // Degrees nest under institutions, the same shape as roles under companies.
  const expectedDegreeIds = cvs[reference].education
    .flatMap((institution) => institution.degrees.map((degree) => degree.id))
    .join('|');
  for (const lang of languages) {
    const actual = cvs[lang].education
      .flatMap((institution) => institution.degrees.map((degree) => degree.id))
      .join('|');
    if (actual !== expectedDegreeIds) {
      errors.push(
        `education degrees: ids differ between ${reference} and ${lang}\n` +
          `    ${reference}: ${expectedDegreeIds.split('|').join(', ')}\n` +
          `    ${lang}: ${actual.split('|').join(', ')}`,
      );
    }
  }

  // Roles nest one level down, and their ids are what deep dives point at.
  const expectedRoleIds = cvs[reference].experience
    .flatMap((company) => company.roles.map((role) => role.id))
    .join('|');
  for (const lang of languages) {
    const actual = cvs[lang].experience
      .flatMap((company) => company.roles.map((role) => role.id))
      .join('|');
    if (actual !== expectedRoleIds) {
      errors.push(
        `experience roles: ids differ between ${reference} and ${lang}\n` +
          `    ${reference}: ${expectedRoleIds.split('|').join(', ')}\n` +
          `    ${lang}: ${actual.split('|').join(', ')}`,
      );
    }
  }

  // Every locale must define the same interface strings, or a page renders a
  // blank label in one language only.
  const expectedUiKeys = leafPaths(uis[reference]).sort();
  for (const lang of languages) {
    const actual = leafPaths(uis[lang]).sort();
    const missing = expectedUiKeys.filter((key) => !actual.includes(key));
    const extra = actual.filter((key) => !expectedUiKeys.includes(key));
    if (missing.length || extra.length) {
      errors.push(
        `ui: key mismatch in ${lang}` +
          (missing.length ? `\n    missing: ${missing.join(', ')}` : '') +
          (extra.length ? `\n    unexpected: ${extra.join(', ')}` : ''),
      );
    }
  }

  // Deep dives fall back to English, so English is the one that must exist.
  const deepDiveFiles = new Set(await readdir(join(dataDir, 'deepdive')));
  const linked = new Set(
    languages.flatMap((lang) =>
      cvs[lang].experience.flatMap((company) =>
        company.roles.flatMap((role) => (role.deepDives ?? []).map((link) => link.slug)),
      ),
    ),
  );

  for (const slug of linked) {
    if (!deepDiveFiles.has(`${slug}.en.json`)) {
      errors.push(`deep dive "${slug}" is linked from the CV but ${slug}.en.json does not exist`);
    }
  }

  for (const file of deepDiveFiles) {
    const slug = file.replace(/\.(en|fr|nl)\.json$/, '');
    if (slug !== file && !linked.has(slug)) {
      console.warn(`  ! ${file} exists but nothing links to "${slug}" — it will not be prerendered`);
    }
  }

  if (errors.length > 0) {
    console.error('Data validation failed:\n  - ' + errors.join('\n  - '));
    process.exit(1);
  }

  const counts = languages
    .map((lang) => {
      const companies = cvs[lang].experience.length;
      const roles = cvs[lang].experience.reduce((n, c) => n + c.roles.length, 0);
      return `${lang}:${companies}c/${roles}r`;
    })
    .join(' ');
  console.log(`  ✔ data consistent across locales (experience ${counts}, ${linked.size} deep dives)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
