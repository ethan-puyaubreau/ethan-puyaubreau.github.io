---
title: "Imputer l'énergie GPU au code qui l'a dépensée"
description: "Un profileur vous dit où du code GPU passe son temps. Je voulais savoir où il dépense ses joules : j'ai donc construit un connecteur Kokkos Tools qui échantillonne la puissance sur un thread dédié et l'intègre sur chaque région profilée. Sur le DBSCAN d'ArborX, l'implémentation la plus rapide économise plus d'énergie que de temps : 19 % de temps et 25 % d'énergie en moins."
pubDate: 2026-06-12
updatedDate: 2026-09-24
pinned: true
lang: fr
slug: kokkos-gpu-energy
tags: ["HPC", "GPU", "Kokkos", "NVML"]
---

<p>J'ai passé l'été 2025 à Oak Ridge là-dessus, et la question de départ est courte : la façon la plus rapide de calculer quelque chose est-elle aussi la moins coûteuse en énergie ? Un profileur classe le code selon le temps passé, mais les clusters tournent de plus en plus sous un plafond de puissance plutôt que sous une cible de fréquence : l'énergie consommée pour obtenir un résultat devient le chiffre qui compte, et presque rien dans un flux de travail HPC habituel ne la mesure par région. J'ai donc construit un outil qui le fait : un connecteur Kokkos Tools qui impute les joules à chaque région profilée sans toucher à l'application qu'il mesure.</p>

<p>Commençons par le résultat qui a fini sur le poster. ArborX propose deux implémentations de DBSCAN, <code>fdbscan</code> et <code>fdbscan-dense</code>. Sur la même entrée et le même NVIDIA H100 NVL, elles renvoient les mêmes clusters, et sur 64 exécutions de chacune, la version dense est plus rapide et plus sobre :</p>

<table class="results">
  <caption>Médianes sur 64 exécutions de chaque variante.</caption>
  <thead><tr><th scope="col">variante</th><th scope="col">région DBSCAN</th><th scope="col">énergie</th><th scope="col">puissance moyenne</th></tr></thead>
  <tbody>
    <tr><th scope="row"><code>fdbscan</code></th><td>2,69 s</td><td>777 J</td><td>288 W</td></tr>
    <tr><th scope="row"><code>fdbscan-dense</code></th><td>2,19 s</td><td>580 J</td><td>262 W</td></tr>
  </tbody>
</table>

<figure>
  <img src="/blog/kokkos/fdbscan.png" alt="Puissance GPU dans le temps pour fdbscan d'ArborX sur un H100 NVL, un plateau autour de 300 W sous un plafond de 350 W. Énergie totale estimée : 925,1 J, dont 772,8 J dans les régions de noyaux." width="1200" height="898" loading="lazy" />
  <img src="/blog/kokkos/fdbscan-dense.png" alt="Puissance GPU dans le temps pour fdbscan-dense sur le même GPU et la même entrée, un plateau similaire. Énergie totale estimée : 784,8 J, dont 615,6 J dans les régions de noyaux." width="1200" height="898" loading="lazy" />
  <figcaption>Figure 3 du poster : <code>fdbscan</code> (en haut) et <code>fdbscan-dense</code> (en bas). Les bandes colorées sont les régions Kokkos ; l'énergie est la trace de puissance intégrée dans le temps.</figcaption>
</figure>

<p>Quatre chiffres décrivent <code>fdbscan</code>, et ils ne mesurent pas la même chose. Le tableau donne 777 J, la médiane sur 64 exécutions de la seule région DBSCANCalculation. L'une de ces exécutions, tracée sur la page d'accueil du site, dépense 769 J dans cette région. L'encadré du poster, intitulé DBSCAN Calculation, affiche 772,8 J parce qu'il additionne toutes les régions de noyaux de l'exécution, et son total de 925,1 J compte aussi le temps passé hors de toute région. Le poster présentait les deux durées comme égales ; les horodatages des régions montrent l'écart de 19 % du tableau. Les traces des 128 exécutions et le script qui recalcule ces chiffres sont <a href="https://github.com/ethan-puyaubreau/smc2025-gpu-energy-poster#data-and-reproduction">publiés avec le poster</a>.</p>

