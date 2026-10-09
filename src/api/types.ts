// Tipos TypeScript que reflejan la documentación de PokéAPI v2
// https://pokeapi.co/docs/v2

export interface NamedAPIResource {
  name: string
  url: string
}

export interface APIResource {
  url: string
}

export interface LocalizedName {
  name: string
  language: NamedAPIResource
}

export interface ApiList<T = NamedAPIResource> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface VerboseEffect {
  effect: string
  short_effect: string
  language: NamedAPIResource
}

export interface FlavorText {
  flavor_text: string
  language: NamedAPIResource
  version?: NamedAPIResource
  version_group?: NamedAPIResource
}

export interface GenerationGameIndex {
  game_index: number
  generation: NamedAPIResource
}

// ---------- Pokémon ----------

export interface PokemonAbilityEntry {
  is_hidden: boolean
  slot: number
  ability: NamedAPIResource
}

export interface PokemonTypeEntry {
  slot: number
  type: NamedAPIResource
}

export interface PokemonStatEntry {
  base_stat: number
  effort: number
  stat: NamedAPIResource
}

export interface PokemonMoveVersionDetail {
  level_learned_at: number
  version_group: NamedAPIResource
  move_learn_method: NamedAPIResource
  order: number | null
}

export interface PokemonMoveEntry {
  move: NamedAPIResource
  version_group_details: PokemonMoveVersionDetail[]
}

export interface SpriteSet {
  front_default?: string | null
  front_shiny?: string | null
  front_female?: string | null
  front_shiny_female?: string | null
  back_default?: string | null
  back_shiny?: string | null
  back_female?: string | null
  back_shiny_female?: string | null
}

export interface PokemonSprites extends SpriteSet {
  other?: {
    dream_world?: { front_default?: string | null; front_female?: string | null }
    home?: SpriteSet
    'official-artwork'?: { front_default?: string | null; front_shiny?: string | null }
    showdown?: SpriteSet
  }
}

export interface Pokemon {
  id: number
  name: string
  base_experience: number | null
  height: number // decímetros
  weight: number // hectogramos
  is_default: boolean
  order: number
  abilities: PokemonAbilityEntry[]
  forms: NamedAPIResource[]
  game_indices: { game_index: number; version: NamedAPIResource }[]
  held_items: {
    item: NamedAPIResource
    version_details: { rarity: number; version: NamedAPIResource }[]
  }[]
  location_area_encounters: string
  moves: PokemonMoveEntry[]
  past_types: { generation: NamedAPIResource; types: PokemonTypeEntry[] }[]
  past_abilities: {
    generation: NamedAPIResource
    abilities: { is_hidden: boolean; slot: number; ability: NamedAPIResource | null }[]
  }[]
  sprites: PokemonSprites
  cries: { latest: string | null; legacy: string | null }
  species: NamedAPIResource
  stats: PokemonStatEntry[]
  types: PokemonTypeEntry[]
}

export interface PokemonSpeciesVariety {
  is_default: boolean
  pokemon: NamedAPIResource
}

export interface PokemonSpecies {
  id: number
  name: string
  order: number
  gender_rate: number
  capture_rate: number
  base_happiness: number | null
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  hatch_counter: number | null
  has_gender_differences: boolean
  forms_switchable: boolean
  growth_rate: NamedAPIResource
  pokedex_numbers: { entry_number: number; pokedex: NamedAPIResource }[]
  egg_groups: NamedAPIResource[]
  color: NamedAPIResource
  shape: NamedAPIResource | null
  evolves_from_species: NamedAPIResource | null
  evolution_chain: APIResource | null
  habitat: NamedAPIResource | null
  generation: NamedAPIResource
  names: LocalizedName[]
  flavor_text_entries: FlavorText[]
  form_descriptions: { description: string; language: NamedAPIResource }[]
  genera: { genus: string; language: NamedAPIResource }[]
  varieties: PokemonSpeciesVariety[]
}

export interface PokemonForm {
  id: number
  name: string
  order: number
  form_order: number
  is_default: boolean
  is_battle_only: boolean
  is_mega: boolean
  form_name: string
  pokemon: NamedAPIResource
  types: PokemonTypeEntry[]
  sprites: SpriteSet
  version_group: NamedAPIResource
  names: LocalizedName[]
  form_names: LocalizedName[]
}

export interface LocationAreaEncounter {
  location_area: NamedAPIResource
  version_details: {
    version: NamedAPIResource
    max_chance: number
    encounter_details: {
      min_level: number
      max_level: number
      condition_values: NamedAPIResource[]
      chance: number
      method: NamedAPIResource
    }[]
  }[]
}

// ---------- Evoluciones ----------

