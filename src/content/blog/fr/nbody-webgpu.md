---
title: "Une galaxie dans un onglet, calculée sur votre GPU avec WebGPU"
description: "Une galaxie gravitationnelle N-corps en temps réel : une somme O(N²) en force brute recalculée à chaque image dans un compute shader WebGPU. 65k corps, sans serveur, sans précalcul."
pubDate: 2026-06-09
lang: fr
slug: nbody-webgpu
tags: ["WebGPU", "GPGPU", "WGSL", "simulation"]
---

Je voulais savoir jusqu'où une simulation gravitationnelle N-corps naïve pouvait aller dans un onglet de navigateur, sans serveur et sans images précalculées. La réponse : 65 536 corps à 60 fps sur un GPU dédié récent, soit environ 258 milliards de calculs de force par seconde, le tout via les compute shaders WebGPU.

[Démo en ligne](https://ethan-puyaubreau.github.io/nbody-webgpu/) · [Code source sur GitHub](https://github.com/ethan-puyaubreau/nbody-webgpu) (TypeScript, zéro dépendance runtime)

## La forme du problème

Chaque corps subit la gravité de tous les autres. Avec N corps, c'est N² interactions, recalculées de zéro à chaque image. À 16 384 corps, ça fait environ 268 millions de paires de forces par pas ; à 65 536, c'est 4,3 milliards. Il n'y a ni arbre ni approximation, et rien n'est mis en cache d'une image à l'autre. C'est la somme en force brute, et la seule raison pour laquelle ça tourne en temps réel, c'est qu'un GPU adore faire le même petit calcul quelques milliards de fois en parallèle.

C'est d'abord un problème de calcul ; afficher les points est la partie facile. WebGL sait simuler du calcul avec des astuces de rendu vers texture, mais WebGPU offre de vrais compute shaders et de la mémoire partagée sur puce, exactement ce dont cette charge a besoin. Ce sera donc WebGPU, et la page affiche un message de repli sur les navigateurs qui ne le prennent pas encore en charge.

## Découper la somme des forces en tuiles

Le noyau évident fait boucler chaque thread sur les N corps, en lisant chaque position directement depuis la mémoire globale. Ça marche, mais c'est limité par la bande passante, parce que chaque thread martèle la VRAM pour les mêmes données dont ses voisins ont aussi besoin.

[GPU Gems 3, chapitre 31](https://developer.nvidia.com/gpugems/gpugems3/part-v-physics-simulation/chapter-31-fast-n-body-simulation-cuda) décrit l'agencement N-corps qui règle ça. Chaque groupe de travail charge un bloc de corps (une tuile) depuis la mémoire globale vers la mémoire partagée une seule fois, les threads se synchronisent, puis chacun fait sa boucle interne sur cette copie sur puce. On parcourt la liste des corps tuile par tuile, en payant la lecture en mémoire globale une fois par tuile au lieu d'une fois par paire. La mémoire partagée est environ un ordre de grandeur plus rapide d'accès que la VRAM, et comme chaque thread du groupe réutilise la même tuile, c'est de là que vient l'essentiel du débit.

## Garder le disque en disque : un intégrateur stable

La première version utilisait un simple Euler explicite, et la galaxie se défaisait lentement en bouillie. Euler injecte un peu d'énergie à chaque pas, et sur des millions de pas cette erreur s'accumule jusqu'à faire disparaître la structure.

Passer à un schéma saute-mouton (leapfrog) a réglé ça. C'est l'intégrateur standard pour ce genre de simulation parce qu'il reste stable en énergie sur de longues durées : l'énergie totale oscille un peu mais ne dérive pas, donc le disque garde sa forme sur de longues exécutions. Le prix à payer : garder position et vitesse décalées d'un demi-pas. Sans lui, la galaxie explosait.

## L'adoucissement, pour que les rencontres proches n'explosent pas

La gravité newtonienne varie en 1/r², ce qui veut dire que deux corps qui se frôlent subissent une force énorme et partent à l'infini. Les vrais codes N-corps gèrent ça par adoucissement (_softening_ dans la littérature), et celui-ci aussi : un petit ε² est ajouté à chaque distance au carré avant la division. La force reste finie quelle que soit la proximité des deux corps.

L'adoucissement a un second bénéfice, gratuit. Un corps qui calcule sa propre attraction sur lui-même a r = 0, et avec le terme ε² cette auto-interaction vaut zéro au lieu d'une division par zéro. La boucle interne n'a donc pas besoin de cas particulier pour exclure l'auto-interaction, ce qui la garde sans branchement.

## Tampons ping-pong et un détail d'ordonnancement WebGPU

Les positions vivent dans deux tampons. Chaque pas lit l'un et écrit l'autre, puis on les échange. Ça évite le conflit d'accès lecture-écriture qui surviendrait en mettant à jour les positions sur place pendant que d'autres threads les lisent encore.

À l'intérieur d'une même passe de calcul WebGPU, les lancements sont ordonnés. Quand j'enchaîne plusieurs sous-pas dans une seule passe, la lecture-après-écriture entre eux est donc déjà sûre, et je n'ai pas besoin d'insérer de barrières manuelles. Les vitesses, elles, vivent dans un seul tampon, parce que chaque thread ne touche jamais qu'à sa propre vitesse : aucun conflit possible.

## Dessiner 65k points qui ne font pas 1 pixel

La primitive point de WebGPU ne dessine jamais qu'un point d'un pixel, ce qui ressemble à de la neige. Chaque corps est donc rendu comme un quad instancié, deux triangles agrandis à une taille fixe en pixels, avec une atténuation radiale douce dans le fragment shader et un mélange additif pour que les corps qui se chevauchent rayonnent. La couleur est indexée sur la vitesse, donc le disque interne rapide chauffe et le bord lent reste sombre. Sans cette correspondance, l'image se lit comme un nuage de particules.

## Partir de quelque chose qui a déjà l'air juste

L'état initial est un disque en rotation autour d'une masse centrale lourde. La vitesse orbitale de chaque corps est fixée à partir de la masse contenue à l'intérieur de son rayon, donc le disque démarre en équilibre rotationnel approximatif au lieu de s'effondrer vers le centre. Les rayons sont biaisés vers le centre pour que le cœur soit plus dense que le bord, une petite épaisseur verticale vient d'une normale de Box-Muller, et une légère dispersion des vitesses l'empêche de ressembler à un anneau d'horlogerie. Le générateur pseudo-aléatoire est initialisé avec une graine, donc la même galaxie revient à chaque rechargement.

## Bilan

Sur un GPU dédié récent, ça tient 60 fps à 65k corps, soit, d'après l'affichage à l'écran, environ 258 milliards d'interactions entre paires par seconde (N² × fps). La galaxie derrière la page d'accueil de ce site tourne avec 16 384 corps seulement, pour rester fluide sur un portable. L'ensemble tient en une poignée de fichiers TypeScript et deux shaders WGSL, construit avec Vite, sans dépendance à l'exécution, et se déploie sur GitHub Pages.

Pour dépasser le plafond en N², il faudrait Barnes-Hut ou une méthode multipolaire rapide (FMM), avec des millions de corps en ligne de mire ; faire entrer deux disques en collision viendrait ensuite. En attendant, la version O(N²) bête et méchante va déjà nettement plus loin que je ne le pensais.
