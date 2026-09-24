<script setup lang="ts">
import { computed } from "vue";

// Cluster pulse: an aggregate (nodes, guests, CPU, memory) plus two
// sparklines, all from a build-time snapshot rather than a live poll (see
// ClusterNodes.vue for why this site does not fetch the telemetry endpoint
// at runtime).

interface PulseStrings {
  readonly heading: string;
  readonly nodes: string;
  readonly guests: string;
  readonly cpu: string;
  readonly mem: string;
  readonly window: string;
  readonly asOf: string;
}
interface Agg {
  nodesOnline: number;
  nodesTotal: number;
  guestsRunning: number;
  guestsTotal: number;
  cpuPct: number;
  memPct: number;
}
const props = defineProps<{
  strings: PulseStrings;
  agg: Agg;
  cpuHist: readonly number[];
  memHist: readonly number[];
  asOf: string;
  lang: string;
}>();

// Numbers in the page's language (a narrow no-break space before % in French).
const pct = (v: number): string =>
  new Intl.NumberFormat(props.lang, { style: "percent", maximumFractionDigits: 0 }).format(v / 100);

const W = 100;
const H = 28;
function spark(values: readonly number[]): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - pad - ((v - min) / range) * (H - 2 * pad);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
function area(values: readonly number[]): string {
  const line = spark(values);
  if (!line) return "";
  return `${line} L${W},${H} L0,${H} Z`;
}
const cpuLine = computed(() => spark(props.cpuHist));
const cpuArea = computed(() => area(props.cpuHist));
const memLine = computed(() => spark(props.memHist));
const memArea = computed(() => area(props.memHist));
</script>

<template>
  <figure class="pulse">
    <figcaption class="pulse-head">
      <span class="dot" aria-hidden="true"></span>
      {{ strings.heading }}
    </figcaption>

    <dl class="pulse-agg">
      <div>
        <dt>{{ strings.nodes }}</dt>
        <dd>{{ agg.nodesOnline }}/{{ agg.nodesTotal }}</dd>
      </div>
      <div>
        <dt>{{ strings.guests }}</dt>
        <dd>{{ agg.guestsRunning }}/{{ agg.guestsTotal }}</dd>
      </div>
    </dl>

    <div class="spark-row">
      <span class="spark-label">{{ strings.cpu }}</span>
      <svg class="spark" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
        <path :d="cpuArea" class="spark-fill" />
        <path :d="cpuLine" class="spark-line" />
      </svg>
      <span class="spark-val">{{ pct(agg.cpuPct) }}</span>
    </div>
    <div class="spark-row">
      <span class="spark-label">{{ strings.mem }}</span>
      <svg class="spark" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
        <path :d="memArea" class="spark-fill" />
        <path :d="memLine" class="spark-line" />
      </svg>
      <span class="spark-val">{{ pct(agg.memPct) }}</span>
    </div>

    <p class="pulse-window">{{ strings.window }} · {{ strings.asOf }} {{ asOf }}</p>
  </figure>
</template>

<style scoped>
.pulse {
  margin: 0;
  border: 1px solid var(--line);
  padding: var(--space-m);
  background: var(--bg-raised);
}
.pulse-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--muted);
}
.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--ink);
  flex: none;
}
.pulse-agg {
  display: flex;
  gap: var(--space-l);
  margin: var(--space-m) 0;
}
.pulse-agg dt {
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--muted);
}
.pulse-agg dd {
  margin: 0.1rem 0 0;
  font-family: var(--font-mono);
  font-size: var(--step-2);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.spark-row {
  display: grid;
  grid-template-columns: 4rem 1fr 3ch;
  align-items: center;
  gap: 0.75rem;
  margin-top: var(--space-s);
}
.spark-label {
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--muted);
}
.spark {
  width: 100%;
  height: 1.75rem;
  display: block;
  overflow: visible;
}
.spark-line {
  fill: none;
  stroke: var(--ink);
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
}
.spark-fill {
  fill: var(--ink);
  opacity: 0.1;
}
.spark-val {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.pulse-window {
  margin-top: var(--space-s);
  font-size: var(--step--2);
  color: var(--muted);
}
</style>
