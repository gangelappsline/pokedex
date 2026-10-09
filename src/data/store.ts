// Pequeño store observable compatible con useSyncExternalStore de React.

export interface ExternalStore<S> {
  get: () => S
  set: (next: S) => void
  subscribe: (listener: () => void) => () => void
}

export function createExternalStore<S>(initial: S): ExternalStore<S> {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set: (next) => {
      state = next
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

/** Ejecuta `worker` sobre todos los items con un máximo de `concurrency` tareas a la vez. */
export async function runPool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++]
      await worker(item)
    }
  })
  await Promise.all(runners)
}

export interface IndexState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  phase: string
  total: number
  done: number
  failedCount: number
  error: string | null
  /** se incrementa cuando cambian los datos para que los componentes recalculen */
  revision: number
}

export const INITIAL_INDEX_STATE: IndexState = {
  status: 'idle',
  phase: '',
  total: 0,
  done: 0,
  failedCount: 0,
  error: null,
  revision: 0,
}
