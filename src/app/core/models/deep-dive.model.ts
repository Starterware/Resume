import { Lang } from './cv.model';

/** Each field is a list of paragraphs; an action often has more than one. */
export interface StarAnswer {
  situation: string[];
  task: string[];
  action: string[];
  result: string[];
}

export interface DeepDive {
  slug: string;
  lang: Lang;
  title: string;
  /** The behavioural question this answer responds to. */
  question: string;
  /** Id of the ExperienceEntry this story belongs to. */
  experienceId: string;
  tags: string[];
  star: StarAnswer;
  /**
   * Answers to the follow-ups interviewers ask by name once the STAR answer is
   * out. Optional: an older story may not have them.
   */
  whyThisApproach?: string[];
  challenge?: string[];
  hardestBug?: string[];
  teamReaction?: string[];
  whatNext?: string[];
  differently?: string[];
  /** Technical takeaways, as opposed to what the story taught about you. */
  learned?: string[];
  aboutYourself?: string[];
  enjoyed?: string[];
}

/**
 * A deep dive plus whether it is actually in the requested language.
 * `fallback` is true when the locale file was missing and English was served
 * instead, which the page surfaces as a notice.
 */
export interface LoadedDeepDive {
  content: DeepDive;
  requestedLang: Lang;
  fallback: boolean;
}
