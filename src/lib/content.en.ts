/**
 * English site content (the default locale, served at /).
 * Shape defined by SiteContent in content.types.ts. House style: no em dashes.
 */
import type { SiteContent } from "./content.types";

export const en: SiteContent = {
  sections: [
    { id: "work", label: "Work" },
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
        "Energy-measurement tooling for Kokkos, the C++ performance-portability library behind many US Department of Energy codes: a sampling daemon merged into Kokkos Tools, measurement connectors submitted upstream, tools tested on Frontier, and energy-dashboard-for-kokkos, an open-source analysis tool I rewrote in September 2026.",
      body: [
        {
          h: "The problem",
          p: "Kokkos runs one C++ source on NVIDIA, AMD, and Intel GPUs, and the same kernel draws different power on each. Kokkos Tools could only estimate a kernel's energy from two power readings, at its start and end, which NVML's 100 ms refresh makes unreliable; nothing integrated a continuous power trace per region, on DOE machines where power is now a first-class constraint.",
        },
        {
          h: "How it is built",
          p: "The tools attach at run time through Kokkos Tools, so an application is measured without a rebuild or a patch. The upstream connectors read power through NVML or Variorum; an AMD path through ROCm SMI, not public yet, is the version I ran on Frontier. energy-dashboard-for-kokkos, rewritten in Rust in September 2026, has a documented trace format, tests on a real GPU trace, and CI-built releases. The traces and script behind the DBSCAN figures are public, and CI recomputes them.",
        },
        {
          h: "Where it stands",
          p: "I wrote the sampling daemon (#300); my ORNL mentor, Jakob Bludau, carried it through review after my stay, and it was merged into kokkos-tools in March 2026. The core (#299) and the NVML and Variorum connectors (#301, #302) are still open. Nine pull requests to kokkos-tools and LAMMPS in all, some later split into smaller ones; three merged: the daemon and two build fixes. Two posters, at an ORNL internal session and at SMC 2025 with Daniel Arndt, Jakob Bludau and Damien Lebrun-Grandié; the SMC poster is cited in the S4PST 2024–2025 project report. I was also invited to present the work at SC25, which my apprenticeship schedule did not allow.",
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
        {
          label: "All kokkos-tools pull requests",
          href: "https://github.com/kokkos/kokkos-tools/pulls?q=is%3Apr+author%3Aethan-puyaubreau",
        },
      ],
    },
    {
      id: "edf-asics",
      figures: [
        { value: "bit for bit", label: "identical results to the reference" },
        { value: "−12%", label: "compute time, best case" },
        { value: "−38%", label: "peak memory" },
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
          p: "EDF's ASICS group develops the scientific computing behind nuclear simulation. I worked inside the team that develops the platform: weekly group meetings, code reviews given and received through GitLab merge requests, five internal technical notes, and support for the tools' users; the memory profiler pinned down a memory blow-up the team had been chasing for days.",
        },
        {
          h: "What I built",
          p: "Two C++ performance-analysis tools: a memory profiler that intercepts allocation through LD_PRELOAD, and a hierarchical timer with Python bindings (PyBind11) that loads at run time, so production builds stay untouched. With them I benchmarked the prototype I developed for a new modular architecture of the core computation (Ports and Components); the three figures in this section are its results. I also built the Debian packaging pipeline on GitLab CI/CD and Jenkins, and documented the tools in Sphinx so the team can keep using them.",
        },
      ],
      caveat: "The work above is cleared for public mention; the rest stays under confidentiality.",
    },
  ],

  moreWork: [
    {
      name: "Homelab",
      blurb:
        "The five-node Proxmox cluster I have run since 2020 for about 60 regular users: around 20 services behind one Traefik, Gitea CI, Coolify and a Kubernetes (K3s) VM today, GitLab CI/CD, Ceph and Ansible over the years, and a deploy pipeline that rolls back on a failed health check.",
      href: "/cluster",
      hrefLabel: "The cluster",
    },
    {
      name: "DCS World events",
      blurb:
        "Large multiplayer events in the flight simulator DCS World, designed and run since 2021: 150 to 180+ participants, a volunteer staff of four to five that grows to about twelve for the finals, and a written debrief after every event.",
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
      name: "vireli",
      blurb:
        "A gamified carbon-footprint PWA built with an industry partner. I led the team of six (554 hours in all) and owned the architecture, backend, and deployment; all 18 requirements were delivered.",
      noLinkLabel: "not public",
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
      "HPC and scientific computing, at a national lab, a university, or a research institute, in the US or in France. For US roles I need visa sponsorship (J-1 or H-1B).",
    cta: "The fastest way to reach me",
    contactLabel: "Get in touch",
    mailSubject: "Research software engineer role: getting in touch (available Jan 2027)",
  },
};
