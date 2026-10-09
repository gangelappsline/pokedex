// Motor de filtros de la Pokédex. Funciones puras: fáciles de probar y de reutilizar.
// El estado completo de los filtros se serializa en la URL, así cualquier búsqueda es compartible.

import type { PokemonEntry, StatKey } from '../data/models'
import { effectivenessOn, type TypeMatrix } from '../lib/typeChart'
import { normalizeText } from '../lib/utils'

export type TriState = 'any' | 'yes' | 'no'
export type EvolutionFilter = 'any' | 'single' | 'base' | 'middle' | 'final'
export type GenderFilter = 'any' | 'genderless' | 'male-only' | 'female-only' | 'mixed'
export type FormFilter = 'default' | 'all' | 'alternate'
export type TypeMatch = 'any' | 'all' | 'exact'
export type AbilityMode = 'any' | 'normal' | 'hidden'
export type WeaknessLevel = 'weak' | 'very-weak' | 'resist' | 'very-resist' | 'immune'
export type SortOrder = 'asc' | 'desc'

export type SortKey =
  | 'number'
  | 'name'
  | 'total'
  | 'hp'
  | 'attack'
  | 'defense'
  | 'spAttack'
  | 'spDefense'
  | 'speed'
  | 'height'
  | 'weight'
  | 'baseExperience'
  | 'captureRate'
  | 'happiness'

export interface NumRange {
  min?: number
  max?: number
}

export interface WeaknessRule {
  type: string
  level: WeaknessLevel
}

export interface PokedexFilters {
  query: string
  types: string[]
  typeMatch: TypeMatch
  generations: number[]
  pokedexes: string[]
  colors: string[]
  shapes: string[]
  habitats: string[]
  eggGroups: string[]
  growthRates: string[]
  legendary: TriState
  mythical: TriState
  baby: TriState
  evolutionStage: EvolutionFilter
  hasForms: TriState
  gender: GenderFilter
  formType: FormFilter
  stats: Partial<Record<StatKey, NumRange>>
  height: NumRange
  weight: NumRange
  baseExperience: NumRange
  captureRate: NumRange
  baseHappiness: NumRange
  ability: string
  abilityMode: AbilityMode
  move: string
  weaknesses: WeaknessRule[]
  sort: SortKey
  order: SortOrder
}

export const DEFAULT_FILTERS: PokedexFilters = {
  query: '',
  types: [],
  typeMatch: 'any',
  generations: [],
  pokedexes: [],
  colors: [],
  shapes: [],
  habitats: [],
  eggGroups: [],
  growthRates: [],
  legendary: 'any',
  mythical: 'any',
  baby: 'any',
  evolutionStage: 'any',
  hasForms: 'any',
  gender: 'any',
  formType: 'default',
  stats: {},
  height: {},
  weight: {},
  baseExperience: {},
  captureRate: {},
  baseHappiness: {},
  ability: '',
  abilityMode: 'any',
  move: '',
  weaknesses: [],
  sort: 'number',
  order: 'asc',
}

export const WEAKNESS_LEVEL_LABELS: Record<WeaknessLevel, string> = {
  weak: 'Débil (≥ 2×)',
  'very-weak': 'Muy débil (4×)',
  resist: 'Resistente (≤ 0,5×)',
  'very-resist': 'Muy resistente (≤ 0,25×)',
  immune: 'Inmune (0×)',
}

export function matchesWeaknessLevel(multiplier: number, level: WeaknessLevel): boolean {
  switch (level) {
    case 'weak':
      return multiplier >= 2
    case 'very-weak':
      return multiplier >= 4
    case 'resist':
      return multiplier > 0 && multiplier <= 0.5
    case 'very-resist':
      return multiplier > 0 && multiplier <= 0.25
    case 'immune':
      return multiplier === 0
  }
}

