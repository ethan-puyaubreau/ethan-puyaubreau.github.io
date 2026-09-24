/**
 * Content for the /cluster page (EN at /cluster, FR at /fr/cluster).
 *
 * Every fact here is real, taken from the cluster's own inventory: five Proxmox
 * nodes (the homelab cluster), the roles they actually serve, the request
 * path traffic takes, and the stack that ties them together. The numbers
 * (CPU, memory, uptime, up or down, services, history) are a build-time
 * snapshot of the telemetry endpoint, captured once and committed, not a live
 * read: this site is static (GitHub Pages) and the endpoint lives on a
 * different domain, so polling it at runtime would be a standing cross-origin
 * request to that domain on every visit. House style: no em dashes, EN or FR.
 */
import type { Locale } from "./i18n";
import { withFrenchSpacing } from "./french-spacing.mjs";

export interface ClusterNavSection {
  readonly id: string;
  readonly num: string;
  readonly label: string;
}

export interface ClusterNode {
  /** Proxmox node name; matches the snapshot's `nodes[].name`. */
  readonly id: string;
  /** Hardware facts, language-neutral. */
  readonly spec: string;
  /** What it does, localized prose. */
  readonly role: string;
}

export interface PathStage {
  readonly label: string;
  readonly sub: string;
}

export interface PipelineStage {
  readonly name: string;
  readonly detail: string;
  readonly approx: string;
}

export interface StackItem {
  readonly name: string;
  readonly note: string;
}

export interface ClusterContent {
  readonly meta: { readonly title: string; readonly description: string };
  readonly sections: readonly ClusterNavSection[];
  readonly backHome: string;
  readonly hero: {
    readonly kicker: string;
    readonly lead: string;
    readonly em: string;
    readonly tail: string;
    readonly lede: string;
  };
  readonly nodesHead: { readonly title: string; readonly intro: string };
  readonly nodes: readonly ClusterNode[];
  readonly live: {
    readonly cpu: string;
    readonly mem: string;
    readonly uptime: string;
    readonly online: string;
    readonly offline: string;
    readonly asOf: string;
  };
  readonly pathHead: { readonly title: string; readonly intro: string };
  readonly path: readonly PathStage[];
  readonly pulse: {
    readonly heading: string;
    readonly nodes: string;
    readonly guests: string;
    readonly cpu: string;
    readonly mem: string;
    readonly services: string;
    readonly window: string;
    readonly asOf: string;
  };
  readonly pipelineHead: { readonly title: string; readonly intro: string };
  readonly pipeline: {
    readonly stages: readonly PipelineStage[];
    readonly note: string;
  };
  readonly opsHead: { readonly title: string; readonly intro: string };
  readonly ops: {
    readonly oncall: string;
    readonly monitoring: string;
    readonly runbooksTitle: string;
    readonly runbooksBody: string;
  };
  /** Call to action closing the page (no dead end). */
  readonly talk: {
    readonly head: string;
    readonly body: string;
    readonly cta: string;
  };
  readonly stackHead: { readonly title: string; readonly intro: string };
  readonly stack: readonly StackItem[];
}

// Node order on the page; ids match the Proxmox node names the snapshot reports.
const NODE_ORDER = ["edge", "apps", "aux", "core", "gpu"] as const;

// Hardware facts, language-neutral, as the Proxmox API reports them.
const NODE_SPEC: Record<string, string> = {
  edge: "2 CPU · 3.7 GB",
  apps: "2 CPU · 11.6 GB",
  aux: "2 CPU · 7.6 GB",
  core: "4 CPU · 31 GB",
  gpu: "12 CPU · 32 GB · GTX 1050",
};

