import { useState } from 'react'
import { artworkUrl, cn, spriteUrl } from '../lib/utils'

/** Imagen oficial de un Pokémon con respaldo al sprite pequeño si no existe la ilustración. */
export function Artwork({
  id,
  alt,
  className,
  eager = false,
}: {
  id: number
  alt: string
  className?: string
  eager?: boolean
}) {
  const [failedId, setFailedId] = useState<number | null>(null)
  const useFallback = failedId === id
  return (
    <img
      src={useFallback ? spriteUrl(id) : artworkUrl(id)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => setFailedId(id)}
      className={cn('select-none object-contain', className)}
    />
  )
}