export interface EvolutionDetail {
  item: NamedAPIResource | null
  trigger: NamedAPIResource
  gender: number | null
  held_item: NamedAPIResource | null
  known_move: NamedAPIResource | null
  known_move_type: NamedAPIResource | null
  location: NamedAPIResource | null
  min_level: number | null
  min_happiness: number | null
  min_beauty: number | null
  min_affection: number | null
  needs_overworld_rain: boolean
  party_species: NamedAPIResource | null
  party_type: NamedAPIResource | null
  relative_physical_stats: number | null
  time_of_day: string
  trade_species: NamedAPIResource | null
  turn_upside_down: boolean
  min_steps?: number | null
  min_damage_taken?: number | null
  min_move_count?: number | null
  needs_multiplayer?: boolean
  near_special_rock?: boolean
  region?: NamedAPIResource | null
  used_move?: NamedAPIResource | null
}

export interface ChainLink {
  is_baby: boolean
  species: NamedAPIResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export interface EvolutionChain {
  id: number
  baby_trigger_item: NamedAPIResource | null
  chain: ChainLink
}

// ---------- Tipos ----------

export interface TypeRelations {
  no_damage_to: NamedAPIResource[]
  half_damage_to: NamedAPIResource[]
  double_damage_to: NamedAPIResource[]
  no_damage_from: NamedAPIResource[]
  half_damage_from: NamedAPIResource[]
  double_damage_from: NamedAPIResource[]
}

export interface PokemonType {
  id: number
  name: string
  damage_relations: TypeRelations
  names: LocalizedName[]
  pokemon: { slot: number; pokemon: NamedAPIResource }[]
  moves: NamedAPIResource[]
  move_damage_class: NamedAPIResource | null
  generation: NamedAPIResource
}

// ---------- Habilidades ----------

export interface Ability {
  id: number
  name: string
  is_main_series: boolean
  generation: NamedAPIResource
  names: LocalizedName[]
  effect_entries: VerboseEffect[]
  flavor_text_entries: FlavorText[]
  pokemon: { is_hidden: boolean; slot: number; pokemon: NamedAPIResource }[]
}

// ---------- Movimientos ----------

export interface MoveMeta {
  ailment: NamedAPIResource | null
  category: NamedAPIResource | null
  min_hits: number | null
  max_hits: number | null
  min_turns: number | null
  max_turns: number | null
  drain: number
  healing: number
  crit_rate: number
  ailment_chance: number
  flinch_chance: number
  stat_chance: number
}

export interface Move {
  id: number
  name: string
  accuracy: number | null
  effect_chance: number | null
  pp: number | null
  priority: number
  power: number | null
  type: NamedAPIResource
  damage_class: NamedAPIResource
  target: NamedAPIResource
  generation: NamedAPIResource
  meta: MoveMeta | null
  names: LocalizedName[]
  effect_entries: VerboseEffect[]
  flavor_text_entries: FlavorText[]
  learned_by_pokemon: NamedAPIResource[]
  contest_type: NamedAPIResource | null
  stat_changes: { change: number; stat: NamedAPIResource }[]
}

// ---------- Objetos ----------

export interface Item {
  id: number
  name: string
  cost?: number
  fling_power: number | null
  fling_effect: NamedAPIResource | null
  attributes: NamedAPIResource[]
  category: NamedAPIResource
  effect_entries: VerboseEffect[]
  flavor_text_entries: { text: string; language: NamedAPIResource; version_group: NamedAPIResource }[]
  game_indices: GenerationGameIndex[]
  names: LocalizedName[]
  sprites: { default: string | null }
  held_by_pokemon: {
    pokemon: NamedAPIResource
    version_details: { rarity: number; version: NamedAPIResource }[]
  }[]
  prices?: { currency: NamedAPIResource; purchase_price: number | null; sell_price: number | null; version_group: NamedAPIResource }[]
}

// ---------- Naturalezas ----------

export interface Nature {
  id: number
  name: string
  decreased_stat: NamedAPIResource | null
  increased_stat: NamedAPIResource | null
  hates_flavor: NamedAPIResource | null
  likes_flavor: NamedAPIResource | null
  names: LocalizedName[]
  pokeathlon_stat_changes: { max_change: number; pokeathlon_stat: NamedAPIResource }[]
  move_battle_style_preferences: {
    low_hp_preference: number
    high_hp_preference: number
    move_battle_style: NamedAPIResource
  }[]
}

// ---------- Regiones / Generaciones / Pokédex ----------

export interface Region {
  id: number
  name: string
  locations: NamedAPIResource[]
  names: LocalizedName[]
  /** null en regiones sin generación principal (Hisui, Orre...). */
  main_generation: NamedAPIResource | null
  pokedexes: NamedAPIResource[]
  version_groups: NamedAPIResource[]
}

export interface Pokedex {
  id: number
  name: string
  is_main_series: boolean
  descriptions: { description: string; language: NamedAPIResource }[]
  names: LocalizedName[]
  pokemon_entries: { entry_number: number; pokemon_species: NamedAPIResource }[]
  region: NamedAPIResource | null
  version_groups: NamedAPIResource[]
}

export interface Generation {
  id: number
  name: string
  abilities: NamedAPIResource[]
  names: LocalizedName[]
  main_region: NamedAPIResource
  moves: NamedAPIResource[]
  pokemon_species: NamedAPIResource[]
  types: NamedAPIResource[]
  version_groups: NamedAPIResource[]
}
