import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { achievements } from '@/data/achievements'
import { collectionsByKey } from '@/data/collections'
import { unlockedApiNames, lastSynced } from '@/data/unlocked'
import { saveProgress } from '@/data/save-progress'
import type { Achievement } from '@/types/achievement'

const STORAGE_KEY = 'gameach:progress'

/** Steam apinames unlocked on the player's account, from the last `npm run sync`. */
const syncedApiNames = new Set<string>(unlockedApiNames)

/** collectionKey -> that collection's achievement apiname (for collection achievements). */
const collectionApiNameByKey: Record<string, string> = {}
for (const a of achievements) {
  if (a.kind === 'collection' && a.collectionKey && a.steamApiName) {
    collectionApiNameByKey[a.collectionKey] = a.steamApiName
  }
}

// Normalise slugs for matching so separator differences don't break it
// (coral.guide "Beehouse" -> "beehouse" still matches our "bee-house").
const normSlug = (s: string) => s.replace(/-/g, '')

/** collectionKey -> item slugs marked done from the imported save (caught/crafted). */
const savedChecked: Record<string, Set<string>> = {}
for (const [k, ids] of Object.entries(saveProgress.checked ?? {}))
  savedChecked[k] = new Set(ids.map(normSlug))

/** All item slugs shipped at least once (Legendary Farmer). */
const shippedSlugs = new Set<string>((saveProgress.shippedSlugs ?? []).map(normSlug))

interface PersistedState {
  /** achievementId -> manually toggled unlocked flag */
  unlocked: Record<string, boolean>
  /** collectionKey -> itemId -> checked */
  checked: Record<string, Record<string, boolean>>
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>
      return { unlocked: parsed.unlocked ?? {}, checked: parsed.checked ?? {} }
    }
  } catch {
    // ignore corrupt/unreadable storage and start fresh
  }
  return { unlocked: {}, checked: {} }
}

export const useAchievementsStore = defineStore('achievements', () => {
  const initial = loadState()

  const unlocked = ref<Record<string, boolean>>(initial.unlocked)
  const checked = ref<Record<string, Record<string, boolean>>>(initial.checked)

  // Persist any change back to localStorage.
  watch(
    [unlocked, checked],
    () => {
      const state: PersistedState = { unlocked: unlocked.value, checked: checked.value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    { deep: true },
  )

  const all = computed<Achievement[]>(() => achievements)

  /** Whether a collection's own achievement is already unlocked on Steam. */
  function isCollectionSteamComplete(key: string): boolean {
    const apiName = collectionApiNameByKey[key]
    return Boolean(apiName && syncedApiNames.has(apiName))
  }

  /**
   * An item is done if a manual toggle is set, the collection's own Steam achievement
   * is unlocked, or the imported save marks it (caught/crafted). A manual toggle —
   * true OR false — always wins, so the user can override save/Steam state (e.g. clear
   * a list to re-track it). This keeps the per-item checkboxes and the progress bar in
   * agreement, since both derive from this function.
   */
  function isItemChecked(collectionKey: string, itemId: string): boolean {
    const manual = checked.value[collectionKey]?.[itemId]
    if (manual !== undefined) return manual
    if (isCollectionSteamComplete(collectionKey)) return true
    return Boolean(savedChecked[collectionKey]?.has(normSlug(itemId)))
  }

  /**
   * Shipped-state for a Legendary Farmer item. Manual toggles live under a
   * `shipped:`-namespaced key so they never clash with the caught/collected state of
   * the same collection. A manual toggle always wins; otherwise crops/animal products
   * honour their "ship all X" Steam achievement, then fall back to the save.
   */
  function isShippedDone(collectionKey: string, itemId: string): boolean {
    const manual = checked.value[`shipped:${collectionKey}`]?.[itemId]
    if (manual !== undefined) return manual
    if (
      (collectionKey === 'crops' || collectionKey === 'animal-products') &&
      isCollectionSteamComplete(collectionKey)
    ) {
      return true
    }
    return shippedSlugs.has(normSlug(itemId))
  }

  /** How many items of a collection are done (caught/checked), and how many exist. */
  function collectionProgress(key: string): { done: number; total: number } {
    const col = collectionsByKey[key]
    // Union collections roll up their constituents' progress.
    if (col?.composedOf) {
      return col.composedOf.reduce(
        (acc, sub) => {
          const p = col.composedMode === 'shipped' ? shippedProgress(sub) : collectionProgress(sub)
          return { done: acc.done + p.done, total: acc.total + p.total }
        },
        { done: 0, total: 0 },
      )
    }
    const total = col?.items.length ?? 0
    const done = col ? col.items.filter((i) => isItemChecked(key, i.id)).length : 0
    return { done, total }
  }

  /** How many of a collection's items count as shipped (for Legendary Farmer). */
  function shippedProgress(key: string): { done: number; total: number } {
    const col = collectionsByKey[key]
    const total = col?.items.length ?? 0
    const done = col ? col.items.filter((i) => isShippedDone(key, i.id)).length : 0
    return { done, total }
  }

  /** For threshold achievements: current value + goal, read from the imported save. */
  function numericProgress(a: Achievement): { value: number; goal: number } | null {
    if (!a.goal || !a.metric) return null
    const raw = (saveProgress as unknown as Record<string, unknown>)[a.metric]
    if (typeof raw !== 'number') return null
    return { value: raw, goal: a.goal }
  }

  /** Per-item ship totals from the imported save (for Specialty Farmer/Rancher). */
  function shippedList(which: 'crops' | 'animalProducts'): { name: string; count: number }[] {
    return saveProgress.shipped?.[which] ?? []
  }

  /**
   * An achievement counts as unlocked if Steam reports its apiname unlocked, if it's
   * been toggled manually, if a numeric goal is reached, or — for a collection — once
   * every item is done.
   */
  function isUnlocked(a: Achievement): boolean {
    if (a.steamApiName && syncedApiNames.has(a.steamApiName)) return true
    if (unlocked.value[a.id]) return true
    const num = numericProgress(a)
    if (num) return num.value >= num.goal
    if (a.kind === 'collection' && a.collectionKey) {
      const { done, total } = collectionProgress(a.collectionKey)
      return total > 0 && done === total
    }
    return false
  }

  const unlockedCount = computed(() => all.value.filter(isUnlocked).length)
  const totalCount = computed(() => all.value.length)
  const missing = computed(() => all.value.filter((a) => !isUnlocked(a)))

  function toggleAchievement(id: string, value?: boolean) {
    unlocked.value[id] = value ?? !unlocked.value[id]
  }

  function toggleItem(collectionKey: string, itemId: string, value?: boolean) {
    const map = checked.value[collectionKey] ?? (checked.value[collectionKey] = {})
    map[itemId] = value ?? !map[itemId]
  }

  /** Bulk-set every given item in a (possibly `shipped:`-namespaced) collection. */
  function setItems(storeKey: string, itemIds: string[], value: boolean) {
    const map = checked.value[storeKey] ?? (checked.value[storeKey] = {})
    for (const id of itemIds) map[id] = value
  }

  return {
    unlocked,
    checked,
    all,
    unlockedCount,
    totalCount,
    missing,
    lastSynced,
    isUnlocked,
    collectionProgress,
    shippedProgress,
    isCollectionSteamComplete,
    numericProgress,
    shippedList,
    toggleAchievement,
    toggleItem,
    setItems,
    isItemChecked,
    isShippedDone,
  }
})
