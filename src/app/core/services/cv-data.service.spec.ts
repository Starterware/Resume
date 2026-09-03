import { TestBed } from '@angular/core/testing';
import { CvDataService } from './cv-data.service';
import { DataLoader, DATA_LOADER } from '../tokens/data-loader';

/** Serves only the paths it is given; everything else is a missing file. */
class StubLoader implements DataLoader {
  readonly requested: string[] = [];

  constructor(private readonly files: Record<string, unknown>) {}

  async loadJson<T>(relativePath: string): Promise<T | null> {
    this.requested.push(relativePath);
    return (this.files[relativePath] as T) ?? null;
  }
}

function serviceWith(files: Record<string, unknown>): {
  service: CvDataService;
  loader: StubLoader;
} {
  const loader = new StubLoader(files);
  TestBed.configureTestingModule({
    providers: [{ provide: DATA_LOADER, useValue: loader }],
  });
  return { service: TestBed.inject(CvDataService), loader };
}

describe('CvDataService', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads the CV for the requested locale', async () => {
    const { service } = serviceWith({ 'data/cv.fr.json': { meta: { lang: 'fr' } } });
    const cv = await service.loadCv('fr');
    expect(cv?.meta.lang).toBe('fr');
  });

  it('returns null when a locale has no CV file', async () => {
    const { service } = serviceWith({});
    expect(await service.loadCv('nl')).toBeNull();
  });

  it('serves a deep dive in its own language without flagging a fallback', async () => {
    const { service } = serviceWith({
      'data/deepdive/story.nl.json': { slug: 'story', lang: 'nl' },
    });
    const loaded = await service.loadDeepDive('story', 'nl');
    expect(loaded?.fallback).toBe(false);
    expect(loaded?.content.lang).toBe('nl');
  });

  it('falls back to English when the translation is missing', async () => {
    const { service } = serviceWith({
      'data/deepdive/story.en.json': { slug: 'story', lang: 'en' },
    });
    const loaded = await service.loadDeepDive('story', 'fr');
    expect(loaded?.fallback).toBe(true);
    expect(loaded?.requestedLang).toBe('fr');
    expect(loaded?.content.lang).toBe('en');
  });

  it('does not look for an English fallback when English was what failed', async () => {
    const { service, loader } = serviceWith({});
    expect(await service.loadDeepDive('story', 'en')).toBeNull();
    expect(loader.requested).toEqual(['data/deepdive/story.en.json']);
  });

  it('reports a dead slug as missing in every language', async () => {
    const { service } = serviceWith({});
    expect(await service.loadDeepDive('ghost', 'nl')).toBeNull();
  });
});
