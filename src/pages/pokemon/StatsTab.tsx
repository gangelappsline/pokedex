import { motion } from 'motion/react'
import type { Pokemon } from '../../api/types'
import { Panel, SectionTitle, StatRangeBar } from '../../components/ui'
import { statColor } from '../../lib/typeChart'
import { STAT_LABELS } from '../../lib/labels'
import { formatNumber } from '../../lib/utils'

/** Fórmula oficial de estadísticas a nivel 100 (naturaleza neutra). */
function statAtLevel100(base: number, isHp: boolean, iv: number, ev: number): number {
  const core = Math.floor((2 * base + iv + Math.floor(ev / 4)) * 100 / 100)
  return isHp ? core + 110 : core + 5
}

export function StatsTab({ pokemon }: { pokemon: Pokemon }) {
  const total = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)
  const best = pokemon.stats.reduce((a, b) => (b.base_stat > a.base_stat ? b : a))

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Panel>
        <SectionTitle
          action={
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
              Total <span className="text-poke-yellow">{formatNumber(total)}</span>
            </span>
          }
        >
          Estadísticas base
        </SectionTitle>
        <div className="flex flex-col gap-5">
          {pokemon.stats.map((s, index) => (
            <div key={s.stat.name} className="grid grid-cols-[7.5rem_3rem_1fr] items-center gap-3 sm:grid-cols-[9rem_3.5rem_1fr]">
              <span className="text-sm font-medium text-slate-300">{STAT_LABELS[s.stat.name] ?? s.stat.name}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="text-right font-mono text-lg font-bold"
                style={{ color: statColor(s.base_stat) }}
              >
                {s.base_stat}
              </motion.span>
              <div className="flex items-center gap-3">
                <StatRangeBar value={s.base_stat} color={statColor(s.base_stat)} />
                {s.effort > 0 && (
                  <span className="shrink-0 rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-300" title="Puntos de esfuerzo (EV) que da al derrotarlo">
                    +{s.effort} EV
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-400">
          Mayor estadística: <strong className="text-white">{STAT_LABELS[best.stat.name] ?? best.stat.name}</strong> ({best.base_stat}).
        </p>
      </Panel>

      <Panel>
        <SectionTitle>Nivel 100</SectionTitle>
        <p className="mb-4 text-sm text-slate-400">
          Valores calculados con la fórmula oficial, naturaleza neutra. Mínimo: IV 0 y EV 0. Máximo: IV 31 y 252 EV.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 font-semibold">Estadística</th>
                <th className="pb-2 text-right font-semibold">Mín</th>
                <th className="pb-2 text-right font-semibold">Máx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pokemon.stats.map((s) => {
                const isHp = s.stat.name === 'hp'
                return (
                  <tr key={s.stat.name}>
                    <td className="py-2 text-slate-300">{STAT_LABELS[s.stat.name] ?? s.stat.name}</td>
                    <td className="py-2 text-right font-mono text-slate-400">{statAtLevel100(s.base_stat, isHp, 0, 0)}</td>
                    <td className="py-2 text-right font-mono font-semibold text-white">{statAtLevel100(s.base_stat, isHp, 31, 252)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel className="lg:col-span-2">
        <SectionTitle>Escala de estadísticas</SectionTitle>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 sm:grid-cols-5">
          {[
            ['< 45', '#f87171'],
            ['45–69', '#fb923c'],
            ['70–99', '#facc15'],
            ['100–149', '#4ade80'],
            ['≥ 150', '#22d3ee'],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
