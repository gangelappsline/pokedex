import { describe, expect, it } from 'vitest'
import type { PokemonEntry, SpeciesRecord } from '../data/models'
import { TYPE_NAMES } from '../lib/labels'
import type { TypeMatrix } from '../lib/typeChart'
import {
  applyFilters,
  DEFAULT_FILTERS,
  filtersFromSearchParams,
  filtersToSearchParams,
  makeFilters,
  sortEntries,
  type PokedexFilters,
} from './pokedexFilters'

function species(o: Partial<SpeciesRecord> = {}): SpeciesRecord {
  return {
    id: 1,
    name: 'bulbasaur',
    displayName: 'Bulbasaur',
    genus: 'Semilla',
    generation: 1,
    color: 'green',
    shape: 'quadruped',
    habitat: 'grassland',
    eggGroups: ['monster'],
    growthRate: 'medium-slow',
    isBaby: false,
    isLegendary: false,
    isMythical: false,
    captureRate: 45,
    baseHappiness: 70,
    genderRate: 1,
    hatchCounter: 20,
    hasGenderDifferences: false,
    formsSwitchable: false,
    pokedexes: [{ name: 'kanto', entry: 1 }],
    evolvesFrom: null,
    evolutionChainId: 1,
    varieties: ['bulbasaur'],
    flavorText: '',
    ...o,
  }
}

function entry(o: Partial<PokemonEntry> = {}): PokemonEntry {
  const sp = species(o.species)
  return {
    id: 1,
    name: 'bulbasaur',
    speciesId: 1,
    isDefault: true,
    order: 1,
    types: ['grass', 'poison'],
    stats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45, total: 318 },
    height: 7,
    weight: 69,
    baseExperience: 64,
    abilities: [{ name: 'overgrow', hidden: false, slot: 1 }],
    moves: ['tackle', 'razor-leaf'],
    displayName: 'Bulbasaur',
    hasEvolutions: true,
    evolutionStage: 'base',
    ...o,
    species: sp,
  }
}

const bulbasaur = entry()
const charmander = entry({
  id: 4,
  name: 'charmander',
  displayName: 'Charmander',
  types: ['fire'],
  stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65, total: 309 },
  height: 6,
  weight: 85,
  baseExperience: 62,
  abilities: [{ name: 'blaze', hidden: false, slot: 1 }, { name: 'solar-power', hidden: true, slot: 3 }],
  moves: ['ember'],
  evolutionStage: 'base',
  species: species({ id: 4, name: 'charmander', displayName: 'Charmander', color: 'red', generation: 1, habitat: 'mountain', genderRate: 1, pokedexes: [{ name: 'kanto', entry: 4 }] }),
})
const mewtwo = entry({
  id: 150,
  name: 'mewtwo',
  displayName: 'Mewtwo',
  types: ['psychic'],
  stats: { hp: 106, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130, total: 680 },
  height: 20,
  weight: 1220,
  baseExperience: 340,
  abilities: [{ name: 'pressure', hidden: false, slot: 1 }],
  moves: ['psychic'],
  evolutionStage: 'single',
  species: species({ id: 150, name: 'mewtwo', displayName: 'Mewtwo', generation: 1, isLegendary: true, genderRate: -1, color: 'purple', pokedexes: [{ name: 'kanto', entry: 150 }] }),
})
const ENTRIES = [bulbasaur, charmander, mewtwo]
const ids = (list: PokemonEntry[]) => list.map((e) => e.name)

// Matriz mínima: solo fuego → planta es ×2 y agua → fuego es ×2; el resto es ×1.
function miniMatrix(): TypeMatrix {
  const m: TypeMatrix = {}
  for (const a of TYPE_NAMES) {
    m[a] = {}
    for (const d of TYPE_NAMES) m[a][d] = 1
  }
  m.fire.grass = 2
  m.water.fire = 2
  return m
}

