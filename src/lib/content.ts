/**
 * Site content as typed data. One source of truth per language; sections
 * render from the localized payload returned by getContent().
 *
 * Discipline: every claim here is either verifiable or held back. No invented
 * numbers, links, or affiliations. House style: no em dashes in any copy.
 */
import type { Locale } from "./i18n";
import type { SiteContent } from "./content.types";
import { en } from "./content.en";
import { fr } from "./content.fr";
import { withFrenchSpacing, withEnglishTypography } from "./french-spacing.mjs";

export type {
  NavSection,
  Link,
  CaseStudy,
  MoreWorkItem,
  TimelineEntry,
  Availability,
  SiteContent,
} from "./content.types";

const CONTENT: Record<Locale, SiteContent> = {
  en: withEnglishTypography(en),
  fr: withFrenchSpacing(fr),
};

/** Resolve the full content payload for a locale. */
export function getContent(locale: Locale): SiteContent {
  return CONTENT[locale];
}
