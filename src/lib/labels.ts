// Etiquetas en español para los identificadores que devuelve PokéAPI.
// Los nombres de Pokémon, habilidades, objetos, etc. se toman de la API (campo `names`);
// aquí solo se traducen los catálogos cerrados (tipos, estadísticas, colores...).

export const TYPE_NAMES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const

export type TypeName = (typeof TYPE_NAMES)[number]

export const TYPE_LABELS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
  stellar: 'Astral',
  unknown: 'Desconocido',
}

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#D4A900',
  grass: '#7AC74C',
  ice: '#5FB8B2',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#B8913F',
  flying: '#7F6FE0',
  psychic: '#F95587',
  bug: '#8BA00F',
  rock: '#A38C21',
  ghost: '#5C4A8C',
  dragon: '#5B2EE0',
  dark: '#5A4636',
  steel: '#8E8EA8',
  fairy: '#D685AD',
  stellar: '#40B5A5',
  unknown: '#68A090',
}

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type
}

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#64748b'
}

export const STAT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque Especial',
  'special-defense': 'Defensa Especial',
  speed: 'Velocidad',
}

export const STAT_SHORT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Atq',
  defense: 'Def',
  'special-attack': 'AtqE',
  'special-defense': 'DefE',
  speed: 'Vel',
}

export const COLOR_LABELS: Record<string, string> = {
  black: 'Negro',
  blue: 'Azul',
  brown: 'Marrón',
  gray: 'Gris',
  green: 'Verde',
  pink: 'Rosa',
  purple: 'Morado',
  red: 'Rojo',
  white: 'Blanco',
  yellow: 'Amarillo',
}

export const SHAPE_LABELS: Record<string, string> = {
  ball: 'Esfera',
  squiggle: 'Tirabuzón',
  fish: 'Pez',
  arms: 'Brazos',
  blob: 'Masa informe',
  upright: 'Bípedo',
  legs: 'Patas',
  quadruped: 'Cuadrúpedo',
  wings: 'Alas',
  tentacles: 'Tentáculos',
  heads: 'Muchas cabezas',
  humanoid: 'Humanoide',
  'bug-wings': 'Alas de insecto',
  armor: 'Armadura',
}

export const HABITAT_LABELS: Record<string, string> = {
  cave: 'Cueva',
  forest: 'Bosque',
  grassland: 'Pradera',
  mountain: 'Montaña',
  rare: 'Rara',
  'rough-terrain': 'Terreno abrupto',
  sea: 'Mar',
  urban: 'Urbano',
  'waters-edge': 'Orilla del agua',
}

export const EGG_GROUP_LABELS: Record<string, string> = {
  monster: 'Monstruo',
  water1: 'Agua 1',
  water2: 'Agua 2',
  water3: 'Agua 3',
  bug: 'Bicho',
  flying: 'Volador',
  ground: 'Campo',
  fairy: 'Hada',
  plant: 'Planta',
  humanoid: 'Humanoide',
  mineral: 'Mineral',
  indeterminate: 'Amorfo',
  ditto: 'Ditto',
  dragon: 'Dragón',
  'no-eggs': 'Sin huevos',
}

export const GROWTH_RATE_LABELS: Record<string, string> = {
  slow: 'Lento',
  'medium-slow': 'Medio-lento',
  medium: 'Medio',
  'medium-fast': 'Medio-rápido',
  fast: 'Rápido',
  'slow-then-very-fast': 'Lento y luego muy rápido',
  'fast-then-very-slow': 'Rápido y luego muy lento',
}

export const POKEDEX_LABELS: Record<string, string> = {
  national: 'Nacional',
  kanto: 'Kanto',
  'original-johto': 'Johto (original)',
  'updated-johto': 'Johto (actualizada)',
  hoenn: 'Hoenn',
  'updated-hoenn': 'Hoenn (actualizada)',
  'original-sinnoh': 'Sinnoh (original)',
  'extended-sinnoh': 'Sinnoh (extendida)',
  'original-unova': 'Teselia (original)',
  'updated-unova': 'Teselia (actualizada)',
  'kalos-central': 'Kalos central',
  'kalos-coastal': 'Kalos costera',
  'kalos-mountain': 'Kalos montañosa',
  'original-alola': 'Alola (original)',
  'updated-alola': 'Alola (actualizada)',
  'original-melemele': 'Melemele',
  'original-akala': 'Akala',
  'original-ulaula': 'Ulaula',
  'original-poni': 'Poni',
  'updated-melemele': 'Melemele (actualizada)',
  'updated-akala': 'Akala (actualizada)',
  'updated-ulaula': 'Ulaula (actualizada)',
  'updated-poni': 'Poni (actualizada)',
  galar: 'Galar',
  'isle-of-armor': 'Isla de la Armadura',
  'crown-tundra': 'Tundra Corona',
  hisui: 'Hisui',
  paldea: 'Paldea',
  kitakami: 'Kitakami',
  blueberry: 'Bayas Azules',
}

export const LEARN_METHOD_LABELS: Record<string, string> = {
  'level-up': 'Por nivel',
  machine: 'MT / MO',
  egg: 'Huevo',
  tutor: 'Tutor',
  'stadium-surfing-pikachu': 'Surf de Pikachu',
  'light-ball-egg': 'Huevo Bola de Luz',
  'form-change': 'Cambio de forma',
  'zygarde-cube': 'Cubo Zygarde',
  'colosseum-purification': 'Purificación',
  'xd-shadow': 'Sombra (XD)',
  'xd-purification': 'Purificación (XD)',
  'use-item': 'Usar objeto',
}

