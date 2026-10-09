import { useState, type ReactNode } from 'react'
import { ChevronDown, Plus, X, RotateCcw } from 'lucide-react'
import {
  WEAKNESS_LEVEL_LABELS,
  type EvolutionFilter,
  type FormFilter,
  type GenderFilter,
  type PokedexFilters,
  type TriState,
  type TypeMatch,
  type WeaknessLevel,
  type AbilityMode,
} from '../filters/pokedexFilters'
import {
  COLOR_LABELS,
  EGG_GROUP_LABELS,
  GROWTH_RATE_LABELS,
  HABITAT_LABELS,
  POKEDEX_LABELS,
  SHAPE_LABELS,
  STAT_LABELS,
  TYPE_LABELS,
  TYPE_NAMES,
  typeColor,
  typeLabel,
} from '../lib/labels'
import { cn, formatSlug, romanize } from '../lib/utils'
import { ChipSelect, Field, RangeField, Segmented, SelectField, TypeBadge, type ChipOption } from './ui'

const COLOR_SWATCH: Record<string, string> = {
  black: '#1f2937',
  blue: '#2563eb',
  brown: '#92400e',
  gray: '#6b7280',
  green: '#16a34a',
  pink: '#db2777',
  purple: '#7e22ce',
  red: '#dc2626',
  white: '#94a3b8',
  yellow: '#ca8a04',
}

const TYPE_OPTIONS: ChipOption<string>[] = TYPE_NAMES.map((t) => ({ value: t, label: typeLabel(t), color: typeColor(t) }))
const GEN_OPTIONS: ChipOption<number>[] = Array.from({ length: 9 }, (_, i) => ({ value: i + 1, label: `Gen ${romanize(i + 1)}` }))
const DEX_OPTIONS: ChipOption<string>[] = [
  'national',
  'kanto',
  'original-johto',
  'hoenn',
  'original-sinnoh',
  'original-unova',
  'kalos-central',
  'original-alola',
  'galar',
  'hisui',
  'paldea',
].map((d) => ({ value: d, label: POKEDEX_LABELS[d] ?? formatSlug(d) }))
const COLOR_OPTIONS: ChipOption<string>[] = Object.entries(COLOR_LABELS).map(([v, label]) => ({
  value: v,
  label,
  color: COLOR_SWATCH[v],
}))
const SHAPE_OPTIONS: ChipOption<string>[] = Object.entries(SHAPE_LABELS).map(([v, label]) => ({ value: v, label }))
const HABITAT_OPTIONS: ChipOption<string>[] = Object.entries(HABITAT_LABELS).map(([v, label]) => ({ value: v, label }))
const EGG_OPTIONS: ChipOption<string>[] = Object.entries(EGG_GROUP_LABELS).map(([v, label]) => ({ value: v, label }))
const GROWTH_OPTIONS: ChipOption<string>[] = Object.entries(GROWTH_RATE_LABELS).map(([v, label]) => ({ value: v, label }))

const TRI_OPTIONS: Array<{ value: TriState; label: string }> = [
  { value: 'any', label: 'Todos' },
  { value: 'yes', label: 'Sí' },
  { value: 'no', label: 'No' },
]

const STAGE_OPTIONS: Array<{ value: EvolutionFilter; label: string }> = [
  { value: 'any', label: 'Cualquiera' },
  { value: 'single', label: 'Sin evoluciones' },
  { value: 'base', label: 'Inicial' },
  { value: 'middle', label: 'Intermedia' },
  { value: 'final', label: 'Final' },
]

const GENDER_OPTIONS: Array<{ value: GenderFilter; label: string }> = [
  { value: 'any', label: 'Cualquiera' },
  { value: 'mixed', label: 'Macho y hembra' },
  { value: 'male-only', label: 'Solo macho' },
  { value: 'female-only', label: 'Solo hembra' },
  { value: 'genderless', label: 'Sin género' },
]

const FORM_OPTIONS: Array<{ value: FormFilter; label: string }> = [
  { value: 'default', label: 'Solo base' },
  { value: 'all', label: 'Todas' },
  { value: 'alternate', label: 'Solo formas' },
]

const TYPE_MATCH_OPTIONS: Array<{ value: TypeMatch; label: string }> = [
  { value: 'any', label: 'Alguno' },
  { value: 'all', label: 'Todos' },
  { value: 'exact', label: 'Exacto' },
]

const ABILITY_MODE_OPTIONS: Array<{ value: AbilityMode; label: string }> = [
  { value: 'any', label: 'Cualquiera' },
  { value: 'normal', label: 'Normal' },
  { value: 'hidden', label: 'Oculta' },
]

