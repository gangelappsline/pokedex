import { useState } from 'react'
import type { GameRecord } from '../data/games'
import { cn, romanize } from '../lib/utils'

/**
 * Carátula de un juego. Las imágenes se enlazan desde StrategyWiki o Bulbagarden Archives;
 * si el navegador no puede cargarlas, se dibuja una portada de respaldo con el color del juego.
 */
export function GameCover({
  game,
  className,
  eager = false,
  imgClassName,
}: {
  game: GameRecord
  className?: string
  eager?: boolean
  imgClassName?: string
}) {
  const [failed, setFailed] = useState(false)
  const showFallback = failed || !game.cover

  return (
    <div
      className={cn('relative flex items-center justify-center overflow-hidden rounded-xl border border-white/10', className)}
      style={{ background: `linear-gradient(160deg, ${game.accent}44, #0f172a 65%)` }}
    >
      {showFallback ? (
        <FallbackCover game={game} />
      ) : (
        <img
          src={game.cover?.url}
          alt={`Carátula de ${game.title}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-contain p-2 drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]', imgClassName)}
        />
      )}
    </div>
  )
}

function FallbackCover({ game }: { game: GameRecord }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center" aria-hidden>
      <PokeBallGlyph className="h-10 w-10 opacity-70" />
      <p className="font-display text-sm font-bold leading-tight text-white/90">{game.title}</p>
      {game.generation ? (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Generación {romanize(game.generation)}</p>
      ) : null}
    </div>
  )
}

export function PokeBallGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="presentation">
      <circle cx="20" cy="20" r="18" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
      <path d="M2 20a18 18 0 0 1 36 0Z" fill="#e3350d" stroke="#0f172a" strokeWidth="3" />
      <line x1="2" y1="20" x2="38" y2="20" stroke="#0f172a" strokeWidth="3" />
      <circle cx="20" cy="20" r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
    </svg>
  )
}
