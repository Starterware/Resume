/** The three locales the site ships. Everything else derives from this list. */
export const LANGUAGES = ['en', 'fr', 'nl'] as const;
export type Lang = (typeof LANGUAGES)[number];

/** Locale used when a requested one is unsupported or a translation is missing. */
export const DEFAULT_LANG: Lang = 'en';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/**
 * Splits a full name on its last space.
 *
 * The PDF sets the family name in bold and the given name light, and the
 * downloaded file is named family-first, so both need the same split. A name
 * whose family part is more than one word would have to be split in the data
 * instead.
 */
export function splitName(full: string): { given: string; family: string } {
  const cut = full.lastIndexOf(' ');
  return cut === -1
    ? { given: full, family: '' }
    : { given: full.slice(0, cut), family: full.slice(cut + 1) };
}

export interface Contact {
  email: string;
  /** This site's own repository. Shown on the website only, never on the PDF. */
  sourceCode: string;
  github: string;
  linkedin: string;
  /**
   * The published address of this CV. Rendered on the PDF only — that is the
   * copy which gets forwarded and needs to say where the live version lives;
   * the site itself has no reason to print its own URL.
   */
  website: string;
  /** Rendered on the PDF only. Leave empty to omit it everywhere. */
  phone: string;
}

export interface SpokenLanguage {
  code: string;
  name: string;
  level: string;
  /** Decorative: the language name sits beside it, so `alt` stays empty. */
  flag: Logo | null;
}

/**
 * One employer as the narrative tells it. The company, period and role are
 * repeated here rather than read from `experience` on purpose: the story frames
 * them differently — it treats both SWIFT roles as one continuous chapter, and
 * gives them a title the CV does not use.
 */
export interface NarrativeChapter {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  paragraphs: string[];
}

export interface Narrative {
  /** Where the interest started, before the first job. */
  intro: string[];
  chapters: NarrativeChapter[];
  /**
   * Where things stand now, after the last employer. It is the author speaking
   * again rather than another chapter, so the story page sets it off with a
   * rule instead of a heading.
   */
  closing: string[];
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  summary: string;
  /** Longer first-person prose about the career path; the summary in full. */
  narrative: Narrative;
  contact: Contact;
  spokenLanguages: SpokenLanguage[];
  /**
   * Shown on the website only, never on the PDF — a photo on a CV is expected
   * in some markets and a liability in others, and the PDF is the copy that
   * gets forwarded. `null` renders a reserved placeholder frame.
   */
  photo: Photo | null;
}

export interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Interface chrome, in `public/data/ui.<lang>.json`.
 *
 * It lives apart from the CV because it changes for different reasons: the CV
 * is content its owner edits, while these are labels that only move when the
 * interface itself does. `CvDataService` fetches both and hands components a
 * single `Cv`, so a template still reads `data.ui.…`.
 */
export interface UiStrings {
  downloadPdf: string;
  /**
   * Leading words of the saved PDF's file name, completed with the name of its
   * owner: `Curriculum vitae - Lenaertz Mikaël.pdf`.
   */
  pdfFileName: string;
  /** Label on the link to this site's own source. */
  sourceCode: string;
  /**
   * Accessible name for the row of style names below the sheet. The style
   * names themselves are proper nouns of the designs and stay in English.
   */
  styleSwitcher: string;
  backToCv: string;
  /** Lead-in above the row of deep-dive links on a role. */
  deepDiveCta: string;
  narrative: {
    cta: string;
    title: string;
    /** Heading above the employer-by-employer part of the story. */
    journey: string;
    /**
     * Warning that this locale's story is a quick, unreviewed translation.
     *
     * Empty means the story reads as written and no notice appears, which is
     * how the locale it was authored in is marked — the presence of text is the
     * switch, so retiring the warning is an edit to the data rather than to the
     * template. The key still has to exist in all three files: the validator
     * compares key sets, not values.
     */
    translationNotice: string;
  };
  translationFallback: string;
  present: string;
  notFoundTitle: string;
  notFoundBody: string;
  printedOn: string;
  /** Headings for the STAR structure of a deep dive. */
  deepDive: {
    situation: string;
    task: string;
    action: string;
    result: string;
    reflection: string;
    /** The questions an interviewer asks once the STAR answer is out. */
    followUps: {
      title: string;
      whyThisApproach: string;
      challenge: string;
      hardestBug: string;
      teamReaction: string;
      whatNext: string;
      differently: string;
      learned: string;
      aboutYourself: string;
      enjoyed: string;
    };
  };
  sections: {
    summary: string;
    experience: string;
    /** The longer form used on the PDF, matching the printed CV it ports. */
    workExperience: string;
    education: string;
    spokenLanguages: string;
  };
}

/**
 * Intrinsic dimensions travel with the source so `NgOptimizedImage` can reserve
 * the right box and never warn about a distorted aspect ratio — the logos have
 * very different shapes.
 */
export interface Logo {
  src: string;
  width: number;
  height: number;
  /** Describes the organisation, not the picture — hence usually empty. */
  alt: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

/**
 * A link from a role to one of its deep dives. The label is written per locale
 * in the CV file rather than read from the deep-dive file: the CV page would
 * otherwise have to fetch every deep dive just to render its links, and the
 * link wants a short teaser anyway, not the full heading.
 */
export interface RoleDeepDive {
  slug: string;
  label: string;
}

export interface Role {
  id: string;
  role: string;
  /** ISO year-month, e.g. "2023-01". */
  start: string;
  /** ISO year-month, or null while the role is current. */
  end: string | null;
  summary: string;
  highlights: string[];
  includeInPdf: boolean;
  /** Slugs resolved against public/data/deepdive/. */
  deepDives: RoleDeepDive[];
}

/**
 * One employer, with the roles held there.
 *
 * Roles nest under the company rather than sitting flat so that two positions
 * at the same employer read as a progression instead of two unrelated jobs.
 * Dates stay on the role and are deliberately not aggregated into a company
 * span — that would paper over any gap between them.
 */
export interface ExperienceEntry {
  id: string;
  company: string;
  location: string;
  /** The employer's own site; the name links to it. */
  url: string;
  logo: Logo | null;
  roles: Role[];
  /**
   * Grouped per employer rather than per role: the technologies belong to the
   * company's stack, and repeating them under each role at one employer padded
   * the page without adding information.
   */
  skills: SkillGroup[];
}

export interface Degree {
  id: string;
  degree: string;
  start: string;
  end: string;
  /** Specialisation, thesis title, and the like. */
  notes: string[];
  includeInPdf: boolean;
}

/**
 * One institution, with the degrees taken there — the same shape as
 * `ExperienceEntry`, so two degrees at one university read as a progression
 * rather than repeating the institution's name twice.
 */
export interface EducationEntry {
  id: string;
  institution: string;
  location: string;
  /** The institution's own site; the name links to it. */
  url: string;
  logo: Logo | null;
  degrees: Degree[];
}

/** The contents of one `cv.<lang>.json`. */
export interface CvDocument {
  meta: { lang: Lang; updated: string };
  profile: Profile;
  experience: ExperienceEntry[];
  education: EducationEntry[];
}

/**
 * What a page receives: the CV document with its locale's interface strings
 * attached. The two are separate files but always travel together, so joining
 * them in the service keeps every component reading one object.
 */
export type Cv = CvDocument & { ui: UiStrings };