const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'] as const
const STAT_MAP: Record<(typeof STAT_KEYS)[number], keyof PokedexFilters['stats']> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'spAttack',
  'special-defense': 'spDefense',
  speed: 'speed',
}

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details className="group border-t border-white/10 py-3 first:border-t-0 first:pt-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-1 font-display text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-white">
        {title}
        <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </details>
  )
}

export interface FilterPanelProps {
  filters: PokedexFilters
  onChange: (next: PokedexFilters) => void
  onReset: () => void
  abilityOptions: string[]
  moveOptions: string[]
  matrixReady: boolean
  className?: string
}

export function FilterPanel({ filters, onChange, onReset, abilityOptions, moveOptions, matrixReady, className }: FilterPanelProps) {
  const [weakType, setWeakType] = useState<string>('fire')
  const [weakLevel, setWeakLevel] = useState<WeaknessLevel>('weak')
  const set = <K extends keyof PokedexFilters>(key: K, value: PokedexFilters[K]) => onChange({ ...filters, [key]: value })

  const addWeakness = () => {
    if (filters.weaknesses.some((w) => w.type === weakType && w.level === weakLevel)) return
    set('weaknesses', [...filters.weaknesses, { type: weakType, level: weakLevel }])
  }

  return (
    <aside className={cn('glass flex flex-col gap-0 p-5', className)} aria-label="Filtros avanzados">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">Filtros</h2>
        <button type="button" onClick={onReset} className="btn-ghost px-3 py-1.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> Limpiar
        </button>
      </div>

      <Section title="Tipos" defaultOpen>
        <ChipSelect ariaLabel="Tipos" options={TYPE_OPTIONS} selected={filters.types} onChange={(v) => set('types', v)} />
        <Field label="Coincidencia">
          <Segmented ariaLabel="Modo de coincidencia de tipos" options={TYPE_MATCH_OPTIONS} value={filters.typeMatch} onChange={(v) => set('typeMatch', v)} />
        </Field>
        <p className="-mt-2 text-xs text-slate-500">
          «Exacto» con un solo tipo busca Pokémon de tipo puro (p. ej. solo Agua).
        </p>
      </Section>

      <Section title="Origen y Pokédex" defaultOpen>
        <Field label="Generación">
          <ChipSelect ariaLabel="Generación" options={GEN_OPTIONS} selected={filters.generations} onChange={(v) => set('generations', v)} />
        </Field>
        <Field label="Pokédex regional">
          <ChipSelect ariaLabel="Pokédex" options={DEX_OPTIONS} selected={filters.pokedexes} onChange={(v) => set('pokedexes', v)} />
        </Field>
        <Field label="Formas">
          <Segmented ariaLabel="Formas" options={FORM_OPTIONS} value={filters.formType} onChange={(v) => set('formType', v)} />
        </Field>
      </Section>

      <Section title="Clasificación">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Legendario">
            <Segmented ariaLabel="Legendario" options={TRI_OPTIONS} value={filters.legendary} onChange={(v) => set('legendary', v)} />
          </Field>
          <Field label="Mítico">
            <Segmented ariaLabel="Mítico" options={TRI_OPTIONS} value={filters.mythical} onChange={(v) => set('mythical', v)} />
          </Field>
          <Field label="Bebé">
            <Segmented ariaLabel="Bebé" options={TRI_OPTIONS} value={filters.baby} onChange={(v) => set('baby', v)} />
          </Field>
          <Field label="Tiene formas">
            <Segmented ariaLabel="Tiene formas" options={TRI_OPTIONS} value={filters.hasForms} onChange={(v) => set('hasForms', v)} />
          </Field>
        </div>
        <Field label="Etapa evolutiva">
          <SelectField ariaLabel="Etapa evolutiva" value={filters.evolutionStage} onChange={(v) => set('evolutionStage', v)} options={STAGE_OPTIONS} />
        </Field>
        <Field label="Género">
          <SelectField ariaLabel="Género" value={filters.gender} onChange={(v) => set('gender', v)} options={GENDER_OPTIONS} />
        </Field>
      </Section>

      <Section title="Estadísticas base">
        {STAT_KEYS.map((key) => {
          const mapped = STAT_MAP[key]
          return (
            <RangeField
              key={key}
              label={STAT_LABELS[key]}
              max={255}
              value={filters.stats[mapped] ?? {}}
              onChange={(range) => {
                const stats = { ...filters.stats }
                if (range.min === undefined && range.max === undefined) delete stats[mapped]
                else stats[mapped] = range
                set('stats', stats)
              }}
            />
          )
        })}
        <RangeField
          label="Total"
          max={1500}
          value={filters.stats.total ?? {}}
          onChange={(range) => {
            const stats = { ...filters.stats }
            if (range.min === undefined && range.max === undefined) delete stats.total
            else stats.total = range
            set('stats', stats)
          }}
        />
      </Section>

      <Section title="Medidas y datos">
        <RangeField label="Altura" unit="metros" step={0.1} value={filters.height} onChange={(v) => set('height', v)} />
        <RangeField label="Peso" unit="kg" step={0.1} value={filters.weight} onChange={(v) => set('weight', v)} />
        <RangeField label="Experiencia base" value={filters.baseExperience} onChange={(v) => set('baseExperience', v)} />
        <RangeField label="Tasa de captura" unit="0–255" max={255} value={filters.captureRate} onChange={(v) => set('captureRate', v)} />
        <RangeField label="Felicidad base" unit="0–255" max={255} value={filters.baseHappiness} onChange={(v) => set('baseHappiness', v)} />
      </Section>

      <Section title="Habilidades y movimientos">
        <Field label="Habilidad" hint="Escribe para buscar entre todas las habilidades">
          <input
            list="ability-options"
            className="field"
            placeholder="p. ej. overgrow"
            value={filters.ability}
            onChange={(e) => set('ability', e.target.value.trim().toLowerCase().replace(/\s+/g, '-'))}
          />
          <datalist id="ability-options">
            {abilityOptions.map((a) => (
              <option key={a} value={a}>
                {formatSlug(a)}
              </option>
            ))}
          </datalist>
        </Field>
        <Field label="Tipo de habilidad">
          <Segmented ariaLabel="Tipo de habilidad" options={ABILITY_MODE_OPTIONS} value={filters.abilityMode} onChange={(v) => set('abilityMode', v)} />
        </Field>
        <Field label="Puede aprender movimiento" hint="Cualquier método o generación">
          <input
            list="move-options"
            className="field"
            placeholder="p. ej. swords-dance"
            value={filters.move}
            onChange={(e) => set('move', e.target.value.trim().toLowerCase().replace(/\s+/g, '-'))}
          />
          <datalist id="move-options">
            {moveOptions.map((m) => (
              <option key={m} value={m}>
                {formatSlug(m)}
              </option>
            ))}
          </datalist>
        </Field>
      </Section>

      <Section title="Debilidades y resistencias">
        {!matrixReady && <p className="text-xs text-slate-500">Cargando tabla de tipos…</p>}
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-3">
          <div className="grid grid-cols-2 gap-2">
            <SelectField
              ariaLabel="Tipo atacante"
              value={weakType}
              onChange={setWeakType}
              options={TYPE_NAMES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
            />
            <SelectField
              ariaLabel="Nivel de efectividad"
              value={weakLevel}
              onChange={setWeakLevel}
              options={(Object.keys(WEAKNESS_LEVEL_LABELS) as WeaknessLevel[]).map((l) => ({ value: l, label: WEAKNESS_LEVEL_LABELS[l] }))}
            />
          </div>
          <button type="button" className="btn-primary w-full py-2" onClick={addWeakness} disabled={!matrixReady}>
            <Plus className="h-4 w-4" /> Añadir regla
          </button>
        </div>
        {filters.weaknesses.length > 0 && (
          <ul className="flex flex-col gap-2">
            {filters.weaknesses.map((rule, index) => (
              <li key={`${rule.type}-${rule.level}-${index}`} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs">
                <span className="flex items-center gap-2">
                  <TypeBadge type={rule.type} /> <span className="text-slate-300">{WEAKNESS_LEVEL_LABELS[rule.level]}</span>
                </span>
                <button
                  type="button"
                  aria-label="Quitar regla"
                  className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                  onClick={() => set('weaknesses', filters.weaknesses.filter((_, i) => i !== index))}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-500">Todas las reglas deben cumplirse a la vez.</p>
      </Section>

      <Section title="Clasificación biológica">
        <Field label="Color">
          <ChipSelect ariaLabel="Color" options={COLOR_OPTIONS} selected={filters.colors} onChange={(v) => set('colors', v)} />
        </Field>
        <Field label="Forma">
          <ChipSelect ariaLabel="Forma" options={SHAPE_OPTIONS} selected={filters.shapes} onChange={(v) => set('shapes', v)} />
        </Field>
        <Field label="Hábitat">
          <ChipSelect ariaLabel="Hábitat" options={HABITAT_OPTIONS} selected={filters.habitats} onChange={(v) => set('habitats', v)} />
        </Field>
        <Field label="Grupo huevo">
          <ChipSelect ariaLabel="Grupo huevo" options={EGG_OPTIONS} selected={filters.eggGroups} onChange={(v) => set('eggGroups', v)} />
        </Field>
        <Field label="Velocidad de crecimiento">
          <ChipSelect ariaLabel="Velocidad de crecimiento" options={GROWTH_OPTIONS} selected={filters.growthRates} onChange={(v) => set('growthRates', v)} />
        </Field>
      </Section>
    </aside>
  )
}
