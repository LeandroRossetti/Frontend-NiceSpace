import type { SpaceResourceDto } from '../api/types'
import type { ResourceDraft } from '../editor/types'

interface Props {
  resource: SpaceResourceDto
  draft: ResourceDraft
  onDraftChange: (draft: ResourceDraft) => void
  onSave: () => void
  onDelete: () => void
}

export default function ResourcePropertiesPanel({ resource, draft, onDraftChange, onSave, onDelete }: Props) {
  const update = (changes: Partial<ResourceDraft>) => onDraftChange({ ...draft, ...changes })
  return (
    <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:w-80">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Propiedades del recurso</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">{resource.tipo === 'DESK' ? 'Escritorio' : 'Sala'}</h3>
      </div>
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="resource-name">Nombre</label>
      <input id="resource-name" value={draft.nombre} onChange={(event) => update({ nombre: event.target.value })} className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="resource-capacity">Capacidad</label>
      <input id="resource-capacity" type="number" min={1} step={1} value={draft.capacidad} onChange={(event) => update({ capacidad: event.target.value })} className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />

      <h4 className="mb-2 text-sm font-semibold text-slate-800">Dimensiones y orientación</h4>
      <div className="mb-5 grid grid-cols-3 gap-2">
        <label className="text-xs text-slate-600">
          Ancho
          <input type="number" min="20" step="1" value={draft.width} onChange={(event) => update({ width: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" />
        </label>
        <label className="text-xs text-slate-600">
          Alto
          <input type="number" min="20" step="1" value={draft.height} onChange={(event) => update({ height: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" />
        </label>
        <label className="text-xs text-slate-600">
          Rotación
          <input type="number" step="15" value={draft.rotation} onChange={(event) => update({ rotation: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" />
        </label>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">Tarifas</h4>
        <select aria-label="Moneda" value={draft.currency} onChange={(event) => update({ currency: event.target.value })} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm">
          <option value="ARS">ARS · Pesos</option>
          <option value="USD" disabled>USD · Próximamente</option>
        </select>
      </div>
      {([
        ['hourlyPrice', 'Por hora'],
        ['dailyPrice', 'Por día'],
        ['monthlyPrice', 'Por mes'],
      ] as const).map(([key, label]) => (
        <label key={key} className="mb-3 block text-sm text-slate-600">
          {label}
          <div className="mt-1 flex overflow-hidden rounded-lg border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <span className="bg-slate-50 px-3 py-2 text-slate-500">{draft.currency === 'USD' ? 'US$' : '$'}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft[key]}
              onChange={(event) => update({ [key]: event.target.value })}
              placeholder="Sin tarifa"
              className="min-w-0 flex-1 px-3 py-2 text-sm outline-none"
            />
          </div>
        </label>
      ))}
      <div className="mt-5 flex gap-2">
        <button onClick={onSave} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Guardar datos</button>
        <button onClick={onDelete} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">Eliminar</button>
      </div>
    </aside>
  )
}