export const DAMAGE_CLASS_LABELS: Record<string, string> = {
  physical: 'Físico',
  special: 'Especial',
  status: 'Estado',
}

export const AILMENT_LABELS: Record<string, string> = {
  none: 'Ninguno',
  paralysis: 'Parálisis',
  sleep: 'Sueño',
  freeze: 'Congelación',
  burn: 'Quemadura',
  poison: 'Envenenamiento',
  confusion: 'Confusión',
  infatuation: 'Enamoramiento',
  trap: 'Atrapado',
  nightmare: 'Pesadilla',
  torment: 'Tormento',
  disable: 'Anulación',
  yawn: 'Bostezo',
  'heal-block': 'Bloqueo de curación',
  'no-type-immunity': 'Ignora inmunidad',
  leech: 'Drenaje',
  'perish-song': 'Canción mortal',
  unknown: 'Desconocido',
}

export const MOVE_TARGET_LABELS: Record<string, string> = {
  'specific-move': 'Movimiento específico',
  'selected-pokemon-me-first': 'Pokémon elegido (Me First)',
  ally: 'Aliado',
  'users-field': 'Campo del usuario',
  'user-or-ally': 'Usuario o aliado',
  'opponents-field': 'Campo rival',
  user: 'Usuario',
  'random-opponent': 'Rival aleatorio',
  'all-other-pokemon': 'Todos los demás',
  'selected-pokemon': 'Pokémon seleccionado',
  'all-opponents': 'Todos los rivales',
  'entire-field': 'Campo completo',
  'user-and-allies': 'Usuario y aliados',
  'all-pokemon': 'Todos los Pokémon',
  'all-allies': 'Todos los aliados',
  fainting: 'Pokémon debilitado',
}

export const MOVE_CATEGORY_LABELS: Record<string, string> = {
  damage: 'Daño',
  ailment: 'Estado alterado',
  'net-good-stats': 'Mejora de estadísticas',
  heal: 'Curación',
  'damage+ailment': 'Daño + estado',
  swagger: 'Provoca confusión',
  'damage+lower': 'Daño + reduce estadística',
  'damage+raise': 'Daño + sube estadística',
  'damage+heal': 'Daño + curación',
  'ohko': 'Un golpe debilitante',
  'whole-field-effect': 'Efecto de campo',
  'field-effect': 'Efecto de campo',
  'force-switch': 'Cambio forzado',
  unique: 'Especial',
}

export const GENDER_LABELS = {
  genderless: 'Sin género',
  maleOnly: 'Solo macho',
  femaleOnly: 'Solo hembra',
  mixed: 'Macho y hembra',
} as const

export function genderSummary(rate: number): string {
  if (rate === -1) return GENDER_LABELS.genderless
  if (rate === 0) return GENDER_LABELS.maleOnly
  if (rate === 8) return GENDER_LABELS.femaleOnly
  const female = (rate / 8) * 100
  return `♂ ${(100 - female).toFixed(1).replace('.0', '')}% · ♀ ${female.toFixed(1).replace('.0', '')}%`
}

export const VERSION_GROUP_LABELS: Record<string, string> = {
  'red-blue': 'Rojo / Azul',
  yellow: 'Amarillo',
  'gold-silver': 'Oro / Plata',
  crystal: 'Cristal',
  'ruby-sapphire': 'Rubí / Zafiro',
  emerald: 'Esmeralda',
  'firered-leafgreen': 'Rojo fuego / Verde hoja',
  'diamond-pearl': 'Diamante / Perla',
  platinum: 'Platino',
  'heartgold-soulsilver': 'Oro HG / Plata SS',
  'black-white': 'Negro / Blanco',
  'colosseum': 'Colosseum',
  'xd': 'XD',
  'black-2-white-2': 'Negro 2 / Blanco 2',
  'x-y': 'X / Y',
  'omega-ruby-alpha-sapphire': 'Rubí Omega / Zafiro Alfa',
  'sun-moon': 'Sol / Luna',
  'ultra-sun-ultra-moon': 'Ultrasol / Ultraluna',
  'lets-go-pikachu-lets-go-eevee': "Let's Go Pikachu / Eevee",
  'sword-shield': 'Espada / Escudo',
  'the-isle-of-armor': 'Isla de la Armadura',
  'the-crown-tundra': 'Tundra Corona',
  'brilliant-diamond-and-shining-pearl': 'Diamante Brillante / Perla Reluciente',
  'legends-arceus': 'Leyendas Pokémon: Arceus',
  'scarlet-violet': 'Escarlata / Púrpura',
  'the-teal-mask': 'Máscara Turquesa',
  'the-indigo-disk': 'Disco Índigo',
  'legends-za': 'Leyendas Pokémon: Z-A',
  'mega-dimension': 'Dimensión Mega',
}

export function labelFor(map: Record<string, string>, key: string | null | undefined, fallback?: string): string {
  if (!key) return fallback ?? '—'
  return map[key] ?? fallback ?? key.replace(/-/g, ' ')
}
