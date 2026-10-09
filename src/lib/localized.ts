import type { FlavorText, LocalizedName, VerboseEffect } from '../api/types'
import { cleanText, formatSlug } from './utils'

export const LANG = 'es'
const FALLBACK_LANG = 'en'

/** Devuelve el nombre traducido: español → inglés → slug formateado. */
export function pickName(names: LocalizedName[] | undefined, fallbackSlug: string): string {
  if (!names?.length) return formatSlug(fallbackSlug)
  const es = names.find((n) => n.language.name === LANG)
  if (es) return es.name
  const en = names.find((n) => n.language.name === FALLBACK_LANG)
  return en?.name ?? formatSlug(fallbackSlug)
}

/** Texto de descripción en español (o inglés) tomando la última entrada disponible. */
export function pickFlavor(entries: FlavorText[] | undefined): string {
  if (!entries?.length) return ''
  const es = entries.filter((e) => e.language.name === LANG)
  const en = entries.filter((e) => e.language.name === FALLBACK_LANG)
  const pool = es.length ? es : en
  if (!pool.length) return ''
  return cleanText(pool[pool.length - 1].flavor_text)
}

/** Efecto detallado (preferencia: español, luego inglés). */
export function pickEffect(entries: VerboseEffect[] | undefined): { effect: string; short: string } {
  if (!entries?.length) return { effect: '', short: '' }
  const found =
    entries.find((e) => e.language.name === LANG) ?? entries.find((e) => e.language.name === FALLBACK_LANG)
  if (!found) return { effect: '', short: '' }
  return { effect: cleanText(found.effect), short: cleanText(found.short_effect) }
}

export function pickGenus(genera: { genus: string; language: { name: string } }[] | undefined): string {
  if (!genera?.length) return ''
  return (
    genera.find((g) => g.language.name === LANG)?.genus ??
    genera.find((g) => g.language.name === FALLBACK_LANG)?.genus ??
    ''
  )
}

/**
 * Nombre visible de un Pokémon. Las formas alternativas añaden su sufijo:
 * "Charizard" → base; "charizard-mega-x" → "Charizard (Mega X)".
 */
export function formatPokemonDisplayName(pokemonName: string, speciesName: string, speciesDisplayName: string): string {
  if (pokemonName === speciesName) return speciesDisplayName
  if (pokemonName.startsWith(`${speciesName}-`)) {
    const suffix = pokemonName.slice(speciesName.length + 1)
    return `${speciesDisplayName} (${formatSlug(suffix)})`
  }
  return formatSlug(pokemonName)
}