// What each node actually runs, localized. No invented duties. None of these
// name a specific hosted site: the cluster runs several, on more than one domain.
const NODE_ROLE: Record<Locale, Record<string, string>> = {
  en: {
    edge: "The edge. The VyOS router, Traefik, and uptime monitoring.",
    apps: "Self-hosted apps and sites, plus LAN DNS and Home Assistant.",
    aux: "A small spare node: a second router VM and the VM templates.",
    core: "The workhorse. A Git forge, the CI runners, Nextcloud, a PaaS.",
    gpu: "Capacity and GPU. The media stack, the Kubernetes VM, and local LLM inference.",
  },
  fr: {
    edge: "Le nœud frontal. Le routeur VyOS, Traefik et la supervision de disponibilité.",
    apps: "Apps et sites auto-hébergés, plus le DNS du LAN et Home Assistant.",
    aux: "Un petit nœud d'appoint : une seconde VM routeur et les gabarits de VM.",
    core: "Le nœud principal. Une forge Git, les runners CI, Nextcloud, un PaaS.",
    gpu: "Capacité et GPU. Les services multimédias, la VM Kubernetes et l'inférence LLM locale.",
  },
};

const buildNodes = (locale: Locale): readonly ClusterNode[] =>
  NODE_ORDER.map((id) => ({
    id,
    spec:
      locale === "fr"
        ? NODE_SPEC[id].replace(/(\d)\.(\d)/g, "$1,$2").replace(/GB/g, "Go")
        : NODE_SPEC[id],
    role: NODE_ROLE[locale][id],
  }));

