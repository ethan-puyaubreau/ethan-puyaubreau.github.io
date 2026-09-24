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

export interface HomelabStatusStrings {
  readonly heading: string;
  readonly nodes: string;
  readonly guests: string;
  readonly cpu: string;
  readonly mem: string;
  readonly caption: string;
  readonly asOf: string;
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
  readonly homelabStatus: HomelabStatusStrings;
}

const STRINGS: Record<Locale, UIStrings> = {
  en: {
    skipToContent: "Skip to content",
    metaDescription:
      "High-performance computing and infrastructure engineer. GPU energy tooling for Kokkos at Oak Ridge, HPC for nuclear simulation at EDF, and a five-node cluster I run with Docker and CI/CD.",
    contactMailSubject: "HPC / infrastructure role: getting in touch (available Jan 2027)",
    hero: {
      title: "I measure what computing costs, and I run the machines it runs on.",
      availability: "Paris · engineering degree 2026 · available from January 2027",
      ledeBeforeLink: "GPU energy measurement for ",
      ledeLinkLabel: "Kokkos",
      ledeAfterLink:
        " at Oak Ridge National Laboratory, HPC tooling for nuclear simulation at EDF, and a five-node cluster I run in production myself.",
      figureLabel:
        "GPU power over time for two ArborX DBSCAN implementations on an NVIDIA H100 NVL, aligned on the start of the DBSCAN computation. fdbscan runs for 2.68 seconds and uses 769 joules; fdbscan-dense runs for 2.20 seconds and uses 569 joules.",
      figureCaption:
        "One run of each ArborX DBSCAN implementation on an NVIDIA H100 NVL, same result. The shaded area is the energy of the DBSCAN computation. Over 64 runs each, the dense one takes 19% less time and 25% less energy.",
      figureLinkLabel: "How it was measured",
      figureLinkHref: "/blog/kokkos-gpu-energy",
    },
    sectionHeads: {
      work: {
        title: "Things I built",
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
      tagsLabel: "Tags:",
      authorTagline:
        "HPC & infrastructure engineer; Graduate Research Fellow at Oak Ridge National Laboratory in 2025.",
      authorAvailable: "Open to HPC and infrastructure roles from January 2027.",
      contactCta: "Get in touch",
      talkHead: "Questions, corrections, or work: my address is below.",
    },
    homelabStatus: {
      heading: "The cluster, a snapshot",
      nodes: "nodes",
      guests: "VMs and containers",
      cpu: "CPU",
      mem: "memory",
      caption: "From the cluster's own Proxmox API, captured at build time",
      asOf: "as of",
    },
  },

  fr: {
    skipToContent: "Aller au contenu",
    metaDescription:
      "Ingénieur calcul haute performance et infrastructure. Outillage d'énergie GPU pour Kokkos à Oak Ridge, HPC pour la simulation nucléaire chez EDF, et un cluster de cinq nœuds que j'exploite avec Docker et CI/CD.",
    contactMailSubject: "Poste HPC / infrastructure : prise de contact (dispo janv. 2027)",
    hero: {
      title: "Je mesure ce que coûte le calcul, et j'exploite les machines qui le font tourner.",
      availability: "Paris · diplômé en 2026 · disponible dès janvier 2027",
      ledeBeforeLink: "Mesure d'énergie GPU pour ",
      ledeLinkLabel: "Kokkos",
      ledeAfterLink:
        " à l'Oak Ridge National Laboratory, outillage HPC pour la simulation nucléaire chez EDF, et un cluster de cinq nœuds que j'exploite moi-même en production.",
      figureLabel:
        "Puissance GPU dans le temps pour deux implémentations de DBSCAN d'ArborX sur un NVIDIA H100 NVL, alignées sur le début du calcul DBSCAN. fdbscan tourne 2,68 secondes et consomme 769 joules ; fdbscan-dense tourne 2,20 secondes et consomme 569 joules.",
      figureCaption:
        "Une exécution de chaque implémentation de DBSCAN d'ArborX sur un NVIDIA H100 NVL, même résultat. L'aire colorée représente l'énergie consommée par le calcul DBSCAN. Sur 64 exécutions de chacune, la version dense prend 19 % de temps et 25 % d'énergie en moins.",
      figureLinkLabel: "Comment c'est mesuré",
      figureLinkHref: "/fr/blog/kokkos-gpu-energy",
    },
    sectionHeads: {
      work: {
        title: "Ce que j'ai construit",
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
      kicker: "Écrits",
      indexTitle: "Écrits",
      indexIntro:
        "Des articles sur le HPC, le calcul GPU, l'infrastructure, et les projets derrière.",
      metaDescription:
        "Des articles sur le calcul haute performance, le calcul GPU, l'infrastructure, et les projets derrière, par Ethan Puyaubreau.",
      empty: "Pas encore d'articles. Revenez bientôt.",
      backToIndex: "Tous les articles",
      seeAll: "Lire tous les articles",
      readArticle: "Lire",
      published: "Publié le",
      tagsLabel: "Étiquettes :",
      authorTagline:
        "Ingénieur HPC et infrastructure ; Graduate Research Fellow à l'Oak Ridge National Laboratory en 2025.",
      authorAvailable: "Ouvert aux postes HPC et infrastructure dès janvier 2027.",
      contactCta: "Me contacter",
      talkHead: "Questions, corrections ou propositions : mon adresse est en dessous.",
    },
    homelabStatus: {
      heading: "Le cluster, un instantané",
      nodes: "nœuds",
      guests: "VM et conteneurs",
      cpu: "CPU",
      mem: "mémoire",
      caption: "Tiré de l'API Proxmox du cluster à la génération du site",
      asOf: "le",
    },
  },
};

/** Resolve the UI chrome strings for a locale. */
const SPACED: Record<Locale, UIStrings> = { en: STRINGS.en, fr: withFrenchSpacing(STRINGS.fr) };

export function getUI(locale: Locale): UIStrings {
  return SPACED[locale];
}
