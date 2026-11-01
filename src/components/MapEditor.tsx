import { useEffect, useMemo, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import type { CreateWorkspaceRequest, FloorDto, LocationDto, WorkspaceDto, WorkspaceType } from '../api/types'
import { GRID_SIZE } from '../editor/types'
import type {
  CanvasViewport,
  EditorElement,
  EditorWorkspace,
  StaticElementDraft,
  StaticElementKind,
  StaticFloorElement,
} from '../editor/types'
import FloorSelector from './FloorSelector'
import MapEditorCanvas from './MapEditorCanvas'
import WorkspacePropertiesPanel from './WorkspacePropertiesPanel'
import StaticElementPropertiesPanel from './StaticElementPropertiesPanel'
import Spinner from './Spinner'

interface MapElement {
  workspaceId: number
  x: number
  y: number
  w: number
  h: number
  rotation?: number
}

interface MapPayload {
  elements?: MapElement[]
  objects?: StaticFloorElement[]
}

const DEFAULT_CAPACITY: Record<WorkspaceType, number> = {
  HOT_DESK: 1,
  PRIVATE_OFFICE: 4,
  MEETING_ROOM: 6,
}

const EMPTY_STATIC_DRAFT: StaticElementDraft = {
  nombre: '',
  width: '120',
  height: '70',
  rotation: '0',
}

function mapElements(floor: FloorDto, workspaces: WorkspaceDto[]): EditorElement[] {
  const payload: MapPayload = floor.mapStructure ? JSON.parse(floor.mapStructure) : { elements: [] }
  const byId = new Map(workspaces.map((workspace) => [workspace.id, workspace]))
  const workspaceElements = (payload.elements ?? []).flatMap((position) => {
    const workspace = byId.get(position.workspaceId)
    return workspace ? [{
      ...workspace,
      ...position,
      kind: 'workspace' as const,
      elementId: `workspace-${workspace.id}`,
      rotation: position.rotation ?? 0,
    }] : []
  })
  return [...workspaceElements, ...(payload.objects ?? [])]
}

function staticDraftFrom(element: StaticFloorElement): StaticElementDraft {
  return {
    nombre: element.label,
    width: String(element.w),
    height: String(element.h),
    rotation: String(element.rotation),
  }
}

export default function MapEditor({ locationId }: { locationId: number }) {
  const [locationName, setLocationName] = useState('')
  const [floors, setFloors] = useState<FloorDto[]>([])
  const [floorId, setFloorId] = useState<number | null>(null)
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([])
  const [floorElements, setFloorElements] = useState<Record<number, EditorElement[]>>({})
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [staticDraft, setStaticDraft] = useState<StaticElementDraft>(EMPTY_STATIC_DRAFT)
  const [viewport, setViewport] = useState<CanvasViewport>({ x: 0, y: 0, scale: 1 })
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [panMode, setPanMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingWorkspace, setSavingWorkspace] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [locationResponse, floorResponse, workspaceResponse] = await Promise.all([
          api.get<LocationDto>(`/locations/${locationId}`),
          api.get<FloorDto[]>(`/locations/${locationId}/floors`),
          api.get<WorkspaceDto[]>(`/locations/${locationId}/workspaces`),
        ])
        const loadedFloors = floorResponse.data
        const loadedWorkspaces = workspaceResponse.data
        const documents = Object.fromEntries(
          loadedFloors.map((floor) => [floor.id, mapElements(floor, loadedWorkspaces)]),
        )
        if (!cancelled) {
          setLocationName(locationResponse.data.nombre)
          setFloors(loadedFloors)
          setWorkspaces(loadedWorkspaces)
          setFloorElements(documents)
          setFloorId(loadedFloors[0]?.id ?? null)
        }
      } catch (loadError) {
        if (!cancelled) setError(getErrorMessage(loadError))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [locationId])

  const elements = useMemo(() => (floorId == null ? [] : floorElements[floorId] ?? []), [floorElements, floorId])
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null
  const selectedElement = selectedId == null ? null : elements.find((element) => element.elementId === selectedId) ?? null
  const selectedWorkspace = selectedElement?.kind === 'workspace' ? selectedElement : null
  const selectedStaticElement = selectedElement && selectedElement.kind !== 'workspace' ? selectedElement : null

  const selectElement = (element: EditorElement, additive = false) => {
    if (additive) {
      const next = selectedIds.includes(element.elementId)
        ? selectedIds.filter((id) => id !== element.elementId)
        : [...selectedIds, element.elementId]
      setSelectedIds(next)
      const onlySelected = next.length === 1 ? elements.find((item) => item.elementId === next[0]) : undefined
      setStaticDraft(onlySelected && onlySelected.kind !== 'workspace' ? staticDraftFrom(onlySelected) : EMPTY_STATIC_DRAFT)
      return
    }
    setSelectedIds([element.elementId])
    setStaticDraft(element.kind !== 'workspace' ? staticDraftFrom(element) : EMPTY_STATIC_DRAFT)
  }

  const persistMap = async (targetFloorId: number, snapshot: EditorElement[]) => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const mapStructure = JSON.stringify({
        elements: snapshot.flatMap((element) => element.kind === 'workspace'
          ? [{ workspaceId: element.id, x: element.x, y: element.y, w: element.w, h: element.h, rotation: element.rotation }]
          : []),
        objects: snapshot.flatMap((element) => element.kind !== 'workspace'
          ? [{ elementId: element.elementId, kind: element.kind, label: element.label, x: element.x, y: element.y, w: element.w, h: element.h, rotation: element.rotation }]
          : []),
      })
      const { data } = await api.put<FloorDto>(`/floors/${targetFloorId}/map`, { mapStructure })
      setFloors((previous) => previous.map((floor) => (floor.id === targetFloorId ? data : floor)))
      setSaved(true)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  const addWorkspace = async (tipo: WorkspaceType) => {
    if (floorId == null) return
    setError('')
    try {
      const { data } = await api.post<WorkspaceDto>(`/locations/${locationId}/workspaces`, {
        nombre: `Espacio ${workspaces.length + 1}`,
        workspaceType: tipo,
        capacity: DEFAULT_CAPACITY[tipo],
        currency: 'ARS',
        floorId,
        isActive: true,
      })
      const element: EditorWorkspace = {
        ...data,
        kind: 'workspace',
        elementId: `workspace-${data.id}`,
        x: 40 + (elements.length % 6) * 35,
        y: 40 + (elements.length % 6) * 35,
        w: tipo === 'HOT_DESK' ? 120 : 200,
        h: tipo === 'HOT_DESK' ? 70 : 130,
        rotation: 0,
      }
      const nextElements = [...elements, element]
      setWorkspaces((previous) => [...previous, data])
      setFloorElements((previous) => ({ ...previous, [floorId]: [...(previous[floorId] ?? []), element] }))
      selectElement(element)
      await persistMap(floorId, nextElements)
    } catch (addError) {
      setError(getErrorMessage(addError))
    }
  }

  const addStaticElement = (kind: StaticElementKind) => {
    if (floorId == null) return
    const defaults: Record<StaticElementKind, { label: string; w: number; h: number }> = {
      wall: { label: 'Pared', w: 220, h: 18 },
      door: { label: 'Puerta', w: 90, h: 90 },
      'common-area': { label: 'Zona común', w: 220, h: 140 },
    }
    const shape: StaticFloorElement = {
      ...defaults[kind],
      kind,
      elementId: `object-${crypto.randomUUID()}`,
      x: 60 + (elements.length % 5) * 35,
      y: 60 + (elements.length % 5) * 35,
      rotation: 0,
    }
    setFloorElements((previous) => ({ ...previous, [floorId]: [...(previous[floorId] ?? []), shape] }))
    selectElement(shape)
    setSaved(false)
  }

  const addFloor = async () => {
    setError('')
    try {
      const name = `Piso ${Math.max(0, ...floors.map((floor) => floor.levelOrder)) + 1}`
      const { data } = await api.post<FloorDto>(`/locations/${locationId}/floors`, { nombre: name })
      setFloors((previous) => [...previous, data])
      setFloorElements((previous) => ({ ...previous, [data.id]: [] }))
      setFloorId(data.id)
      setSelectedIds([])
      setSaved(false)
    } catch (addError) {
      setError(getErrorMessage(addError))
    }
  }

  const deleteFloor = async () => {
    if (floorId == null || floors.length <= 1) return
    const floor = floors.find((item) => item.id === floorId)
    if ((floorElements[floorId] ?? []).length > 0) {
      setError('Mové o eliminá los espacios del piso antes de eliminarlo.')
      return
    }
    if (!floor || !window.confirm(`¿Eliminar ${floor.nombre}? Esta acción no se puede deshacer.`)) return
    setError('')
    try {
      await api.delete(`/floors/${floorId}`)
      const remaining = floors.filter((item) => item.id !== floorId)
      setFloors(remaining)
      setFloorElements((previous) => {
        const next = { ...previous }
        delete next[floorId]
        return next
      })
      setFloorId(remaining[0]?.id ?? null)
      setSelectedIds([])
      setSaved(false)
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  const saveMap = async () => {
    if (floorId == null) return
    await persistMap(floorId, elements)
  }

  const updateWorkspace = async (payload: CreateWorkspaceRequest) => {
    if (!selectedWorkspace) return
    setSavingWorkspace(true)
    setError('')
    try {
      const { data } = await api.put<WorkspaceDto>(`/workspaces/${selectedWorkspace.id}`, payload)
      setWorkspaces((previous) => previous.map((workspace) => (workspace.id === data.id ? data : workspace)))
      setFloorElements((previous) => Object.fromEntries(
        Object.entries(previous).map(([id, floorItems]) => [
          id,
          floorItems.map((item) => item.kind === 'workspace' && item.id === data.id ? { ...item, ...data } : item),
        ]),
      ))
      setSaved(false)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSavingWorkspace(false)
    }
  }

  const handleWorkspaceGeometryChange = (changes: { w: number; h: number; rotation: number }) => {
    if (!selectedWorkspace || floorId == null) return
    setFloorElements((previous) => ({
      ...previous,
      [floorId]: (previous[floorId] ?? []).map((item) => item.elementId === selectedWorkspace.elementId
        ? { ...item, w: changes.w, h: changes.h, rotation: changes.rotation }
        : item),
    }))
    setSaved(false)
  }

  const removeWorkspace = async () => {
    if (!selectedWorkspace || !window.confirm(`¿Eliminar ${selectedWorkspace.nombre}?`)) return
    setError('')
    try {
      await api.delete(`/workspaces/${selectedWorkspace.id}`)
      setWorkspaces((previous) => previous.filter((workspace) => workspace.id !== selectedWorkspace.id))
      setFloorElements((previous) => Object.fromEntries(
        Object.entries(previous).map(([id, floorItems]) => [
          id,
          floorItems.filter((item) => item.kind !== 'workspace' || item.id !== selectedWorkspace.id),
        ]),
      ))
      setSelectedIds([])
      setSaved(false)
    } catch (removeError) {
      setError(getErrorMessage(removeError))
    }
  }

  const saveStaticElement = () => {
    if (!selectedStaticElement || floorId == null) return
    const width = Number(staticDraft.width)
    const height = Number(staticDraft.height)
    const rotation = Number(staticDraft.rotation)
    if (!staticDraft.nombre.trim() || ![width, height, rotation].every(Number.isFinite) || width < 8 || height < 8) {
      setError('Ingresá un nombre, dimensiones válidas y una rotación válida.')
      return
    }
    setFloorElements((previous) => ({
      ...previous,
      [floorId]: (previous[floorId] ?? []).map((item) => item.elementId === selectedStaticElement.elementId
        ? { ...item, label: staticDraft.nombre.trim(), w: width, h: height, rotation }
        : item),
    }))
    setSaved(false)
    setError('')
  }

  const removeStaticElement = () => {
    if (!selectedStaticElement || floorId == null) return
    setFloorElements((previous) => ({
      ...previous,
      [floorId]: (previous[floorId] ?? []).filter((item) => item.elementId !== selectedStaticElement.elementId),
    }))
    setSelectedIds([])
    setSaved(false)
  }

  if (loading) return <Spinner label="Cargando editor..." />

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Editor de sede</p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">{locationName}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => void addWorkspace('HOT_DESK')} className="rounded-lg bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-800">
            + Hot desk
          </button>
          <button onClick={() => void addWorkspace('PRIVATE_OFFICE')} className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-800">
            + Oficina privada
          </button>
          <button onClick={() => void addWorkspace('MEETING_ROOM')} className="rounded-lg bg-violet-700 px-3 py-2 text-sm font-medium text-white hover:bg-violet-800">
            + Sala de reuniones
          </button>
          <button onClick={() => addStaticElement('wall')} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
            + Pared
          </button>
          <button onClick={() => addStaticElement('door')} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
            + Puerta
          </button>
          <button onClick={() => addStaticElement('common-area')} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
            + Zona común
          </button>
          <button onClick={() => void saveMap()} disabled={saving || floorId == null} className="rounded-lg bg-success-600 px-3 py-2 text-sm font-medium text-white hover:bg-success-700 disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar plano'}
          </button>
          {saved && <span className="text-sm font-medium text-success-700">Guardado</span>}
        </div>
      </header>

      <FloorSelector
        floors={floors}
        activeFloorId={floorId}
        onSelect={(id) => {
          setFloorId(id)
          setSelectedIds([])
          setSaved(false)
        }}
        onAdd={() => void addFloor()}
        onDelete={() => void deleteFloor()}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
        <div className="flex items-center gap-1" aria-label="Zoom del plano">
          <button onClick={() => setViewport((view) => ({ ...view, scale: Math.max(0.25, view.scale / 1.2) }))} className="h-8 w-8 rounded-md border border-border text-foreground hover:bg-surface-muted" aria-label="Alejar">−</button>
          <span className="min-w-12 text-center text-xs font-medium text-muted-foreground">{Math.round(viewport.scale * 100)}%</span>
          <button onClick={() => setViewport((view) => ({ ...view, scale: Math.min(3, view.scale * 1.2) }))} className="h-8 w-8 rounded-md border border-border text-foreground hover:bg-surface-muted" aria-label="Acercar">+</button>
          <button onClick={() => setViewport({ x: 0, y: 0, scale: 1 })} className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-surface-muted">Ajustar</button>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} className="accent-primary-700" />
          Cuadrícula
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={snapToGrid} onChange={(event) => setSnapToGrid(event.target.checked)} className="accent-primary-700" />
          Ajustar a cuadrícula
        </label>
        {snapToGrid && <span className="text-xs text-muted-foreground">Al soltar: cada {GRID_SIZE} unidades</span>}
        <button onClick={() => setPanMode((value) => !value)} aria-pressed={panMode} className={`rounded-md px-3 py-1.5 text-sm font-medium ${panMode ? 'bg-primary-100 text-primary-800' : 'text-muted-foreground hover:bg-surface-muted'}`}>
          {panMode ? 'Desplazamiento activo' : 'Desplazar plano'}
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-2">
          {selectedIds.length > 1 && floorId != null && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-2 shadow-sm">
              <span className="self-center px-2 text-xs font-medium text-muted-foreground">{selectedIds.length} seleccionados</span>
              <button
                onClick={() => {
                  const selected = elements.filter((item) => selectedIds.includes(item.elementId))
                  if (selected.length < 2) return
                  const left = Math.min(...selected.map((item) => item.x))
                  setFloorElements((previous) => ({
                    ...previous,
                    [floorId]: (previous[floorId] ?? []).map((item) => selectedIds.includes(item.elementId) ? { ...item, x: left } : item),
                  }))
                  setSaved(false)
                }}
                className="rounded-md px-2 py-1 text-xs text-foreground hover:bg-surface-muted"
              >
                Alinear izquierda
              </button>
              <button
                onClick={() => {
                  const selected = elements.filter((item) => selectedIds.includes(item.elementId))
                  if (selected.length < 2) return
                  const top = Math.min(...selected.map((item) => item.y))
                  setFloorElements((previous) => ({
                    ...previous,
                    [floorId]: (previous[floorId] ?? []).map((item) => selectedIds.includes(item.elementId) ? { ...item, y: top } : item),
                  }))
                  setSaved(false)
                }}
                className="rounded-md px-2 py-1 text-xs text-foreground hover:bg-surface-muted"
              >
                Alinear arriba
              </button>
            </div>
          )}
          <MapEditorCanvas
            elements={elements}
            selectedIds={selectedIds}
            onSelect={selectElement}
            onClearSelection={() => {
              setSelectedIds([])
              setStaticDraft(EMPTY_STATIC_DRAFT)
            }}
            viewport={viewport}
            onViewportChange={setViewport}
            showGrid={showGrid}
            panMode={panMode}
            onMove={(elementId, x, y) => {
              if (floorId == null) return
              const snap = (value: number) => snapToGrid ? Math.round(value / GRID_SIZE) * GRID_SIZE : value
              setFloorElements((previous) => {
                const current = previous[floorId] ?? []
                const dragged = current.find((item) => item.elementId === elementId)
                if (!dragged) return previous
                const dx = snap(x) - dragged.x
                const dy = snap(y) - dragged.y
                const movingIds = selectedIds.includes(elementId) ? selectedIds : [elementId]
                return {
                  ...previous,
                  [floorId]: current.map((item) => movingIds.includes(item.elementId)
                    ? { ...item, x: item.x + dx, y: item.y + dy }
                    : item),
                }
              })
              setSaved(false)
            }}
            onTransform={(elementId, transform) => {
              if (floorId == null) return
              const snap = (value: number) => snapToGrid ? Math.round(value / GRID_SIZE) * GRID_SIZE : value
              const next = { ...transform, x: snap(transform.x), y: snap(transform.y) }
              setFloorElements((previous) => ({
                ...previous,
                [floorId]: (previous[floorId] ?? []).map((item) => item.elementId === elementId ? { ...item, ...next } : item),
              }))
              if (selectedId === elementId && selectedElement && selectedElement.kind !== 'workspace') {
                setStaticDraft((current) => ({ ...current, width: String(Math.round(next.w)), height: String(Math.round(next.h)), rotation: String(Math.round(next.rotation)) }))
              }
              setSaved(false)
            }}
            />
        </div>

        {selectedWorkspace && (
          <WorkspacePropertiesPanel
            key={selectedWorkspace.id}
            workspace={selectedWorkspace}
            saving={savingWorkspace}
            onSave={(payload) => void updateWorkspace(payload)}
            onGeometryChange={handleWorkspaceGeometryChange}
            onDelete={() => void removeWorkspace()}
          />
        )}
        {selectedStaticElement && (
          <StaticElementPropertiesPanel
            element={selectedStaticElement}
            draft={staticDraft}
            onDraftChange={setStaticDraft}
            onSave={saveStaticElement}
            onDelete={removeStaticElement}
          />
        )}
      </div>
    </section>
  )
}