const CONTENT: Record<Locale, ClusterContent> = {
  en: {
    meta: {
      title: "The homelab cluster · Ethan Puyaubreau",
      description:
        "The five-node Proxmox homelab I run: the nodes, the request path, the services, and the CI/CD pipeline behind them. A point-in-time snapshot, not a live feed.",
    },
    sections: [
      { id: "nodes", num: "01", label: "Nodes" },
      { id: "path", num: "02", label: "Path" },
      { id: "pipeline", num: "03", label: "Pipeline" },
      { id: "stack", num: "04", label: "Stack" },
      { id: "operations", num: "05", label: "Ops" },
    ],
    backHome: "Home",
    hero: {
      kicker: "Self-hosted infrastructure",
      lead: "The five machines behind ",
      em: "my homelab",
      tail: ".",
      lede: "The homelab is a five-node Proxmox cluster I run: routing and DNS at the edge, a self-hosted Git forge with its own CI/CD, and about twenty services behind one Traefik reverse proxy. The numbers on this page are a snapshot captured at build time.",
    },
    nodesHead: {
      title: "Five nodes, each with a job",
      intro:
        "One Proxmox cluster, five hosts. The readout on each card is a snapshot from the cluster's own Proxmox API, captured once and shown as of the date below.",
    },
    nodes: buildNodes("en"),
    live: {
      cpu: "CPU",
      mem: "memory",
      uptime: "uptime",
      online: "online",
      offline: "offline",
      asOf: "as of",
    },
    pathHead: {
      title: "How a request reaches a service",
      intro:
        "Every hit on one of my self-hosted apps crosses the same path, from the public edge to the backend that answers it. Here it is, end to end.",
    },
    path: [
      { label: "Visitor", sub: "a browser" },
      { label: "Cloudflare", sub: "DNS" },
      { label: "VPS", sub: "WireGuard" },
      { label: "VyOS", sub: "the router" },
      { label: "Traefik", sub: "TLS, routing" },
      { label: "apps", sub: "self-hosted apps" },
    ],
    pulse: {
      heading: "Cluster load",
      nodes: "nodes online",
      guests: "VMs and containers running",
      cpu: "CPU",
      mem: "memory",
      services: "endpoints up",
      window: "CPU and memory over the last week, one point every 8 h",
      asOf: "as of",
    },
    pipelineHead: {
      title: "How a self-hosted project ships",
      intro:
        "A push to main runs three jobs on a self-hosted runner and lands live in about two minutes, with an automatic rollback if the smoke test fails. This exact site (built with Astro, shipped to GitHub Pages) uses a different pipeline; this is the one behind my self-hosted projects.",
    },
    pipeline: {
      stages: [
        { name: "verify", detail: "lint, types, build, and the smoke tests", approx: "~45 s" },
        { name: "image", detail: "build, scan with Trivy, push to the registry", approx: "~50 s" },
        {
          name: "deploy",
          detail: "pull, smoke test the live URL, roll back on failure",
          approx: "~15 s",
        },
      ],
      note: "A representative run of the pipeline behind my self-hosted services.",
    },
    opsHead: {
      title: "Operated end to end",
      intro:
        "The part that does not fit in a screenshot: keeping it up, watching it, and writing the operations down so they outlive my memory.",
    },
    ops: {
      oncall:
        "On call for my own infrastructure: backups, certificate renewal, monitoring, and incident response.",
      monitoring: "Monitored by Uptime Kuma, and by Gatus from outside the cluster",
      runbooksTitle: "Runbooks as a repo",
      runbooksBody:
        "The cluster's setup, runbooks, and automation live in a versioned repo, operated like code. Adding a node or restoring a service follows a written procedure.",
    },
    talk: {
      head: "Everything here, I built and run myself",
      body: "The GPU work, the cluster, the CI/CD. I am open to research software engineer roles from January 2027.",
      cta: "Get in touch",
    },
    stackHead: {
      title: "The stack that holds it up",
      intro: "Well-worn tools, wired together and operated end to end.",
    },
    stack: [
      { name: "Proxmox VE", note: "The five-node hypervisor cluster" },
      { name: "VyOS", note: "The router at the edge" },
      { name: "WireGuard", note: "Tunnel to the public VPS" },
      { name: "Traefik", note: "Reverse proxy, Let's Encrypt certs" },
      { name: "Docker", note: "Every service, containerized" },
      { name: "Gitea + Actions", note: "Self-hosted forge and CI/CD" },
      { name: "Cloudflare DNS", note: "DNS and the ACME challenge" },
      { name: "AdGuard Home", note: "LAN DNS with filtering" },
      { name: "Tailscale", note: "Nomad access to the LAN" },
      { name: "Coolify", note: "A small PaaS for the side apps" },
    ],
  },

  fr: {
    meta: {
      title: "Le cluster homelab · Ethan Puyaubreau",
      description:
        "Le homelab Proxmox de cinq nœuds que j'exploite : les nœuds, le chemin des requêtes, les services, et la CI/CD derrière. Un instantané, pas un flux en direct.",
    },
    sections: [
      { id: "nodes", num: "01", label: "Nœuds" },
      { id: "path", num: "02", label: "Chemin" },
      { id: "pipeline", num: "03", label: "Pipeline" },
      { id: "stack", num: "04", label: "Outils" },
      { id: "operations", num: "05", label: "Ops" },
    ],
    backHome: "Accueil",
    hero: {
      kicker: "Infrastructure auto-hébergée",
      lead: "Les cinq machines derrière ",
      em: "mon homelab",
      tail: ".",
      lede: "Le homelab, c'est le cluster Proxmox de cinq nœuds que j'exploite : routage et DNS en bordure, une forge Git auto-hébergée avec sa propre CI/CD, et une vingtaine de services derrière un seul reverse proxy Traefik. Les chiffres de cette page sont un instantané pris à la génération du site.",
    },
    nodesHead: {
      title: "Cinq nœuds, chacun son rôle",
      intro:
        "Un cluster Proxmox, cinq hôtes. Le relevé de chaque carte est un instantané de l'API Proxmox du cluster, capturé une fois et daté ci-dessous.",
    },
    nodes: buildNodes("fr"),
    live: {
      cpu: "CPU",
      mem: "mémoire",
      uptime: "en service",
      online: "en ligne",
      offline: "hors ligne",
      asOf: "relevé le",
    },
    pathHead: {
      title: "Comment une requête atteint un service",
      intro:
        "Chaque visite d'une de mes apps auto-hébergées suit le même chemin, du point d'entrée public jusqu'au backend qui répond. Le voici, de bout en bout.",
    },
    path: [
      { label: "Visiteur", sub: "un navigateur" },
      { label: "Cloudflare", sub: "DNS" },
      { label: "VPS", sub: "WireGuard" },
      { label: "VyOS", sub: "le routeur" },
      { label: "Traefik", sub: "TLS, routage" },
      { label: "apps", sub: "apps auto-hébergées" },
    ],
    pulse: {
      heading: "Charge du cluster",
      nodes: "nœuds en ligne",
      guests: "VM et conteneurs actifs",
      cpu: "CPU",
      mem: "mémoire",
      services: "adresses surveillées joignables",
      window: "CPU et mémoire sur la dernière semaine, un point toutes les 8 h",
      asOf: "relevé le",
    },
    pipelineHead: {
      title: "Comment un projet auto-hébergé se déploie",
      intro:
        "Un push sur main lance trois jobs sur un runner auto-hébergé et passe en production en deux minutes environ, avec un rollback automatique si la vérification après déploiement échoue. Ce site-ci (Astro, sur GitHub Pages) passe par un autre pipeline ; celui-là sert à mes projets auto-hébergés.",
    },
    pipeline: {
      stages: [
        {
          name: "verify",
          detail: "lint, types, build et les vérifications rapides",
          approx: "~45 s",
        },
        { name: "image", detail: "build, scan Trivy, push vers le registre", approx: "~50 s" },
        {
          name: "deploy",
          detail: "pull, vérification de l'URL publique, rollback si échec",
          approx: "~15 s",
        },
      ],
      note: "Une exécution représentative du pipeline derrière mes services auto-hébergés.",
    },
    opsHead: {
      title: "Exploité de bout en bout",
      intro:
        "La partie qui ne tient pas dans une capture : le maintenir en route, le surveiller, et consigner l'exploitation pour ne pas dépendre de ma mémoire.",
    },
    ops: {
      oncall:
        "D'astreinte sur ma propre infrastructure : sauvegardes, renouvellement des certificats, supervision et réponse aux incidents.",
      monitoring: "Supervisé par Uptime Kuma, et par Gatus depuis l'extérieur du cluster",
      runbooksTitle: "Les runbooks dans un dépôt",
      runbooksBody:
        "La configuration, les runbooks et l'automatisation du cluster vivent dans un dépôt versionné, exploités comme du code. Ajouter un nœud ou restaurer un service suit une procédure écrite.",
    },
    talk: {
      head: "Tout ce qui est ici, je l'ai construit et je l'exploite",
      body: "Le travail GPU, le cluster, la CI/CD. Je suis ouvert aux postes d'ingénieur logiciel pour la recherche à partir de janvier 2027.",
      cta: "Me contacter",
    },
    stackHead: {
      title: "Les outils qui tiennent l'ensemble",
      intro: "Des outils éprouvés, câblés ensemble et exploités de bout en bout.",
    },
    stack: [
      { name: "Proxmox VE", note: "Le cluster d'hyperviseurs à cinq nœuds" },
      { name: "VyOS", note: "Le routeur en bordure" },
      { name: "WireGuard", note: "Tunnel vers le VPS public" },
      { name: "Traefik", note: "Reverse proxy, certificats Let's Encrypt" },
      { name: "Docker", note: "Chaque service, conteneurisé" },
      { name: "Gitea + Actions", note: "Forge auto-hébergée et CI/CD" },
      { name: "Cloudflare DNS", note: "DNS et le défi ACME" },
      { name: "AdGuard Home", note: "DNS du LAN avec filtrage" },
      { name: "Tailscale", note: "Accès nomade au LAN" },
      { name: "Coolify", note: "Un petit PaaS pour les apps annexes" },
    ],
  },
};

const SPACED: Record<Locale, ClusterContent> = {
  en: CONTENT.en,
  fr: withFrenchSpacing(CONTENT.fr),
};

/** Resolve the cluster page content for a locale. */
export function getClusterContent(locale: Locale): ClusterContent {
  return SPACED[locale];
}
