---
title: "Lire l'énergie GPU au lieu de l'estimer, sur un MI210 d'AMD"
description: "NVML ne fournit une valeur de puissance que toutes les 100 ms, si bien que mon connecteur Kokkos ne voyait pas les noyaux courts. Les GPU AMD exposent à la place un compteur d'énergie cumulée. Sur un MI210, il avance à peu près chaque milliseconde, mais une lecture coûte un tiers de milliseconde, ce qui décide de la façon dont un profileur doit s'en servir. Mesuré avec lui, fdbscan-densebox d'ArborX prend 38 % de temps et 42 % d'énergie de moins que fdbscan."
pubDate: 2026-10-15
lang: fr
slug: amd-energy-counter
tags: ["HPC", "GPU", "Kokkos", "AMD"]
---

<p><a href="/fr/blog/kokkos-gpu-energy">Le billet précédent</a> se terminait sur une limite. NVML, chez NVIDIA, donne une valeur de puissance toutes les 100 ms qui ne couvre que les 25 dernières millisecondes de l'intervalle : un connecteur Kokkos Tools construit dessus peut imputer l'énergie à de longues régions, jamais à un noyau de quelques millisecondes. En octobre 2026, j'ai eu accès à illyad, un nœud du cluster Frank de l'Université de l'Oregon : deux AMD Instinct MI210 et un H100, sur le nœud où les exécutions du poster ont été faites. Les GPU AMD ne vous obligent pas à intégrer une puissance. Via AMD SMI, ils exposent un compteur de l'énergie consommée par le GPU depuis le chargement du pilote, et la question était de savoir à quoi ce compteur sert vraiment.</p>

<h2>Ce que donne le compteur</h2>

<p><code>amdsmi_get_energy_count</code> renvoie trois nombres : un accumulateur, sa résolution et un horodatage. Le produit des deux premiers donne des joules. Sur le MI210, la résolution vaut exactement 15,3 µJ, le compteur se lit sans droits root, et sur toutes les sondes comme sur les 140 033 échantillons de l'étude ci-dessous, il n'a jamais reculé. Il repart en revanche de zéro quand le pilote est rechargé : il affichait 33,9 MJ une semaine, et 4,4 MJ après le redémarrage du nœud.</p>

<p>Le chiffre intéressant, c'est la fréquence à laquelle il bouge. Lu en boucle, il change de valeur environ toutes les 1,2 ms, et l'horodatage firmware qu'il renvoie avance d'autant. Sous charge, ces paliers ressemblent à ceci :</p>

<figure>
<div class="scroll" tabindex="0" role="region" aria-labelledby="fig-amd-1">
<svg viewBox="0 0 720 360" role="img" aria-label="Tracé en escalier du compteur d'énergie du MI210 lu en boucle sous charge pendant 22 millisecondes. La valeur monte par paliers environ toutes les 1,2 millisecondes, jusqu'à environ 3,3 joules. Des lignes pointillées verticales à 0, 10 et 20 millisecondes marquent les lectures d'un thread d'échantillonnage de période 10 ms." xmlns="http://www.w3.org/2000/svg">
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
  <text x="70" y="36" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#5f5f5c">énergie depuis la première lecture (J)</text>
  <text x="700" y="342" text-anchor="end" font-family="Archivo Variable,system-ui,sans-serif" font-size="13" fill="#5f5f5c">temps (ms)</text>
  <line x1="70.0" y1="50" x2="70.0" y2="300" stroke="#b93a0a" stroke-width="1.2" stroke-dasharray="5 4"/>
  <line x1="351.8" y1="50" x2="351.8" y2="300" stroke="#b93a0a" stroke-width="1.2" stroke-dasharray="5 4"/>
  <line x1="633.6" y1="50" x2="633.6" y2="300" stroke="#b93a0a" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="358" y="66" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#9a3412">lu par un thread de période 10 ms</text>
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
  <text x="98" y="143" font-family="Archivo Variable,system-ui,sans-serif" font-size="11.5" fill="#3d3d3d">une nouvelle valeur environ toutes les 1,2 ms</text>
</svg>
</div>
<figcaption id="fig-amd-1">Lectures brutes du compteur d'un MI210 qui enchaîne des noyaux FMA, les 22 premières millisecondes de la sonde. Chaque point est une nouvelle valeur. Les lignes pointillées marquent les lectures d'un thread d'échantillonnage de période 10 ms.</figcaption>
</figure>

<p>Avec NVML, l'énergie est une estimation : on intègre une courbe qu'on ne voit qu'un quart du temps. Ici, l'énergie entre deux lectures est la différence de deux valeurs du compteur. Rien de ce que le GPU fait entre les deux n'est perdu.</p>

<h2>Une lecture coûte un tiers de milliseconde</h2>

<p>La façon évidente d'utiliser un tel compteur est celle qui échoue avec NVML : le lire quand une région commence, le relire quand elle se termine, soustraire. Avec un compteur, ce serait même juste. C'est trop lent.</p>

<table class="results">
  <caption>Coût d'un appel à <code>amdsmi_get_energy_count</code> sur le MI210, ROCm 7.1.1. Plages sur les sondes au repos, avec un contexte HIP ouvert, et sous charge.</caption>
  <thead><tr><th scope="col">appels</th><th scope="col">médiane</th><th scope="col">p99</th></tr></thead>
  <tbody>
    <tr><th scope="row">enchaînés</th><td>0,26 à 0,29 ms</td><td>0,51 à 0,60 ms</td></tr>
    <tr><th scope="row">espacés de 10 ms</th><td>0,47 à 0,56 ms</td><td>0,88 à 0,95 ms</td></tr>
  </tbody>
</table>

