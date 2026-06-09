export type AchievementKind = 'simple' | 'collection'

/** A single tickable entry inside a collection achievement (e.g. one craftable item). */
export interface CollectionItem {
  id: string
  name: string
  /** Local asset path or remote URL; filled in when we source images from the wiki. */
  image?: string
}

/** The set of items behind a "complete all X" achievement. */
export interface Collection {
  key: string
  label: string
  /** Sourced from coral.guide / the wiki; may be empty until populated. */
  items: CollectionItem[]
  /**
   * For "union" collections (museum, legendary-farmer): the keys of the constituent
   * collections whose checked items roll up into this one. Such a collection has no
   * items of its own — progress is the sum of its constituents.
   */
  composedOf?: string[]
  /** How a union rolls up: 'collected' (caught/checked/Steam, default) or 'shipped'. */
  composedMode?: 'collected' | 'shipped'
}

export interface Achievement {
  /** Stable slug we control — used as the localStorage key and route param. */
  id: string
  /** Display name — kept identical to the Steam achievement name. */
  name: string
  /** Human-readable requirement (English, to match the game/Steam). */
  requirement: string
  kind: AchievementKind
  /** For kind === 'collection': key into the collections map. */
  collectionKey?: string
  /** Steam schema apiname — filled in later to map Steam unlocks onto our data. */
  steamApiName?: string
  /** Achievement icon URL from the Steam schema — filled in later. */
  icon?: string
  /** For threshold achievements (e.g. "earn 10,000,000 coins"): the target value. */
  goal?: number
  /** Key into save-progress (e.g. 'lifetimeEarnings') for the current value toward `goal`. */
  metric?: string
  /** For "ship one X 1000 times" achievements: which save ship-count list to expand. */
  shipList?: 'crops' | 'animalProducts'
}
