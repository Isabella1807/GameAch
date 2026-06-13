<script setup lang="ts">
import { ref, computed } from 'vue'
import { collectionsByKey } from '@/data/collections'
import { useAchievementsStore } from '@/stores/achievements'
import ProgressBar from './ProgressBar.vue'

const props = defineProps<{ collectionKey: string }>()
const store = useAchievementsStore()
const collection = computed(() => collectionsByKey[props.collectionKey])
const shipped = computed(() => collection.value?.composedMode === 'shipped')

// Which constituent sub-lists are expanded (for union collections).
const open = ref<Record<string, boolean>>({})
function togglePart(key: string) {
  open.value[key] = !open.value[key]
}

const parts = computed(() =>
  (collection.value?.composedOf ?? []).map((key) => {
    const sub = collectionsByKey[key]
    return {
      key,
      label: sub?.label ?? key,
      items: sub?.items ?? [],
      progress: shipped.value ? store.shippedProgress(key) : store.collectionProgress(key),
      // In shipped mode there's no Steam-collection shortcut — use real shipped data.
      steamDone: shipped.value ? false : store.isCollectionSteamComplete(key),
    }
  }),
)

const itemDone = (partKey: string, itemId: string) =>
  shipped.value ? store.isShippedDone(partKey, itemId) : store.isItemChecked(partKey, itemId)

// localStorage key a manual toggle is stored under. Shipped (Legendary Farmer) toggles
// are namespaced so they don't clash with the same collection's caught/collected state.
const storeKey = (partKey: string) => (shipped.value ? `shipped:${partKey}` : partKey)

function onToggle(partKey: string, itemId: string, e: Event) {
  store.toggleItem(storeKey(partKey), itemId, (e.target as HTMLInputElement).checked)
}

// Bulk check/clear. Always scoped to a single list so a click can't wipe more than
// the user is looking at: setPart() targets one constituent of a union collection,
// setFlat() the whole (non-union) list. A manual toggle always wins, so "Ryd alle"
// empties a list even when it's marked complete on Steam or by the imported save.
function setPart(partKey: string, value: boolean) {
  const part = parts.value.find((p) => p.key === partKey)
  if (part) store.setItems(storeKey(partKey), part.items.map((i) => i.id), value)
}

function setFlat(value: boolean) {
  if (collection.value) {
    store.setItems(props.collectionKey, collection.value.items.map((i) => i.id), value)
  }
}
</script>

<template>
  <div class="checklist">
    <!-- Union collection: roll-up of constituent collections -->
    <template v-if="collection?.composedOf">
      <p class="hint">
        {{ shipped ? 'Tæller fra hvad du faktisk har shippet (fra din save):' : 'Tæller automatisk sammen fra de underliggende lister:' }}
      </p>
      <div v-for="part in parts" :key="part.key" class="part">
        <!-- Constituent already completed on Steam (collected mode only) -->
        <div v-if="part.steamDone" class="part-head done static">
          <span class="part-label">{{ part.label }}</span>
          <ProgressBar :value="1" :max="1" />
          <span class="part-count">✓ klaret</span>
        </div>
        <!-- Constituent with progress -->
        <template v-else>
          <button
            class="part-head"
            :class="{ done: part.progress.total > 0 && part.progress.done === part.progress.total }"
            @click="togglePart(part.key)"
          >
            <span class="part-label">{{ part.label }}</span>
            <ProgressBar :value="part.progress.done" :max="part.progress.total" />
            <span class="part-count">
              {{ part.progress.done }} / {{ part.progress.total }}
              <span class="chev">{{ open[part.key] ? '▴' : '▾' }}</span>
            </span>
          </button>
          <div v-if="open[part.key]" class="part-body">
            <div class="bulk">
              <button type="button" @click="setPart(part.key, true)">Tjek alle</button>
              <button type="button" @click="setPart(part.key, false)">Ryd alle</button>
            </div>
            <div class="items">
              <label
                v-for="item in part.items"
                :key="item.id"
                class="item"
                :class="{ done: itemDone(part.key, item.id) }"
              >
                <input
                  type="checkbox"
                  :checked="itemDone(part.key, item.id)"
                  @change="onToggle(part.key, item.id, $event)"
                />
                <img v-if="item.image" :src="item.image" :alt="item.name" class="thumb" />
                <span class="label">{{ item.name }}</span>
              </label>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Normal collection: flat item checklist -->
    <template v-else-if="collection && collection.items.length">
      <div class="bulk">
        <button type="button" @click="setFlat(true)">Tjek alle</button>
        <button type="button" @click="setFlat(false)">Ryd alle</button>
      </div>
      <div class="items">
        <label
          v-for="item in collection.items"
          :key="item.id"
          class="item"
          :class="{ done: store.isItemChecked(collectionKey, item.id) }"
        >
          <input
            type="checkbox"
            :checked="store.isItemChecked(collectionKey, item.id)"
            @change="store.toggleItem(collectionKey, item.id, ($event.target as HTMLInputElement).checked)"
          />
          <img v-if="item.image" :src="item.image" :alt="item.name" class="thumb" />
          <span class="label">{{ item.name }}</span>
        </label>
      </div>
    </template>

    <div v-else class="empty">🌱 Listen er ikke fyldt på endnu — items + billeder kommer snart.</div>
  </div>
</template>

<style scoped>
.bulk {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
}
.part-body {
  margin-top: 0.4rem;
}
.part-body .bulk {
  margin-bottom: 0.2rem;
}
.bulk button {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.bulk button:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text);
}
.hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 0.6rem;
}
.part {
  margin-bottom: 0.4rem;
}
.part-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.5rem 0.7rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}
.part-head.static {
  cursor: default;
}
.part-head.done .part-label {
  color: var(--color-accent);
}
.part-label {
  font-weight: 600;
  white-space: nowrap;
}
.part-head :deep(.bar) {
  flex: 1;
}
.part-count {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.chev {
  font-size: 0.7rem;
}
.items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.4rem;
  margin: 0.4rem 0 0.8rem;
}
.item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.6rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border-hover);
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.item.done {
  background: transparent;
  border-color: var(--color-border);
  opacity: 0.4;
}
.item.done:hover {
  opacity: 0.85;
}
.item.done .thumb {
  filter: grayscale(1);
}
.item.done .label {
  color: var(--color-text-muted);
  text-decoration: line-through;
}
.item input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
  cursor: pointer;
}
.item input:disabled {
  cursor: default;
}
.thumb {
  width: 26px;
  height: 26px;
  object-fit: contain;
}
.label {
  font-size: 0.85rem;
}
.empty {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
</style>
