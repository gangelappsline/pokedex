import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useItemQuery } from '../data/hooks'
import { idFromUrl } from '../api/client'
import { EmptyState, ErrorState, Panel, SectionTitle, Skeleton } from '../components/ui'
import { pickEffect, pickName } from '../lib/localized'
import { cleanText, formatNumber, formatSlug, itemSpriteUrl, normalizeText, padId } from '../lib/utils'

const HOLDERS_PAGE = 120

export default function ItemDetailPage() {
  const { name = '' } = useParams()
  const query = useItemQuery(name)
  const [holderFilter, setHolderFilter] = useState('')
  const [visible, setVisible] = useState(HOLDERS_PAGE)

  if (query.isLoading) return <Skeleton className="h-96" />
  if (query.isError || !query.data) {
    return query.error instanceof Error && query.error.message.startsWith('No encontrado') ? (
      <EmptyState title="Objeto no encontrado" action={<Link to="/objetos" className="btn-ghost">Ver objetos</Link>} />
    ) : (
      <ErrorState message="No se pudo cargar el objeto." onRetry={() => query.refetch()} />
    )
  }

  const item = query.data
  const title = pickName(item.names, item.name)
  const effect = pickEffect(item.effect_entries)
  const flavorEs = item.flavor_text_entries.filter((f) => f.language.name === 'es').at(-1)?.text
  const flavorEn = item.flavor_text_entries.filter((f) => f.language.name === 'en').at(-1)?.text
  const flavor = cleanText(flavorEs ?? flavorEn ?? '')

  const needle = normalizeText(holderFilter.trim().replace(/\s+/g, '-'))
  const holders = item.held_by_pokemon
    .map((h) => ({ name: h.pokemon.name, id: idFromUrl(h.pokemon.url), rarity: Math.max(0, ...h.version_details.map((v) => v.rarity)) }))
    .filter((h) => !needle || h.name.includes(needle))
    .sort((a, b) => a.id - b.id)

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-sm text-slate-500" aria-label="Migas de pan">
        <ol className="flex items-center gap-2">
          <li><Link to="/objetos" className="hover:text-white">Objetos</Link></li>
          <li aria-hidden>/</li>
          <li className="text-slate-300" aria-current="page">{title}</li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-center gap-5">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <img src={itemSpriteUrl(item.name)} alt={title} className="h-16 w-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
        </div>
        <div>
          <h1 className="font-display text-4xl font-extrabold text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {formatSlug(item.category.name)}
            {item.cost !== undefined && ` · Precio de compra: ${formatNumber(item.cost)}₽`}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionTitle>Efecto</SectionTitle>
          <p className="text-slate-200">{cleanText(effect.effect || effect.short) || 'Sin descripción disponible.'}</p>
          {flavor && <p className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-400">{flavor}</p>}
        </Panel>
        <Panel>
          <SectionTitle>Datos</SectionTitle>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-slate-500">Categoría</dt>
            <dd className="text-slate-200">{formatSlug(item.category.name)}</dd>
            <dt className="text-slate-500">Lanzamiento (fling)</dt>
            <dd className="text-slate-200">{item.fling_power ?? '—'}{item.fling_effect ? ` · ${formatSlug(item.fling_effect.name)}` : ''}</dd>
            <dt className="text-slate-500">Atributos</dt>
            <dd className="text-slate-200">{item.attributes.length ? item.attributes.map((a) => formatSlug(a.name)).join(', ') : '—'}</dd>
          </dl>
        </Panel>
      </div>

      <Panel>
        <SectionTitle action={<span className="text-sm text-slate-400">{formatNumber(holders.length)} Pokémon</span>}>
          Pokémon que pueden llevarlo
        </SectionTitle>
        {item.held_by_pokemon.length === 0 ? (
          <p className="text-sm text-slate-400">Ningún Pokémon lo lleva de forma natural.</p>
        ) : (
          <>
            <input
              type="search"
              className="field mb-4 max-w-sm"
              placeholder="Filtrar por nombre en inglés…"
              aria-label="Filtrar Pokémon que llevan este objeto"
              value={holderFilter}
              onChange={(e) => {
                setHolderFilter(e.target.value)
                setVisible(HOLDERS_PAGE)
              }}
            />
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {holders.slice(0, visible).map((h) => (
                <li key={h.name}>
                  <Link to={`/pokemon/${h.name}`} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
                    <span className="truncate">{formatSlug(h.name)}</span>
                    <span className="shrink-0 font-mono text-[11px] text-slate-500">{padId(h.id)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {visible < holders.length && (
              <button type="button" className="btn-ghost mt-4" onClick={() => setVisible((v) => v + HOLDERS_PAGE)}>
                Mostrar más
              </button>
            )}
          </>
        )}
      </Panel>
    </div>
  )
}
