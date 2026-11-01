import { useEffect, useState } from 'react'
import type { CreateWorkspaceRequest } from '../api/types'
import type { EditorWorkspace } from '../editor/types'
import WorkspaceDetailsForm from './WorkspaceDetailsForm'

interface Props {
  workspace: EditorWorkspace
  saving: boolean
  onSave: (payload: CreateWorkspaceRequest) => void
  onGeometryChange: (changes: { w: number; h: number; rotation: number }) => void
  onDelete: () => void
}

export default function WorkspacePropertiesPanel({ workspace, saving, onSave, onGeometryChange, onDelete }: Props) {
  const [width, setWidth] = useState(String(workspace.w))
  const [height, setHeight] = useState(String(workspace.h))
  const [rotation, setRotation] = useState(String(workspace.rotation))

  useEffect(() => {
    setWidth(String(workspace.w))
    setHeight(String(workspace.h))
    setRotation(String(workspace.rotation))
  }, [workspace.w, workspace.h, workspace.rotation])

  const updateGeometry = (field: 'width' | 'height' | 'rotation', value: string) => {
    if (field === 'width') setWidth(value)
    if (field === 'height') setHeight(value)
    if (field === 'rotation') setRotation(value)

    const w = field === 'width' ? Number(value) : workspace.w
    const h = field === 'height' ? Number(value) : workspace.h
    const r = field === 'rotation' ? Number(value) : workspace.rotation
    if ([w, h, r].every(Number.isFinite)) {
      onGeometryChange({ w: Math.max(20, w), h: Math.max(20, h), rotation: r })
    }
  }

  return (
    <aside className="w-full shrink-0 rounded-xl border border-border bg-surface p-5 shadow-sm xl:w-96">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Espacio</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">{workspace.nombre}</h3>
      </div>

      <h4 className="mb-2 text-sm font-semibold text-foreground">Dimensiones y orientación</h4>
      <div className="mb-5 grid grid-cols-3 gap-2">
        <label className="text-xs text-muted-foreground">
          Ancho
          <input
            type="number"
            min="20"
            step="1"
            value={width}
            onChange={(event) => updateGeometry('width', event.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Alto
          <input
            type="number"
            min="20"
            step="1"
            value={height}
            onChange={(event) => updateGeometry('height', event.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Rotación
          <input
            type="number"
            step="15"
            value={rotation}
            onChange={(event) => updateGeometry('rotation', event.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-2 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mb-5 border-t border-border pt-4">
        <WorkspaceDetailsForm
          key={workspace.id}
          initial={workspace}
          submitLabel="Guardar datos"
          submitting={saving}
          onSubmit={onSave}
        />
      </div>

      <div className="border-t border-border pt-4">
        <button onClick={onDelete} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">
          Eliminar espacio
        </button>
      </div>
    </aside>
  )
}
