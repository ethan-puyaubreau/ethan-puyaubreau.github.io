---
title: "A status page that ships zero JavaScript"
description: "My homelab status page, and it ships zero JavaScript. Health is collected out of band, baked into static HTML every minute, and served from K3s. A status page should be the one page that still loads when everything else is broken."
pubDate: 2026-06-15
lang: en
slug: status-page-zero-js
tags: ["Homelab", "K3s", "CSS", "zero-JS"]
---

<p>Most status pages are single-page apps that boot a JavaScript bundle and then poll an API from your browser to discover what is up. That has always struck me as backwards. The status page is the page you load specifically when things are broken, so it should depend on as little as possible. The status page for my homelab takes the opposite position: it ships zero JavaScript. The browser receives finished HTML, baked a minute ago, and nothing else. It also happens to look like an amber CRT, because if I am going to stare at it during an outage it may as well be pleasant.</p>

<figure>
<svg viewBox="0 0 720 430" role="img" aria-label="A mock of the Status page styled as an amber CRT terminal, listing homelab services with up or degraded status and uptime bars, and a footer reading updated 41 seconds ago, baked at build time, zero kilobytes of JavaScript." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="phos" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.1"/>
    </filter>
    <pattern id="scan" width="3" height="3" patternUnits="userSpaceOnUse">
      <rect width="3" height="3" fill="none"/>
      <rect width="3" height="1" fill="#000000" opacity="0.16"/>
    </pattern>
  </defs>
  <rect x="6" y="6" width="708" height="418" rx="16" fill="#0d0a05"/>
  <rect x="20" y="20" width="680" height="390" rx="10" fill="#160f04"/>
  <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace">
    <text x="44" y="62" font-size="18" fill="#f0a93a" filter="url(#phos)">STATUS</text>
    <text x="44" y="62" font-size="18" fill="#ffcf76">STATUS</text>
    <text x="160" y="62" font-size="13" fill="#9a7327">// homelab status</text>
    <line x1="44" y1="76" x2="676" y2="76" stroke="#5a4416" stroke-width="1"/>
    <text x="44"  y="100" font-size="11" fill="#8a6a2a">SERVICE</text>
    <text x="360" y="100" font-size="11" fill="#8a6a2a">STATUS</text>
    <text x="470" y="100" font-size="11" fill="#8a6a2a">90-DAY UPTIME</text>
    <g font-size="14" fill="#e7b860">
      <circle cx="50" cy="124" r="5" fill="#46d27a"/>
      <text x="66" y="129">proxmox-cluster</text>
      <text x="360" y="129" fill="#7fdca0">UP</text>
      <rect x="470" y="121" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="121" width="205" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="148" font-size="10" fill="#8a6a2a">99.98%</text>
      <circle cx="50" cy="170" r="5" fill="#46d27a"/>
      <text x="66" y="175">nextcloud</text>
      <text x="360" y="175" fill="#7fdca0">UP</text>
      <rect x="470" y="167" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="167" width="204" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="194" font-size="10" fill="#8a6a2a">99.95%</text>
      <circle cx="50" cy="216" r="5" fill="#46d27a"/>
      <text x="66" y="221">k3s-ingress</text>
      <text x="360" y="221" fill="#7fdca0">UP</text>
      <rect x="470" y="213" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="213" width="206" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="240" font-size="10" fill="#8a6a2a">100%</text>
      <circle cx="50" cy="262" r="5" fill="#f0a93a"/>
      <text x="66" y="267">jellyfin</text>
      <text x="360" y="267" fill="#f0a93a">DEGRADED</text>
      <rect x="470" y="259" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="259" width="183" height="9" rx="2" fill="#f0a93a"/>
      <text x="470" y="286" font-size="10" fill="#8a6a2a">98.71%</text>
      <circle cx="50" cy="308" r="5" fill="#46d27a"/>
      <text x="66" y="313">gitea</text>
      <text x="360" y="313" fill="#7fdca0">UP</text>
      <rect x="470" y="305" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="305" width="203" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="332" font-size="10" fill="#8a6a2a">99.90%</text>
      <circle cx="50" cy="354" r="5" fill="#46d27a"/>
      <text x="66" y="359">restic-backups</text>
      <text x="360" y="359" fill="#7fdca0">UP</text>
      <rect x="470" y="351" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="351" width="206" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="378" font-size="10" fill="#8a6a2a">99.99%</text>
    </g>
    <text x="44" y="398" font-size="11.5" fill="#9a7327">updated 41s ago · baked at build time · 0 KB JavaScript</text>
  </g>
  <rect x="20" y="20" width="680" height="390" rx="10" fill="url(#scan)"/>
</svg>
<figcaption>The page itself: monospace, amber, a glow and scanlines done entirely in CSS. A green dot is an old habit, but the whole palette lives on the amber side.</figcaption>
</figure>

<h2>A status page is a photograph, not a video</h2>

<p>So collection and display have to be decoupled. The browser should not be the thing that discovers state, because the moment it is, your status page depends on a working API, on a correct cross-origin (CORS) policy, on a JavaScript runtime, and on the user's network all cooperating at exactly the time something is already wrong. So instead a collector runs on a schedule, probes each service, and writes the results to a small JSON file, and a template step bakes that JSON into <code>index.html</code>. The page the browser receives is a photograph of the system as of the last run, not a live feed it has to assemble. The cost is staleness, bounded by how often the collector runs, and the page prints its own age so that staleness is never hidden.</p>

