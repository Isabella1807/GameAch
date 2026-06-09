// Reads the local Coral Island save, extracts real progress, resolves the game's
// internal item IDs to names/categories via coral.guide, and writes src/data/save-progress.ts.
//
// Extracts: craftingRecipes (DIY Expert), fishingCaughtables/catchingCaughtables (caught),
// shippedItemCount maps (per-item ship counts -> Specialty Farmer/Rancher), and
// playerLifetimeEarnings (High Roller).
//
// Usage: node scripts/import-save.mjs ["<path to .sav>"]

import { readFileSync, writeFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_SAVE =
  'C:\\Users\\Megao\\AppData\\Local\\ProjectCoral\\Saved\\SaveGames\\DailySave_0.sav'
const savePath = process.argv[2] || DEFAULT_SAVE

// ── decompress all Unreal compression chunks ──
const buf = readFileSync(savePath)
const isMagic = (b, i) => b[i] === 0xc1 && b[i + 1] === 0x83 && b[i + 2] === 0x2a && b[i + 3] === 0x9e
function findMagic(b, from) { for (let i = from; i < b.length - 4; i++) if (isMagic(b, i)) return i; return -1 }
let off = findMagic(buf, 0)
if (off === -1) { console.error('No compression magic found.'); process.exit(1) }
const parts = []
while (off !== -1 && off + 32 <= buf.length && isMagic(buf, off)) {
  let p = off + 8
  const bs = Number(buf.readBigUInt64LE(p)); p += 8
  buf.readBigUInt64LE(p); p += 8
  const su = Number(buf.readBigUInt64LE(p)); p += 8
  const nB = Math.max(1, Math.ceil(su / bs))
  const cs = []
  for (let b = 0; b < nB; b++) { cs.push(Number(buf.readBigUInt64LE(p))); p += 8; buf.readBigUInt64LE(p); p += 8 }
  for (const c of cs) { parts.push(inflateSync(buf.subarray(p, p + c))); p += c }
  off = isMagic(buf, p) ? p : -1
}
const data = Buffer.concat(parts)
const ascii = data.toString('latin1')

// ── minimal GVAS readers ──
function readFStr(pos) {
  const len = data.readInt32LE(pos)
  if (len <= 0 || len > 256 || pos + 4 + len > data.length || data[pos + 4 + len - 1] !== 0) return null
  return { str: data.toString('latin1', pos + 4, pos + 4 + len - 1), next: pos + 4 + len }
}
function allOcc(name) {
  const r = []; let i = 0
  while ((i = ascii.indexOf(name, i)) !== -1) {
    if (i >= 4 && data.readInt32LE(i - 4) === name.length + 1 && data[i + name.length] === 0) r.push(i - 4)
    i += name.length
  }
  return r
}
const findProp = (name) => (allOcc(name)[0] ?? -1)
function propAt(pos) {
  const n = readFStr(pos); if (!n) return null
  if (n.str === 'None') return { name: 'None', next: n.next }
  const t = readFStr(n.next)
  const size = Number(data.readBigInt64LE(t.next))
  let h = t.next + 8
  if (t.str === 'StructProperty') { const s = readFStr(h); h = s.next + 17 }
  else if (t.str === 'ArrayProperty' || t.str === 'SetProperty') { const it = readFStr(h); h = it.next + 1 }
  else if (t.str === 'MapProperty') { const k = readFStr(h); const v = readFStr(k.next); h = v.next + 1 }
  else if (t.str === 'EnumProperty' || t.str === 'ByteProperty') { const e = readFStr(h); h = e.next + 1 }
  else if (t.str === 'BoolProperty') return { name: n.str, type: t.str, valueStart: h, size: 0, next: h + 2 }
  else h = h + 1
  return { name: n.str, type: t.str, valueStart: h, size, next: h + size }
}
function skipStruct(pos) {
  for (let g = 0; g < 100000; g++) { const p = propAt(pos); if (!p) return pos; if (p.name === 'None') return p.next; pos = p.next }
  return pos
}
function mapKeys(name) {
  const i = findProp(name); if (i < 0) return []
  let pos = propAt(i).valueStart + 4
  const count = data.readInt32LE(pos); pos += 4
  const out = []
  for (let k = 0; k < count && pos < data.length; k++) { const key = readFStr(pos); if (!key) break; pos = skipStruct(key.next); out.push(key.str) }
  return out
}
function arrayNames(name) {
  const i = findProp(name); if (i < 0) return []
  let pos = propAt(i).valueStart
  const count = data.readInt32LE(pos); pos += 4
  const out = []
  for (let k = 0; k < count && pos < data.length; k++) { const s = readFStr(pos); if (!s) break; out.push(s.str); pos = s.next }
  return out
}
function findInt(name) {
  // allOcc returns the length-prefix position (4 bytes before the name string).
  for (const pp of allOcc(name)) {
    const t = readFStr(pp + 4 + name.length + 1)
    if (t && t.str === 'IntProperty') return data.readInt32LE(t.next + 8 + 1)
  }
  return null
}
/** Consolidate all shippedItemCount maps -> item id -> TOTAL times shipped.
 * Verified: summing makes a crop reach >=1000, matching the completed Specialty Farmer. */
function shipCounts() {
  const total = new Map()
  for (const p of allOcc('shippedItemCount')) {
    const n = readFStr(p); const t = readFStr(n.next)
    if (!t || t.str !== 'MapProperty') continue
    let h = t.next + 8; const kt = readFStr(h); const vt = readFStr(kt.next); h = vt.next + 1
    if (kt.str !== 'NameProperty' || vt.str !== 'IntProperty') continue
    const count = data.readInt32LE(h + 4); let pos = h + 8
    for (let k = 0; k < count && pos < data.length; k++) {
      const key = readFStr(pos); if (!key) break; pos = key.next
      const val = data.readInt32LE(pos); pos += 4
      total.set(key.str, (total.get(key.str) || 0) + val)
    }
  }
  return total
}
/** All item IDs shipped at least once (union of the shippedItem Sets). */
function shippedSetIds() {
  const out = new Set()
  for (const p of allOcc('shippedItem')) {
    const n = readFStr(p); if (!n || n.str !== 'shippedItem') continue
    const t = readFStr(n.next); if (!t || t.str !== 'SetProperty') continue
    let h = t.next + 8; const it = readFStr(h); h = it.next + 1
    const count = data.readInt32LE(h + 4); let pos = h + 8
    for (let k = 0; k < count && pos < data.length; k++) { const s = readFStr(pos); if (!s) break; out.add(s.str); pos = s.next }
  }
  return out
}

const crafted = arrayNames('craftingRecipes')
const fishCaught = mapKeys('fishingCaughtables')
const catchables = mapKeys('catchingCaughtables')
const ships = shipCounts()
const shippedIds = shippedSetIds()
const lifetimeEarnings = findInt('playerLifetimeEarnings')

// ── resolve item IDs -> {slug, category} via coral.guide ──
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const ids = [...new Set([...crafted, ...fishCaught, ...catchables, ...ships.keys(), ...shippedIds])].filter((x) => /^item_\d+$/.test(x))

let warnedOnce = false
async function resolveId(id) {
  try {
    const r = await fetch(`https://coral.guide/assets/live/database/items/${id}.json`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (gameach save importer; personal use)' },
    })
    if (!r.ok) {
      if (!warnedOnce) { warnedOnce = true; console.error(`  (first fetch ${id} -> HTTP ${r.status})`) }
      return null
    }
    const j = await r.json()
    const obj = j.item ?? j
    const icon = obj.iconName || ''
    if (!icon) return null
    const name = icon.replace(/_/g, ' ').replace(/\s*sprite\s*$/i, '').trim()
    return { id, slug: slug(name), name, category: obj.inventoryCategory || '' }
  } catch { return null }
}
const resolved = new Map()
const CONC = 8
for (let i = 0; i < ids.length; i += CONC) {
  const batch = await Promise.all(ids.slice(i, i + CONC).map(resolveId))
  for (const r of batch) if (r) resolved.set(r.id, r)
}

