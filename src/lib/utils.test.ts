import { describe, expect, it } from 'vitest'
import { generationNumber } from './utils'

describe('generationNumber', () => {
  it('convierte el nombre de la generación en su número', () => {
    expect(generationNumber('generation-i')).toBe(1)
    expect(generationNumber('generation-iv')).toBe(4)
    expect(generationNumber('generation-viii')).toBe(8)
    expect(generationNumber('generation-x')).toBe(10)
  })

  it('devuelve 0 cuando la región no tiene generación principal', () => {
    // PokéAPI manda main_generation: null en regiones como Hisui u Orre.
    expect(generationNumber(undefined)).toBe(0)
    expect(generationNumber(null)).toBe(0)
    expect(generationNumber('')).toBe(0)
  })

  it('devuelve 0 para numerales no reconocidos', () => {
    expect(generationNumber('generation-xi')).toBe(0)
    expect(generationNumber('orre')).toBe(0)
  })
})
