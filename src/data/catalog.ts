// Detalles de catálogos pequeños (habilidades, naturalezas, regiones...) con caché persistente en IndexedDB.
// Cada recurso se pide una sola vez a PokéAPI; las visitas siguientes salen de la caché local.

import { useQueries } from '@tanstack/react-query'
import { cacheGet, cacheSet } from './storage'

export function useCachedDetails<T>(
  resource: string,
  names: string[],
  fetcher: (name: string, signal?: AbortSignal) => Promise<T>,
) {
  return useQueries({
    queries: names.map((name) => ({
      queryKey: [resource, name],
      staleTime: Infinity,
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<T> => {
        const key = `${resource}:${name}`
        const cached = await cacheGet<T>(key)
        if (cached) return cached
        const value = await fetcher(name, signal)
        await cacheSet(key, value)
        return value
      },
    })),
  })
}
