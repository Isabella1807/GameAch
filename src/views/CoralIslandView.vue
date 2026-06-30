<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAchievementsStore } from '@/stores/achievements'
import AchievementRow from '@/components/AchievementRow.vue'
import ProgressBar from '@/components/ProgressBar.vue'

type Filter = 'all' | 'missing' | 'done'
const store = useAchievementsStore()
const filter = ref<Filter>('all')

const list = computed(() => {
  let items = store.all
  if (filter.value === 'missing') items = store.missing
  else if (filter.value === 'done') items = store.all.filter((a) => store.isUnlocked(a))
  // Missing on top, completed at the bottom (stable within each group).
  return [...items].sort((a, b) => Number(store.isUnlocked(a)) - Number(store.isUnlocked(b)))
})

const pct = computed(() =>
  store.totalCount > 0 ? Math.round((store.unlockedCount / store.totalCount) * 100) : 0,
)
</script>

<template>
  <section>
    <div class="overview">
      <div class="heading">
        <h1>Coral Island</h1>
        <span class="count">{{ store.unlockedCount }} / {{ store.totalCount }} · {{ pct }}%</span>
      </div>
      <ProgressBar :value="store.unlockedCount" :max="store.totalCount" />
    </div>

    <div class="filters">
      <button :class="{ active: filter === 'all' }" @click="filter = 'all'">Alle</button>
      <button :class="{ active: filter === 'missing' }" @click="filter = 'missing'">Mangler</button>
      <button :class="{ active: filter === 'done' }" @click="filter = 'done'">Låst op</button>
    </div>

    <div class="list">
      <AchievementRow v-for="a in list" :key="a.id" :achievement="a" />
    </div>
  </section>
</template>

<style scoped>
.overview {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
}
.heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.heading h1 {
  font-size: 1.5rem;
  color: var(--color-heading);
}
.heading .count {
  color: var(--color-accent);
  font-weight: 600;
}
.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.filters button {
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition:
    color 0.15s,
    border-color 0.15s,
    background 0.15s;
}
.filters button:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text);
}
.filters button.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #1a1206;
  font-weight: 600;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
</style>
