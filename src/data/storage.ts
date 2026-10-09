// Caché persistente en IndexedDB. Si IndexedDB no está disponible (modo privado, etc.)
// la app sigue funcionando: simplemente no se persiste nada entre sesiones.
import { createStore, clear, get, getMany, set, setMany, type UseStore } from 'idb-keyval'

// Cambia este número para invalidar toda la caché local tras un cambio en los modelos.
const DATA_VERSION = 1

let store: UseStore | null = null
let disabled = false

function getStore(): UseStore | null {
  if (disabled) return null
  if (!store) {
    try {
      store = createStore('pokedex-data', `v${DATA_VERSION}`)
    } catch {
      disabled = true
      return null
    }
  }
  return store
}

export async function cacheGet<T>(key: string): Promise<T | undefined> {
  const s = getStore()
  if (!s) return undefined
  try {
    return (await get<T>(key, s)) as T | undefined
  } catch {
    return undefined
  }
}

export async function cacheGetMany<T>(keys: string[]): Promise<(T | undefined)[]> {
  const s = getStore()
  if (!s || keys.length === 0) return keys.map(() => undefined)
  try {
    return (await getMany<T>(keys, s)) as (T | undefined)[]
  } catch {
    return keys.map(() => undefined)
  }
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  const s = getStore()
  if (!s) return
  try {
    await set(key, value, s)
  } catch {
    /* sin persistencia: no es fatal */
  }
}

export async function cacheSetMany(entries: [string, unknown][]): Promise<void> {
  const s = getStore()
  if (!s || entries.length === 0) return
  try {
    await setMany(entries, s)
  } catch {
    /* sin persistencia: no es fatal */
  }
}

export async function cacheClear(): Promise<void> {
  const s = getStore()
  if (!s) return
  try {
    await clear(s)
  } catch {
    /* ignorar */
  }
}

const WEEK_MS = 1000 * 60 * 60 * 24 * 7

/** Devuelve la lista cacheada si tiene menos de una semana. */
export async function cacheGetFreshList<T>(key: string): Promise<T | undefined> {
  const cached = await cacheGet<{ savedAt: number; items: T }>(key)
  if (!cached || Date.now() - cached.savedAt > WEEK_MS) return undefined
  return cached.items
}

export async function cacheSetList<T>(key: string, items: T): Promise<void> {
  await cacheSet(key, { savedAt: Date.now(), items })
}
