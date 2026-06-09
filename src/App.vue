<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="brand">
      <span class="brand-icon">🏆</span>
      <span class="brand-name">gameach</span>
    </RouterLink>

    <nav class="app-nav">
      <RouterLink to="/">Dashboard</RouterLink>
    </nav>
  </header>

  <main class="app-main">
    <RouterView />
  </main>

  <footer class="app-footer">
    Achievement-data fra
    <a href="https://store.steampowered.com/app/1158160/Coral_Island/" target="_blank" rel="noopener">Steam</a>.
    gameach er ikke tilknyttet eller godkendt af Valve eller Steam.
  </footer>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--color-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--color-heading);
}

.brand-icon {
  font-size: 1.4rem;
}

.brand-name {
  font-size: 1.15rem;
  letter-spacing: -0.02em;
}

.app-nav {
  display: flex;
  gap: 1.25rem;
  font-size: 0.95rem;
}

.app-nav a.router-link-exact-active {
  color: var(--color-heading);
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.app-footer {
  text-align: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.8rem;
}
</style>
