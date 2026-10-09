import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, DatabaseZap, RotateCcw, TriangleAlert } from 'lucide-react'
import type { IndexState } from '../data/store'
import { ProgressBar } from './ui'
import { formatNumber } from '../lib/utils'

/** Banner que muestra el progreso de la descarga inicial de datos. */
export function IndexStatus({
  state,
  label,
  onRetry,
  compact = false,
}: {
  state: IndexState
  label: string
  onRetry: () => void
  compact?: boolean
}) {
  const busy = state.status === 'loading'
  const hasIssues = state.status === 'ready' && state.failedCount > 0
  const show = busy || state.status === 'error' || hasIssues

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="index-status"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className={`glass mb-6 flex flex-col gap-3 ${compact ? 'p-4' : 'p-5'}`} role="status" aria-live="polite">
            <div className="flex flex-wrap items-center gap-3">
              {busy && <DatabaseZap className="h-5 w-5 shrink-0 text-poke-yellow" aria-hidden />}
              {state.status === 'error' && <TriangleAlert className="h-5 w-5 shrink-0 text-red-400" aria-hidden />}
              {hasIssues && <TriangleAlert className="h-5 w-5 shrink-0 text-amber-300" aria-hidden />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {state.status === 'error'
                    ? `No se pudo cargar ${label.toLowerCase()}`
                    : hasIssues
                      ? `Algunos datos no se pudieron cargar`
                      : `Preparando ${label.toLowerCase()} (primera vez)…`}
                </p>
                <p className="text-xs text-slate-400">
                  {state.status === 'error'
                    ? state.error
                    : busy
                      ? `${state.phase} · ${formatNumber(state.done)} de ${formatNumber(state.total)}. Los datos se guardan en tu navegador: la próxima visita será instantánea.`
                      : `${state.failedCount} elementos fallaron. Puedes reintentar para completar el catálogo.`}
                </p>
              </div>
              {(state.status === 'error' || hasIssues) && (
                <button className="btn-ghost" onClick={onRetry}>
                  <RotateCcw className="h-4 w-4" /> Reintentar
                </button>
              )}
            </div>
            {busy && <ProgressBar value={state.done} max={state.total} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ReadyBadge({ state }: { state: IndexState }) {
  if (state.status !== 'ready' || state.failedCount > 0) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Datos listos
    </span>
  )
}