describe('applyFilters', () => {
  it('sin filtros devuelve todo', () => {
    expect(ids(applyFilters(ENTRIES, DEFAULT_FILTERS))).toEqual(['bulbasaur', 'charmander', 'mewtwo'])
  })

  it('filtra por tipo (cualquiera)', () => {
    expect(ids(applyFilters(ENTRIES, makeFilters({ types: ['grass'] })))).toEqual(['bulbasaur'])
  })

  it('filtra por varios tipos a la vez con coincidencia exacta', () => {
    const f = makeFilters({ types: ['grass', 'poison'], typeMatch: 'exact' })
    expect(ids(applyFilters(ENTRIES, f))).toEqual(['bulbasaur'])
    const g = makeFilters({ types: ['grass', 'fire'], typeMatch: 'all' })
    expect(ids(applyFilters(ENTRIES, g))).toEqual([])
  })

  it('filtra por generación y legendarios', () => {
    expect(ids(applyFilters(ENTRIES, makeFilters({ generations: [2] })))).toEqual([])
    expect(ids(applyFilters(ENTRIES, makeFilters({ legendary: 'yes' })))).toEqual(['mewtwo'])
    expect(ids(applyFilters(ENTRIES, makeFilters({ legendary: 'no' })))).toEqual(['bulbasaur', 'charmander'])
  })

  it('filtra por rango de estadística (velocidad ≥ 50)', () => {
    expect(ids(applyFilters(ENTRIES, makeFilters({ stats: { speed: { min: 50 } } })))).toEqual(['charmander', 'mewtwo'])
  })

  it('filtra por habilidad y modo de habilidad oculta', () => {
    expect(ids(applyFilters(ENTRIES, makeFilters({ ability: 'solar-power', abilityMode: 'hidden' })))).toEqual(['charmander'])
    expect(ids(applyFilters(ENTRIES, makeFilters({ ability: 'blaze', abilityMode: 'hidden' })))).toEqual([])
    expect(ids(applyFilters(ENTRIES, makeFilters({ ability: 'blaze', abilityMode: 'normal' })))).toEqual(['charmander'])
  })

  it('filtra por movimiento aprendible', () => {
    expect(ids(applyFilters(ENTRIES, makeFilters({ move: 'ember' })))).toEqual(['charmander'])
  })

  it('filtra por debilidad: los que reciben ×2 de fuego', () => {
    const f = makeFilters({ weaknesses: [{ type: 'fire', level: 'weak' }] })
    expect(ids(applyFilters(ENTRIES, f, miniMatrix()))).toEqual(['bulbasaur'])
  })

  it('ignora las debilidades si aún no hay matriz de tipos', () => {
    const f = makeFilters({ weaknesses: [{ type: 'fire', level: 'weak' }] })
    expect(ids(applyFilters(ENTRIES, f, null))).toEqual(['bulbasaur', 'charmander', 'mewtwo'])
  })

  it('búsqueda por texto sobre el nombre', () => {
    expect(ids(applyFilters(ENTRIES, makeFilters({ query: 'char' })))).toEqual(['charmander'])
  })
})

describe('sortEntries', () => {
  it('ordena por total de estadísticas descendente', () => {
    expect(ids(sortEntries(ENTRIES, 'total', 'desc'))).toEqual(['mewtwo', 'bulbasaur', 'charmander'])
  })

  it('ordena por número ascendente', () => {
    expect(ids(sortEntries(ENTRIES, 'number', 'asc'))).toEqual(['bulbasaur', 'charmander', 'mewtwo'])
  })
})

describe('URL de filtros', () => {
  const rich: PokedexFilters = makeFilters({
    query: 'bul',
    types: ['grass', 'poison'],
    typeMatch: 'exact',
    generations: [1, 3],
    pokedexes: ['kanto'],
    legendary: 'no',
    evolutionStage: 'base',
    gender: 'mixed',
    formType: 'all',
    stats: { speed: { min: 50, max: 120 }, attack: { min: 40 } },
    height: { min: 1 },
    ability: 'overgrow',
    abilityMode: 'normal',
    move: 'razor-leaf',
    weaknesses: [{ type: 'fire', level: 'very-weak' }],
    sort: 'speed',
    order: 'desc',
  })

  it('ida y vuelta: filtros → URL → filtros conserva todo', () => {
    const search = filtersToSearchParams(rich).toString()
    const back = filtersFromSearchParams(new URLSearchParams(search))
    expect(back).toEqual(rich)
  })

  it('los filtros por defecto generan una URL vacía', () => {
    expect(filtersToSearchParams(DEFAULT_FILTERS).toString()).toBe('')
  })

  it('ignora valores inválidos en la URL', () => {
    const back = filtersFromSearchParams(new URLSearchParams('gen=99,abc,2&legendary=maybe&sort=foo'))
    expect(back.generations).toEqual([2])
    expect(back.legendary).toBe('any')
    expect(back.sort).toBe('number')
  })
})
