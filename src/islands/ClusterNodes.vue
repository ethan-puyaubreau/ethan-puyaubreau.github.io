<script setup lang="ts">
import { computed } from "vue";

// Per-node cards for the /cluster page. Static facts (name, role, spec) come
// from the page; the load numbers (CPU, memory, uptime, up or down) come from
// a build-time snapshot of the cluster's own telemetry, not a runtime fetch.
// This site is static (GitHub Pages) and makes no cross-origin request.

interface LiveStrings {
  readonly cpu: string;
  readonly mem: string;
  readonly uptime: string;
  readonly online: string;
  readonly offline: string;
  readonly asOf: string;
}
interface NodeFact {
  readonly id: string;
  readonly spec: string;
  readonly role: string;
  readonly self?: boolean;
}
interface NodeSnapshot {
  readonly name: string;
  readonly online: boolean;
  readonly cpuPct: number;
  readonly memPct: number;
  readonly uptimeDays: number;
}
const props = defineProps<{
  strings: LiveStrings;
  nodes: readonly NodeFact[];
  snapshot: readonly NodeSnapshot[];
  asOf: string;
  lang: string;
}>();

// Numbers in the page's language (a narrow no-break space before % in French).
const pct = (v: number): string =>
  new Intl.NumberFormat(props.lang, { style: "percent", maximumFractionDigits: 0 }).format(v / 100);
const days = (d: number): string =>
  new Intl.NumberFormat(props.lang, { style: "unit", unit: "day", unitDisplay: "short" }).format(
    Math.round(d),
  );

const cards = computed(() =>
  props.nodes.map((n) => ({
    ...n,
    live: props.snapshot.find((s) => s.name === n.id) ?? null,
  })),
);
const tone = (pct: number): string => (pct >= 85 ? "down" : pct >= 65 ? "warn" : "ok");
</script>

<template>
  <div class="nodes">
    <article
      v-for="card in cards"
      :id="`node-${card.id}`"
      :key="card.id"
      class="node"
      :class="{ self: card.self }"
    >
      <header class="node-head">
        <span class="status-dot" :data-up="card.live?.online" aria-hidden="true"></span>
        <h3 class="node-name">{{ card.id }}</h3>
        <span class="node-spec">{{ card.spec }}</span>
      </header>
      <p class="node-role">{{ card.role }}</p>

      <dl v-if="card.live?.online" class="meters">
        <div class="meter">
          <dt>{{ strings.cpu }}</dt>
          <dd>
            <span class="bar" :data-tone="tone(card.live?.cpuPct ?? 0)">
              <i :style="{ width: (card.live?.cpuPct ?? 0) + '%' }"></i>
            </span>
            <span class="val">{{ pct(card.live?.cpuPct ?? 0) }}</span>
          </dd>
        </div>
        <div class="meter">
          <dt>{{ strings.mem }}</dt>
          <dd>
            <span class="bar" :data-tone="tone(card.live?.memPct ?? 0)">
              <i :style="{ width: (card.live?.memPct ?? 0) + '%' }"></i>
            </span>
            <span class="val">{{ pct(card.live?.memPct ?? 0) }}</span>
          </dd>
        </div>
        <div class="meter up">
          <dt>{{ strings.uptime }}</dt>
          <dd>
            <span class="val">{{ days(card.live?.uptimeDays ?? 0) }}</span>
          </dd>
        </div>
      </dl>
      <p v-else class="node-note">{{ strings.offline }}</p>
    </article>
  </div>
  <p class="nodes-caption">{{ strings.asOf }} {{ asOf }}</p>
</template>

<style scoped>
.nodes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
  gap: var(--space-m);
  margin-top: var(--space-l);
}
.node {
  border: 1px solid var(--line);
  padding: var(--space-m);
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  background: var(--bg-raised);
}
.node.self {
  border-color: var(--ink);
  box-shadow: inset 0 2px 0 var(--ink);
}
.node {
  scroll-margin-top: 5rem;
}
.node-head {
  display: flex;
  align-items: baseline;
  gap: 0.25rem 0.5rem;
  flex-wrap: wrap;
}
.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--faint);
  align-self: center;
  flex: none;
}
.status-dot[data-up="true"] {
  background: var(--ok);
}
.status-dot[data-up="false"] {
  background: var(--down);
}
.node-name {
  font-family: var(--font-mono);
  font-size: var(--step-0);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
}
.node-spec {
  flex-basis: 100%;
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--muted);
}
.node-role {
  color: var(--ink-dim);
  font-size: var(--step--1);
  min-height: 2.6em;
}
.meters {
  /* Pushed to the card's foot so the rows line up across cards whose role
     text runs to different lengths. */
  margin: auto 0 0;
  padding-top: var(--space-2xs);
  display: grid;
  gap: 0.5rem;
}
.meter {
  display: grid;
  grid-template-columns: 3.75rem 1fr;
  align-items: center;
  gap: 0.6rem;
}
.meter dt {
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--muted);
}
.meter dd {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.bar {
  position: relative;
  flex: 1;
  height: 0.4rem;
  background: var(--bg-sunken);
  border: 1px solid var(--hairline);
  overflow: hidden;
}
.bar i {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--ink);
}
.bar[data-tone="warn"] i {
  background: var(--warn);
}
.bar[data-tone="down"] i {
  background: var(--down);
}
.val {
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  min-width: 2.6ch;
  text-align: right;
}
.meter.up dd {
  color: var(--ink-dim);
}
.node-note {
  margin-top: var(--space-2xs);
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--muted);
}
.nodes-caption {
  margin-top: var(--space-m);
  font-size: var(--step--2);
  color: var(--muted);
}
</style>
