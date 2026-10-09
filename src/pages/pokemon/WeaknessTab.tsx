import type { Pokemon } from '../../api/types'
import { Panel, SectionTitle, TypeBadge } from '../../components/ui'
import { TYPE_NAMES, typeColor, typeLabel } from '../../lib/labels'
import { defensiveProfile, formatMultiplier, groupByMultiplier, multiplierColor, type TypeMatrix } from '../../lib/typeChart'

const GROUP_TITLES: Record<number, string> = {
  4: 'Muy débil (4×)',
  2: 'Débil (2×)',
  1: 'Daño normal (1×)',
  0.5: 'Resiste (½×)',
  0.25: 'Muy resistente (¼×)',
  0: 'Inmune (0×)',
}

export function WeaknessTab({ pokemon, matrix }: { pokemon: Pokemon; matrix: TypeMatrix | null }) {
  if (!matrix) return <Panel><p className="text-sm text-slate-400">Cargando tabla de tipos…</p></Panel>
  const types = pokemon.types.map((t) => t.type.name)
  const profile = defensiveProfile(types, matrix)
  const groups = groupByMultiplier(profile)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Panel>
        <SectionTitle>Efectividad recibida</SectionTitle>
        <p className="mb-4 text-sm text-slate-400">
          Multiplicador de daño que recibe este Pokémon de cada tipo atacante, teniendo en cuenta sus {types.length} tipo(s).
        </p>
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.multiplier}>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span className="rounded-md px-1.5 py-0.5 font-mono text-slate-900" style={{ backgroundColor: multiplierColor(group.multiplier) }}>
                  {formatMultiplier(group.multiplier)}
                </span>
                {GROUP_TITLES[group.multiplier]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionTitle>Tabla completa</SectionTitle>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {TYPE_NAMES.map((t) => {
            const m = profile[t]
            return (
              <div
                key={t}
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 p-2 text-center"
                style={{ backgroundColor: `${multiplierColor(m)}22` }}
              >
                <span className="text-[11px] font-semibold" style={{ color: typeColor(t) }}>
                  {typeLabel(t)}
                </span>
                <span className="font-mono text-lg font-bold" style={{ color: multiplierColor(m) }}>
                  {formatMultiplier(m)}
                </span>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

