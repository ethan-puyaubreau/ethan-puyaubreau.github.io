---
title: "SENTINEL : une page de statut sans aucun JavaScript"
description: "SENTINEL est la page de statut de mon homelab, et elle n'embarque aucun JavaScript. L'état est collecté hors bande, figé en HTML statique chaque minute, et servi depuis K3s. Une page de statut devrait être la seule page qui se charge encore quand tout le reste est cassé."
pubDate: 2026-06-15
lang: fr
slug: sentinel-status-page
tags: ["Homelab", "K3s", "CSS", "zero-JS"]
---

<p>La plupart des pages de statut sont des applications monopages qui démarrent un bundle JavaScript puis interrogent une API depuis votre navigateur pour découvrir ce qui tourne. Ça m'a toujours paru à l'envers. La page de statut est celle qu'on charge justement quand les choses sont cassées : elle devrait donc dépendre du moins possible. SENTINEL, la page de statut de mon homelab, prend la position inverse : elle n'embarque aucun JavaScript. Le navigateur reçoit du HTML fini, figé il y a une minute, et rien d'autre. Elle ressemble aussi à un CRT ambré, parce que si je dois la fixer pendant une panne, autant que ce soit agréable.</p>

<figure>
<svg viewBox="0 0 720 430" role="img" aria-label="Une maquette de la page de statut SENTINEL stylée en terminal CRT ambré, listant des services du homelab avec un statut actif ou dégradé et des barres de disponibilité, et un pied de page indiquant mis a jour il y a 41 secondes, fige a la generation, zero kilo-octet de JavaScript." xmlns="http://www.w3.org/2000/svg">
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
    <text x="44" y="62" font-size="18" fill="#f0a93a" filter="url(#phos)">SENTINEL</text>
    <text x="44" y="62" font-size="18" fill="#ffcf76">SENTINEL</text>
    <text x="160" y="62" font-size="13" fill="#9a7327">// statut homelab</text>
    <line x1="44" y1="76" x2="676" y2="76" stroke="#5a4416" stroke-width="1"/>
    <text x="44"  y="100" font-size="11" fill="#8a6a2a">SERVICE</text>
    <text x="360" y="100" font-size="11" fill="#8a6a2a">STATUT</text>
    <text x="470" y="100" font-size="11" fill="#8a6a2a">DISPO 90 JOURS</text>
    <g font-size="14" fill="#e7b860">
      <circle cx="50" cy="124" r="5" fill="#46d27a"/>
      <text x="66" y="129">proxmox-cluster</text>
      <text x="360" y="129" fill="#7fdca0">ACTIF</text>
      <rect x="470" y="121" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="121" width="205" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="148" font-size="10" fill="#8a6a2a">99.98%</text>
      <circle cx="50" cy="170" r="5" fill="#46d27a"/>
      <text x="66" y="175">nextcloud</text>
      <text x="360" y="175" fill="#7fdca0">ACTIF</text>
      <rect x="470" y="167" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="167" width="204" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="194" font-size="10" fill="#8a6a2a">99.95%</text>
      <circle cx="50" cy="216" r="5" fill="#46d27a"/>
      <text x="66" y="221">k3s-ingress</text>
      <text x="360" y="221" fill="#7fdca0">ACTIF</text>
      <rect x="470" y="213" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="213" width="206" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="240" font-size="10" fill="#8a6a2a">100%</text>
      <circle cx="50" cy="262" r="5" fill="#f0a93a"/>
      <text x="66" y="267">jellyfin</text>
      <text x="360" y="267" fill="#f0a93a">DÉGRADÉ</text>
      <rect x="470" y="259" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="259" width="183" height="9" rx="2" fill="#f0a93a"/>
      <text x="470" y="286" font-size="10" fill="#8a6a2a">98.71%</text>
      <circle cx="50" cy="308" r="5" fill="#46d27a"/>
      <text x="66" y="313">gitea</text>
      <text x="360" y="313" fill="#7fdca0">ACTIF</text>
      <rect x="470" y="305" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="305" width="203" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="332" font-size="10" fill="#8a6a2a">99.90%</text>
      <circle cx="50" cy="354" r="5" fill="#46d27a"/>
      <text x="66" y="359">restic-backups</text>
      <text x="360" y="359" fill="#7fdca0">ACTIF</text>
      <rect x="470" y="351" width="206" height="9" rx="2" fill="#3a2c10"/>
      <rect x="470" y="351" width="206" height="9" rx="2" fill="#46d27a"/>
      <text x="470" y="378" font-size="10" fill="#8a6a2a">99.99%</text>
    </g>
    <text x="44" y="398" font-size="11.5" fill="#9a7327">mis à jour il y a 41 s · figé à la génération · 0 Ko de JavaScript</text>
  </g>
  <rect x="20" y="20" width="680" height="390" rx="10" fill="url(#scan)"/>
