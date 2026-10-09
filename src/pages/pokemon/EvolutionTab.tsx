import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { getSpecies } from '../../api/endpoints'
import { idFromUrl } from '../../api/client'
import type { ChainLink, EvolutionChain } from '../../api/types'
import { Artwork } from '../../components/Artwork'
import { Panel, SectionTitle, Spinner, ErrorState } from '../../components/ui'
import { describeEvolutionDetail } from '../../lib/evolution'
import { pickName } from '../../lib/localized'
import { formatSlug, padId } from '../../lib/utils'
import { ItemLink } from '../../components/Named'

export function EvolutionTab({
  chain,
  loading,
  error,
  currentSpecies,
  onRetry,
}: {
  chain?: EvolutionChain
  loading: boolean
  error: boolean
  currentSpecies: string
  onRetry: () => void
}) {
  if (loading) return <Spinner label="Cargando cadena evolutiva…" />
  if (error) return <ErrorState message="No se pudo cargar la cadena evolutiva." onRetry={onRetry} />
  if (!chain) return null

  return (
    <div className="flex flex-col gap-6">
      <EvolutionGraph chain={chain} currentSpecies={currentSpecies} />
      {chain.baby_trigger_item && (
        <Panel>
          <SectionTitle>Objeto de cría</SectionTitle>
          <p className="mb-3 text-sm text-slate-400">
            Para obtener la forma bebé de esta familia hay que criar con este objeto sostenido.
          </p>
          <ItemLink name={chain.baby_trigger_item.name} />
        </Panel>
      )}
    </div>
  )
}

function EvolutionGraph({ chain, currentSpecies }: { chain: EvolutionChain; currentSpecies: string }) {
  const ids = collectSpeciesIds(chain.chain)
  const speciesQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['species', id],
      queryFn: ({ signal }: { signal: AbortSignal }) => getSpecies(id, signal),
    })),
  })
  const names = new Map<number, string>()
  speciesQueries.forEach((q, i) => {
    if (q.data) names.set(ids[i], pickName(q.data.names, q.data.name))
  })

  return (
    <Panel className="overflow-x-auto">
      <SectionTitle>Cadena evolutiva</SectionTitle>
      <div className="min-w-max py-2">
        <EvolutionNode link={chain.chain} names={names} currentSpecies={currentSpecies} />
      </div>
    </Panel>
  )
}

function collectSpeciesIds(link: ChainLink): number[] {
  return [idFromUrl(link.species.url), ...link.evolves_to.flatMap(collectSpeciesIds)]
}

function EvolutionNode({ link, names, currentSpecies }: { link: ChainLink; names: Map<number, string>; currentSpecies: string }) {
  const id = idFromUrl(link.species.url)
  const isCurrent = link.species.name === currentSpecies
  const label = names.get(id) ?? formatSlug(link.species.name)

  return (
    <div className="flex items-center gap-4">
      <Link
        to={`/pokemon/${link.species.name}`}
        className={`flex w-40 flex-col items-center rounded-2xl border p-3 text-center transition hover:bg-white/10 ${
          isCurrent ? 'border-poke-yellow bg-poke-yellow/10' : 'border-white/10 bg-white/5'
        }`}
      >
        <Artwork id={id} alt={label} className="h-24 w-24" />
        <span className="font-mono text-xs text-slate-500">{padId(id)}</span>
        <span className="font-display font-bold text-white">{label}</span>
        {link.is_baby && <span className="mt-1 rounded-md bg-sky-300/20 px-1.5 text-[10px] font-bold uppercase text-sky-300">Bebé</span>}
      </Link>

      {link.evolves_to.length > 0 && (
        <div className="flex flex-col gap-4">
          {link.evolves_to.map((child) => {
            const details = child.evolution_details.flatMap((d) => {
              const text = describeEvolutionDetail(d)
              return text.length ? [text.join(' · ')] : []
            })
            return (
              <Fragment key={child.species.name}>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl text-slate-500" aria-hidden>
                      →
                    </span>
                    <div className="max-w-56 text-center text-xs text-slate-400">
                      {details.length ? details.map((d, i) => <p key={i}>{d}</p>) : <p>Evolución</p>}
                    </div>
                  </div>
                  <EvolutionNode link={child} names={names} currentSpecies={currentSpecies} />
                </div>
              </Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
