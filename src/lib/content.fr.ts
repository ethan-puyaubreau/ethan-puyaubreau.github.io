/**
 * Contenu français du site (servi sous /fr/).
 * Forme définie par SiteContent dans content.types.ts. Style maison : aucun
 * tiret cadratin (—) dans le texte visible ; virgules, deux-points, parenthèses.
 *
 * Traduction tenue, pas littérale : voix sobre, précise, à la première
 * personne. Termes techniques et noms propres inchangés (CUDA, Kokkos, GPU,
 * HPC, etc.).
 *
 * Règles de ton. Le lecteur est souvent un recruteur : ne jamais le dire.
 * - Ne pas nommer le lecteur (« un employeur », « votre équipe »).
 * - Ne pas s'auto-décerner de verdict (« une preuve de », « et c'est réel »,
 *   « pas seulement X ») : poser le fait, laisser conclure.
 * - Pas de « fait concret, puis C'est [étiquette abstraite] ».
 * - Pas de franglais RH (delivery, leadership, ownership, impact).
 */
import type { SiteContent } from "./content.types";

export const fr: SiteContent = {
  sections: [
    { id: "work", num: "01", label: "Travaux choisis" },
    { id: "expertise", num: "02", label: "Expertise" },
    { id: "writing", num: "03", label: "Écrits" },
    { id: "about", num: "04", label: "Parcours" },
    { id: "contact", num: "05", label: "Contact" },
  ],

  caseStudies: [
    {
      id: "ornl-kokkos",
      num: "01",
      kicker: "Oak Ridge National Laboratory · CSED",
      title: "Mesurer où part l'énergie sur le GPU",
      role: "Stagiaire recherche",
      period: "Été 2025",
      stack: ["C++", "Kokkos", "CUDA", "NVML", "Variorum", "Python"],
      flagship: true,
      summary:
        "Outillage de mesure d'énergie pour Kokkos, le cadre de portabilité des performances du Département de l'Énergie américain. Connecteurs intégrés à Kokkos Tools, avec un tableau de bord d'analyse.",
      body: [
        {
          h: "Le problème",
          p: "Kokkos permet de faire tourner une même source C++ sur des GPU NVIDIA, AMD et Intel, et c'est précisément pour cela que l'énergie est difficile à raisonner : le même noyau consomme une puissance différente sur chaque backend, et les équipes applicatives n'avaient aucun moyen portable de la voir. Sur les machines du DOE, où la puissance est désormais une contrainte de premier ordre, cet angle mort compte.",
        },
        {
          h: "Ce que j'ai construit",
          p: "Un ensemble de connecteurs Kokkos Tools qui échantillonnent la puissance pendant l'exécution des noyaux et attribuent l'énergie intégrée aux régions Kokkos qui l'ont causée : un backend NVML pour les GPU NVIDIA, un backend Variorum pour la puissance au niveau nœud, un démon d'arrière-plan échantillonnant à intervalle fixe, et un export CSV. Par-dessus, un tableau de bord Python transforme ces sorties en analyse d'énergie par noyau. L'outil s'accroche à l'interface de profilage de Kokkos : le code applicatif reste intact.",
        },
        {
          h: "Où ça en est",
          p: "Le démon d'échantillonnage périodique est intégré à kokkos-tools, fait l'objet d'un rapport ORNL et a été présenté sous forme de poster, « Understanding GPU Energy Dynamics in HPC Applications », à la Smoky Mountains Conference 2025. Les connecteurs NVML et Variorum sont en revue, avec ROCm SMI esquissé pour AMD.",
        },
      ],
      links: [
        {
          label: "Kokkos Tools · PR #300",
          href: "https://github.com/kokkos/kokkos-tools/pull/300",
        },
        {
          label: "Tableau de bord d'énergie",
          href: "https://github.com/ethan-puyaubreau/energy-dashboard-for-kokkos",
        },
        { label: "Rapport ORNL", href: "https://www.osti.gov/biblio/3016977" },
      ],
    },
    {
      id: "edf-asics",
      num: "02",
      kicker: "EDF Lab Paris-Saclay · groupe ASICS",
      title: "HPC pour la simulation nucléaire",
      role: "Apprenti ingénieur",
      period: "2023 à 2026",
      stack: ["C++17", "Python", "CMake", "PostgreSQL", "Scibian 10/11"],
      summary:
        "Une alternance de trois ans à construire l'outillage de performance C++ de COCAGNE, la plateforme de simulation de cœurs de réacteurs d'EDF : un code scientifique de plus de 500 000 lignes.",
      body: [
        {
          h: "Le contexte",
          p: "Le groupe ASICS d'EDF développe le calcul scientifique dont dépend la simulation nucléaire. En parallèle de mon diplôme d'ingénieur, j'ai passé trois ans sur COCAGNE, une plateforme de simulation de cœurs de réacteurs de plus de 500 000 lignes de C++, sur la performance et l'outillage qui gardent un code de cette taille mesurable.",
        },
        {
          h: "Ce que j'ai construit",
          p: "Deux outils internes d'analyse de performance en C++ : une bibliothèque de profilage mémoire qui intercepte l'allocation via LD_PRELOAD, et un outil de mesure temporelle hiérarchique avec bindings Python via PyBind11. J'ai participé à la refonte des solveurs neutroniques vers un modèle Ports et Composants, et bâti le pipeline de packaging Debian sur GitLab CI/CD et Jenkins.",
        },
      ],
      caveat:
        "Une alternance de trois ans en milieu industriel. Le travail ci-dessus est validé pour une mention publique ; le reste relève de la confidentialité.",
    },
    {
      id: "homelab",
      num: "03",
      kicker: "cluster homelab · auto-hébergé",
      title: "Exploiter ma propre production",
      role: "Architecte et exploitant",
      period: "En cours",
      stack: ["Proxmox", "Traefik", "Docker", "Coolify", "VyOS / WireGuard"],
      summary:
        "Un cluster Proxmox de cinq nœuds, hébergeant une vingtaine de services accessibles publiquement, sur du matériel que j'exploite et automatise moi-même.",
      body: [
        {
          h: "L'installation",
          p: "Cinq nœuds Proxmox (edge, apps, aux, core, gpu) derrière une bordure VyOS sur un lien WireGuard. Un seul Traefik termine le TLS Let's Encrypt pour une vingtaine de services auto-hébergés : une forge Gitea, un PaaS Coolify, Nextcloud, une pile média, et plusieurs de mes propres projets. Les runbooks et l'automatisation du cluster sont eux-mêmes un dépôt.",
        },
        {
          h: "Pourquoi c'est là",
          p: "Je suis la seule astreinte : disponibilité, sauvegardes, renouvellement des certificats, supervision, et les modes de défaillance ingrats qu'on ne rencontre qu'en exploitant sa propre infrastructure un dimanche soir. Mes projets auto-hébergés y arrivent par une chaîne CI/CD qui construit une image versionnée, la scanne, et fait un rollback automatique si le contrôle de santé échoue.",
        },
      ],
      links: [{ label: "Explorer le cluster", href: "/cluster" }],
    },
    {
      id: "endgame",
      num: "04",
      kicker: "Opération Endgame",
      title: "Livrer un événement pour plus de 120 participants",
      role: "Fondateur et organisateur",
      period: "Depuis 2020",
      stack: ["Gestion de projet", "Opérations", "Coordination temps réel"],
      summary:
        "Une opération annuelle en ligne que j'organise depuis 2020 : planification, coordination temps réel et logistique pour plus de 120 participants simultanés, plus de 150 inscrits cette édition.",
      body: [
        {
          h: "L'organiser",
          p: "L'Opération Endgame est le rendez-vous annuel que je conçois et organise depuis 2020 : quatre heures, une heure de départ fixe, plus de 120 participants actifs en même temps (plus de 150 inscrits cette édition), répartis sur plusieurs rôles coordonnés pour la durée de l'événement. Briefing, canaux de communication, ordre de déroulement et plan de bascule en cas d'incident technique se préparent en amont. Le jour J, l'heure de départ ne bouge pas.",
        },
      ],
    },
    {
      id: "commus",
      num: "05",
      kicker: "Annuaire communautaire",
      title: "Cartographier une communauté",
      role: "Full-stack",
      period: "En cours",
      stack: ["Vue 3", "TypeScript", "Python", "Auto-hébergé"],
      summary:
        "Un annuaire d'une communauté francophone en ligne que j'ai conçu et que j'héberge, avec des statistiques et des infographies.",
      body: [
        {
          h: "Ce que c'est",
          p: "L'annuaire recense 57 entrées, avec filtrage, comparaison et un jeu d'infographies : une répartition par catégorie, une chronologie, un pouls d'activité. Un front Vue que j'héberge, tenu à jour par un petit service de mise à jour. Le projet est parti d'un besoin concret : savoir qui inviter à l'Opération Endgame.",
        },
      ],
    },
  ],

  moreWork: [
    {
      name: "n-body galaxy",
      blurb:
        "Le champ derrière cette page : 16 384 corps en gravité mutuelle, intégrés en direct dans des compute shaders WebGPU. Un projet personnel.",
      href: "https://ethan-puyaubreau.github.io/nbody-webgpu/",
      hrefLabel: "En ligne",
    },
    {
      name: "isochrone-app",
      blurb:
        "Un explorateur d'isochrones hors ligne enveloppant un moteur de routage Valhalla auto-hébergé, livré sur desktop et web.",
      href: "https://github.com/ethan-puyaubreau/isochrone-app",
      hrefLabel: "GitHub",
    },
    {
      name: "vireli",
      blurb:
        "Une PWA d'empreinte carbone gamifiée construite avec un partenaire client, avec une API séparée et des environnements dev/prod.",
      noLinkLabel: "en maintenance",
    },
  ],

  expertise: [
    {
      title: "GPU et HPC",
      blurb:
        "Écrire pour le GPU et raisonner sur ce que cela coûte, en temps et désormais en énergie.",
      items: [
        "CUDA",
        "OpenMP et MPI",
        "Kokkos et portabilité des performances",
        "Télémétrie puissance et énergie GPU",
      ],
      provenBy: { label: "ORNL × Kokkos", id: "ornl-kokkos" },
    },
    {
      title: "Ingénierie de la performance et outillage",
      blurb:
        "Des outils C++ internes qui gardent un grand code scientifique mesurable, et le pipeline de build autour.",
      items: [
        "Profilage mémoire (LD_PRELOAD)",
        "Mesure temporelle et instrumentation (PyBind11)",
        "Systèmes de build C++ (CMake)",
        "Packaging Debian et CI (GitLab CI/CD, Jenkins)",
      ],
      provenBy: { label: "EDF · ASICS", id: "edf-asics" },
    },
    {
      title: "Infrastructure et DevOps",
      blurb:
        "Le chemin complet, du commit à la requête servie, et le travail de fiabilité qui va avec, sur du matériel dont je réponds.",
      items: [
        "Clustering Proxmox VE",
        "Kubernetes / K3s",
        "Traefik, TLS et reverse proxy",
        "Docker et CI/CD Gitea",
      ],
      provenBy: { label: "cluster homelab", id: "homelab" },
    },
    {
      title: "Full-stack et temps réel",
      blurb: "Interfaces et systèmes vivants, dont celui qui rend cette page.",
      items: ["Vue 3 / Nuxt 3", "TypeScript", "Auto-hébergement et déploiement", "Astro"],
      provenBy: { label: "annuaire communautaire", id: "commus" },
    },
    {
      title: "Sécurité",
      blurb:
        "Les bases défensives qu'une infra auto-hébergée, exposée sur Internet, oblige à bien tenir.",
      items: [
        "TLS et PKI (Let's Encrypt, ACME)",
        "Segmentation réseau (VLAN, WireGuard)",
        "Durcissement bordure et reverse proxy",
        "Hygiène des secrets et des accès",
      ],
      provenBy: { label: "cluster homelab", id: "homelab" },
    },
  ],

  about: [
    "Tout part du même endroit : un cluster que j'ai monté à la maison. J'y mesure l'énergie des GPU et j'y exploite ma propre production, de l'astreinte aux certificats. La page cluster de ce site en sort.",
    "Je mène deux pistes de front. La première, c'est le calcul haute performance : le travail GPU et de performance qui rend un code scientifique rapide. La seconde, c'est l'infrastructure qui met le logiciel en production et l'y maintient : conteneurs, pipelines, reverse proxies, et le cluster en dessous. Les deux se rejoignent vite : le code que j'optimise finit sur des machines que quelqu'un doit exploiter, et j'ai tenu les deux bouts.",
    "À Oak Ridge National Laboratory, j'ai construit l'outillage de mesure d'énergie GPU pour Kokkos, la couche de portabilité qui fait tourner les codes du Département de l'Énergie américain sur ses supercalculateurs. Le démon d'échantillonnage périodique est intégré en amont dans Kokkos Tools, et le travail est devenu un poster à la Smoky Mountains Conference 2025.",
    "En parallèle, j'ai passé trois ans en alternance sur le HPC pour la simulation nucléaire chez EDF, et j'exploite mon propre cluster de production de cinq nœuds : une vingtaine de services derrière Traefik et TLS, déployés avec Docker et de la CI/CD, avec scan d'image et rollback automatique. Quand quelque chose casse à trois heures du matin, il n'y a personne d'autre à appeler.",
    "Je termine mon diplôme d'ingénieur à Polytech Paris-Saclay en septembre 2026 et je cherche un CDI à partir de janvier 2027. Les laboratoires HPC sont un terrain naturel, la Bay Area (Berkeley Lab, LLNL) et Paris, le CEA parmi eux, mais l'infrastructure, le DevOps, le SRE et le platform engineering m'intéressent tout autant, sur site ou dans le cloud ; idéalement un poste qui touche aux deux.",
  ],

  timeline: [
    { when: "2023 à 2026", what: "Alternance HPC", where: "EDF Lab Paris-Saclay · ASICS" },
    {
      when: "Été 2025",
      what: "Outillage d'énergie GPU + poster SMC25",
      where: "Oak Ridge National Laboratory",
    },
    { when: "Sept. 2026", what: "Diplôme d'ingénieur", where: "Polytech Paris-Saclay" },
  ],

  availability: {
    headline: "Ouvert aux postes HPC, infrastructure et DevOps à partir de janvier 2027",
    detail:
      "Pour des laboratoires HPC ou des équipes infrastructure et plateforme, dans la Bay Area ou à Paris.",
    cta: "Le plus rapide pour me joindre",
    contactLabel: "Me contacter",
    mailSubject: "Poste HPC / infrastructure : prise de contact (dispo janv. 2027)",
  },
};
