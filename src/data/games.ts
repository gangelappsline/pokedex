// Catálogo de videojuegos Pokémon y utilidades para las guías.
// Los datos viven en `gamesCatalog.ts`: aquí sólo hay tipos y funciones puras (fáciles de probar).

import { normalizeText } from '../lib/utils'

export type GameCategory = 'principal' | 'remake' | 'spinoff'

export interface GameCover {
  url: string
  /** Sitio del que se enlaza la carátula (crédito visible en la ficha). */
  source: 'StrategyWiki' | 'Bulbagarden Archives'
}

export interface GameRelease {
  /** Japón */
  jp?: string
  /** América */
  na?: string
  /** Europa */
  eu?: string
}

export interface GameGuides {
  /** Página de StrategyWiki (guía paso a paso completa). */
  strategyWiki?: string
  /** Artículo principal en Bulbapedia. */
  bulbapedia?: string
  /** Página de la guía colaborativa de Bulbapedia. */
  walkthrough?: string
}

export interface GamePokedexLinks {
  /** Generación de la Pokédex Nacional para filtrar (`gen=`). */
  generation?: number
  /** Slug de una Pokédex regional de PokéAPI (`dex=`). */
  dex?: string
  /** Etiqueta de esa Pokédex regional. */
  dexLabel?: string
}

export interface GameRecord {
  slug: string
  title: string
  titleEn: string
  /** Otros nombres por los que se puede buscar (abreviaturas, títulos alternativos…). */
  aliases?: string[]
  category: GameCategory
  /** Subserie a la que pertenece (sólo spin-offs): "Mystery Dungeon", "Ranger"… */
  series: string | null
  /** Generación con la que se lanzó (1-9) o null si no aplica. */
  generation: number | null
  region: string | null
  platforms: string[]
  release: GameRelease
  developer: string
  publisher: string
  genre: string
  summary: string
  /** Puntos clave del juego (qué ofrece al jugador). */
  features: string[]
  /** Pokémon iniciales (slugs de PokéAPI) para enlazar a su ficha. */
  starters?: string[]
  /** Pokémon legendarios destacados de la entrega (slugs de PokéAPI). */
  legendaries?: string[]
  /** Color de acento para la tarjeta y la carátula de respaldo. */
  accent: string
  cover?: GameCover
  /** Próximos lanzamientos: se muestran con aviso y sin fecha exacta. */
  upcoming?: boolean
  /** Aclaración breve (DLC, relanzamientos, particularidades). */
  note?: string
  guides: GameGuides
  pokedex?: GamePokedexLinks
}

export type GuideGroup = 'guia' | 'wiki' | 'comunidad'

export interface GuideLink {
  id: string
  group: GuideGroup
  source: string
  title: string
  description: string
  url: string
  language: 'es' | 'en'
}

export type GameSort = 'chrono' | 'title' | 'generation'

export interface GameFilters {
  query: string
  category: GameCategory | 'all'
  generation: number | 'all'
  series: string | 'all'
  platform: string | 'all'
}

export const GAME_CATEGORY_LABELS: Record<GameCategory, string> = {
  principal: 'Serie principal',
  remake: 'Remake',
  spinoff: 'Spin-off',
}

export const GAME_SORT_LABELS: Record<GameSort, string> = {
  chrono: 'Orden de lanzamiento',
  title: 'Título (A-Z)',
  generation: 'Generación',
}

/** Orden histórico de plataformas para los filtros (las más antiguas primero). */
const PLATFORM_ORDER = [
  'Game Boy',
  'Game Boy Color',
  'Super Nintendo',
  'Nintendo 64',
  'Game Boy Advance',
  'GameCube',
  'Nintendo DS',
  'Wii',
  'Nintendo 3DS',
  'Wii U',
  'Nintendo Switch',
  'Nintendo Switch 2',
  'PC',
  'Móvil',
  'Arcade',
]

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Fecha ISO ("2004-09-16" o "2004") → "16 sep 2004" / "2004". Sin desfases de zona horaria. */
export function formatGameDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!month || !day) return year
  const monthIndex = Number(month) - 1
  const monthLabel = MONTHS_ES[monthIndex]
  if (!monthLabel) return year
  return `${Number(day)} ${monthLabel} ${year}`
}

/** Fecha más antigua conocida del lanzamiento (ISO) o null. */
export function gameReleaseDate(game: GameRecord): string | null {
  const dates = [game.release.jp, game.release.na, game.release.eu].filter((d): d is string => Boolean(d))
  if (dates.length === 0) return null
  return dates.sort()[0]
}

export function gameYear(game: GameRecord): number | null {
  const date = gameReleaseDate(game)
  return date ? Number(date.slice(0, 4)) : null
}

/** "27 feb 1996 · Game Boy" (para tarjetas y listados). */
export function gameReleaseLabel(game: GameRecord): string {
  const date = gameReleaseDate(game)
  return [date ? formatGameDate(date) : 'Fecha por confirmar', game.platforms[0]].filter(Boolean).join(' · ')
}

export function sortGamesByRelease(games: GameRecord[]): GameRecord[] {
  return [...games].sort((a, b) => {
    const da = gameReleaseDate(a) ?? '9999'
    const db = gameReleaseDate(b) ?? '9999'
    if (da === db) return a.title.localeCompare(b.title, 'es')
    return da < db ? -1 : 1
  })
}

export function findGame(games: GameRecord[], slug: string | undefined): GameRecord | undefined {
  if (!slug) return undefined
  return games.find((g) => g.slug === slug)
}

