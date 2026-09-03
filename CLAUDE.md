You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

---

## This project

A trilingual CV site, statically pre-rendered and deployed to GitHub Pages. See
`README.md` for the reasoning; the constraints that matter when changing code:

- **There is no backend.** `public/data/*.json` is the data source. All access
  goes through `CvDataService`, and file reads go through the `DATA_LOADER`
  token — never call `fetch` or `node:fs` from a component.
- **Two platforms, two loaders.** `ServerDataLoader` (disk, prerender-time) and
  `BrowserDataLoader` (HTTP, runtime). Anything importing `node:*` must be
  reachable only from `app.config.server.ts`, or it breaks the browser build.
- **The site is served from a sub-path.** GitHub Pages hosts the `Resume`
  repository at `/Resume/`, which the production build declares as `baseHref`.
  Asset references must be relative (`images/x.png`, `pdf/cv-en.pdf`) so they
  resolve against that base; a leading slash resolves against the domain root
  and 404s in production while looking fine on `ng serve`. Relative `url()` in
  a stylesheet only builds because `externalDependencies: ["images/*"]` stops
  esbuild trying to resolve it as a bundled file.
- **Every route must pre-render.** GitHub Pages cannot rewrite, so an
  unprerendered URL is a hard 404. New dynamic routes need a matching
  `getPrerenderParams` in `app.routes.server.ts`, and `tools/finalize-build.mjs`
  fails the build if a route is missing. Do not add a wildcard child route under
  `:lang` — it produces an unprerenderable `:lang/**` server route.
- **Route data reaches components as inputs** via `withComponentInputBinding()`
  and `paramsInheritanceStrategy: 'always'`. Pages declare `input.required<T>()`
  matching the resolver key; they do not inject `ActivatedRoute`.
- **The PDF is a separate component**, not a print stylesheet over the web page.
  `PrintPage` renders only entries with `includeInPdf: true`, laid out for A4.
  `tools/generate-pdfs.mjs` prints it with Playwright after the build.
- **Per-employer skills live on the company, not the role** (`experience[].skills`,
  a `SkillGroup[]`). Technology names stay in English in every locale; only the
  category label and soft-skill phrases are translated. The top-level `skills`
  array is separate and feeds the PDF only.
- **Section headings take an optional `icon`** — a path to a monochrome PNG used
  as a CSS mask, so it inherits the heading's accent colour instead of staying
  grey. Ordinary `<img>` would not recolour.
- **Experience and education are both two-level.** `experience[]` is employers
  each with `roles[]`; `education[]` is institutions each with `degrees[]`. Deep
  dives point at *role* ids, not company ids. Spans are deliberately not
  aggregated from the children — that would hide gaps.
- **The profile summary lives in the masthead** on the web, not in a section of
  its own; the PDF still renders it separately. The masthead is a grid, so
  anything placed in it must be a *direct* child — nesting an element inside
  `.masthead__identity` and giving it a `grid-area` silently does nothing.
- **Light text on the masthead gradient needs checking against the lighter
  gradient stop** (`#2d5678`), not against a computed `background-color` —
  gradients report a transparent colour, so naive contrast checks read through
  to the white sheet and report meaningless numbers. Element `opacity` and
  `rgba()` text alphas both dim text without changing `color`, so a contrast
  check has to composite them too. Prefer an explicit `rgba()` colour over
  `opacity` for text, so the dimming is at least visible in the declaration.
- **Never put a backtick in an inline `styles` or `template` literal** — a
  backtick in a CSS or HTML comment closes the template string, and the build
  fails with a confusing TypeScript error pointing inside the comment. Write
  `overflow: hidden`-style references without the backticks.
- **Logo corners are rounded on the `img`, not by clipping to the chip.**
  Clipping a replaced element to an ancestor's `border-radius` with
  `overflow: hidden` is unreliable across browsers; the image carries its own
  radius, one pixel smaller than the chip's so the curves stay concentric.
- **The three locale files must stay in sync.** `tools/validate-data.mjs` runs
  first in the build and fails on mismatched ids, mismatched `ui` keys, or a
  deep-dive slug with no English file. Adding an entry means adding it to all
  three CV files.
- **Interface strings live in the CV JSON** under `ui`. There is no translation
  library; adding user-visible text means adding a key to all three files and to
  the `UiStrings` type.
