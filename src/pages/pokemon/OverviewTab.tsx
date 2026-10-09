import type { Pokemon, PokemonSpecies } from '../../api/types'
import { AbilityLink, ItemLink } from '../../components/Named'
import { TypeBadge, Panel, SectionTitle } from '../../components/ui'
import { genderSummary, GROWTH_RATE_LABELS, HABITAT_LABELS, COLOR_LABELS, SHAPE_LABELS, EGG_GROUP_LABELS, POKEDEX_LABELS, typeLabel, VERSION_GROUP_LABELS } from '../../lib/labels'
import { pickFlavor, pickGenus, pickName } from '../../lib/localized'
import { formatKg, formatMeters, formatNumber, formatSlug, generationNumber, romanize } from '../../lib/utils'
import { Artwork } from '../../components/Artwork'
import { idFromUrl } from '../../api/client'

export function OverviewTab({ pokemon, species, displayName }: { pokemon: Pokemon; species?: PokemonSpecies; displayName: string }) {
  const flavor = species ? pickFlavor(species.flavor_text_entries) : ''
  const genus = species ? pickGenus(species.genera) : ''
  const gen = species ? romanize(generationNumber(species.generation.name)) : '—'
  const abilities = [...pokemon.abilities].sort((a, b) => a.slot - b.slot)
  const heldItems = pokemon.held_items
  const dexNumbers = species?.pokedex_numbers ?? []

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="flex flex-col gap-6">
        <Panel className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-poke-blue/25 via-transparent to-poke-red/15" />
          <div className="relative flex flex-col items-center text-center">
            <Artwork id={pokemon.id} alt={displayName} eager className="h-64 w-64 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] sm:h-80 sm:w-80" />
            <p className="mt-2 text-sm text-slate-400">{genus}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {pokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} className="px-3 py-1 text-sm" />
              ))}
            </div>
            {flavor && <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-200">“{flavor}”</p>}
          </div>
        </Panel>

        <Panel>
          <SectionTitle>Medidas</SectionTitle>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Info label="Altura" value={formatMeters(pokemon.height / 10)} />
            <Info label="Peso" value={formatKg(pokemon.weight / 10)} />
            <Info label="Experiencia base" value={pokemon.base_experience !== null ? formatNumber(pokemon.base_experience) : '—'} />
            <Info label="Generación" value={`Gen ${gen}`} />
            <Info label="Índice nacional" value={`#${species?.id ?? pokemon.id}`} />
            <Info label="Orden" value={String(pokemon.order)} />
          </dl>
        </Panel>

        {heldItems.length > 0 && (
          <Panel>
            <SectionTitle>Objetos que puede portar</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {heldItems.map((h) => {
                const latest = h.version_details[h.version_details.length - 1]
                return (
                  <div key={h.item.name} className="flex items-center gap-2">
                    <ItemLink name={h.item.name} />
                    {latest && <span className="text-xs text-slate-500">{latest.rarity}% en salvaje</span>}
                  </div>
                )
              })}
            </div>
          </Panel>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <Panel>
          <SectionTitle>Clasificación</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {species?.is_legendary && <Tag color="bg-poke-yellow text-slate-900">Legendario</Tag>}
            {species?.is_mythical && <Tag color="bg-fuchsia-400 text-slate-900">Mítico</Tag>}
            {species?.is_baby && <Tag color="bg-sky-300 text-slate-900">Bebé</Tag>}
            {species && species.varieties.length > 1 && <Tag color="bg-white/15 text-white">{species.varieties.length} variedades</Tag>}
            {!species?.is_legendary && !species?.is_mythical && !species?.is_baby && <Tag color="bg-white/10 text-slate-300">Pokémon común</Tag>}
            {species?.forms_switchable && <Tag color="bg-emerald-400/80 text-slate-900">Cambia de forma</Tag>}
            {species?.has_gender_differences && <Tag color="bg-pink-400/80 text-slate-900">Diferencias de género</Tag>}
          </div>
        </Panel>

        <Panel>
          <SectionTitle>Crianza y captura</SectionTitle>
          <dl className="grid grid-cols-2 gap-4">
            <Info label="Sexo" value={species ? genderSummary(species.gender_rate) : '—'} />
            <Info label="Grupos huevo" value={species ? species.egg_groups.map((g) => EGG_GROUP_LABELS[g.name] ?? formatSlug(g.name)).join(', ') : '—'} />
            <Info label="Ciclos de eclosión" value={species?.hatch_counter !== null && species?.hatch_counter !== undefined ? formatNumber(species.hatch_counter + 1) : '—'} />
            <Info label="Tasa de captura" value={species ? `${species.capture_rate} / 255` : '—'} />
            <Info label="Felicidad base" value={species?.base_happiness != null ? `${species.base_happiness} / 255` : '—'} />
            <Info label="Crecimiento" value={species ? GROWTH_RATE_LABELS[species.growth_rate.name] ?? formatSlug(species.growth_rate.name) : '—'} />
            <Info label="Color" value={species ? COLOR_LABELS[species.color.name] ?? formatSlug(species.color.name) : '—'} />
            <Info label="Forma" value={species?.shape ? SHAPE_LABELS[species.shape.name] ?? formatSlug(species.shape.name) : '—'} />
            <Info label="Hábitat" value={species?.habitat ? HABITAT_LABELS[species.habitat.name] ?? formatSlug(species.habitat.name) : '—'} />
            <Info label="Nombre (inglés)" value={species ? pickName(species.names.filter((n) => n.language.name === 'en'), species.name) : formatSlug(pokemon.name)} />
          </dl>
        </Panel>

        <Panel>
          <SectionTitle>Habilidades</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {abilities.map((a) => (
              <AbilityLink key={a.ability.name} name={a.ability.name} hidden={a.is_hidden} />
            ))}
          </div>
        </Panel>

        {dexNumbers.length > 0 && (
          <Panel>
            <SectionTitle>Números en Pokédex</SectionTitle>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {dexNumbers.map((d) => (
                <li key={d.pokedex.name} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <span className="text-slate-300">{POKEDEX_LABELS[d.pokedex.name] ?? formatSlug(d.pokedex.name)}</span>
                  <span className="font-mono font-semibold text-poke-yellow">#{String(d.entry_number).padStart(3, '0')}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {pokemon.past_types.length > 0 && (
          <Panel>
            <SectionTitle>Tipos en generaciones anteriores</SectionTitle>
            <ul className="flex flex-col gap-2 text-sm">
              {pokemon.past_types.map((pt) => (
                <li key={pt.generation.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                  <span className="text-slate-300">Hasta Gen {romanize(generationNumber(pt.generation.name))}</span>
                  <span className="flex gap-1.5">
                    {pt.types.map((t) => (
                      <TypeBadge key={t.type.name} type={t.type.name} />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel>
          <SectionTitle>Juegos en los que aparece</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(pokemon.game_indices.map((g) => g.version.name)))
              .map((v) => ({ key: v, label: VERSION_GROUP_LABELS[v] ?? formatSlug(v) }))
              .slice(0, 60)
              .map((v) => (
                <span key={v.key} className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300">
                  {v.label}
                </span>
              ))}
          </div>
        </Panel>

        <p className="text-xs text-slate-500">
          Tipos: {pokemon.types.map((t) => typeLabel(t.type.name)).join(' / ')} · ID de especie {idFromUrl(pokemon.species.url)}
        </p>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-100">{value}</dd>
    </div>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${color}`}>{children}</span>
}
