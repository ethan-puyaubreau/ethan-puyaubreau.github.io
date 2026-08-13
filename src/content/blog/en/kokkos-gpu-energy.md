---
title: "Charging GPU energy to the kernel that spent it"
description: "A profiler tells you where a GPU kernel spends time. I wanted to know where it spends joules. So I built a Kokkos Tools connector that samples power on a side thread and integrates it over each profiled region, with NVML for the precise per-GPU number and Variorum for the whole node."
pubDate: 2026-06-12
lang: en
slug: kokkos-gpu-energy
tags: ["HPC", "GPU", "Kokkos", "NVML"]
---

<p>I spent a summer at Oak Ridge working on this, and the question that started it is short: the kernel that took the most wall-clock time in my run was not the kernel that cost the most energy. The profiler ranked everything by time and was confident about it, and that ranking was simply the wrong one if the thing you are being asked to reduce is the power bill. Clusters increasingly run under a power cap rather than a clock-rate target, so energy-to-solution is becoming the number that matters, and almost nothing in a normal HPC workflow reports it per kernel. So I built a tool that does, as a Kokkos Tools connector that attributes joules to each profiled region without touching the application it measures.</p>

<p>Start with the table it produces.</p>

<pre><code>$ export KOKKOS_TOOLS_LIBS=/opt/kp/libkp_gpu_energy.so
$ ./solver --mesh big.h5

region            calls     time(s)   energy(J)   J/call   avg(W)
-----------------------------------------------------------------
gemm_apply        12480       8.42      1936.1     0.155      230
spmv_matvec       49920      11.07      1421.8     0.028      128
halo_exchange     49920       3.91       402.7     0.008      103
-----------------------------------------------------------------
device idle baseline ~ 61 W  (subtracted for the J/call column)</code></pre>

<p>The sparse mat-vec ran the longest, eleven seconds against the dense block's eight, and still cost a third less energy, because it is memory bound and leaves the GPU drawing roughly half the power. Time told me to optimize <code>spmv_matvec</code>. Energy told me to look at <code>gemm_apply</code> first. Those are different instructions, and until this connector existed I could only see the first one.</p>

<h2>Kokkos Tools, or instrumentation you do not have to compile in</h2>

<p>Kokkos already announces what it is doing. Every <code>parallel_for</code>, <code>parallel_reduce</code> and <code>parallel_scan</code> fires a begin callback before it launches and an end callback after it finishes, and you can wrap arbitrary spans in named regions with push and pop markers. A Kokkos Tools connector is just a shared library that implements those callbacks, and you attach it by pointing an environment variable at it. There is no recompile of the application, no annotation in its source, no fork of the code. You set <code>KOKKOS_TOOLS_LIBS</code> to the path of the library and the runtime loads it.</p>

<p>So I could take a solver I did not write, that nobody wants me to patch, and learn the energy cost of each of its kernels by loading one extra library next to it. The connector listens to the events Kokkos is already emitting, and the measurement rides along.</p>

<h2>You cannot read energy, only watch power</h2>

<p>The obvious first version reads the power sensor at the begin callback, reads it again at the end, and reports the average times the duration. It does not work, and the reason it does not work is the heart of the problem. NVIDIA's management library, NVML, exposes <code>nvmlDeviceGetPowerUsage</code>, which returns the board's instantaneous power draw in milliwatts. The catch is twofold. That sensor updates at a modest rate, on the order of tens of hertz, and a GPU kernel can easily be shorter than the interval between two updates, so begin and end frequently return the same stale reading and the duration tells you nothing. And even when the kernel is long enough to span several updates, two point readings cannot describe a curve that rises and falls across the kernel's lifetime.</p>

<p>The deeper issue is that power is the wrong quantity to sample at the boundaries. Power is instantaneous, watts, a rate. What you are paying for is energy, joules, and energy is the integral of power over time. Two readings give you two heights of a curve. The bill is the area under it. My first version reported nonsense on short kernels, sometimes even a negative delta when the two readings landed on opposite sides of a sensor update, and that was the signal to stop sampling on the kernel's schedule and start sampling on the clock's.</p>

