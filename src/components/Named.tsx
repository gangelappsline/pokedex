import { Link } from 'react-router-dom'
import { useAbilityQuery, useItemQuery } from '../data/hooks'
import { formatSlug, itemSpriteUrl } from '../lib/utils'
import { pickName } from '../lib/localized'

/** Enlace a una habilidad mostrando su nombre en español cuando está disponible. */
export function AbilityLink({ name, hidden = false, className }: { name: string; hidden?: boolean; className?: string }) {
  const { data } = useAbilityQuery(name)
  const label = data ? pickName(data.names, name) : formatSlug(name)
  return (
    <Link
      to={`/habilidades/${name}`}
      className={className ?? 'inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10'}
    >
      {label}
      {hidden && <span className="rounded-md bg-fuchsia-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-fuchsia-300">Oculta</span>}
    </Link>
  )
}

/** Enlace a un objeto con su icono y nombre en español. */
export function ItemLink({ name, className }: { name: string; className?: string }) {
  const { data } = useItemQuery(name)
  const label = data ? pickName(data.names, name) : formatSlug(name)
  return (
    <Link
      to={`/objetos/${name}`}
      className={className ?? 'inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10'}
    >
      <img src={itemSpriteUrl(name)} alt="" loading="lazy" className="h-6 w-6 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
      {label}
    </Link>
  )
}
