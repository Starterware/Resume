import { MonthYearPipe } from './month-year-pipe';

describe('MonthYearPipe', () => {
  const pipe = new MonthYearPipe();

  it('formats an ISO year-month in the requested locale', () => {
    expect(pipe.transform('2023-01', 'en')).toBe('January 2023');
    expect(pipe.transform('2023-01', 'fr')).toBe('janvier 2023');
    expect(pipe.transform('2023-01', 'nl')).toBe('januari 2023');
  });

  it('uses the fallback for an open-ended date', () => {
    expect(pipe.transform(null, 'fr', "Aujourd'hui")).toBe("Aujourd'hui");
    expect(pipe.transform(undefined, 'en', 'Present')).toBe('Present');
  });

  it('returns an empty string when no fallback is supplied', () => {
    expect(pipe.transform(null, 'en')).toBe('');
  });

  it('passes through a value it cannot parse rather than rendering NaN', () => {
    expect(pipe.transform('not-a-date', 'en')).toBe('not-a-date');
  });

  it('does not shift the month across a timezone boundary', () => {
    // Naive parsing of "2023-01" in a negative-offset timezone lands in
    // December, which is why the pipe builds the date in UTC.
    expect(pipe.transform('2023-01', 'en')).toContain('2023');
    expect(pipe.transform('2023-12', 'en')).toBe('December 2023');
  });
});
