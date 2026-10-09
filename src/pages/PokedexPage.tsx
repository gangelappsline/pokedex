import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownAZ, ArrowUpAZ, Filter, RefreshCw, Search, X } from 'lucide-react'
import { usePokedexIndex, useTypeMatrix } from '../data/hooks'
import { resetPokedexIndex, startPokedexIndex } from '../data/pokedexIndex'
import {
  applyFilters,
  countActiveFilters,
  DEFAULT_FILTERS,
  filtersFromSearchParams,
  filtersToSearchParams,
  sortEntries,
  type PokedexFilters,
  type SortKey,
} from '../filters/pokedexFilters'
import { FilterPanel } from '../components/FilterPanel'
import { IndexStatus, ReadyBadge } from '../components/IndexStatus'
import { PokemonCard } from '../components/PokemonCard'
import { EmptyState, Pagination, SelectField, Skeleton } from '../components/ui'
import { clamp, cn, formatNumber, uniq } from '../lib/utils'

const PAGE_SIZES = [24, 48, 96] as const

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'number', label: 'Número nacional' },
  { value: 'name', label: 'Nombre' },
  { value: 'total', label: 'Total de estadísticas' },
  { value: 'hp', label: 'PS' },
  { value: 'attack', label: 'Ataque' },
  { value: 'defense', label: 'Defensa' },
  { value: 'spAttack', label: 'Ataque Especial' },
  { value: 'spDefense', label: 'Defensa Especial' },
  { value: 'speed', label: 'Velocidad' },
  { value: 'height', label: 'Altura' },
  { value: 'weight', label: 'Peso' },
  { value: 'baseExperience', label: 'Experiencia base' },
  { value: 'captureRate', label: 'Tasa de captura' },
  { value: 'happiness', label: 'Felicidad base' },
]

export default function PokedexPage() {
  const [params, setParams] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)

  const filters = useMemo(() => filtersFromSearchParams(params), [params])
  const size = (PAGE_SIZES as readonly number[]).includes(Number(params.get('size'))) ? Number(params.get('size')) : 24
  const requestedPage = Number(params.get('page')) || 1

  const { state, entries } = usePokedexIndex()
  const { matrix } = useTypeMatrix()

  const abilityOptions = useMemo(() => uniq(entries.flatMap((e) => e.abilities.map((a) => a.name))).sort(), [entries])
  const moveOptions = useMemo(() => uniq(entries.flatMap((e) => e.moves)).sort(), [entries])

  const filtered = useMemo(
    () => sortEntries(applyFilters(entries, filters, matrix), filters.sort, filters.order),
    [entries, filters, matrix],
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / size))
  const page = clamp(requestedPage, 1, pageCount)
  const visible = filtered.slice((page - 1) * size, page * size)
  const activeCount = countActiveFilters(filters)

  const writeParams = (nextFilters: PokedexFilters, nextSize = size, nextPage = 1) => {
    const p = filtersToSearchParams(nextFilters)
    if (nextSize !== 24) p.set('size', String(nextSize))
    if (nextPage > 1) p.set('page', String(nextPage))
    setParams(p, { replace: true })
  }

  const update = (next: PokedexFilters) => writeParams(next, size, 1)

  const goToPage = (next: number) => {
    const p = new URLSearchParams(params)
    if (next > 1) p.set('page', String(next))
    else p.delete('page')
    setParams(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetAll = () => writeParams(DEFAULT_FILTERS, size, 1)

  const loading = state.status === 'idle' || (state.status === 'loading' && entries.length === 0)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-semibold uppercase tracking-[0.2em] text-poke-yellow text-xs">Catálogo completo</p>
          <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl">Pokédex</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Combina filtros para encontrar exactamente lo que buscas: tipo, generación, estadísticas, habilidades,
            movimientos, debilidades y más. Tu búsqueda queda guardada en la URL para compartirla.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <ReadyBadge state={state} />
          <button
            type="button"
            className="btn-ghost text-xs"
            title="Borra la caché local y vuelve a descargar los datos"
            onClick={() => {
              if (window.confirm('¿Borrar la caché local y volver a descargar toda la Pokédex?')) void resetPokedexIndex()
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar datos
          </button>
        </div>
      </header>

      <IndexStatus state={state} label="la Pokédex" onRetry={() => startPokedexIndex()} />

      <div className="glass flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
          <input
            type="search"
            className="field pl-9"
            placeholder="Buscar por nombre o número (ej. Pikachu, 25)…"
            aria-label="Buscar Pokémon"
            value={filters.query}
            onChange={(e) => update({ ...filters, query: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            ariaLabel="Ordenar por"
            value={filters.sort}
            onChange={(sort) => update({ ...filters, sort })}
            options={SORT_OPTIONS}
            className="w-auto min-w-44"
          />
          <button
            type="button"
            className="btn-ghost px-3"
            aria-label={filters.order === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
            title={filters.order === 'asc' ? 'Ascendente' : 'Descendente'}
            onClick={() => update({ ...filters, order: filters.order === 'asc' ? 'desc' : 'asc' })}
          >
            {filters.order === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
          </button>
          <SelectField
            ariaLabel="Resultados por página"
            value={String(size)}
            onChange={(v) => writeParams(filters, Number(v), 1)}
            options={PAGE_SIZES.map((s) => ({ value: String(s), label: `${s} por página` }))}
            className="w-auto"
          />
          <button
            type="button"
            className="btn-ghost px-3 lg:hidden"
            onClick={() => setMobileFilters((v) => !v)}
            aria-expanded={mobileFilters}
          >
            <Filter className="h-4 w-4" /> Filtros
            {activeCount > 0 && <span className="rounded-full bg-poke-yellow px-1.5 text-xs font-bold text-slate-900">{activeCount}</span>}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <FilterPanel
          className={cn('h-fit lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto', mobileFilters ? 'block' : 'hidden lg:flex')}
          filters={filters}
          onChange={update}
          onReset={resetAll}
          abilityOptions={abilityOptions}
          moveOptions={moveOptions}
          matrixReady={matrix !== null}
        />

        <section className="min-w-0" aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              {loading ? (
                'Cargando Pokémon…'
              ) : filtered.length ? (
                <>
                  Mostrando <strong className="text-white">{formatNumber((page - 1) * size + 1)}</strong>–
                  <strong className="text-white">{formatNumber(Math.min(page * size, filtered.length))}</strong> de{' '}
                  <strong className="text-white">{formatNumber(filtered.length)}</strong> resultados
                  {state.status === 'loading' && <span className="text-slate-500"> (carga en curso)</span>}
                </>
              ) : (
                'Sin resultados'
              )}
            </p>
            {activeCount > 0 && (
              <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={resetAll}>
                <X className="h-3.5 w-3.5" /> Quitar {activeCount} filtro{activeCount === 1 ? '' : 's'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              title="Ningún Pokémon cumple estos criterios"
              hint="Prueba a relajar algún filtro, por ejemplo el rango de estadísticas o la modalidad de tipos."
              action={
                <button className="btn-primary" onClick={resetAll}>
                  Limpiar filtros
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {visible.map((entry, index) => (
                <PokemonCard key={entry.id} entry={entry} index={index} />
              ))}
            </div>
          )}

          <Pagination page={page} pageCount={pageCount} onChange={goToPage} />
        </section>
      </div>
    </div>
  )
}