<figure>
<svg viewBox="0 0 720 380" role="img" aria-label="A power-versus-time trace for three GPU kernels. The dense block kernel runs near 230 watts, the sparse mat-vec near 128 watts for longer, and the halo exchange near 103 watts. Sample dots sit at a fixed cadence along the curve. A dashed line marks the idle baseline at about 61 watts, and the area under the first kernel is shaded and labelled energy equals the integral of power over time." xmlns="http://www.w3.org/2000/svg">
  <g stroke="#cdc3b1" stroke-width="1">
    <line x1="70" y1="50" x2="70" y2="300"/>
    <line x1="70" y1="300" x2="700" y2="300"/>
  </g>
  <g font-family="ui-sans-serif,system-ui,sans-serif" font-size="10.5" fill="#8a7d63" text-anchor="end">
    <line x1="66" y1="300" x2="70" y2="300" stroke="#cdc3b1"/><text x="61" y="304">0</text>
    <line x1="66" y1="217" x2="70" y2="217" stroke="#cdc3b1"/><text x="61" y="221">100</text>
    <line x1="66" y1="133" x2="70" y2="133" stroke="#cdc3b1"/><text x="61" y="137">200</text>
    <line x1="66" y1="50"  x2="70" y2="50"  stroke="#cdc3b1"/><text x="61" y="54">300</text>
  </g>
  <text x="70" y="36" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" fill="#6b6258">power (W)</text>
  <text x="694" y="318" text-anchor="end" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" fill="#6b6258">time &#8594;</text>
  <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" text-anchor="middle">
    <rect x="95"  y="50" width="160" height="250" fill="#c8821e" opacity="0.05"/>
    <rect x="300" y="50" width="170" height="250" fill="#5f8a3a" opacity="0.06"/>
    <rect x="510" y="50" width="140" height="250" fill="#b3563a" opacity="0.05"/>
    <text x="175" y="64" fill="#7a4e10">gemm</text>
    <text x="385" y="64" fill="#3f6326">spmv</text>
    <text x="580" y="64" fill="#8a3a22">halo</text>
  </g>
  <polygon points="99,108 255,112 255,249 99,249" fill="#c8821e" opacity="0.22"/>
  <polygon points="99,249 255,249 255,300 99,300" fill="#6b6258" opacity="0.10"/>
  <line x1="70" y1="249" x2="700" y2="249" stroke="#8a7d63" stroke-width="1.2" stroke-dasharray="6 4"/>
  <text x="700" y="245" text-anchor="end" font-family="ui-sans-serif,system-ui,sans-serif" font-size="10.5" fill="#8a7d63">idle ~ 61 W</text>
  <polyline fill="none" stroke="#2b2620" stroke-width="2"
    points="70,249 95,249 99,108 255,112 259,249 300,249 304,193 470,196 474,249 510,249 514,214 540,205 562,221 586,208 612,220 640,210 650,214 654,249 700,249"/>
  <g fill="#c8821e">
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
  <text x="177" y="180" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" fill="#7a4e10">Energy = &#8747; P dt</text>
  <text x="177" y="198" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="10.5" fill="#9a6a1e">area above idle = marginal cost</text>
</svg>
<figcaption>One region's energy is the area under its power curve. The dashed line is the idle floor; the marginal cost of a kernel is the part of the area that sits above it. The dots are the side thread sampling at a fixed cadence, not at the kernel boundaries.</figcaption>
</figure>

<h2>A side thread, a fixed cadence, and a trapezoid</h2>

<p>So sampling has to be separated from the kernels entirely. A background thread polls the power sensor on a fixed interval, a few milliseconds apart, and timestamps every reading, building a continuous trace of how the board's draw moved through the whole run. The begin and end callbacks no longer read power at all. They record a wall-clock window, the moment the region opened and the moment it closed. To get a region's energy, the connector integrates the power trace over that window with the trapezoidal rule, summing the little trapezoids between consecutive samples that fall inside it. Because the same region is entered thousands of times, its joules accumulate across every call, which is the <code>energy(J)</code> column above and the only workable way to talk about a kernel that runs in tens of microseconds.</p>

<p>Sampling on the clock instead of on the kernel is what makes short kernels measurable. A single launch may be too brief to catch even one fresh sensor reading, but ten thousand launches under a steadily polled trace land enough samples that the aggregate is sound. The trade is a little overhead from the polling thread and a resolution floor set by the sample interval, and both are small and, more to the point, bounded and known.</p>

<h2>What the number is, and what it is not</h2>

<p>The table implies more precision than it has. NVML reports power for the whole board, not per streaming multiprocessor, so this is whole-GPU attribution. If two kernels run concurrently on the same device, on separate streams, the trace cannot tell you which one drew which watt, and the energy of the overlap cannot be split cleanly between them. The figure also includes the device's idle draw, the tens of watts a powered-on GPU spends doing nothing, so for the marginal cost of a kernel you measure an idle baseline with the device quiet and subtract it, which is the line under the table and the floor in the diagram. None of this makes the measurement wrong: it is whole-device, which is enough for ranking kernels by energy.</p>

<h2>Two backends, two different questions</h2>

<p>NVML answers one question very precisely: what did this NVIDIA GPU draw. It is per-board, milliwatt-resolution, and NVIDIA-only, and it sees nothing outside the card. So the connector has a second backend built on Variorum, which is vendor-neutral and reads power at the node and socket level, including the CPU through RAPL, the power counters built into Intel and AMD processors, the DRAM, and some GPUs across hardware that is not NVIDIA. The two are not redundant: NVML gives you what the GPU drew, Variorum what the whole node drew. A kernel that looks cheap on the card can still be shuffling enough data to light up the CPU and the memory controllers around it, and only the node-level view catches that. You reach for NVML when you are tuning a GPU kernel in isolation and for Variorum when you want the energy bill the machine room actually sees.</p>

