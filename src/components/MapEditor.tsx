import { useEffect, useState } from 'react'
import { Stage, Layer, Rect, Text, Group } from 'react-konva'
import { api, getErrorMessage } from '../api/client'
import type { SpaceResourceDto, WorkspaceDto } from '../api/types'
import Spinner from './Spinner'

interface Element {
  resourceId: number
  nombre: string
  capacidad: number
  tipo: 'DESK' | 'ROOM'
  x: number
  y: number
  w: number
  h: number
}

const TYPE_COLOR: Record<string, string> = { DESK: '#4f46e5', ROOM: '#0891b2' }

interface MapPayload {
  elements: { resourceId: number; x: number; y: number; w: number; h: number }[]
}

export default function MapEditor({ workspaceId }: { workspaceId: number }) {
  const [elements, setElements] = useState<Element[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [capacidad, setCapacidad] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [ws, res] = await Promise.all([
        api.get<WorkspaceDto>(`/workspaces/${workspaceId}`),
        api.get<SpaceResourceDto[]>(`/workspaces/${workspaceId}/resources`),
      ])
      const map: MapPayload = ws.data.mapStructure ? JSON.parse(ws.data.mapStructure) : { elements: [] }
      const byId = new Map(res.data.map((r) => [r.id, r]))
      const els: Element[] = (map.elements ?? [])
        .filter((e) => byId.has(e.resourceId))
        .map((e) => {
          const r = byId.get(e.resourceId)!
          return {
            resourceId: r.id,
            nombre: r.nombre,
            capacidad: r.capacidad,
            tipo: r.tipo,
            x: e.x,
            y: e.y,
            w: e.w,
            h: e.h,
          }
        })
      setElements(els)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId])

  const addResource = async (tipo: 'DESK' | 'ROOM') => {
    setError('')
    try {
      const base = tipo === 'DESK' ? 'Escritorio' : 'Sala'
      const { data } = await api.post<SpaceResourceDto>(`/workspaces/${workspaceId}/resources`, {
        nombre: `${base} ${elements.length + 1}`,
        capacidad: tipo === 'DESK' ? 2 : 6,
        tipo,
      })
      setElements((prev) => [
        ...prev,
        {
          resourceId: data.id,
          nombre: data.nombre,
          capacidad: data.capacidad,
          tipo: data.tipo,
          x: 40 + (prev.length % 6) * 30,
          y: 40 + (prev.length % 6) * 30,
          w: tipo === 'DESK' ? 120 : 200,
          h: tipo === 'DESK' ? 70 : 130,
        },
      ])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const save = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const mapStructure = JSON.stringify({
        elements: elements.map(({ resourceId, x, y, w, h }) => ({ resourceId, x, y, w, h })),
      })
      await api.put(`/workspaces/${workspaceId}/map`, { mapStructure })
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const select = (el: Element) => {
    setSelectedId(el.resourceId)
    setNombre(el.nombre)
    setCapacidad(el.capacidad)
  }

  const updateResource = async () => {
    if (selectedId == null) return
    setError('')
    try {
      const el = elements.find((e) => e.resourceId === selectedId)!
      const { data } = await api.put<SpaceResourceDto>(`/resources/${selectedId}`, {
        nombre,
        capacidad,
        tipo: el.tipo,
        active: true,
      })
      setElements((prev) =>
        prev.map((e) => (e.resourceId === selectedId ? { ...e, nombre: data.nombre, capacidad: data.capacidad } : e)),
      )
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const remove = async (id: number) => {
    setError('')
    try {
      await api.delete(`/resources/${id}`)
      setElements((prev) => prev.filter((e) => e.resourceId !== id))
      if (selectedId === id) setSelectedId(null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <Spinner label="Cargando editor..." />

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => addResource('DESK')}
            className="bg-indigo-600 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            + Escritorio
          </button>
          <button
            onClick={() => addResource('ROOM')}
            className="bg-cyan-600 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-cyan-700"
          >
            + Sala
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-green-600 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar mapa'}
          </button>
          {saved && <span className="self-center text-sm text-green-600">Mapa guardado</span>}
        </div>

        <Stage width={1000} height={600} className="border rounded-lg bg-white">
          <Layer>
            <Rect x={0} y={0} width={1000} height={600} fill="#f1f5f9" />
            {elements.map((el) => (
              <Group
                key={el.resourceId}
                draggable
                x={el.x}
                y={el.y}
                onClick={() => select(el)}
                onDragEnd={(e) => {
                  setElements((prev) =>
                    prev.map((it) =>
                      it.resourceId === el.resourceId ? { ...it, x: e.target.x(), y: e.target.y() } : it,
                    ),
                  )
                }}
              >
                <Rect
                  width={el.w}
                  height={el.h}
                  fill={TYPE_COLOR[el.tipo]}
                  opacity={0.85}
                  cornerRadius={4}
                  stroke={selectedId === el.resourceId ? '#f59e0b' : '#0f172a'}
                  strokeWidth={selectedId === el.resourceId ? 3 : 1}
                />
                <Text
                  text={`${el.nombre}\n(${el.capacidad})`}
                  width={el.w}
                  height={el.h}
                  align="center"
                  verticalAlign="middle"
                  fontSize={13}
                  fill="#ffffff"
                />
              </Group>
            ))}
          </Layer>
        </Stage>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <p className="mt-2 text-xs text-gray-500">Arrastrá los elementos para posicionarlos. Hacé clic para editar.</p>
      </div>

      {selectedId != null && (
        <div className="w-full lg:w-64 border rounded-lg bg-white p-4 h-fit">
          <h3 className="font-semibold mb-3">Editar recurso</h3>
          <label className="block text-sm text-gray-600 mb-1">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
          />
          <label className="block text-sm text-gray-600 mb-1">Capacidad</label>
          <input
            type="number"
            min={1}
            value={capacidad}
            onChange={(e) => setCapacidad(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={updateResource}
              className="flex-1 bg-indigo-600 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-indigo-700"
            >
              Guardar
            </button>
            <button
              onClick={() => remove(selectedId)}
              className="bg-red-100 text-red-700 rounded-md px-3 py-2 text-sm font-medium hover:bg-red-200"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
