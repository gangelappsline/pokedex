import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { BookOpen, Menu, Search, X } from 'lucide-react'
import { usePokedexIndex } from '../data/hooks'
import { cn, formatNumber } from '../lib/utils'
import { ProgressBar } from './ui'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/pokedex', label: 'Pokédex' },
  { to: '/tipos', label: 'Tipos' },
  { to: '/movimientos', label: 'Movimientos' },
  { to: '/habilidades', label: 'Habilidades' },
  { to: '/objetos', label: 'Objetos' },
  { to: '/naturalezas', label: 'Naturalezas' },
  { to: '/regiones', label: 'Regiones' },
]

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Inicio de la Pokédex">
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-[3px] border-slate-900 bg-poke-red shadow-lg shadow-poke-red/30 transition group-hover:rotate-12">
        <span className="absolute inset-x-0 top-0 h-1/2 bg-poke-red" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />
        <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-slate-900" />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-slate-900 bg-white" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-white">
        Poké<span className="text-poke-yellow">dex</span>
      </span>
    </Link>
  )
}

function IndexPill() {
  const { state } = usePokedexIndex()
  if (state.status === 'ready' && state.failedCount === 0) return null
  if (state.status === 'idle') return null
  return (
    <Link
      to="/pokedex"
      className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 md:flex"
      title="Descargando datos de la Pokédex"
    >
      <span className="font-semibold text-poke-yellow">
        {state.status === 'error' ? 'Error de carga' : `Cargando ${formatNumber(state.done)}/${formatNumber(state.total)}`}
      </span>
      {state.status === 'loading' && <ProgressBar value={state.done} max={state.total} className="w-20" />}
    </Link>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex" aria-label="Principal">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <IndexPill />
            <Link to="/pokedex" className="btn-ghost px-3" aria-label="Buscar en la Pokédex">
              <Search className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="btn-ghost px-3 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Abrir menú"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 lg:hidden"
              aria-label="Menú móvil"
            >
              <div className="grid grid-cols-2 gap-1 p-3">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn('rounded-lg px-3 py-2.5 text-sm font-medium', isActive ? 'bg-white/10 text-white' : 'text-slate-300')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Datos y sprites de{' '}
            <a className="font-semibold text-slate-200 underline-offset-4 hover:underline" href="https://pokeapi.co/" target="_blank" rel="noreferrer">
              PokéAPI
            </a>
            . Pokémon y sus nombres son propiedad de Nintendo, Game Freak y The Pokémon Company. Proyecto sin fines comerciales.
          </p>
          <a
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
            href="https://pokeapi.co/docs/v2"
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen className="h-4 w-4" aria-hidden /> Documentación API
          </a>
        </div>
      </footer>
    </div>
  )
}
