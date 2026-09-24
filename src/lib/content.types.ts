/**
 * Typed shape of all localized site content. One interface, two
 * implementations (content.en.ts, content.fr.ts), resolved by getContent().
 *
 * Discipline carries across languages: every claim here is either verifiable
 * or held back. No invented numbers, links, or affiliations. House style: no
 * em dashes in any copy, EN or FR.
 */

export interface NavSection {
  readonly id: string;
  readonly label: string;
}

export interface Link {
  readonly label: string;
  readonly href: string;
}

export interface CaseStudy {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly role: string;
  readonly period: string;
  readonly stack: readonly string[];
  /** One line, used as the lede. */
  readonly summary: string;
  /** Labelled narrative blocks: the problem, the work, the result. */
  readonly body: readonly { readonly h: string; readonly p: string }[];
  /** Verified, live links only. */
  readonly links?: readonly Link[];
  /** Shown verbatim on the page, an honest caveat, not a placeholder. */
  readonly caveat?: string;
}

export interface MoreWorkItem {
  readonly name: string;
  readonly blurb: string;
  /** A live or public link; omitted when there's nothing honest to point at yet. */
  readonly href?: string;
  readonly hrefLabel?: string;
  /** Shown when there is no link (e.g. "in maintenance"). */
  readonly noLinkLabel?: string;
}

export interface Domain {
  readonly title: string;
  readonly blurb: string;
  readonly items: readonly string[];
  /** Anchors to the case study that demonstrates it. */
  readonly provenBy: { readonly label: string; readonly id: string };
}

export interface TimelineEntry {
  readonly when: string;
  readonly what: string;
  readonly where: string;
}

export interface Availability {
  readonly headline: string;
  readonly detail: string;
  /** A short directive above the email, e.g. "The fastest way to reach me". */
  readonly cta: string;
  /** Label for the low-friction contact button, e.g. "Get in touch". */
  readonly contactLabel: string;
  /** Pre-filled subject for the contact mailto. */
  readonly mailSubject: string;
}

/** The full localized content payload for one language. */
export interface SiteContent {
  readonly sections: readonly NavSection[];
  readonly caseStudies: readonly CaseStudy[];
  readonly moreWork: readonly MoreWorkItem[];
  readonly expertise: readonly Domain[];
  readonly about: readonly string[];
  readonly timeline: readonly TimelineEntry[];
  readonly availability: Availability;
}
