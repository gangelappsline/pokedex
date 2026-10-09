import { useEncountersQuery } from '../../data/hooks'
import { Panel, SectionTitle, Spinner, ErrorState, EmptyState } from '../../components/ui'
import { formatSlug } from '../../lib/utils'
import { VERSION_GROUP_LABELS } from '../../lib/labels'

export function EncountersTab({ idOrName }: { idOrName: string }) {
  const { data, isLoading, isError, refetch } = useEncountersQuery(idOrName)

  if (isLoading) return <Spinner label="Cargando zonas de encuentro…" />
  if (isError) return <ErrorState message="No se pudieron cargar los encuentros." onRetry={() => refetch()} />
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No aparece en el mundo salvaje"
        hint="Este Pokémon se obtiene por regalo, evolución, intercambio, huevo u otro método especial."
      />
    )
  }

  // Un registro por zona de encuentro, con los detalles de cada versión.
  const rows = data
    .map((area) => {
      const versions = area.version_details.map((v) => ({
        version: v.version.name,
        maxChance: v.max_chance,
        methods: Array.from(new Set(v.encounter_details.map((d) => d.method.name))),
        minLevel: Math.min(...v.encounter_details.map((d) => d.min_level)),
        maxLevel: Math.max(...v.encounter_details.map((d) => d.max_level)),
        conditions: Array.from(new Set(v.encounter_details.flatMap((d) => d.condition_values.map((c) => c.name)))),
      }))
      return {
        key: area.location_area.name,
        name: formatSlug(area.location_area.name),
        versions,
        maxChance: Math.max(0, ...versions.map((v) => v.maxChance)),
      }
    })
    .sort((a, b) => b.maxChance - a.maxChance || a.name.localeCompare(b.name, 'es'))

  return (
    <Panel>
      <SectionTitle action={<span className="text-sm text-slate-400">{rows.length} zonas</span>}>Zonas de encuentro</SectionTitle>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <details key={row.key} className="group rounded-xl border border-white/10 bg-white/5 open:bg-white/[0.07]">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="font-semibold text-white">{row.name}</span>
              <span className="flex items-center gap-2 text-xs text-slate-400">
                Hasta {row.maxChance}%
                <span className="rounded-md bg-white/10 px-2 py-0.5">{row.versions.length} versión(es)</span>
              </span>
            </summary>
            <div className="overflow-x-auto px-4 pb-4">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">Versión</th>
                    <th className="py-2 font-semibold">Método</th>
                    <th className="py-2 font-semibold">Niveles</th>
                    <th className="py-2 text-right font-semibold">Prob.</th>
                    <th className="py-2 font-semibold">Condición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {row.versions.map((v) => (
                    <tr key={v.version}>
                      <td className="py-2 text-slate-200">{VERSION_GROUP_LABELS[v.version] ?? formatSlug(v.version)}</td>
                      <td className="py-2 text-slate-300">{v.methods.map((m) => formatSlug(m)).join(', ')}</td>
                      <td className="py-2 font-mono text-slate-300">
                        {v.minLevel === v.maxLevel ? v.minLevel : `${v.minLevel}–${v.maxLevel}`}
                      </td>
                      <td className="py-2 text-right font-mono text-poke-yellow">{v.maxChance}%</td>
                      <td className="py-2 text-xs text-slate-400">{v.conditions.map((c) => formatSlug(c)).join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </Panel>
  )
}
