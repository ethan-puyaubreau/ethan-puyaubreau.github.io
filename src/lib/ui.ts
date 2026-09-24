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
  readonly uptime: string;
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
  /** Keyed by section id (work, expertise, about, contact). */
  readonly sectionHeads: Record<string, SectionCopy>;
  // Component labels.
  readonly stackLabel: string;
  readonly provenBy: string;
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
      ledeBeforeLink:
        "I build high-performance computing tools, and I run the infrastructure that ships them: GPU energy measurement for ",
      ledeLinkLabel: "Kokkos",
      ledeAfterLink:
        " at Oak Ridge, HPC for nuclear simulation at EDF, and a five-node cluster running about 20 services in production, operated end to end from Docker to CI/CD.",
      figureLabel:
        "GPU power over time for two ArborX DBSCAN implementations on an NVIDIA H100 NVL. Both plateau near 300 watts for the same duration; fdbscan uses 925 joules and fdbscan-dense 785 joules.",
      figureCaption:
        "Two ArborX DBSCAN implementations on an NVIDIA H100 NVL: same result, same runtime. The shaded area is the energy.",
      figureLinkLabel: "From the SMC 2025 poster",
      figureLinkHref: "https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/",
    },
    sectionHeads: {
      work: {
        title: "Things I built",
      },
      expertise: {
        title: "By domain",
        intro: "Five areas, each tied to the project where I used it.",
      },
      about: { title: "Background" },
      contact: { title: "The short version" },
    },
    stackLabel: "Stack",
    provenBy: "Used in",
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
      tagsLabel: "Tags",
      authorTagline:
        "HPC & infrastructure engineer; Graduate Research Fellow at Oak Ridge National Laboratory in 2025.",
      authorAvailable: "Open to HPC and infrastructure roles from January 2027.",
      contactCta: "Get in touch",
      talkHead: "Questions, corrections, or work: my address is below.",
    },
    homelabStatus: {
      heading: "the cluster, a snapshot",
      nodes: "nodes",
      guests: "guests",
      cpu: "CPU",
      mem: "memory",
      uptime: "uptime",
      caption: "A snapshot from the cluster's own Proxmox API, captured at build time.",
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
      ledeBeforeLink:
        "Je construis des outils de calcul haute performance, et j'exploite l'infrastructure qui les met en production : la mesure d'énergie GPU pour ",
      ledeLinkLabel: "Kokkos",
      ledeAfterLink:
        " à Oak Ridge, le HPC pour la simulation nucléaire chez EDF, et un cluster de cinq nœuds qui fait tourner une vingtaine de services en production, exploité de bout en bout, de Docker à la CI/CD.",
      figureLabel:
        "Puissance GPU dans le temps pour deux implémentations de DBSCAN d'ArborX sur un NVIDIA H100 NVL. Les deux plafonnent autour de 300 watts pendant la même durée ; fdbscan consomme 925 joules et fdbscan-dense 785 joules.",
      figureCaption:
        "Deux implémentations de DBSCAN d'ArborX sur un NVIDIA H100 NVL : même résultat, même durée. L'aire colorée, c'est l'énergie.",
      figureLinkLabel: "Tiré du poster SMC 2025",
      figureLinkHref: "https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/",
    },
    sectionHeads: {
      work: {
        title: "Ce que j'ai construit",
      },
      expertise: {
        title: "Par domaine",
        intro: "Cinq domaines, chacun relié au projet où je l'ai pratiqué.",
      },
      about: { title: "Parcours" },
      contact: { title: "La version courte" },
    },
    stackLabel: "Technologies",
    provenBy: "Utilisé sur",
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
      indexTitle: "Notes techniques",
      indexIntro:
        "Des articles sur le HPC, le calcul GPU, l'infrastructure, et les projets derrière.",
      metaDescription:
        "Des articles sur le calcul haute performance, le calcul GPU, l'infrastructure, et les projets derrière, par Ethan Puyaubreau.",
      empty: "Pas encore d'articles. Revenez bientôt.",
      backToIndex: "Tous les articles",
      seeAll: "Lire tous les articles",
      readArticle: "Lire",
      published: "Publié le",
      tagsLabel: "Étiquettes",
      authorTagline:
        "Ingénieur HPC et infrastructure ; Graduate Research Fellow à l'Oak Ridge National Laboratory en 2025.",
      authorAvailable: "Ouvert aux postes HPC et infrastructure dès janvier 2027.",
      contactCta: "Me contacter",
      talkHead: "Questions, corrections ou propositions : mon adresse est en dessous.",
    },
    homelabStatus: {
      heading: "le cluster, un instantané",
      nodes: "nœuds",
      guests: "invités",
      cpu: "CPU",
      mem: "mémoire",
      uptime: "uptime",
      caption: "Un instantané de l'API Proxmox du cluster, capturé au moment du build.",
      asOf: "au",
    },
  },
};

/** Resolve the UI chrome strings for a locale. */
const SPACED: Record<Locale, UIStrings> = { en: STRINGS.en, fr: withFrenchSpacing(STRINGS.fr) };

export function getUI(locale: Locale): UIStrings {
  return SPACED[locale];
}
