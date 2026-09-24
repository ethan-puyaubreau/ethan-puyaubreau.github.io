<script setup lang="ts">
// This site shows only the aggregate: how many of the self-hosted services
// are up, not which ones or where. See
// ClusterNodes.vue for why this data is a build-time snapshot, not a live poll.

interface ServicesStrings {
  readonly count: string;
  readonly caption: string;
}
defineProps<{ strings: ServicesStrings; up: number; total: number }>();
</script>

<template>
  <div class="services">
    <p class="svc-count">
      <span class="num">{{ up }}</span> / {{ total }} {{ strings.count }}
    </p>
    <p class="svc-caption">{{ strings.caption }}</p>
  </div>
</template>

<style scoped>
.services {
  margin-top: var(--space-l);
}
.svc-count {
  font-family: var(--font-mono);
  font-size: var(--step-1);
  color: var(--ink);
}
.svc-count .num {
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}
.svc-caption {
  margin-top: var(--space-m);
  font-size: var(--step--2);
  color: var(--muted);
}
</style>
