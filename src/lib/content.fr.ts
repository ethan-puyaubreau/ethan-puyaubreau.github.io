/**
 * Contenu français du site (servi sous /fr/).
 * Forme définie par SiteContent dans content.types.ts. Style maison : aucun
 * tiret cadratin (—) dans le texte visible ; virgules, deux-points, parenthèses.
 *
 * Termes techniques et noms propres inchangés (CUDA, Kokkos, GPU, HPC, etc.).
 */
import type { SiteContent } from "./content.types";

export const fr: SiteContent = {
  sections: [
    { id: "work", label: "Réalisations" },
    { id: "writing", label: "Écrits" },
    { id: "about", label: "Parcours" },
    { id: "contact", label: "Contact" },
  ],

  caseStudies: [
    {
      id: "ornl-kokkos",
      image: {
        src: "/work/smc2025-poster-600.webp",
        srcset: "/work/smc2025-poster-320.webp 320w, /work/smc2025-poster-600.webp 600w",
        alt: "Le poster SMC 2025, Understanding GPU Energy Dynamics in HPC Applications",
        href: "https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/",
        width: 600,
        height: 800,
      },
      kicker: "Oak Ridge National Laboratory · CSED",
      title: "Mesurer où part l'énergie sur le GPU",
      role: "Graduate Research Fellow (programme GRO)",
      period: "Été 2025",
      stack: ["C++", "Kokkos", "CUDA", "NVML", "Variorum", "Rust"],
      summary:
        "Outillage de mesure d'énergie pour Kokkos, la bibliothèque C++ de portabilité des performances derrière de nombreux codes du Département de l'Énergie américain : un démon d'échantillonnage intégré à Kokkos Tools, des connecteurs NVML et Variorum proposés en amont, et kokkos-energy, un outil d'analyse en ligne de commande.",
      body: [
        {
          h: "Le problème",
          p: "Kokkos permet de faire tourner une même source C++ sur des GPU NVIDIA, AMD et Intel, et c'est précisément pour cela que l'énergie est difficile à évaluer : le même noyau consomme une puissance différente sur chaque backend, et les équipes applicatives n'avaient aucun moyen portable de la voir. Sur les machines du DOE, où la puissance est désormais une contrainte de premier ordre, cet angle mort compte.",
        },
        {
          h: "Où ça en est",
          p: "Le démon d'échantillonnage est intégré à kokkos-tools (#300) ; le cœur et les connecteurs NVML et Variorum sont proposés en amont (#299, #301, #302). Neuf pull requests vers kokkos-tools et LAMMPS au total, dont trois intégrées. Deux posters, lors d'une session interne de l'ORNL et à la SMC 2025 avec Daniel Arndt, Jakob Bludau et Damien Lebrun-Grandié, cités dans le rapport de projet S4PST 2024–2025.",
        },
      ],
      links: [
        {
          label: "Kokkos Tools · PR #300",
          href: "https://github.com/kokkos/kokkos-tools/pull/300",
        },
        {
          label: "kokkos-energy",
          href: "https://github.com/ethan-puyaubreau/energy-dashboard-for-kokkos",
        },
        {
          label: "Poster SMC 2025",
          href: "https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/",
        },
        { label: "Rapport S4PST (OSTI)", href: "https://www.osti.gov/biblio/3016977" },
      ],
    },
    {
      id: "edf-asics",
      figures: [
        { value: "bit à bit", label: "résultats identiques à la référence" },
        { value: "−12 %", label: "temps de calcul, jusqu'à" },
        { value: "−40 %", label: "mémoire au pic" },
      ],
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
          p: "Le groupe ASICS d'EDF développe le calcul scientifique dont dépend la simulation nucléaire. En parallèle de mon diplôme d'ingénieur, j'ai travaillé sur COCAGNE, une plateforme de simulation de cœurs de réacteurs de plus de 500 000 lignes de C++, sur la performance et l'outillage qui gardent un code de cette taille mesurable.",
        },
        {
          h: "Ce que j'ai construit",
          p: "Deux outils internes d'analyse de performance en C++ : une bibliothèque de profilage mémoire qui intercepte l'allocation via LD_PRELOAD, et un outil de mesure temporelle hiérarchique avec bindings Python via PyBind11. Avec eux, j'ai validé un prototype du calcul de cœur sur un modèle Ports et Composants (résultats ci-contre), et j'ai bâti le pipeline de packaging Debian sur GitLab CI/CD et Jenkins.",
        },
      ],
      caveat:
        "Le travail ci-dessus est validé pour une mention publique ; le reste relève de la confidentialité.",
    },
    {
      id: "homelab",
      kicker: "Homelab auto-hébergé",
      title: "Héberger et exploiter mes propres services",
      role: "Architecte et exploitant",
      period: "En cours",
      stack: ["Proxmox", "Traefik", "Docker", "Coolify", "VyOS / WireGuard"],
      summary:
        "Un cluster Proxmox de cinq nœuds, hébergeant une vingtaine de services accessibles publiquement, sur du matériel que j'exploite et automatise moi-même.",
      body: [
        {
          h: "L'installation",
          p: "Cinq nœuds Proxmox (edge, apps, aux, core, gpu) derrière un routeur de bordure VyOS, relié par WireGuard. Un seul Traefik assure la terminaison TLS Let's Encrypt pour une vingtaine de services auto-hébergés : une forge Gitea, un PaaS Coolify, Nextcloud, des services multimédias et plusieurs de mes projets. Mes projets passent en production par un pipeline qui construit une image versionnée, la scanne et revient automatiquement en arrière si le contrôle de santé échoue ; je suis seul d'astreinte.",
        },
      ],
      links: [{ label: "Explorer le cluster", href: "/cluster" }],
    },
  ],

  moreWork: [
    {
      name: "Opération Endgame",
      blurb:
        "Un événement annuel en ligne que je conçois et organise depuis 2021 : quatre heures, une heure de départ fixe, plus de 120 participants actifs en même temps, plus de 150 inscrits à la dernière édition.",
      noLinkLabel: "depuis 2021",
    },
    {
      name: "Annuaire communautaire",
      blurb:
        "L'annuaire d'une communauté francophone en ligne, que j'ai conçu et que j'héberge : 57 entrées, filtrage, comparaison et infographies.",
      noLinkLabel: "en cours",
    },
    {
      name: "n-body galaxy",
      blurb:
        "Une galaxie jusqu'à 65 536 corps en gravité mutuelle, intégrés en direct dans des compute shaders WebGPU. Un projet personnel.",
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
        "Une PWA d'empreinte carbone gamifiée pour un partenaire industriel. J'ai dirigé l'équipe de six : architecture, backend et déploiement.",
      noLinkLabel: "en maintenance",
    },
  ],

  about: [
    "Je mène deux pistes de front : le travail GPU et de performance qui rend un code scientifique rapide, et l'infrastructure qui met le logiciel en production et l'y maintient. Je sors diplômé de Polytech Paris-Saclay (diplôme d'ingénieur, septembre 2026) et je cherche un CDI à partir de janvier 2027 : laboratoires HPC, dans la Bay Area comme à Paris, ou équipes infrastructure, DevOps, SRE et plateforme ; idéalement un poste qui touche aux deux.",
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
