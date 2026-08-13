---
title: "Imputer l'énergie GPU au noyau qui l'a dépensée"
description: "Un profileur vous dit où un noyau GPU passe son temps. Je voulais savoir où il dépense ses joules. J'ai donc construit un connecteur Kokkos Tools qui échantillonne la puissance sur un thread dédié et l'intègre sur chaque région profilée, avec NVML pour le chiffre précis par GPU et Variorum pour le nœud entier."
pubDate: 2026-06-12
lang: fr
slug: kokkos-gpu-energy
tags: ["HPC", "GPU", "Kokkos", "NVML"]
---

<p>J'ai passé un été à Oak Ridge à travailler là-dessus, et la question de départ est courte : le noyau qui a pris le plus de temps réel dans mon exécution n'était pas celui qui a coûté le plus d'énergie. Le profileur classait tout par le temps, avec assurance, et ce classement était tout simplement le mauvais dès lors que ce qu'on vous demande de réduire, c'est la facture électrique. Les clusters tournent de plus en plus sous un plafond de puissance plutôt que sous une cible de fréquence, donc l'énergie par solution devient le chiffre qui compte, et presque rien dans un flux HPC normal ne la rapporte par noyau. J'ai donc construit un outil qui le fait : un connecteur Kokkos Tools qui impute les joules à chaque région profilée sans toucher à l'application qu'il mesure.</p>

<p>Commençons par le tableau qu'il produit.</p>

<pre><code>$ export KOKKOS_TOOLS_LIBS=/opt/kp/libkp_gpu_energy.so
$ ./solver --mesh big.h5

region            calls     time(s)   energy(J)   J/call   avg(W)
-----------------------------------------------------------------
gemm_apply        12480       8.42      1936.1     0.155      230
spmv_matvec       49920      11.07      1421.8     0.028      128
halo_exchange     49920       3.91       402.7     0.008      103
-----------------------------------------------------------------
device idle baseline ~ 61 W  (subtracted for the J/call column)</code></pre>

<p>Le produit matrice-vecteur creux a tourné le plus longtemps, onze secondes contre huit pour le bloc dense, et a tout de même coûté un tiers d'énergie en moins, parce qu'il est limité par la mémoire et laisse le GPU tirer environ la moitié de la puissance. Le temps me disait d'optimiser <code>spmv_matvec</code>. L'énergie me disait de regarder <code>gemm_apply</code> d'abord. Ce sont des consignes différentes, et jusqu'à l'existence de ce connecteur je ne voyais que la première.</p>

<h2>Kokkos Tools, ou de l'instrumentation que vous n'avez pas à compiler</h2>

<p>Kokkos annonce déjà ce qu'il fait. Chaque <code>parallel_for</code>, <code>parallel_reduce</code> et <code>parallel_scan</code> déclenche un callback de début avant de se lancer et un callback de fin une fois terminé, et on peut entourer des portions de code arbitraires de régions nommées avec des marqueurs push et pop. Un connecteur Kokkos Tools n'est qu'une bibliothèque partagée qui implémente ces callbacks, et on l'attache en pointant une variable d'environnement vers elle. Aucune recompilation de l'application, aucune annotation dans ses sources, aucun fork du code. On met <code>KOKKOS_TOOLS_LIBS</code> sur le chemin de la bibliothèque et le runtime la charge.</p>

<p>Je pouvais donc prendre un solveur que je n'avais pas écrit, que personne ne veut me laisser modifier, et apprendre le coût énergétique de chacun de ses noyaux en chargeant une bibliothèque de plus à côté. Le connecteur écoute les événements que Kokkos émet déjà, et la mesure suit.</p>

<h2>On ne peut pas lire l'énergie, seulement observer la puissance</h2>

