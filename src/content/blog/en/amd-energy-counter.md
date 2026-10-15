---
title: "Reading GPU energy instead of guessing it, on an AMD MI210"
description: "NVML only reports a power value every 100 ms, so my Kokkos energy connector could not see short kernels. AMD GPUs expose a cumulative energy counter instead. On an MI210 it moves about every millisecond, but one read costs a third of a millisecond, which decides how a profiler has to use it. Measured with it, ArborX fdbscan-densebox takes 38% less time and 42% less energy than fdbscan."
pubDate: 2026-10-15
lang: en
slug: amd-energy-counter
tags: ["HPC", "GPU", "Kokkos", "AMD"]
---

<p><a href="/blog/kokkos-gpu-energy">The previous post</a> ended on a limit. NVIDIA's NVML gives a power value every 100 ms that only covers the last 25 ms of the interval, so a Kokkos Tools connector built on it can charge energy to long regions, never to a kernel that lasts a few milliseconds. In October 2026 I got time on illyad, a node of the University of Oregon's Frank cluster: two AMD Instinct MI210 and an H100, on the node where the poster's runs were made. AMD GPUs do not make you integrate power at all. Through AMD SMI they expose a counter of the energy the GPU has used since the driver loaded, and the question was what that counter is actually good for.</p>

<h2>What the counter gives you</h2>

<p><code>amdsmi_get_energy_count</code> returns three numbers: an accumulator, its resolution, and a timestamp. Multiply the first two and you have joules. On the MI210 the resolution is 15.3 µJ exactly, the counter is readable without root, and over every probe and the 140,033 samples of the study below it never went backwards. It does restart from zero when the driver reloads: it read 33.9 MJ one week and 4.4 MJ after the node rebooted.</p>

<p>The interesting number is how often it moves. Read in a tight loop, it changes value about every 1.2 ms, and the firmware timestamp it returns moves by the same amount. Under load, those steps look like this:</p>

