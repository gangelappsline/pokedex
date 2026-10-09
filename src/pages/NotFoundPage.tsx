import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="font-display text-7xl font-extrabold text-poke-yellow">404</p>
      <h1 className="font-display text-2xl font-bold text-white">Esta página no existe</h1>
      <p className="max-w-md text-slate-400">Puede que el enlace esté roto o que el Pokémon se haya escapado de la Pokédex.</p>
      <Link to="/" className="btn-primary mt-2">
        Volver al inicio
      </Link>
    </div>
  )
}
