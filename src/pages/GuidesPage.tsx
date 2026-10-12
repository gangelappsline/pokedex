import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, BookOpen, ExternalLink, Gamepad2, Search } from 'lucide-react'
import { GAMES } from '../data/gamesCatalog'
import {
  GAME_CATEGORY_LABELS,
  GAME_SORT_LABELS,
  filterGames,
  gameGenerations,
  gamePlatforms,
  gameSeries,
  gameYear,
  guideLinks,
  primaryGuideLink,
  sortGames,
  type GameCategory,
  type GameRecord,
  type GameSort,
} from '../data/games'
import { GameCover } from '../components/GameCover'
import { EmptyState, Panel, SelectField, Segmented } from '../components/ui'
import { cn, formatNumber, romanize } from '../lib/utils'

const CATEGORY_OPTIONS: Array<{ value: GameCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'principal', label: 'Serie principal' },
  { value: 'remake', label: 'Remakes' },
  { value: 'spinoff', label: 'Spin-offs' },
]

/** Portales generales de guías que se usan dentro del catálogo. */
const GUIDE_HUBS = [
  {
    name: 'StrategyWiki',
    description: 'Guías paso a paso de casi toda la saga, con mapas y objetos.',
    url: 'https://strategywiki.org/wiki/Pok%C3%A9mon',
  },
  {
    name: 'Bulbapedia',
    description: 'Enciclopedia de referencia con walkthroughs colaborativos.',
    url: 'https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon',
  },
  {
    name: 'WikiDex',
    description: 'La wiki en español: guías, localizaciones y listas de Pokémon.',
    url: 'https://www.wikidex.net/',
  },
]