// ── route caught/crafted into our collections ──
const checked = { fish: new Set(), bugs: new Set(), 'sea-critters': new Set(), craftables: new Set() }
for (const id of crafted) { const r = resolved.get(id); if (r) checked.craftables.add(r.slug) }
for (const id of [...fishCaught, ...catchables]) {
  const r = resolved.get(id); if (!r) continue
  if (r.category === 'Fish') checked.fish.add(r.slug)
  else if (r.category === 'Bug') checked.bugs.add(r.slug)
  else if (/critter|ocean|sea/i.test(r.category)) checked['sea-critters'].add(r.slug)
}

// ── per-item ship totals -> Specialty Farmer (crops) / Rancher (animal products) ──
const CROP_CATS = ['Fruit', 'Vegetables', 'Flower']
const cropList = []
const animalList = []
for (const [id, c] of ships) {
  const r = resolved.get(id); if (!r || !r.name) continue
  const entry = { name: r.name, count: c }
  if (CROP_CATS.includes(r.category)) cropList.push(entry)
  else if (r.category === 'AnimalProduct') animalList.push(entry)
}
cropList.sort((a, b) => b.count - a.count)
animalList.sort((a, b) => b.count - a.count)
const maxCropShipped = cropList[0]?.count ?? 0
const maxAnimalProductShipped = animalList[0]?.count ?? 0
const shipped = { crops: cropList, animalProducts: animalList }
const shippedSlugs = [...new Set([...shippedIds].map((id) => resolved.get(id)?.slug).filter(Boolean))].sort()

