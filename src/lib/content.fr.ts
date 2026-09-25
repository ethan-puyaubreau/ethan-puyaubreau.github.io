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
      stack: ["C++", "Kokkos", "CUDA", "NVML", "ROCm SMI", "Variorum", "Slurm", "Rust"],
      summary:
        "Des outils de mesure d'énergie pour Kokkos, la bibliothèque C++ de portabilité des performances sur laquelle reposent de nombreux codes du Département de l'Énergie américain : un profileur d'énergie pour Kokkos Tools, avec des connecteurs NVML et Variorum, soumis en amont avec ses tests unitaires, dont le démon d'échantillonnage est déjà fusionné, et energy-dashboard-for-kokkos, l'outil d'analyse open source que j'ai réécrit en septembre 2026.",
      body: [
        {
          h: "Le problème",
          p: "Kokkos fait tourner un même code source C++ sur des GPU NVIDIA, AMD et Intel, et le même noyau consomme une puissance différente sur chacun. Kokkos Tools ne savait estimer l'énergie d'un noyau qu'à partir de deux lectures de puissance, au début et à la fin, ce que le rafraîchissement de NVML toutes les 100 ms rend peu fiable ; rien n'intégrait une trace continue par région, sur des machines du DOE où la puissance est devenue une contrainte majeure.",
        },
        {
          h: "Comment c'est construit",
          p: "Les outils se branchent à l'exécution par Kokkos Tools : une application se mesure sans recompilation ni correctif. Les connecteurs soumis en amont lisent la puissance via NVML ou Variorum ; une version AMD via ROCm SMI, pas encore publiée, est celle que j'ai fait tourner sur Frontier. energy-dashboard-for-kokkos, réécrit en Rust en septembre 2026, a un format de trace documenté, des tests sur une trace GPU réelle et des binaires publiés par la CI et archivés sur Zenodo avec un DOI. Les traces et le script derrière les chiffres DBSCAN sont publics, et la CI les recalcule.",
        },
        {
          h: "Où ça en est",
          p: "Le profileur est en relecture sous la forme de trois pull requests que j'ai écrites : le cœur et l'export des mesures (#299), le connecteur NVML (#301) et le connecteur Variorum (#302, environ 2 700 lignes avec ses tests unitaires, encore en brouillon). Son démon d'échantillonnage (#300) a été fusionné dans kokkos-tools en mars 2026, après que mon encadrant à l'ORNL, Jakob Bludau, l'a mené au bout de la relecture à la fin de mon séjour. Neuf pull requests vers kokkos-tools et LAMMPS au total, dont certaines redécoupées ensuite ; trois fusionnées : le démon et deux correctifs de build. Deux posters, lors d'une session interne de l'ORNL et à la SMC 2025 avec Daniel Arndt, Jakob Bludau et Damien Lebrun-Grandié ; le poster SMC est cité dans le rapport de projet S4PST 2024–2025.",
        },
      ],
      links: [
        {
          label: "Toutes les pull requests kokkos-tools",
          href: "https://github.com/kokkos/kokkos-tools/pulls?q=is%3Apr+author%3Aethan-puyaubreau",
        },
        {
          label: "Kokkos Tools · PR #300 (fusionnée)",
          href: "https://github.com/kokkos/kokkos-tools/pull/300",
        },
        {
          label: "energy-dashboard-for-kokkos",
          href: "https://github.com/ethan-puyaubreau/energy-dashboard-for-kokkos",
        },
        { label: "Archive Zenodo (DOI)", href: "https://doi.org/10.5281/zenodo.22943410" },
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
        { value: "−12 %", label: "temps de calcul, meilleur cas" },
        { value: "−38 %", label: "pic mémoire" },
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
          p: "Le groupe ASICS d'EDF développe le calcul scientifique dont dépend la simulation nucléaire. J'ai travaillé au sein de l'équipe qui développe la plateforme : réunion de groupe hebdomadaire, revues de code données et reçues via les merge requests GitLab, cinq notes techniques internes, et le support aux utilisateurs des outils ; le profileur mémoire a trouvé une explosion mémoire que l'équipe traquait depuis des jours.",
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
        "Le cluster Proxmox de cinq nœuds que j'exploite depuis 2020 pour une soixantaine d'utilisateurs réguliers : une vingtaine de services derrière un seul Traefik, la CI Gitea, Coolify et une VM Kubernetes (K3s) aujourd'hui, GitLab CI/CD, Ceph et Ansible au fil des ans, et un pipeline de déploiement qui revient à la version précédente si la vérification échoue.",
      href: "/fr/cluster",
      hrefLabel: "Le cluster",
    },
    {
      name: "n-body galaxy",
      blurb:
        "Jusqu'à 65 536 corps en interaction gravitationnelle, intégrés en temps réel dans des compute shaders WebGPU. Un projet personnel.",
      href: "https://ethan-puyaubreau.github.io/nbody-webgpu/",
      hrefLabel: "En ligne",
    },
    {
      name: "Événements DCS World",
      blurb:
        "Des événements multijoueurs de 150 à plus de 180 participants sur le simulateur de vol DCS World, organisés avec une équipe bénévole depuis 2021.",
      noLinkLabel: "en cours",
    },
  ],

  about: [
    "Je développe des logiciels de recherche pour le calcul haute performance : des outils qui rendent les codes scientifiques mesurables, et l'ingénierie autour (tests, packaging, CI/CD, versions publiées, documentation) qui permet à d'autres de s'y fier. Je suis diplômé de Polytech Paris-Saclay depuis septembre 2026 (diplôme d'ingénieur) et je cherche un poste d'ingénieur logiciel pour la recherche à partir de janvier 2027, dans un laboratoire national, une université ou un institut de recherche, en France comme à l'international.",
    "Langages : C++17 au quotidien, Python (NumPy, pandas) pour l'analyse et les bindings, Rust, CUDA. Build, tests et livraison : CMake, GitLab CI/CD, GitHub Actions, Jenkins, paquets Debian, Sphinx. Calcul par lots avec Slurm, sur Frontier et chez EDF. Anglais : langue de travail professionnelle (TOEIC 965) ; français langue maternelle.",
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
