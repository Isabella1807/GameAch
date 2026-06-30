/**
 * A single Icarus achievement, sourced straight from the Steam achievement schema by
 * scripts/fetch-icarus.mjs. Icarus has no collection/checklist achievements like Coral
 * Island, so every entry is a plain unlock — tracked via Steam sync + manual toggle.
 */
export interface IcarusAchievement {
  /** Stable slug we control — used as the localStorage key. Derived from the apiname. */
  id: string
  /** Steam schema apiname — the sync matches Steam unlocks on this. */
  steamApiName: string
  /** Display name, identical to Steam. */
  name: string
  /** Requirement text from the Steam schema. */
  description: string
  /** Coloured achievement icon (unlocked state). */
  icon?: string
  /** Greyed-out achievement icon (locked state). */
  iconGray?: string
  /** Whether Steam marks the achievement as hidden (spoiler). */
  hidden?: boolean
}
