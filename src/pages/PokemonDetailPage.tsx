import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { idFromUrl } from '../api/client'
import { useEvolutionChainQuery, usePokemonQuery, useSpeciesQuery, useTypeMatrix } from '../data/hooks'
import { ErrorState, Skeleton, TypeBadge } from '../components/ui'
import { Artwork } from '../components/Artwork'
import { formatPokemonDisplayName, pickFlavor, pickName } from '../lib/localized'
import { cn, formatSlug, padId } from '../lib/utils'
import { OverviewTab } from './pokemon/OverviewTab'
import { StatsTab } from './pokemon/StatsTab'
import { EvolutionTab } from './pokemon/EvolutionTab'
import { MovesTab } from './pokemon/MovesTab'
import { EncountersTab } from './pokemon/EncountersTab'
import { FormsTab } from './pokemon/FormsTab'
import { WeaknessTab } from './pokemon/WeaknessTab'
import { GalleryTab } from './pokemon/GalleryTab'

const LAST_NATIONAL_ID = 1025

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'evoluciones', label: 'Evoluciones' },
  { id: 'movimientos', label: 'Movimientos' },
  { id: 'encuentros', label: 'Encuentros' },
  { id: 'formas', label: 'Formas' },
  { id: 'debilidades', label: 'Debilidades' },
  { id: 'galeria', label: 'Galería' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function PokemonDetailPage() {
  const { idOrName = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab') as TabId | null
  const tab: TabId = TABS.some((t) => t.id === requestedTab) ? (requestedTab as TabId) : 'resumen'

  const pokemonQuery = usePokemonQuery(idOrName)
  const pokemon = pokemonQuery.data
  const speciesId = pokemon ? idFromUrl(pokemon.species.url) : undefined
  const speciesQuery = useSpeciesQuery(speciesId)
  const species = speciesQuery.data
  const chainId = species?.evolution_chain ? idFromUrl(species.evolution_chain.url) : undefined
  const chainQuery = useEvolutionChainQuery(chainId)
  const { matrix } = useTypeMatrix()

  const displayName = useMemo(() => {
    if (!pokemon) return ''
    const speciesName = species?.name ?? pokemon.species.name
    const speciesDisplay = species ? pickName(species.names, species.name) : formatSlug(pokemon.species.name)
    return formatPokemonDisplayName(pokemon.name, speciesName, speciesDisplay)
  }, [pokemon, species])

  const setTab = (next: TabId) => {
    const p = new URLSearchParams(searchParams)
    if (next === 'resumen') p.delete('tab')
    else p.set('tab', next)
    setSearchParams(p, { replace: true })
  }

  if (pokemonQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-[480px]" />
      </div>
    )
  }

  if (pokemonQuery.isError || !pokemon) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorState
          message={
            pokemonQuery.error instanceof Error && pokemonQuery.error.message.startsWith('No encontrado')
              ? `No existe ningún Pokémon llamado «${idOrName}».`
              : 'No se pudo cargar este Pokémon. Revisa tu conexión e inténtalo de nuevo.'
          }
          onRetry={() => pokemonQuery.refetch()}
        />
        <Link to="/pokedex" className="btn-ghost self-center">
          Volver a la Pokédex
        </Link>
      </div>
    )
  }

  const prevId = pokemon.id > 1 ? pokemon.id - 1 : null
  const nextId = pokemon.id < LAST_NATIONAL_ID ? pokemon.id + 1 : null
  const flavor = species ? pickFlavor(species.flavor_text_entries) : ''

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-sm text-slate-500" aria-label="Migas de pan">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/pokedex" className="hover:text-white">
              Pokédex
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-slate-300" aria-current="page">
            {displayName}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-5">
          <div className="relative hidden h-28 w-28 shrink-0 items-center justify-center sm:flex">
            <div className="absolute inset-2 rounded-full bg-poke-blue/30 blur-2xl" />
            <Artwork id={pokemon.id} alt="" className="relative h-full w-full" eager />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-sm text-poke-yellow">{padId(pokemon.id)}</p>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display text-4xl font-extrabold text-white sm:text-5xl"
            >
              {displayName}
            </motion.h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {pokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} className="px-3 py-1 text-sm" />
              ))}
            </div>
            {flavor && <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-slate-400">{flavor}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          {prevId ? (
            <Link to={`/pokemon/${prevId}`} className="btn-ghost px-3" aria-label="Pokémon anterior">
              <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">#{String(prevId).padStart(4, '0')}</span>
            </Link>
          ) : null}
          {nextId ? (
            <Link to={`/pokemon/${nextId}`} className="btn-ghost px-3" aria-label="Pokémon siguiente">
              <span className="hidden sm:inline">#{String(nextId).padStart(4, '0')}</span> <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Secciones de la ficha">
        <div className="flex min-w-max gap-1 border-b border-white/10">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative rounded-t-lg px-4 py-3 text-sm font-semibold transition',
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                {t.label}
                {active && <motion.span layoutId="tab-underline" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-poke-yellow" />}
              </button>
            )
          })}
        </div>
      </div>

      <section id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'resumen' && <OverviewTab pokemon={pokemon} species={species} displayName={displayName} />}
        {tab === 'estadisticas' && <StatsTab pokemon={pokemon} />}
        {tab === 'evoluciones' && (
          <EvolutionTab
            chain={chainQuery.data}
            loading={chainQuery.isLoading || speciesQuery.isLoading}
            error={chainQuery.isError}
            currentSpecies={pokemon.species.name}
            onRetry={() => chainQuery.refetch()}
          />
        )}
        {tab === 'movimientos' && <MovesTab pokemon={pokemon} />}
        {tab === 'encuentros' && <EncountersTab idOrName={String(pokemon.id)} />}
        {tab === 'formas' && <FormsTab pokemon={pokemon} species={species} />}
        {tab === 'debilidades' && <WeaknessTab pokemon={pokemon} matrix={matrix} />}
        {tab === 'galeria' && <GalleryTab pokemon={pokemon} />}
      </section>
    </div>
  )
}
