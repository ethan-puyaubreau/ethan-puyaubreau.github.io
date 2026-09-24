/**
 * UI chrome strings: the literal copy that lives in components and pages rather
 * than in the content data (hero, section headers, footer, 404, meta
 * defaults, language switch). One typed shape per locale.
 *
 * House style: no em dashes anywhere, EN or FR. Voice stays dry and precise.
 */
import type { Locale } from "./i18n";
import { withFrenchSpacing } from "./french-spacing.mjs";

export interface HeroStrings {
  readonly title: string;
  /** Place and availability, next to the role above the title. */
  readonly availability: string;
  /** Lede split around the inline Kokkos link. */
  readonly ledeBeforeLink: string;
  readonly ledeLinkLabel: string;
  readonly ledeAfterLink: string;
  /** The measured power traces under the title. */
  readonly figureLabel: string;
  readonly figureCaption: string;
  readonly figureLinkLabel: string;
  readonly figureLinkHref: string;
}

export interface SectionCopy {
  readonly title: string;
  readonly intro?: string;
}

export interface BlogStrings {
  readonly kicker: string;
  readonly indexTitle: string;
  readonly indexIntro: string;
  readonly metaDescription: string;
  readonly empty: string;
  readonly backToIndex: string;
  /** Action-verb CTA under the home "writing" teaser. */
  readonly seeAll: string;
  readonly readArticle: string;
  /** Precedes the formatted date, e.g. "Published". */
  readonly published: string;
  readonly updated: string;
  /** aria-label for the tag list on a post. */
  readonly tagsLabel: string;
  /** Author card at the foot of a post. */
  readonly authorTagline: string;
  readonly authorAvailable: string;
  readonly contactCta: string;
  /** Call to action closing the blog index. */
  readonly talkHead: string;
}

export interface UIStrings {
  readonly skipToContent: string;
  /** Default <title> and meta description for the layout. */
  readonly metaDescription: string;
  /** Shared subject for sitewide contact mailto links. */
  readonly contactMailSubject: string;
  readonly hero: HeroStrings;
  /** Keyed by section id (work, about, contact). */
  readonly sectionHeads: Record<string, SectionCopy>;
  // Component labels.
  readonly stackLabel: string;
  readonly moreWorkHead: string;
  readonly moreWorkLabel: string;
  readonly cv: string;
  readonly cvKind: string;
  readonly colophon: string;
  readonly footerCommit: string;
  readonly footerBuilt: string;
  readonly footerBuildLabel: string;
  readonly sectionsLabel: string;
  readonly homeLabel: string;
  readonly timelineLabel: string;
  // Language switch.
  readonly langSwitchLabel: string;
  readonly langName: Record<Locale, string>;
  readonly langSwitchTo: Record<Locale, string>;
  // 404.
  readonly notFoundLede: string;
  readonly notFoundBack: string;
  readonly notFoundTitle: string;
  readonly notFoundDescription: string;
  // Blog.
  readonly blog: BlogStrings;
  // Islands (passed as props).
}

