import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DATA_PATH
  ? join(process.env.DATA_PATH, 'items.json')
  : join(__dirname, 'items.json')

// Ensure the storage directory exists before any reads or writes.
// Critical for Railway volume mounts where the directory may not exist yet.
mkdirSync(dirname(DB_PATH), { recursive: true })

let data = { items: [], nextId: 1 }

if (existsSync(DB_PATH)) {
  try {
    data = JSON.parse(readFileSync(DB_PATH, 'utf8'))
  } catch {
    data = { items: [], nextId: 1 }
  }
}

function save() {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8')
  } catch (e) {
    // Log but never throw — disk errors must not prevent syncAll() from firing.
    // In-memory state is authoritative; persistence is best-effort.
    console.error('[db] Failed to persist items:', e.message)
  }
}

export function getAllItems() {
  return [...data.items]
}

export function getItemById(id) {
  return data.items.find((i) => i.id === id) ?? null
}

export function insertItem({ name, original_cost, claimed_by, fb_price }) {
  const item = {
    id: data.nextId++,
    name: name ?? '',
    original_cost: original_cost ?? null,
    claimed_by: claimed_by ?? null,
    fb_price: fb_price ?? null,
    created_at: Math.floor(Date.now() / 1000)
  }
  data.items.push(item)
  save()
  return item
}

export function updateItem({ id, name, original_cost, claimed_by, fb_price }) {
  const idx = data.items.findIndex((i) => i.id === id)
  if (idx === -1) return null
  data.items[idx] = { ...data.items[idx], name, original_cost, claimed_by, fb_price }
  save()
  return data.items[idx]
}

export function deleteItem(id) {
  const before = data.items.length
  data.items = data.items.filter((i) => i.id !== id)
  if (data.items.length !== before) save()
}
