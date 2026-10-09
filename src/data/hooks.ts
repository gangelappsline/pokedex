import { useMemo, useSyncExternalStore } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import {
  getAbility,
  getEvolutionChain,
  getItem,
  getMove,
  getNature,
  getPokedex,
  getPokemon,
  getPokemonEncounters,
  getRegion,
  getSpecies,
  getType,
  listResource,
} from '../api/endpoints'
import type { ApiList, PokemonType } from '../api/types'
import { buildTypeMatrix, type TypeMatrix } from '../lib/typeChart'
import { TYPE_NAMES } from '../lib/labels'
import { buildPokemonEntries, pokedexIndexStore } from './pokedexIndex'
import { getMoveRecords, moveIndexStore } from './moveIndex'

// ---------- Índices locales (IndexedDB + memoria) ----------

export function usePokedexIndex() {
  const state = useSyncExternalStore(pokedexIndexStore.subscribe, pokedexIndexStore.get)
  // state.revision cambia cuando se actualizan los datos locales: es el disparador de recálculo.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entries = useMemo(() => buildPokemonEntries(), [state.revision])
  return { state, entries }
}

export function useMoveIndex() {
  const state = useSyncExternalStore(moveIndexStore.subscribe, moveIndexStore.get)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- state.revision es el disparador de recálculo
  const moves = useMemo(() => getMoveRecords(), [state.revision])
  return { state, moves }
}

// ---------- Consultas puntuales (React Query) ----------

export function usePokemonQuery(idOrName: string | undefined) {
  return useQuery({
    queryKey: ['pokemon', idOrName],
    queryFn: ({ signal }) => getPokemon(idOrName as string, signal),
    enabled: Boolean(idOrName),
  })
}

export function useSpeciesQuery(id: number | undefined) {
  return useQuery({
    queryKey: ['species', id],
    queryFn: ({ signal }) => getSpecies(id as number, signal),
    enabled: id !== undefined && Number.isFinite(id),
  })
}

export function useEvolutionChainQuery(id: number | undefined) {
  return useQuery({
    queryKey: ['evolution-chain', id],
    queryFn: ({ signal }) => getEvolutionChain(id as number, signal),
    enabled: id !== undefined && Number.isFinite(id),
  })
}

export function useEncountersQuery(idOrName: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['encounters', idOrName],
    queryFn: ({ signal }) => getPokemonEncounters(idOrName as string, signal),
    enabled: Boolean(idOrName) && enabled,
  })
}

export function useTypeQuery(name: string | undefined) {
  return useQuery({
    queryKey: ['type', name],
    queryFn: ({ signal }) => getType(name as string, signal),
    enabled: Boolean(name),
  })
}

/** Tabla de efectividad completa (18 tipos). Devuelve null mientras se carga. */
export function useTypeMatrix(): { matrix: TypeMatrix | null; types: PokemonType[] } {
  const results = useQueries({
    queries: TYPE_NAMES.map((name) => ({
      queryKey: ['type', name],
      queryFn: ({ signal }: { signal: AbortSignal }) => getType(name, signal),
    })),
  })
  const ready = results.every((r) => r.isSuccess)
  // Clave estable: cambia solo cuando llega o se actualiza algún tipo.
  const dataKey = results.map((r) => r.dataUpdatedAt).join('|')
  const types = useMemo(
    () => results.map((r) => r.data).filter((d): d is PokemonType => Boolean(d)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dataKey resume los cambios de results
    [dataKey],
  )
  const matrix = useMemo(() => (ready ? buildTypeMatrix(types) : null), [ready, types])
  return { matrix, types }
}

export function useAbilityQuery(name: string | undefined) {
  return useQuery({
    queryKey: ['ability', name],
    queryFn: ({ signal }) => getAbility(name as string, signal),
    enabled: Boolean(name),
  })
}

export function useMoveQuery(name: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['move', name],
    queryFn: ({ signal }) => getMove(name as string, signal),
    enabled: Boolean(name) && enabled,
  })
}

export function useItemQuery(name: string | undefined) {
  return useQuery({
    queryKey: ['item', name],
    queryFn: ({ signal }) => getItem(name as string, signal),
    enabled: Boolean(name),
  })
}

export function useResourceListQuery(resource: string, limit: number) {
  return useQuery({
    queryKey: ['list', resource, limit],
    queryFn: () => listResource(resource, limit) as Promise<ApiList>,
  })
}

export function usePokemonBatchQuery(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['pokemon', id],
      queryFn: ({ signal }: { signal: AbortSignal }) => getPokemon(id, signal),
    })),
  })
}

export function useNatureQueries(names: string[]) {
  return useQueries({
    queries: names.map((name) => ({
      queryKey: ['nature', name],
      queryFn: ({ signal }: { signal: AbortSignal }) => getNature(name, signal),
    })),
  })
}

export function useRegionQueries(names: string[]) {
  return useQueries({
    queries: names.map((name) => ({
      queryKey: ['region', name],
      queryFn: ({ signal }: { signal: AbortSignal }) => getRegion(name, signal),
    })),
  })
}

export function usePokedexDetailQueries(names: string[]) {
  return useQueries({
    queries: names.map((name) => ({
      queryKey: ['pokedex', name],
      queryFn: ({ signal }: { signal: AbortSignal }) => getPokedex(name, signal),
    })),
  })
}
