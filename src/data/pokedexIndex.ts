// Indexador de la Pokédex.
//
// PokéAPI no ofrece una consulta que devuelva a la vez tipos, estadísticas, generación,
// color, huevos, etc. para todos los Pokémon, así que la app descarga:
//   1) la lista de Pokémon            → GET /pokemon?limit=2000
//   2) cada Pokémon                   → GET /pokemon/{id}
//   3) cada especie (una vez por especie) → GET /pokemon-species/{id}
// Todo se guarda en IndexedDB, así que el proceso es resumible y solo ocurre una vez.
// Siguiendo la política de uso justo de PokéAPI, las peticiones tienen concurrencia limitada
// y los datos nunca se vuelven a pedir mientras estén en caché.

import { idFromUrl } from '../api/client'
import { getPokemon, getSpecies, listResource } from '../api/endpoints'
import type { ApiList, Pokemon, PokemonSpecies } from '../api/types'
import { formatPokemonDisplayName, pickFlavor, pickGenus, pickName } from '../lib/localized'
import { generationNumber, uniq } from '../lib/utils'
import { cacheGetMany, cacheSet, cacheSetList, cacheClear, cacheGetFreshList } from './storage'
import { createExternalStore, INITIAL_INDEX_STATE, runPool, type IndexState } from './store'
import type { EvolutionStage, PokemonEntry, PokemonRecord, SpeciesRecord, Stats } from './models'

const CONCURRENCY = 6
const LIST_KEY = 'list:pokemon'
const PROGRESS_THROTTLE_MS = 150

interface ListItem {
  id: number
  name: string
}

const pokemonMap = new Map<number, PokemonRecord>()
const speciesMap = new Map<number, SpeciesRecord>()
const speciesInFlight = new Map<number, Promise<SpeciesRecord>>()

let running: Promise<void> | null = null
let progressDone = 0
let failedCount = 0
let progressScheduled = false

export const pokedexIndexStore = createExternalStore<IndexState>(INITIAL_INDEX_STATE)

function patch(partial: Partial<IndexState>, bumpRevision = false): void {
  const current = pokedexIndexStore.get()
  pokedexIndexStore.set({
    ...current,
    ...partial,
    revision: bumpRevision ? current.revision + 1 : current.revision,
  })
}

/** Evita re-renderizar cientos de veces por segundo durante la descarga. */
function scheduleProgress(): void {
  if (progressScheduled) return
  progressScheduled = true
  setTimeout(() => {
    progressScheduled = false
    patch({ done: progressDone, failedCount }, true)
  }, PROGRESS_THROTTLE_MS)
}

/** Inicia (o reanuda) la indexación. Es idempotente: si ya está en marcha no hace nada. */
export function startPokedexIndex(): void {
  if (running) return
  running = run().finally(() => {
    running = null
  })
}

/** Borra la caché local y vuelve a descargar todo desde PokéAPI. */
export async function resetPokedexIndex(): Promise<void> {
  if (running) await running
  await cacheClear()
  pokemonMap.clear()
  speciesMap.clear()
  progressDone = 0
  failedCount = 0
  patch({ ...INITIAL_INDEX_STATE, revision: pokedexIndexStore.get().revision + 1 }, true)
  startPokedexIndex()
}

