<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

// A compact console: one monospace line that cycles through facts drawn from
// the build-time snapshot (see ClusterNodes.vue). Not a live feed and not a
// fake one either: every line is a real reading, just not from this instant.

interface ConsoleStrings {
  readonly nodesOnline: string;
  readonly servicesUp: string;
  readonly uptime: string;
}
interface NodeSnapshot {
  readonly name: string;
  readonly cpuPct: number;
  readonly memPct: number;
}
const props = defineProps<{
  strings: ConsoleStrings;
  nodesOnline: number;
  nodesTotal: number;
  servicesUp: number;
  servicesTotal: number;
  uptimeDays: number;
  nodes: readonly NodeSnapshot[];
}>();

const CYCLE_MS = 3500;
const idx = ref(0);
let cycle: ReturnType<typeof setInterval> | null = null;

const lines: string[] = [
  `${props.nodesOnline}/${props.nodesTotal} ${props.strings.nodesOnline}`,
  `${props.servicesUp}/${props.servicesTotal} ${props.strings.servicesUp}`,
  `${Math.round(props.uptimeDays)}d ${props.strings.uptime}`,
  ...props.nodes.map(
    (n) =>
      `${n.name.padEnd(9)} cpu ${String(Math.round(n.cpuPct)).padStart(2)}%  mem ${String(
        Math.round(n.memPct),
      ).padStart(2)}%`,
  ),
];

onMounted(() => {
  cycle = setInterval(() => {
    idx.value = (idx.value + 1) % lines.length;
  }, CYCLE_MS);
});
onBeforeUnmount(() => {
  if (cycle) clearInterval(cycle);
});
</script>

<template>
  <div class="console" role="status" aria-live="off">
    <span class="prompt" aria-hidden="true">homelab ▸</span>
    <span class="cmd">{{ lines[idx] }}</span>
    <span class="cursor" aria-hidden="true"></span>
  </div>
</template>

<style scoped>
.console {
  margin-top: var(--space-l);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: var(--space-s) var(--space-m);
  background: var(--bg-sunken);
  border: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: var(--step--1);
  overflow: hidden;
  white-space: nowrap;
}
.prompt {
  color: var(--ink-dim);
  flex: none;
}
.cmd {
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cursor {
  width: 0.55ch;
  height: 1.05em;
  background: var(--ink);
  flex: none;
  margin-left: -0.2rem;
}
@media (prefers-reduced-motion: no-preference) {
  .cursor {
    animation: blink 1.1s step-end infinite;
  }
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
