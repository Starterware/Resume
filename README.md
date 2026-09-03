# CV

A trilingual (EN / FR / NL) CV site, statically pre-rendered with Angular and
deployed to GitHub Pages. Content lives in JSON; the website and the downloadable
PDFs are both generated from it.

Live at <https://starterware.github.io/Resume/>.

## Why it is built this way

**No backend.** The JSON files under `public/data/` *are* the API — a
`GET /data/cv.fr.json` against a CDN is the same HTTP call a server would answer,
minus the hosting bill and the uptime risk. All data access goes through
`CvDataService`, so swapping in a real API later means changing one provider.

**No i18n framework.** Nearly all the text on the page is CV content, which is
already per-locale JSON. The handful of interface labels sit beside it in
`ui.<lang>.json`, kept apart from the CV because they change for different
reasons — one is content its owner edits, the other is chrome that moves when
the interface does. `CvDataService` fetches both and hands pages one object.
Locale is the first URL segment, so switching language is a navigation and
every page is independently linkable.

**Everything is pre-rendered.** GitHub Pages has no rewrite rules, so a URL with
no file behind it is a hard 404. `npm run build` therefore generates one HTML
file per route and then *verifies* that every expected route exists, failing the
build if one is missing. Deep-dive routes are derived from the CV data itself
(`getPrerenderParams` in `app.routes.server.ts`), so adding a slug to a
`deepDives` array is enough to get a page.

**PDFs are built, not generated on demand.** After the build, Playwright prints
the `/:lang/print` routes to `pdf/cv-{lang}.pdf`. The download button is a plain
static link. The PDF and the site can never drift apart because both come from
the same JSON through the same components — and there is no server rendering
PDFs at request time.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Dev server on <http://localhost:4200> |
| `npm test` | Unit tests (Vitest) |
| `npm run validate` | Check the three locale files against each other |
| `npm run build` | Validate, prerender all routes, then verify none are missing |
| `npm run pdf` | Render the three PDFs (requires a build first) |
| `npm run build:full` | `build` + `pdf` — what CI runs |
| `npm run preview` | Serve `dist/` with GitHub Pages' exact semantics |

`npm run preview` is worth using before pushing: it resolves directory URLs to
`index.html` and returns a real 404 for anything missing, so a broken deep link
shows up locally instead of in production.

## Editing content

Everything a reader sees is in `public/data/`:

```
public/data/
  cv.en.json  cv.fr.json  cv.nl.json     the CV itself
  ui.en.json  ui.fr.json  ui.nl.json     interface labels, joined to the above
  deepdive/
    aws-lambda-managed-instances.en.json     lazy-loaded per route
    silent-failure-bug.en.json
    swift-load-testing-stack.en.json
    intergraph-soundex-optimisation.en.json
```

`experience` is a list of employers, each holding a `roles` array, so two
positions at one company read as a progression rather than two unrelated jobs.
Deep dives reference *role* ids. Each employer carries its own grouped
`skills`, rendered as the tinted panel at the foot of its card.

The three CV files share a schema (typed in `src/app/core/models/cv.model.ts`).
Their `id` values must stay identical across languages, since ids drive routing —
`npm run validate` enforces that, along with matching keys across the three
`ui` files and the existence of every linked deep dive. It runs as the first step of `npm run build`, so drift
fails the build instead of quietly producing a broken page.

`profile.contact.phone` and `profile.contact.email` are rendered on the PDF
only, never on the web page — the site links to GitHub instead. Since the PDF is
publicly downloadable, that is a matter of degree rather than real privacy:
clear either field if you would rather it not exist anywhere.

Spoken languages appear with flags in the header's contact strip, sourced from
`profile.spokenLanguages[].flag`. The PDF lists them as text under Languages,
without flags.

`profile.photo` is the reverse — website only, never on the PDF, because a photo
is expected on a CV in some markets and a liability in others, and the PDF is the
copy that gets forwarded. It is `null`, which renders a reserved placeholder so
the header does not reflow when you fill it. To add one, drop the file in
`public/images/` and set:

```json
"photo": { "src": "images/me.jpg", "width": 400, "height": 400, "alt": "" }
```

A square source works best; it is cropped with `object-fit: cover`. Leave `alt`
empty — the name sits right beside it, so describing the photo again is noise
for a screen reader.

`includeInPdf` controls what reaches the PDF. The web version can afford to be
long; the PDF should stay at one or two pages, so set it to `false` on anything
that is nice-to-have.

### Adding a deep dive

1. Write `public/data/deepdive/<slug>.en.json`.
2. Add `"<slug>"` to the `deepDives` array of the relevant experience entry, in
   **all three** CV files.
3. Translate into `<slug>.fr.json` and `<slug>.nl.json` when you get to it.

Step 3 is genuinely optional. A missing translation falls back to English with a
notice on the page, so a story can go live as soon as one language is ready
rather than waiting for all three. Every deep dive is currently English-only, so
`/fr/deep-dive/intergraph-soundex-optimisation` shows that behaviour in action.

The four deep dives are scaffolds, not finished answers. Their titles, questions
and `situation` sections are drawn from the CV; the `task`, `action` and
`reflection` sections are marked `TODO` because they are yours to write — an
invented story is one you would have to defend in an interview.

## Deploying

Push to `main`. The workflow in `.github/workflows/deploy.yml` runs the tests,
builds, generates the PDFs and publishes to Pages.

One-time setup: **Settings → Pages → Source → GitHub Actions**.

Pages serves a project repository from a sub-path, so the production build sets
`"baseHref": "/Resume/"` in `angular.json` and every asset reference is written
relative to it — never `/images/…`, which would resolve against the domain root
and 404. `tools/static-server.mjs` reads that same `baseHref` and strips the
prefix, so `npm run preview` and the PDF generator see what Pages serves.

Renaming the repository therefore means changing `baseHref` to match. A repo
named `Starterware.github.io`, or a custom domain, serves from the root: set
`baseHref` to `/` and the sub-path handling drops out on its own.

## Project layout

```
src/app/
  core/
    models/       schema types shared by every component
    routing/      locale guard and the data resolvers
    services/     data access, language state
    tokens/       DATA_LOADER — the seam a real API would plug into
  features/       one folder per route
  shared/         presentational components and pipes
tools/            build-time scripts (PDF, verification, preview server)
```

The data loader has two implementations because the same code runs in two
places: `ServerDataLoader` reads from disk while pre-rendering,
`BrowserDataLoader` fetches over HTTP at runtime. Whatever the prerender reads
is written into `TransferState`, so a visitor's browser makes no data request at
all for the page they landed on.
