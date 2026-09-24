/**
 * English site content (the default locale, served at /).
 * Shape defined by SiteContent in content.types.ts. House style: no em dashes.
 */
import type { SiteContent } from "./content.types";

export const en: SiteContent = {
  sections: [
    { id: "work", label: "Work" },
    { id: "writing", label: "Writing" },
    { id: "about", label: "Background" },
    { id: "contact", label: "Contact" },
  ],

  caseStudies: [
    {
      id: "ornl-kokkos",
      image: {
        src: "/work/smc2025-poster.jpg",
        alt: "The SMC 2025 poster, Understanding GPU Energy Dynamics in HPC Applications",
        href: "https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/",
        width: 600,
        height: 800,
      },
      kicker: "Oak Ridge National Laboratory · CSED",
      title: "Measuring where the energy goes on the GPU",
      role: "Graduate Research Fellow (GRO program)",
      period: "Summer 2025",
      stack: ["C++", "Kokkos", "CUDA", "NVML", "Variorum", "Rust"],
      summary:
        "Energy-measurement tooling for Kokkos, the C++ performance-portability library behind many US Department of Energy codes: a sampling daemon merged into Kokkos Tools, NVML and Variorum connectors open upstream, and kokkos-energy, a command-line analysis tool.",
      body: [
        {
          h: "The problem",
          p: "Kokkos lets one C++ source run across NVIDIA, AMD, and Intel GPUs, which is exactly why energy is hard to reason about: the same kernel draws different power on every backend, and application teams had no portable way to see it. On DOE machines, where power is now a first-class constraint, that blind spot matters.",
        },
        {
          h: "What I built",
          p: "Kokkos Tools connectors that sample power while kernels run and attribute the energy to the Kokkos regions that caused it: NVML for NVIDIA GPUs, Variorum for the whole node, a background sampling daemon, and CSV export. The analysis side is now kokkos-energy, a single Rust binary that prints a per-region energy table and exports a Perfetto timeline and a standalone HTML report. Application code stays untouched.",
        },
        {
          h: "Where it stands",
          p: "The sampling daemon is merged into kokkos-tools (#300); the core, NVML and Variorum connectors are open upstream (#299, #301, #302). Nine pull requests to kokkos-tools and LAMMPS in all, three merged. Two posters, at an ORNL internal session and at SMC 2025 with Daniel Arndt, Jakob Bludau and Damien Lebrun-Grandié, cited in the S4PST 2024–2025 project report.",
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
          label: "SMC 2025 poster",
          href: "https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/",
        },
        { label: "S4PST report (OSTI)", href: "https://www.osti.gov/biblio/3016977" },
      ],
    },
    {
      id: "edf-asics",
      figures: [
        { value: "bit for bit", label: "identical results to the reference" },
        { value: "−12%", label: "compute time, up to" },
        { value: "−40%", label: "peak memory" },
      ],
      kicker: "EDF Lab Paris-Saclay · ASICS group",
      title: "HPC for nuclear simulation",
      role: "Apprentice engineer",
      period: "2023 to 2026",
      stack: ["C++17", "Python", "CMake", "PostgreSQL", "Scibian 10/11"],
      summary:
        "A three-year apprenticeship building C++ performance tooling for COCAGNE, EDF's reactor-core simulation platform: a scientific codebase of more than 500,000 lines.",
      body: [
        {
          h: "The context",
          p: "EDF's ASICS group develops the scientific computing that nuclear simulation depends on. Alongside my engineering degree, I spent three years on COCAGNE, a reactor-core simulation platform of more than 500,000 lines of C++, on the performance and tooling that keep a codebase that size measurable.",
        },
        {
          h: "What I built",
          p: "Two internal C++ performance-analysis tools: a memory-profiling library that intercepts allocation through LD_PRELOAD, and a hierarchical CPU-timing tool with Python bindings via PyBind11. I built a prototype of the core computation on a Ports and Components model, validated with those two tools: bit-for-bit identical to the reference, up to 12% faster, with 40% lower peak memory. I also built the Debian packaging pipeline on GitLab CI/CD and Jenkins.",
        },
      ],
      caveat:
        "A three-year industrial apprenticeship. The work above is cleared for public mention; the rest stays under confidentiality.",
    },
    {
      id: "homelab",
      kicker: "Homelab, self-hosted",
      title: "Running my own production",
      role: "Architect & operator",
      period: "Ongoing",
      stack: ["Proxmox", "Traefik", "Docker", "Coolify", "VyOS / WireGuard"],
      summary:
        "A five-node Proxmox cluster hosting around 20 publicly reachable services on hardware I run and automate myself.",
      body: [
        {
          h: "The setup",
          p: "Five Proxmox nodes (edge, apps, aux, core, gpu) behind a VyOS edge over a WireGuard uplink. One Traefik terminates Let's Encrypt TLS for around 20 self-hosted services: a Gitea forge, a Coolify PaaS, Nextcloud, a media stack, and several of my own projects. The cluster's runbooks and automation are themselves a repo.",
        },
        {
          h: "Why it's here",
          p: "I am the only person on call: uptime, backups, certificate renewal, monitoring, and the unglamorous failure modes you only meet running your own infrastructure. My self-hosted projects ship to it through a CI/CD pipeline that builds a versioned image, scans it for vulnerabilities, and rolls back automatically on a failed health check.",
        },
      ],
      links: [{ label: "Explore the cluster", href: "/cluster" }],
    },
    {
      id: "endgame",
      compact: true,
      kicker: "Opération Endgame",
      title: "Running an event for 120+ participants",
      role: "Founder & organizer",
      period: "Since 2021",
      stack: ["Project management", "Operations", "Real-time coordination"],
      summary:
        "An annual online operation I've run since 2021: planning, real-time coordination, and logistics for 120+ simultaneous participants, 150+ registered for the latest edition.",
      body: [
        {
          h: "Running it",
          p: "Opération Endgame is the annual event I have designed and run since 2021: four hours, a fixed start time, 120+ participants active at once (150+ registered for the latest edition), split across several coordinated roles for the duration. Briefings, communication channels, the running order, and the fallback plan for a technical failure are all prepared in advance. On the day, the start time does not move.",
        },
      ],
    },
    {
      id: "commus",
      compact: true,
      kicker: "Community directory",
      title: "Mapping a community",
      role: "Full-stack",
      period: "Ongoing",
      stack: ["Vue 3", "TypeScript", "Python", "Self-hosted"],
      summary:
        "A directory of a French-speaking online community I built and host, with stats and infographics.",
      body: [
        {
          h: "What it is",
          p: "The directory indexes 57 entries, with filtering, comparison, and a set of infographics: a category breakdown, a timeline, an activity pulse. A Vue front end I host, kept current by a small updater service. It started from a concrete need: knowing who to invite to Opération Endgame.",
        },
      ],
    },
  ],

  moreWork: [
    {
      name: "n-body galaxy",
      blurb:
        "A galaxy of up to 65,536 bodies under mutual gravity, stepped live in WebGPU compute shaders. A side project.",
      href: "https://ethan-puyaubreau.github.io/nbody-webgpu/",
      hrefLabel: "Live",
    },
    {
      name: "isochrone-app",
      blurb:
        "An offline isochrone explorer wrapping a self-hosted Valhalla routing engine, shipped to desktop and web.",
      href: "https://github.com/ethan-puyaubreau/isochrone-app",
      hrefLabel: "GitHub",
    },
    {
      name: "vireli",
      blurb:
        "A gamified carbon-footprint PWA for an industry partner. I led the team of six: architecture, backend, and deployment.",
      noLinkLabel: "in maintenance",
    },
  ],

  about: [
    "I work on two tracks: the GPU and performance work that makes scientific code fast, and the infrastructure that puts software into production and keeps it there. I am graduating from Polytech Paris-Saclay (engineering degree, September 2026) and looking for a permanent role from January 2027: HPC labs, in the Bay Area as in Paris, or infrastructure, DevOps, SRE and platform teams; ideally a role that touches both.",
  ],

  timeline: [
    { when: "2023 to 2026", what: "HPC apprenticeship", where: "EDF Lab Paris-Saclay · ASICS" },
    {
      when: "Summer 2025",
      what: "GPU energy tooling + SMC25 poster",
      where: "Oak Ridge National Laboratory",
    },
    { when: "Sep 2026", what: "Engineering degree", where: "Polytech Paris-Saclay" },
  ],

  availability: {
    headline: "Open to HPC, infrastructure & DevOps roles from January 2027",
    detail: "For HPC labs or infrastructure and platform teams, in the Bay Area or Paris.",
    cta: "The fastest way to reach me",
    contactLabel: "Get in touch",
    mailSubject: "HPC / infrastructure role: getting in touch (available Jan 2027)",
  },
};