<figure>
<div class="scroll" tabindex="0" role="region" aria-labelledby="fig-amd-1">
<svg viewBox="0 0 720 360" role="img" aria-label="Staircase plot of the MI210 energy counter read back to back under load over 22 milliseconds. The value climbs in steps about every 1.2 milliseconds, reaching about 3.3 joules. Dashed vertical lines at 0, 10 and 20 milliseconds mark where a 10 millisecond sampling thread reads it." xmlns="http://www.w3.org/2000/svg">
  <g stroke="#c9c9c4" stroke-width="1">
    <line x1="70" y1="50" x2="70" y2="300"/>
    <line x1="70" y1="300" x2="700" y2="300"/>
  </g>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="12.5" fill="#5f5f5c" text-anchor="end">
    <line x1="66" y1="300" x2="70" y2="300" stroke="#c9c9c4"/><text x="61" y="304">0</text>
    <line x1="66" y1="229" x2="70" y2="229" stroke="#c9c9c4"/><text x="61" y="233">1</text>
    <line x1="66" y1="157" x2="70" y2="157" stroke="#c9c9c4"/><text x="61" y="161">2</text>
    <line x1="66" y1="86" x2="70" y2="86" stroke="#c9c9c4"/><text x="61" y="90">3</text>
  </g>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="12.5" fill="#5f5f5c" text-anchor="middle">
    <line x1="70" y1="300" x2="70" y2="304" stroke="#c9c9c4"/><text x="70" y="318">0</text>
    <line x1="211" y1="300" x2="211" y2="304" stroke="#c9c9c4"/><text x="211" y="318">5</text>
    <line x1="352" y1="300" x2="352" y2="304" stroke="#c9c9c4"/><text x="352" y="318">10</text>
    <line x1="493" y1="300" x2="493" y2="304" stroke="#c9c9c4"/><text x="493" y="318">15</text>
    <line x1="634" y1="300" x2="634" y2="304" stroke="#c9c9c4"/><text x="634" y="318">20</text>
  </g>
  <text x="70" y="36" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#5f5f5c">energy since the first read (J)</text>
  <text x="700" y="342" text-anchor="end" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#5f5f5c">time (ms)</text>
  <line x1="70.0" y1="50" x2="70.0" y2="300" stroke="#b93a0a" stroke-width="1.2" stroke-dasharray="5 4"/>
  <line x1="351.8" y1="50" x2="351.8" y2="300" stroke="#b93a0a" stroke-width="1.2" stroke-dasharray="5 4"/>
  <line x1="633.6" y1="50" x2="633.6" y2="300" stroke="#b93a0a" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="358" y="66" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#9a3412">read by a 10 ms sampling thread</text>
  <polyline fill="none" stroke="#111111" stroke-width="2" points="70.0,300.0 107.6,300.0 107.6,276.0 140.7,276.0 140.7,263.9 173.4,263.9 173.4,252.0 206.3,252.0 206.3,240.1 239.1,240.1 239.1,228.2 276.5,228.2 276.5,204.2 308.9,204.2 308.9,192.7 341.1,192.7 341.1,182.0 374.4,182.0 374.4,170.0 406.7,170.0 406.7,158.1 442.6,158.1 442.6,135.6 476.2,135.6 476.2,125.5 508.7,125.5 508.7,116.5 545.4,116.5 545.4,108.7 583.6,108.7 583.6,102.6 614.7,102.6 614.7,85.3 646.8,85.3 646.8,73.5 679.0,73.5 679.0,61.8 690.0,61.8"/>
  <g fill="#111111">
    <circle cx="70.0" cy="300.0" r="2.6"/>
    <circle cx="107.6" cy="276.0" r="2.6"/>
    <circle cx="140.7" cy="263.9" r="2.6"/>
    <circle cx="173.4" cy="252.0" r="2.6"/>
    <circle cx="206.3" cy="240.1" r="2.6"/>
    <circle cx="239.1" cy="228.2" r="2.6"/>
    <circle cx="276.5" cy="204.2" r="2.6"/>
    <circle cx="308.9" cy="192.7" r="2.6"/>
    <circle cx="341.1" cy="182.0" r="2.6"/>
    <circle cx="374.4" cy="170.0" r="2.6"/>
    <circle cx="406.7" cy="158.1" r="2.6"/>
    <circle cx="442.6" cy="135.6" r="2.6"/>
    <circle cx="476.2" cy="125.5" r="2.6"/>
    <circle cx="508.7" cy="116.5" r="2.6"/>
    <circle cx="545.4" cy="108.7" r="2.6"/>
    <circle cx="583.6" cy="102.6" r="2.6"/>
    <circle cx="614.7" cy="85.3" r="2.6"/>
    <circle cx="646.8" cy="73.5" r="2.6"/>
    <circle cx="679.0" cy="61.8" r="2.6"/>
  </g>
  <text x="98" y="143" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#3d3d3d">a new value about every 1.2 ms</text>
</svg>
</div>
<figcaption id="fig-amd-1">Raw reads of the counter of one MI210 running FMA kernels back to back, the first 22 ms of the probe. Each dot is a new value. The dashed lines are where a sampling thread with a 10 ms period would read it.</figcaption>
</figure>

<p>With NVML, energy is an estimate: you integrate a curve you only see a quarter of the time. Here, the energy between any two reads is the difference of two counter values. Nothing between them is missed, whatever the GPU did.</p>

<h2>A read costs a third of a millisecond</h2>

<p>The obvious way to use such a counter is the one that fails with NVML: read it when a region begins, read it when it ends, subtract. With a counter that would even be correct. It is too slow.</p>

<table class="results">
  <caption>Cost of one <code>amdsmi_get_energy_count</code> call on the MI210, ROCm 7.1.1. Ranges over probe runs at idle, with a HIP context open, and under load.</caption>
  <thead><tr><th scope="col">calls</th><th scope="col">median</th><th scope="col">p99</th></tr></thead>
  <tbody>
    <tr><th scope="row">back to back</th><td>0.26 to 0.29 ms</td><td>0.51 to 0.60 ms</td></tr>
    <tr><th scope="row">10 ms apart</th><td>0.47 to 0.56 ms</td><td>0.88 to 0.95 ms</td></tr>
  </tbody>
</table>

<p>Half a millisecond per read is longer than many kernels. Reading the counter at each region boundary would cost more than some of the regions it measures. So the counter has to be read the same way as NVML: by a side thread, on a fixed period. At 10 ms that thread spends about 5% of one core inside AMD SMI.</p>

