/**
 * UI chrome strings: the literal copy that lives in components and pages rather
 * than in the content data (hero, section headers, footer, palette, hero
 * fallback, 404, meta defaults, language switch). One typed shape per locale.
 *
 * House style: no em dashes anywhere, EN or FR. Voice stays dry and precise.
 */
import type { Locale } from "./i18n";

export interface PaletteStrings {
  readonly trigger: string;
  readonly placeholder: string;
  /** Prefix for a section hint, e.g. "Section 01". */
  readonly sectionHint: string;
  readonly copyEmail: string;
  readonly opensNewTab: string;
  readonly noMatch: string;
  readonly dialogLabel: string;
  readonly closeLabel: string;
  /** Hint shown next to the Blog command. */
  readonly blogHint: string;
}

export interface HeroStrings {
  /** Title split so the emphasis lands on the right words per language. */
  readonly titleLead: string;
  readonly titleEm1: string;
  readonly titleMid: string;
  readonly titleEm2: string;
  readonly titleTail: string;
  /** Lede split around the inline Kokkos link. */
  readonly ledeBeforeLink: string;
  readonly ledeLinkLabel: string;
  readonly ledeAfterLink: string;
  readonly cue: string;
  /** Verifiable proof strip under the hero: institutions and a usage number. */
  readonly proof: string;
}

export interface SectionCopy {
  readonly title: string;
  readonly intro?: string;
}

export interface HeroFallbackStrings {
  readonly noWebgpu: string;
  readonly noAdapter: string;
  readonly noContext: string;
  readonly deviceLost: string;
  readonly canvasLabel: string;
  readonly posterLabel: string;
  readonly hudRender: string;
  readonly hudBodies: string;
  readonly hudGravity: string;
}

export interface HomelabStatusStrings {
  readonly heading: string;
  readonly nodes: string;
  readonly guests: string;
  readonly cpu: string;
  readonly mem: string;
  readonly uptime: string;
  readonly caption: string;
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
  /** Recruiter call to action closing the blog index. */
  readonly talkHead: string;
}

export interface UIStrings {
  readonly skipToContent: string;
  /** Default <title> and meta description for the layout. */
  readonly metaDescription: string;
  /** Shared recruiter-oriented subject for sitewide contact mailto links. */
  readonly contactMailSubject: string;
  readonly hero: HeroStrings;
  /** Keyed by section id (work, expertise, about, contact). */
  readonly sectionHeads: Record<string, SectionCopy>;
  // Component labels.
  readonly factRole: string;
  readonly factWhen: string;
  readonly flagship: string;
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
  readonly notFoundKicker: string;
  readonly notFoundLede: string;
  readonly notFoundBack: string;
  readonly notFoundTitle: string;
  readonly notFoundDescription: string;
  // Blog.
  readonly blog: BlogStrings;
  // Islands (passed as props).
  readonly palette: PaletteStrings;
  readonly heroFallback: HeroFallbackStrings;
  readonly homelabStatus: HomelabStatusStrings;
}

