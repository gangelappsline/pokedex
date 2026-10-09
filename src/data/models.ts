// Modelos compactos que la app guarda en caché (IndexedDB).
// Son un subconjunto normalizado de las respuestas de PokéAPI, pensado para filtrar en memoria.

export interface Stats {
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
  total: number
}

export type StatKey = keyof Stats

export interface PokemonRecord {
  id: number
  name: string
  speciesId: number
  isDefault: boolean
  order: number
  types: string[]
  stats: Stats
  /** metros */
  height: number
  /** kilogramos */
  weight: number
  baseExperience: number | null
  abilities: { name: string; hidden: boolean; slot: number }[]
  /** slugs de todos los movimientos que puede aprender (cualquier método / versión) */
  moves: string[]
}

export interface SpeciesRecord {
  id: number
  name: string
  displayName: string
  genus: string
  generation: number
  color: string
  shape: string | null
  habitat: string | null
  eggGroups: string[]
  growthRate: string
  isBaby: boolean
  isLegendary: boolean
  isMythical: boolean
  captureRate: number
  baseHappiness: number | null
  /** -1 sin género; 0 solo macho; 8 solo hembra; resto = octavos de hembra */
  genderRate: number
  hatchCounter: number | null
  hasGenderDifferences: boolean
  formsSwitchable: boolean
  pokedexes: { name: string; entry: number }[]
  /** nombre de la especie de la que evoluciona (null si es básica) */
  evolvesFrom: string | null
  evolutionChainId: number | null
  /** nombres de todas las variedades (incluye la por defecto) */
  varieties: string[]
  flavorText: string
}

export type EvolutionStage = 'single' | 'base' | 'middle' | 'final'

export interface PokemonEntry extends PokemonRecord {
  displayName: string
  species: SpeciesRecord
  /** true si alguna especie evoluciona a partir de esta */
  hasEvolutions: boolean
  /** single = no evoluciona ni evolucionó; base = inicial; middle = intermedia; final = última etapa */
  evolutionStage: EvolutionStage
}

export interface MoveRecord {
  id: number
  name: string
  displayName: string
  type: string
  damageClass: string | null
  power: number | null
  accuracy: number | null
  pp: number | null
  priority: number
  target: string | null
  ailment: string | null
  category: string | null
  effect: string
  generation: number
  learnedByCount: number
  critRate: number
  drain: number
  healing: number
  flinchChance: number
  ailmentChance: number
  statChance: number
  minHits: number | null
  maxHits: number | null
}
