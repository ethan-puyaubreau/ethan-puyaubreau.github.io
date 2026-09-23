/**
 * English site content (the default locale, served at /).
 * Shape defined by SiteContent in content.types.ts. House style: no em dashes.
 */
import type { SiteContent } from "./content.types";

export const en: SiteContent = {
  sections: [
    { id: "work", num: "01", label: "Selected work" },
    { id: "expertise", num: "02", label: "Expertise" },
    { id: "writing", num: "03", label: "Writing" },
    { id: "about", num: "04", label: "Trajectory" },
    { id: "contact", num: "05", label: "Contact" },
  ],

  caseStudies: [
    {
      id: "ornl-kokkos",
      num: "01",
      kicker: "Oak Ridge National Laboratory · CSED",
      title: "Measuring where the energy goes on the GPU",
      role: "Research intern",
      period: "Summer 2025",
      stack: ["C++", "Kokkos", "CUDA", "NVML", "Variorum", "Python"],
      flagship: true,
      summary:
        "Energy-measurement tooling for Kokkos, the C++ performance-portability library behind many US Department of Energy codes: a sampling daemon merged into Kokkos Tools, NVML and Variorum connectors open upstream, and an analysis dashboard.",
      body: [
        {
          h: "The problem",
          p: "Kokkos lets one C++ source run across NVIDIA, AMD, and Intel GPUs, which is exactly why energy is hard to reason about: the same kernel draws different power on every backend, and application teams had no portable way to see it. On DOE machines, where power is now a first-class constraint, that blind spot matters.",
        },
        {
          h: "What I built",
          p: "A set of Kokkos Tools connectors that sample power while kernels run and attribute the integrated energy to the Kokkos regions that caused it: an NVML backend for NVIDIA GPUs, a Variorum backend for node-level power, a background daemon sampling on a fixed interval, and CSV export. On top, a Grafana dashboard, fed by a Python aggregation step, turns that output into per-region energy analysis. It hooks the Kokkos profiling interface, so application code is untouched.",
        },
        {
          h: "Where it stands",
          p: "The periodic-sampling daemon is merged into kokkos-tools (#300); the core, NVML and Variorum connectors are open upstream (#299, #301, #302), with ROCm SMI sketched for AMD. The results became a poster with Daniel Arndt, Jakob Bludau and Damien Lebrun-Grandié, 'Understanding GPU Energy Dynamics in HPC Applications', presented at the 2025 Smoky Mountains Conference and cited in the S4PST 2024–2025 project report (ORNL/SPR-2026/4406).",
        },
      ],
      links: [
        {
          label: "Kokkos Tools · PR #300",
          href: "https://github.com/kokkos/kokkos-tools/pull/300",
        },
        {
          label: "Energy dashboard",
          href: "https://github.com/ethan-puyaubreau/energy-dashboard-for-kokkos",
        },
        { label: "SMC 2025 poster", href: "https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/" },
        { label: "S4PST report (OSTI)", href: "https://www.osti.gov/biblio/3016977" },
      ],
    },
    {
      id: "edf-asics",
      num: "02",
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
      num: "03",
      kicker: "homelab cluster · self-hosted",
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
      num: "04",
      kicker: "Opération Endgame",
      title: "Running an event for 120+ participants",
      role: "Founder & organiser",
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
      num: "05",
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
        "The field behind this page: 16,384 bodies under mutual gravity, stepped live in WebGPU compute shaders. A side project.",
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

  expertise: [
    {
      title: "GPU & HPC",
      blurb: "Writing for the GPU and reasoning about what it costs, in time and now in energy.",
      items: [
        "CUDA",
        "OpenMP & MPI",
        "Kokkos & performance portability",
        "GPU power & energy telemetry",
      ],
      provenBy: { label: "ORNL × Kokkos", id: "ornl-kokkos" },
    },
    {
      title: "Performance engineering & tooling",
      blurb:
        "Internal C++ tools that keep a large scientific codebase measurable, and the build pipeline around them.",
      items: [
        "Memory profiling (LD_PRELOAD)",
        "CPU timing & instrumentation (PyBind11)",
        "C++ build systems (CMake)",
        "Debian packaging & CI (GitLab CI/CD, Jenkins)",
      ],
      provenBy: { label: "EDF · ASICS", id: "edf-asics" },
    },
    {
      title: "Infrastructure & DevOps",
      blurb:
        "The full path from a commit to a request served, and the reliability work behind it, on hardware I'm accountable for.",
      items: [
        "Proxmox VE clustering",
        "Kubernetes / K3s",
        "Traefik, TLS & reverse proxy",
        "Docker & Gitea CI/CD",
      ],
      provenBy: { label: "homelab cluster", id: "homelab" },
    },
    {
      title: "Full-stack & real-time",
      blurb: "Interfaces and live systems, including the one rendering this page.",
      items: ["Vue 3 / Nuxt 3", "TypeScript", "Self-hosting & deployment", "Astro"],
      provenBy: { label: "community directory", id: "commus" },
    },
    {
      title: "Security",
      blurb: "The defensive basics a self-hosted, internet-facing cluster forces you to get right.",
      items: [
        "TLS & PKI (Let's Encrypt, ACME)",
        "Network segmentation (VLAN, WireGuard)",
        "Edge & reverse-proxy hardening",
        "Secrets & access hygiene",
      ],
      provenBy: { label: "homelab cluster", id: "homelab" },
    },
  ],

  about: [
    "I work two tracks at once. One is high-performance computing: the GPU and performance work that makes scientific code fast. The other is the infrastructure that puts software into production and keeps it there: containers, pipelines, reverse proxies, and the cluster underneath. The two meet quickly: the code I tune ends up on machines someone has to operate, and I have worked both ends.",
    "At Oak Ridge National Laboratory I built GPU energy-measurement tooling for Kokkos, the portability layer that runs US Department of Energy codes on its supercomputers. The periodic-sampling daemon is merged upstream into Kokkos Tools, and the work became a poster with my ORNL mentors, Daniel Arndt, Jakob Bludau and Damien Lebrun-Grandié, at the 2025 Smoky Mountains Conference.",
    "Alongside that I spent three years as an apprentice on HPC for nuclear simulation at EDF, and I run a five-node production cluster of my own: around twenty services behind Traefik and TLS, deployed with Docker and CI/CD, with image scanning and automatic rollback. When something breaks at three in the morning, there is nobody else to call.",
    "I am graduating from Polytech Paris-Saclay (engineering degree, September 2026) and am looking for a permanent role from January 2027. HPC labs are a natural fit, in the Bay Area (Berkeley Lab, LLNL) as in Paris (the CEA, for one), but I am just as interested in infrastructure, DevOps, SRE, and platform engineering, on-prem or in the cloud; ideally a role that touches both.",
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
