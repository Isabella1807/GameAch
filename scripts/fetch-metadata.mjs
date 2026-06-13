// Enrich the catch/find lists (fish, bugs, sea critters, foraged) with per-item details
// from the Coral Island wiki infoboxes: size (fish), seasons, location, time, weather,
// rarity. Reads each existing <key>.ts, fetches the wikitext for every item in batches,
// parses the infobox, and rewrites the file preserving id/name/image and adding `meta`.
//
// Re-runnable and idempotent. Run AFTER fetch-collection.mjs (which regenerates the bare
// lists). Usage: node scripts/fetch-metadata.mjs [key]   (no key = all four)

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'gameach-data-fetch/1.0 (personal Coral Island achievement tracker)'

const TARGETS = {
  fish: { file: 'src/data/items/fish.ts', box: 'fish' },
  bugs: { file: 'src/data/items/insects.ts', box: 'bug' },
  'sea-critters': { file: 'src/data/items/sea-critters.ts', box: 'bug' },
  foraged: { file: 'src/data/items/foraged.ts', box: 'scavenge' },
}

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter']

// ── markup cleaning ──
function clean(v) {
  return (v ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\{\{[^{}]*\}\}/g, '') // drop nested templates
    .replace(/\[\[[^\]]*?\|([^\]]*?)\]\]/g, '$1') // [[A|B]] -> B
    .replace(/\[\[([^\]]*?)\]\]/g, '$1') // [[A]] -> A
    .replace(/'''?/g, '') // bold / italic
    .replace(/<br\s*\/?>/gi, ' • ') // line breaks -> bullet
    .replace(/&nbsp;/g, ' ')
    .replace(/[✓✔]/g, '') // stray check marks
    .replace(/\s*•\s*/g, ' • ')
    .replace(/•(?:\s*•)+/g, '•') // collapse empty bullets
    .replace(/^\s*•\s*|\s*•\s*$/g, '') // trim leading/trailing bullets
    .replace(/\s+/g, ' ')
    .trim()
}

// Split a template body on top-level "|" (ignoring pipes inside [[..]] / {{..}}).
function splitParams(s) {
  const out = []
  let depth = 0
  let buf = ''
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2)
    if (two === '[[' || two === '{{') {
      depth++
      buf += two
      i++
      continue
    }
    if (two === ']]' || two === '}}') {
      depth = Math.max(0, depth - 1)
      buf += two
      i++
      continue
    }
    const c = s[i]
    if (c === '|' && depth === 0) {
      out.push(buf)
      buf = ''
    } else buf += c
  }
  out.push(buf)
  return out
}

// Pull the {{Infobox ...}} block and parse its params into a key->raw-value map.
function parseInfobox(wikitext) {
  const start = wikitext.indexOf('{{Infobox')
  if (start === -1) return null
  let depth = 0
  let end = -1
  for (let i = start; i < wikitext.length; i++) {
    const two = wikitext.slice(i, i + 2)
    if (two === '{{') {
      depth++
      i++
    } else if (two === '}}') {
      depth--
      i++
      if (depth === 0) {
        end = i + 1
        break
      }
    }
  }
  if (end === -1) return null
  const body = wikitext.slice(start + 2, end - 2) // strip outer {{ }}
  const params = splitParams(body)
  params.shift() // drop the "Infobox xxx" name
  const map = {}
  for (const p of params) {
    const eq = p.indexOf('=')
    if (eq === -1) continue
    map[p.slice(0, eq).trim().toLowerCase()] = p.slice(eq + 1)
  }
  return map
}

function parseSeasonsField(raw) {
  const c = clean(raw)
  if (!c) return undefined
  if (/^any$/i.test(c) || /all seasons/i.test(c)) return ['Any']
  const found = SEASONS.filter((s) => new RegExp(s, 'i').test(c))
  return found.length ? found : [c]
}

// Fish: derive seasons from the per-season ✓ flags; collapse all four to "Any".
function parseFishSeasons(box) {
  const active = SEASONS.filter((s) => /✓|✓|yes|true/i.test(box[s.toLowerCase()] ?? ''))
  if (active.length === 4) return ['Any']
  if (active.length) return active
  return parseSeasonsField(box.season)
}

function buildMeta(box, type) {
  if (!box) return {}
  const m = {}
  if (type === 'fish') {
    const size = clean(box.size)
    if (size) m.size = size
    const seasons = parseFishSeasons(box)
    if (seasons) m.seasons = seasons
  } else {
    const seasons = parseSeasonsField(box.season)
    if (seasons) m.seasons = seasons
  }
  const location = clean(box.location)
  if (location) m.location = location
  const time = clean(box.time)
  if (time) m.time = time
  const weather = clean(box.weather)
  if (weather) m.weather = weather
  const rarity = clean(box.rarity)
  if (rarity) m.rarity = rarity
  return m
}

// ── wiki API (batched) ──
async function fetchWikitext(titles) {
  const map = new Map() // normalised title -> wikitext
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40)
    const url =
      `https://coralisland.fandom.com/api.php?action=query&prop=revisions` +
      `&rvprop=content&rvslots=main&redirects=1&format=json&titles=` +
      batch.map((t) => encodeURIComponent(t)).join('%7C')
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const norm = new Map() // requested -> resolved title
    for (const n of data?.query?.normalized ?? []) norm.set(n.from, n.to)
    for (const r of data?.query?.redirects ?? []) norm.set(r.from, r.to)
    const byTitle = new Map()
    for (const p of Object.values(data?.query?.pages ?? {})) {
      const text = p?.revisions?.[0]?.slots?.main?.['*'] ?? p?.revisions?.[0]?.['*']
      if (p.title && text) byTitle.set(p.title, text)
    }
    for (const t of batch) {
      let resolved = t
      while (norm.has(resolved)) resolved = norm.get(resolved)
      const text = byTitle.get(resolved) ?? byTitle.get(t)
      if (text) map.set(t, text)
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  return map
}

function fmtMeta(m) {
  const parts = []
  if (m.size) parts.push(`size: ${JSON.stringify(m.size)}`)
  if (m.seasons?.length) parts.push(`seasons: ${JSON.stringify(m.seasons)}`)
  if (m.location) parts.push(`location: ${JSON.stringify(m.location)}`)
  if (m.time) parts.push(`time: ${JSON.stringify(m.time)}`)
  if (m.weather) parts.push(`weather: ${JSON.stringify(m.weather)}`)
  if (m.rarity) parts.push(`rarity: ${JSON.stringify(m.rarity)}`)
  return parts.length ? `, meta: { ${parts.join(', ')} }` : ''
}

async function processTarget(key) {
  const { file, box } = TARGETS[key]
  const path = resolve(root, file)
  const src = readFileSync(path, 'utf8')

  // Capture existing items (id, name, image) — order preserved.
  const items = []
  for (const m of src.matchAll(/\{ id: '([^']+)', name: ("(?:[^"\\]|\\.)*")(?:, image: ("(?:[^"\\]|\\.)*"))? \}/g)) {
    items.push({ id: m[1], name: JSON.parse(m[2]), image: m[3] ? JSON.parse(m[3]) : undefined })
  }
  if (!items.length) {
    console.error(`  ${key}: no items parsed from ${file} — skipping`)
    return
  }

  const wikitext = await fetchWikitext(items.map((i) => i.name))
  let enriched = 0
  let missing = 0
  const lines = items.map((it) => {
    const text = wikitext.get(it.name)
    const meta = text ? buildMeta(parseInfobox(text), box) : {}
    if (Object.keys(meta).length) enriched++
    else missing++
    const img = it.image !== undefined ? `, image: ${JSON.stringify(it.image)}` : ''
    return `  { id: '${it.id}', name: ${JSON.stringify(it.name)}${img}${fmtMeta(meta)} },`
  })

  const header = src.slice(0, src.indexOf('export const '))
  const varName = src.match(/export const (\w+):/)[1]
  const out = `${header}export const ${varName}: CollectionItem[] = [\n${lines.join('\n')}\n]\n`
  writeFileSync(path, out)
  console.log(`  ${key}: ${enriched} enriched, ${missing} without metadata (${items.length} total)`)
}

const only = process.argv[2]
const keys = only ? [only] : Object.keys(TARGETS)
for (const key of keys) {
  if (!TARGETS[key]) {
    console.error(`Unknown key "${key}". Valid: ${Object.keys(TARGETS).join(', ')}`)
    process.exit(1)
  }
  console.log(`Fetching metadata for ${key}…`)
  await processTarget(key)
}
console.log('Done.')
