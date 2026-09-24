---
title: "Charging GPU energy to the code that spent it"
description: "A profiler tells you where GPU code spends time. I wanted to know where it spends joules, so I built a Kokkos Tools connector that samples power on a side thread and integrates it over each profiled region. On ArborX DBSCAN, the faster implementation saves more energy than time: 19% less time, 25% less energy."
pubDate: 2026-06-12
updatedDate: 2026-09-23
lang: en
slug: kokkos-gpu-energy
tags: ["HPC", "GPU", "Kokkos", "NVML"]
---

<p>I spent the summer of 2025 at Oak Ridge on this, and the question behind it is short: does the fastest way to compute something also cost the least energy? A profiler ranks code by time, but clusters increasingly run under a power cap rather than a clock-rate target, so energy-to-solution is becoming the number that matters, and almost nothing in a normal HPC workflow reports it per region. So I built a tool that does, as a Kokkos Tools connector that attributes joules to each profiled region without touching the application it measures.</p>

<p>Start with the result that ended up on the poster. ArborX ships two DBSCAN implementations, <code>fdbscan</code> and <code>fdbscan-dense</code>. On the same input and the same NVIDIA H100 NVL they return the same clusters, and over 64 runs of each, the dense one is faster and cheaper:</p>

<pre><code>variant         DBSCAN region   energy   mean power
---------------------------------------------------
fdbscan         2.69 s          777 J    288 W
fdbscan-dense   2.19 s          580 J    262 W
(medians over 64 runs each)</code></pre>

<figure>
  <img src="/blog/kokkos/fdbscan.png" alt="GPU power over time for ArborX fdbscan on an H100 NVL, a plateau near 300 W under a 350 W cap. Total estimated energy 925.1 J, of which 772.8 J inside kernel regions." width="1200" height="898" loading="lazy" />
  <img src="/blog/kokkos/fdbscan-dense.png" alt="GPU power over time for ArborX fdbscan-dense on the same GPU and input, a similar plateau. Total estimated energy 784.8 J, of which 615.6 J inside kernel regions." width="1200" height="898" loading="lazy" />
  <figcaption>Figure 3 of the poster: <code>fdbscan</code> (top) and <code>fdbscan-dense</code> (bottom). Shaded bands are Kokkos regions; the energy is the power trace integrated over time. The boxes on the poster sum every kernel region (772.8 J and 615.6 J); the home page counts only the DBSCANCalculation region of the same runs (769 J and 569 J).</figcaption>
</figure>

<p>So the faster variant also wins on energy, but by more: 25% less energy for 19% less time, because it also draws 9% less power while it runs. A time profile would report the 19%. The other six points only show up when you measure energy instead of inferring it from time.</p>

<h2>Instrumentation you do not have to compile in</h2>

<p>Kokkos already announces what it is doing. Every <code>parallel_for</code>, <code>parallel_reduce</code> and <code>parallel_scan</code> fires a begin callback before it launches and an end callback after it finishes, and you can wrap arbitrary spans in named regions with push and pop markers. A Kokkos Tools connector is just a shared library that implements those callbacks, and you attach it by pointing an environment variable at it: no recompile, no change to the application's source. You set <code>KOKKOS_TOOLS_LIBS</code> to the path of the library and the runtime loads it.</p>

<p>So I could take a solver I did not write, that nobody wanted me to patch, and measure the energy of its regions by loading one extra library next to it. The connector listens to the events Kokkos is already emitting, and the measurement rides along.</p>

<h2>You cannot read energy, only watch power</h2>

<p>The obvious first version reads the power sensor at the begin callback, reads it again at the end, and multiplies the average by the duration. It does not work, and the reason it does not work is the heart of the problem. NVIDIA's management library, NVML, exposes <code>nvmlDeviceGetPowerUsage</code>, which returns the board's instantaneous power draw in milliwatts. The catch is twofold. That value is refreshed only every 100 ms, and it averages just the last 25 ms of each interval (<a href="https://arxiv.org/abs/2312.02741">Yang et al., 2023</a>), so most of what the board does is never observed at all. Most HPC kernels run in under 10 ms: begin and end frequently return the same stale reading, and the duration tells you nothing. And even when a region is long enough to span several updates, two point readings cannot describe a curve that rises and falls across it.</p>

