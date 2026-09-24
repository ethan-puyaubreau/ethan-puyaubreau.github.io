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
        src: "/work/smc2025-poster-600.webp",
        srcset: "/work/smc2025-poster-320.webp 320w, /work/smc2025-poster-600.webp 600w",
        alt: "The SMC 2025 poster, Understanding GPU Energy Dynamics in HPC Applications",
        href: "https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/",
        width: 600,
        height: 800,
      },
      kicker: "Oak Ridge National Laboratory · CSED",
      title: "Measuring where the energy goes on the GPU",
      role: "Graduate Research Fellow (GRO program)",
      period: "Summer 2025",
      stack: ["C++", "Kokkos", "CUDA", "NVML", "ROCm SMI", "Variorum", "Rust"],
      summary:
        "Energy-measurement tooling for Kokkos, the C++ performance-portability library behind many US Department of Energy codes: a sampling daemon merged into Kokkos Tools, vendor connectors open upstream and tested on Frontier, and energy-dashboard-for-kokkos, an open-source analysis tool.",
      body: [
        {
          h: "The problem",
          p: "Kokkos lets one C++ source run across NVIDIA, AMD, and Intel GPUs, which is exactly why energy is hard to reason about: the same kernel draws different power on every backend, and application teams had no portable way to see it. On DOE machines, where power is now a first-class constraint, that blind spot matters.",
        },
        {
          h: "How it is built",
          p: "The tools attach at run time through the Kokkos Tools interface, so an application is measured as it is, without a rebuild or a patch. The connectors read NVIDIA power through NVML, AMD power through ROCm SMI, or any vendor Variorum supports. The analysis tool, energy-dashboard-for-kokkos, is a single Rust binary with a documented trace format, tests on real traces, and versioned releases.",
        },
        {
          h: "Where it stands",
          p: "The sampling daemon is merged into kokkos-tools (#300); the core, NVML and Variorum connectors are open upstream (#299, #301, #302) and still in review with the maintainers in 2026. Nine pull requests to kokkos-tools and LAMMPS in all, three merged. Two posters, at an ORNL internal session and at SMC 2025 with Daniel Arndt, Jakob Bludau and Damien Lebrun-Grandié, cited in the S4PST 2024–2025 project report. I was also invited to present the work at SC25.",
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
      title: "Making a nuclear simulation code measurable",
      role: "Apprentice engineer",
      period: "2023 to 2026",
      stack: ["C++17", "Python", "PyBind11", "CMake", "GitLab CI/CD", "Jenkins", "Sphinx"],
      summary:
        "A three-year apprenticeship on COCAGNE, EDF's reactor-core simulation platform of more than 500,000 lines of C++: the tools that measure its performance, a prototype of its next architecture, and the pipeline that packages it.",
      body: [
        {
          h: "The context",
          p: "EDF's ASICS group develops the scientific computing behind nuclear simulation. I worked inside the team that develops the platform: weekly group meetings, code reviews given and received through GitLab merge requests, and five internal technical notes.",
        },
        {
          h: "What I built",
          p: "Two C++ performance-analysis tools: a memory profiler that intercepts allocation through LD_PRELOAD, and a hierarchical timer with Python bindings (PyBind11) that loads at run time, so production builds stay untouched. With them I benchmarked the prototype I developed for a new modular architecture of the core computation (Ports and Components); the three figures in this section are its results. I also built the Debian packaging pipeline on GitLab CI/CD and Jenkins, and documented the tools in Sphinx so the team can keep using them.",
        },
      ],
      caveat: "The work above is cleared for public mention; the rest stays under confidentiality.",
    },
    {
      id: "homelab",
      kicker: "Homelab, self-hosted",
      title: "Running my own production",
      role: "Architect & operator",
      period: "Since 2020",
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
        "A five-node Proxmox cluster hosting around 20 services for about 60 regular users, on hardware I run and automate myself.",
      body: [
        {
          h: "The setup",
          p: "Five Proxmox nodes behind a VyOS edge router over a WireGuard uplink. One Traefik terminates Let's Encrypt TLS for around 20 services: a Gitea forge with its own CI, a Coolify PaaS, Nextcloud, media services, and my own projects. Over five years the cluster has also run GitLab CI/CD, K3s, Ceph storage, and Ansible automation. My projects ship through a pipeline that builds a versioned image, scans it, and rolls back automatically on a failed health check; I am the only person on call.",
        },
      ],
      links: [{ label: "Explore the cluster", href: "/cluster" }],
    },
  ],

  moreWork: [
    {
      name: "DCS World events",
      blurb:
        "Large multiplayer events in the flight simulator DCS World, designed and run since 2021: 150 to 180+ participants, a volunteer staff of four to five that grows to about twelve for the finals, and a written debrief after every event.",
      noLinkLabel: "since 2021",
    },
    {
      name: "Community directory",
      blurb:
        "A directory of French-speaking DCS World communities that I built and host: 57 entries, filtering, comparison, infographics, and a public API.",
      noLinkLabel: "ongoing",
    },
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
        "A gamified carbon-footprint PWA built with an industry partner. I led the team of six (554 hours in all) and owned the architecture, backend, and deployment; all 18 requirements were delivered.",
      noLinkLabel: "in maintenance",
    },
  ],

  about: [
    "I write research software for high-performance computing: tools that make scientific codes measurable, and the engineering around them (tests, packaging, CI/CD, releases, documentation) that lets other people rely on them. I graduate from Polytech Paris-Saclay in September 2026 with an engineering degree, equivalent to an M.Eng., and I am looking for a research software engineer role from January 2027, at a national lab, a university, or a research institute, in the US or in France.",
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
    headline: "Open to research software engineer roles from January 2027",
    detail:
      "HPC and scientific computing, at a national lab, a university, or a research institute, in the US or in France.",
    cta: "The fastest way to reach me",
    contactLabel: "Get in touch",
    mailSubject: "Research software engineer role: getting in touch (available Jan 2027)",
  },
};
