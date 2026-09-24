---
title: "A galaxy in a browser tab, computed on your GPU with WebGPU"
description: "A real-time gravitational N-body galaxy, a brute-force O(N²) sum recomputed every frame in a WebGPU compute shader. 65k bodies, no server, no precompute."
pubDate: 2026-06-09
lang: en
slug: nbody-webgpu
tags: ["WebGPU", "GPGPU", "WGSL", "simulation"]
---

I wanted to know how far a naive gravitational N-body simulation could go in a browser tab, with no server and no precomputed frames. The answer turned out to be 65,536 bodies at 60 fps on a recent discrete GPU, which is about 258 billion pairwise force computations every second, all running through WebGPU compute shaders.

[Live demo](https://ethan-puyaubreau.github.io/nbody-webgpu/) · [Source on GitHub](https://github.com/ethan-puyaubreau/nbody-webgpu) (TypeScript, no runtime dependencies)

## The shape of the problem

Every body in the simulation feels gravity from every other body. With N bodies that is N² interactions, recomputed from scratch on every single frame. At 16,384 bodies that is about 268 million force pairs per step; at 65,536 it is 4.3 billion. There is no tree and no approximation, and nothing is cached between frames. It is the brute-force sum, and the only reason it runs in real time is that a GPU is very happy doing the same small computation a few billion times in parallel.

This is a compute problem first; drawing the points is the easy part. WebGL can fake compute with render-to-texture tricks, but WebGPU gives you actual compute shaders and on-chip shared memory, exactly what this workload wants. So WebGPU it is, and the page falls back to a notice on browsers that do not support it yet.

## Tiling the force sum into shared memory

The obvious kernel has each thread loop over all N bodies, reading every position straight from global memory. It works and it is bandwidth-bound, because every thread is hammering VRAM for the same data its neighbors also need.

[GPU Gems 3, chapter 31](https://developer.nvidia.com/gpugems/gpugems3/part-v-physics-simulation/chapter-31-fast-n-body-simulation-cuda) describes the N-body layout that solves this. Each workgroup loads a block of bodies (a tile) from global memory into shared memory once, the threads synchronize, and then everyone runs their inner loop against that on-chip copy. You march through the body list tile by tile, paying the global-memory read once per tile instead of once per pair. Shared memory is roughly an order of magnitude faster to hit than VRAM, and since every thread in the workgroup reuses the same tile, that is where most of the throughput comes from.

## Keeping the disk a disk: a stable integrator

The first version used plain forward Euler and the galaxy slowly unwound into a smear. Euler adds a little energy every step, and over millions of steps that error compounds until the structure is gone.

Switching to a leapfrog step fixed it. Leapfrog is the standard integrator for this kind of simulation because it stays energy-stable over long runs: the total energy wobbles a little but does not drift, so the disk holds its shape over long runs. The price is one extra bit of bookkeeping, keeping position and velocity half a step apart. Without it the galaxy exploded.

## Softening, so close encounters do not blow up

Newtonian gravity goes as 1/r², which means two bodies that pass very close to each other feel an enormous force and get flung to infinity. Real N-body codes handle this with softening, and so does this one: a small ε² is added to each squared distance before the division. The force stays finite no matter how close two bodies get.

Softening has a second, free benefit. A body computing its own pull on itself has r = 0, and with the ε² term that self-interaction evaluates to zero instead of a division by zero. So the inner loop needs no special case to skip the self term, which keeps it branch-free.

## Ping-pong buffers and a WebGPU ordering detail

Positions live in two buffers. Each step reads from one and writes the other, then they swap. This avoids the read-write hazard of updating positions in place while other threads are still reading them.

Within a single WebGPU compute pass, dispatches are ordered. So when I run several substeps back to back in one pass, the read-after-write between them is already safe and I do not need to insert manual barriers. Velocities, by contrast, live in a single buffer, because each thread only ever touches its own velocity, so there is no hazard there.

## Drawing 65k points that are not 1 pixel

WebGPU's point primitive only ever draws a 1-pixel dot, which looks like static. So each body is rendered as an instanced quad, two triangles blown up to a fixed pixel size, with a soft radial falloff in the fragment shader and additive blending so overlapping bodies glow. Color is keyed to speed, so the fast inner disk runs hot and the slow rim stays dark. Without that mapping the image reads as a particle cloud.

## Starting from something that already looks right

The initial state is a rotating disk around a heavy central mass. Each body's orbital speed is set from the mass enclosed inside its radius, so the disk starts in approximate rotational balance instead of immediately collapsing inward. Radii are biased toward the center so the core reads denser than the rim, a little vertical thickness comes from a Box-Muller normal, and a small velocity dispersion keeps it from looking like a clockwork ring. The PRNG is seeded, so the same galaxy comes back on every reload.

## Results

On a recent discrete GPU it holds 60 fps at 65k bodies, which the HUD reports as about 258 billion pairwise interactions per second (N² × fps). The whole thing is a handful of TypeScript files and two WGSL shaders, built with Vite, with no runtime dependencies, and it deploys to GitHub Pages.

Barnes-Hut or a fast multipole method (FMM) would break the N² ceiling and open the door to millions of bodies; colliding two disks would come after that. For now the dumb O(N²) version goes considerably further than I expected.