<p>The deeper issue is that power is the wrong quantity to sample at the boundaries. Power is a rate, in watts. What you pay for is energy, in joules, and energy is the integral of power over time. Two readings give you two heights of a curve. The bill is the area under it. My first version reported nonsense on short kernels, sometimes zero, sometimes the power of the previous kernel, depending on which side of a sensor update the two readings landed, and that was the signal to stop sampling on the kernel's schedule and start sampling on the clock's.</p>

<figure>
<svg viewBox="0 0 720 380" role="img" aria-label="A schematic power-versus-time trace for three profiled regions, A, B and C, each drawing a different power level. Sample dots sit at a fixed cadence along the curve. A dashed line marks the idle floor, and the area under the first region is shaded and labeled energy equals the integral of power over time." xmlns="http://www.w3.org/2000/svg">
  <g stroke="#c9c9c4" stroke-width="1">
    <line x1="70" y1="50" x2="70" y2="300"/>
    <line x1="70" y1="300" x2="700" y2="300"/>
  </g>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="10.5" fill="#5f5f5c" text-anchor="end">
    <line x1="66" y1="300" x2="70" y2="300" stroke="#c9c9c4"/><text x="61" y="304">0</text>
    <line x1="66" y1="217" x2="70" y2="217" stroke="#c9c9c4"/><text x="61" y="221">100</text>
    <line x1="66" y1="133" x2="70" y2="133" stroke="#c9c9c4"/><text x="61" y="137">200</text>
    <line x1="66" y1="50"  x2="70" y2="50"  stroke="#c9c9c4"/><text x="61" y="54">300</text>
  </g>
  <text x="70" y="36" font-family="Archivo Variable,system-ui,sans-serif" font-size="11" fill="#5f5f5c">power (W)</text>
  <text x="694" y="318" text-anchor="end" font-family="Archivo Variable,system-ui,sans-serif" font-size="11" fill="#5f5f5c">time &#8594;</text>
  <g font-family="JetBrains Mono Variable,ui-monospace,monospace" font-size="11" text-anchor="middle">
    <rect x="95"  y="50" width="160" height="250" fill="#b93a0a" opacity="0.05"/>
    <rect x="300" y="50" width="170" height="250" fill="#3d3d3d" opacity="0.06"/>
    <rect x="510" y="50" width="140" height="250" fill="#5f5f5c" opacity="0.05"/>
    <text x="175" y="64" fill="#9a3412">region A</text>
    <text x="385" y="64" fill="#111111">region B</text>
    <text x="580" y="64" fill="#3d3d3d">region C</text>
  </g>
  <polygon points="99,108 255,112 255,249 99,249" fill="#b93a0a" opacity="0.22"/>
  <polygon points="99,249 255,249 255,300 99,300" fill="#5f5f5c" opacity="0.10"/>
  <line x1="70" y1="249" x2="700" y2="249" stroke="#5f5f5c" stroke-width="1.2" stroke-dasharray="6 4"/>
  <text x="700" y="245" text-anchor="end" font-family="Archivo Variable,system-ui,sans-serif" font-size="10.5" fill="#5f5f5c">idle floor</text>
  <polyline fill="none" stroke="#111111" stroke-width="2"
    points="70,249 95,249 99,108 255,112 259,249 300,249 304,193 470,196 474,249 510,249 514,214 540,205 562,221 586,208 612,220 640,210 650,214 654,249 700,249"/>
  <g fill="#b93a0a">
    <circle cx="84" cy="249" r="2.4"/>
    <circle cx="112" cy="109" r="2.4"/><circle cx="138" cy="110" r="2.4"/><circle cx="164" cy="110" r="2.4"/>
    <circle cx="190" cy="111" r="2.4"/><circle cx="216" cy="111" r="2.4"/><circle cx="242" cy="112" r="2.4"/>
    <circle cx="278" cy="249" r="2.4"/>
    <circle cx="320" cy="194" r="2.4"/><circle cx="346" cy="195" r="2.4"/><circle cx="372" cy="195" r="2.4"/>
    <circle cx="398" cy="195" r="2.4"/><circle cx="424" cy="196" r="2.4"/><circle cx="450" cy="196" r="2.4"/>
    <circle cx="492" cy="249" r="2.4"/>
    <circle cx="528" cy="210" r="2.4"/><circle cx="554" cy="216" r="2.4"/><circle cx="580" cy="212" r="2.4"/>
    <circle cx="606" cy="216" r="2.4"/><circle cx="632" cy="212" r="2.4"/>
    <circle cx="676" cy="249" r="2.4"/>
  </g>
  <text x="177" y="180" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#9a3412">Energy = &#8747; P dt</text>
  <text x="177" y="198" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="10.5" fill="#9a3412">area above idle = marginal cost</text>