<h2>Refreshing without JavaScript</h2>

<p>Keeping the photograph current needs exactly one line, and it is the oldest trick on the web:</p>

<pre><code>&lt;meta http-equiv="refresh" content="60"&gt;</code></pre>

<p>The browser re-fetches the page every sixty seconds and gets whatever the collector last baked. There is no polling code and no websocket, and nothing to download before the page can tell you anything. It works in a text browser, and on a phone with one bar of signal.</p>

<h2>Phosphor amber in pure CSS</h2>

<p>The CRT look is all CSS, with no images and no canvas. The glow is a stack of text-shadows in the amber. The scanlines are a <code>repeating-linear-gradient</code> laid over everything at low opacity. A status is a colored span and an uptime bar is a background gradient. Because there is no JavaScript, the entire page is a few kilobytes of HTML and one stylesheet.</p>

<pre><code>:root { --amber:#f0a93a; }

.glow {
  color: var(--amber);
  text-shadow: 0 0 2px var(--amber), 0 0 8px rgba(240,169,58,.45);
}

/* scanlines, drawn over the whole page */
body::after {
  content: ""; position: fixed; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(
    0deg, rgba(0,0,0,.16) 0 1px, transparent 1px 3px);
}</code></pre>

<h2>Where it lives, and why it fails gracefully</h2>

<p>There are two pieces on the cluster. A CronJob runs the probe-and-template step every minute and writes <code>index.html</code> to a small persistent volume. An nginx Deployment mounts that same volume read-only and exposes it through an Ingress, the Kubernetes resource that publishes a service to the outside. An nginx pod serving a static file has very little reason to fall over, and it has no dependency on the collector being alive. If the collector dies, the page does not go down, it goes stale, and the timestamp makes that obvious at a glance. You get a slightly old photograph instead of a blank screen.</p>

<pre><code>apiVersion: batch/v1
kind: CronJob
metadata: { name: status-collect }
spec:
  schedule: "* * * * *"            # every minute
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: collect
              image: registry.example.com/status-site:latest
              volumeMounts:
                - { name: site, mountPath: /out }   # writes index.html here
          volumes:
            - name: site
              persistentVolumeClaim: { claimName: status-site }
# nginx mounts the same PVC read-only and serves /out. It never calls the collector.</code></pre>

<figure>
<svg viewBox="0 0 760 250" role="img" aria-label="Data flow: services are probed by a collector CronJob every sixty seconds, which writes a baked index.html to a persistent volume; nginx serves that static file to the browser, which uses a meta refresh and no JavaScript. Collection is out of band; the serving path is always up." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-s1" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#2b2620"/>
    </marker>
  </defs>
  <rect x="150" y="48" width="312" height="120" rx="10" fill="none" stroke="#b9ad97" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="306" y="42" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11.5" fill="#8a7d63">collected out of band · every 60s · may die without taking the page down</text>
  <rect x="492" y="48" width="252" height="120" rx="10" fill="none" stroke="#5f8a3a" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="618" y="42" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11.5" fill="#4d7030">always-on path · static · 0 JS</text>
  <g font-family="ui-sans-serif,system-ui,sans-serif" font-size="12.5" fill="#2b2620" text-anchor="middle">
    <rect x="20"  y="84" width="108" height="48" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="74" y="105">services</text>
    <text x="74" y="122" font-size="10.5" fill="#6b6258">proxmox · docker · k3s</text>
    <rect x="168" y="84" width="124" height="48" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="230" y="104">collector</text>
    <text x="230" y="121" font-size="10.5" fill="#6b6258">CronJob  * * * * *</text>
    <rect x="332" y="84" width="120" height="48" rx="8" fill="#f6ead2" stroke="#c8821e" stroke-width="1.4"/>
    <text x="392" y="104" fill="#7a4e10">PVC</text>
    <text x="392" y="121" font-size="10.5" fill="#9a6a1e">index.html (baked)</text>
    <rect x="500" y="84" width="116" height="48" rx="8" fill="#e7efe0" stroke="#5f8a3a" stroke-width="1.4"/>
    <text x="558" y="104" fill="#3f6326">nginx</text>
    <text x="558" y="121" font-size="10.5" fill="#4d7030">serves static</text>
    <rect x="636" y="84" width="108" height="48" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="690" y="104">browser</text>
    <text x="690" y="121" font-size="10.5" fill="#6b6258">refresh 60s · 0 JS</text>
  </g>
  <g stroke="#2b2620" stroke-width="1.5" fill="none">
    <line x1="128" y1="108" x2="166" y2="108" marker-end="url(#ar-s1)"/>
    <line x1="292" y1="108" x2="330" y2="108" marker-end="url(#ar-s1)"/>
    <line x1="452" y1="108" x2="498" y2="108" marker-end="url(#ar-s1)"/>
    <line x1="616" y1="108" x2="634" y2="108" marker-end="url(#ar-s1)"/>
  </g>
  <text x="392" y="200" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12" font-style="italic" fill="#6b6258">nginx depends on a file, not on the collector being alive.</text>
</svg>
<figcaption>Collection and serving never touch each other directly. They meet at a file on a volume.</figcaption>
</figure>

<p>The next iteration writes a small history file so the uptime bars cover the last ninety days rather than just now, still baked at build time, still zero JavaScript on the client. The known limit: if the CronJob fails several times in a row, the page goes stale with nothing but the page itself to say so.</p>
