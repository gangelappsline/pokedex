// Catálogo completo de movimientos (para filtrar por tipo, daño, potencia, precisión, etc.).
// Sigue el mismo patrón que la Pokédex: lista + detalle por movimiento, cacheado en IndexedDB.

import { idFromUrl } from '../api/client'
import { getMove, listResource } from '../api/endpoints'
import type { ApiList, Move } from '../api/types'
import { pickEffect, pickName } from '../lib/localized'
import { generationNumber } from '../lib/utils'
import type { MoveRecord } from './models'
import { cacheGetFreshList, cacheGetMany, cacheSet, cacheSetList, cacheClear } from './storage'
import { createExternalStore, INITIAL_INDEX_STATE, runPool, type IndexState } from './store'

const CONCURRENCY = 6
const LIST_KEY = 'list:move'

interface ListItem {
  id: number
  name: string
}

const moveMap = new Map<number, MoveRecord>()
let running: Promise<void> | null = null
let progressDone = 0
let failedCount = 0
let progressScheduled = false

export const moveIndexStore = createExternalStore<IndexState>(INITIAL_INDEX_STATE)

function patch(partial: Partial<IndexState>, bumpRevision = false): void {
  const current = moveIndexStore.get()
  moveIndexStore.set({ ...current, ...partial, revision: bumpRevision ? current.revision + 1 : current.revision })
}

function scheduleProgress(): void {
  if (progressScheduled) return
  progressScheduled = true
  setTimeout(() => {
    progressScheduled = false
    patch({ done: progressDone, failedCount }, true)
  }, 150)
}

export function startMoveIndex(): void {
  if (running) return
  running = run().finally(() => {
    running = null
  })
}

export async function resetMoveIndex(): Promise<void> {
  if (running) await running
  await cacheClear()
  moveMap.clear()
  progressDone = 0
  failedCount = 0
  patch({ ...INITIAL_INDEX_STATE, revision: moveIndexStore.get().revision + 1 }, true)
  startMoveIndex()
}

async function run(): Promise<void> {
  progressDone = 0
  failedCount = 0
  patch({ status: 'loading', phase: 'Obteniendo catálogo de movimientos…', error: null, failedCount: 0, done: 0 }, true)
  try {
    const list = await loadList()
    patch({ total: list.length, phase: 'Leyendo datos guardados…' }, true)

    const cached = await cacheGetMany<MoveRecord>(list.map((m) => `move:${m.id}`))
    list.forEach((item, index) => {
      const record = cached[index]
      if (record) moveMap.set(item.id, record)
    })

    const pending = list.filter((item) => !moveMap.has(item.id))
    progressDone = list.length - pending.length
    patch({ done: progressDone, phase: 'Descargando movimientos…' }, true)

    await runPool(pending, CONCURRENCY, async (item) => {
      try {
        const raw = await getMove(item.id)
        const record = toMoveRecord(raw)
        moveMap.set(item.id, record)
        await cacheSet(`move:${item.id}`, record)
        progressDone++
      } catch {
        failedCount++
      }
      scheduleProgress()
    })

    patch(
      {
        status: 'ready',
        phase: failedCount ? `${failedCount} movimientos no se pudieron cargar` : 'Movimientos listos',
        done: progressDone,
        failedCount,
      },
      true,
    )
  } catch (error) {
    patch(
      {
        status: 'error',
        phase: 'Error al cargar los movimientos',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      true,
    )
  }
}

async function loadList(): Promise<ListItem[]> {
  const cached = await cacheGetFreshList<ListItem[]>(LIST_KEY)
  if (cached?.length) return cached
  const response = (await listResource('move', 2000)) as ApiList
  const list = response.results
    .map((r) => ({ id: idFromUrl(r.url), name: r.name }))
    .filter((r) => Number.isFinite(r.id))
    .sort((a, b) => a.id - b.id)
  await cacheSetList(LIST_KEY, list)
  return list
}

export function toMoveRecord(raw: Move): MoveRecord {
  const effect = pickEffect(raw.effect_entries)
  return {
    id: raw.id,
    name: raw.name,
    displayName: pickName(raw.names, raw.name),
    type: raw.type.name,
    damageClass: raw.damage_class?.name ?? null,
    power: raw.power,
    accuracy: raw.accuracy,
    pp: raw.pp,
    priority: raw.priority,
    target: raw.target?.name ?? null,
    ailment: raw.meta?.ailment?.name ?? null,
    category: raw.meta?.category?.name ?? null,
    effect: effect.short || effect.effect,
    generation: generationNumber(raw.generation.name),
    learnedByCount: raw.learned_by_pokemon.length,
    critRate: raw.meta?.crit_rate ?? 0,
    drain: raw.meta?.drain ?? 0,
    healing: raw.meta?.healing ?? 0,
    flinchChance: raw.meta?.flinch_chance ?? 0,
    ailmentChance: raw.meta?.ailment_chance ?? 0,
    statChance: raw.meta?.stat_chance ?? 0,
    minHits: raw.meta?.min_hits ?? null,
    maxHits: raw.meta?.max_hits ?? null,
  }
}

export function getMoveRecords(): MoveRecord[] {
  return [...moveMap.values()].sort((a, b) => a.id - b.id)
}