</svg>
<figcaption>La page elle-même : monospace, ambre, une lueur et des lignes de balayage entièrement en CSS. Le point vert est une vieille habitude, mais toute la palette vit du côté ambré.</figcaption>
</figure>

<h2>Une page de statut est une photographie, pas une vidéo</h2>

<p>La collecte et l'affichage doivent donc être découplés. Le navigateur ne devrait pas être ce qui découvre l'état, car dès l'instant où il l'est, votre page de statut dépend d'une API qui marche, d'une politique de partage entre origines (CORS) correctement configurée, d'un runtime JavaScript et du réseau de l'utilisateur, tous coopérant exactement au moment où quelque chose ne va déjà pas. À la place, un collecteur tourne sur une planification, sonde chaque service, et écrit les résultats dans un petit fichier JSON, puis une étape de gabarit fige ce JSON dans <code>index.html</code>. La page que reçoit le navigateur est une photographie du système au moment de la dernière exécution, pas un flux en direct qu'il doit assembler. Le coût, c'est la fraîcheur, bornée par la fréquence du collecteur, et la page affiche son propre âge pour que cette latence ne soit jamais cachée.</p>

<h2>Rafraîchir sans JavaScript</h2>

<p>Garder la photographie à jour ne demande qu'une ligne, et c'est la plus vieille astuce du web :</p>

<pre><code>&lt;meta http-equiv="refresh" content="60"&gt;</code></pre>

<p>Le navigateur recharge la page toutes les soixante secondes et reçoit ce que le collecteur a figé en dernier. Il n'y a ni code d'interrogation ni websocket, et rien à télécharger avant que la page puisse vous dire quoi que ce soit. Ça fonctionne dans un navigateur texte, et sur un téléphone avec une seule barre de réseau.</p>

<h2>Le phosphore ambré en CSS pur</h2>

<p>Le rendu CRT est tout en CSS, sans images ni canvas. La lueur est une pile de text-shadow dans l'ambre. Les lignes de balayage sont un <code>repeating-linear-gradient</code> posé sur l'ensemble à faible opacité. Un statut est un span coloré et une barre de disponibilité est un dégradé de fond. Comme il n'y a pas de JavaScript, la page entière fait quelques kilo-octets de HTML et une feuille de style.</p>

