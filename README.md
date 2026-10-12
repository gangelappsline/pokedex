# Pokédex

Pokédex completa en español construida con **React**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **motion** y **React Router**. Los datos vienen de [PokéAPI](https://pokeapi.co/docs/v2).

## Secciones

- **Inicio**: buscador rápido por nombre o número y destacados.
- **Pokédex**: filtros avanzados (tipos, generación, Pokédex regional, color, forma, hábitat, grupo huevo, tasa de crecimiento, legendario/mítico/bebé, etapa evolutiva, género, formas, rangos de estadísticas, altura, peso, experiencia, captura, felicidad, habilidad y modo normal/oculta, movimiento aprendible y **debilidades** frente a cualquier tipo). Todo el estado de los filtros vive en la URL, así que cualquier búsqueda es compartible.
- **Ficha de Pokémon** (`/pokemon/:id|nombre`) con pestañas: Resumen, Estadísticas (incluye cálculo a nivel 100), Evoluciones (árbol con condiciones), Movimientos (filtro por versión y método), Encuentros, Formas y variedades, Debilidades (multiplicadores), Galería (sprites y gritos). Las pestañas se guardan en `?tab=`.
- **Tipos**: matriz de efectividad 18×18 y ficha de cada tipo (relaciones de daño, Pokémon y movimientos).
- **Movimientos**: catálogo con filtros de tipo, clase de daño, generación, objetivo, potencia, precisión, prioridad, efectos de estado y número de Pokémon que lo aprenden.
- **Guías de juegos** (`/guias`): catálogo de los videojuegos de Pokémon —serie principal, remakes y spin-offs— con carátula, año, plataformas, generación y subserie. La ficha de cada juego (`/guias/:slug`) incluye la información completa (desarrollador, distribuidor, lanzamientos por región, género, resumen y puntos clave), sus iniciales y legendarios, accesos a la Pokédex filtrada por su generación o Pokédex regional, y los recursos de guía disponibles en la red.
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
                y catálogo de juegos para las guías (games.ts con la lógica, gamesCatalog.ts con los datos)
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

### Guías y carátulas

- Las carátulas se **enlazan** (no se copian) desde [StrategyWiki](https://strategywiki.org/) (`cdn.wikimg.net`) y [Bulbagarden Archives](https://archives.bulbagarden.net/); si el navegador no puede cargar la imagen, la tarjeta dibuja una portada de respaldo con el color del juego.
- Las páginas de guía de **StrategyWiki** y **Bulbapedia** se verificaron contra sus API antes de añadirlas al catálogo, así que los enlaces apuntan a páginas que existen.
- **WikiDex** (español), **Wikipedia** y **GameFAQs** se enlazan mediante su buscador: el enlace nunca caduca aunque la página cambie de nombre.
- Para añadir o corregir un juego sólo hay que editar `src/data/gamesCatalog.ts`; `src/data/games.test.ts` valida el catálogo (slugs únicos, fechas ISO, carátulas, recursos mínimos por juego y filtros).

### Idioma

La interfaz está en español. Los nombres, descripciones y efectos se muestran en español cuando PokéAPI los tiene y, si no, en inglés.

## Limitaciones conocidas

- Los **objetos** se buscan por su nombre en inglés (slug, por ejemplo `leftovers`). Mostrar su nombre en español exigiría descargar más de 2000 fichas.
- Los datos dependen de que el navegador pueda acceder a `pokeapi.co`, a `cdn.wikimg.net` / `archives.bulbagarden.net` (carátulas) y a los sitios de guías enlazados.
- El catálogo de guías es estático: los anuncios posteriores a una actualización del proyecto (nuevos juegos o fechas) hay que añadirlos en `src/data/gamesCatalog.ts`.

## Créditos

Datos y sprites de [PokéAPI](https://pokeapi.co/). Carátulas de [StrategyWiki](https://strategywiki.org/) y [Bulbagarden Archives](https://archives.bulbagarden.net/). Guías de [StrategyWiki](https://strategywiki.org/), [Bulbapedia](https://bulbapedia.bulbagarden.net/), [WikiDex](https://www.wikidex.net/) y [GameFAQs](https://gamefaqs.gamespot.com/). Pokémon y sus nombres son propiedad de Nintendo, Game Freak y The Pokémon Company. Proyecto sin fines comerciales.
