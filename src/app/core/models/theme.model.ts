/**
 * The alternate looks the website can wear, beyond the steel-and-paper one it
 * was designed in.
 *
 * They exist only on the website: the PDF is the copy that gets forwarded to a
 * recruiter and stays deliberately plain, so no theme ever reaches it.
 */
export const THEMES = ['default', 'nature', 'medieval', 'miami'] as const;
export type ThemeId = (typeof THEMES)[number];

/** The look the site ships in — the one with no stylesheet of its own. */
export const DEFAULT_THEME: ThemeId = 'default';

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/**
 * The class a theme's stylesheet hangs off, applied to `<html>` — the root
 * element, so that a theme can restate the root font size and carry every
 * `rem` in the app with it.
 *
 * `default` has none: it is the site's own cascade, so a theme is always an
 * addition rather than one of four mutually exclusive skins, and a failure to
 * apply any class leaves a working page rather than an unstyled one.
 */
export function themeClass(theme: ThemeId): string | null {
  return theme === DEFAULT_THEME ? null : `theme-${theme}`;
}

/**
 * Web fonts per theme, requested at the moment the theme is switched on rather
 * than from `index.html` — a visitor who never touches the picker asks Google
 * for nothing. Only the families each theme uses, at the weights it uses.
 *
 * Every stack in the stylesheets names a real fallback, so a blocked or slow
 * request degrades the look instead of collapsing the page.
 */
export const THEME_FONTS: Record<ThemeId, string | null> = {
  default: null,
  nature:
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700' +
    '&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap',
  medieval:
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700' +
    '&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap',
  miami:
    'https://fonts.googleapis.com/css2?family=Anton&family=Barlow:ital,wght@0,400;0,600;1,400' +
    '&family=Kanit:ital,wght@1,800&family=Share+Tech+Mono&display=swap',
};
