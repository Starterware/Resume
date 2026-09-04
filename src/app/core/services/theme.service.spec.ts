import { THEMES, themeClass } from '../models/theme.model';
import { ThemeService } from './theme.service';

describe('ThemeService.resolve', () => {
  it('recognises every shipped theme', () => {
    for (const theme of THEMES) {
      expect(ThemeService.resolve(theme)).toBe(theme);
    }
  });

  it('ignores case and surrounding whitespace, which URLs pick up easily', () => {
    expect(ThemeService.resolve('MIAMI')).toBe('miami');
    expect(ThemeService.resolve(' nature ')).toBe('nature');
  });

  it('falls back to the ordinary site for anything else', () => {
    expect(ThemeService.resolve('vice')).toBe('default');
    expect(ThemeService.resolve('')).toBe('default');
    expect(ThemeService.resolve(null)).toBe('default');
    expect(ThemeService.resolve(undefined)).toBe('default');
  });
});

describe('themeClass', () => {
  it('gives the default look no class of its own', () => {
    expect(themeClass('default')).toBeNull();
  });

  it('names the others after themselves', () => {
    expect(themeClass('nature')).toBe('theme-nature');
    expect(themeClass('medieval')).toBe('theme-medieval');
    expect(themeClass('miami')).toBe('theme-miami');
  });
});
