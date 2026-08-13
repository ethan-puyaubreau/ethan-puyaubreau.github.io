/**
 * Central site facts. Single source of truth so copy stays consistent.
 * Locale-invariant facts (name, email, url, location) live in `site`; the
 * strings that read as prose (role, positioning) are localized via
 * getSiteCopy(). Nothing here is invented. House style: no em dashes.
 */
import type { Locale } from "./i18n";
import { SITE_ORIGIN } from "../../site.config.mjs";

export const site = {
  name: "Ethan Puyaubreau",
  url: SITE_ORIGIN,
  email: "ethan.puyaubreau@gmail.com",
  location: "Paris, France",
} as const;

export interface SiteCopy {
  /** Job title, used as hero kicker, OG role, and JSON-LD jobTitle. */
  readonly role: string;
  /** One-line positioning, used on the OG card. */
  readonly positioning: string;
}

const SITE_COPY: Record<Locale, SiteCopy> = {
  en: {
    role: "High-performance computing & infrastructure engineer",
    positioning: "From the GPU kernel to the cluster in production.",
  },
  fr: {
    role: "Ingénieur calcul haute performance et infrastructure",
    positioning: "Du calcul GPU au cluster en production.",
  },
};

/** Localized prose facts (role, positioning). */
export function getSiteCopy(locale: Locale): SiteCopy {
  return SITE_COPY[locale];
}

export interface ExternalLink {
  readonly label: string;
  readonly href: string;
  /** false until verified; unverified links are not rendered. */
  readonly confirmed: boolean;
}

export const links: readonly ExternalLink[] = [
  { label: "GitHub", href: "https://github.com/ethan-puyaubreau", confirmed: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ethan-puyaubreau/", confirmed: true },
  { label: "ORCID", href: "https://orcid.org/0009-0003-1770-8830", confirmed: true },
  {
    label: "Google Scholar",
    href: "https://scholar.google.com/citations?user=VH9ZyxYAAAAJ",
    confirmed: true,
  },
];

/** Real, public external references (institutions/projects) — not affiliations claimed falsely. */
export const refs = {
  kokkos: "https://github.com/kokkos/kokkos",
  kokkosTools: "https://github.com/kokkos/kokkos-tools",
  ornl: "https://www.ornl.gov",
  osti: "https://www.osti.gov/biblio/3016977",
  orcid: "https://orcid.org/0009-0003-1770-8830",
  edf: "https://www.edf.fr",
  polytech: "https://www.polytech.universite-paris-saclay.fr",
} as const;