<figure>
<svg viewBox="0 0 760 340" role="img" aria-label="The connector pipeline. The Kokkos application fires Tools callbacks at every parallel region; the energy connector receives a power trace from a sampler thread that reads power out of band at a fixed interval; NVML and Variorum feed the sampler; the connector integrates the trace per region into joules, which flow to a dashboard." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-k1" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#2b2620"/>
    </marker>
  </defs>
  <g font-family="ui-sans-serif,system-ui,sans-serif" font-size="12.5" fill="#2b2620" text-anchor="middle">
    <rect x="16"  y="60" width="132" height="52" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="82" y="82">Kokkos app</text>
    <text x="82" y="99" font-size="10" fill="#6b6258">parallel_for · regions</text>
    <rect x="172" y="60" width="120" height="52" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="232" y="82">Tools callbacks</text>
    <text x="232" y="99" font-size="10.5" fill="#6b6258">begin / end</text>
    <rect x="316" y="60" width="124" height="52" rx="8" fill="#f6ead2" stroke="#c8821e" stroke-width="1.4"/>
    <text x="378" y="82" fill="#7a4e10">energy connector</text>
    <text x="378" y="99" font-size="10.5" fill="#9a6a1e">&#8747; trapezoid</text>
    <rect x="464" y="60" width="134" height="52" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="531" y="82">joules per region</text>
    <text x="531" y="99" font-size="10.5" fill="#6b6258">summed over calls</text>
    <rect x="622" y="60" width="122" height="52" rx="8" fill="#e7efe0" stroke="#5f8a3a" stroke-width="1.4"/>
    <text x="683" y="82" fill="#3f6326">dashboard</text>
    <text x="683" y="99" font-size="10.5" fill="#4d7030">joules / run</text>
  </g>
  <g stroke="#2b2620" stroke-width="1.5" fill="none">
    <line x1="148" y1="86" x2="170" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="292" y1="86" x2="314" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="440" y1="86" x2="462" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="598" y1="86" x2="620" y2="86" marker-end="url(#ar-k1)"/>
  </g>
  <rect x="150" y="208" width="448" height="96" rx="10" fill="none" stroke="#b9ad97" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="374" y="202" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11.5" fill="#8a7d63">power read out of band, on a fixed cadence</text>
  <g font-family="ui-sans-serif,system-ui,sans-serif" font-size="12.5" fill="#2b2620" text-anchor="middle">
    <rect x="166" y="232" width="120" height="50" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="226" y="254">NVML</text>
    <text x="226" y="271" font-size="10" fill="#6b6258">per-GPU · mW</text>
    <rect x="316" y="232" width="124" height="50" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="378" y="254">sampler thread</text>
    <text x="378" y="271" font-size="10" fill="#6b6258">read power every &#916;t</text>
    <rect x="470" y="232" width="124" height="50" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="532" y="254">Variorum</text>
    <text x="532" y="271" font-size="10" fill="#6b6258">node · CPU+DRAM</text>
  </g>
  <g stroke="#2b2620" stroke-width="1.5" fill="none">
    <line x1="286" y1="257" x2="314" y2="257" marker-end="url(#ar-k1)"/>
    <line x1="470" y1="257" x2="442" y2="257" marker-end="url(#ar-k1)"/>
    <line x1="378" y1="232" x2="378" y2="114" marker-end="url(#ar-k1)"/>
  </g>
  <text x="392" y="180" text-anchor="start" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" font-style="italic" fill="#6b6258">the trace, not a boundary reading</text>
</svg>
<figcaption>The callbacks only mark when each region opens and closes. The energy comes from a separate power trace the connector integrates over those windows, with NVML or Variorum underneath the sampler depending on whether you are asking about the card or the node.</figcaption>
</figure>

<figure>
  <img src="/blog/kokkos/smoky-poster.jpg" alt="Ethan Puyaubreau standing beside his poster, Understanding GPU Energy Dynamics in HPC Applications, at the Smoky Mountains Conference 2025." loading="lazy" />
  <figcaption>The connector started as a summer project and turned into the thing I presented at the Smoky Mountains Conference.</figcaption>
</figure>

<h2>What per-kernel joules buy you</h2>

<p>Once energy is attributed to the kernel that spent it, you can finally optimize the quantity you are actually billed for instead of using time as a stand-in and hoping the two agree. They do not always agree: the fastest kernel is frequently not the most energy-efficient one, because going fast can mean running the silicon at its power ceiling, and a slower memory-bound kernel can be the cheaper one to run a million times. A timeline shows none of that; the joules sitting next to the call count do.</p>

<p>The connector lives as a small PR stack open upstream on <code>kokkos/kokkos-tools</code>, the NVML backend and the Variorum one, and on my own machines the per-kernel joules feed the same dashboard that the rest of my GPU work reports into, so a run shows energy-to-solution beside utilization rather than in a separate log nobody opens. What is still missing is resolution below the whole board: device-level attribution stays coarse, and I have no clean answer for concurrent streams.</p>
