import { describe, expect, it } from 'vitest'
import { GAMES } from './gamesCatalog'
import {
  filterGames,
  findGame,
  gameGenerations,
  gameReleaseDate,
  gameYear,
  guideLinks,
  matchesGameQuery,
  primaryGuideLink,
  sortGames,
  sortGamesByRelease,
  type GameRecord,
} from './games'

const ISO = /^\d{4}(-\d{2}-\d{2})?$/

describe('catálogo de juegos', () => {
  it('no repite identificadores y todos son únicos', () => {
    const slugs = GAMES.map((game) => game.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('cada juego tiene los datos básicos completos', () => {
    for (const game of GAMES) {
      expect(game.title.length, game.slug).toBeGreaterThan(0)
      expect(game.titleEn.length, game.slug).toBeGreaterThan(0)
      expect(game.platforms.length, game.slug).toBeGreaterThan(0)
      expect(game.summary.length, game.slug).toBeGreaterThan(40)
      expect(game.features.length, game.slug).toBeGreaterThanOrEqual(3)
      expect(game.accent, game.slug).toMatch(/^#[0-9a-f]{6}$/i)
      expect(['principal', 'remake', 'spinoff'], game.slug).toContain(game.category)
      expect(game.generation === null || (game.generation >= 1 && game.generation <= 10), game.slug).toBe(true)
      // Un spin-off puede ser además un remake (por ejemplo, Mundo Misterioso: Equipo de Rescate DX).
      if (game.series) expect(game.category, game.slug).not.toBe('principal')
    }
  })

  it('las fechas de lanzamiento usan formato ISO', () => {
    for (const game of GAMES) {
      for (const value of Object.values(game.release)) {
        expect(value, game.slug).toMatch(ISO)
      }
    }
  })

  it('las carátulas se enlazan por https desde fuentes reconocidas', () => {
    for (const game of GAMES) {
      if (!game.cover) continue
      expect(game.cover.url, game.slug).toMatch(/^https:\/\/(cdn\.wikimg\.net|archives\.bulbagarden\.net)\//)
      expect(['StrategyWiki', 'Bulbagarden Archives'], game.slug).toContain(game.cover.source)
    }
    // La gran mayoría del catálogo tiene carátula verificada.
    const withCover = GAMES.filter((game) => game.cover).length
    expect(withCover / GAMES.length).toBeGreaterThan(0.9)
  })

  it('los Pokémon vinculados son slugs válidos de PokéAPI', () => {
    for (const game of GAMES) {
      for (const slug of [...(game.starters ?? []), ...(game.legendaries ?? [])]) {
        expect(slug, game.slug).toMatch(/^[a-z0-9-]+$/)
      }
    }
  })

  it('los juegos próximos a lanzarse no tienen fecha', () => {
    for (const game of GAMES) {
      if (game.upcoming) expect(gameReleaseDate(game), game.slug).toBeNull()
    }
  })

  it('el orden cronológico respeta las fechas', () => {
    const ordered = sortGamesByRelease(GAMES)
    const years = ordered.map((game) => gameYear(game) ?? 9999)
    expect([...years].sort((a, b) => a - b)).toEqual(years)
  })
})

describe('recursos y guías', () => {
  it('cada juego ofrece al menos tres recursos externos', () => {
    for (const game of GAMES) {
      expect(guideLinks(game).length, game.slug).toBeGreaterThanOrEqual(3)
    }
  })

  it('los enlaces apuntan a los sitios previstos y usan https', () => {
    const hosts = [
      'https://strategywiki.org/wiki/',
      'https://bulbapedia.bulbagarden.net/wiki/',
      'https://www.wikidex.net/',
      'https://es.wikipedia.org/',
      'https://gamefaqs.gamespot.com/',
    ]
    for (const game of GAMES) {
      for (const link of guideLinks(game)) {
        expect(link.url, `${game.slug}/${link.id}`).toMatch(/^https:\/\//)
        expect(
          hosts.some((host) => link.url.startsWith(host)),
          `${game.slug}/${link.id}: ${link.url}`,
        ).toBe(true)
        expect(link.title.length).toBeGreaterThan(0)
      }
    }
  })

  it('los identificadores de recursos no se repiten dentro de un juego', () => {
    for (const game of GAMES) {
      const ids = guideLinks(game).map((link) => link.id)
      expect(new Set(ids).size, game.slug).toBe(ids.length)
    }
  })

  it('siempre hay una guía paso a paso como enlace recomendado salvo en spin-offs menores', () => {
    for (const game of GAMES) {
      const primary = primaryGuideLink(game)
      if (primary) {
        expect(primary.group).toBe('guia')
        expect(primary.language).toBe('en')
      } else {
        expect(game.guides.strategyWiki ?? game.guides.walkthrough, game.slug).toBeUndefined()
      }
    }
  })

  it('los enlaces de Pokédex usan filtros existentes', () => {
    const generations = gameGenerations(GAMES)
    for (const game of GAMES) {
      if (game.pokedex?.generation) expect(generations, game.slug).toContain(game.pokedex.generation)
      if (game.pokedex?.dex) expect(game.pokedex.dexLabel, game.slug).toBeDefined()
    }
  })

  it('las páginas de guía se codifican en la URL', () => {
    const red = findGame(GAMES, 'red-blue') as GameRecord
    const walkthrough = guideLinks(red).find((link) => link.id === 'bulbapedia-walkthrough')
    expect(walkthrough?.url).toBe('https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Red_and_Blue')
  })
})

describe('búsqueda, filtros y orden', () => {
  it('busca por título, título original y alias sin acentos', () => {
    expect(matchesGameQuery(findGame(GAMES, 'red-blue') as GameRecord, 'rojo')).toBe(true)
    expect(matchesGameQuery(findGame(GAMES, 'red-blue') as GameRecord, 'RED')).toBe(true)
    expect(matchesGameQuery(findGame(GAMES, 'sword-shield') as GameRecord, 'espada')).toBe(true)
    expect(matchesGameQuery(findGame(GAMES, 'sword-shield') as GameRecord, 'pokemon go')).toBe(false)
  })

  it('filtra por categoría, generación, subserie y plataforma', () => {
    const filters = { query: '', category: 'spinoff' as const, generation: 4 as const, series: 'Mundo Misterioso', platform: 'Nintendo DS' as const }
    const results = filterGames(GAMES, filters)
    expect(results.length).toBeGreaterThan(0)
    for (const game of results) {
      expect(game.category).toBe('spinoff')
      expect(game.generation).toBe(4)
      expect(game.series).toBe('Mundo Misterioso')
      expect(game.platforms).toContain('Nintendo DS')
    }
  })

  it('acepta filtros abiertos ("all")', () => {
    const all = filterGames(GAMES, { query: '', category: 'all', generation: 'all', series: 'all', platform: 'all' })
    expect(all.length).toBe(GAMES.length)
  })

  it('ordena por título y por generación', () => {
    const byTitle = sortGames(GAMES, 'title')
    expect(byTitle[0].title.localeCompare(byTitle[1].title, 'es')).toBeLessThanOrEqual(0)

    const byGeneration = sortGames(GAMES, 'generation')
    const generations = byGeneration.map((game) => game.generation ?? 99)
    expect([...generations].sort((a, b) => a - b)).toEqual(generations)
  })

  it('la Pokédex regional de Kanto y la de Ciudad Luminalia existen en el catálogo', () => {
    const red = findGame(GAMES, 'red-blue') as GameRecord
    const za = findGame(GAMES, 'legends-z-a') as GameRecord
    expect(red.pokedex?.dex).toBe('kanto')
    expect(za.pokedex?.dex).toBe('lumiose-city')
    expect(za.starters).toEqual(['chikorita', 'tepig', 'totodile'])
  })
})
