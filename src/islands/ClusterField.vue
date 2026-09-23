<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

// A live map of the homelab cluster, drawn on a 2D canvas: the edge node as a
// hub, the four other nodes around it, their services as satellites, and
// traffic flowing ingress -> Traefik -> a backend node -> one of its services
// (the real request path). Decorative and aria-hidden: the hero's title and
// lede are server-rendered text, so this never carries meaning on its own.
// Pauses off-screen and when the tab is hidden; under reduced motion it slows to
// a calmer drift rather than freezing (the homepage hero does the same). Glow is
// drawn with a cached radial sprite over additive blending, so a few hundred
// points stay cheap.

interface FieldStrings {
  readonly canvasLabel: string;
  readonly legendNode: string;
  readonly legendService: string;
  readonly legendTraffic: string;
  readonly note: string;
}
interface NodeLabel {
  readonly id: string;
  readonly role: string;
}
const props = defineProps<{ strings: FieldStrings; nodes: readonly NodeLabel[] }>();

// Visual topology (normalized 0..1). edge is the edge/hub; Traefik proxies
// to backends on the other four. `svc` is roughly how many services each hosts.
interface NodeViz {
  id: string;
  x: number;
  y: number;
  core: number; // core radius scale
  svc: number; // service satellites
  hub?: boolean;
}
const TOPOLOGY: Record<string, NodeViz> = {
  edge: { id: "edge", x: 0.2, y: 0.52, core: 1.15, svc: 3, hub: true },
  apps: { id: "apps", x: 0.54, y: 0.28, core: 1.0, svc: 5 },
  aux: { id: "aux", x: 0.5, y: 0.76, core: 0.95, svc: 1 },
  core: { id: "core", x: 0.81, y: 0.44, core: 1.3, svc: 8 },
  gpu: { id: "gpu", x: 0.78, y: 0.78, core: 1.05, svc: 3 },
};

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let glow: HTMLCanvasElement | null = null;

let raf = 0;
let running = false;
let inView = true;
let motion = 1; // 1 normally, < 1 under reduced motion (calmer, never frozen)
let io: IntersectionObserver | null = null;
let onVis: (() => void) | null = null;

const prefersReduced = (): boolean =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Pt {
  x: number;
  y: number;
}
interface NodeR extends Pt {
  id: string;
  core: number;
  hub: boolean;
}
interface SvcR extends Pt {
  node: string;
}
interface Particle {
  path: Pt[];
  cum: number[]; // cumulative segment lengths, normalized
  t: number;
  speed: number;
}

let W = 1;
let H = 1;
let nodesR: NodeR[] = [];
let svcR: SvcR[] = [];
let edges: [Pt, Pt][] = [];
let ingress: Pt = { x: 0, y: 0 };
let particles: Particle[] = [];

const ACCENT = "240, 180, 41"; // --accent on the dark plate (#f0b429)

