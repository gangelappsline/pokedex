# Pokédex

Pokédex completa en español construida con **React**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **motion** y **React Router**. Los datos vienen de [PokéAPI](https://pokeapi.co/docs/v2).

## Secciones

- **Inicio**: buscador rápido por nombre o número y destacados.
- **Pokédex**: filtros avanzados (tipos, generación, Pokédex regional, color, forma, hábitat, grupo huevo, tasa de crecimiento, legendario/mítico/bebé, etapa evolutiva, género, formas, rangos de estadísticas, altura, peso, experiencia, captura, felicidad, habilidad y modo normal/oculta, movimiento aprendible y **debilidades** frente a cualquier tipo). Todo el estado de los filtros vive en la URL, así que cualquier búsqueda es compartible.
- **Ficha de Pokémon** (`/pokemon/:id|nombre`) con pestañas: Resumen, Estadísticas (incluye cálculo a nivel 100), Evoluciones (árbol con condiciones), Movimientos (filtro por versión y método), Encuentros, Formas y variedades, Debilidades (multiplicadores), Galería (sprites y gritos). Las pestañas se guardan en `?tab=`.
- **Tipos**: matriz de efectividad 18×18 y ficha de cada tipo (relaciones de daño, Pokémon y movimientos).
- **Movimientos**: catálogo con filtros de tipo, clase de daño, generación, objetivo, potencia, precisión, prioridad, efectos de estado y número de Pokémon que lo aprenden.
- **Habilidades**, **Objetos** (por categoría), **Naturalezas** y **Regiones** (con sus Pokédex).

## Desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo en 0.0.0.0:5173
npm run build      # typecheck + build de producción
npm run typecheck  # solo TypeScript
npm run lint       # oxlint
npm test           # tests de filtros y URL (vitest)
```

## Arquitectura

```
src/
  api/          cliente HTTP de PokéAPI (límite de 6 peticiones simultáneas, reintentos) y tipos
  data/         índices locales (Pokédex y movimientos), caché IndexedDB (idb-keyval), hooks de React Query
  filters/      motor de filtros puro, orden y serialización a/desde la URL (con tests)
  lib/          utilidades, etiquetas en español, textos localizados, matriz de tipos, evolución
  components/   interfaz compartida (tarjetas, filtros, banner de carga, layout)
  pages/        páginas de ruta; pages/pokemon/ contiene las pestañas de la ficha
```

### Caché y uso justo de PokéAPI

- La Pokédex se indexa una vez: lista de Pokémon, Pokémon y especies se guardan en **IndexedDB** (`pokedex-data`). Las siguientes visitas sólo descargan lo que falta.
- La descarga es **reanudable** (si se interrumpe, continúa donde se quedó) y usa **6 peticiones simultáneas** como máximo.
- El catálogo de movimientos sólo se descarga al abrir `/movimientos`.
- Habilidades, naturalezas y regiones se piden por recurso y se guardan en la misma caché.
- El botón de reinicio de la Pokédex borra la caché local y vuelve a descargar todo.

### Idioma

La interfaz está en español. Los nombres, descripciones y efectos se muestran en español cuando PokéAPI los tiene y, si no, en inglés.

## Limitaciones conocidas

- Los **objetos** se buscan por su nombre en inglés (slug, por ejemplo `leftovers`). Mostrar su nombre en español exigiría descargar más de 2000 fichas.
- Los datos dependen de que el navegador pueda acceder a `pokeapi.co`.

## Créditos

Datos y sprites de [PokéAPI](https://pokeapi.co/). Pokémon y sus nombres son propiedad de Nintendo, Game Freak y The Pokémon Company. Proyecto sin fines comerciales.
