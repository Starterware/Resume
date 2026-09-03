import { LanguageService } from './language.service';

describe('LanguageService.preferredFrom', () => {
  it('picks the first supported locale in the visitor preference order', () => {
    expect(LanguageService.preferredFrom(['nl-BE', 'fr-BE', 'en'])).toBe('nl');
    expect(LanguageService.preferredFrom(['fr-FR'])).toBe('fr');
  });

  it('ignores the region subtag', () => {
    expect(LanguageService.preferredFrom(['EN-GB'])).toBe('en');
  });

  it('skips unsupported locales rather than defaulting immediately', () => {
    expect(LanguageService.preferredFrom(['de-DE', 'es', 'nl'])).toBe('nl');
  });

  it('falls back to English when nothing matches', () => {
    expect(LanguageService.preferredFrom(['de', 'es'])).toBe('en');
    expect(LanguageService.preferredFrom([])).toBe('en');
  });
});
