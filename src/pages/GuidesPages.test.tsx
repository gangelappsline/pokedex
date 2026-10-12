import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GuidesPage from './GuidesPage'
import GameDetailPage from './GameDetailPage'

describe('páginas de guías', () => {
  it('la lista renderiza juegos y filtros', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/guias']}>
        <Routes>
          <Route path="/guias" element={<GuidesPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(html).toContain('Guías de juegos')
    expect(html).toContain('Pokémon Rojo y Azul')
    // La carátula se enlaza desde el CDN de StrategyWiki y los enlaces de guía son externos.
    expect(html).toContain('cdn.wikimg.net/en/strategywiki/images/thumb/c/ca/Pokemon_red_box.jpg/400px-Pokemon_red_box.jpg')
    expect(html).toContain('strategywiki.org/wiki/Pok%C3%A9mon_Red_and_Blue')
    expect(html).toContain('wikidex.net')
  })

  it('la ficha de un juego renderiza su información y recursos', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/guias/legends-z-a']}>
        <Routes>
          <Route path="/guias/:slug" element={<GameDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(html).toContain('Leyendas Pokémon: Z-A')
    expect(html).toContain('Game Freak')
    expect(html).toContain('strategywiki.org/wiki/Pok%C3%A9mon_Legends:_Z-A')
    expect(html).toContain('Walkthrough:Pok%C3%A9mon_Legends:_Z-A')
    expect(html).toContain('dex=lumiose-city')
    expect(html).toContain('/pokemon/chikorita')
  })

  it('muestra un aviso si el juego no existe', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/guias/no-existe']}>
        <Routes>
          <Route path="/guias/:slug" element={<GameDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(html).toContain('No encontramos ese juego')
  })
})
