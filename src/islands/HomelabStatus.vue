<script setup lang="ts">
// Homelab aggregate for the "self-hosted production" case study. Sourced from
// a build-time snapshot of the cluster's own telemetry, not a runtime fetch:
// see ClusterNodes.vue on the /cluster page for why.

interface HomelabStatusStrings {
  readonly heading: string;
  readonly nodes: string;
  readonly guests: string;
  readonly cpu: string;
  readonly mem: string;
  readonly uptime: string;
  readonly caption: string;
}

defineProps<{
  strings: HomelabStatusStrings;
  nodesOnline: number;
  nodesTotal: number;
  guestsRunning: number;
  guestsTotal: number;
  cpuPct: number;
  memPct: number;
  uptimeDays: number;
}>();
</script>

<template>
  <figure class="status">
    <figcaption class="head">
      <span class="dot" aria-hidden="true"></span>
      {{ strings.heading }}
    </figcaption>

    <dl class="grid">
      <div>
        <dt>{{ strings.nodes }}</dt>
        <dd>{{ nodesOnline }}/{{ nodesTotal }}</dd>
      </div>
      <div>
        <dt>{{ strings.guests }}</dt>
        <dd>{{ guestsRunning }}/{{ guestsTotal }}</dd>
      </div>
      <div>
        <dt>{{ strings.cpu }}</dt>
        <dd>{{ cpuPct }}%</dd>
      </div>
      <div>
        <dt>{{ strings.mem }}</dt>
        <dd>{{ memPct }}%</dd>
      </div>
      <div>
        <dt>{{ strings.uptime }}</dt>
        <dd>{{ Math.round(uptimeDays) }}d</dd>
      </div>
    </dl>

    <p class="caption">{{ strings.caption }}</p>
  </figure>
</template>

<style scoped>
.status {
  margin-top: var(--space-m);
  border: 1px solid var(--line);
  padding: var(--space-s) var(--space-m) var(--space-m);
  max-width: 32rem;
}
.head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: var(--step--2);
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  color: var(--muted);
}
.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--accent);
  flex: none;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(4.5rem, 1fr));
  gap: var(--space-s) var(--space-m);
  margin: var(--space-s) 0 0;
}
.grid div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.grid dt {
  font-family: var(--font-mono);
  font-size: var(--step--2);
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  color: var(--muted);
}
.grid dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--step-1);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.caption {
  margin: var(--space-m) 0 0;
  font-size: var(--step--2);
  color: var(--muted);
}
@media (prefers-reduced-motion: no-preference) {
  .dot {
    animation: status-pulse 2.6s ease-in-out infinite;
  }
}
@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}
</style>
