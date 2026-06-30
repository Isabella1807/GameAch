<script setup lang="ts">
import { ref, watch } from 'vue'
import CoralIslandView from './CoralIslandView.vue'
import IcarusView from './IcarusView.vue'

type GameId = 'coral-island' | 'icarus'

const TABS: { id: GameId; label: string }[] = [
  { id: 'coral-island', label: '🌴 Coral Island' },
  { id: 'icarus', label: '🪐 Icarus' },
]

const STORAGE_KEY = 'gameach:activeGame'
const stored = localStorage.getItem(STORAGE_KEY)
const active = ref<GameId>(stored === 'icarus' ? 'icarus' : 'coral-island')

// Remember the last viewed game so switching is sticky across reloads.
watch(active, (id) => localStorage.setItem(STORAGE_KEY, id))
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="tab in TABS"
      :key="tab.id"
      class="tab"
      :class="{ active: active === tab.id }"
      role="tab"
      :aria-selected="active === tab.id"
      @click="active = tab.id"
    >
      {{ tab.label }}
    </button>
  </div>

  <!-- Both games are kept alive so per-game filter state survives a tab switch. -->
  <KeepAlive>
    <CoralIslandView v-if="active === 'coral-island'" />
    <IcarusView v-else />
  </KeepAlive>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}
.tab {
  padding: 0.6rem 1.1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.tab:hover {
  color: var(--color-text);
}
.tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
</style>
