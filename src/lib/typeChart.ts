import type { PokemonType } from '../api/types'
import { TYPE_NAMES } from './labels'

/** attacker → defender → multiplicador de daño (0, 0.5, 1, 2) */
export type TypeMatrix = Record<string, Record<string, number>>

/** Construye la tabla de efectividad completa a partir de los 18 tipos de la API. */
export function buildTypeMatrix(types: PokemonType[]): TypeMatrix {
  const matrix: TypeMatrix = {}
  for (const attacker of TYPE_NAMES) {
    matrix[attacker] = {}
    for (const defender of TYPE_NAMES) matrix[attacker][defender] = 1
  }
  for (const type of types) {
    if (!matrix[type.name]) continue
    const rel = type.damage_relations
    for (const t of rel.double_damage_to) if (matrix[type.name][t.name] !== undefined) matrix[type.name][t.name] = 2
    for (const t of rel.half_damage_to) if (matrix[type.name][t.name] !== undefined) matrix[type.name][t.name] = 0.5
    for (const t of rel.no_damage_to) if (matrix[type.name][t.name] !== undefined) matrix[type.name][t.name] = 0
  }
  return matrix
}

/** Multiplicador total que recibe un Pokémon de un tipo atacante. */
export function effectivenessOn(attacker: string, defenderTypes: string[], matrix: TypeMatrix): number {
  return defenderTypes.reduce((mult, defender) => mult * (matrix[attacker]?.[defender] ?? 1), 1)
}

/** Perfil defensivo: para cada tipo atacante, cuánto daño recibe el Pokémon. */
export function defensiveProfile(defenderTypes: string[], matrix: TypeMatrix): Record<string, number> {
  const profile: Record<string, number> = {}
  for (const attacker of TYPE_NAMES) profile[attacker] = effectivenessOn(attacker, defenderTypes, matrix)
  return profile
}

export function groupByMultiplier(profile: Record<string, number>): Array<{ multiplier: number; types: string[] }> {
  const order = [4, 2, 1, 0.5, 0.25, 0]
  return order
    .map((multiplier) => ({
      multiplier,
      types: Object.entries(profile)
        .filter(([, value]) => value === multiplier)
        .map(([type]) => type),
    }))
    .filter((group) => group.types.length > 0)
}

export function formatMultiplier(value: number): string {
  if (value === 0) return '0×'
  return `${value.toString().replace('.', ',')}×`
}

/** Color de una celda según el multiplicador (rojo = muy débil, azul = resistente, gris = inmune). */
export function multiplierColor(value: number): string {
  if (value === 0) return '#64748b'
  if (value >= 4) return '#ef4444'
  if (value >= 2) return '#fb923c'
  if (value === 1) return '#e2e8f0'
  if (value <= 0.25) return '#22d3ee'
  return '#4ade80'
}

/** Color de una estadística base según su valor. */
export function statColor(value: number): string {
  if (value >= 150) return '#22d3ee'
  if (value >= 100) return '#4ade80'
  if (value >= 70) return '#facc15'
  if (value >= 45) return '#fb923c'
  return '#f87171'
}
