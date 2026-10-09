import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Pokemon } from '../../api/types'
import { useMoveQuery } from '../../data/hooks'
import { Panel, SectionTitle, SelectField, Segmented, Spinner, TypeBadge, ErrorState } from '../../components/ui'
import { DAMAGE_CLASS_LABELS, LEARN_METHOD_LABELS, MOVE_CATEGORY_LABELS, MOVE_TARGET_LABELS, VERSION_GROUP_LABELS, labelFor } from '../../lib/labels'
import { pickEffect, pickName } from '../../lib/localized'
import { cleanText, cn, formatSlug, normalizeText, uniq } from '../../lib/utils'

interface MoveRow {
  key: string
  move: string
  method: string
  level: number
  versions: string[]
}

type MethodFilter = 'all' | 'level-up' | 'machine' | 'egg' | 'tutor' | 'other'

const METHOD_OPTIONS: Array<{ value: MethodFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'level-up', label: 'Por nivel' },
  { value: 'machine', label: 'MT/MO' },
  { value: 'egg', label: 'Huevo' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'other', label: 'Otros' },
]

export function MovesTab({ pokemon }: { pokemon: Pokemon }) {
  const [versionGroup, setVersionGroup] = useState<string>('all')
  const [method, setMethod] = useState<MethodFilter>('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const versionGroups = useMemo(
    () =>
      uniq(pokemon.moves.flatMap((m) => m.version_group_details.map((d) => d.version_group.name))).sort((a, b) =>
        (VERSION_GROUP_LABELS[a] ?? a).localeCompare(VERSION_GROUP_LABELS[b] ?? b, 'es'),
      ),
    [pokemon],
  )

  const rows = useMemo<MoveRow[]>(() => {
    const map = new Map<string, MoveRow>()
    for (const m of pokemon.moves) {
      for (const d of m.version_group_details) {
        if (versionGroup !== 'all' && d.version_group.name !== versionGroup) continue
        const key = `${m.move.name}|${d.move_learn_method.name}|${d.level_learned_at}`
        const existing = map.get(key)
        if (existing) {
          if (!existing.versions.includes(d.version_group.name)) existing.versions.push(d.version_group.name)
        } else {
          map.set(key, {
            key,
            move: m.move.name,
            method: d.move_learn_method.name,
            level: d.level_learned_at,
            versions: [d.version_group.name],
          })
        }
      }
    }
    const methodOrder = (name: string) => (name === 'level-up' ? 0 : name === 'machine' ? 1 : name === 'egg' ? 2 : name === 'tutor' ? 3 : 4)
    return Array.from(map.values()).sort((a, b) => {
      const byMethod = methodOrder(a.method) - methodOrder(b.method)
      if (byMethod !== 0) return byMethod
      if (a.method === 'level-up' && a.level !== b.level) return a.level - b.level
      return a.move.localeCompare(b.move)
    })
  }, [pokemon, versionGroup])

  const visible = rows.filter((r) => {
    if (method === 'level-up' && r.method !== 'level-up') return false
    if (method === 'machine' && r.method !== 'machine') return false
    if (method === 'egg' && r.method !== 'egg') return false
    if (method === 'tutor' && r.method !== 'tutor') return false
    if (method === 'other' && ['level-up', 'machine', 'egg', 'tutor'].includes(r.method)) return false
    if (search) {
      const q = normalizeText(search).replace(/\s+/g, '-')
      return r.move.includes(q) || normalizeText(formatSlug(r.move)).includes(normalizeText(search))
    }
    return true
  })

  return (
    <Panel>
      <SectionTitle
        action={<span className="text-sm text-slate-400">{visible.length} de {rows.length} movimientos</span>}
      >
        Movimientos
      </SectionTitle>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <input
          type="search"
          className="field"
          placeholder="Buscar movimiento…"
          aria-label="Buscar movimiento"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          ariaLabel="Versión"
          value={versionGroup}
          onChange={setVersionGroup}
          options={[
            { value: 'all', label: 'Todas las versiones' },
            ...versionGroups.map((v) => ({ value: v, label: VERSION_GROUP_LABELS[v] ?? formatSlug(v) })),
          ]}
          className="md:w-72"
        />
      </div>
      <div className="mb-4 overflow-x-auto">
        <Segmented ariaLabel="Método de aprendizaje" options={METHOD_OPTIONS} value={method} onChange={setMethod} />
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">No hay movimientos registrados para esta selección.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Movimiento</th>
                <th className="px-4 py-3 font-semibold">Método</th>
                <th className="px-4 py-3 text-right font-semibold">Nivel</th>
                <th className="px-4 py-3 font-semibold">Versiones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visible.slice(0, 400).map((row) => {
                const isOpen = expanded === row.key
                return (
                  <tr key={row.key} className="align-top">
                    <td colSpan={4} className="p-0">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : row.key)}
                        aria-expanded={isOpen}
                        className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 text-left transition hover:bg-white/5 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_5rem_minmax(0,2fr)]"
                      >
                        <span className="font-medium text-white">{formatSlug(row.move)}</span>
                        <span className="hidden text-slate-300 md:block">{labelFor(LEARN_METHOD_LABELS, row.method)}</span>
                        <span className="hidden text-right font-mono text-slate-300 md:block">{row.method === 'level-up' && row.level > 0 ? row.level : '—'}</span>
                        <span className="hidden truncate text-xs text-slate-400 md:block">
                          {row.versions.map((v) => VERSION_GROUP_LABELS[v] ?? formatSlug(v)).join(', ')}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-950/50"
                          >
                            <MoveDetail name={row.move} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visible.length > 400 && <p className="p-3 text-center text-xs text-slate-500">Mostrando los primeros 400. Refina la búsqueda.</p>}
        </div>
      )}
    </Panel>
  )
}

