// Cliente HTTP para PokéAPI con:
//  - límite global de peticiones simultáneas (respeto a la política de uso justo)
//  - reintentos con espera exponencial ante errores de red / 429 / 5xx
//  - cancelación mediante AbortSignal (React Query la usa al desmontar)

export const API_BASE = 'https://pokeapi.co/api/v2'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const MAX_CONCURRENT = 6
let active = 0
const waiting: Array<() => void> = []

async function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++
    return
  }
  await new Promise<void>((resolve) => waiting.push(resolve))
  active++
}

function release(): void {
  active--
  const next = waiting.shift()
  if (next) next()
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Construye la URL absoluta a partir de una ruta relativa (`/pokemon/25`) o de una URL completa de la API. */
export function toApiUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http')) return pathOrUrl
  return `${API_BASE}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

export async function apiGet<T>(pathOrUrl: string, signal?: AbortSignal): Promise<T> {
  const url = toApiUrl(pathOrUrl)
  const maxAttempts = 3
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    await acquire()
    try {
      const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
      if (response.status === 404) {
        throw new ApiError(`No encontrado: ${pathOrUrl}`, 404)
      }
      if (response.status === 429 || response.status >= 500) {
        throw new ApiError(`Error ${response.status} en PokéAPI`, response.status)
      }
      if (!response.ok) {
        throw new ApiError(`Error ${response.status} al pedir ${pathOrUrl}`, response.status)
      }
      return (await response.json()) as T
    } catch (error) {
      lastError = error
      // Errores definitivos: no reintentar.
      if (error instanceof ApiError && error.status !== 429 && error.status < 500) throw error
      if (error instanceof DOMException && error.name === 'AbortError') throw error
    } finally {
      release()
    }
    if (attempt < maxAttempts) await sleep(400 * 2 ** (attempt - 1))
  }

  throw lastError instanceof Error ? lastError : new Error('Error de red al consultar PokéAPI')
}

/** Extrae el id numérico de una URL de recurso (`.../pokemon/25/` → 25). */
export function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : Number.NaN
}
