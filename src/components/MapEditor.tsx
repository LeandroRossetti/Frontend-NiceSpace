import { useEffect, useMemo, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import type { FloorDto, SpaceResourceDto, WorkspaceDto } from '../api/types'
import { GRID_SIZE } from '../editor/types'
import type {
  CanvasViewport,
  EditorElement,
  EditorResource,
  ResourceDraft,
  StaticElementKind,
  StaticFloorElement,
} from '../editor/types'
import FloorSelector from './FloorSelector'
import MapEditorCanvas from './MapEditorCanvas'
import ResourcePropertiesPanel from './ResourcePropertiesPanel'
import StaticElementPropertiesPanel from './StaticElementPropertiesPanel'
import Spinner from './Spinner'

interface MapElement {
  resourceId: number
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

const EMPTY_DRAFT: ResourceDraft = {
  nombre: '',
  capacidad: '1',
  hourlyPrice: '',
  dailyPrice: '',
  monthlyPrice: '',
  currency: 'ARS',
  width: '120',
  height: '70',
  rotation: '0',
}

function mapElements(floor: FloorDto, resources: SpaceResourceDto[]): EditorElement[] {
  const payload: MapPayload = floor.mapStructure ? JSON.parse(floor.mapStructure) : { elements: [] }
  const byId = new Map(resources.map((resource) => [resource.id, resource]))
  const resourceElements = (payload.elements ?? []).flatMap((position) => {
    const resource = byId.get(position.resourceId)
    return resource ? [{
      ...resource,
      ...position,
      kind: 'resource' as const,
      elementId: `resource-${resource.id}`,
      rotation: position.rotation ?? 0,
    }] : []
  })
  return [...resourceElements, ...(payload.objects ?? [])]
}

function toPrice(value: string): number | null {
  if (value.trim() === '') return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function draftFromResource(resource: EditorResource): ResourceDraft {
  return {
    nombre: resource.nombre,
    capacidad: String(resource.capacidad),
    hourlyPrice: resource.hourlyPrice == null ? '' : String(resource.hourlyPrice),
    dailyPrice: resource.dailyPrice == null ? '' : String(resource.dailyPrice),
    monthlyPrice: resource.monthlyPrice == null ? '' : String(resource.monthlyPrice),
    currency: resource.currency || 'ARS',
    width: String(resource.w),
    height: String(resource.h),
    rotation: String(resource.rotation),
  }
}

export default function MapEditor({ workspaceId }: { workspaceId: number }) {
  const [workspaceName, setWorkspaceName] = useState('')
  const [floors, setFloors] = useState<FloorDto[]>([])
  const [floorId, setFloorId] = useState<number | null>(null)
  const [resources, setResources] = useState<SpaceResourceDto[]>([])
  const [floorElements, setFloorElements] = useState<Record<number, EditorElement[]>>({})
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [draft, setDraft] = useState<ResourceDraft>(EMPTY_DRAFT)
  const [viewport, setViewport] = useState<CanvasViewport>({ x: 0, y: 0, scale: 1 })
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [panMode, setPanMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [workspaceResponse, floorResponse, resourceResponse] = await Promise.all([
          api.get<WorkspaceDto>(`/workspaces/${workspaceId}`),
          api.get<FloorDto[]>(`/workspaces/${workspaceId}/floors`),
          api.get<SpaceResourceDto[]>(`/workspaces/${workspaceId}/resources`),
        ])
        const loadedFloors = floorResponse.data
        const loadedResources = resourceResponse.data
        const documents = Object.fromEntries(
          loadedFloors.map((floor) => [floor.id, mapElements(floor, loadedResources)]),
        )
        if (!cancelled) {
          setWorkspaceName(workspaceResponse.data.nombre)
          setFloors(loadedFloors)
          setResources(loadedResources)
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
  }, [workspaceId])

  const elements = useMemo(() => (floorId == null ? [] : floorElements[floorId] ?? []), [floorElements, floorId])
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null
  const selectedElement = selectedId == null ? null : elements.find((element) => element.elementId === selectedId) ?? null
  const selectedResource = selectedElement?.kind === 'resource' ? selectedElement : null
  const selectedStaticElement = selectedElement && selectedElement.kind !== 'resource' ? selectedElement : null

  const selectElement = (element: EditorElement, additive = false) => {
    if (additive) {
      const next = selectedIds.includes(element.elementId)
        ? selectedIds.filter((id) => id !== element.elementId)
        : [...selectedIds, element.elementId]
      setSelectedIds(next)
      const onlySelected = next.length === 1 ? elements.find((item) => item.elementId === next[0]) : undefined
      setDraft(onlySelected?.kind === 'resource' ? draftFromResource(onlySelected) : EMPTY_DRAFT)
      return
    }
    setSelectedIds([element.elementId])
    setDraft(element.kind === 'resource'
      ? draftFromResource(element)
      : { ...EMPTY_DRAFT, nombre: element.label, width: String(element.w), height: String(element.h), rotation: String(element.rotation) })
  }

  const addResource = async (tipo: SpaceResourceDto['tipo']) => {
    if (floorId == null) return
    setError('')
    const label = tipo === 'DESK' ? 'Escritorio' : 'Sala'
    try {
      const { data } = await api.post<SpaceResourceDto>(`/workspaces/${workspaceId}/resources`, {
        nombre: `${label} ${resources.filter((resource) => resource.tipo === tipo).length + 1}`,
        capacidad: tipo === 'DESK' ? 1 : 6,
        tipo,
        active: true,
        floorId,
        currency: 'ARS',
      })
      const element: EditorResource = {
        ...data,
        kind: 'resource',
        elementId: `resource-${data.id}`,
        x: 40 + (elements.length % 6) * 35,
        y: 40 + (elements.length % 6) * 35,
        w: tipo === 'DESK' ? 120 : 200,
        h: tipo === 'DESK' ? 70 : 130,
        rotation: 0,
      }
      setResources((previous) => [...previous, data])
      setFloorElements((previous) => ({ ...previous, [floorId]: [...(previous[floorId] ?? []), element] }))
      selectElement(element)
      setSaved(false)
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
      const { data } = await api.post<FloorDto>(`/workspaces/${workspaceId}/floors`, { nombre: name })
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
      setError('Mové o eliminá los elementos del piso antes de eliminarlo.')
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
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const mapStructure = JSON.stringify({
        elements: elements.flatMap((element) => element.kind === 'resource'
          ? [{ resourceId: element.id, x: element.x, y: element.y, w: element.w, h: element.h, rotation: element.rotation }]
          : []),
        objects: elements.flatMap((element) => element.kind !== 'resource'
          ? [{ elementId: element.elementId, kind: element.kind, label: element.label, x: element.x, y: element.y, w: element.w, h: element.h, rotation: element.rotation }]
          : []),
      })
      const { data } = await api.put<FloorDto>(`/floors/${floorId}/map`, { mapStructure })
      setFloors((previous) => previous.map((floor) => (floor.id === floorId ? data : floor)))
      setSaved(true)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  const saveResource = async () => {
    if (!selectedResource) return
    const capacity = Number(draft.capacidad)
    const width = Number(draft.width)
    const height = Number(draft.height)
    const rotation = Number(draft.rotation)
    if (!draft.nombre.trim() || !Number.isInteger(capacity) || capacity < 1) {
      setError('Ingresá un nombre y una capacidad válida.')
      return
    }
    if (![width, height, rotation].every(Number.isFinite) || width < 20 || height < 20) {
      setError('Las dimensiones deben ser de al menos 20 unidades y la rotación debe ser válida.')
      return
    }
    const prices = [draft.hourlyPrice, draft.dailyPrice, draft.monthlyPrice]
    if (prices.some((price) => price.trim() !== '' && toPrice(price) == null)) {
      setError('Las tarifas deben ser importes válidos y no negativos.')
      return
    }
    setError('')
    try {
      const { data } = await api.put<SpaceResourceDto>(`/resources/${selectedResource.id}`, {
        nombre: draft.nombre.trim(),
        capacidad: capacity,
        tipo: selectedResource.tipo,
        active: selectedResource.active,
        floorId: selectedResource.floorId,
        hourlyPrice: toPrice(draft.hourlyPrice),
        dailyPrice: toPrice(draft.dailyPrice),
        monthlyPrice: toPrice(draft.monthlyPrice),
        currency: draft.currency,
      })
      setResources((previous) => previous.map((resource) => (resource.id === data.id ? data : resource)))
      setFloorElements((previous) => Object.fromEntries(
        Object.entries(previous).map(([id, floorItems]) => [
          id,
          floorItems.map((item) => item.kind === 'resource' && item.id === data.id ? { ...item, ...data, w: width, h: height, rotation } : item),
        ]),
      ))
      setSaved(false)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    }
  }

  const removeResource = async () => {
    if (!selectedResource || !window.confirm(`¿Eliminar ${selectedResource.nombre}?`)) return
    setError('')
    try {
      await api.delete(`/resources/${selectedResource.id}`)
      setResources((previous) => previous.filter((resource) => resource.id !== selectedResource.id))
      setFloorElements((previous) => Object.fromEntries(
        Object.entries(previous).map(([id, floorItems]) => [
          id,
          floorItems.filter((item) => item.kind !== 'resource' || item.id !== selectedResource.id),
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
    const width = Number(draft.width)
    const height = Number(draft.height)
    const rotation = Number(draft.rotation)
    if (!draft.nombre.trim() || ![width, height, rotation].every(Number.isFinite) || width < 8 || height < 8) {
      setError('Ingresá un nombre, dimensiones válidas y una rotación válida.')
      return
    }
    setFloorElements((previous) => ({
      ...previous,
      [floorId]: (previous[floorId] ?? []).map((item) => item.elementId === selectedStaticElement.elementId
        ? { ...item, label: draft.nombre.trim(), w: width, h: height, rotation }
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
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Editor de edificio</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{workspaceName}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => void addResource('DESK')} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            + Escritorio
          </button>
          <button onClick={() => void addResource('ROOM')} className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-800">
            + Sala
          </button>
          <button onClick={() => addStaticElement('wall')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            + Pared
          </button>
          <button onClick={() => addStaticElement('door')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            + Puerta
          </button>
          <button onClick={() => addStaticElement('common-area')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            + Zona común
          </button>
          <button onClick={() => void saveMap()} disabled={saving || floorId == null} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar plano'}
          </button>
          {saved && <span className="text-sm font-medium text-emerald-700">Guardado</span>}
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

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1" aria-label="Zoom del plano">
          <button onClick={() => setViewport((view) => ({ ...view, scale: Math.max(0.25, view.scale / 1.2) }))} className="h-8 w-8 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50" aria-label="Alejar">−</button>
          <span className="min-w-12 text-center text-xs font-medium text-slate-600">{Math.round(viewport.scale * 100)}%</span>
          <button onClick={() => setViewport((view) => ({ ...view, scale: Math.min(3, view.scale * 1.2) }))} className="h-8 w-8 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50" aria-label="Acercar">+</button>
          <button onClick={() => setViewport({ x: 0, y: 0, scale: 1 })} className="rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-100">Ajustar</button>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} className="accent-indigo-600" />
          Cuadrícula
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={snapToGrid} onChange={(event) => setSnapToGrid(event.target.checked)} className="accent-indigo-600" />
          Ajustar a cuadrícula
        </label>
        {snapToGrid && <span className="text-xs text-slate-500">Al soltar: cada {GRID_SIZE} unidades</span>}
        <button onClick={() => setPanMode((value) => !value)} aria-pressed={panMode} className={`rounded-md px-3 py-1.5 text-sm font-medium ${panMode ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-slate-100'}`}>
          {panMode ? 'Desplazamiento activo' : 'Desplazar plano'}
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-2">
          {selectedIds.length > 1 && floorId != null && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
              <span className="self-center px-2 text-xs font-medium text-slate-600">{selectedIds.length} seleccionados</span>
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
                className="rounded-md px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
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
                className="rounded-md px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
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
              setDraft(EMPTY_DRAFT)
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
              if (selectedId === elementId) {
                setDraft((current) => ({ ...current, width: String(Math.round(next.w)), height: String(Math.round(next.h)), rotation: String(Math.round(next.rotation)) }))
              }
              setSaved(false)
            }}
            />
        </div>

        {selectedResource && (
          <ResourcePropertiesPanel
            resource={selectedResource}
            draft={draft}
            onDraftChange={setDraft}
            onSave={() => void saveResource()}
            onDelete={() => void removeResource()}
          />
        )}
        {selectedStaticElement && (
          <StaticElementPropertiesPanel
            element={selectedStaticElement}
            draft={draft}
            onDraftChange={setDraft}
            onSave={saveStaticElement}
            onDelete={removeStaticElement}
          />
        )}
      </div>
    </section>
  )
}
