import { PrettyUrlPipe } from './pretty-url-pipe';

describe('PrettyUrlPipe', () => {
  const pipe = new PrettyUrlPipe();

  it('strips the scheme, a www prefix and a trailing slash', () => {
    expect(pipe.transform('https://www.example.com/path/')).toBe('example.com/path');
  });

  it('decodes percent-escaped characters so accented slugs read normally', () => {
    expect(pipe.transform('https://www.linkedin.com/in/mika%C3%ABl-lenaertz-7945b065/')).toBe(
      'linkedin.com/in/mikaël-lenaertz-7945b065',
    );
  });

  it('falls back to the raw string when the escapes are malformed', () => {
    expect(pipe.transform('https://example.com/%E0%A4%A')).toBe('example.com/%E0%A4%A');
  });
});
