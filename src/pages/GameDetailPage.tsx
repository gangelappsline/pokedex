import { Fragment, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Info, Languages, ListChecks, MapPin, Sparkles, Zap } from 'lucide-react'
import { GAMES } from '../data/gamesCatalog'
import {
  GAME_CATEGORY_LABELS,
  findGame,
  formatGameDate,
  gameReleaseDate,
  gameYear,
  guideLinks,
  sortGamesByRelease,
  type GuideLink,
} from '../data/games'
import { GameCover } from '../components/GameCover'
import { EmptyState, Panel, SectionTitle } from '../components/ui'
import { filtersToSearchParams, makeFilters } from '../filters/pokedexFilters'
import { formatSlug, romanize } from '../lib/utils'

const GROUP_LABELS: Record<GuideLink['group'], { title: string; hint: string }> = {
  guia: { title: 'Guías paso a paso', hint: 'Recorridos completos del juego, zona por zona.' },
  wiki: { title: 'Wikis y artículos', hint: 'Información del juego, sus Pokémon y su contexto.' },
  comunidad: { title: 'Guías de la comunidad', hint: 'FAQs, retos y análisis de otros jugadores.' },
}

const RELEASES = sortGamesByRelease(GAMES)

export default function GameDetailPage() {
  const { slug } = useParams()
  const game = useMemo(() => findGame(GAMES, slug), [slug])

  if (!game) {
    return (
      <EmptyState
        title="No encontramos ese juego"
        hint="Puede que el enlace esté mal escrito o que el juego no esté en el catálogo."
        action={
          <Link to="/guias" className="btn-primary">
            Ver todas las guías
          </Link>
        }
      />
    )
  }

  const links = guideLinks(game)
  const guides = links.filter((link) => link.group === 'guia')
  const index = RELEASES.findIndex((g) => g.slug === game.slug)
  const previous = index > 0 ? RELEASES[index - 1] : undefined
  const next = index >= 0 && index < RELEASES.length - 1 ? RELEASES[index + 1] : undefined
  const recommended = guides[0]

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-sm text-slate-500" aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/guias" className="hover:text-white">
              Guías
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-slate-300" aria-current="page">
            {game.title}
          </li>
        </ol>
      </nav>

      <header className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-start">
        <GameCover game={game} className="aspect-[4/5] w-full max-w-[280px]" eager />
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <span
              className="rounded-full border px-2.5 py-1 text-white"
              style={{ backgroundColor: `${game.accent}33`, borderColor: `${game.accent}99` }}
            >
              {GAME_CATEGORY_LABELS[game.category]}
            </span>
            {game.series ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-slate-200">{game.series}</span> : null}
            {game.generation ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-slate-200">Generación {romanize(game.generation)}</span> : null}
            {game.upcoming ? <span className="rounded-full bg-poke-yellow px-2.5 py-1 text-slate-900">Próximamente</span> : null}
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">{game.title}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {game.titleEn}
              {game.region ? ` · ${game.region}` : ''}
            </p>
          </div>
          <p className="max-w-3xl text-slate-300">{game.summary}</p>

          <div className="flex flex-wrap items-center gap-2">
            {recommended && (
              <a href={recommended.url} target="_blank" rel="noreferrer noopener" className="btn-primary">
                <BookOpen className="h-4 w-4" aria-hidden /> {recommended.title}
                <span className="text-xs font-normal opacity-70">({recommended.source})</span>
              </a>
            )}
            {links
              .filter((link) => link.language === 'es')
              .slice(0, 2)
              .map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer noopener" className="btn-ghost">
                  <Languages className="h-4 w-4" aria-hidden /> {link.source}
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                </a>
              ))}
            <Link to={`/guias?q=${encodeURIComponent(game.title)}`} className="btn-ghost">
              <ListChecks className="h-4 w-4" aria-hidden /> Todos los recursos ({links.length})
            </Link>
          </div>

          {game.note && (
            <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-poke-yellow" aria-hidden />
              {game.note}
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionTitle>Ficha técnica</SectionTitle>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-[minmax(0,140px)_1fr]">
            <dt className="text-slate-500">Desarrollador</dt>
            <dd className="text-slate-200">{game.developer}</dd>
            <dt className="text-slate-500">Distribuidor</dt>
            <dd className="text-slate-200">{game.publisher}</dd>
            <dt className="text-slate-500">Plataformas</dt>
            <dd className="text-slate-200">{game.platforms.join(', ')}</dd>
            <dt className="text-slate-500">Género</dt>
            <dd className="text-slate-200">{game.genre}</dd>
            {game.region && (
              <>
                <dt className="text-slate-500">Región</dt>
                <dd className="text-slate-200">{game.region}</dd>
              </>
            )}
            <dt className="text-slate-500">Lanzamiento</dt>
            <dd className="flex flex-col gap-1 text-slate-200">
              {gameReleaseDate(game) ? (
                <>
                  {game.release.jp && <span>Japón: {formatGameDate(game.release.jp)}</span>}
                  {game.release.na && <span>América: {formatGameDate(game.release.na)}</span>}
                  {game.release.eu && <span>Europa: {formatGameDate(game.release.eu)}</span>}
                </>
              ) : (
                <span className="text-slate-400">Fecha por confirmar</span>
              )}
            </dd>
          </dl>
          {game.cover && (
            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-500">
              Carátula enlazada desde{' '}
              <a
                href={game.cover.source === 'StrategyWiki' ? 'https://strategywiki.org/' : 'https://archives.bulbagarden.net/'}
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-dotted hover:text-slate-300"
              >
                {game.cover.source}
              </a>
              .
            </p>
          )}
        </Panel>

        <Panel>
          <SectionTitle>Qué ofrece</SectionTitle>
          <ul className="flex flex-col gap-3 text-sm text-slate-300">
            {game.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-poke-yellow" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {(game.starters?.length || game.legendaries?.length) && (
        <Panel>
          <SectionTitle>Pokémon destacados</SectionTitle>
          <div className="flex flex-col gap-4">
            {game.starters?.length ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Iniciales</p>
                <PokemonChips names={game.starters} accent={game.accent} />
              </div>
            ) : null}
            {game.legendaries?.length ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Legendarios y singulares</p>
                <PokemonChips names={game.legendaries} accent={game.accent} />
              </div>
            ) : null}
          </div>
        </Panel>
      )}

      <Panel>
        <SectionTitle>Explora en la Pokédex</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {game.pokedex?.generation && (
            <Link
              to={`/pokedex?${filtersToSearchParams(makeFilters({ generations: [game.pokedex.generation] })).toString()}`}
              className="btn-ghost"
            >
              <Sparkles className="h-4 w-4 text-poke-yellow" aria-hidden />
              Pokémon de la generación {romanize(game.pokedex.generation)}
            </Link>
          )}
          {game.pokedex?.dex && (
            <Link to={`/pokedex?${filtersToSearchParams(makeFilters({ pokedexes: [game.pokedex.dex] })).toString()}`} className="btn-ghost">
              <MapPin className="h-4 w-4 text-poke-yellow" aria-hidden />
              {game.pokedex.dexLabel ?? formatSlug(game.pokedex.dex)}
            </Link>
          )}
          {game.region && (
            <Link to="/regiones" className="btn-ghost">
              <MapPin className="h-4 w-4 text-poke-yellow" aria-hidden />
              Regiones: {game.region}
            </Link>
          )}
          <Link to="/movimientos" className="btn-ghost">
            <Zap className="h-4 w-4 text-poke-yellow" aria-hidden />
            Movimientos del juego
          </Link>
        </div>
      </Panel>

      <section className="flex flex-col gap-6" aria-labelledby="recursos">
        <div>
          <h2 id="recursos" className="font-display text-2xl font-bold text-white">
            Guías y recursos externos
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Enlaces a sitios de referencia; se abren en una pestaña nueva. Si algún enlace falla, prueba con otra de las fuentes.
          </p>
        </div>
        {(['guia', 'wiki', 'comunidad'] as const).map((group) => {
          const items = links.filter((link) => link.group === group)
          if (items.length === 0) return null
          return (
            <Fragment key={group}>
              <div>
                <h3 className="font-display text-lg font-bold text-white">{GROUP_LABELS[group].title}</h3>
                <p className="text-sm text-slate-500">{GROUP_LABELS[group].hint}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-poke-yellow/50 hover:bg-white/10"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-white group-hover:text-poke-yellow">{link.source}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                          {link.language === 'es' ? 'ES' : 'EN'}
                        </span>
                        <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-poke-yellow" aria-hidden />
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{link.title}</span>
                    <span className="text-xs text-slate-400">{link.description}</span>
                  </a>
                ))}
              </div>
            </Fragment>
          )
        })}
      </section>

      <nav className="mt-2 grid gap-3 sm:grid-cols-2" aria-label="Navegación entre juegos">
        {previous ? (
          <Link to={`/guias/${previous.slug}`} className="glass flex items-center gap-3 p-4 transition hover:border-poke-yellow/40">
            <ArrowLeft className="h-5 w-5 shrink-0 text-poke-yellow" aria-hidden />
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wide text-slate-500">Anterior</span>
              <span className="block truncate font-semibold text-white">{previous.title}</span>
              <span className="block text-xs text-slate-500">{gameYear(previous) ?? 'Próximamente'}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/guias/${next.slug}`}
            className="glass flex items-center justify-end gap-3 p-4 text-right transition hover:border-poke-yellow/40"
          >
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wide text-slate-500">Siguiente</span>
              <span className="block truncate font-semibold text-white">{next.title}</span>
              <span className="block text-xs text-slate-500">{gameYear(next) ?? 'Próximamente'}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-poke-yellow" aria-hidden />
          </Link>
        ) : null}
      </nav>
    </div>
  )
}

function PokemonChips({ names, accent }: { names: string[]; accent: string }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {names.map((name) => (
        <li key={name}>
          <Link
            to={`/pokemon/${name}`}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            style={{ borderColor: `${accent}66` }}
          >
            {formatSlug(name)}
          </Link>
        </li>
      ))}
    </ul>
  )
}