// Pre-render a soft radial glow once; drawImage is far cheaper than per-frame
// shadowBlur for a few hundred sprites.
function makeGlow(): HTMLCanvasElement {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, `rgba(${ACCENT}, 1)`);
    grad.addColorStop(0.4, `rgba(${ACCENT}, 0.35)`);
    grad.addColorStop(1, `rgba(${ACCENT}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
  }
  return c;
}

function rng(seed: number): () => number {
  // Small deterministic PRNG so the layout is stable across frames/resizes.
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function layout(): void {
  const el = canvas.value;
  if (!el) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = Math.max(1, Math.floor(el.clientWidth * dpr));
  H = Math.max(1, Math.floor(el.clientHeight * dpr));
  if (el.width !== W || el.height !== H) {
    el.width = W;
    el.height = H;
  }
  const px = (nx: number): number => nx * W;
  const py = (ny: number): number => ny * H;

  nodesR = props.nodes
    .map((n) => TOPOLOGY[n.id])
    .filter((v): v is NodeViz => Boolean(v))
    .map((v) => ({ id: v.id, x: px(v.x), y: py(v.y), core: v.core, hub: Boolean(v.hub) }));

  ingress = { x: -0.04 * W, y: 0.52 * H };

  // edge (hub) -> every other node: Traefik proxying to backends.
  const hub = nodesR.find((n) => n.hub) ?? nodesR[0];
  edges = nodesR.filter((n) => n !== hub).map((n) => [hub, n] as [Pt, Pt]);

  // Service satellites scattered on a ring around each node.
  const r = rng(1337);
  const ringBase = Math.min(W, H) * 0.07;
  svcR = [];
  for (const n of nodesR) {
    const viz = TOPOLOGY[n.id];
    const count = viz ? viz.svc : 3;
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const rad = ringBase * (0.7 + r() * 0.9) * (n.hub ? 1.1 : 1);
      svcR.push({ node: n.id, x: n.x + Math.cos(a) * rad, y: n.y + Math.sin(a) * rad * 0.82 });
    }
  }

  buildParticles(hub);
}

function pathCum(path: Pt[]): number[] {
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    segs.push(d);
    total += d;
  }
  const cum = [0];
  let acc = 0;
  for (const d of segs) {
    acc += d / (total || 1);
    cum.push(acc);
  }
  return cum;
}

function newPath(hub: NodeR, r: () => number): Particle {
  const backends = nodesR.filter((n) => n !== hub);
  const node = backends.length ? backends[Math.floor(r() * backends.length)] : hub;
  const svcOfNode = svcR.filter((s) => s.node === node.id);
  const svc = svcOfNode.length ? svcOfNode[Math.floor(r() * svcOfNode.length)] : node;
  const path: Pt[] = [ingress, hub, node, svc];
  return { path, cum: pathCum(path), t: r(), speed: 0.06 + r() * 0.1 };
}

let prng = rng(7);
function buildParticles(hub: NodeR): void {
  prng = rng(7);
  const count = Math.round((W / 1000) * 90) + 60; // ~60-150 by width
  particles = [];
  for (let i = 0; i < count; i++) particles.push(newPath(hub, prng));
}

function along(p: Particle): Pt {
  const { path, cum, t } = p;
  let i = 1;
  while (i < cum.length && cum[i] < t) i++;
  if (i >= path.length) return path[path.length - 1];
  const span = cum[i] - cum[i - 1] || 1;
  const f = (t - cum[i - 1]) / span;
  const a = path[i - 1];
  const b = path[i];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

function sprite(p: Pt, size: number, alpha: number): void {
  if (!ctx || !glow) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(glow, p.x - size / 2, p.y - size / 2, size, size);
}

function draw(time: number, animate: boolean): void {
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  // dark plate ground
  ctx.fillStyle = "#070809";
  ctx.fillRect(0, 0, W, H);

  // gentle global drift for life (off under reduced motion)
  const driftX = animate ? Math.sin(time * 0.00013) * 6 * dpr * motion : 0;
  const driftY = animate ? Math.cos(time * 0.00017) * 5 * dpr * motion : 0;
  ctx.translate(driftX, driftY);

  // edges (faint hairlines)
  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(1, dpr);
  ctx.strokeStyle = `rgba(${ACCENT}, 0.1)`;
  for (const [a, b] of edges) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // ingress beam into the hub
  const hub = nodesR.find((n) => n.hub);
  if (hub) {
    ctx.strokeStyle = `rgba(${ACCENT}, 0.07)`;
    ctx.beginPath();
    ctx.moveTo(ingress.x, ingress.y);
    ctx.lineTo(hub.x, hub.y);
    ctx.stroke();
  }

  // additive glow for everything that emits light
  ctx.globalCompositeOperation = "lighter";

  // service satellites
  const sBase = Math.min(W, H) * 0.018;
  for (const s of svcR) sprite(s, sBase, 0.5);

  // traffic
  for (const p of particles) {
    if (animate) {
      p.t += p.speed * 0.016 * motion;
      if (p.t >= 1 && hub) {
        const np = newPath(hub, prng);
        p.path = np.path;
        p.cum = np.cum;
        p.t = 0;
        p.speed = np.speed;
      }
    }
    const pos = along(p);
    const fade = Math.sin(Math.min(p.t, 1) * Math.PI); // dim at both ends
    sprite(pos, sBase * 0.7, 0.18 + 0.5 * fade);
  }

  // nodes (bright cores + pulsing halo)
  const nBase = Math.min(W, H) * 0.06;
  for (const n of nodesR) {
    const pulse = animate ? 0.85 + 0.15 * Math.sin(time * 0.001 * motion + n.x) : 1;
    sprite(n, nBase * n.core * 2.2 * pulse, 0.5);
  }

  // crisp core dots, drawn normally on top
  ctx.globalCompositeOperation = "source-over";
  for (const n of nodesR) {
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.fillStyle = "#fff2d8";
    ctx.arc(n.x, n.y, Math.max(2, nBase * 0.13 * n.core), 0, Math.PI * 2);
    ctx.fill();
  }

  // node labels
  ctx.globalAlpha = 1;
  ctx.fillStyle = `rgba(${ACCENT}, 0.92)`;
  ctx.font = `${Math.round(11 * dpr)}px "JetBrains Mono Variable", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const n of nodesR) {
    ctx.fillText(n.id, n.x, n.y + nBase * 0.32 * n.core + 4 * dpr);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function frame(now: number): void {
  if (!running) return;
  draw(now, true);
  raf = requestAnimationFrame(frame);
}
function start(): void {
  if (running) return;
  running = true;
  raf = requestAnimationFrame(frame);
}
function stop(): void {
  running = false;
  cancelAnimationFrame(raf);
}
function sync(): void {
  if (inView && !document.hidden) start();
  else stop();
}

let onResize: (() => void) | null = null;

// Click-to-explore: hover a node for a tooltip, click to jump to its card.
// A mouse enhancement over the (aria-hidden) field; the node detail is always
// reachable via the cards below, so nothing essential lives only here.
const hoverId = ref<string | null>(null);
const hoverX = ref(0);
const hoverY = ref(0);
const hoverRole = computed(() => props.nodes.find((n) => n.id === hoverId.value)?.role ?? "");

function nodeAt(cssX: number, cssY: number): NodeR | null {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let best: NodeR | null = null;
  let bestD = 30;
  for (const n of nodesR) {
    const d = Math.hypot(cssX - n.x / dpr, cssY - n.y / dpr);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
}
function onPointerMove(e: PointerEvent): void {
  const n = nodeAt(e.offsetX, e.offsetY);
  if (n) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    hoverId.value = n.id;
    hoverX.value = n.x / dpr;
    hoverY.value = n.y / dpr;
  } else {
    hoverId.value = null;
  }
}
function onPointerLeave(): void {
  hoverId.value = null;
}
function onSelect(e: MouseEvent): void {
  const n = nodeAt(e.offsetX, e.offsetY);
  if (!n) return;
  const card = document.getElementById(`node-${n.id}`);
  if (!card) return;
  card.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "center" });
  card.classList.add("flash");
  setTimeout(() => card.classList.remove("flash"), 1300);
}