function MoveDetail({ name }: { name: string }) {
  const query = useMoveQuery(name)
  if (query.isLoading) return <div className="p-4"><Spinner label="Cargando movimiento…" /></div>
  if (query.isError || !query.data) return <div className="p-4"><ErrorState message="No se pudo cargar el movimiento." onRetry={() => query.refetch()} /></div>
  const move = query.data
  const effect = pickEffect(move.effect_entries)
  const category = move.meta?.category?.name
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2 lg:col-span-4">
        <p className="font-display text-lg font-bold text-white">{pickName(move.names, move.name)}</p>
        <p className="mt-1 text-sm text-slate-300">{effect.effect || effect.short || 'Sin descripción disponible.'}</p>
        {effect.effect && effect.short && effect.short !== effect.effect && (
          <p className="mt-1 text-xs text-slate-500">{cleanText(effect.short)}</p>
        )}
      </div>
      <Stat label="Tipo">
        <TypeBadge type={move.type.name} />
      </Stat>
      <Stat label="Clase">{labelFor(DAMAGE_CLASS_LABELS, move.damage_class?.name)}</Stat>
      <Stat label="Potencia">{move.power ?? '—'}</Stat>
      <Stat label="Precisión">{move.accuracy !== null ? `${move.accuracy}%` : '—'}</Stat>
      <Stat label="PP">{move.pp ?? '—'}</Stat>
      <Stat label="Prioridad">{move.priority > 0 ? `+${move.priority}` : move.priority}</Stat>
      <Stat label="Objetivo">{labelFor(MOVE_TARGET_LABELS, move.target?.name)}</Stat>
      <Stat label="Categoría">{labelFor(MOVE_CATEGORY_LABELS, category)}</Stat>
      {move.meta?.ailment && move.meta.ailment.name !== 'none' && (
        <Stat label="Efecto de estado">{formatSlug(move.meta.ailment.name)} ({move.meta.ailment_chance}%)</Stat>
      )}
      {move.contest_type && <Stat label="Concurso">{formatSlug(move.contest_type.name)}</Stat>}
      <div className={cn('sm:col-span-2 lg:col-span-4', 'flex flex-wrap gap-2')}>
        {move.stat_changes.map((s) => (
          <span key={s.stat.name} className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300">
            {formatSlug(s.stat.name)} {s.change > 0 ? '+' : ''}
            {s.change}
          </span>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-0.5 text-sm font-semibold text-slate-100">{children}</div>
    </div>
  )
}