</svg>
<figcaption>A schematic, not a measurement. One region's energy is the area under its power curve. The dashed line is the idle floor; the marginal cost of a region is the part of the area that sits above it. The dots are the side thread sampling at a fixed cadence.</figcaption>
</figure>

<h2>A side thread, a fixed cadence, and a trapezoid</h2>

<p>So sampling has to be separated from the kernels entirely. A background thread polls the power sensor on a fixed interval, a few milliseconds apart, and timestamps every reading, building a continuous trace of how the board's draw moved through the whole run. The begin and end callbacks no longer read power at all. They record a wall-clock window, the moment the region opened and the moment it closed. To get a region's energy, the connector integrates the power trace over that window with the trapezoidal rule, summing the little trapezoids between consecutive samples that fall inside it. Because the same region is entered many times, its joules accumulate across every call.</p>

<p>Sampling on the clock instead of on the kernel gives a continuous trace, but it cannot beat the sensor. With a 25 ms window every 100 ms, a single short kernel is effectively invisible, and adding up many launches does not fix a blind spot that recurs at the same phase. What the trace does measure reliably is a region much longer than the refresh interval: a solver phase, or a whole algorithm, like the two DBSCAN runs above. The poster pushes resolution a little further by repeating a run 64 times, shifting its start by 5 ms each time and keeping the highest reading, but the conclusion stands: per-kernel energy is out of reach through NVML.</p>

<h2>The limits of the number</h2>

<p>NVML reports power for the whole board, not per streaming multiprocessor, so this is whole-GPU attribution. If two kernels run concurrently on the same device, on separate streams, the trace cannot tell you which one drew which watt, and the energy of the overlap cannot be split cleanly between them. The total also includes whatever the board draws between regions: in the DBSCAN runs above, 16.5% and 21.6% of the energy falls outside any Kokkos region, which is why the connector reports both numbers. Whole-device attribution is enough to compare algorithms by energy, and not enough to rank individual kernels.</p>

<h2>Two backends, two different questions</h2>

<p>NVML answers one question: what this NVIDIA GPU drew. It reports per board, in milliwatts, NVIDIA only, and sees nothing outside the card. So the connector has a second backend built on Variorum, which is vendor-neutral and reads power at the node and socket level, including the CPU (through RAPL, the power counters built into Intel and AMD processors), the DRAM, and some non-NVIDIA GPUs. NVML gives you what the GPU drew, Variorum what the whole node drew. A region that looks cheap on the card can still be shuffling enough data to light up the CPU and the memory controllers around it, and only the node-level view catches that. You reach for NVML when the question is what the GPU itself spent, and for Variorum when you want the energy bill the machine room actually sees.</p>

