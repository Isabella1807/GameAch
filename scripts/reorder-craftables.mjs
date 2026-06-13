// One-off: reorder src/data/items/craftables.ts to match the game's crafting-menu
// category grouping (Storage, Farming, Ranching, Producers, Artisan, Resource, Decor,
// Consumables, Baits, Traps, Decoys, Bombs, Misc). The exact order WITHIN a tab isn't
// publicly documented, so within each group we use a sensible material/tier order.
// Item objects (id/name/image) are preserved byte-for-byte; only their order changes.
//
// Usage: node scripts/reorder-craftables.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const file = resolve(root, 'src/data/items/craftables.ts')
const src = readFileSync(file, 'utf8')

// Capture each item's full source line, keyed by its slug id.
const lineBySlug = new Map()
for (const m of src.matchAll(/^\s*\{ id: '([^']+)',.*\},?\s*$/gm)) {
  lineBySlug.set(m[1], `  ${m[0].trim().replace(/,?$/, ',')}`)
}

const ORDER = [
  // ── Storage ──
  'wooden-chest', 'scrap-chest', 'hay-chest', 'makeshift-chest', 'stone-chest',
  'auto-chest', 'fungarian-chest', 'ocean-explorer-chest', 'ocean-guardian-chest',
  // ── Farming: sprinklers ──
  'sprinkler-i', 'sprinkler-ii', 'sprinkler-iii',
  'lumina-sprinkler-i', 'lumina-sprinkler-ii', 'lumina-sprinkler-iii',
  // ── Farming: auto field tools ──
  'auto-seed', 'auto-fertilizer', 'auto-harvest', 'auto-sfh',
  'anemone-auto-seed', 'anemone-auto-fertilizer', 'anemone-auto-harvest', 'anemone-auto-sfh',
  // ── Farming: crafted fertilizers ──
  'fertilizer-i', 'fertilizer-ii', 'fertilizer-iii',
  'flash-i', 'flash-ii', 'flash-iii',
  'hydro-i', 'hydro-ii', 'hydro-iii',
  'architect-desk',
  // ── Farming: scarecrows ──
  'ordinary-scarecrow', 'makeshift-scarecrow', 'scrap-scarecrow',
  'alien-scarecrow', 'chef-scarecrow', 'chieftain-scarecrow', 'coral-hero-scarecrow',
  'fish-kite-scarecrow', 'gingerbread-scarecrow', 'humpty-scarecrow', 'jolly-stalk-scarecrow',
  'kunti-ghost-scarecrow', 'mermaid-scarecrow', 'monster-scarecrow', 'mummy-scarecrow',
  'ondel-ondel-handsome-scarecrow', 'ondel-ondel-pretty-scarecrow', 'pino-scarecrow',
  'poci-ghost-scarecrow', 'prankenstein-scarecrow', 'undead-scarecrow', 'walnutcracker-scarecrow',
  'ocean-explorer-scarecrow', 'ocean-guardian-scarecrow', 'ultimate-scarecrow',
  // ── Ranching ──
  'auto-feeder', 'auto-petter', 'auto-collector', 'auto-trash-collector', 'temperature-machine',
  // ── Item producers / tech ──
  'mushroom-log', 'slime-of-replication', 'solar-panel', 'solar-core', 'sturdy-computer',
  // ── Artisan equipment ──
  'keg', 'cheese-press', 'mayonnaise-machine', 'oil-press', 'loom', 'mason-jar',
  'aging-barrel', 'dehydrator', 'bee-house', 'tap', 'yogurt-machine',
  // ── Resource equipment ──
  'furnace', 'kiln', 'compost-bin', 'extractor', 'recycling-machine', 'slime-of-transmutation',
  // ── Decor (by material) ──
  'wooden-fence', 'wooden-gate', 'wooden-arch', 'wood-path', 'wood-floor-tile', 'wood-sign',
  'hay-fence', 'hay-gate', 'hay-arch', 'hay-floor-tile', 'hay-sign',
  'scrap-fence', 'scrap-gate', 'scrap-arch', 'scrap-floor-tile', 'scrap-sign',
  'makeshift-fence', 'makeshift-gate', 'makeshift-arch', 'makeshift-path', 'makeshift-floor-tile', 'makeshift-sign',
  'stone-fence', 'stone-gate', 'stone-arch', 'stone-path', 'stone-floor-tile', 'stone-sign',
  'hedge-fence', 'hedge-gate',
  // ── Consumables ──
  'ball-of-goop', 'candied-tree-seed', 'scuba-snack',
  'crawling-critter-scent', 'floating-critter-scent', 'flying-insect-scent', 'ground-insect-scent',
  'monster-scent', 'monster-scent-ii', 'monster-lure-scent', 'monster-lure-scent-ii',
  // ── Baits ──
  'small-fish-bait', 'medium-fish-bait', 'large-fish-bait',
  // ── Traps ──
  'crawler-trap', 'ground-insect-trap', 'flying-insect-trap', 'float-trap', 'glue-trap',
  'slime-trap', 'spring-trap', 'shock-trap', 'spikes', 'bamboo-net-small', 'bamboo-net-large',
  // ── Decoys ──
  'decoy',
  // ── Bombs ──
  'explosive-i', 'explosive-ii', 'explosive-iii',
  'vortexanator-i', 'vortexanator-ii', 'vortexanator-iii',
  // ── Misc ──
  'rope', 'flower-bouquet', 'warp-sesajen', 'weather-conch',
]

// Integrity: ORDER must be an exact permutation of the existing slugs.
const existing = new Set(lineBySlug.keys())
const ordered = new Set(ORDER)
const missing = [...existing].filter((s) => !ordered.has(s))
const extra = ORDER.filter((s) => !existing.has(s))
const dupes = ORDER.filter((s, i) => ORDER.indexOf(s) !== i)
if (missing.length || extra.length || dupes.length) {
  console.error('ABORT — ORDER is not a clean permutation of craftables.')
  if (missing.length) console.error('  missing from ORDER:', missing)
  if (extra.length) console.error('  unknown in ORDER  :', extra)
  if (dupes.length) console.error('  duplicated in ORDER:', dupes)
  process.exit(1)
}

const header = src.slice(0, src.indexOf('export const craftables'))
const body = ORDER.map((s) => lineBySlug.get(s)).join('\n')
const out = `${header}export const craftables: CollectionItem[] = [\n${body}\n]\n`
writeFileSync(file, out)
console.log(`Reordered ${ORDER.length} craftables into game-menu category order.`)
