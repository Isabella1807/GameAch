<script setup lang="ts">
import { computed } from 'vue'
import { useIcarusStore } from '@/stores/icarus'
import type { IcarusAchievement } from '@/types/icarus'

const props = defineProps<{ achievement: IcarusAchievement }>()
const store = useIcarusStore()

const unlocked = computed(() => store.isUnlocked(props.achievement))
const iconSrc = computed(() =>
  unlocked.value ? props.achievement.icon : (props.achievement.iconGray ?? props.achievement.icon),
)
</script>

<template>
  <label class="row" :class="{ unlocked }">
    <img
      v-if="iconSrc"
      class="icon"
      :src="iconSrc"
      :alt="achievement.name"
      loading="lazy"
      width="48"
      height="48"
    />
    <span v-else class="icon icon-fallback">{{ unlocked ? '✓' : '🏆' }}</span>

    <div class="body">
      <div class="name">
        {{ achievement.name }}
        <span v-if="achievement.hidden" class="tag">skjult</span>
      </div>
      <div class="req">{{ achievement.description || '—' }}</div>
    </div>

    <input
      type="checkbox"
      :checked="unlocked"
      @change="store.toggleAchievement(achievement.id)"
    />
  </label>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.7rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
}
.row.unlocked {
  border-color: var(--color-accent-soft);
  background:
    linear-gradient(0deg, var(--color-accent-soft), transparent),
    var(--color-surface);
}
.icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  flex-shrink: 0;
  object-fit: cover;
}
.icon-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  background: var(--color-surface-hover);
}
.row:not(.unlocked) .icon {
  opacity: 0.65;
}
.body {
  flex: 1;
  min-width: 0;
}
.name {
  font-weight: 600;
  color: var(--color-heading);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tag {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.05rem 0.45rem;
}
.req {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 0.1rem;
}
input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
  cursor: pointer;
  flex-shrink: 0;
}
</style>
