import { apiGet } from './client'
import type {
  Ability,
  ApiList,
  EvolutionChain,
  Generation,
  Item,
  LocationAreaEncounter,
  Move,
  Nature,
  NamedAPIResource,
  Pokedex,
  Pokemon,
  PokemonForm,
  PokemonSpecies,
  PokemonType,
  Region,
} from './types'

// Un único lugar para todos los endpoints que usa la app.
// Documentación: https://pokeapi.co/docs/v2

/** Lista paginada de recursos con nombre. `limit` alto para obtener el catálogo completo en una petición. */
export const listResource = (resource: string, limit: number) =>
  apiGet<ApiList>(`/${resource}?limit=${limit}`)

export const getPokemon = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<Pokemon>(`/pokemon/${idOrName}`, signal)

export const getPokemonForm = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<PokemonForm>(`/pokemon-form/${idOrName}`, signal)

export const getPokemonEncounters = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<LocationAreaEncounter[]>(`/pokemon/${idOrName}/encounters`, signal)

export const getSpecies = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<PokemonSpecies>(`/pokemon-species/${idOrName}`, signal)

export const getEvolutionChain = (id: number, signal?: AbortSignal) =>
  apiGet<EvolutionChain>(`/evolution-chain/${id}`, signal)

export const getType = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<PokemonType>(`/type/${idOrName}`, signal)

export const getAbility = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<Ability>(`/ability/${idOrName}`, signal)

export const getMove = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<Move>(`/move/${idOrName}`, signal)

export const getItem = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<Item>(`/item/${idOrName}`, signal)

export const getNature = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<Nature>(`/nature/${idOrName}`, signal)

export const getRegion = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<Region>(`/region/${idOrName}`, signal)

export const getPokedex = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<Pokedex>(`/pokedex/${idOrName}`, signal)

export const getGeneration = (idOrName: string | number, signal?: AbortSignal) =>
  apiGet<Generation>(`/generation/${idOrName}`, signal)

export type { NamedAPIResource }
