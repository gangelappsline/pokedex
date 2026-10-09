import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { PokemonEntry } from '../data/models'
import { typeColor } from '../lib/labels'
import { padId } from '../lib/utils'
import { Artwork } from './Artwork'
import { TypeBadge } from './ui'

function gradientFor(types: string[]): string {
  const first = typeColor(types[0] ?? 'normal')
  const second = typeColor(types[1] ?? types[0] ?? 'normal')
  return `linear-gradient(160deg, ${first}55 0%, ${second}22 45%, rgb(15 23 42 / 0.92) 100%)`
}

export const PokemonCard = memo(function PokemonCard({ entry, index = 0 }: { entry: PokemonEntry; index?: number }) {
  const label = entry.displayName
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 24) * 0.02 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link
        to={`/pokemon/${entry.name}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 p-4 shadow-lg transition hover:border-poke-yellow/50 hover:shadow-poke-yellow/10 focus-visible:outline-2 focus-visible:outline-poke-yellow"
        style={{ background: gradientFor(entry.types) }}
      >
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300/80">
          <span className="font-mono">{padId(entry.id)}</span>
          <span className="flex gap-1">
            {!entry.isDefault && <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] uppercase">Forma</span>}
            {entry.species.isLegendary && <span className="rounded-md bg-poke-yellow/90 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-900">Leg.</span>}
            {entry.species.isMythical && <span className="rounded-md bg-fuchsia-400/90 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-900">Mítico</span>}
          </span>
        </div>
        <div className="relative mx-auto my-2 flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-4 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/20" />
          <Artwork id={entry.id} alt={label} className="relative h-full w-full transition duration-300 group-hover:scale-110" />
        </div>
        <h3 className="mt-auto truncate font-display text-lg font-bold text-white">{label}</h3>
        <p className="mb-2 truncate text-xs text-slate-400">{entry.species.genus}</p>
        <div className="flex flex-wrap gap-1.5">
          {entry.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </Link>
    </motion.div>
  )
})