export default function GuidesPage() {
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const category = (params.get('cat') as GameCategory | 'all' | null) ?? 'all'
  const generationParam = params.get('gen')
  const generation = generationParam ? Number(generationParam) : 'all'
  const series = params.get('serie') ?? 'all'
  const platform = params.get('plat') ?? 'all'
  const sort = (params.get('orden') as GameSort | null) ?? 'chrono'

  const seriesOptions = useMemo(() => gameSeries(GAMES), [])
  const platformOptions = useMemo(() => gamePlatforms(GAMES), [])
  const generations = useMemo(() => gameGenerations(GAMES), [])

  const results = useMemo(
    () => sortGames(filterGames(GAMES, { query, category, generation, series, platform }), sort),
    [query, category, generation, series, platform, sort],
  )

  const update = (patch: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '' || value === 'all') next.delete(key)
      else next.set(key, String(value))
    }
    setParams(next, { replace: true })
  }

  const activeFilters = [
    Boolean(query),
    category !== 'all',
    generation !== 'all',
    series !== 'all',
    platform !== 'all',
  ].filter(Boolean).length

  const guideCount = useMemo(() => GAMES.reduce((total, game) => total + guideLinks(game).length, 0), [])

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-poke-yellow">Recursos</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-white">Guías de juegos</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Todos los videojuegos de Pokémon con su carátula, su información y accesos directos a las mejores guías de la red:
          StrategyWiki y Bulbapedia (paso a paso), WikiDex en español, Wikipedia y las FAQs de la comunidad en GameFAQs.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          {formatNumber(GAMES.length)} juegos · {formatNumber(guideCount)} enlaces a guías · carátulas de StrategyWiki y Bulbagarden Archives
        </p>
      </header>

      <Panel className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Buscar por título, región o plataforma…"
              aria-label="Buscar juego"
              className="field pl-9"
            />
          </div>
          <Segmented
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(value) => update({ cat: value })}
            ariaLabel="Categoría de juego"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            ariaLabel="Filtrar por generación"
            value={String(generation)}
            onChange={(value) => update({ gen: value })}
            options={[
              { value: 'all', label: 'Todas las generaciones' },
              ...generations.map((g) => ({ value: String(g), label: `Generación ${romanize(g)}` })),
            ]}
          />
          <SelectField
            ariaLabel="Filtrar por subserie"
            value={series}
            onChange={(value) => update({ serie: value })}
            options={[
              { value: 'all', label: 'Todas las subseries' },
              ...seriesOptions.map((s) => ({ value: s, label: s })),
            ]}
          />
          <SelectField
            ariaLabel="Filtrar por plataforma"
            value={platform}
            onChange={(value) => update({ plat: value })}
            options={[
              { value: 'all', label: 'Todas las plataformas' },
              ...platformOptions.map((p) => ({ value: p, label: p })),
            ]}
          />
          <SelectField
            ariaLabel="Ordenar juegos"
            value={sort}
            onChange={(value) => update({ orden: value })}
            options={(Object.keys(GAME_SORT_LABELS) as GameSort[]).map((key) => ({
              value: key,
              label: GAME_SORT_LABELS[key],
            }))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wide text-slate-500">Atajos:</span>
          {generations.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => update({ gen: String(g) })}
              className={cn(
                'rounded-full border px-2.5 py-1 font-semibold transition',
                generation === g
                  ? 'border-transparent bg-poke-yellow text-slate-900'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
              )}
            >
              Gen {romanize(g)}
            </button>
          ))}
          {activeFilters > 0 && (
            <button type="button" onClick={() => setParams(new URLSearchParams(), { replace: true })} className="btn-ghost ml-auto px-3 py-1 text-xs">
              Limpiar filtros ({activeFilters})
            </button>
          )}
        </div>
      </Panel>

      <section aria-label="Recursos generales de guías">
        <div className="grid gap-3 sm:grid-cols-3">
          {GUIDE_HUBS.map((hub) => (
            <a
              key={hub.name}
              href={hub.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-poke-yellow/50 hover:bg-white/10"
            >
              <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-poke-yellow" aria-hidden />
              <span>
                <span className="flex items-center gap-1.5 font-display font-bold text-white">
                  {hub.name}
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-poke-yellow" aria-hidden />
                </span>
                <span className="mt-1 block text-xs text-slate-400">{hub.description}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-white">
          {category === 'all' ? 'Todos los juegos' : GAME_CATEGORY_LABELS[category]}
        </h2>
        <span className="text-sm text-slate-400">{formatNumber(results.length)} resultados</span>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="Ningún juego coincide con la búsqueda"
          hint="Prueba con otro título (por ejemplo «Mystery Dungeon»), quita filtros o busca por plataforma."
          action={
            <button type="button" className="btn-ghost" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Ver todos los juegos
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((game, index) => (
            <GameCard key={game.slug} game={game} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}

function GameCard({ game, index }: { game: GameRecord; index: number }) {
  const guide = primaryGuideLink(game)
  const year = gameYear(game)
  const guidesCount = guideLinks(game).length

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.3) }}
      className="glass group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:border-poke-yellow/40"
    >
      <Link to={`/guias/${game.slug}`} className="p-3" aria-label={`Ver ficha de ${game.title}`}>
        <GameCover game={game} className="aspect-[4/5] w-full" imgClassName="group-hover:scale-[1.03] transition" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
          <span
            className="rounded-full border px-2 py-0.5 text-white"
            style={{ backgroundColor: `${game.accent}33`, borderColor: `${game.accent}99` }}
          >
            {GAME_CATEGORY_LABELS[game.category]}
          </span>
          {game.generation ? <span className="text-slate-400">Gen {romanize(game.generation)}</span> : null}
          {game.upcoming ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-poke-yellow">Próximamente</span> : null}
        </div>
        <h3 className="font-display text-lg font-bold leading-tight text-white">
          <Link to={`/guias/${game.slug}`} className="hover:text-poke-yellow">
            {game.title}
          </Link>
        </h3>
        <p className="text-xs text-slate-400">
          {[year ?? 'Fecha por confirmar', game.platforms.join(' · ')].filter(Boolean).join(' — ')}
        </p>
        <p className="line-clamp-3 text-sm text-slate-400">{game.summary}</p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link to={`/guias/${game.slug}`} className="btn-ghost flex-1 px-3 py-1.5 text-xs">
            <Gamepad2 className="h-3.5 w-3.5" aria-hidden /> Ficha y guías
            <span className="text-slate-500">({guidesCount})</span>
          </Link>
          {guide && (
            <a
              href={guide.url}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost px-3 py-1.5 text-xs"
              title={`${guide.title} en ${guide.source}`}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Abrir {guide.title} en {guide.source}</span>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}

/** Enlace reutilizable a la lista completa de guías. */
export function GuidesLink({ className }: { className?: string }) {
  return (
    <Link to="/guias" className={cn('inline-flex items-center gap-1 font-semibold text-poke-yellow hover:underline', className)}>
      Ver las guías de todos los juegos <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  )
}
