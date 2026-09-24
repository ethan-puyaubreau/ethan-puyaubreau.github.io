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
      stack: ["C++", "Kokkos", "CUDA", "NVML", "ROCm SMI", "Variorum", "Rust"],
      summary:
        "Des outils de mesure d'énergie pour Kokkos, la bibliothèque C++ de portabilité des performances derrière de nombreux codes du Département de l'Énergie américain : un démon d'échantillonnage intégré à Kokkos Tools, des connecteurs constructeurs proposés en amont et testés sur Frontier, et energy-dashboard-for-kokkos, un outil d'analyse open source.",
      body: [
        {
          h: "Le problème",
          p: "Kokkos permet de faire tourner une même source C++ sur des GPU NVIDIA, AMD et Intel, et c'est précisément pour cela que l'énergie est difficile à évaluer : le même noyau consomme une puissance différente sur chaque backend, et les équipes applicatives n'avaient aucun moyen portable de la voir. Sur les machines du DOE, où la puissance est désormais une contrainte de premier ordre, cet angle mort compte.",
        },
        {
          h: "Comment c'est construit",
          p: "Les outils se branchent à l'exécution par l'interface Kokkos Tools : une application se mesure telle quelle, sans recompilation ni correctif. Les connecteurs lisent la puissance NVIDIA via NVML, la puissance AMD via ROCm SMI, ou celle de tout constructeur pris en charge par Variorum. L'outil d'analyse, energy-dashboard-for-kokkos, est un binaire Rust unique, avec un format de trace documenté, des tests sur des traces réelles et des versions publiées.",
        },
        {
          h: "Où ça en est",
          p: "Le démon d'échantillonnage est intégré à kokkos-tools (#300) ; le cœur et les connecteurs NVML et Variorum sont proposés en amont (#299, #301, #302) et toujours en revue avec les mainteneurs en 2026. Neuf pull requests vers kokkos-tools et LAMMPS au total, dont trois intégrées. Deux posters, lors d'une session interne de l'ORNL et à la SMC 2025 avec Daniel Arndt, Jakob Bludau et Damien Lebrun-Grandié, cités dans le rapport de projet S4PST 2024–2025. J'ai aussi été invité à présenter ces travaux à SC25.",
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
      title: "Rendre mesurable un code de simulation nucléaire",
      role: "Apprenti ingénieur",
      period: "2023 à 2026",
      stack: ["C++17", "Python", "PyBind11", "CMake", "GitLab CI/CD", "Jenkins", "Sphinx"],
      summary:
        "Une alternance de trois ans sur COCAGNE, la plateforme de simulation de cœurs de réacteurs d'EDF, plus de 500 000 lignes de C++ : les outils qui mesurent ses performances, un prototype de sa future architecture et le pipeline qui la package.",
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
    {
      id: "homelab",
      kicker: "Homelab auto-hébergé",
      title: "Héberger et exploiter mes propres services",
      role: "Architecte et exploitant",
      period: "Depuis 2020",
      stack: [
        "Proxmox",
        "Docker",
        "Traefik",
        "Gitea / Coolify",
        "GitLab CI",
        "K3s",
        "Ceph",
        "Ansible",
        "VyOS",
      ],
      summary:
        "Un cluster Proxmox de cinq nœuds qui héberge une vingtaine de services pour une soixantaine d'utilisateurs réguliers, sur du matériel que j'exploite et automatise moi-même.",
      body: [
        {
          h: "L'installation",
          p: "Cinq nœuds Proxmox derrière un routeur de bordure VyOS, relié par WireGuard. Un seul Traefik assure la terminaison TLS Let's Encrypt pour une vingtaine de services : une forge Gitea avec sa CI, un PaaS Coolify, Nextcloud, des services multimédias et mes propres projets. En cinq ans, le cluster a aussi fait tourner GitLab CI/CD, K3s, du stockage Ceph et de l'automatisation Ansible. Mes projets passent en production par un pipeline qui construit une image versionnée, la scanne et revient automatiquement en arrière si le contrôle de santé échoue ; je suis seul d'astreinte.",
        },
      ],
      links: [{ label: "Explorer le cluster", href: "/cluster" }],
    },
  ],

  moreWork: [
    {
      name: "Événements DCS World",
      blurb:
        "De grands événements multijoueurs sur le simulateur de vol DCS World, que je conçois et organise depuis 2021 : 150 à plus de 180 participants, une équipe bénévole de quatre ou cinq personnes qui monte à une douzaine pour les finales, et un retour d'expérience écrit après chaque événement.",
      noLinkLabel: "depuis 2021",
    },
    {
      name: "Annuaire communautaire",
      blurb:
        "L'annuaire des communautés francophones de DCS World, que j'ai conçu et que j'héberge : 57 entrées, filtrage, comparaison, infographies et une API publique.",
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
      name: "isochrone-app",
      blurb:
        "Un explorateur d'isochrones hors ligne, construit autour d'un moteur de routage Valhalla auto-hébergé, disponible en application de bureau et sur le web.",
      href: "https://github.com/ethan-puyaubreau/isochrone-app",
      hrefLabel: "GitHub",
    },
    {
      name: "vireli",
      blurb:
        "Une PWA d'empreinte carbone gamifiée, réalisée avec un partenaire industriel. J'ai dirigé l'équipe de six (554 heures au total) et pris en charge l'architecture, le backend et le déploiement ; les 18 exigences ont été livrées.",
      noLinkLabel: "en maintenance",
    },
  ],

  about: [
    "Je développe des logiciels de recherche pour le calcul haute performance : des outils qui rendent les codes scientifiques mesurables, et l'ingénierie autour (tests, packaging, CI/CD, versions publiées, documentation) qui permet à d'autres de s'y fier. Je sors diplômé de Polytech Paris-Saclay en septembre 2026 (diplôme d'ingénieur) et je cherche un poste d'ingénieur logiciel pour la recherche à partir de janvier 2027, dans un laboratoire national, une université ou un institut de recherche, en France ou aux États-Unis.",
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
    headline: "Ouvert aux postes d'ingénieur logiciel pour la recherche à partir de janvier 2027",
    detail:
      "Calcul haute performance et calcul scientifique, dans un laboratoire national, une université ou un institut de recherche, en France ou aux États-Unis.",
    cta: "Le plus rapide pour me joindre",
    contactLabel: "Me contacter",
    mailSubject:
      "Poste d'ingénieur logiciel pour la recherche : prise de contact (dispo janv. 2027)",
  },
};
