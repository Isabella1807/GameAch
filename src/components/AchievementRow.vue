<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAchievementsStore } from '@/stores/achievements'
import type { Achievement } from '@/types/achievement'
import ProgressBar from './ProgressBar.vue'
import CollectionChecklist from './CollectionChecklist.vue'
import ShipList from './ShipList.vue'

const props = defineProps<{ achievement: Achievement }>()
const store = useAchievementsStore()
const expanded = ref(false)

const unlocked = computed(() => store.isUnlocked(props.achievement))
const isCollection = computed(
  () => props.achievement.kind === 'collection' && !!props.achievement.collectionKey,
)
const collectionKey = computed(() => props.achievement.collectionKey ?? '')
const progress = computed(() =>
  props.achievement.collectionKey
    ? store.collectionProgress(props.achievement.collectionKey)
    : { done: 0, total: 0 },
)
const numeric = computed(() => store.numericProgress(props.achievement))
const shipEntries = computed(() =>
  props.achievement.shipList ? store.shippedList(props.achievement.shipList) : [],
)
</script>

<template>
  <div class="row" :class="{ unlocked }">
    <div class="main">
      <label v-if="achievement.kind === 'simple'" class="check">
        <input type="checkbox" :checked="unlocked" @change="store.toggleAchievement(achievement.id)" />
      </label>
      <span v-else class="badge">{{ unlocked ? '✓' : '🏆' }}</span>

      <div class="body">
        <div class="name">{{ achievement.name }}</div>
        <div class="req">{{ achievement.requirement }}</div>

        <!-- Collection achievements: expandable checklist -->
        <button v-if="isCollection" class="toggle" @click="expanded = !expanded">
          <ProgressBar :value="progress.done" :max="progress.total" />
          <span class="count">
            {{ progress.total > 0 ? `${progress.done} / ${progress.total}` : 'Vis liste' }}
            <span class="chevron">{{ expanded ? '▴' : '▾' }}</span>
          </span>
        </button>

        <!-- Specialty Farmer/Rancher: expandable ship counts -->
        <button v-else-if="achievement.shipList" class="toggle" @click="expanded = !expanded">
          <ProgressBar v-if="numeric" :value="numeric.value" :max="numeric.goal" />
          <span class="count">
            {{
              numeric
                ? `${numeric.value.toLocaleString('da-DK')} / ${numeric.goal.toLocaleString('da-DK')}`
                : 'Vis shipping'
            }}
            <span class="chevron">{{ expanded ? '▴' : '▾' }}</span>
          </span>
        </button>

        <!-- Threshold achievements (e.g. coins): progress from the imported save -->
        <div v-else-if="numeric && !unlocked" class="numeric">
          <ProgressBar :value="numeric.value" :max="numeric.goal" />
          <span class="count">
            {{ numeric.value.toLocaleString('da-DK') }} / {{ numeric.goal.toLocaleString('da-DK') }}
          </span>
        </div>
      </div>
    </div>

    <CollectionChecklist v-if="isCollection && expanded" :collection-key="collectionKey" class="panel" />
    <ShipList
      v-else-if="achievement.shipList && expanded"
      :entries="shipEntries"
      :goal="achievement.goal"
      class="panel"
    />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-direction: column;
  padding: 0.85rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}
.row.unlocked {
  border-color: var(--color-accent-soft);
  background:
    linear-gradient(0deg, var(--color-accent-soft), transparent),
    var(--color-surface);
}
.main {
  display: flex;
  gap: 0.85rem;
}
.check {
  display: flex;
  align-items: flex-start;
}
.check input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
  cursor: pointer;
}
.badge {
  font-size: 1.1rem;
  line-height: 1.4;
}
.body {
  flex: 1;
  min-width: 0;
}
.name {
  font-weight: 600;
  color: var(--color-heading);
}
.req {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 0.1rem;
}
.toggle,
.numeric {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  margin-top: 0.5rem;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-accent);
  font: inherit;
}
.toggle {
  cursor: pointer;
}
.toggle :deep(.bar),
.numeric :deep(.bar) {
  flex: 1;
}
.count {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  white-space: nowrap;
  margin-left: auto;
}
.chevron {
  font-size: 0.7rem;
}
.panel {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--color-border);
}
</style>
