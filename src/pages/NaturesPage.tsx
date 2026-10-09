import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getNature } from '../api/endpoints'
import type { Nature } from '../api/types'
import { useCachedDetails } from '../data/catalog'
import { useResourceListQuery } from '../data/hooks'
import { EmptyState, Field, SelectField, Spinner } from '../components/ui'
import { STAT_LABELS, labelFor } from '../lib/labels'
import { pickName } from '../lib/localized'
import { formatSlug, normalizeText } from '../lib/utils'

const STAT_OPTIONS = Object.entries(STAT_LABELS).map(([value, label]) => ({ value, label }))

export default function NaturesPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const up = params.get('up') ?? ''
  const down = params.get('down') ?? ''
  const kind = params.get('kind') ?? 'all'

  const list = useResourceListQuery('nature', 25)
  const names = useMemo(() => list.data?.results.map((r) => r.name) ?? [], [list.data])
  const details = useCachedDetails<Nature>('nature', names, getNature)
  const natures = details.flatMap((d) => (d.data ? [d.data] : []))

  const rows = natures.filter((n) => {
    const neutral = n.increased_stat?.name === n.decreased_stat?.name
    if (kind === 'neutral' && !neutral) return false
    if (kind === 'modifies' && neutral) return false
    if (up && n.increased_stat?.name !== up) return false
    if (down && n.decreased_stat?.name !== down) return false
    if (q) {
      const needle = normalizeText(q)
      if (!normalizeText(`${pickName(n.names, n.name)} ${n.name}`).includes(needle)) return false
    }
    return true
  })
  rows.sort((a, b) => a.id - b.id)

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v && v !== 'all') next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }

  const loading = list.isLoading || (names.length > 0 && natures.length < names.length)

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl font-extrabold text-white">Naturalezas</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Cada naturaleza sube un 10 % una estadística y baja otra un 10 %. Filtra por la estadística que sube o baja.
        </p>
      </header>

      <div className="glass grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Buscar">
          <input className="field" type="search" value={q} placeholder="Ej.: audaz, modesta…" onChange={(e) => update({ q: e.target.value })} />
        </Field>
        <Field label="Estadística que sube">
          <SelectField ariaLabel="Estadística que sube" value={up} onChange={(v) => update({ up: v })} options={[{ value: '', label: 'Cualquiera' }, ...STAT_OPTIONS]} />
        </Field>
        <Field label="Estadística que baja">
          <SelectField ariaLabel="Estadística que baja" value={down} onChange={(v) => update({ down: v })} options={[{ value: '', label: 'Cualquiera' }, ...STAT_OPTIONS]} />
        </Field>
        <Field label="Tipo">
          <SelectField
            ariaLabel="Tipo de naturaleza"
            value={kind}
            onChange={(v) => update({ kind: v })}
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'modifies', label: 'Modifican estadísticas' },
              { value: 'neutral', label: 'Neutras' },
            ]}
          />
        </Field>
      </div>

      {loading ? (
        <Spinner label="Cargando naturalezas…" />
      ) : rows.length === 0 ? (
        <EmptyState title="Sin resultados" hint="Quita algún filtro para ver más naturalezas." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Naturaleza</th>
                <th className="px-4 py-3">Sube (+10 %)</th>
                <th className="px-4 py-3">Baja (−10 %)</th>
                <th className="px-4 py-3">Le gusta</th>
                <th className="px-4 py-3">No le gusta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((n) => {
                const neutral = n.increased_stat?.name === n.decreased_stat?.name
                return (
                  <tr key={n.name} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-white">{pickName(n.names, n.name)}</td>
                    <td className="px-4 py-3 text-emerald-300">{neutral ? '—' : labelFor(STAT_LABELS, n.increased_stat?.name)}</td>
                    <td className="px-4 py-3 text-red-300">{neutral ? '—' : labelFor(STAT_LABELS, n.decreased_stat?.name)}</td>
                    <td className="px-4 py-3 text-slate-300">{n.likes_flavor ? formatSlug(n.likes_flavor.name) : '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{n.hates_flavor ? formatSlug(n.hates_flavor.name) : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
