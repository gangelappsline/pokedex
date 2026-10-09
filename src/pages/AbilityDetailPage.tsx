import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAbilityQuery } from '../data/hooks'
import { idFromUrl } from '../api/client'
import { EmptyState, ErrorState, Panel, SectionTitle, Skeleton } from '../components/ui'
import { pickEffect, pickFlavor, pickName } from '../lib/localized'
import { cleanText, formatNumber, formatSlug, generationNumber, normalizeText, padId, romanize } from '../lib/utils'

export default function AbilityDetailPage() {
  const { name = '' } = useParams()
  const query = useAbilityQuery(name)
  const [filter, setFilter] = useState('')

  const pokemon = useMemo(() => {
    const list = query.data?.pokemon ?? []
    const needle = normalizeText(filter.trim().replace(/\s+/g, '-'))
    return list
      .map((p) => ({ ...p, id: idFromUrl(p.pokemon.url) }))
      .filter((p) => !needle || p.pokemon.name.includes(needle))
      .sort((a, b) => a.id - b.id)
  }, [query.data, filter])

  if (query.isLoading) return <Skeleton className="h-96" />
  if (query.isError || !query.data) {
    return query.error instanceof Error && query.error.message.startsWith('No encontrado') ? (
      <EmptyState title="Habilidad no encontrada" action={<Link to="/habilidades" className="btn-ghost">Ver habilidades</Link>} />
    ) : (
      <ErrorState message="No se pudo cargar la habilidad." onRetry={() => query.refetch()} />
    )
  }

  const ability = query.data
  const title = pickName(ability.names, ability.name)
  const effect = pickEffect(ability.effect_entries)
  const flavor = cleanText(pickFlavor(ability.flavor_text_entries))
  const hiddenCount = ability.pokemon.filter((p) => p.is_hidden).length

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-sm text-slate-500" aria-label="Migas de pan">
        <ol className="flex items-center gap-2">
          <li><Link to="/habilidades" className="hover:text-white">Habilidades</Link></li>
          <li aria-hidden>/</li>
          <li className="text-slate-300" aria-current="page">{title}</li>
        </ol>
      </nav>

      <header>
        <h1 className="font-display text-4xl font-extrabold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Generación {romanize(generationNumber(ability.generation.name))} · {formatNumber(ability.pokemon.length)} Pokémon ({formatNumber(hiddenCount)} como habilidad oculta)
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionTitle>Efecto</SectionTitle>
          <p className="text-slate-200">{cleanText(effect.effect || effect.short) || 'Sin descripción disponible.'}</p>
          {effect.short && effect.effect && effect.short !== effect.effect && (
            <p className="mt-3 text-sm text-slate-400">{cleanText(effect.short)}</p>
          )}
        </Panel>
        <Panel>
          <SectionTitle>Descripción en el juego</SectionTitle>
          <p className="text-slate-300">{flavor || 'Sin texto disponible en español.'}</p>
        </Panel>
      </div>

      <Panel>
        <SectionTitle
          action={<span className="text-sm text-slate-400">{formatNumber(pokemon.length)} mostrados</span>}
        >
          Pokémon con esta habilidad
        </SectionTitle>
        <input
          type="search"
          className="field mb-4 max-w-sm"
          placeholder="Filtrar por nombre en inglés…"
          aria-label="Filtrar Pokémon con esta habilidad"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {pokemon.map((p) => (
            <li key={p.pokemon.name}>
              <Link
                to={`/pokemon/${p.pokemon.name}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                <span className="truncate">{formatSlug(p.pokemon.name)}</span>
                <span className="shrink-0 font-mono text-[11px] text-slate-500">
                  {padId(p.id)}
                  {p.is_hidden && <span className="ml-1 text-fuchsia-300">★</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