<p>La première version évidente lit le capteur de puissance au callback de début, le relit à la fin, et rapporte la moyenne fois la durée. Ça ne marche pas, et la raison pour laquelle ça ne marche pas est au cœur du problème. La bibliothèque de gestion de NVIDIA, NVML, expose <code>nvmlDeviceGetPowerUsage</code>, qui renvoie la puissance instantanée de la carte en milliwatts. Le piège est double. Ce capteur se met à jour à un rythme modeste, de l'ordre de la dizaine de hertz, et un noyau GPU peut facilement être plus court que l'intervalle entre deux mises à jour : début et fin renvoient alors souvent la même valeur périmée et la durée ne dit rien. Et même quand le noyau est assez long pour couvrir plusieurs mises à jour, deux lectures ponctuelles ne peuvent pas décrire une courbe qui monte et descend tout au long de la vie du noyau.</p>

<p>Le problème de fond, c'est que la puissance est la mauvaise grandeur à échantillonner aux bornes. La puissance est instantanée, des watts, un débit. Ce que vous payez, c'est de l'énergie, des joules, et l'énergie est l'intégrale de la puissance dans le temps. Deux lectures vous donnent deux hauteurs d'une courbe. La facture, c'est l'aire en dessous. Ma première version racontait n'importe quoi sur les noyaux courts, parfois même un écart négatif quand les deux lectures tombaient de part et d'autre d'une mise à jour du capteur, et c'était le signal pour cesser d'échantillonner au rythme du noyau et commencer à échantillonner au rythme de l'horloge.</p>

<figure>
<svg viewBox="0 0 720 380" role="img" aria-label="Une courbe puissance-temps pour trois noyaux GPU. Le bloc dense tourne près de 230 watts, le produit matrice-vecteur creux près de 128 watts plus longtemps, et l'échange de halo près de 103 watts. Des points d'échantillonnage jalonnent la courbe à cadence fixe. Une ligne pointillée marque le repos vers 61 watts, et l'aire sous le premier noyau est ombrée et annotée energie egale l'integrale de la puissance dans le temps." xmlns="http://www.w3.org/2000/svg">
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
  <text x="70" y="36" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" fill="#6b6258">puissance (W)</text>
  <text x="694" y="318" text-anchor="end" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" fill="#6b6258">temps &#8594;</text>
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
  <text x="700" y="245" text-anchor="end" font-family="ui-sans-serif,system-ui,sans-serif" font-size="10.5" fill="#8a7d63">repos ~ 61 W</text>
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
  <text x="177" y="180" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" fill="#7a4e10">Énergie = &#8747; P dt</text>
  <text x="177" y="198" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="10.5" fill="#9a6a1e">aire au-dessus du repos = coût marginal</text>
</svg>
<figcaption>L'énergie d'une région est l'aire sous sa courbe de puissance. La ligne pointillée est le plancher de repos ; le coût marginal d'un noyau est la part de l'aire qui se situe au-dessus. Les points sont le thread dédié qui échantillonne à cadence fixe, pas aux bornes du noyau.</figcaption>
</figure>

<h2>Un thread dédié, une cadence fixe, et un trapèze</h2>

<p>Il faut donc séparer entièrement l'échantillonnage des noyaux. Un thread en arrière-plan interroge le capteur de puissance à intervalle fixe, espacé de quelques millisecondes, et horodate chaque lecture, construisant une trace continue de l'évolution de la consommation de la carte sur toute l'exécution. Les callbacks de début et de fin ne lisent plus du tout la puissance. Ils enregistrent une fenêtre en temps réel, le moment où la région s'est ouverte et celui où elle s'est refermée. Pour obtenir l'énergie d'une région, le connecteur intègre la trace de puissance sur cette fenêtre avec la règle des trapèzes, en sommant les petits trapèzes entre échantillons consécutifs qui tombent à l'intérieur. Comme la même région est franchie des milliers de fois, ses joules s'accumulent sur chaque appel : c'est la colonne <code>energy(J)</code> ci-dessus, et la seule façon utilisable pour un noyau qui s'exécute en quelques dizaines de microsecondes.</p>

<p>Échantillonner sur l'horloge plutôt que sur le noyau, c'est ce qui rend les noyaux courts mesurables. Un seul lancement peut être trop bref pour capter ne serait-ce qu'une lecture fraîche du capteur, mais dix mille lancements sous une trace interrogée régulièrement déposent assez d'échantillons pour que l'agrégat soit solide. Le compromis, c'est un peu de surcoût dû au thread d'interrogation et un plancher de résolution fixé par l'intervalle d'échantillonnage, tous deux petits et, surtout, bornés et connus.</p>

