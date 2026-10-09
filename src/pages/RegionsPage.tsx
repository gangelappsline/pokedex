import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getPokedex, getRegion } from '../api/endpoints'
import type { Pokedex, Region } from '../api/types'
import { useCachedDetails } from '../data/catalog'
import { useResourceListQuery } from '../data/hooks'
import { filtersToSearchParams, makeFilters } from '../filters/pokedexFilters'
import { Panel, Spinner } from '../components/ui'
import { pickName } from '../lib/localized'
import { formatNumber, generationNumber, romanize } from '../lib/utils'

export default function RegionsPage() {
  const list = useResourceListQuery('region', 20)
  const names = useMemo(() => list.data?.results.map((r) => r.name) ?? [], [list.data])
  const details = useCachedDetails<Region>('region', names, getRegion)
  const regions = details.flatMap((d) => (d.data ? [d.data] : []))

  if (list.isLoading) return <Spinner label="Cargando regiones…" />

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl font-extrabold text-white">Regiones</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Regiones del mundo Pokémon, sus Pokédex y la generación en la que aparecieron. Desde cada región puedes ver sus Pokémon en la Pokédex.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {regions.map((region) => (
          <RegionCard key={region.name} region={region} />
        ))}
      </div>
    </div>
  )
}

function RegionCard({ region }: { region: Region }) {
  const dexNames = region.pokedexes.map((p) => p.name)
  const dexes = useCachedDetails<Pokedex>('pokedex', dexNames, getPokedex)
  const generation = generationNumber(region.main_generation.name)
  const title = pickName(region.names, region.name)
  const gen = generation ? romanize(generation) : '—'

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-slate-400">Generación {gen} · {formatNumber(region.locations.length)} ubicaciones</p>
        </div>
        {generation > 0 && (
          <Link
            to={`/pokedex?${filtersToSearchParams(makeFilters({ generations: [generation] })).toString()}`}
            className="btn-ghost shrink-0 text-xs"
          >
            Ver Pokémon
          </Link>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pokédex</p>
        <ul className="flex flex-col gap-2">
          {dexes.map((d, i) => {
            const dex = d.data
            const label = dex ? pickName(dex.names, dex.name) : region.pokedexes[i]?.name ?? ''
            const slug = region.pokedexes[i]?.name ?? ''
            return (
              <li key={slug} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                {slug && dex ? (
                  <Link to={`/pokedex?${filtersToSearchParams(makeFilters({ pokedexes: [slug] })).toString()}`} className="font-medium text-slate-100 hover:text-poke-yellow">
                    {label}
                  </Link>
                ) : (
                  <span className="text-slate-300">{label}</span>
                )}
                <span className="shrink-0 text-xs text-slate-500">
                  {dex ? `${formatNumber(dex.pokemon_entries.length)} entradas` : d.isError ? 'Error' : '…'}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </Panel>
  )
}
