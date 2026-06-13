export type AchievementKind = 'simple' | 'collection'

/**
 * Catch/find details for fish, bugs, sea critters and foraged items, sourced from the
 * wiki infoboxes by scripts/fetch-metadata.mjs. All optional — only present where the
 * wiki has the field.
 */
export interface ItemMeta {
  /** Fish only: Small / Medium / Large. */
  size?: string
  /** Seasons it's available, e.g. ["Spring","Summer"] or ["Any"]. */
  seasons?: string[]
  /** Where to catch/find it (cleaned wiki text). */
  location?: string
  /** Time of day, e.g. "Night", "All day". */
  time?: string
  /** Weather requirement, e.g. "Any", "Sunny". */
  weather?: string
  /** Rarity, e.g. "Common", "Uncommon", "Rare". */
  rarity?: string
}

/** A single tickable entry inside a collection achievement (e.g. one craftable item). */
export interface CollectionItem {
  id: string
  name: string
  /** Local asset path or remote URL; filled in when we source images from the wiki. */
  image?: string
  /** Catch/find details (fish, bugs, sea critters, foraged); see ItemMeta. */
  meta?: ItemMeta
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