<pre><code>:root { --amber:#f0a93a; }

.glow {
  color: var(--amber);
  text-shadow: 0 0 2px var(--amber), 0 0 8px rgba(240,169,58,.45);
}

/* lignes de balayage, dessinées sur toute la page */
body::after {
  content: ""; position: fixed; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(
    0deg, rgba(0,0,0,.16) 0 1px, transparent 1px 3px);
}</code></pre>

<h2>Où elle vit, et pourquoi elle échoue en douceur</h2>

<p>Il y a deux pièces sur le cluster. Un CronJob exécute l'étape de sonde-et-gabarit chaque minute et écrit <code>index.html</code> sur un petit volume persistant. Un Deployment nginx monte ce même volume en lecture seule et l'expose via un Ingress, la ressource Kubernetes qui publie un service vers l'extérieur. Un pod nginx qui sert un fichier statique a très peu de raisons de tomber, et il ne dépend pas du collecteur pour vivre. Si le collecteur meurt, la page ne tombe pas, elle vieillit, et l'horodatage le rend évident d'un coup d'œil. On lit alors une photographie un peu ancienne au lieu d'un écran blanc.</p>

<pre><code>apiVersion: batch/v1
kind: CronJob
metadata: { name: sentinel-collect }
spec:
  schedule: "* * * * *"            # chaque minute
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: collect
              image: registry.example.com/sentinel:latest
              volumeMounts:
                - { name: site, mountPath: /out }   # écrit index.html ici
          volumes:
            - name: site
              persistentVolumeClaim: { claimName: sentinel-site }
# nginx monte le même PVC en lecture seule et sert /out. Il n'appelle jamais le collecteur.</code></pre>

<figure>
<svg viewBox="0 0 760 250" role="img" aria-label="Flux de données : les services sont sondés par un CronJob collecteur toutes les soixante secondes, qui écrit un index.html figé sur un volume persistant ; nginx sert ce fichier statique au navigateur, qui utilise un meta refresh et aucun JavaScript. La collecte est hors bande ; le chemin de service est toujours actif." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-s1" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#2b2620"/>
    </marker>
  </defs>
  <rect x="150" y="48" width="312" height="120" rx="10" fill="none" stroke="#b9ad97" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="306" y="42" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11.5" fill="#8a7d63">collecté hors bande · toutes les 60 s · peut mourir sans faire tomber la page</text>
  <rect x="492" y="48" width="252" height="120" rx="10" fill="none" stroke="#5f8a3a" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="618" y="42" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11.5" fill="#4d7030">chemin toujours actif · statique · 0 JS</text>
  <g font-family="ui-sans-serif,system-ui,sans-serif" font-size="12.5" fill="#2b2620" text-anchor="middle">
    <rect x="20"  y="84" width="108" height="48" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="74" y="105">services</text>
    <text x="74" y="122" font-size="10.5" fill="#6b6258">proxmox · docker · k3s</text>
    <rect x="168" y="84" width="124" height="48" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="230" y="104">collecteur</text>
    <text x="230" y="121" font-size="10.5" fill="#6b6258">CronJob  * * * * *</text>
    <rect x="332" y="84" width="120" height="48" rx="8" fill="#f6ead2" stroke="#c8821e" stroke-width="1.4"/>
    <text x="392" y="104" fill="#7a4e10">PVC</text>
    <text x="392" y="121" font-size="10.5" fill="#9a6a1e">index.html (figé)</text>
    <rect x="500" y="84" width="116" height="48" rx="8" fill="#e7efe0" stroke="#5f8a3a" stroke-width="1.4"/>
    <text x="558" y="104" fill="#3f6326">nginx</text>
    <text x="558" y="121" font-size="10.5" fill="#4d7030">sert du statique</text>
    <rect x="636" y="84" width="108" height="48" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="690" y="104">navigateur</text>
    <text x="690" y="121" font-size="10.5" fill="#6b6258">refresh 60 s · 0 JS</text>
  </g>
  <g stroke="#2b2620" stroke-width="1.5" fill="none">
    <line x1="128" y1="108" x2="166" y2="108" marker-end="url(#ar-s1)"/>
    <line x1="292" y1="108" x2="330" y2="108" marker-end="url(#ar-s1)"/>
    <line x1="452" y1="108" x2="498" y2="108" marker-end="url(#ar-s1)"/>
    <line x1="616" y1="108" x2="634" y2="108" marker-end="url(#ar-s1)"/>
  </g>
  <text x="392" y="200" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="12" font-style="italic" fill="#6b6258">nginx dépend d'un fichier, pas du collecteur en vie.</text>
</svg>
<figcaption>La collecte et le service ne se touchent jamais directement. Ils se rencontrent autour d'un fichier sur un volume.</figcaption>
</figure>

<p>La prochaine itération écrit un petit fichier d'historique pour que les barres de disponibilité couvrent les quatre-vingt-dix derniers jours plutôt que l'instant présent, toujours figé à la génération, toujours zéro JavaScript côté client. La limite connue : si le CronJob échoue plusieurs fois de suite, la page vieillit sans que rien ne le signale ailleurs que sur elle-même.</p>
