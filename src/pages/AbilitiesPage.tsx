import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAbility } from '../api/endpoints'
import type { Ability } from '../api/types'
import { useCachedDetails } from '../data/catalog'
import { useResourceListQuery } from '../data/hooks'
import { EmptyState, ErrorState, Field, SelectField, Skeleton } from '../components/ui'
import { pickEffect, pickName } from '../lib/localized'
import { cleanText, formatNumber, formatSlug, generationNumber, normalizeText, romanize } from '../lib/utils'

type SortAbility = 'name' | 'pokemon' | 'generation'

export default function AbilitiesPage() {
  const list = useResourceListQuery('ability', 500)
  const names = useMemo(() => list.data?.results.map((r) => r.name) ?? [], [list.data])
  const details = useCachedDetails<Ability>('ability', names, getAbility)

  const [q, setQ] = useState('')
  const [generation, setGeneration] = useState('')
  const [sort, setSort] = useState<SortAbility>('name')

  const loaded = details.flatMap((d) => (d.data ? [d.data] : []))
  const loadedCount = loaded.length
  const failed = details.filter((d) => d.isError).length

  const generations = Array.from(new Set(loaded.map((a) => generationNumber(a.generation.name)))).filter(Boolean).sort((a, b) => a - b)

  const rows = (() => {
    const needle = normalizeText(q.trim())
    const result = loaded.filter((a) => {
      if (generation && String(generationNumber(a.generation.name)) !== generation) return false
      if (!needle) return true
      const haystack = normalizeText(`${pickName(a.names, a.name)} ${a.name} ${pickEffect(a.effect_entries).effect}`)
      return haystack.includes(needle)
    })
    result.sort((a, b) => {
      if (sort === 'pokemon') return b.pokemon.length - a.pokemon.length || a.name.localeCompare(b.name)
      if (sort === 'generation') return generationNumber(b.generation.name) - generationNumber(a.generation.name) || a.name.localeCompare(b.name)
      return pickName(a.names, a.name).localeCompare(pickName(b.names, b.name), 'es')
    })
    return result
  })()

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl font-extrabold text-white">Habilidades</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Todas las habilidades, su efecto y los Pokémon que pueden tenerlas. Se descargan una vez y quedan guardadas en tu navegador.
        </p>
      </header>

      {list.isError && <ErrorState message="No se pudo cargar la lista de habilidades." onRetry={() => list.refetch()} />}

      <div className="glass grid gap-4 p-5 md:grid-cols-3">
        <Field label="Buscar por nombre o efecto">
          <input className="field" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej.: intimidación, curación…" />
        </Field>
        <Field label="Generación">
          <SelectField
            ariaLabel="Generación de la habilidad"
            value={generation}
            onChange={setGeneration}
            options={[{ value: '', label: 'Todas' }, ...generations.map((g) => ({ value: String(g), label: `Generación ${romanize(g)}` }))]}
          />
        </Field>
        <Field label="Ordenar por">
          <SelectField<SortAbility>
            ariaLabel="Ordenar habilidades"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'name', label: 'Nombre (A–Z)' },
              { value: 'pokemon', label: 'Más Pokémon que la tienen' },
              { value: 'generation', label: 'Generación (más reciente)' },
            ]}
          />
        </Field>
      </div>

      {names.length > 0 && loadedCount < names.length && (
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>
            Cargando habilidades {formatNumber(loadedCount)} / {formatNumber(names.length)}
          </span>
          {failed > 0 && <span className="text-red-300">({failed} con error)</span>}
        </div>
      )}

      {list.isLoading || (names.length > 0 && loadedCount === 0) ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="Sin resultados" hint="Prueba con otro término o quita el filtro de generación." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((a) => {
            const effect = pickEffect(a.effect_entries)
            return (
              <Link
                key={a.name}
                to={`/habilidades/${a.name}`}
                className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-poke-yellow/50 hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-white group-hover:text-poke-yellow">{pickName(a.names, a.name)}</h2>
                  <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-xs text-slate-300">Gen {romanize(generationNumber(a.generation.name))}</span>
                </div>
                <p className="line-clamp-3 text-sm text-slate-400">{cleanText(effect.short || effect.effect) || 'Sin descripción.'}</p>
                <p className="mt-auto text-xs text-slate-500">
                  {formatNumber(a.pokemon.length)} Pokémon · {formatSlug(a.name)}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