const STRINGS: Record<Locale, UIStrings> = {
  en: {
    skipToContent: "Skip to content",
    metaDescription:
      "Research software engineer in high-performance computing. Open-source GPU energy tooling for Kokkos at Oak Ridge, tested on Frontier; performance tooling for nuclear simulation at EDF; a five-node cluster I run with CI/CD.",
    contactMailSubject: "Research software engineer role: getting in touch (available Jan 2027)",
    hero: {
      title: "I build research software that measures what scientific computing costs.",
      availability: "Paris-Saclay · engineering degree 2026 · available from January 2027",
      ledeBeforeLink: "Open-source energy tooling for ",
      ledeLinkLabel: "Kokkos",
      ledeAfterLink:
        ", built at Oak Ridge National Laboratory and tested on Frontier, and three years of performance tooling for a nuclear reactor simulation code at EDF.",
      figureLabel:
        "GPU power over time for two ArborX DBSCAN implementations on an NVIDIA H100 NVL, aligned on the start of the DBSCAN computation. fdbscan runs for 2.68 seconds and uses 769 joules; fdbscan-dense runs for 2.20 seconds and uses 569 joules.",
      figureCaption:
        "One run of each ArborX DBSCAN implementation on an NVIDIA H100 NVL, same result. The shaded area is the energy of the DBSCAN computation. Over 64 runs each, the dense one takes 19% less time and 25% less energy (medians).",
      figureLinkLabel: "How it was measured",
      figureLinkHref: "/blog/kokkos-gpu-energy",
    },
    sectionHeads: {
      work: {
        title: "Work",
      },
      about: { title: "Background" },
      contact: { title: "Contact" },
    },
    stackLabel: "Stack",
    moreWorkHead: "Other projects",
    moreWorkLabel: "More work",
    cv: "CV",
    cvKind: "PDF",
    colophon: "Built with Astro + Vue, shipped to GitHub Pages. No trackers.",
    footerCommit: "commit",
    footerBuilt: "built",
    footerBuildLabel: "Build",
    sectionsLabel: "Sections",
    homeLabel: "home",
    timelineLabel: "Timeline",
    langSwitchLabel: "Language",
    langName: { en: "EN", fr: "FR" },
    langSwitchTo: { en: "View in English", fr: "Voir en français" },
    notFoundLede: "This page does not exist, or it has moved.",
    notFoundBack: "Back to the home page",
    notFoundTitle: "404",
    notFoundDescription: "Page not found.",
    blog: {
      kicker: "Writing",
      indexTitle: "Writing",
      indexIntro: "Write-ups on HPC, GPU computing, infrastructure, and the projects behind them.",
      metaDescription:
        "Write-ups on high-performance computing, GPU computing, infrastructure, and the projects behind them, by Ethan Puyaubreau.",
      empty: "No posts yet. Come back soon.",
      backToIndex: "All posts",
      seeAll: "Read all posts",
      readArticle: "Read",
      published: "Published",
      updated: "updated",
      tagsLabel: "Tags:",
      authorTagline:
        "Research software engineer in HPC; Graduate Research Fellow at Oak Ridge National Laboratory in 2025.",
      authorAvailable: "Open to research software engineer roles from January 2027.",
      contactCta: "Get in touch",
      talkHead: "Questions, corrections, or work: my address is below.",
    },
  },

  fr: {
    skipToContent: "Aller au contenu",
    metaDescription:
      "Ingénieur logiciel pour la recherche en calcul haute performance. Outils open source de mesure d'énergie GPU pour Kokkos à Oak Ridge, testés sur Frontier ; outillage de performance pour la simulation nucléaire chez EDF ; un cluster de cinq nœuds que j'exploite avec CI/CD.",
    contactMailSubject:
      "Poste d'ingénieur logiciel pour la recherche : prise de contact (dispo janv. 2027)",
    hero: {
      title:
        "Je développe des logiciels de recherche qui mesurent ce que coûte le calcul scientifique.",
      availability: "Paris-Saclay · diplômé en 2026 · disponible dès janvier 2027",
      ledeBeforeLink: "Des outils open source de mesure d'énergie pour ",
      ledeLinkLabel: "Kokkos",
      ledeAfterLink:
        ", développés à l'Oak Ridge National Laboratory et testés sur Frontier, et trois ans d'outillage de performance pour un code de simulation de réacteurs nucléaires chez EDF.",
      figureLabel:
        "Puissance GPU dans le temps pour deux implémentations de DBSCAN d'ArborX sur un NVIDIA H100 NVL, alignées sur le début du calcul DBSCAN. fdbscan tourne 2,68 secondes et consomme 769 joules ; fdbscan-dense tourne 2,20 secondes et consomme 569 joules.",
      figureCaption:
        "Une exécution de chaque implémentation de DBSCAN d'ArborX sur un NVIDIA H100 NVL, même résultat. L'aire colorée représente l'énergie consommée par le calcul DBSCAN. Sur 64 exécutions de chacune, la version dense prend 19 % de temps et 25 % d'énergie en moins (médianes).",
      figureLinkLabel: "Comment c'est mesuré",
      figureLinkHref: "/fr/blog/kokkos-gpu-energy",
    },
    sectionHeads: {
      work: {
        title: "Réalisations",
      },
      about: { title: "Parcours" },
      contact: { title: "Contact" },
    },
    stackLabel: "Technologies",
    moreWorkHead: "Autres projets",
    moreWorkLabel: "Autres travaux",
    cv: "CV",
    cvKind: "PDF",
    colophon: "Construit avec Astro + Vue, déployé sur GitHub Pages. Aucun traceur.",
    footerCommit: "commit",
    footerBuilt: "build",
    footerBuildLabel: "Build",
    sectionsLabel: "Sections",
    homeLabel: "accueil",
    timelineLabel: "Chronologie",
    langSwitchLabel: "Langue",
    langName: { en: "EN", fr: "FR" },
    langSwitchTo: { en: "View in English", fr: "Voir en français" },
    notFoundLede: "Cette page n'existe pas, ou elle a changé d'adresse.",
    notFoundBack: "Retour à l'accueil",
    notFoundTitle: "404",
    notFoundDescription: "Page introuvable.",
    blog: {
      kicker: "Articles",
      indexTitle: "Articles",
      indexIntro:
        "Des articles sur le HPC, le calcul GPU, l'infrastructure, et les projets derrière.",
      metaDescription:
        "Des articles sur le calcul haute performance, le calcul GPU, l'infrastructure, et les projets derrière, par Ethan Puyaubreau.",
      empty: "Pas encore d'articles. Revenez bientôt.",
      backToIndex: "Tous les articles",
      seeAll: "Lire tous les articles",
      readArticle: "Lire",
      published: "Publié le",
      updated: "mis à jour le",
      tagsLabel: "Étiquettes :",
      authorTagline:
        "Ingénieur logiciel pour la recherche en HPC ; Graduate Research Fellow à l'Oak Ridge National Laboratory en 2025.",
      authorAvailable: "Ouvert aux postes d'ingénieur logiciel pour la recherche dès janvier 2027.",
      contactCta: "Me contacter",
      talkHead: "Questions, corrections ou propositions : mon adresse est en dessous.",
    },
  },
};

/** Resolve the UI chrome strings for a locale. */
const SPACED: Record<Locale, UIStrings> = { en: STRINGS.en, fr: withFrenchSpacing(STRINGS.fr) };

export function getUI(locale: Locale): UIStrings {
  return SPACED[locale];
}