<p>Une demi-milliseconde par lecture, c'est plus long que beaucoup de noyaux. Lire le compteur à chaque borne de région coûterait plus que certaines des régions mesurées. Le compteur doit donc être lu comme NVML : par un thread à part, à période fixe. À 10 ms, ce thread passe environ 5 % d'un cœur dans AMD SMI.</p>

<p>Pourquoi un appel 10 ms après le précédent coûte deux fois plus qu'un appel juste après, on le voit côté pilote. Lire le même compteur directement dans <code>gpu_metrics</code>, dans sysfs, prend 42 µs, et la valeur y change toutes les 1,000 ms, presque à la microseconde près. Mon interprétation, que je n'ai pas vérifiée dans le code du pilote : amdgpu garde une copie de la table de mesures du firmware pendant une milliseconde, et la première lecture après son expiration attend une copie fraîche. Un thread qui lit toutes les 10 ms paie donc toujours cette attente. Le pas de 1,2 ms vu à travers AMD SMI, c'est cette milliseconde plus le temps jusqu'au prochain appel de ~0,3 ms. Deux processus qui lisent en même temps ne sont pas sérialisés ; leur p99 augmente d'environ moitié.</p>

<p>Que coûte la période de 10 ms en précision ? Moins qu'il n'y paraît. L'énergie entre deux échantillons est exacte ; seul son partage à une borne de région est interpolé. À 200 W, c'est au plus environ 2 J par borne : moins de 0,1 % d'une région de plusieurs secondes, beaucoup pour un noyau de quelques millisecondes. Le matériel bouge chaque milliseconde ; le profileur voit toutes les dix.</p>

<h2>L'étude DBSCAN, à nouveau, sur le MI210</h2>

<p>J'ai refait l'étude de cas du poster avec ce compteur : la même entrée HACC de 497 838 606 points, les mêmes paramètres, 64 exécutions de chaque implémentation d'ArborX, en alternance, via un connecteur expérimental qui lit le compteur toutes les 10 ms et écrit le format de trace d'<a href="https://github.com/ethan-puyaubreau/energy-dashboard-for-kokkos">energy-dashboard-for-kokkos</a>.</p>

<table class="results">
  <caption>La région DBSCANCalculation sur un MI210, médianes sur 64 exécutions de chaque implémentation.</caption>
  <thead><tr><th scope="col">implémentation</th><th scope="col">temps</th><th scope="col">énergie</th><th scope="col">puissance moyenne</th></tr></thead>
  <tbody>
    <tr><th scope="row"><code>fdbscan</code></th><td>6,948 s</td><td>1465 J</td><td>211 W</td></tr>
    <tr><th scope="row"><code>fdbscan-densebox</code></th><td>4,309 s</td><td>846 J</td><td>197 W</td></tr>
  </tbody>
</table>

<p>L'implémentation dense prend 38,0 % de temps et 42,2 % d'énergie en moins, et les intervalles bootstrap sur les exécutions font un dixième de point de large. Les exécutions sont aussi remarquablement régulières : les quartiles de <code>fdbscan</code> s'étendent sur 11 ms et 3 J, et aucune exécution n'est plus de 30 % plus lente que sa médiane. Rien de comparable au premier lot lent de la série H100.</p>

<p>Le résultat a la même forme que sur le H100 : l'implémentation la plus rapide est aussi la plus sobre, et l'écart d'énergie dépasse l'écart de temps parce que la puissance moyenne baisse aussi, de 6,8 % ici. Un profil en temps sous-estime encore le gain.</p>

<h2>Ce que ça ne montre pas</h2>

<p>Il est tentant de mettre ce tableau à côté de celui du poster et d'en tirer une comparaison entre AMD et NVIDIA. Elle ne tiendrait pas. Les chiffres du H100 viennent d'une puissance échantillonnée via NVML, d'un ArborX de juillet 2025 et du Kokkos de l'époque ; ceux-ci viennent du compteur d'énergie, de l'ArborX d'octobre 2026 et de Kokkos 5.0.2. L'écart entre les deux implémentations est plus grand ici, 38 % contre 19 % en temps, et je ne sais pas dire quelle part revient au GPU et quelle part à quinze mois de développement d'ArborX.</p>

<p>Deux autres limites. Je n'ai pas comparé le compteur à un wattmètre externe : les joules absolus valent ce que vaut la télémétrie d'AMD ; les comparaisons entre implémentations n'en dépendent pas. Et la machine a changé sous mes pieds : pendant l'étude, le MI210 consommait environ 41 W au repos, et après un redémarrage une semaine plus tard, le même GPU consommait 58 W au repos, fréquences au maximum. Je ne sais pas pourquoi. Les chiffres de l'étude appartiennent au premier état.</p>

<h2>La suite</h2>

<p>Le connecteur lit le compteur à travers une seule classe, seul code à appeler AMD SMI, conçue pour s'insérer dans l'organisation en providers de l'outillage énergie proposé pour Kokkos Tools. Il a pour l'instant son propre thread d'échantillonnage ; la version upstream devra utiliser le démon en revue dans Kokkos Tools (#350), et attend donc sa fusion. La prochaine mesure est celle qui rendrait la comparaison équitable : le même build d'ArborX sur le H100 du même nœud, lu via le compteur d'énergie cumulée de NVML plutôt que sa valeur de puissance.</p>

<p>Le connecteur, les sondes, les données brutes et les scripts qui recalculent chaque chiffre de ce billet sont sur GitHub : <a href="https://github.com/ethan-puyaubreau/mi210-energy-counter">mi210-energy-counter</a>. Cette recherche a utilisé des ressources du cluster Frank de l'Université de l'Oregon.</p>
