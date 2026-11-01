import type { StaticElementDraft, StaticFloorElement } from '../editor/types'

interface Props {
  element: StaticFloorElement
  draft: StaticElementDraft
  onDraftChange: (draft: StaticElementDraft) => void
  onSave: () => void
  onDelete: () => void
}

const LABEL: Record<StaticFloorElement['kind'], string> = {
  wall: 'Pared',
  door: 'Puerta',
  'common-area': 'Zona común',
}

export default function StaticElementPropertiesPanel({ element, draft, onDraftChange, onSave, onDelete }: Props) {
  const update = (changes: Partial<StaticElementDraft>) => onDraftChange({ ...draft, ...changes })
  return (
    <aside className="w-full shrink-0 rounded-xl border border-border bg-surface p-5 shadow-sm xl:w-80">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Elemento del plano</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">{LABEL[element.kind]}</h3>
      </div>
      <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="shape-label">Nombre</label>
      <input id="shape-label" value={draft.nombre} onChange={(event) => update({ nombre: event.target.value })} className="mb-4 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100" />
      <div className="mb-5 grid grid-cols-3 gap-2">
        <label className="text-xs text-muted-foreground">Ancho<input type="number" min="8" step="1" value={draft.width} onChange={(event) => update({ width: event.target.value })} className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm" /></label>
        <label className="text-xs text-muted-foreground">Alto<input type="number" min="8" step="1" value={draft.height} onChange={(event) => update({ height: event.target.value })} className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm" /></label>
        <label className="text-xs text-muted-foreground">Rotación<input type="number" step="15" value={draft.rotation} onChange={(event) => update({ rotation: event.target.value })} className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm" /></label>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 rounded-lg bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-800">Aplicar</button>
        <button onClick={onDelete} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">Eliminar</button>
      </div>
    </aside>
  )
}
