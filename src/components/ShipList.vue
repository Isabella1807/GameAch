<script setup lang="ts">
defineProps<{ entries: { name: string; count: number }[]; goal?: number }>()
</script>

<template>
  <div class="ship-list">
    <div
      v-for="e in entries"
      :key="e.name"
      class="ship"
      :class="{ hit: goal != null && e.count >= goal }"
    >
      <span class="ship-name">{{ e.name }}</span>
      <span class="ship-count">
        {{ e.count.toLocaleString('da-DK') }}<template v-if="goal != null">
          / {{ goal.toLocaleString('da-DK') }}</template>
      </span>
    </div>
    <div v-if="!entries.length" class="ship-empty">Ingen shipping-data fra save'en endnu.</div>
  </div>
</template>

<style scoped>
.ship-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.ship {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.7rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.85rem;
}
.ship.hit {
  border-color: var(--color-accent);
}
.ship.hit .ship-count {
  color: var(--color-accent);
  font-weight: 600;
}
.ship-name {
  color: var(--color-text);
}
.ship-count {
  color: var(--color-text-muted);
  white-space: nowrap;
}
.ship-empty {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
</style>