<h2>Ce que le chiffre est, et ce qu'il n'est pas</h2>

<p>Le tableau suggère plus de précision qu'il n'en a. NVML rapporte la puissance de la carte entière, pas par multiprocesseur de flux, donc c'est une imputation à l'échelle du GPU entier. Si deux noyaux s'exécutent en même temps sur le même appareil, sur des flux distincts, la trace ne peut pas dire lequel a tiré quel watt, et l'énergie du recouvrement ne peut pas être répartie proprement entre eux. Le chiffre inclut aussi la consommation au repos de l'appareil, les dizaines de watts qu'un GPU allumé dépense à ne rien faire : pour le coût marginal d'un noyau, on mesure donc une référence de repos appareil au calme et on la soustrait, c'est la ligne sous le tableau et le plancher dans le schéma. Rien de tout cela ne rend la mesure fausse : elle est à l'échelle de l'appareil entier, ce qui suffit pour classer les noyaux par énergie.</p>

<h2>Deux backends, deux questions différentes</h2>

<p>NVML répond à une question avec beaucoup de précision : qu'a tiré ce GPU NVIDIA. C'est par carte, à la résolution du milliwatt, NVIDIA seulement, et il ne voit rien en dehors de la carte. Le connecteur a donc un second backend bâti sur Variorum, indépendant du fournisseur, qui lit la puissance au niveau du nœud et du socket, y compris le CPU via RAPL, les compteurs de puissance intégrés aux processeurs Intel et AMD, la DRAM, et certains GPU sur du matériel qui n'est pas NVIDIA. Les deux ne sont pas redondants : NVML donne ce que le GPU a tiré, Variorum ce que le nœud entier a tiré. Un noyau qui paraît bon marché sur la carte peut tout de même brasser assez de données pour faire chauffer le CPU et les contrôleurs mémoire autour de lui, et seule la vue au niveau du nœud l'attrape. On se tourne vers NVML quand on règle un noyau GPU isolément, et vers Variorum quand on veut la facture énergétique que la salle machine voit réellement.</p>

