import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../api/client'
import { getItem } from '../api/endpoints'
import type { Item, NamedAPIResource } from '../api/types'
import { useCachedDetails } from '../data/catalog'
import { useResourceListQuery } from '../data/hooks'
import { EmptyState, ErrorState, Field, Pagination, SelectField } from '../components/ui'
import { pickEffect, pickName } from '../lib/localized'
import { clamp, cleanText, formatNumber, formatSlug, itemSpriteUrl, normalizeText } from '../lib/utils'

const PAGE_SIZE = 48

interface ItemCategory {
  name: string
  names: { name: string; language: NamedAPIResource }[]
  items: NamedAPIResource[]
}

export default function ItemsPage() {
  const [params, setParams] = useSearchParams()
  const category = params.get('cat') ?? ''
  const q = params.get('q') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)

  const list = useResourceListQuery('item', 2500)
  const categories = useResourceListQuery('item-category', 100)
  const categoryQuery = useQuery({
    queryKey: ['item-category', category],
    queryFn: ({ signal }) => apiGet<ItemCategory>(`/item-category/${category}`, signal),
    enabled: Boolean(category),
  })

  const names = useMemo(() => {
    const source = category ? (categoryQuery.data?.items ?? []).map((i) => i.name) : (list.data?.results.map((r) => r.name) ?? [])
    const needle = normalizeText(q.trim().replace(/\s+/g, '-'))
    return needle ? source.filter((n) => n.includes(needle)) : source
  }, [category, categoryQuery.data, list.data, q])

  const pageCount = Math.max(1, Math.ceil(names.length / PAGE_SIZE))
  const currentPage = clamp(page, 1, pageCount)
  const pageNames = names.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const details = useCachedDetails<Item>('item', pageNames, getItem)

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    if (!('page' in patch)) next.delete('page')
    setParams(next, { replace: true })
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl font-extrabold text-white">Objetos</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Objetos del juego por categoría. Los nombres se cargan en español sólo para los objetos que estás viendo, para no saturar PokéAPI.
        </p>
      </header>

      <div className="glass grid gap-4 p-5 md:grid-cols-2">
        <Field label="Buscar por nombre en inglés" hint="Ejemplos: potion, leftovers, choice-band">
          <input className="field" type="search" value={q} placeholder="potion, leftovers…" onChange={(e) => update({ q: e.target.value })} />
        </Field>
        <Field label="Categoría">
          <SelectField
            ariaLabel="Categoría de objeto"
            value={category}
            onChange={(v) => update({ cat: v })}
            options={[
              { value: '', label: `Todas (${formatNumber(list.data?.count ?? 0)})` },
              ...(categories.data?.results ?? []).map((c) => ({ value: c.name, label: formatSlug(c.name) })),
            ]}
          />
        </Field>
      </div>

      {list.isError && <ErrorState message="No se pudo cargar la lista de objetos." onRetry={() => list.refetch()} />}
      {categoryQuery.isError && <ErrorState message="No se pudo cargar la categoría." onRetry={() => categoryQuery.refetch()} />}

      <p className="text-sm text-slate-400">{formatNumber(names.length)} objetos</p>

      {names.length === 0 && !list.isLoading ? (
        <EmptyState title="Sin objetos" hint="Prueba otra categoría o quita la búsqueda." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageNames.map((name, i) => {
            const item = details[i]?.data
            const effect = item ? pickEffect(item.effect_entries) : null
            const label = item ? pickName(item.names, name) : formatSlug(name)
            return (
              <Link
                key={name}
                to={`/objetos/${name}`}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-poke-yellow/50 hover:bg-white/10"
              >
                <div className="flex items-start gap-3">
                  <img src={itemSpriteUrl(name)} alt="" loading="lazy" className="h-8 w-8 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <div className="min-w-0">
                    <span className="block truncate font-semibold text-white">{label}</span>
                    <p className="truncate text-xs text-slate-500">
                      {item ? formatSlug(item.category.name) : details[i]?.isError ? 'Error al cargar' : 'Cargando…'}
                    </p>
                  </div>
                </div>
                {effect && <p className="line-clamp-2 text-xs text-slate-400">{cleanText(effect.short || effect.effect)}</p>}
              </Link>
            )
          })}
        </div>
      )}

      <Pagination page={currentPage} pageCount={pageCount} onChange={(p) => update({ page: String(p) })} />
    </div>
  )
}
