import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { icarusAchievements } from '@/data/icarus/achievements'
import { unlockedApiNames, lastSynced } from '@/data/icarus/unlocked'
import type { IcarusAchievement } from '@/types/icarus'

const STORAGE_KEY = 'gameach:icarus'

/** Steam apinames unlocked on the player's account, from the last `npm run sync`. */
const syncedApiNames = new Set<string>(unlockedApiNames)

interface PersistedState {
  /** achievementId -> manually toggled unlocked flag */
  unlocked: Record<string, boolean>
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>
      return { unlocked: parsed.unlocked ?? {} }
    }
  } catch {
    // ignore corrupt/unreadable storage and start fresh
  }
  return { unlocked: {} }
}

export const useIcarusStore = defineStore('icarus', () => {
  const initial = loadState()
  const unlocked = ref<Record<string, boolean>>(initial.unlocked)

  watch(
    unlocked,
    () => {
      const state: PersistedState = { unlocked: unlocked.value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    { deep: true },
  )

  const all = computed<IcarusAchievement[]>(() => icarusAchievements)

  /**
   * An achievement is unlocked if Steam reports its apiname unlocked, or if it's been
   * toggled manually. A manual toggle (true OR false) always wins, so the user can
   * override Steam state on this device.
   */
  function isUnlocked(a: IcarusAchievement): boolean {
    const manual = unlocked.value[a.id]
    if (manual !== undefined) return manual
    return syncedApiNames.has(a.steamApiName)
  }

  const unlockedCount = computed(() => all.value.filter(isUnlocked).length)
  const totalCount = computed(() => all.value.length)
  const missing = computed(() => all.value.filter((a) => !isUnlocked(a)))

  function toggleAchievement(id: string, value?: boolean) {
    unlocked.value[id] = value ?? !unlocked.value[id]
  }

  return {
    unlocked,
    all,
    unlockedCount,
    totalCount,
    missing,
    lastSynced,
    isUnlocked,
    toggleAchievement,
  }
})
