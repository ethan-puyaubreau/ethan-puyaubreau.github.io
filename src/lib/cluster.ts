/**
 * Content for the /cluster page (EN at /cluster, FR at /fr/cluster).
 *
 * Every fact here is real, taken from the cluster's own inventory: five Proxmox
 * nodes (the "sentinel" cluster), the roles they actually serve, the request
 * path traffic takes, and the stack that ties them together. The numbers
 * (CPU, memory, uptime, up or down, services, history) are a build-time
 * snapshot of the telemetry endpoint, captured once and committed, not a live
 * read: this site is static (GitHub Pages) and the endpoint lives on a
 * different domain, so polling it at runtime would be a standing cross-origin
 * request to that domain on every visit. House style: no em dashes, EN or FR.
 */
import type { Locale } from "./i18n";

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
    readonly cue: string;
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
    readonly window: string;
    readonly asOf: string;
  };
  readonly servicesHead: { readonly title: string; readonly intro: string };
  readonly services: {
    readonly count: string;
    readonly caption: string;
  };
  readonly pipelineHead: { readonly title: string; readonly intro: string };
  readonly pipeline: {
    readonly stages: readonly PipelineStage[];
    readonly buildLabel: string;
    readonly note: string;
  };
  readonly opsHead: { readonly title: string; readonly intro: string };
  readonly ops: {
    readonly oncall: string;
    readonly monitoring: string;
    readonly runbooksTitle: string;
    readonly runbooksBody: string;
  };
  readonly console: {
    readonly nodesOnline: string;
    readonly servicesUp: string;
    readonly uptime: string;
  };
  /** Recruiter call to action closing the page (no dead end). */
  readonly talk: {
    readonly kicker: string;
    readonly head: string;
    readonly body: string;
    readonly cta: string;
  };
  readonly stackHead: { readonly title: string; readonly intro: string };
  readonly stack: readonly StackItem[];
  readonly field: {
    readonly canvasLabel: string;
    readonly legendNode: string;
    readonly legendService: string;
    readonly legendTraffic: string;
    readonly note: string;
  };
}

// Node order on the page; ids match the Proxmox node names the snapshot reports.
const NODE_ORDER = ["cerberus", "echelon", "mikoshi", "cynosure", "ultron"] as const;

// Hardware facts, language-neutral, straight from inventory/nodes.md.
const NODE_SPEC: Record<string, string> = {
  cerberus: "~8 cores · 3.7 GB",
  echelon: "11 GB RAM",
  mikoshi: "7.6 GB RAM",
  cynosure: "31 GB RAM",
  ultron: "Xeon E5-1650 v3 · 32 GB · GTX 1050",
};

// What each node actually runs, localized. No invented duties. None of these
// name a specific hosted site: the cluster runs several, on more than one domain.
const NODE_ROLE: Record<Locale, Record<string, string>> = {
  en: {
    cerberus: "The edge. VyOS router, Traefik, DNS, and uptime monitoring.",
    echelon: "Self-hosted apps and the sites I run there.",
    mikoshi: "Apps and Kubernetes. A kube node and a couple of side projects.",
    cynosure: "The workhorse. A Git forge, the CI runners, Nextcloud, a PaaS.",
    ultron: "Capacity and GPU. The media stack, with a GPU to pass through.",
  },
  fr: {
    cerberus: "La bordure. Routeur VyOS, Traefik, DNS et supervision uptime.",
    echelon: "Apps auto-hébergées et les sites que j'y fais tourner.",
    mikoshi: "Apps et Kubernetes. Un nœud kube et quelques projets annexes.",
    cynosure: "Le cheval de trait. Une forge Git, les runners CI, Nextcloud, un PaaS.",
    ultron: "Capacité et GPU. La stack média, avec un GPU à passer en VFIO.",
  },
};

const buildNodes = (locale: Locale): readonly ClusterNode[] =>
  NODE_ORDER.map((id) => ({
    id,
    spec: NODE_SPEC[id],
    role: NODE_ROLE[locale][id],
  }));

