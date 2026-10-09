import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Search } from 'lucide-react'
import { usePokedexIndex } from '../data/hooks'
import { startPokedexIndex } from '../data/pokedexIndex'
import { filtersToSearchParams, makeFilters } from '../filters/pokedexFilters'
import { IndexStatus } from '../components/IndexStatus'
import { PokemonCard } from '../components/PokemonCard'
import { TypeBadge } from '../components/ui'
import { TYPE_NAMES } from '../lib/labels'
import { formatNumber, normalizeText } from '../lib/utils'

const FEATURED_IDS = [25, 6, 150, 448, 658, 445, 149, 130]

const SECTIONS = [
  { to: '/pokedex', title: 'Pokédex', desc: 'Filtros avanzados por tipo, estadísticas, evolución, huevo, debilidades y mucho más.' },
  { to: '/tipos', title: 'Tipos', desc: 'Tabla de efectividad completa y los Pokémon y movimientos de cada tipo.' },
  { to: '/movimientos', title: 'Movimientos', desc: 'Catálogo con potencia, precisión, prioridad, efectos y quién los aprende.' },
  { to: '/habilidades', title: 'Habilidades', desc: 'Efecto de cada habilidad y los Pokémon que pueden tenerla.' },
  { to: '/objetos', title: 'Objetos', desc: 'Objetos por categoría, con sus efectos y los Pokémon que los llevan.' },
  { to: '/naturalezas', title: 'Naturalezas', desc: 'Qué estadística sube y cuál baja con cada naturaleza.' },
  { to: '/regiones', title: 'Regiones', desc: 'Regiones, generaciones y sus Pokédex regionales.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const { state, entries } = usePokedexIndex()

  const results = useMemo(() => {
    const needle = normalizeText(q.trim())
    if (!needle) return []
    const slug = needle.replace(/\s+/g, '-')
    return entries
      .filter((e) => normalizeText(e.displayName).includes(needle) || e.name.includes(slug) || String(e.id) === needle)
      .slice(0, 8)
  }, [entries, q])

  const featured = useMemo(
    () => FEATURED_IDS.map((id) => entries.find((e) => e.id === id)).filter((e): e is NonNullable<typeof e> => Boolean(e)),
    [entries],
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = q.trim()
    navigate(`/pokedex?${filtersToSearchParams(makeFilters({ query })).toString()}`)
  }

  return (
    <div className="flex flex-col gap-14">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-12 sm:px-12">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-poke-red/20 blur-3xl"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-semibold uppercase tracking-[0.2em] text-poke-yellow">
            Pokédex completa
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-display text-4xl font-extrabold leading-tight text-white sm:text-6xl"
          >
            Explora cada Pokémon, movimiento y objeto del mundo Pokémon.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-4 text-lg text-slate-300">
            Datos de PokéAPI en español. Se guardan en tu navegador para que la siguiente visita sea instantánea.
          </motion.p>

          <form onSubmit={submit} className="relative mt-8 max-w-xl" role="search">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca por nombre o número…"
              aria-label="Buscar Pokémon"
              className="field h-14 rounded-2xl pl-12 pr-32 text-base"
            />
            <button type="submit" className="btn-primary absolute right-2 top-1/2 -translate-y-1/2">
              Buscar
            </button>
          </form>

          {results.length > 0 && (
            <ul className="mt-3 grid max-w-xl gap-1 rounded-2xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl">
              {results.map((e) => (
                <li key={e.name}>
                  <Link to={`/pokemon/${e.name}`} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-100 hover:bg-white/10">
                    <span className="font-semibold">{e.displayName}</span>
                    <span className="flex items-center gap-2">
                      {e.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 max-w-xl">
            <IndexStatus state={state} label="Pokédex" onRetry={() => startPokedexIndex()} compact />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {formatNumber(entries.length)} Pokémon disponibles localmente · {TYPE_NAMES.length} tipos
          </p>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-white">Destacados</h2>
          <Link to="/pokedex" className="inline-flex items-center gap-1 text-sm font-semibold text-poke-yellow hover:underline">
            Ver toda la Pokédex <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {featured.map((e, i) => (
            <PokemonCard key={e.name} entry={e} index={i} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 font-display text-2xl font-bold text-white">Explora</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SECTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-poke-yellow/50 hover:bg-white/10"
            >
              <h3 className="font-display text-lg font-bold text-white group-hover:text-poke-yellow">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
