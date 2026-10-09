import type { ReactNode } from 'react'
import { Loader2, AlertTriangle, SearchX, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatNumber } from '../lib/utils'
import { typeColor, typeLabel } from '../lib/labels'
import type { NumRange } from '../filters/pokedexFilters'

export function TypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <span
      className={cn('chip', className)}
      style={{ backgroundColor: typeColor(type), textShadow: '0 1px 1px rgb(0 0 0 / 0.35)' }}
    >
      {typeLabel(type)}
    </span>
  )
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('glass p-5 sm:p-6', className)}>{children}</div>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{children}</h2>
      {action}
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400" role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label ?? 'Cargando…'}
    </div>
  )
}

export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/10', className)} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-poke-yellow to-poke-red transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-white/5', className)} />
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass flex flex-col items-center gap-3 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-poke-yellow" aria-hidden />
      <p className="max-w-md text-sm text-slate-300">{message}</p>
      {onRetry && (
        <button className="btn-primary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-2 p-10 text-center">
      <SearchX className="h-10 w-10 text-slate-500" aria-hidden />
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      {hint && <p className="max-w-md text-sm text-slate-400">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
}) {
  if (pageCount <= 1) return null
  const pages = buildPageList(page, pageCount)
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación">
      <button className="btn-ghost px-3" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Página anterior">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-slate-500">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition',
              p === page ? 'bg-poke-yellow text-slate-900' : 'bg-white/5 text-slate-300 hover:bg-white/10',
            )}
          >
            {formatNumber(p)}
          </button>
        ),
      )}
      <button className="btn-ghost px-3" onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Página siguiente">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

function buildPageList(page: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: Array<number | '…'> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) out.push('…')
  for (let p = start; p <= end; p++) out.push(p)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
}

// ---------- Controles de formulario ----------

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export interface ChipOption<T extends string | number> {
  value: T
  label: string
  color?: string
}

export function ChipSelect<T extends string | number>({
  options,
  selected,
  onChange,
  ariaLabel,
}: {
  options: ChipOption<T>[]
  selected: T[]
  onChange: (next: T[]) => void
  ariaLabel: string
}) {
  const toggle = (value: T) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = selected.includes(opt.value)
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(opt.value)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-semibold transition',
              active
                ? 'border-transparent text-white shadow-md'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
            )}
            style={active ? { backgroundColor: opt.color ?? '#3b4cca' } : undefined}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}) {
  return (
    <div className="inline-flex flex-wrap rounded-xl border border-white/10 bg-slate-950/70 p-1" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            value === opt.value ? 'bg-poke-yellow text-slate-900' : 'text-slate-300 hover:text-white',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string }>
  ariaLabel: string
  className?: string
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn('field cursor-pointer appearance-none pr-8', className)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-slate-900">
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export function RangeField({
  label,
  value,
  onChange,
  step = 1,
  unit,
  min = 0,
  max,
}: {
  label: string
  value: NumRange
  onChange: (next: NumRange) => void
  step?: number
  unit?: string
  min?: number
  max?: number
}) {
  const update = (key: 'min' | 'max', raw: string) => {
    const next: NumRange = { ...value }
    if (raw === '') delete next[key]
    else next[key] = Number(raw)
    onChange(next)
  }
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
        {unit && <span className="normal-case text-slate-500">{unit}</span>}
      </span>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          inputMode="decimal"
          aria-label={`${label} mínimo`}
          placeholder="Mín"
          className="field"
          min={min}
          max={max}
          step={step}
          value={value.min ?? ''}
          onChange={(e) => update('min', e.target.value)}
        />
        <input
          type="number"
          inputMode="decimal"
          aria-label={`${label} máximo`}
          placeholder="Máx"
          className="field"
          min={min}
          max={max}
          step={step}
          value={value.max ?? ''}
          onChange={(e) => update('max', e.target.value)}
        />
      </div>
    </div>
  )
}

export function StatRangeBar({ value, max = 255, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