function matchesQuery(entry: PokemonEntry, query: string): boolean {
  const q = normalizeText(query)
  if (!q) return true
  // Búsqueda por número: "25", "#025"
  const numeric = q.replace(/^#/, '')
  if (/^\d+$/.test(numeric)) return entry.id === Number(numeric)
  return (
    normalizeText(entry.displayName).includes(q) ||
    entry.name.includes(q) ||
    normalizeText(entry.species.displayName).includes(q)
  )
}

function inRange(value: number | null | undefined, range: NumRange): boolean {
  if (range.min === undefined && range.max === undefined) return true
  if (value === null || value === undefined) return false
  if (range.min !== undefined && value < range.min) return false
  if (range.max !== undefined && value > range.max) return false
  return true
}

function matchesTri(value: boolean, filter: TriState): boolean {
  if (filter === 'any') return true
  return filter === 'yes' ? value : !value
}

function matchesGender(rate: number, filter: GenderFilter): boolean {
  switch (filter) {
    case 'any':
      return true
    case 'genderless':
      return rate === -1
    case 'male-only':
      return rate === 0
    case 'female-only':
      return rate === 8
    case 'mixed':
      return rate > 0 && rate < 8
  }
}

function matchesEvolution(entry: PokemonEntry, filter: EvolutionFilter): boolean {
  return filter === 'any' || entry.evolutionStage === filter
}

function matchesTypes(entry: PokemonEntry, filters: PokedexFilters): boolean {
  if (filters.types.length === 0) return true
  switch (filters.typeMatch) {
    case 'any':
      return filters.types.some((t) => entry.types.includes(t))
    case 'all':
      return filters.types.every((t) => entry.types.includes(t))
    case 'exact':
      return (
        entry.types.length === filters.types.length && filters.types.every((t) => entry.types.includes(t))
      )
  }
}

/** Aplica todos los filtros. `matrix` es opcional: sin él, los filtros de debilidad se ignoran. */
export function applyFilters(entries: PokemonEntry[], filters: PokedexFilters, matrix: TypeMatrix | null = null): PokemonEntry[] {
  const statFilters = Object.entries(filters.stats) as Array<[StatKey, NumRange]>
  const activeWeaknesses = matrix ? filters.weaknesses : []
  const abilityName = filters.ability
  const moveName = filters.move

  return entries.filter((entry) => {
    if (filters.formType === 'default' && !entry.isDefault) return false
    if (filters.formType === 'alternate' && entry.isDefault) return false
    if (!matchesQuery(entry, filters.query)) return false
    if (!matchesTypes(entry, filters)) return false

    const s = entry.species
    if (filters.generations.length && !filters.generations.includes(s.generation)) return false
    if (filters.pokedexes.length && !s.pokedexes.some((d) => filters.pokedexes.includes(d.name))) return false
    if (filters.colors.length && !filters.colors.includes(s.color)) return false
    if (filters.shapes.length && (!s.shape || !filters.shapes.includes(s.shape))) return false
    if (filters.habitats.length && (!s.habitat || !filters.habitats.includes(s.habitat))) return false
    if (filters.eggGroups.length && !s.eggGroups.some((g) => filters.eggGroups.includes(g))) return false
    if (filters.growthRates.length && !filters.growthRates.includes(s.growthRate)) return false

    if (!matchesTri(s.isLegendary, filters.legendary)) return false
    if (!matchesTri(s.isMythical, filters.mythical)) return false
    if (!matchesTri(s.isBaby, filters.baby)) return false
    if (!matchesTri(s.varieties.length > 1, filters.hasForms)) return false
    if (!matchesEvolution(entry, filters.evolutionStage)) return false
    if (!matchesGender(s.genderRate, filters.gender)) return false

    for (const [key, range] of statFilters) {
      if (!inRange(entry.stats[key], range)) return false
    }
    if (!inRange(entry.height, filters.height)) return false
    if (!inRange(entry.weight, filters.weight)) return false
    if (!inRange(entry.baseExperience, filters.baseExperience)) return false
    if (!inRange(s.captureRate, filters.captureRate)) return false
    if (!inRange(s.baseHappiness, filters.baseHappiness)) return false

    if (abilityName) {
      const match = entry.abilities.find((a) => a.name === abilityName)
      if (!match) return false
      if (filters.abilityMode === 'normal' && match.hidden) return false
      if (filters.abilityMode === 'hidden' && !match.hidden) return false
    }

    if (moveName && !entry.moves.includes(moveName)) return false

    for (const rule of activeWeaknesses) {
      const multiplier = effectivenessOn(rule.type, entry.types, matrix as TypeMatrix)
      if (!matchesWeaknessLevel(multiplier, rule.level)) return false
    }

    return true
  })
}

function sortValue(entry: PokemonEntry, key: SortKey): number | string {
  switch (key) {
    case 'number':
      return entry.id
    case 'name':
      return normalizeText(entry.displayName)
    case 'total':
      return entry.stats.total
    case 'hp':
      return entry.stats.hp
    case 'attack':
      return entry.stats.attack
    case 'defense':
      return entry.stats.defense
    case 'spAttack':
      return entry.stats.spAttack
    case 'spDefense':
      return entry.stats.spDefense
    case 'speed':
      return entry.stats.speed
    case 'height':
      return entry.height
    case 'weight':
      return entry.weight
    case 'baseExperience':
      return entry.baseExperience ?? -1
    case 'captureRate':
      return entry.species.captureRate
    case 'happiness':
      return entry.species.baseHappiness ?? -1
  }
}

export function sortEntries(entries: PokemonEntry[], key: SortKey, order: SortOrder): PokemonEntry[] {
  const direction = order === 'asc' ? 1 : -1
  return [...entries].sort((a, b) => {
    const va = sortValue(a, key)
    const vb = sortValue(b, key)
    let diff: number
    if (typeof va === 'string' && typeof vb === 'string') diff = va.localeCompare(vb, 'es')
    else diff = (va as number) - (vb as number)
    if (diff === 0) diff = a.id - b.id
    return diff * direction
  })
}

// ---------- Utilidades de estado ----------

export function countActiveFilters(f: PokedexFilters): number {
  let n = 0
  if (f.query) n++
  if (f.types.length) n++
  if (f.generations.length) n++
  if (f.pokedexes.length) n++
  if (f.colors.length) n++
  if (f.shapes.length) n++
  if (f.habitats.length) n++
  if (f.eggGroups.length) n++
  if (f.growthRates.length) n++
  if (f.legendary !== 'any') n++
  if (f.mythical !== 'any') n++
  if (f.baby !== 'any') n++
  if (f.hasForms !== 'any') n++
  if (f.evolutionStage !== 'any') n++
  if (f.gender !== 'any') n++
  if (f.formType !== 'default') n++
  n += Object.keys(f.stats).length
  if (f.height.min !== undefined || f.height.max !== undefined) n++
  if (f.weight.min !== undefined || f.weight.max !== undefined) n++
  if (f.baseExperience.min !== undefined || f.baseExperience.max !== undefined) n++
  if (f.captureRate.min !== undefined || f.captureRate.max !== undefined) n++
  if (f.baseHappiness.min !== undefined || f.baseHappiness.max !== undefined) n++
  if (f.ability) n++
  if (f.move) n++
  n += f.weaknesses.length
  return n
}

// ---------- Serialización a URL ----------

const STAT_PARAM: Record<StatKey, string> = {
  hp: 's_hp',
  attack: 's_atk',
  defense: 's_def',
  spAttack: 's_spa',
  spDefense: 's_spd',
  speed: 's_spe',
  total: 's_total',
}

const LIST_PARAMS = {
  types: 'types',
  generations: 'gen',
  pokedexes: 'dex',
  colors: 'color',
  shapes: 'shape',
  habitats: 'habitat',
  eggGroups: 'egg',
  growthRates: 'growth',
} as const

const TRI_PARAMS = {
  legendary: 'legendary',
  mythical: 'mythical',
  baby: 'baby',
  hasForms: 'forms',
} as const

function encodeRange(range: NumRange): string | null {
  if (range.min === undefined && range.max === undefined) return null
  return `${range.min ?? ''}-${range.max ?? ''}`
}

function decodeRange(value: string | null): NumRange {
  if (!value) return {}
  const [minRaw, maxRaw] = value.split('-')
  const min = minRaw !== undefined && minRaw !== '' ? Number(minRaw) : undefined
  const max = maxRaw !== undefined && maxRaw !== '' ? Number(maxRaw) : undefined
  const range: NumRange = {}
  if (min !== undefined && Number.isFinite(min)) range.min = min
  if (max !== undefined && Number.isFinite(max)) range.max = max
  return range
}

function splitList(value: string | null): string[] {
  return value ? value.split(',').map((v) => v.trim()).filter(Boolean) : []
}

export function filtersToSearchParams(f: PokedexFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (f.query) p.set('q', f.query)
  if (f.types.length) p.set(LIST_PARAMS.types, f.types.join(','))
  if (f.types.length && f.typeMatch !== 'any') p.set('tmatch', f.typeMatch)
  if (f.generations.length) p.set(LIST_PARAMS.generations, f.generations.join(','))
  if (f.pokedexes.length) p.set(LIST_PARAMS.pokedexes, f.pokedexes.join(','))
  if (f.colors.length) p.set(LIST_PARAMS.colors, f.colors.join(','))
  if (f.shapes.length) p.set(LIST_PARAMS.shapes, f.shapes.join(','))
  if (f.habitats.length) p.set(LIST_PARAMS.habitats, f.habitats.join(','))
  if (f.eggGroups.length) p.set(LIST_PARAMS.eggGroups, f.eggGroups.join(','))
  if (f.growthRates.length) p.set(LIST_PARAMS.growthRates, f.growthRates.join(','))
  for (const key of Object.keys(TRI_PARAMS) as Array<keyof typeof TRI_PARAMS>) {
    if (f[key] !== 'any') p.set(TRI_PARAMS[key], f[key])
  }
  if (f.evolutionStage !== 'any') p.set('stage', f.evolutionStage)
  if (f.gender !== 'any') p.set('gender', f.gender)
  if (f.formType !== 'default') p.set('form', f.formType)
  for (const [key, param] of Object.entries(STAT_PARAM) as Array<[StatKey, string]>) {
    const encoded = f.stats[key] ? encodeRange(f.stats[key]) : null
    if (encoded) p.set(param, encoded)
  }
  const ranges: Array<[keyof PokedexFilters, string]> = [
    ['height', 'h'],
    ['weight', 'w'],
    ['baseExperience', 'xp'],
    ['captureRate', 'cap'],
    ['baseHappiness', 'hap'],
  ]
  for (const [key, param] of ranges) {
    const encoded = encodeRange(f[key] as NumRange)
    if (encoded) p.set(param, encoded)
  }
  if (f.ability) p.set('ability', f.ability)
  if (f.ability && f.abilityMode !== 'any') p.set('amode', f.abilityMode)
  if (f.move) p.set('move', f.move)
  if (f.weaknesses.length) p.set('weak', f.weaknesses.map((w) => `${w.type}:${w.level}`).join(','))
  if (f.sort !== 'number') p.set('sort', f.sort)
  if (f.order !== 'asc') p.set('order', f.order)
  return p
}

const SORT_KEYS: SortKey[] = [
  'number',
  'name',
  'total',
  'hp',
  'attack',
  'defense',
  'spAttack',
  'spDefense',
  'speed',
  'height',
  'weight',
  'baseExperience',
  'captureRate',
  'happiness',
]

const TRI_VALUES: TriState[] = ['any', 'yes', 'no']
const WEAKNESS_LEVELS = Object.keys(WEAKNESS_LEVEL_LABELS) as WeaknessLevel[]

function pickEnum<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

export function filtersFromSearchParams(p: URLSearchParams): PokedexFilters {
  const stats: Partial<Record<StatKey, NumRange>> = {}
  for (const [key, param] of Object.entries(STAT_PARAM) as Array<[StatKey, string]>) {
    const range = decodeRange(p.get(param))
    if (range.min !== undefined || range.max !== undefined) stats[key] = range
  }

  const weaknesses: WeaknessRule[] = splitList(p.get('weak'))
    .map((item) => {
      const [type, level] = item.split(':')
      return { type, level: level as WeaknessLevel }
    })
    .filter((rule) => rule.type && WEAKNESS_LEVELS.includes(rule.level))

  const generations = splitList(p.get('gen'))
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 9)

  return {
    query: p.get('q') ?? '',
    types: splitList(p.get('types')),
    typeMatch: pickEnum(p.get('tmatch'), ['any', 'all', 'exact'] as const, 'any'),
    generations,
    pokedexes: splitList(p.get('dex')),
    colors: splitList(p.get('color')),
    shapes: splitList(p.get('shape')),
    habitats: splitList(p.get('habitat')),
    eggGroups: splitList(p.get('egg')),
    growthRates: splitList(p.get('growth')),
    legendary: pickEnum(p.get('legendary'), TRI_VALUES, 'any'),
    mythical: pickEnum(p.get('mythical'), TRI_VALUES, 'any'),
    baby: pickEnum(p.get('baby'), TRI_VALUES, 'any'),
    hasForms: pickEnum(p.get('forms'), TRI_VALUES, 'any'),
    evolutionStage: pickEnum(p.get('stage'), ['any', 'single', 'base', 'middle', 'final'] as const, 'any'),
    gender: pickEnum(p.get('gender'), ['any', 'genderless', 'male-only', 'female-only', 'mixed'] as const, 'any'),
    formType: pickEnum(p.get('form'), ['default', 'all', 'alternate'] as const, 'default'),
    stats,
    height: decodeRange(p.get('h')),
    weight: decodeRange(p.get('w')),
    baseExperience: decodeRange(p.get('xp')),
    captureRate: decodeRange(p.get('cap')),
    baseHappiness: decodeRange(p.get('hap')),
    ability: p.get('ability') ?? '',
    abilityMode: pickEnum(p.get('amode'), ['any', 'normal', 'hidden'] as const, 'any'),
    move: p.get('move') ?? '',
    weaknesses,
    sort: pickEnum(p.get('sort'), SORT_KEYS, 'number'),
    order: pickEnum(p.get('order'), ['asc', 'desc'] as const, 'asc'),
  }
}

/** Atajo para construir filtros desde un objeto parcial (útil desde enlaces de otras páginas). */
export function makeFilters(partial: Partial<PokedexFilters>): PokedexFilters {
  return { ...DEFAULT_FILTERS, ...partial }
}
