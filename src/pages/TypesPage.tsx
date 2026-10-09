import { Link } from 'react-router-dom'
import { useTypeMatrix } from '../data/hooks'
import { Panel, SectionTitle, Spinner } from '../components/ui'
import { TYPE_NAMES, typeColor, typeLabel } from '../lib/labels'
import { formatMultiplier, multiplierColor } from '../lib/typeChart'

export default function TypesPage() {
  const { matrix } = useTypeMatrix()

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-4xl font-extrabold text-white">Tipos</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Tabla de efectividad completa de los 18 tipos. Lee la fila como atacante y la columna como defensor: el número es el
          multiplicador de daño.
        </p>
      </header>

      <Panel>
        <SectionTitle>Todos los tipos</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {TYPE_NAMES.map((t) => (
            <Link
              key={t}
              to={`/tipos/${t}`}
              className="flex items-center justify-center rounded-xl px-3 py-4 text-center font-display text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${typeColor(t)}, ${typeColor(t)}99)` }}
            >
              {typeLabel(t)}
            </Link>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionTitle>Matriz de efectividad (ataque → defensa)</SectionTitle>
        {!matrix ? (
          <Spinner label="Cargando tabla de tipos…" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0.5 text-center text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-slate-950 p-1 text-left text-[11px] font-semibold uppercase text-slate-500">
                    Atq ↓ / Def →
                  </th>
                  {TYPE_NAMES.map((d) => (
                    <th key={d} className="p-1">
                      <Link to={`/tipos/${d}`} className="font-semibold hover:underline" style={{ color: typeColor(d) }}>
                        {typeLabel(d)}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TYPE_NAMES.map((a) => (
                  <tr key={a}>
                    <th scope="row" className="sticky left-0 whitespace-nowrap bg-slate-950 p-1 text-left">
                      <Link to={`/tipos/${a}`} className="font-semibold hover:underline" style={{ color: typeColor(a) }}>
                        {typeLabel(a)}
                      </Link>
                    </th>
                    {TYPE_NAMES.map((d) => {
                      const v = matrix[a]?.[d] ?? 1
                      const color = multiplierColor(v)
                      return (
                        <td
                          key={d}
                          title={`${typeLabel(a)} → ${typeLabel(d)}: ${formatMultiplier(v)}`}
                          className="h-9 min-w-9 rounded-md font-mono font-bold"
                          style={{ backgroundColor: `${color}${v === 1 ? '14' : '33'}`, color: v === 1 ? '#64748b' : color }}
                        >
                          {v === 1 ? '·' : formatMultiplier(v)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
          {[4, 2, 0.5, 0.25, 0].map((v) => (
            <span key={v} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: multiplierColor(v) }} />
              {formatMultiplier(v)}
            </span>
          ))}
        </div>
      </Panel>

    </div>
  )
}
