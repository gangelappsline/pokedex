import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Skeleton } from './components/ui'
import { startPokedexIndex } from './data/pokedexIndex'

// Cada página se carga bajo demanda para que la entrada inicial sea ligera.
const HomePage = lazy(() => import('./pages/HomePage'))
const PokedexPage = lazy(() => import('./pages/PokedexPage'))
const PokemonDetailPage = lazy(() => import('./pages/PokemonDetailPage'))
const TypesPage = lazy(() => import('./pages/TypesPage'))
const TypeDetailPage = lazy(() => import('./pages/TypeDetailPage'))
const MovesPage = lazy(() => import('./pages/MovesPage'))
const AbilitiesPage = lazy(() => import('./pages/AbilitiesPage'))
const AbilityDetailPage = lazy(() => import('./pages/AbilityDetailPage'))
const ItemsPage = lazy(() => import('./pages/ItemsPage'))
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'))
const NaturesPage = lazy(() => import('./pages/NaturesPage'))
const RegionsPage = lazy(() => import('./pages/RegionsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function Lazy({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-96" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export default function App() {
  // Arranca la descarga reanudable de la Pokédex una sola vez (se reanuda desde IndexedDB).
  useEffect(() => {
    startPokedexIndex()
  }, [])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Lazy><HomePage /></Lazy>} />
        <Route path="pokedex" element={<Lazy><PokedexPage /></Lazy>} />
        <Route path="pokemon/:idOrName" element={<Lazy><PokemonDetailPage /></Lazy>} />
        <Route path="tipos" element={<Lazy><TypesPage /></Lazy>} />
        <Route path="tipos/:name" element={<Lazy><TypeDetailPage /></Lazy>} />
        <Route path="movimientos" element={<Lazy><MovesPage /></Lazy>} />
        <Route path="habilidades" element={<Lazy><AbilitiesPage /></Lazy>} />
        <Route path="habilidades/:name" element={<Lazy><AbilityDetailPage /></Lazy>} />
        <Route path="objetos" element={<Lazy><ItemsPage /></Lazy>} />
        <Route path="objetos/:name" element={<Lazy><ItemDetailPage /></Lazy>} />
        <Route path="naturalezas" element={<Lazy><NaturesPage /></Lazy>} />
        <Route path="regiones" element={<Lazy><RegionsPage /></Lazy>} />
        <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
      </Route>
    </Routes>
  )
}
