<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, nextTick, ref } from "vue";

interface Section {
  readonly id: string;
  readonly num: string;
  readonly label: string;
}
interface Link {
  readonly label: string;
  readonly href: string;
}
// Localized labels, passed from SiteHeader (see PaletteStrings in src/lib/ui.ts).
interface PaletteStrings {
  readonly trigger: string;
  readonly placeholder: string;
  readonly sectionHint: string;
  readonly copyEmail: string;
  readonly opensNewTab: string;
  readonly noMatch: string;
  readonly dialogLabel: string;
  readonly closeLabel: string;
  readonly blogHint: string;
}

const props = defineProps<{
  sections: readonly Section[];
  links: readonly Link[];
  email: string;
  blogHref: string;
  strings: PaletteStrings;
}>();

interface Command {
  readonly key: string;
  readonly label: string;
  readonly hint: string;
  readonly run: () => void;
}

const open = ref(false);
const query = ref("");
const active = ref(0);
const mounted = ref(false); // gate the Teleport so it never runs during SSR/hydration
const meta = ref(false); // ⌘ on Apple platforms, Ctrl elsewhere
const input = ref<HTMLInputElement | null>(null);
let restoreTo: HTMLElement | null = null;

const reduced = (): boolean =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const commands = computed<Command[]>(() => [
  {
    key: "page:blog",
    label: "Blog",
    hint: props.strings.blogHint,
    run: () => {
      window.location.href = props.blogHref;
    },
  },
  ...props.sections.map((s) => ({
    key: `sec:${s.id}`,
    label: s.label,
    hint: `${props.strings.sectionHint} ${s.num}`,
    run: () => jump(s.id),
  })),
  {
    key: "act:email",
    label: props.strings.copyEmail,
    hint: props.email,
    run: () => {
      void navigator.clipboard?.writeText(props.email);
    },
  },
  ...props.links.map((l) => ({
    key: `link:${l.href}`,
    label: l.label,
    hint: props.strings.opensNewTab,
    run: () => window.open(l.href, "_blank", "noopener,noreferrer"),
  })),
]);

const filtered = computed<Command[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return commands.value;
  return commands.value.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(q));
});

function jump(id: string): void {
  document.getElementById(id)?.scrollIntoView({
    behavior: reduced() ? "auto" : "smooth",
    block: "start",
  });
}

function show(): void {
  restoreTo = document.activeElement as HTMLElement | null;
  open.value = true;
  query.value = "";
  active.value = 0;
  void nextTick(() => input.value?.focus());
}

function hide(): void {
  open.value = false;
  restoreTo?.focus();
}

function commit(): void {
  const cmd = filtered.value[active.value];
  if (!cmd) return;
  hide();
  cmd.run();
}

function choose(i: number): void {
  active.value = i;
  commit();
}

function move(delta: number): void {
  const n = filtered.value.length;
  if (n === 0) return;
  active.value = (active.value + delta + n) % n;
}

function onQuery(): void {
  active.value = 0;
}

function onGlobalKey(e: KeyboardEvent): void {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (open.value) hide();
    else show();
  }
}

function onDialogKey(e: KeyboardEvent): void {
  switch (e.key) {
    case "Escape":
      e.preventDefault();
      hide();
      break;
    case "ArrowDown":
      e.preventDefault();
      move(1);
      break;
    case "ArrowUp":
      e.preventDefault();
      move(-1);
      break;
    case "Enter":
      e.preventDefault();
      commit();
      break;
    case "Tab":
      e.preventDefault(); // single focusable element — keep focus trapped
      break;
  }
}

onMounted(() => {
  mounted.value = true;
  meta.value = /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent);
  window.addEventListener("keydown", onGlobalKey);
});
onBeforeUnmount(() => window.removeEventListener("keydown", onGlobalKey));
</script>