onMounted(() => {
  const el = canvas.value;
  if (!el) return;
  ctx = el.getContext("2d");
  if (!ctx) return;
  glow = makeGlow();
  layout();

  // Under reduced motion, slow the field rather than freeze it (matching the
  // homepage hero): it stays alive but calmer.
  motion = prefersReduced() ? 0.45 : 1;

  onResize = () => {
    layout();
    if (!running) draw(performance.now(), true);
  };
  window.addEventListener("resize", onResize);

  io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      sync();
    },
    { threshold: 0 },
  );
  io.observe(el);
  onVis = sync;
  document.addEventListener("visibilitychange", onVis);
  sync();
});

onBeforeUnmount(() => {
  stop();
  io?.disconnect();
  if (onVis) document.removeEventListener("visibilitychange", onVis);
  if (onResize) window.removeEventListener("resize", onResize);
});
</script>

<template>
  <div class="field" aria-hidden="true">
    <canvas
      ref="canvas"
      class="field-canvas"
      :class="{ interactive: hoverId }"
      :aria-label="strings.canvasLabel"
      @pointermove="onPointerMove"
      @pointerleave="onPointerLeave"
      @click="onSelect"
    ></canvas>
    <div v-if="hoverId" class="tip" :style="{ left: hoverX + 'px', top: hoverY + 'px' }">
      <span class="tip-id">{{ hoverId }}</span>
      <span class="tip-role">{{ hoverRole }}</span>
    </div>
    <dl class="legend">
      <div><span class="key node"></span>{{ strings.legendNode }}</div>
      <div><span class="key svc"></span>{{ strings.legendService }}</div>
      <div><span class="key traf"></span>{{ strings.legendTraffic }}</div>
    </dl>
  </div>
</template>

<style scoped>
.field {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.field-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.field-canvas.interactive {
  cursor: pointer;
}
.tip {
  position: absolute;
  transform: translate(-50%, -125%);
  pointer-events: none;
  background: var(--bg-raised);
  border: 1px solid var(--accent);
  padding: 0.3rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  max-width: 15rem;
  z-index: 3;
}
.tip-id {
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--ink);
  letter-spacing: var(--tracking-wide);
}
.tip-role {
  font-size: var(--step--2);
  color: var(--muted);
}
.legend {
  position: absolute;
  right: var(--gutter);
  bottom: var(--gutter);
  margin: 0;
  display: grid;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: var(--step--2);
  letter-spacing: var(--tracking-wide);
  color: var(--muted);
  pointer-events: none;
}
.legend div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.key {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  flex: none;
  background: var(--accent);
}
.key.node {
  box-shadow: 0 0 6px var(--accent);
}
.key.svc {
  opacity: 0.55;
  transform: scale(0.7);
}
.key.traf {
  opacity: 0.4;
  transform: scale(0.6);
}
@media (max-width: 640px) {
  .legend {
    font-size: 0.62rem;
  }
}
</style>