<figure>
<svg viewBox="0 0 760 340" role="img" aria-label="The connector pipeline. The Kokkos application fires Tools callbacks at every parallel region; the energy connector receives a power trace from a sampler thread that reads power out of band at a fixed interval; NVML and Variorum feed the sampler; the connector integrates the trace per region into joules, which flow to kokkos-energy, the analysis tool." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-k1" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#111111"/>
    </marker>
  </defs>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="12.5" fill="#111111" text-anchor="middle">
    <rect x="16"  y="60" width="132" height="52" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="82" y="82">Kokkos app</text>
    <text x="82" y="99" font-size="10" fill="#5f5f5c">parallel_for · regions</text>
    <rect x="172" y="60" width="120" height="52" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="232" y="82">Tools callbacks</text>
    <text x="232" y="99" font-size="10.5" fill="#5f5f5c">begin / end</text>
    <rect x="316" y="60" width="124" height="52" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.6"/>
    <text x="378" y="82" fill="#111111">energy connector</text>
    <text x="378" y="99" font-size="10.5" fill="#9a3412">&#8747; trapezoid</text>
    <rect x="464" y="60" width="134" height="52" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="531" y="82">joules per region</text>
    <text x="531" y="99" font-size="10.5" fill="#5f5f5c">summed over calls</text>
    <rect x="622" y="60" width="122" height="52" rx="8" fill="#eeeeeb" stroke="#3d3d3d" stroke-width="1.4"/>
    <text x="683" y="82" fill="#111111">kokkos-energy</text>
    <text x="683" y="99" font-size="10.5" fill="#3d3d3d">table · trace · HTML</text>
  </g>
  <g stroke="#111111" stroke-width="1.5" fill="none">
    <line x1="148" y1="86" x2="170" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="292" y1="86" x2="314" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="440" y1="86" x2="462" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="598" y1="86" x2="620" y2="86" marker-end="url(#ar-k1)"/>
  </g>
  <rect x="150" y="208" width="448" height="96" rx="10" fill="none" stroke="#a8a8a3" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="374" y="202" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#5f5f5c">power read out of band, on a fixed cadence</text>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="12.5" fill="#111111" text-anchor="middle">
    <rect x="166" y="232" width="120" height="50" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="226" y="254">NVML</text>
    <text x="226" y="271" font-size="10" fill="#5f5f5c">per-GPU · mW</text>
    <rect x="316" y="232" width="124" height="50" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="378" y="254">sampler thread</text>
    <text x="378" y="271" font-size="10" fill="#5f5f5c">read power every &#916;t</text>
    <rect x="470" y="232" width="124" height="50" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="532" y="254">Variorum</text>
    <text x="532" y="271" font-size="10" fill="#5f5f5c">node · CPU+DRAM</text>
  </g>
  <g stroke="#111111" stroke-width="1.5" fill="none">
    <line x1="286" y1="257" x2="314" y2="257" marker-end="url(#ar-k1)"/>
    <line x1="470" y1="257" x2="442" y2="257" marker-end="url(#ar-k1)"/>
    <line x1="378" y1="232" x2="378" y2="114" marker-end="url(#ar-k1)"/>
  </g>
  <text x="392" y="180" text-anchor="start" font-family="Archivo Variable,system-ui,sans-serif" font-size="11" font-style="italic" fill="#5f5f5c">integrated trace</text>
</svg>
<figcaption>The callbacks only mark when each region opens and closes. The energy comes from a separate power trace the connector integrates over those windows, with NVML or Variorum underneath the sampler depending on whether you are asking about the card or the node.</figcaption>
</figure>

<h2>What per-region joules buy you</h2>

<p>Once energy is attributed to the region that spent it, you can finally optimize the quantity you are actually billed for instead of using time as a stand-in and hoping the two agree. They do not always agree: the fastest code is not always the most energy-efficient, because going fast can mean running the silicon at its power ceiling, and a slower memory-bound phase can be the cheaper one to run a million times. Even between two correct implementations of the same algorithm, the energy gap (25%) can be wider than the time gap (19%).</p>

<p>The sampling daemon is merged into <code>kokkos/kokkos-tools</code> (#300); the core, NVML and Variorum connectors (#299, #301, #302) are still open upstream. The CSV trace first fed a Grafana and PostgreSQL dashboard; it now goes to <a href="https://github.com/ethan-puyaubreau/energy-dashboard-for-kokkos">kokkos-energy</a>, a single Rust binary with no daemon and no Docker, which prints a per-region energy table, exports a Perfetto timeline, and writes a standalone HTML report. The full results are on the page of <a href="https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/">the poster I co-authored with Daniel Arndt, Jakob Bludau and Damien Lebrun-Grandié</a> (SMC 2025). What is still missing is resolution finer than the whole board and than the 100 ms refresh: attribution stays at the scale of the GPU, and I have no clean answer for concurrent streams.</p>