<p>Why a call 10 ms after the last one costs twice as much as one right after it shows up in the driver. Reading the same counter straight from <code>gpu_metrics</code> in sysfs takes 42 µs, and the value there changes every 1.000 ms, almost to the microsecond. My reading, which I have not checked in the driver source: amdgpu keeps a copy of the firmware's metrics table for one millisecond, and the first read after it expires waits for a fresh one. A sampling thread that reads every 10 ms always pays that wait. The 1.2 ms step seen through AMD SMI is that millisecond plus the time until the next ~0.3 ms call lands. Two processes reading at once are not serialized; their p99 grows by about half.</p>

<p>What does the 10 ms period cost in accuracy? Less than it seems. The energy between two samples is exact; only its split at a region boundary is interpolated. At 200 W, that is at most about 2 J per boundary, under 0.1% of a region lasting several seconds, and a lot for a kernel of a few milliseconds. The hardware moves every millisecond; the profiler sees every ten.</p>

<h2>The DBSCAN study, again, on the MI210</h2>

<p>I repeated the poster's case study with this counter: the same 497,838,606-point HACC input, the same parameters, 64 runs of each ArborX implementation, alternating run by run, through an experimental connector that reads the counter every 10 ms and writes the trace format of <a href="https://github.com/ethan-puyaubreau/energy-dashboard-for-kokkos">energy-dashboard-for-kokkos</a>.</p>

<table class="results">
  <caption>The DBSCANCalculation region on one MI210, medians over 64 runs of each implementation.</caption>
  <thead><tr><th scope="col">implementation</th><th scope="col">time</th><th scope="col">energy</th><th scope="col">mean power</th></tr></thead>
  <tbody>
    <tr><th scope="row"><code>fdbscan</code></th><td>6.948 s</td><td>1465 J</td><td>211 W</td></tr>
    <tr><th scope="row"><code>fdbscan-densebox</code></th><td>4.309 s</td><td>846 J</td><td>197 W</td></tr>
  </tbody>
</table>

<p>The dense implementation takes 38.0% less time and 42.2% less energy, and the bootstrap intervals over the runs are a tenth of a point wide. The runs are also remarkably regular: the quartiles of <code>fdbscan</code> span 11 ms and 3 J, and no run is more than 30% slower than its median. Nothing like the slow first batch of the H100 series showed up.</p>

<p>The shape of the result is the same as on the H100: the faster implementation is also the more frugal one, and the energy gap is wider than the time gap because the mean power drops too, by 6.8% here. A time profile understates the gain again.</p>

<h2>What this does not show</h2>

<p>It is tempting to put this table next to the poster's and read off a comparison between AMD and NVIDIA. It would not hold. The H100 numbers come from power sampled through NVML, an ArborX from July 2025 and the Kokkos of the time; these come from the energy counter, the ArborX of October 2026 and Kokkos 5.0.2. The gap between the two implementations is wider here, 38% against 19% in time, and I cannot tell how much of that is the GPU and how much is fifteen months of ArborX development.</p>

<p>Two more limits. I did not compare the counter with an external power meter, so the absolute joules are worth what AMD's telemetry is worth; the comparisons between implementations do not depend on it. And the machine changed under me: during the study the MI210 idled at about 41 W, and after a reboot a week later the same GPU idled at 58 W with its clocks at their maximum. I do not know why. The study numbers belong to the first state.</p>

<h2>Where it goes</h2>

<p>The connector reads the counter through a single class that is the only code touching AMD SMI, built to slot into the provider layout of the energy tooling proposed for Kokkos Tools. It has its own sampling thread for now; the upstream version should use the daemon under review in Kokkos Tools (#350), so it waits for that merge. The next measurement is the one that would make the comparison fair: the same ArborX build on the H100 of the same node, read through NVML's own cumulative energy counter rather than its power value.</p>

<p>The connector, the probes, the raw data and the scripts that recompute every number in this post are on GitHub: <a href="https://github.com/ethan-puyaubreau/mi210-energy-counter">mi210-energy-counter</a>. This research used resources on the Frank cluster at the University of Oregon.</p>
