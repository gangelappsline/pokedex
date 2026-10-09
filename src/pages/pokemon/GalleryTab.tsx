import type { Pokemon } from '../../api/types'
import { Panel, SectionTitle } from '../../components/ui'

interface Tile {
  label: string
  src: string
}

function collect(pokemon: Pokemon): Tile[] {
  const s = pokemon.sprites
  const other = s.other
  const candidates: Array<[string, string | null | undefined]> = [
    ['Frente', s.front_default],
    ['Frente brillante', s.front_shiny],
    ['Espalda', s.back_default],
    ['Espalda brillante', s.back_shiny],
    ['Hembra (frente)', s.front_female],
    ['Hembra brillante (frente)', s.front_shiny_female],
    ['Hembra (espalda)', s.back_female],
    ['Hembra brillante (espalda)', s.back_shiny_female],
    ['Ilustración oficial', other?.['official-artwork']?.front_default],
    ['Ilustración oficial brillante', other?.['official-artwork']?.front_shiny],
    ['HOME', other?.home?.front_default],
    ['HOME brillante', other?.home?.front_shiny],
    ['HOME hembra', other?.home?.front_female],
    ['Dream World', other?.dream_world?.front_default],
    ['Showdown animado', other?.showdown?.front_default],
    ['Showdown animado brillante', other?.showdown?.front_shiny],
    ['Showdown espalda animada', other?.showdown?.back_default],
    ['Showdown espalda brillante', other?.showdown?.back_shiny],
  ]
  return candidates.flatMap(([label, src]) => (src ? [{ label, src }] : []))
}

export function GalleryTab({ pokemon }: { pokemon: Pokemon }) {
  const tiles = collect(pokemon)
  const cries = pokemon.cries

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <SectionTitle>Sprites y arte</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((tile) => (
            <figure
              key={tile.label + tile.src}
              className="flex flex-col items-center rounded-2xl border border-white/10 bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_25%,transparent_25%),linear-gradient(-45deg,rgba(255,255,255,0.04)_25%,transparent_25%)] bg-[length:20px_20px] p-4"
            >
              <img src={tile.src} alt={`${pokemon.name} · ${tile.label}`} loading="lazy" className="h-36 w-36 object-contain [image-rendering:auto]" />
              <figcaption className="mt-2 text-center text-xs font-medium text-slate-300">{tile.label}</figcaption>
            </figure>
          ))}
        </div>
      </Panel>

      {(cries.latest || cries.legacy) && (
        <Panel>
          <SectionTitle>Gritos</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {cries.latest && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="mb-2 text-sm font-semibold text-white">Grito actual</p>
                <audio controls preload="none" src={cries.latest} className="w-full" />
              </div>
            )}
            {cries.legacy && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="mb-2 text-sm font-semibold text-white">Grito clásico</p>
                <audio controls preload="none" src={cries.legacy} className="w-full" />
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  )
}
