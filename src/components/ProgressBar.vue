<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: number; max: number }>()
const pct = computed(() => (props.max > 0 ? Math.round((props.value / props.max) * 100) : 0))
</script>

<template>
  <div class="bar" :title="pct + '%'">
    <div class="fill" :style="{ width: pct + '%' }" />
  </div>
</template>

<style scoped>
.bar {
  height: 8px;
  background: var(--color-surface-hover);
  border-radius: 999px;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), #ffd479);
  border-radius: 999px;
  transition: width 0.3s ease;
}
</style>
