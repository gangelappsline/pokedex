export const SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** "special-attack" → "Special Attack" (fallback cuando no hay traducción). */
export function formatSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Quita acentos y pasa a minúsculas para comparar textos. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function padId(id: number): string {
  return `#${String(id).padStart(4, '0')}`
}

export function artworkUrl(id: number): string {
  return `${SPRITES_BASE}/pokemon/other/official-artwork/${id}.png`
}

export function spriteUrl(id: number): string {
  return `${SPRITES_BASE}/pokemon/${id}.png`
}

export function itemSpriteUrl(name: string): string {
  return `${SPRITES_BASE}/items/${name}.png`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('es-ES')
}

/** Altura en metros con 1 decimal (la API la guarda en decímetros). */
export function formatMeters(meters: number): string {
  return `${meters.toFixed(1).replace('.', ',')} m`
}

export function formatKg(kg: number): string {
  return `${kg.toFixed(1).replace('.', ',')} kg`
}

const ROMAN: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
}

/** "generation-iv" → 4 */
export function generationNumber(name: string): number {
  const roman = name.split('-').pop() ?? ''
  return ROMAN[roman] ?? 0
}

export function romanize(n: number): string {
  const table: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let remaining = n
  let out = ''
  for (const [value, symbol] of table) {
    while (remaining >= value) {
      out += symbol
      remaining -= value
    }
  }
  return out
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function uniq<T>(items: Iterable<T>): T[] {
  return Array.from(new Set(items))
}

/** Limpia los saltos de línea y caracteres de control de los textos de la API. */
export function cleanText(text: string | null | undefined): string {
  if (!text) return ''
  return text.replace(/[\n\f\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
}
