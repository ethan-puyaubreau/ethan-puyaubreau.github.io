---
title: "Démonter le nœud GPU, de Proxmox à un Debian nu"
description: "Ce nœud tournait sous Proxmox. Je l'ai effacé pour un Debian 13 nu afin que le GPU soit piloté directement par le noyau de l'hôte, sans hyperviseur entre les deux, puis j'ai passé la soirée dans le parcours du combattant des pilotes NVIDIA que Trixie vous réserve. Ce qui m'a piégé, c'est le Secure Boot."
pubDate: 2026-06-18
updatedDate: 2026-09-23
lang: fr
slug: gpu-debian-nvidia
tags: ["Homelab", "Debian", "NVIDIA", "Proxmox"]
---

<p>Le nœud GPU de mon homelab est une station de travail Xeon mono-socket qui, pendant un an, a fait tourner Proxmox comme le reste du cluster. En juin, je l'ai effacé et j'ai réinstallé un Debian 13 (Trixie) nu, parce que la seule chose que j'attends vraiment de cette machine, faire tourner des charges CUDA sur son GPU, est justement celle qu'un hyperviseur rend plus difficile. La réinstallation a pris vingt minutes. Faire charger le pilote a pris le reste de la soirée, presque entièrement sur une seule chose dont personne ne vous prévient : le Secure Boot refusant en silence un module signé par une clé inconnue.</p>

<p>L'ordre des opérations qui marche réellement sur Trixie tient en quelques étapes, dont une facile à manquer.</p>

<p><em>Mise à jour, septembre 2026 : le nœud a depuis rejoint le cluster Proxmox, où il fait tourner les services multimédias, la VM Kubernetes et l'inférence LLM locale. Le pilote NVIDIA est désormais installé sur l'hôte Proxmox lui-même : toujours pas de passthrough VFIO. Proxmox VE 9 repose sur Debian 13 : les étapes ci-dessous valent aussi sur l'hôte, à un détail près, installer les en-têtes du noyau Proxmox (<code>proxmox-default-headers</code>) au lieu de <code>linux-headers-amd64</code>.</em></p>

<h2>Pourquoi un hyperviseur était la mauvaise couche ici</h2>

<p>Proxmox mérite sa place quand on consolide de nombreux invités sur une seule machine. Le calcul GPU, c'est le cas inverse. Pour donner un vrai GPU à une machine virtuelle, on passe par le passthrough VFIO, le mécanisme qui détache un périphérique de l'hôte pour le confier à un invité. Il faut alors démêler les groupes IOMMU, ces blocs de périphériques que le matériel refuse de séparer, tenir les pilotes de l'hôte à l'écart de la carte, puis remettre le périphérique entier à exactement un invité. On finit par parler à son GPU à travers une machine virtuelle, la carte ne peut de toute façon appartenir qu'à une VM à la fois, et on traîne toute cette mécanique pour un nœud qui fait précisément une seule chose.</p>

<p>Une machine qui n'existe que pour faire tourner un GPU n'a pas besoin d'un hyperviseur posé entre moi et <code>nvidia-smi</code>. Une fois la couche supprimée, la carte revient sur le métal nu, et la taxe du passthrough disparaît avec elle.</p>