const now = new Date().toISOString()
const checkedObj = Object.fromEntries(Object.entries(checked).map(([k, set]) => [k, [...set].sort()]))
const ts =
  `// AUTO-GENERATED by scripts/import-save.mjs from the local Coral Island save — do not edit.\n` +
  `// Last import: ${now}\n` +
  `export interface SaveProgress {\n` +
  `  lastImported: string | null\n` +
  `  lifetimeEarnings: number | null\n` +
  `  maxCropShipped: number | null\n` +
  `  maxAnimalProductShipped: number | null\n` +
  `  /** collectionKey -> item slugs marked done from the save */\n` +
  `  checked: Record<string, string[]>\n` +
  `  /** per-item ship totals (sorted desc) for the Specialty achievements */\n` +
  `  shipped: { crops: { name: string; count: number }[]; animalProducts: { name: string; count: number }[] }\n` +
  `  /** slugs of every item shipped at least once (Legendary Farmer) */\n` +
  `  shippedSlugs: string[]\n` +
  `}\n\n` +
  `export const saveProgress: SaveProgress = ${JSON.stringify(
    { lastImported: now, lifetimeEarnings, maxCropShipped, maxAnimalProductShipped, checked: checkedObj, shipped, shippedSlugs },
    null,
    2,
  )}\n`
writeFileSync(resolve(root, 'src/data/save-progress.ts'), ts)

console.log(`Decompressed ${(data.length / 1e6).toFixed(1)} MB. Resolved ${resolved.size}/${ids.length} IDs.`)
console.log(`Matched -> fish ${checkedObj.fish.length}, bugs ${checkedObj.bugs.length}, sea-critters ${checkedObj['sea-critters'].length}, craftables ${checkedObj.craftables.length}`)
console.log(`maxCropShipped ${maxCropShipped}, maxAnimalProductShipped ${maxAnimalProductShipped}, lifetimeEarnings ${lifetimeEarnings}`)
console.log(`shippedSlugs ${shippedSlugs.length}. Wrote src/data/save-progress.ts`)