async function run(): Promise<void> {
  progressDone = 0
  failedCount = 0
  patch({ status: 'loading', phase: 'Obteniendo catálogo de Pokémon…', error: null, failedCount: 0, done: 0 }, true)

  try {
    const list = await loadPokemonList()
    patch({ total: list.length, phase: 'Leyendo datos guardados…' }, true)

    const cachedPokemon = await cacheGetMany<PokemonRecord>(list.map((p) => `pokemon:${p.id}`))
    list.forEach((item, index) => {
      const record = cachedPokemon[index]
      if (record) pokemonMap.set(item.id, record)
    })

    const speciesIds = uniq([...pokemonMap.values()].map((p) => p.speciesId))
    const cachedSpecies = await cacheGetMany<SpeciesRecord>(speciesIds.map((id) => `species:${id}`))
    speciesIds.forEach((id, index) => {
      const record = cachedSpecies[index]
      if (record) speciesMap.set(id, record)
    })

    const pending = list.filter((item) => {
      const record = pokemonMap.get(item.id)
      return !record || !speciesMap.has(record.speciesId)
    })

    progressDone = list.length - pending.length
    patch({ done: progressDone, phase: 'Descargando Pokémon y especies…' }, true)

    await runPool(pending, CONCURRENCY, async (item) => {
      try {
        await ensureEntry(item.id)
        progressDone++
      } catch {
        failedCount++
      }
      scheduleProgress()
    })

    patch(
      {
        status: 'ready',
        phase: failedCount ? `${failedCount} elementos no se pudieron cargar` : 'Pokédex lista',
        done: progressDone,
        failedCount,
      },
      true,
    )
  } catch (error) {
    patch(
      {
        status: 'error',
        phase: 'Error al cargar la Pokédex',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      true,
    )
  }
}

async function loadPokemonList(): Promise<ListItem[]> {
  const cached = await cacheGetFreshList<ListItem[]>(LIST_KEY)
  if (cached?.length) return cached

  const response = (await listResource('pokemon', 2000)) as ApiList
  const list = response.results
    .map((r) => ({ id: idFromUrl(r.url), name: r.name }))
    .filter((r) => Number.isFinite(r.id))
    .sort((a, b) => a.id - b.id)
  await cacheSetList(LIST_KEY, list)
  return list
}

async function ensureEntry(id: number): Promise<void> {
  let pokemon = pokemonMap.get(id)
  if (!pokemon) {
    const raw = await getPokemon(id)
    pokemon = toPokemonRecord(raw)
    pokemonMap.set(id, pokemon)
    await cacheSet(`pokemon:${id}`, pokemon)
  }
  if (!speciesMap.has(pokemon.speciesId)) {
    await ensureSpecies(pokemon.speciesId)
  }
}

async function ensureSpecies(id: number): Promise<SpeciesRecord> {
  const existing = speciesMap.get(id)
  if (existing) return existing

  const inflight = speciesInFlight.get(id)
  if (inflight) return inflight

  const promise = (async () => {
    const raw = await getSpecies(id)
    const record = toSpeciesRecord(raw)
    speciesMap.set(id, record)
    await cacheSet(`species:${id}`, record)
    return record
  })()

  speciesInFlight.set(id, promise)
  try {
    return await promise
  } finally {
    speciesInFlight.delete(id)
  }
}

// ---------- Conversión API → modelos compactos ----------

export function toPokemonRecord(raw: Pokemon): PokemonRecord {
  const byName: Record<string, number> = {}
  for (const s of raw.stats) byName[s.stat.name] = s.base_stat
  const hp = byName['hp'] ?? 0
  const attack = byName['attack'] ?? 0
  const defense = byName['defense'] ?? 0
  const spAttack = byName['special-attack'] ?? 0
  const spDefense = byName['special-defense'] ?? 0
  const speed = byName['speed'] ?? 0
  const stats: Stats = {
    hp,
    attack,
    defense,
    spAttack,
    spDefense,
    speed,
    total: hp + attack + defense + spAttack + spDefense + speed,
  }

  return {
    id: raw.id,
    name: raw.name,
    speciesId: idFromUrl(raw.species.url),
    isDefault: raw.is_default,
    order: raw.order,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    stats,
    height: raw.height / 10,
    weight: raw.weight / 10,
    baseExperience: raw.base_experience,
    abilities: raw.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden, slot: a.slot })),
    moves: uniq(raw.moves.map((m) => m.move.name)),
  }
}

export function toSpeciesRecord(raw: PokemonSpecies): SpeciesRecord {
  const displayName = pickName(raw.names, raw.name)
  return {
    id: raw.id,
    name: raw.name,
    displayName,
    genus: pickGenus(raw.genera),
    generation: generationNumber(raw.generation.name),
    color: raw.color.name,
    shape: raw.shape?.name ?? null,
    habitat: raw.habitat?.name ?? null,
    eggGroups: raw.egg_groups.map((g) => g.name),
    growthRate: raw.growth_rate.name,
    isBaby: raw.is_baby,
    isLegendary: raw.is_legendary,
    isMythical: raw.is_mythical,
    captureRate: raw.capture_rate,
    baseHappiness: raw.base_happiness,
    genderRate: raw.gender_rate,
    hatchCounter: raw.hatch_counter,
    hasGenderDifferences: raw.has_gender_differences,
    formsSwitchable: raw.forms_switchable,
    pokedexes: raw.pokedex_numbers.map((p) => ({ name: p.pokedex.name, entry: p.entry_number })),
    evolvesFrom: raw.evolves_from_species?.name ?? null,
    evolutionChainId: raw.evolution_chain ? idFromUrl(raw.evolution_chain.url) : null,
    varieties: raw.varieties.map((v) => v.pokemon.name),
    flavorText: pickFlavor(raw.flavor_text_entries),
  }
}

// ---------- Composición para la UI ----------

/** Nombre visible: "Charizard", o "Charizard (Mega X)" para formas alternativas. */
export function computeDisplayName(pokemon: PokemonRecord, species: SpeciesRecord): string {
  return formatPokemonDisplayName(pokemon.name, species.name, species.displayName)
}

/** Une Pokémon + especie y calcula la etapa de evolución usando todas las especies cargadas. */
export function buildPokemonEntries(): PokemonEntry[] {
  const parentNames = new Set<string>()
  for (const species of speciesMap.values()) {
    if (species.evolvesFrom) parentNames.add(species.evolvesFrom)
  }

  const entries: PokemonEntry[] = []
  const sorted = [...pokemonMap.values()].sort((a, b) => a.id - b.id)
  for (const pokemon of sorted) {
    const species = speciesMap.get(pokemon.speciesId)
    if (!species) continue
    const hasEvolutions = parentNames.has(species.name)
    const hasPreEvolution = species.evolvesFrom !== null
    let evolutionStage: EvolutionStage
    if (!hasPreEvolution && !hasEvolutions) evolutionStage = 'single'
    else if (!hasPreEvolution) evolutionStage = 'base'
    else if (hasEvolutions) evolutionStage = 'middle'
    else evolutionStage = 'final'

    entries.push({
      ...pokemon,
      displayName: computeDisplayName(pokemon, species),
      species,
      hasEvolutions,
      evolutionStage,
    })
  }
  return entries
}

export function getSpeciesById(id: number): SpeciesRecord | undefined {
  return speciesMap.get(id)
}

export function getSpeciesByName(name: string): SpeciesRecord | undefined {
  for (const species of speciesMap.values()) if (species.name === name) return species
  return undefined
}
