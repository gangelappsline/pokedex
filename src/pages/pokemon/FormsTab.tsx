import { Link } from 'react-router-dom'
import type { Pokemon, PokemonSpecies } from '../../api/types'
import { idFromUrl } from '../../api/client'
import { Artwork } from '../../components/Artwork'
import { Panel, SectionTitle, TypeBadge } from '../../components/ui'
import { formatPokemonDisplayName, pickName } from '../../lib/localized'
import { formatSlug, padId } from '../../lib/utils'

export function FormsTab({ pokemon, species }: { pokemon: Pokemon; species?: PokemonSpecies }) {
  const speciesName = species?.name ?? pokemon.species.name
  const speciesDisplay = species ? pickName(species.names, species.name) : formatSlug(speciesName)
  const varieties = species?.varieties ?? []
  const descriptions = (species?.form_descriptions ?? []).filter((d) => d.language.name === 'es' || d.language.name === 'en')

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <SectionTitle>Variedades de la especie</SectionTitle>
        {varieties.length === 0 ? (
          <p className="text-sm text-slate-400">Esta especie tiene una única variedad.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {varieties.map((v) => {
              const id = idFromUrl(v.pokemon.url)
              const label = formatPokemonDisplayName(v.pokemon.name, speciesName, speciesDisplay)
              const current = v.pokemon.name === pokemon.name
              return (
                <Link
                  key={v.pokemon.name}
                  to={`/pokemon/${v.pokemon.name}`}
                  className={`flex flex-col items-center rounded-2xl border p-3 text-center transition hover:bg-white/10 ${
                    current ? 'border-poke-yellow bg-poke-yellow/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <Artwork id={id} alt={label} className="h-28 w-28" />
                  <span className="font-mono text-xs text-slate-500">{padId(id)}</span>
                  <span className="font-semibold text-white">{label}</span>
                  {v.is_default && <span className="mt-1 text-[10px] font-bold uppercase text-emerald-300">Por defecto</span>}
                </Link>
              )
            })}
          </div>
        )}
      </Panel>

      {pokemon.forms.length > 0 && (
        <Panel>
          <SectionTitle>Formas de este Pokémon</SectionTitle>
          <ul className="flex flex-wrap gap-2">
            {pokemon.forms.map((f) => (
              <li key={f.name} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-200">
                {formatPokemonDisplayName(f.name, speciesName, speciesDisplay)}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {descriptions.length > 0 && (
        <Panel>
          <SectionTitle>Descripción de las formas</SectionTitle>
          <ul className="flex flex-col gap-3 text-sm leading-relaxed text-slate-300">
            {descriptions.map((d, i) => (
              <li key={i}>{d.description.replace(/[\n\f]+/g, ' ')}</li>
            ))}
          </ul>
        </Panel>
      )}

      {species?.forms_switchable && (
        <p className="text-sm text-slate-400">
          Este Pokémon puede cambiar de forma durante el juego: sus tipos y estadísticas pueden variar.
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        Tipos de esta variante:
        {pokemon.types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name} />
        ))}
      </div>
    </div>
  )
}