<template>
  <button class="trigger" type="button" aria-haspopup="dialog" :aria-expanded="open" @click="show">
    <span class="trigger-label">{{ strings.trigger }}</span>
    <kbd>{{ meta ? "⌘" : "Ctrl" }}</kbd
    ><kbd>K</kbd>
  </button>

  <Teleport v-if="mounted" to="body">
    <div v-if="open" class="scrim" @keydown="onDialogKey">
      <button
        class="scrim-close"
        type="button"
        :aria-label="strings.closeLabel"
        @click="hide"
      ></button>
      <div class="palette" role="dialog" aria-modal="true" :aria-label="strings.dialogLabel">
        <input
          ref="input"
          v-model="query"
          class="palette-input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          :aria-activedescendant="filtered.length ? `cmd-${active}` : undefined"
          :placeholder="strings.placeholder"
          autocomplete="off"
          spellcheck="false"
          @input="onQuery"
        />
        <ul v-if="filtered.length" id="palette-list" class="palette-list" role="listbox">
          <li
            v-for="(cmd, i) in filtered"
            :id="`cmd-${i}`"
            :key="cmd.key"
            role="option"
            :aria-selected="i === active"
            :class="{ active: i === active }"
            @click="choose(i)"
            @mousemove="active = i"
          >
            <span class="cmd-label">{{ cmd.label }}</span>
            <span class="cmd-hint">{{ cmd.hint }}</span>
          </li>
        </ul>
        <p v-else class="palette-empty">{{ strings.noMatch }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  /* One line, equal height to the chooser/lang pills (no tall two-line label). */
  white-space: nowrap;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--ink-dim);
  font-family: var(--font-mono);
  font-size: var(--step--2);
  letter-spacing: var(--tracking-wide);
  padding: 0.32rem 0.6rem;
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}
.trigger:hover {
  border-color: var(--line-strong);
  color: var(--ink);
}
.trigger kbd {
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--accent);
  background: rgb(255 174 59 / 0.08);
  border: 1px solid var(--line);
  padding: 0 0.3rem;
  line-height: 1.4;
}
.trigger-label {
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
}
@media (max-width: 560px) {
  /* The keyboard shortcut is meaningless on touch; keep the "Jump to" label as
     the visible section-nav affordance (the section links collapse on mobile)
     and drop the kbd hint instead. */
  .trigger kbd {
    display: none;
  }
}

.scrim {
  position: fixed;
  inset: 0;
  z-index: var(--z-palette);
  display: grid;
  justify-items: center;
  align-content: start;
  padding-top: 14vh;
  background: rgb(3 4 6 / 0.62);
  backdrop-filter: blur(3px);
  animation: scrim-in var(--dur-fast) var(--ease-out);
}
.scrim-close {
  position: absolute;
  inset: 0;
  background: transparent;
  border: 0;
  cursor: default;
}
.palette {
  position: relative;
  width: min(38rem, calc(100vw - 2rem));
  background: var(--bg-raised);
  border: 1px solid var(--line-strong);
  box-shadow: 0 24px 80px -24px rgb(0 0 0 / 0.8);
  animation: palette-in var(--dur) var(--ease-out);
}
.palette-input {
  width: 100%;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: var(--step-0);
  padding: 1rem 1.1rem;
}
.palette-input:focus {
  outline: none;
}
.palette-input::placeholder {
  color: var(--faint);
}
.palette-list {
  list-style: none;
  padding: 0.4rem;
  margin: 0;
  max-height: 50vh;
  overflow-y: auto;
}
.palette-list li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 0.6rem 0.7rem;
  cursor: pointer;
  border-left: 2px solid transparent;
}
.palette-list li.active {
  background: rgb(255 174 59 / 0.08);
  border-left-color: var(--accent);
}
.cmd-label {
  color: var(--ink);
}
.cmd-hint {
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--muted);
  white-space: nowrap;
}
.palette-empty {
  padding: 1.1rem;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: var(--step--1);
}

@keyframes scrim-in {
  from {
    opacity: 0;
  }
}
@keyframes palette-in {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
}
@media (prefers-reduced-motion: reduce) {
  .scrim,
  .palette {
    animation: none;
  }
}
</style>
