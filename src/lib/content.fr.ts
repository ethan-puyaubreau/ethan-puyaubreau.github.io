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
    { id: "writing", label: "Articles" },
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
      stack: ["C++", "Kokkos", "CUDA", "NVML", "ROCm SMI", "Variorum", "Rust"],
      summary:
        "Des outils de mesure d'énergie pour Kokkos, la bibliothèque C++ de portabilité des performances derrière de nombreux codes du Département de l'Énergie américain : un démon d'échantillonnage fusionné dans Kokkos Tools, des connecteurs de mesure soumis en amont, des outils testés sur Frontier, et energy-dashboard-for-kokkos, un outil d'analyse open source que j'ai réécrit en 2026.",
      body: [
        {
          h: "Le problème",
          p: "Kokkos fait tourner un même code source C++ sur des GPU NVIDIA, AMD et Intel, et le même noyau consomme une puissance différente sur chacun. Kokkos Tools ne savait pas rapporter l'énergie par région, sur des machines du DOE où la puissance est devenue une contrainte majeure.",
        },
        {
          h: "Comment c'est construit",
          p: "Les outils se branchent à l'exécution par Kokkos Tools : une application se mesure sans recompilation ni correctif. Les connecteurs soumis en amont lisent la puissance via NVML ou Variorum ; une version AMD via ROCm SMI n'est pas encore publiée. energy-dashboard-for-kokkos, réécrit en Rust en 2026, a un format de trace documenté, des tests sur une trace GPU réelle et des binaires publiés par la CI. Les traces et le script derrière les chiffres DBSCAN sont publics, et la CI les recalcule.",
        },
        {
          h: "Où ça en est",
          p: "J'ai écrit le démon d'échantillonnage (#300) ; mon encadrant à l'ORNL, Jakob Bludau, l'a mené au bout de la relecture après mon séjour, et il a été fusionné dans kokkos-tools en mars 2026. Le cœur (#299) et les connecteurs NVML et Variorum (#301, #302) sont encore ouverts. Neuf pull requests vers kokkos-tools et LAMMPS au total, dont certaines redécoupées ensuite ; trois fusionnées : le démon et deux correctifs de build. Deux posters, lors d'une session interne de l'ORNL et à la SMC 2025 avec Daniel Arndt, Jakob Bludau et Damien Lebrun-Grandié ; le poster SMC est cité dans le rapport de projet S4PST 2024–2025. J'ai aussi été invité à présenter ces travaux à SC25, ce que mon calendrier d'alternance n'a pas permis.",
        },
      ],
      links: [
        {
          label: "Kokkos Tools · PR #300",
          href: "https://github.com/kokkos/kokkos-tools/pull/300",
        },
        {
          label: "energy-dashboard-for-kokkos",
          href: "https://github.com/ethan-puyaubreau/energy-dashboard-for-kokkos",
        },
        {
          label: "Poster SMC 2025",
          href: "https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/",
        },
        { label: "Rapport S4PST (OSTI)", href: "https://www.osti.gov/biblio/3016977" },
        {
          label: "Toutes les pull requests kokkos-tools",
          href: "https://github.com/kokkos/kokkos-tools/pulls?q=is%3Apr+author%3Aethan-puyaubreau",
        },
      ],
    },
    {
      id: "edf-asics",
      figures: [
        { value: "bit à bit", label: "résultats identiques à la référence" },
        { value: "−12 %", label: "temps de calcul, meilleur cas" },
        { value: "−40 %", label: "pic mémoire" },
      ],
      kicker: "EDF Lab Paris-Saclay · groupe ASICS",
      title: "Rendre mesurable un code de simulation nucléaire",
      role: "Apprenti ingénieur",
      period: "2023 à 2026",
      stack: ["C++17", "Python", "PyBind11", "CMake", "GitLab CI/CD", "Jenkins", "Sphinx"],
      summary:
        "Une alternance de trois ans sur COCAGNE, la plateforme de simulation de cœurs de réacteurs d'EDF, plus de 500 000 lignes de C++ : les outils qui mesurent ses performances, un prototype de sa future architecture et la chaîne qui la livre en paquets Debian.",
      body: [
        {
          h: "Le contexte",
          p: "Le groupe ASICS d'EDF développe le calcul scientifique dont dépend la simulation nucléaire. J'ai travaillé au sein de l'équipe qui développe la plateforme : réunion de groupe hebdomadaire, revues de code données et reçues via les merge requests GitLab, et cinq notes techniques internes.",
        },
        {
          h: "Ce que j'ai construit",
          p: "Deux outils d'analyse de performance en C++ : un profileur mémoire qui intercepte l'allocation via LD_PRELOAD, et un outil de mesure temporelle hiérarchique avec bindings Python (PyBind11), chargé à l'exécution pour ne rien changer aux builds de production. Avec eux, j'ai mesuré le prototype que j'ai développé pour une nouvelle architecture modulaire du calcul de cœur (Ports et Composants) ; les trois chiffres de cette section en sont les résultats. J'ai aussi bâti le pipeline de packaging Debian sur GitLab CI/CD et Jenkins, et documenté les outils avec Sphinx pour que l'équipe puisse continuer à s'en servir.",
        },
      ],
      caveat: "Seul le travail ci-dessus peut être cité publiquement ; le reste est confidentiel.",
    },
  ],

  moreWork: [
    {
      name: "Homelab",
      blurb:
        "Le cluster Proxmox de cinq nœuds que j'exploite depuis 2020 pour une soixantaine d'utilisateurs réguliers : une vingtaine de services derrière un seul Traefik, la CI Gitea, Coolify et une VM Kubernetes (K3s) aujourd'hui, GitLab CI/CD, Ceph et Ansible au fil des ans, et un pipeline de déploiement qui annule le déploiement si le contrôle de santé échoue.",
      href: "/fr/cluster",
      hrefLabel: "Le cluster",
    },
    {
      name: "Événements DCS World",
      blurb:
        "De grands événements multijoueurs sur le simulateur de vol DCS World, que je conçois et organise depuis 2021 : 150 à plus de 180 participants, une équipe bénévole de quatre ou cinq personnes qui monte à une douzaine pour les finales, et un retour d'expérience écrit après chaque événement.",
      noLinkLabel: "en cours",
    },
    {
      name: "n-body galaxy",
      blurb:
        "Jusqu'à 65 536 corps en interaction gravitationnelle, intégrés en temps réel dans des compute shaders WebGPU. Un projet personnel.",
      href: "https://ethan-puyaubreau.github.io/nbody-webgpu/",
      hrefLabel: "En ligne",
    },
    {
      name: "vireli",
      blurb:
        "Une PWA d'empreinte carbone gamifiée, réalisée avec un partenaire industriel. J'ai dirigé l'équipe de six (554 heures au total) et pris en charge l'architecture, le backend et le déploiement ; les 18 exigences ont été livrées.",
      noLinkLabel: "en maintenance",
    },
  ],

  about: [
    "Je développe des logiciels de recherche pour le calcul haute performance : des outils qui rendent les codes scientifiques mesurables, et l'ingénierie autour (tests, packaging, CI/CD, versions publiées, documentation) qui permet à d'autres de s'y fier. Je sors diplômé de Polytech Paris-Saclay en septembre 2026 (diplôme d'ingénieur) et je cherche un poste d'ingénieur logiciel pour la recherche à partir de janvier 2027, dans un laboratoire national, une université ou un institut de recherche, en France comme à l'international.",
  ],

  timeline: [
    { when: "2023 à 2026", what: "Alternance HPC", where: "EDF Lab Paris-Saclay · ASICS" },
    {
      when: "Été 2025",
      what: "Outils de mesure d'énergie GPU + poster SMC25",
      where: "Oak Ridge National Laboratory",
    },
    { when: "Sept. 2026", what: "Diplôme d'ingénieur", where: "Polytech Paris-Saclay" },
  ],

  availability: {
    headline: "Ouvert aux postes d'ingénieur logiciel pour la recherche à partir de janvier 2027",
    detail:
      "Calcul haute performance et calcul scientifique, dans un laboratoire national, une université ou un institut de recherche, en France comme à l'international.",
    cta: "Le plus rapide pour me joindre",
    contactLabel: "Me contacter",
    mailSubject:
      "Poste d'ingénieur logiciel pour la recherche : prise de contact (dispo janv. 2027)",
  },
};
