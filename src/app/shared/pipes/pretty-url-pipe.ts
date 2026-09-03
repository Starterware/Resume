import { Pipe, PipeTransform } from '@angular/core';

/**
 * Renders a URL the way it should read on paper: no scheme, no `www.`, no
 * trailing slash, and percent-escapes decoded — a LinkedIn slug containing an
 * accent arrives as `mika%C3%ABl-lenaertz`, which is unreadable in a printed
 * contact line.
 *
 * The result is display text, not a link target; `href` bindings keep the
 * original URL.
 */
@Pipe({ name: 'prettyUrl' })
export class PrettyUrlPipe implements PipeTransform {
  transform(url: string): string {
    let text = url;

    try {
      text = decodeURI(url);
    } catch {
      // Malformed escapes: show the raw URL rather than failing the render.
    }

    return text
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  }
}
