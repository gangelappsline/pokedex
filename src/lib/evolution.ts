import type { ChainLink, EvolutionDetail } from '../api/types'
import { TYPE_LABELS, typeLabel } from './labels'
import { formatSlug } from './utils'

export const TRIGGER_LABELS: Record<string, string> = {
  'level-up': 'Subir de nivel',
  trade: 'Intercambio',
  'use-item': 'Usar objeto',
  shed: 'Cuerpo extra',
  spin: 'Girar',
  'tower-of-darkness': 'Torre de la Oscuridad',
  'tower-of-waters': 'Torre de las Aguas',
  'three-critical-hits': 'Tres golpes críticos',
  'take-damage': 'Recibir daño',
  other: 'Otro',
  'agile-style-move': 'Movimiento de estilo ágil',
  'strong-style-move': 'Movimiento de estilo fuerte',
  'recoil-damage': 'Daño de retroceso',
}

const TIME_LABELS: Record<string, string> = {
  day: 'De día',
  night: 'De noche',
  dusk: 'Al atardecer',
  'full-moon': 'Con luna llena',
}

const RELATIVE_STATS: Record<number, string> = {
  1: 'Ataque > Defensa',
  0: 'Ataque = Defensa',
  '-1': 'Ataque < Defensa',
}

/** Convierte los detalles de evolución de PokéAPI en frases en español. */
export function describeEvolutionDetail(d: EvolutionDetail): string[] {
  const parts: string[] = []
  const trigger = d.trigger?.name ?? ''

  if (trigger && trigger !== 'level-up') parts.push(TRIGGER_LABELS[trigger] ?? formatSlug(trigger))
  if (d.min_level) parts.push(`Nivel ${d.min_level}`)
  if (trigger === 'trade' && d.trade_species) parts.push(`Intercambio por ${formatSlug(d.trade_species.name)}`)
  if (d.item) parts.push(`Objeto: ${formatSlug(d.item.name)}`)
  if (d.held_item) parts.push(`Sostiene: ${formatSlug(d.held_item.name)}`)
  if (d.known_move) parts.push(`Conoce ${formatSlug(d.known_move.name)}`)
  if (d.known_move_type) parts.push(`Conoce un movimiento de tipo ${TYPE_LABELS[d.known_move_type.name] ?? formatSlug(d.known_move_type.name)}`)
  if (d.used_move) parts.push(`Usa ${formatSlug(d.used_move.name)}`)
  if (d.min_happiness) parts.push(`Felicidad ≥ ${d.min_happiness}`)
  if (d.min_beauty) parts.push(`Belleza ≥ ${d.min_beauty}`)
  if (d.min_affection) parts.push(`Afecto ≥ ${d.min_affection}`)
  if (d.time_of_day && TIME_LABELS[d.time_of_day]) parts.push(TIME_LABELS[d.time_of_day])
  if (d.location) parts.push(`En ${formatSlug(d.location.name)}`)
  if (d.needs_overworld_rain) parts.push('Con lluvia')
  if (d.party_species) parts.push(`Con ${formatSlug(d.party_species.name)} en el equipo`)
  if (d.party_type) parts.push(`Con un Pokémon de tipo ${typeLabel(d.party_type.name)} en el equipo`)
  if (d.relative_physical_stats !== null && d.relative_physical_stats !== undefined) {
    parts.push(RELATIVE_STATS[d.relative_physical_stats] ?? 'Estadísticas relativas')
  }
  if (d.gender === 1) parts.push('Hembra')
  if (d.gender === 2) parts.push('Macho')
  if (d.turn_upside_down) parts.push('Consola boca abajo')
  if (d.min_steps) parts.push(`Caminar ${d.min_steps} pasos`)
  if (d.min_damage_taken) parts.push(`Recibir ${d.min_damage_taken} de daño`)
  if (d.min_move_count) parts.push(`Usar el movimiento ${d.min_move_count} veces`)
  if (d.needs_multiplayer) parts.push('Con multijugador')
  if (d.near_special_rock) parts.push('Cerca de una roca especial')

  return parts
}

/** Aplana la cadena evolutiva en etapas (útil para tests y listados). */
export function flattenChain(link: ChainLink): ChainLink[] {
  return [link, ...link.evolves_to.flatMap(flattenChain)]
}