const STRINGS: Record<Locale, UIStrings> = {
  en: {
    skipToContent: "Skip to content",
    metaDescription:
      "High-performance computing and infrastructure engineer. GPU energy tooling for Kokkos at Oak Ridge, HPC for nuclear simulation at EDF, and a five-node cluster I run with Docker and CI/CD.",
    contactMailSubject: "HPC / infrastructure role: getting in touch (available Jan 2027)",
    hero: {
      titleLead: "From the ",
      titleEm1: "GPU kernel",
      titleMid: "to the ",
      titleEm2: "cluster",
      titleTail: " in production.",
      ledeBeforeLink:
        "I build high-performance computing tools, and I run the infrastructure that ships them: GPU energy measurement for ",
      ledeLinkLabel: "Kokkos",
      ledeAfterLink:
        " at Oak Ridge, HPC for nuclear simulation at EDF, and a five-node cluster running about 20 services in production, operated end to end from Docker to CI/CD.",
      cue: "Selected work",
      proof: "ORNL · EDF · 5-node production cluster",
    },
    sectionHeads: {
      work: {
        title: "Things I built, and what they cost",
        intro: "Case studies below, the flagship first.",
      },
      expertise: {
        title: "By domain",
        intro: "Five areas, and where each one actually got used.",
      },
      about: { title: "Polytech → EDF → Oak Ridge" },
      contact: { title: "The short version" },
    },
    factRole: "Role",
    factWhen: "When",
    flagship: "Flagship",
    stackLabel: "Stack",
    provenBy: "Used in",
    moreWorkHead: "Also on the bench",
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
    notFoundKicker: "/ signal lost",
    notFoundLede: "No body at these coordinates. The page drifted out of frame or never existed.",
    notFoundBack: "Back to the field",
    notFoundTitle: "404",
    notFoundDescription: "Page not found.",
    blog: {
      kicker: "Writing",
      indexTitle: "Notes from the bench",
      indexIntro: "Write-ups on HPC, GPU computing, infrastructure, and the projects behind them.",
      metaDescription:
        "Write-ups on high-performance computing, GPU computing, infrastructure, and the projects behind them, by Ethan Puyaubreau.",
      empty: "No posts yet. Come back soon.",
      backToIndex: "All posts",
      seeAll: "Read all posts",
      readArticle: "Read",
      published: "Published",
      tagsLabel: "Tags",
      authorTagline: "HPC & infrastructure engineer, ex-Oak Ridge National Laboratory.",
      authorAvailable: "Open to HPC and infrastructure roles from January 2027.",
      contactCta: "Get in touch",
      talkHead: "Questions, corrections, or work: my address is below.",
    },
    palette: {
      trigger: "Jump to",
      placeholder: "Jump to a section or link…",
      sectionHint: "Section",
      copyEmail: "Copy email address",
      opensNewTab: "Opens in a new tab",
      noMatch: "No match.",
      dialogLabel: "Command menu",
      closeLabel: "Close command menu",
      blogHint: "Read the blog",
    },
    heroFallback: {
      noWebgpu:
        "This galaxy runs on WebGPU, which your browser doesn't expose yet. Chrome, Edge, or Safari 18+ will render it live.",
      noAdapter: "No WebGPU adapter is available here (typically a locked-down or headless GPU).",
      noContext: "Couldn't acquire a WebGPU drawing context.",
      deviceLost: "The GPU device was lost. A reload usually brings it back.",
      canvasLabel: "Live WebGPU simulation: a 16,384-body galaxy integrated on the GPU",
      posterLabel: "Galaxy simulation poster",
      hudRender: "render",
      hudBodies: "bodies",
      hudGravity: "gravity",
    },
    homelabStatus: {
      heading: "sentinel, a snapshot",
      nodes: "nodes",
      guests: "guests",
      cpu: "CPU",
      mem: "memory",
      uptime: "uptime",
      caption: "A snapshot from the cluster's own Proxmox API, captured at build time.",
    },
  },

  fr: {
    skipToContent: "Aller au contenu",
    metaDescription:
      "Ingénieur calcul haute performance et infrastructure. Outillage d'énergie GPU pour Kokkos à Oak Ridge, HPC pour la simulation nucléaire chez EDF, et un cluster de cinq nœuds que j'exploite avec Docker et CI/CD.",
    contactMailSubject: "Poste HPC / infrastructure : prise de contact (dispo janv. 2027)",
    hero: {
      titleLead: "Du ",
      titleEm1: "calcul GPU",
      titleMid: "au ",
      titleEm2: "cluster",
      titleTail: " en production.",
      ledeBeforeLink:
        "Je construis des outils de calcul haute performance, et j'exploite l'infrastructure qui les met en production : la mesure d'énergie GPU pour ",
      ledeLinkLabel: "Kokkos",
      ledeAfterLink:
        " à Oak Ridge, le HPC pour la simulation nucléaire chez EDF, et un cluster de cinq nœuds qui fait tourner une vingtaine de services en production, exploité de bout en bout, de Docker à la CI/CD.",
      cue: "Travaux choisis",
      proof: "ORNL · EDF · cluster 5 nœuds en production",
    },
    sectionHeads: {
      work: {
        title: "Ce que j'ai construit, et ce que ça coûte",
        intro: "Les études de cas suivent, le projet phare d'abord.",
      },
      expertise: {
        title: "Par domaine",
        intro: "Cinq domaines, et là où chacun a réellement servi.",
      },
      about: { title: "Polytech → EDF → Oak Ridge" },
      contact: { title: "La version courte" },
    },
    factRole: "Rôle",
    factWhen: "Quand",
    flagship: "Projet phare",
    stackLabel: "Pile",
    provenBy: "Utilisé sur",
    moreWorkHead: "Aussi sur l'établi",
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
    notFoundKicker: "/ signal perdu",
    notFoundLede:
      "Aucun corps à ces coordonnées. La page a dérivé hors du cadre, ou n'a jamais existé.",
    notFoundBack: "Retour au champ",
    notFoundTitle: "404",
    notFoundDescription: "Page introuvable.",
    blog: {
      kicker: "Écrits",
      indexTitle: "Notes d'établi",
      indexIntro:
        "Des articles sur le HPC, le calcul GPU, l'infrastructure, et les projets derrière.",
      metaDescription:
        "Des articles sur le calcul haute performance, le calcul GPU, l'infrastructure, et les projets derrière, par Ethan Puyaubreau.",
      empty: "Pas encore d'articles. Reviens bientôt.",
      backToIndex: "Tous les articles",
      seeAll: "Lire tous les articles",
      readArticle: "Lire",
      published: "Publié le",
      tagsLabel: "Étiquettes",
      authorTagline: "Ingénieur HPC & infrastructure, ex-Oak Ridge National Laboratory.",
      authorAvailable: "Ouvert aux postes HPC et infrastructure dès janvier 2027.",
      contactCta: "Me contacter",
      talkHead: "Questions, corrections ou propositions : mon adresse est en dessous.",
    },
    palette: {
      trigger: "Aller à",
      placeholder: "Aller à une section ou un lien…",
      sectionHint: "Section",
      copyEmail: "Copier l'adresse e-mail",
      opensNewTab: "Ouvre dans un nouvel onglet",
      noMatch: "Aucun résultat.",
      dialogLabel: "Menu de commandes",
      closeLabel: "Fermer le menu de commandes",
      blogHint: "Lire le blog",
    },
    heroFallback: {
      noWebgpu:
        "Cette galaxie tourne sur WebGPU, que votre navigateur n'expose pas encore. Chrome, Edge ou Safari 18+ la rendront en direct.",
      noAdapter:
        "Aucun adaptateur WebGPU n'est disponible ici (typiquement un GPU verrouillé ou sans affichage).",
      noContext: "Impossible d'obtenir un contexte de dessin WebGPU.",
      deviceLost: "Le périphérique GPU a été perdu. Un rechargement le ramène en général.",
      canvasLabel: "Simulation WebGPU en direct : une galaxie de 16 384 corps intégrée sur le GPU",
      posterLabel: "Affiche de la simulation de galaxie",
      hudRender: "rendu",
      hudBodies: "corps",
      hudGravity: "gravité",
    },
    homelabStatus: {
      heading: "sentinel, un instantané",
      nodes: "nœuds",
      guests: "invités",
      cpu: "CPU",
      mem: "mémoire",
      uptime: "uptime",
      caption: "Un instantané de l'API Proxmox du cluster, capturé au moment du build.",
    },
  },
};

/** Resolve the UI chrome strings for a locale. */
export function getUI(locale: Locale): UIStrings {
  return STRINGS[locale];
}