<p>Une chose encore que les médianes cachent. Les 16 premières exécutions de <code>fdbscan-dense</code>, consécutives au début de la série, sont environ 1,5 fois plus lentes dans chaque phase (3,4 à 3,9 s) et consomment moins (222 W en moyenne), ce qui ressemble à un état différent de la machine plutôt qu'à l'algorithme. Je les ai gardées dans les médianes. Sans elles, la comparaison bouge à peine (19 % de temps et 26 % d'énergie en moins) ; avec elles, les moyennes sur les 64 exécutions donnent 5 % de temps et 18 % d'énergie en moins. Un bootstrap sur les exécutions place les réductions médianes entre 17,6 et 19,3 % pour le temps et entre 24,9 et 26,0 % pour l'énergie.</p>

<p>La variante la plus rapide gagne donc aussi sur l'énergie, mais davantage : 25 % d'énergie en moins pour 19 % de temps en moins, parce que sa puissance moyenne est aussi inférieure de 9 % pendant l'exécution. Un profil temporel rapporterait les 19 %. Les six points restants n'apparaissent que si l'on mesure l'énergie au lieu de la déduire du temps.</p>

<h2>De l'instrumentation qu'on n'a pas à compiler</h2>

<p>Kokkos annonce déjà ce qu'il fait. Chaque <code>parallel_for</code>, <code>parallel_reduce</code> et <code>parallel_scan</code> déclenche un callback de début avant de se lancer et un callback de fin une fois terminé, et on peut entourer des portions de code arbitraires de régions nommées avec des marqueurs push et pop. Un connecteur Kokkos Tools n'est qu'une bibliothèque partagée qui implémente ces callbacks, et on l'attache en pointant une variable d'environnement vers elle. Aucune recompilation de l'application, aucune annotation dans ses sources, aucun fork du code. On met <code>KOKKOS_TOOLS_LIBS</code> sur le chemin de la bibliothèque et le runtime la charge.</p>

<p>Je pouvais donc prendre un solveur que je n'avais pas écrit, que personne ne voulait me voir modifier, et mesurer l'énergie de ses régions en chargeant une bibliothèque de plus à côté. Le connecteur écoute les événements que Kokkos émet déjà, et la mesure se greffe dessus.</p>

<h2>On ne peut pas lire l'énergie, seulement observer la puissance</h2>

<p>La première version évidente lit le capteur de puissance au callback de début, le relit à la fin, et multiplie la moyenne par la durée ; c'est ce que fait le <a href="https://github.com/kokkos/kokkos-tools/tree/develop/profiling/variorum-connector">connecteur Variorum</a> déjà présent dans Kokkos Tools. Ça ne marche pas, et la raison pour laquelle ça ne marche pas est au cœur du problème. La bibliothèque de gestion de NVIDIA, NVML, expose <code>nvmlDeviceGetPowerUsage</code>, qui renvoie la puissance instantanée de la carte en milliwatts. Le piège est double. Cette valeur n'est rafraîchie que toutes les 100 ms, et elle ne moyenne que les 25 dernières ms de chaque intervalle (<a href="https://doi.org/10.1109/SC41406.2024.00028">Yang, Adamek et Armour, SC24</a>) : l'essentiel de ce que fait la carte n'est jamais observé. La plupart des noyaux HPC durent moins de 10 ms : début et fin renvoient alors souvent la même valeur périmée, et la durée ne dit rien. Et même quand une région est assez longue pour couvrir plusieurs mises à jour, deux lectures ponctuelles ne peuvent pas décrire une courbe qui monte et descend pendant toute sa durée.</p>

<p>Le problème de fond, c'est que la puissance est la mauvaise grandeur à échantillonner aux bornes. La puissance est un débit instantané, en watts. Ce qu'on paie, c'est de l'énergie, en joules, et l'énergie est l'intégrale de la puissance dans le temps. Deux lectures donnent deux hauteurs d'une courbe. La facture, c'est l'aire en dessous. Ma première version donnait n'importe quoi sur les noyaux courts : tantôt zéro, tantôt la puissance du noyau précédent, selon le côté d'une mise à jour du capteur où tombaient les deux lectures, et c'était le signal pour cesser d'échantillonner au rythme du noyau et passer au rythme de l'horloge.</p>

<figure>
<svg viewBox="0 0 720 380" role="img" aria-label="Une courbe puissance-temps schématique pour trois régions profilées, A, B et C, chacune à un niveau de puissance différent. Des points d'échantillonnage jalonnent la courbe à cadence fixe. Une ligne pointillée marque le plancher de repos, et l'aire sous la première région est ombrée et annotée énergie égale l'intégrale de la puissance dans le temps." xmlns="http://www.w3.org/2000/svg">
  <g stroke="#c9c9c4" stroke-width="1">
    <line x1="70" y1="50" x2="70" y2="300"/>
    <line x1="70" y1="300" x2="700" y2="300"/>
  </g>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="12.5" fill="#5f5f5c" text-anchor="end">
    <line x1="66" y1="300" x2="70" y2="300" stroke="#c9c9c4"/><text x="61" y="304">0</text>
    <line x1="66" y1="217" x2="70" y2="217" stroke="#c9c9c4"/><text x="61" y="221">100</text>
    <line x1="66" y1="133" x2="70" y2="133" stroke="#c9c9c4"/><text x="61" y="137">200</text>
    <line x1="66" y1="50"  x2="70" y2="50"  stroke="#c9c9c4"/><text x="61" y="54">300</text>
  </g>
  <text x="70" y="36" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#5f5f5c">puissance (W)</text>
  <text x="694" y="318" text-anchor="end" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#5f5f5c">temps &#8594;</text>
  <g font-family="JetBrains Mono Variable,ui-monospace,monospace" font-size="11" text-anchor="middle">
    <rect x="95"  y="50" width="160" height="250" fill="#b93a0a" opacity="0.05"/>
    <rect x="300" y="50" width="170" height="250" fill="#3d3d3d" opacity="0.06"/>
    <rect x="510" y="50" width="140" height="250" fill="#5f5f5c" opacity="0.05"/>
    <text x="175" y="64" fill="#9a3412">région A</text>
    <text x="385" y="64" fill="#111111">région B</text>
    <text x="580" y="64" fill="#3d3d3d">région C</text>
  </g>
  <polygon points="99,108 255,112 255,249 99,249" fill="#b93a0a" opacity="0.22"/>
  <polygon points="99,249 255,249 255,300 99,300" fill="#5f5f5c" opacity="0.10"/>
  <line x1="70" y1="249" x2="700" y2="249" stroke="#5f5f5c" stroke-width="1.2" stroke-dasharray="6 4"/>
  <text x="700" y="245" text-anchor="end" font-family="Archivo Variable,system-ui,sans-serif" font-size="10.5" fill="#5f5f5c">plancher de repos</text>
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
  <text x="177" y="180" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="11" fill="#9a3412">Énergie = &#8747; P dt</text>
  <text x="177" y="198" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="10.5" fill="#9a3412">aire au-dessus du repos = coût marginal</text>
</svg>
<figcaption>Un schéma, pas une mesure. L'énergie d'une région est l'aire sous sa courbe de puissance. La ligne pointillée est le plancher de repos ; le coût marginal d'une région est la part de l'aire qui se situe au-dessus. Les points sont le thread dédié qui échantillonne à cadence fixe.</figcaption>
</figure>

<h2>Un thread dédié, une cadence fixe, et un trapèze</h2>

<p>Il faut donc dissocier l'échantillonnage de l'exécution des noyaux. Un thread en arrière-plan interroge le capteur de puissance à intervalle fixe, toutes les 20 ms dans le connecteur actuel, et horodate chaque lecture, construisant une trace continue de l'évolution de la consommation de la carte sur toute l'exécution. Les callbacks de début et de fin ne lisent plus du tout la puissance. Ils enregistrent une fenêtre temporelle, le moment où la région s'est ouverte et celui où elle s'est refermée. Pour obtenir l'énergie d'une région, le connecteur intègre la trace de puissance sur cette fenêtre avec la règle des trapèzes, en sommant les petits trapèzes entre échantillons consécutifs qui tombent à l'intérieur. Comme on entre de nombreuses fois dans la même région, ses joules se cumulent d'un appel à l'autre.</p>

<p>Échantillonner au rythme de l'horloge plutôt qu'à celui du noyau donne une trace continue, mais ne fait pas mieux que le capteur. Avec une fenêtre de 25 ms toutes les 100 ms, un noyau court isolé est pratiquement invisible, et additionner de nombreux lancements ne corrige pas un angle mort qui revient à la même phase. Ce que la trace mesure de façon fiable, c'est une région bien plus longue que l'intervalle de rafraîchissement : une phase de solveur, ou un algorithme entier, comme les deux exécutions de DBSCAN ci-dessus. Le poster gagne un peu de résolution en répétant une exécution 64 fois, avec un départ décalé de 5 ms à chaque fois, et en gardant la lecture la plus haute pour chaque noyau. Ce sont les mêmes 64 exécutions que celles des médianes ci-dessus, où chaque exécution est intégrée séparément. Dans les deux cas, la conclusion reste la même : l'énergie par noyau reste hors de portée via NVML.</p>

<h2>Les limites du chiffre</h2>

<p>NVML fournit la puissance de la carte entière, pas par SM (multiprocesseur) : c'est une imputation à l'échelle du GPU. Si deux noyaux s'exécutent en même temps sur le même GPU, sur des streams CUDA distincts, la trace ne peut pas dire lequel a consommé quel watt, et l'énergie du recouvrement ne peut pas être répartie proprement entre eux. Le total inclut aussi ce que la carte consomme entre les régions : dans les exécutions de DBSCAN ci-dessus, 16,5 % et 21,6 % de l'énergie tombent hors de toute région Kokkos, et c'est pourquoi le connecteur de 2025 donne les deux chiffres. Une imputation à l'échelle du GPU suffit pour comparer des algorithmes par l'énergie, pas pour classer des noyaux isolés.</p>

<h2>Deux backends, deux questions différentes</h2>

<p>NVML répond à une seule question : ce qu'a consommé ce GPU NVIDIA. La mesure est par carte, en milliwatts, NVIDIA uniquement, et ne voit rien hors de la carte. Le connecteur de 2025 (#302) a donc un second backend bâti sur Variorum, indépendant du fournisseur, qui lit la puissance au niveau du nœud et du socket, y compris le CPU (via RAPL, les compteurs de puissance intégrés aux processeurs Intel et AMD), la DRAM, et certains GPU non NVIDIA. NVML donne ce que le GPU a consommé, Variorum ce que le nœud entier a consommé. Une région qui paraît bon marché sur la carte peut tout de même brasser assez de données pour faire chauffer le CPU et les contrôleurs mémoire autour d'elle, et seule la vue au niveau du nœud le détecte. On se tourne vers NVML quand la question porte sur ce qu'a dépensé le GPU lui-même, et vers Variorum quand on veut la facture énergétique que la salle machine voit réellement.</p>

<figure>
<svg viewBox="0 0 760 340" role="img" aria-label="Le pipeline du connecteur. L'application Kokkos déclenche les callbacks Tools à chaque région parallèle ; le connecteur énergie reçoit une trace de puissance d'un thread échantillonneur qui lit la puissance hors bande à intervalle fixe ; NVML et Variorum alimentent l'échantillonneur ; le connecteur intègre la trace par région en joules, qui partent vers energy-dashboard-for-kokkos, l'outil d'analyse." xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ar-k1" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 z" fill="#111111"/>
    </marker>
  </defs>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="12.5" fill="#111111" text-anchor="middle">
    <rect x="16"  y="60" width="132" height="52" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="82" y="82">Appli Kokkos</text>
    <text x="82" y="99" font-size="10" fill="#5f5f5c">parallel_for · régions</text>
    <rect x="172" y="60" width="120" height="52" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="232" y="82">Callbacks Tools</text>
    <text x="232" y="99" font-size="10.5" fill="#5f5f5c">début / fin</text>
    <rect x="316" y="60" width="124" height="52" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.6"/>
    <text x="378" y="82" fill="#111111">connecteur énergie</text>
    <text x="378" y="99" font-size="10.5" fill="#9a3412">&#8747; trapèze</text>
    <rect x="464" y="60" width="134" height="52" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="531" y="82">joules par région</text>
    <text x="531" y="99" font-size="10.5" fill="#5f5f5c">sommés sur les appels</text>
    <rect x="622" y="54" width="122" height="64" rx="8" fill="#eeeeeb" stroke="#3d3d3d" stroke-width="1.4"/>
    <text x="683" y="74" fill="#111111">energy-dashboard-</text>
    <text x="683" y="89" fill="#111111">for-kokkos</text>
    <text x="683" y="106" font-size="10.5" fill="#3d3d3d">table · trace · HTML</text>
  </g>
  <g stroke="#111111" stroke-width="1.5" fill="none">
    <line x1="148" y1="86" x2="170" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="292" y1="86" x2="314" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="440" y1="86" x2="462" y2="86" marker-end="url(#ar-k1)"/>
    <line x1="598" y1="86" x2="620" y2="86" marker-end="url(#ar-k1)"/>
  </g>
  <rect x="150" y="208" width="448" height="96" rx="10" fill="none" stroke="#a8a8a3" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="374" y="202" text-anchor="middle" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#5f5f5c">puissance lue hors bande, à cadence fixe</text>
  <g font-family="Archivo Variable,system-ui,sans-serif" font-size="12.5" fill="#111111" text-anchor="middle">
    <rect x="166" y="232" width="120" height="50" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="226" y="254">NVML</text>
    <text x="226" y="271" font-size="10" fill="#5f5f5c">par GPU · mW</text>
    <rect x="316" y="232" width="124" height="50" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="378" y="254">thread échantillonneur</text>
    <text x="378" y="271" font-size="10" fill="#5f5f5c">lit la puissance tous les &#916;t</text>
    <rect x="470" y="232" width="124" height="50" rx="8" fill="#ffffff" stroke="#111111" stroke-width="1.3"/>
    <text x="532" y="254">Variorum</text>
    <text x="532" y="271" font-size="10" fill="#5f5f5c">nœud · CPU+DRAM</text>
  </g>
  <g stroke="#111111" stroke-width="1.5" fill="none">
    <line x1="286" y1="257" x2="314" y2="257" marker-end="url(#ar-k1)"/>
    <line x1="470" y1="257" x2="442" y2="257" marker-end="url(#ar-k1)"/>
    <line x1="378" y1="232" x2="378" y2="114" marker-end="url(#ar-k1)"/>
  </g>
  <text x="392" y="180" text-anchor="start" font-family="Archivo Variable,system-ui,sans-serif" font-size="11" font-style="italic" fill="#5f5f5c">trace intégrée</text>
</svg>
<figcaption>Les callbacks ne font que marquer quand chaque région s'ouvre et se ferme. L'énergie vient d'une trace de puissance séparée que le connecteur intègre sur ces fenêtres, avec NVML ou Variorum sous l'échantillonneur selon que vous interrogez la carte ou le nœud. Dans la version de 2026, le connecteur ne fait qu'enregistrer la trace, et c'est energy-dashboard-for-kokkos qui intègre.</figcaption>
</figure>

<h2>Ce que les joules par région apportent</h2>

<p>Une fois l'énergie imputée à la région qui l'a dépensée, on peut enfin optimiser la grandeur réellement facturée, au lieu d'utiliser le temps comme approximation en espérant que les deux concordent. Rien ne les oblige à concorder : aller vite peut vouloir dire faire tourner le silicium à son plafond de puissance, et une phase plus lente limitée par la mémoire peut être la moins chère à exécuter un million de fois. Sur DBSCAN, ils désignent le même gagnant mais pas le même écart : l'écart d'énergie (25 %) dépasse l'écart de temps (19 %).</p>

<p>Le démon d'échantillonnage que j'ai écrit a été fusionné dans <code>kokkos/kokkos-tools</code> (#300) en mars 2026, après que mon encadrant à l'ORNL l'a mené au bout de la relecture ; le cœur (#299) et les connecteurs NVML et Variorum (#301, #302) sont encore ouverts. La trace CSV alimentait d'abord un tableau de bord Grafana et PostgreSQL ; elle passe désormais par <a href="https://github.com/ethan-puyaubreau/energy-dashboard-for-kokkos">energy-dashboard-for-kokkos</a>, un binaire Rust unique, sans démon ni Docker, qui affiche un tableau d'énergie par région, exporte une chronologie Perfetto et produit un rapport HTML autonome. Les résultats complets sont sur la page du <a href="https://ethan-puyaubreau.github.io/smc2025-gpu-energy-poster/">poster que j'ai cosigné avec Daniel Arndt, Jakob Bludau et Damien Lebrun-Grandié</a> (SMC 2025). Ce qui manque encore, c'est une résolution plus fine que la carte entière et que le rafraîchissement de 100 ms : l'imputation reste à l'échelle du GPU, et je n'ai pas de réponse propre pour les streams CUDA concurrents.</p>