<figure>
<svg viewBox="0 0 720 340" role="img" aria-label="Deux piles logicielles comparées. La pile Proxmox a cinq couches avec le passthrough VFIO comme friction ; la pile Debian nu a quatre couches avec le GPU directement sous le noyau." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-u1" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#111111"/>
    </marker>
  </defs>
  <text x="180" y="30" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="15" font-weight="700" fill="#111111">Avant : nœud Proxmox</text>
  <text x="540" y="30" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="15" font-weight="700" fill="#111111">Après : Debian 13 nu</text>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111" text-anchor="middle">
    <rect x="60" y="54"  width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="180" y="79">Charge CUDA (dans l'invité)</text>
    <rect x="60" y="106" width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="180" y="131">VM : OS invité + pilote NVIDIA</text>
    <rect x="60" y="158" width="240" height="40" rx="7" fill="#fbe7df" stroke="#5f5f5c" stroke-width="1.3"/>
    <text x="180" y="183" fill="#3d3d3d">passthrough VFIO</text>
    <rect x="60" y="210" width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="180" y="235">Hôte Proxmox : noyau + KVM</text>
    <rect x="60" y="262" width="240" height="40" rx="7" fill="#e6e6e2" stroke="#111111" stroke-width="1.3"/>
    <text x="180" y="287">GPU</text>
  </g>
  <text x="180" y="322" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="10.5" fill="#3d3d3d">une VM possède la carte · le pilote vit dans l'invité</text>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111" text-anchor="middle">
    <rect x="420" y="80"  width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="540" y="105">Charge CUDA</text>
    <rect x="420" y="132" width="240" height="40" rx="7" fill="#eeeeeb" stroke="#3d3d3d" stroke-width="1.3"/>
    <text x="540" y="157" fill="#111111">nvidia.ko (compilé par DKMS)</text>
    <rect x="420" y="184" width="240" height="40" rx="7" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="540" y="209">Noyau Debian 13</text>
    <rect x="420" y="236" width="240" height="40" rx="7" fill="#e6e6e2" stroke="#111111" stroke-width="1.3"/>
    <text x="540" y="261">GPU</text>
  </g>
  <text x="540" y="300" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="10.5" fill="#111111">la carte répond directement au noyau</text>
  <line x1="314" y1="162" x2="404" y2="162" stroke="#111111" stroke-width="3" marker-end="url(#ar-u1)"/>
  <text x="359" y="150" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="12" font-style="italic" fill="#5f5f5c">aplatir la pile</text>
</svg>
<figcaption>Le même matériel, deux piles. Le passthrough offre une flexibilité dont un nœud GPU à usage unique ne se sert jamais.</figcaption>
</figure>

<h2>Écarter nouveau de la carte</h2>

<p>Debian fournit <code>nouveau</code>, le pilote open source, et le charge au démarrage. Le module propriétaire ne s'attachera pas tant que nouveau tient la carte. Le paquet <code>nvidia-driver</code> installe déjà sa propre liste noire, donc le fichier ci-dessous n'est qu'une précaution ; l'étape qui compte, c'est de reconstruire l'initramfs, pour que la liste noire s'applique dès le début du démarrage, avant que nouveau ne soit chargé depuis l'initramfs et ne prenne la carte.</p>

<pre><code># /etc/modprobe.d/blacklist-nouveau.conf
blacklist nouveau
options nouveau modeset=0

# puis régénérer l'initramfs pour que ça tienne au démarrage
sudo update-initramfs -u</code></pre>

<h2>Le pilote lui-même : laissez DKMS faire la compilation</h2>

<p>Trixie garde le pilote NVIDIA dans le composant <code>non-free</code> et son firmware dans <code>non-free-firmware</code> : il faut donc élargir les sources avant de pouvoir installer quoi que ce soit. Ensuite on installe les en-têtes du noyau et le paquet du pilote, et DKMS compile le module pour le noyau en cours d'exécution. C'est la raison de préférer le pilote empaqueté à l'installeur <code>.run</code> : DKMS recompile le module à chaque mise à jour du noyau, si bien qu'un <code>apt upgrade</code> ne vous laisse pas discrètement avec un écran noir.</p>

<pre><code># ajoutez  contrib non-free non-free-firmware  à vos sources apt, puis :
sudo apt update
sudo apt install linux-headers-amd64 nvidia-driver</code></pre>

<h2>Le Secure Boot : pourquoi nvidia-smi ne trouvait pas le pilote</h2>

<p>Après le redémarrage, j'ai lancé <code>nvidia-smi</code> et j'ai obtenu ceci :</p>

<pre><code>$ nvidia-smi
NVIDIA-SMI has failed because it couldn't communicate with the
NVIDIA driver. Make sure that the latest NVIDIA driver is installed
and running.</code></pre>

<p>La carte allait bien et le module s'était compilé sans broncher. Le noyau refusait simplement de le charger, parce que le Secure Boot était actif et que DKMS avait signé le module avec une clé locale que le firmware ne reconnaissait pas encore. Il y a deux issues. On peut désactiver le Secure Boot dans le firmware, ou enrôler cette clé comme clé du propriétaire de la machine (Machine Owner Key) et garder la chaîne de confiance intacte. J'ai gardé le Secure Boot et enrôlé la clé, une manipulation à faire une seule fois dans le gestionnaire MOK, au démarrage suivant. Rien dans l'installation elle-même n'échoue bruyamment : on ne s'en aperçoit qu'au moment de lancer <code>nvidia-smi</code>.</p>

<pre><code># enrôler la clé de signature DKMS, définir un mot de passe à usage unique, puis redémarrer
sudo mokutil --import /var/lib/dkms/mok.pub
# au gestionnaire MOK bleu au redémarrage : Enroll MOK, saisir le mot de passe, redémarrer</code></pre>

<p>Après ça, <code>nvidia-smi</code> a répondu normalement, avec la carte et la version du pilote.</p>

<figure>
<svg viewBox="0 0 720 560" role="img" aria-label="Un organigramme vertical de l'installation du pilote : ajouter les sources, mettre nouveau en liste noire, installer les en-têtes et le pilote via DKMS, puis une décision Secure Boot qui soit enrôle une MOK, soit passe directement au redémarrage, pour finir sur un nvidia-smi qui fonctionne." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-u2" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#111111"/>
    </marker>
  </defs>
  <g font-family="JetBrains Mono Variable,ui-monospace,monospace" font-size="12" fill="#111111" text-anchor="middle">
    <rect x="120" y="36" width="360" height="56" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="300" y="60">ajouter contrib non-free non-free-firmware</text>
    <text x="300" y="78">à /etc/apt/sources.list</text>
    <rect x="120" y="110" width="360" height="48" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="300" y="139">liste noire nouveau, update-initramfs -u</text>
    <rect x="120" y="184" width="360" height="56" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="300" y="208">apt install linux-headers-amd64 nvidia-driver</text>
    <text x="300" y="226" fill="#5f5f5c">(DKMS compile pour votre noyau)</text>
  </g>
  <polygon points="300,258 382,300 300,342 218,300" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
  <text x="300" y="304" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111">Secure Boot activé ?</text>
  <rect x="475" y="274" width="206" height="52" rx="8" fill="#fbe7df" stroke="#b93a0a" stroke-width="1.4"/>
  <text x="578" y="296" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="12.5" fill="#9a3412">enrôler la clé DKMS (MOK)</text>
  <text x="578" y="313" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="11" font-style="italic" fill="#9a3412">l'étape piège</text>
  <rect x="190" y="400" width="220" height="48" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
  <text x="300" y="429" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111">redémarrer</text>
  <rect x="120" y="476" width="360" height="48" rx="8" fill="#eeeeeb" stroke="#3d3d3d" stroke-width="1.4"/>
  <text x="300" y="505" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#111111">nvidia-smi montre la carte + la version du pilote</text>
  <g stroke="#111111" stroke-width="1.5" fill="none">
    <line x1="300" y1="92"  x2="300" y2="108" marker-end="url(#ar-u2)"/>
    <line x1="300" y1="158" x2="300" y2="182" marker-end="url(#ar-u2)"/>
    <line x1="300" y1="240" x2="300" y2="256" marker-end="url(#ar-u2)"/>
    <line x1="300" y1="342" x2="300" y2="398" marker-end="url(#ar-u2)"/>
    <line x1="382" y1="300" x2="473" y2="300" marker-end="url(#ar-u2)"/>
    <polyline points="578,326 578,372 300,372"/>
    <line x1="300" y1="448" x2="300" y2="474" marker-end="url(#ar-u2)"/>
  </g>
  <text x="284" y="362" text-anchor="end" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#5f5f5c">non</text>
  <text x="425" y="292" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#5f5f5c">oui</text>
</svg>
<figcaption>Toute la séquence. Toutes les cases sauf la case ambrée sont mécaniques ; la case ambrée est celle où une compilation propre vous donne quand même un <code>nvidia-smi</code> mort.</figcaption>
</figure>

<h2>Ce que j'ai récupéré</h2>

<p>Un <code>nvidia-smi</code> sur métal nu, la carte entière sans machine virtuelle au milieu, et un nœud qui fait tourner mes builds CUDA et Kokkos directement sur le matériel plutôt qu'à travers un invité. Le reste du cluster est toujours sous Proxmox : ces nœuds font le travail de consolidation où Proxmox excelle. Ce nœud ne faisait pas ce travail.</p>

<p>Garder un nœud sur métal nu à côté d'un cluster Proxmox restait bancal côté supervision : il fallait le surveiller à part, hors des outils qui couvrent tous les autres nœuds. Le nœud est depuis revenu sous Proxmox (voir la mise à jour en tête d'article).</p>
