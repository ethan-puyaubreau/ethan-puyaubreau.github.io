<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { Simulation } from "./nbody/simulation";
import { OrbitCamera } from "./nbody/camera";

// Localized chrome, passed from the page (see HeroFallbackStrings in src/lib/ui.ts).
interface HeroFallbackStrings {
  readonly noWebgpu: string;
  readonly noAdapter: string;
  readonly noContext: string;
  readonly deviceLost: string;
  readonly canvasLabel: string;
  readonly posterLabel: string;
  readonly hudRender: string;
  readonly hudBodies: string;
  readonly hudGravity: string;
}

const props = defineProps<{ strings: HeroFallbackStrings }>();

// A calm, cinematic configuration — slower drift and time step than the full
// demo, since here the simulation is the page's backdrop, not a control panel.
const BODIES = 16384;
const PARAMS = { g: 1.0, softening: 0.12, dt: 0.0075 };
const POINT_SIZE = 2.2;
const DRIFT = 0.035; // rad/s

type Status = "boot" | "live" | "unsupported";

const canvas = ref<HTMLCanvasElement | null>(null);
const status = ref<Status>("boot");
const note = ref("");
const fps = ref(0);
const rate = ref("");

const device = shallowRef<GPUDevice | null>(null);
let raf = 0;
let running = false;
let io: IntersectionObserver | null = null;
let onVisibility: (() => void) | null = null;
let inView = true;

const prefersReducedMotion = (): boolean =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

onMounted(() => {
  void boot();
});

onBeforeUnmount(() => {
  running = false;
  cancelAnimationFrame(raf);
  io?.disconnect();
  if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
  device.value?.destroy();
});

async function boot(): Promise<void> {
  const el = canvas.value;
  if (!el) return;

  if (!navigator.gpu) {
    fall(props.strings.noWebgpu);
    return;
  }

  let adapter: GPUAdapter | null = null;
  try {
    adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  } catch {
    adapter = null;
  }
  if (!adapter) {
    fall(props.strings.noAdapter);
    return;
  }

  const dev = await adapter.requestDevice();
  device.value = dev;
  dev.lost.then((info) => {
    if (info.reason !== "destroyed") fall(props.strings.deviceLost);
  });

  const context = el.getContext("webgpu");
  if (!context) {
    fall(props.strings.noContext);
    return;
  }
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device: dev, format, alphaMode: "opaque" });

  const sim = new Simulation(dev, format);
  sim.setParams(PARAMS);
  sim.reset(BODIES);

  const camera = new OrbitCamera();
  // Keep the field alive; reduced-motion only slows the drift, it doesn't freeze it.
  camera.drift = prefersReducedMotion() ? DRIFT * 0.5 : DRIFT;

  let viewport: [number, number] = [1, 1];
  const resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(el.clientWidth * dpr));
    const h = Math.max(1, Math.floor(el.clientHeight * dpr));
    if (w !== el.width || h !== el.height) {
      el.width = w;
      el.height = h;
    }
    viewport = [w, h];
  };
  resize();

  status.value = "live";

  const ema = { v: 60 };
  let last = performance.now();
  let hudAt = 0;

  const frame = (now: number): void => {
    if (!running) return;
    const interval = now - last;
    last = now;
    ema.v += 0.1 * (1000 / Math.max(interval, 1) - ema.v);
    resize();

    camera.update(Math.min(interval / 1000, 0.05));
    const encoder = dev.createCommandEncoder();
    sim.step(encoder, 1);
    const vp = camera.viewProjection(viewport[0] / viewport[1]);
    sim.render(encoder, context.getCurrentTexture().createView(), vp, viewport, POINT_SIZE);
    dev.queue.submit([encoder.finish()]);

    if (now - hudAt > 250) {
      hudAt = now;
      fps.value = Math.round(ema.v);
      rate.value = formatRate(sim.count * sim.count * ema.v);
    }
    raf = requestAnimationFrame(frame);
  };

  const start = (): void => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = (): void => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const sync = (): void => {
    if (inView && !document.hidden) start();
    else stop();
  };

  // Don't burn the GPU when the hero is scrolled away or the tab is hidden.
  io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      sync();
    },
    { threshold: 0 },
  );
  io.observe(el);
  onVisibility = sync;
  document.addEventListener("visibilitychange", onVisibility);
  sync();
}

function fall(message: string): void {
  status.value = "unsupported";
  note.value = message;
}

function formatRate(perSec: number): string {
  if (perSec >= 1e9) return `${(perSec / 1e9).toFixed(1)} G·pairs/s`;
  if (perSec >= 1e6) return `${(perSec / 1e6).toFixed(0)} M·pairs/s`;
  return `${perSec.toFixed(0)} pairs/s`;
}
</script>

<template>
  <div class="hero-canvas" :data-status="status">
    <canvas ref="canvas" class="scene" :aria-label="strings.canvasLabel"></canvas>

    <div
      v-if="status === 'unsupported'"
      class="poster"
      role="img"
      :aria-label="strings.posterLabel"
    >
      <p class="poster-note">{{ note }}</p>
    </div>

    <dl v-if="status === 'live'" class="hud" aria-hidden="true">
      <div>
        <dt>{{ strings.hudRender }}</dt>
        <dd>{{ fps }} fps</dd>
      </div>
      <div>
        <dt>{{ strings.hudBodies }}</dt>
        <dd>16.4k</dd>
      </div>
      <div>
        <dt>{{ strings.hudGravity }}</dt>
        <dd>{{ rate }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.hero-canvas {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.scene {
  width: 100%;
  height: 100%;
  display: block;
  /* dimmed so the masthead reads cleanly over the field */
  opacity: 0.5;
}
.hero-canvas[data-status="unsupported"] .scene {
  display: none;
}

/* Static poster — a suggestion of the field, never a broken image. */
.poster {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: end start;
  padding: var(--gutter);
  background:
    radial-gradient(40% 55% at 52% 46%, rgb(255 174 59 / 0.22), transparent 70%),
    radial-gradient(120% 120% at 52% 46%, rgb(201 132 39 / 0.1), transparent 55%), var(--bg);
}
.poster::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgb(255 241 218 / 0.5) 0.5px, transparent 0.6px);
  background-size: 3px 3px;
  mask-image: radial-gradient(60% 60% at 52% 46%, #000 10%, transparent 72%);
  opacity: 0.5;
}
.poster-note {
  position: relative;
  max-width: 40ch;
  color: var(--ink-dim);
  font-size: var(--step--1);
}

.hud,
.hud-static {
  position: absolute;
  right: var(--gutter);
  bottom: var(--gutter);
  font-family: var(--font-mono);
  font-size: var(--step--2);
  letter-spacing: var(--tracking-wide);
  pointer-events: none;
}
.hud {
  display: grid;
  gap: 4px;
  text-align: right;
  border-right: 1px solid var(--line);
  padding-right: 12px;
}
.hud div {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.hud dt {
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  color: var(--muted);
}
.hud dd {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  min-width: 9ch;
}
.hud-static {
  color: var(--muted);
}

@media (max-width: 640px) {
  .hud,
  .hud-static {
    font-size: 0.62rem;
  }
}
</style>