const CONTENT: Record<Locale, ClusterContent> = {
  en: {
    meta: {
      title: "The sentinel cluster · Ethan Puyaubreau",
      description:
        "The five-node Proxmox homelab I run: the nodes, the request path, the services, and the CI/CD pipeline behind them. A point-in-time snapshot, not a live feed.",
    },
    sections: [
      { id: "nodes", num: "01", label: "Nodes" },
      { id: "path", num: "02", label: "Path" },
      { id: "services", num: "03", label: "Services" },
      { id: "pipeline", num: "04", label: "Pipeline" },
      { id: "stack", num: "05", label: "Stack" },
      { id: "operations", num: "06", label: "Ops" },
    ],
    backHome: "Home",
    hero: {
      kicker: "Self-hosted infrastructure",
      lead: "The five machines behind ",
      em: "sentinel",
      tail: ".",
      lede: "sentinel is the five-node Proxmox cluster I run: routing and DNS at the edge, a self-hosted Git forge with its own CI/CD, and a couple dozen services behind one Traefik reverse proxy. The numbers on this page are a snapshot captured at build time, not a live feed.",
      cue: "The nodes",
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
      { label: "echelon", sub: "self-hosted apps" },
    ],
    pulse: {
      heading: "Cluster pulse",
      nodes: "nodes online",
      guests: "guests running",
      cpu: "CPU",
      mem: "memory",
      window: "rolling window, snapshot",
      asOf: "as of",
    },
    servicesHead: {
      title: "What runs there",
      intro:
        "The public services this cluster runs, health-checked at the moment the snapshot above was captured.",
    },
    services: {
      count: "up",
      caption: "A snapshot health check, not a live feed. A small, curated set of services.",
    },
    pipelineHead: {
      title: "How a self-hosted project ships",
      intro:
        "A push to main runs three jobs on a self-hosted runner and lands live in about two minutes, with an automatic rollback if the smoke test fails. This exact site (built with Astro, shipped to GitHub Pages) uses a different pipeline; this is the one behind my self-hosted projects.",
    },
    pipeline: {
      stages: [
        { name: "verify", detail: "lint, types, build, and the smoke tests", approx: "~45s" },
        { name: "image", detail: "build, scan with Trivy, push to the registry", approx: "~50s" },
        {
          name: "deploy",
          detail: "pull, smoke test the live URL, roll back on failure",
          approx: "~15s",
        },
      ],
      buildLabel: "reference build",
      note: "A representative run of the pipeline behind my self-hosted services.",
    },
    opsHead: {
      title: "Operated end to end",
      intro:
        "The part that does not fit in a screenshot: keeping it up, watching it, and writing the operations down so they outlive my memory.",
    },
    ops: {
      oncall:
        "On call for my own infrastructure: backups, certificate renewal, monitoring, and the failure modes you only meet at the wrong hour.",
      monitoring: "Monitored by Uptime Kuma",
      runbooksTitle: "Runbooks as a repo",
      runbooksBody:
        "The cluster's setup, runbooks, and automation live in a versioned repo, operated like code. Adding a node or restoring a service follows a written procedure.",
    },
    console: {
      nodesOnline: "nodes online",
      servicesUp: "services up",
      uptime: "uptime",
    },
    talk: {
      kicker: "Contact",
      head: "Everything here, I built and run myself",
      body: "The GPU work, the cluster, the CI/CD. I am open to HPC and infrastructure roles from January 2027.",
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
    field: {
      canvasLabel:
        "Map of the sentinel cluster: five nodes, the services they host, and traffic flowing in through the reverse proxy.",
      legendNode: "node",
      legendService: "service",
      legendTraffic: "traffic",
      note: "A map of the cluster. The nodes are real; the flowing points are a stand-in for traffic, not a packet capture.",
    },
  },

  fr: {
    meta: {
      title: "Le cluster sentinel · Ethan Puyaubreau",
      description:
        "Le homelab Proxmox de cinq nœuds que j'exploite : les nœuds, le chemin des requêtes, les services, et la CI/CD derrière. Un instantané, pas un flux en direct.",
    },
    sections: [
      { id: "nodes", num: "01", label: "Nœuds" },
      { id: "path", num: "02", label: "Chemin" },
      { id: "services", num: "03", label: "Services" },
      { id: "pipeline", num: "04", label: "Pipeline" },
      { id: "stack", num: "05", label: "Pile" },
      { id: "operations", num: "06", label: "Ops" },
    ],
    backHome: "Accueil",
    hero: {
      kicker: "Infrastructure auto-hébergée",
      lead: "Les cinq machines derrière ",
      em: "sentinel",
      tail: ".",
      lede: "sentinel, c'est le cluster Proxmox de cinq nœuds que j'exploite : routage et DNS en bordure, une forge Git auto-hébergée avec sa propre CI/CD, et une vingtaine de services derrière un seul reverse proxy Traefik. Les chiffres de cette page sont un instantané capturé au build, pas un flux en direct.",
      cue: "Les nœuds",
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
      uptime: "uptime",
      online: "en ligne",
      offline: "hors ligne",
      asOf: "relevé à",
    },
    pathHead: {
      title: "Comment une requête atteint un service",
      intro:
        "Chaque visite d'une de mes apps auto-hébergées suit le même chemin, de la bordure publique jusqu'au backend qui répond. Le voici, de bout en bout.",
    },
    path: [
      { label: "Visiteur", sub: "un navigateur" },
      { label: "Cloudflare", sub: "DNS" },
      { label: "VPS", sub: "WireGuard" },
      { label: "VyOS", sub: "le routeur" },
      { label: "Traefik", sub: "TLS, routage" },
      { label: "echelon", sub: "apps auto-hébergées" },
    ],
    pulse: {
      heading: "Pouls du cluster",
      nodes: "nœuds en ligne",
      guests: "invités actifs",
      cpu: "CPU",
      mem: "mémoire",
      window: "fenêtre glissante, instantané",
      asOf: "relevé à",
    },
    servicesHead: {
      title: "Ce qui tourne",
      intro:
        "Les services publics de ce cluster, vérifiés au moment où l'instantané ci-dessus a été capturé.",
    },
    services: {
      count: "actifs",
      caption: "Un contrôle de santé instantané, pas un flux en direct. Un petit ensemble choisi.",
    },
    pipelineHead: {
      title: "Comment un projet auto-hébergé se déploie",
      intro:
        "Un push sur main lance trois jobs sur un runner auto-hébergé et arrive en direct en environ deux minutes, avec un rollback automatique si le test de fumée échoue. Ce site précis (Astro, déployé sur GitHub Pages) utilise un autre pipeline ; celui-ci est celui de mes projets auto-hébergés.",
    },
    pipeline: {
      stages: [
        { name: "verify", detail: "lint, types, build et les tests de fumée", approx: "~45s" },
        { name: "image", detail: "build, scan Trivy, push vers le registre", approx: "~50s" },
        {
          name: "deploy",
          detail: "pull, test de fumée de l'URL live, rollback si échec",
          approx: "~15s",
        },
      ],
      buildLabel: "build de référence",
      note: "Une exécution représentative de la pipeline derrière mes services auto-hébergés.",
    },
    opsHead: {
      title: "Exploité de bout en bout",
      intro:
        "La partie qui ne tient pas dans une capture : le maintenir en route, le surveiller, et consigner l'exploitation pour qu'elle survive à ma mémoire.",
    },
    ops: {
      oncall:
        "D'astreinte sur ma propre infrastructure : sauvegardes, renouvellement de certificats, supervision, et les modes de défaillance qu'on ne rencontre qu'à la mauvaise heure.",
      monitoring: "Supervisé par Uptime Kuma",
      runbooksTitle: "Les runbooks dans un dépôt",
      runbooksBody:
        "La configuration, les runbooks et l'automatisation du cluster vivent dans un dépôt versionné, exploités comme du code. Ajouter un nœud ou restaurer un service suit une procédure écrite.",
    },
    console: {
      nodesOnline: "nœuds en ligne",
      servicesUp: "services actifs",
      uptime: "uptime",
    },
    talk: {
      kicker: "Contact",
      head: "Tout ce qui est ici, je l'ai construit et je l'exploite",
      body: "Le travail GPU, le cluster, la CI/CD. Je suis ouvert à des postes HPC et infrastructure à partir de janvier 2027.",
      cta: "Me contacter",
    },
    stackHead: {
      title: "La pile qui tient l'ensemble",
      intro: "Des outils éprouvés, câblés ensemble et exploités de bout en bout.",
    },
    stack: [
      { name: "Proxmox VE", note: "Le cluster d'hyperviseurs à cinq nœuds" },
      { name: "VyOS", note: "Le routeur en bordure" },
      { name: "WireGuard", note: "Tunnel vers le VPS public" },
      { name: "Traefik", note: "Reverse proxy, certificats Let's Encrypt" },
      { name: "Docker", note: "Chaque service, conteneurisé" },
      { name: "Gitea + Actions", note: "Forge auto-hébergée et CI/CD" },
      { name: "Cloudflare DNS", note: "DNS et le challenge ACME" },
      { name: "AdGuard Home", note: "DNS du LAN avec filtrage" },
      { name: "Tailscale", note: "Accès nomade au LAN" },
      { name: "Coolify", note: "Un petit PaaS pour les apps annexes" },
    ],
    field: {
      canvasLabel:
        "Carte du cluster sentinel : cinq nœuds, les services qu'ils hébergent, et le trafic qui entre par le reverse proxy.",
      legendNode: "nœud",
      legendService: "service",
      legendTraffic: "trafic",
      note: "Une carte du cluster. Les nœuds sont réels ; les points en mouvement figurent le trafic, ce n'est pas une capture réseau.",
    },
  },
};

/** Resolve the cluster page content for a locale. */
export function getClusterContent(locale: Locale): ClusterContent {
  return CONTENT[locale];
}
