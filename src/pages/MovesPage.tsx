import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMoveIndex } from '../data/hooks'
import { startMoveIndex } from '../data/moveIndex'
import type { MoveRecord } from '../data/models'
import { IndexStatus } from '../components/IndexStatus'
import { EmptyState, Field, Pagination, SelectField, TypeBadge } from '../components/ui'
import { DAMAGE_CLASS_LABELS, MOVE_CATEGORY_LABELS, MOVE_TARGET_LABELS, TYPE_NAMES, labelFor, typeLabel } from '../lib/labels'
import { clamp, cleanText, formatNumber, normalizeText } from '../lib/utils'

const PAGE_SIZE = 50

type SortMove = 'name' | 'power' | 'accuracy' | 'pp' | 'learned' | 'priority' | 'generation'

const SORT_OPTIONS: Array<{ value: SortMove; label: string }> = [
  { value: 'name', label: 'Nombre (A–Z)' },
  { value: 'power', label: 'Potencia (mayor primero)' },
  { value: 'accuracy', label: 'Precisión (mayor primero)' },
  { value: 'pp', label: 'PP (mayor primero)' },
  { value: 'learned', label: 'Pokémon que lo aprenden' },
  { value: 'priority', label: 'Prioridad' },
  { value: 'generation', label: 'Generación (más reciente)' },
]