/** ¿El juego coincide con el texto buscado? Revisa título, título original, alias, región y plataformas. */
export function matchesGameQuery(game: GameRecord, query: string): boolean {
  const needle = normalizeText(query)
  if (!needle) return true
  const haystack = [game.title, game.titleEn, ...(game.aliases ?? []), game.region ?? '', game.series ?? '', ...game.platforms]
    .map(normalizeText)
    .join(' | ')
  return needle.split(/\s+/).every((word) => haystack.includes(word))
}

export function filterGames(games: GameRecord[], filters: GameFilters): GameRecord[] {
  return games.filter((game) => {
    if (filters.category !== 'all' && game.category !== filters.category) return false
    if (filters.generation !== 'all' && game.generation !== filters.generation) return false
    if (filters.series !== 'all' && game.series !== filters.series) return false
    if (filters.platform !== 'all' && !game.platforms.includes(filters.platform)) return false
    return matchesGameQuery(game, filters.query)
  })
}

export function sortGames(games: GameRecord[], sort: GameSort): GameRecord[] {
  if (sort === 'title') return [...games].sort((a, b) => a.title.localeCompare(b.title, 'es'))
  if (sort === 'generation') {
    return sortGamesByRelease(games).sort((a, b) => (a.generation ?? 99) - (b.generation ?? 99))
  }
  return sortGamesByRelease(games)
}

export function gameSeries(games: GameRecord[]): string[] {
  const set = new Set<string>()
  for (const game of games) if (game.series) set.add(game.series)
  return [...set].sort((a, b) => a.localeCompare(b, 'es'))
}

export function gamePlatforms(games: GameRecord[]): string[] {
  const set = new Set<string>()
  for (const game of games) for (const p of game.platforms) set.add(p)
  const rank = (platform: string) => {
    const index = PLATFORM_ORDER.indexOf(platform)
    return index === -1 ? PLATFORM_ORDER.length : index
  }
  return [...set].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'es'))
}

export function gameGenerations(games: GameRecord[]): number[] {
  const set = new Set<number>()
  for (const game of games) if (game.generation) set.add(game.generation)
  return [...set].sort((a, b) => a - b)
}

// ---------- Enlaces externos ----------

/** Codifica el título de una página de MediaWiki manteniendo los ":" de los espacios de nombres. */
function wikiPath(page: string): string {
  return encodeURIComponent(page.replace(/ /g, '_')).replace(/%3A/g, ':')
}

function bulbapediaUrl(page: string): string {
  return `https://bulbapedia.bulbagarden.net/wiki/${wikiPath(page)}`
}

function strategyWikiUrl(page: string): string {
  return `https://strategywiki.org/wiki/${wikiPath(page)}`
}

/**
 * Recursos externos de un juego: guías paso a paso, wikis de referencia y guías de la comunidad.
 * Sólo se devuelven enlaces que existen (los títulos vienen verificados en el catálogo).
 */
export function guideLinks(game: GameRecord): GuideLink[] {
  const links: GuideLink[] = []

  if (game.guides.strategyWiki) {
    links.push({
      id: 'strategywiki',
      group: 'guia',
      source: 'StrategyWiki',
      title: 'Guía paso a paso',
      description: 'Recorrido completo por la aventura, mapas, objetos y jefes, dividido por zonas.',
      url: strategyWikiUrl(game.guides.strategyWiki),
      language: 'en',
    })
  }

  if (game.guides.walkthrough) {
    links.push({
      id: 'bulbapedia-walkthrough',
      group: 'guia',
      source: 'Bulbapedia',
      title: 'Guía colaborativa',
      description: 'Walkthrough detallado de la enciclopedia Bulbapedia, con equipos y tácticas recomendadas.',
      url: bulbapediaUrl(game.guides.walkthrough),
      language: 'en',
    })
  }

  if (game.guides.bulbapedia) {
    links.push({
      id: 'bulbapedia',
      group: 'wiki',
      source: 'Bulbapedia',
      title: 'Ficha del juego',
      description: 'Historia, novedades, Pokémon exclusivos, tabla de tipos y curiosidades de la entrega.',
      url: bulbapediaUrl(game.guides.bulbapedia),
      language: 'en',
    })
  }

  links.push({
    id: 'wikidex',
    group: 'wiki',
    source: 'WikiDex',
    title: 'Guía y artículo en español',
    description: 'Wiki en español con la guía del juego, listas de Pokémon y localizaciones.',
    url: `https://www.wikidex.net/index.php?title=Especial:Buscar&fulltext=1&search=${encodeURIComponent(game.title)}`,
    language: 'es',
  })

  links.push({
    id: 'wikipedia',
    group: 'wiki',
    source: 'Wikipedia',
    title: 'Artículo enciclopédico',
    description: 'Desarrollo, recepción y contexto histórico del lanzamiento en español.',
    url: `https://es.wikipedia.org/w/index.php?search=${encodeURIComponent(`${game.title} videojuego`)}`,
    language: 'es',
  })

  links.push({
    id: 'gamefaqs',
    group: 'comunidad',
    source: 'GameFAQs',
    title: 'FAQs y guías de la comunidad',
    description: 'Guías de jugadores: retos, speedruns, mapas de objetos y análisis exhaustivos.',
    url: `https://gamefaqs.gamespot.com/search?game=${encodeURIComponent(game.titleEn)}`,
    language: 'en',
  })

  return links
}

/** Enlace de guía recomendado para un acceso rápido desde la tarjeta. */
export function primaryGuideLink(game: GameRecord): GuideLink | undefined {
  return guideLinks(game).find((link) => link.group === 'guia')
}