<figure>
<svg viewBox="0 0 760 340" role="img" aria-label="Le pipeline du connecteur. L'application Kokkos déclenche les callbacks Tools à chaque région parallèle ; le connecteur énergie reçoit une trace de puissance d'un thread échantillonneur qui lit la puissance hors bande à intervalle fixe ; NVML et Variorum alimentent l'échantillonneur ; le connecteur intègre la trace par région en joules, qui partent vers un tableau de bord." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-k1" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#2b2620"/>
    </marker>
  </defs>
  <g font-family="ui-sans-serif,system-ui,sans-serif" font-size="12.5" fill="#2b2620" text-anchor="middle">
    <rect x="16"  y="60" width="132" height="52" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="82" y="82">Appli Kokkos</text>
    <text x="82" y="99" font-size="10" fill="#6b6258">parallel_for · régions</text>
    <rect x="172" y="60" width="120" height="52" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="232" y="82">Callbacks Tools</text>
    <text x="232" y="99" font-size="10.5" fill="#6b6258">début / fin</text>
    <rect x="316" y="60" width="124" height="52" rx="8" fill="#f6ead2" stroke="#c8821e" stroke-width="1.4"/>
    <text x="378" y="82" fill="#7a4e10">connecteur énergie</text>
    <text x="378" y="99" font-size="10.5" fill="#9a6a1e">&#8747; trapèze</text>
    <rect x="464" y="60" width="134" height="52" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="531" y="82">joules par région</text>
    <text x="531" y="99" font-size="10.5" fill="#6b6258">sommés sur les appels</text>
    <rect x="622" y="60" width="122" height="52" rx="8" fill="#e7efe0" stroke="#5f8a3a" stroke-width="1.4"/>
    <text x="683" y="82" fill="#3f6326">tableau de bord</text>
    <text x="683" y="99" font-size="10.5" fill="#4d7030">joules / exécution</text>
  </g>
  <g stroke="#2b2620" stroke-width="1.5" fill="none">
    <line x1="148" y1="86" x2="170" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="292" y1="86" x2="314" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="440" y1="86" x2="462" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="598" y1="86" x2="620" y2="86" marker-end="url(#ar-k1)"/>
  </g>
  <rect x="150" y="208" width="448" height="96" rx="10" fill="none" stroke="#b9ad97" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="374" y="202" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11.5" fill="#8a7d63">puissance lue hors bande, à cadence fixe</text>
  <g font-family="ui-sans-serif,system-ui,sans-serif" font-size="12.5" fill="#2b2620" text-anchor="middle">
    <rect x="166" y="232" width="120" height="50" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="226" y="254">NVML</text>
    <text x="226" y="271" font-size="10" fill="#6b6258">par GPU · mW</text>
    <rect x="316" y="232" width="124" height="50" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="378" y="254">thread échantillonneur</text>
    <text x="378" y="271" font-size="10" fill="#6b6258">lit la puissance tous les &#916;t</text>
    <rect x="470" y="232" width="124" height="50" rx="8" fill="#faf7f0" stroke="#2b2620" stroke-width="1.3"/>
    <text x="532" y="254">Variorum</text>
    <text x="532" y="271" font-size="10" fill="#6b6258">nœud · CPU+DRAM</text>
  </g>
  <g stroke="#2b2620" stroke-width="1.5" fill="none">
    <line x1="286" y1="257" x2="314" y2="257" marker-end="url(#ar-k1)"/>
    <line x1="470" y1="257" x2="442" y2="257" marker-end="url(#ar-k1)"/>
    <line x1="378" y1="232" x2="378" y2="114" marker-end="url(#ar-k1)"/>
  </g>
  <text x="392" y="180" text-anchor="start" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" font-style="italic" fill="#6b6258">la trace, pas une lecture aux bornes</text>
</svg>
<figcaption>Les callbacks ne font que marquer quand chaque région s'ouvre et se ferme. L'énergie vient d'une trace de puissance séparée que le connecteur intègre sur ces fenêtres, avec NVML ou Variorum sous l'échantillonneur selon que vous interrogez la carte ou le nœud.</figcaption>
</figure>

<figure>
  <img src="/blog/kokkos/smoky-poster.jpg" alt="Ethan Puyaubreau debout à côté de son poster, Understanding GPU Energy Dynamics in HPC Applications, à la Smoky Mountains Conference 2025." loading="lazy" />
  <figcaption>Le connecteur a commencé comme un projet d'été et est devenu ce que j'ai présenté à la Smoky Mountains Conference.</figcaption>
</figure>

<h2>Ce que les joules par noyau vous apportent</h2>

<p>Une fois l'énergie imputée au noyau qui l'a dépensée, on peut enfin optimiser la grandeur qu'on vous facture vraiment, au lieu d'utiliser le temps comme approximation en espérant que les deux concordent. Ils ne concordent pas toujours : le noyau le plus rapide n'est souvent pas le plus efficace en énergie, parce qu'aller vite peut vouloir dire faire tourner le silicium à son plafond de puissance, et un noyau plus lent limité par la mémoire peut être le moins cher à exécuter un million de fois. Une frise temporelle ne montre rien de tout ça ; les joules posés à côté du nombre d'appels, si.</p>

<p>Le connecteur existe sous forme d'une petite pile de PR ouvertes en amont sur <code>kokkos/kokkos-tools</code>, le backend NVML et celui Variorum, et sur mes propres machines les joules par noyau alimentent le même tableau de bord que le reste de mon travail GPU, si bien qu'une exécution montre l'énergie par solution à côté de l'utilisation, plutôt que dans un log séparé que personne n'ouvre. Ce qui manque encore, c'est la résolution sous la carte entière : l'imputation à l'appareil reste grossière, et je n'ai pas de réponse propre pour les flux concurrents.</p>