const DAMAGE_OPTIONS = Object.entries(DAMAGE_CLASS_LABELS).map(([value, label]) => ({ value, label }))
const TARGET_OPTIONS = Object.entries(MOVE_TARGET_LABELS).map(([value, label]) => ({ value, label }))
const CATEGORY_OPTIONS = Object.entries(MOVE_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function num(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key)
  if (raw === null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export default function MovesPage() {
  const [params, setParams] = useSearchParams()
  const { state, moves } = useMoveIndex()

  useEffect(() => {
    startMoveIndex()
  }, [])

  const f = useMemo(
    () => ({
      q: params.get('q') ?? '',
      type: params.get('type') ?? '',
      damage: params.get('damage') ?? '',
      target: params.get('target') ?? '',
      category: params.get('category') ?? '',
      generation: num(params, 'gen'),
      minPower: num(params, 'minPower'),
      minAccuracy: num(params, 'minAcc'),
      minLearned: num(params, 'learned'),
      priority: params.get('priority') ?? 'any',
      ailment: params.get('ailment') ?? 'any',
      sort: (params.get('sort') as SortMove) ?? 'name',
    }),
    [params],
  )
  const page = Math.max(1, Number(params.get('page')) || 1)

  const filtered = useMemo(() => {
    const q = normalizeText(f.q.trim())
    const rows = moves.filter((m: MoveRecord) => {
      if (f.type && m.type !== f.type) return false
      if (f.damage && m.damageClass !== f.damage) return false
      if (f.target && m.target !== f.target) return false
      if (f.category && m.category !== f.category) return false
      if (f.generation !== null && m.generation !== f.generation) return false
      if (f.minPower !== null && (m.power ?? 0) < f.minPower) return false
      if (f.minAccuracy !== null && (m.accuracy ?? 0) < f.minAccuracy) return false
      if (f.minLearned !== null && m.learnedByCount < f.minLearned) return false
      if (f.priority === 'pos' && m.priority <= 0) return false
      if (f.priority === 'zero' && m.priority !== 0) return false
      if (f.priority === 'neg' && m.priority >= 0) return false
      if (f.ailment === 'yes' && !m.ailment) return false
      if (f.ailment === 'no' && m.ailment) return false
      if (q) {
        const hay = normalizeText(`${m.displayName} ${m.name} ${m.effect}`)
        if (!hay.includes(q)) return false
      }
      return true
    })
    const cmpDesc = (a: number | null, b: number | null) => (b ?? -1) - (a ?? -1)
    rows.sort((a, b) => {
      switch (f.sort) {
        case 'power':
          return cmpDesc(a.power, b.power) || a.displayName.localeCompare(b.displayName, 'es')
        case 'accuracy':
          return cmpDesc(a.accuracy, b.accuracy) || a.displayName.localeCompare(b.displayName, 'es')
        case 'pp':
          return cmpDesc(a.pp, b.pp) || a.displayName.localeCompare(b.displayName, 'es')
        case 'learned':
          return b.learnedByCount - a.learnedByCount || a.displayName.localeCompare(b.displayName, 'es')
        case 'priority':
          return b.priority - a.priority || a.displayName.localeCompare(b.displayName, 'es')
        case 'generation':
          return b.generation - a.generation || a.displayName.localeCompare(b.displayName, 'es')
        default:
          return a.displayName.localeCompare(b.displayName, 'es')
      }
    })
    return rows
  }, [moves, f])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = clamp(page, 1, pageCount)
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '' || value === 'any') next.delete(key)
      else next.set(key, value)
    }
    if (!('page' in patch)) next.delete('page')
    setParams(next, { replace: true })
  }

  const activeCount = [f.q, f.type, f.damage, f.target, f.category, f.generation, f.minPower, f.minAccuracy, f.minLearned]
    .filter((v) => v !== '' && v !== null).length + (f.priority !== 'any' ? 1 : 0) + (f.ailment !== 'any' ? 1 : 0)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-white">Movimientos</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Catálogo completo de movimientos con filtros de tipo, clase de daño, potencia, precisión, prioridad y efectos.
          </p>
        </div>
        <IndexStatus state={state} label="Catálogo de movimientos" onRetry={() => startMoveIndex()} compact />
      </header>

      <div className="glass grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Buscar (nombre o efecto)">
          <input className="field" type="search" value={f.q} placeholder="Ej.: quemadura, rayo…" onChange={(e) => update({ q: e.target.value })} />
        </Field>
        <Field label="Tipo">
          <SelectField
            ariaLabel="Tipo de movimiento"
            value={f.type}
            onChange={(v) => update({ type: v })}
            options={[{ value: '', label: 'Todos los tipos' }, ...TYPE_NAMES.map((t) => ({ value: t, label: typeLabel(t) }))]}
          />
        </Field>
        <Field label="Clase de daño">
          <SelectField
            ariaLabel="Clase de daño"
            value={f.damage}
            onChange={(v) => update({ damage: v })}
            options={[{ value: '', label: 'Todas' }, ...DAMAGE_OPTIONS]}
          />
        </Field>
        <Field label="Generación">
          <SelectField
            ariaLabel="Generación"
            value={f.generation === null ? '' : String(f.generation)}
            onChange={(v) => update({ gen: v })}
            options={[{ value: '', label: 'Todas' }, ...GENERATIONS.map((g) => ({ value: String(g), label: `Generación ${g}` }))]}
          />
        </Field>
        <Field label="Objetivo">
          <SelectField ariaLabel="Objetivo" value={f.target} onChange={(v) => update({ target: v })} options={[{ value: '', label: 'Cualquiera' }, ...TARGET_OPTIONS]} />
        </Field>
        <Field label="Categoría">
          <SelectField ariaLabel="Categoría" value={f.category} onChange={(v) => update({ category: v })} options={[{ value: '', label: 'Cualquiera' }, ...CATEGORY_OPTIONS]} />
        </Field>
        <Field label="Prioridad">
          <SelectField
            ariaLabel="Prioridad"
            value={f.priority}
            onChange={(v) => update({ priority: v })}
            options={[
              { value: 'any', label: 'Cualquiera' },
              { value: 'pos', label: 'Positiva (se mueve antes)' },
              { value: 'zero', label: 'Normal (0)' },
              { value: 'neg', label: 'Negativa (se mueve después)' },
            ]}
          />
        </Field>
        <Field label="Efecto de estado">
          <SelectField
            ariaLabel="Efecto de estado"
            value={f.ailment}
            onChange={(v) => update({ ailment: v })}
            options={[
              { value: 'any', label: 'Cualquiera' },
              { value: 'yes', label: 'Con estado (quemar, paralizar…)' },
              { value: 'no', label: 'Sin estado' },
            ]}
          />
        </Field>
        <Field label={`Potencia mínima${f.minPower !== null ? `: ${f.minPower}` : ''}`}>
          <input
            className="field"
            type="range"
            min={0}
            max={250}
            step={5}
            value={f.minPower ?? 0}
            aria-label="Potencia mínima"
            onChange={(e) => update({ minPower: e.target.value === '0' ? null : e.target.value })}
          />
        </Field>
        <Field label={`Precisión mínima${f.minAccuracy !== null ? `: ${f.minAccuracy}%` : ''}`}>
          <input
            className="field"
            type="range"
            min={0}
            max={100}
            step={5}
            value={f.minAccuracy ?? 0}
            aria-label="Precisión mínima"
            onChange={(e) => update({ minAcc: e.target.value === '0' ? null : e.target.value })}
          />
        </Field>
        <Field label="Aprendido por al menos">
          <SelectField
            ariaLabel="Aprendido por al menos"
            value={f.minLearned === null ? '' : String(f.minLearned)}
            onChange={(v) => update({ learned: v })}
            options={[
              { value: '', label: 'Cualquier número' },
              { value: '1', label: '1 o más Pokémon' },
              { value: '10', label: '10 o más Pokémon' },
              { value: '50', label: '50 o más Pokémon' },
              { value: '100', label: '100 o más Pokémon' },
            ]}
          />
        </Field>
        <Field label="Ordenar por">
          <SelectField ariaLabel="Ordenar por" value={f.sort} onChange={(v) => update({ sort: v })} options={SORT_OPTIONS} />
        </Field>
        <div className="flex items-end justify-between gap-3 sm:col-span-2 xl:col-span-4">
          <p className="text-sm text-slate-400">
            {formatNumber(filtered.length)} movimientos{activeCount > 0 ? ` · ${activeCount} filtro(s) activo(s)` : ''}
          </p>
          {activeCount > 0 && (
            <button type="button" className="btn-ghost" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {state.status === 'loading' && moves.length === 0 ? null : filtered.length === 0 ? (
        <EmptyState title="Ningún movimiento coincide" hint="Prueba a quitar algún filtro." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Movimiento</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Clase</th>
                <th className="px-4 py-3 text-right">Potencia</th>
                <th className="px-4 py-3 text-right">Precisión</th>
                <th className="px-4 py-3 text-right">PP</th>
                <th className="px-4 py-3 text-right">Prio.</th>
                <th className="px-4 py-3">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pageRows.map((m) => (
                <tr key={m.id} className="align-top hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white">{m.displayName}</td>
                  <td className="px-4 py-3">
                    <TypeBadge type={m.type} />
                  </td>
                  <td className="px-4 py-3 text-slate-300">{labelFor(DAMAGE_CLASS_LABELS, m.damageClass)}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-200">{m.power ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-200">{m.accuracy !== null ? `${m.accuracy}%` : '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-200">{m.pp ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-200">{m.priority > 0 ? `+${m.priority}` : m.priority}</td>
                  <td className="max-w-md px-4 py-3 text-xs text-slate-400">{cleanText(m.effect) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={currentPage} pageCount={pageCount} onChange={(p) => update({ page: String(p) })} />

      <p className="text-center text-xs text-slate-500">
        ¿Buscas los movimientos de un Pokémon concreto? Abre su ficha en la <Link to="/pokedex" className="underline">Pokédex</Link>.
      </p>
    </div>
  )
}
