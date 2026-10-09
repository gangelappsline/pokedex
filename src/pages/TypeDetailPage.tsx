import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTypeQuery, usePokedexIndex } from '../data/hooks'
import { PokemonCard } from '../components/PokemonCard'
import { EmptyState, ErrorState, Panel, SectionTitle, Skeleton, TypeBadge } from '../components/ui'
import { TYPE_NAMES, typeColor, typeLabel } from '../lib/labels'
import { filtersToSearchParams, makeFilters } from '../filters/pokedexFilters'
import { formatNumber } from '../lib/utils'
import type { NamedAPIResource } from '../api/types'

const PAGE = 60

export default function TypeDetailPage() {
  const { name = '' } = useParams()
  const query = useTypeQuery(name)
  const { entries } = usePokedexIndex()
  const [visible, setVisible] = useState(PAGE)

  const valid = (TYPE_NAMES as readonly string[]).includes(name)
  const ofType = useMemo(() => entries.filter((e) => e.types.includes(name)).sort((a, b) => a.id - b.id), [entries, name])

  if (!valid) return <EmptyState title="Tipo desconocido" hint="Revisa el nombre del tipo en la lista." action={<Link to="/tipos" className="btn-ghost">Ver tipos</Link>} />
  if (query.isLoading) return <Skeleton className="h-96" />
  if (query.isError || !query.data) return <ErrorState message="No se pudo cargar el tipo." onRetry={() => query.refetch()} />

  const rel = query.data.damage_relations
  const color = typeColor(name)
  const pokemonTotal = query.data.pokemon.length
  const moveTotal = query.data.moves.length

  const groups: Array<{ title: string; items: NamedAPIResource[]; tone: string }> = [
    { title: 'Muy efectivo contra (×2)', items: rel.double_damage_to, tone: 'text-orange-300' },
    { title: 'Poco efectivo contra (×½)', items: rel.half_damage_to, tone: 'text-emerald-300' },
    { title: 'Sin efecto contra (×0)', items: rel.no_damage_to, tone: 'text-slate-400' },
    { title: 'Recibe doble de (×2)', items: rel.double_damage_from, tone: 'text-red-300' },
    { title: 'Recibe la mitad de (×½)', items: rel.half_damage_from, tone: 'text-cyan-300' },
    { title: 'Inmune a (×0)', items: rel.no_damage_from, tone: 'text-slate-400' },
  ]

  const typeFilterUrl = `/pokedex?${filtersToSearchParams(makeFilters({ types: [name] })).toString()}`

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-sm text-slate-500" aria-label="Migas de pan">
        <ol className="flex items-center gap-2">
          <li><Link to="/tipos" className="hover:text-white">Tipos</Link></li>
          <li aria-hidden>/</li>
          <li className="text-slate-300" aria-current="page">{typeLabel(name)}</li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-xl" style={{ background: color }}>
          {typeLabel(name).slice(0, 2)}
        </div>
        <div>
          <h1 className="font-display text-4xl font-extrabold text-white">{typeLabel(name)}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {formatNumber(pokemonTotal)} Pokémon · {formatNumber(moveTotal)} movimientos · generación {query.data.generation.name.replace('generation-', '').toUpperCase()}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to={`/movimientos?type=${name}`} className="btn-ghost">Ver movimientos de tipo {typeLabel(name)}</Link>
          <Link to={typeFilterUrl} className="btn-primary">Filtrar Pokédex por tipo</Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <Panel key={g.title}>
            <h2 className={`mb-3 text-sm font-bold uppercase tracking-wide ${g.tone}`}>{g.title}</h2>
            {g.items.length === 0 ? (
              <p className="text-sm text-slate-500">Ninguno</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((t) => (
                  <Link key={t.name} to={`/tipos/${t.name}`}>
                    <TypeBadge type={t.name} />
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        ))}
      </div>

      <section>
        <SectionTitle action={<span className="text-sm text-slate-400">{formatNumber(ofType.length)} en la Pokédex local</span>}>
          Pokémon de tipo {typeLabel(name)}
        </SectionTitle>
        {ofType.length === 0 ? (
          <p className="text-sm text-slate-400">Los datos locales aún se están cargando. Vuelve a intentarlo en unos segundos.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {ofType.slice(0, visible).map((e, i) => (
                <PokemonCard key={e.name} entry={e} index={i % PAGE} />
              ))}
            </div>
            {visible < ofType.length && (
              <div className="mt-6 flex justify-center">
                <button type="button" className="btn-ghost" onClick={() => setVisible((v) => v + PAGE)}>
                  Mostrar más ({formatNumber(ofType.length - visible)} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Panel>
        <SectionTitle>Movimientos</SectionTitle>
        <p className="text-sm text-slate-400">
          Hay {formatNumber(moveTotal)} movimientos de tipo {typeLabel(name)}. Explóralos en el catálogo con filtros de potencia, precisión y clase de daño.
        </p>
        <Link to={`/movimientos?type=${name}`} className="btn-ghost mt-4 inline-flex">Ver catálogo de movimientos</Link>
      </Panel>
    </div>
  )
}
