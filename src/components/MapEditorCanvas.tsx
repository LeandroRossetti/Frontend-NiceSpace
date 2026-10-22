import { useEffect, useRef } from 'react'
import { Group, Layer, Line, Rect, Stage, Text, Transformer } from 'react-konva'
import type { Group as KonvaGroup } from 'konva/lib/Group'
import type { Transformer as KonvaTransformer } from 'konva/lib/shapes/Transformer'
import { GRID_SIZE, type CanvasViewport, type EditorElement } from '../editor/types'

const RESOURCE_COLOR: Record<'DESK' | 'ROOM', string> = { DESK: '#4f46e5', ROOM: '#0891b2' }
const SHAPE_COLOR: Record<'wall' | 'door' | 'common-area', string> = {
  wall: '#334155',
  door: '#b45309',
  'common-area': '#f59e0b',
}

interface Props {
  elements: EditorElement[]
  selectedIds: string[]
  onSelect: (element: EditorElement, additive: boolean) => void
  onClearSelection: () => void
  onMove: (elementId: string, x: number, y: number) => void
  onTransform: (elementId: string, transform: Pick<EditorElement, 'x' | 'y' | 'w' | 'h' | 'rotation'>) => void
  viewport: CanvasViewport
  onViewportChange: (viewport: CanvasViewport) => void
  showGrid: boolean
  panMode: boolean
}

export default function MapEditorCanvas({
  elements,
  selectedIds,
  onSelect,
  onClearSelection,
  onMove,
  onTransform,
  viewport,
  onViewportChange,
  showGrid,
  panMode,
}: Props) {
  const groupRefs = useRef(new Map<string, KonvaGroup>())
  const transformerRef = useRef<KonvaTransformer>(null)
  const pointerSelectionRef = useRef<{ elementId: string; wasSelected: boolean; additive: boolean } | null>(null)

  useEffect(() => {
    const transformer = transformerRef.current
    const selectedGroups = selectedIds.flatMap((id) => {
      const group = groupRefs.current.get(id)
      return group ? [group] : []
    })
    transformer?.nodes(selectedGroups)
    transformer?.getLayer()?.batchDraw()
  }, [selectedIds, elements, panMode])

  return (
    <div className="min-w-0 flex-1 overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3 shadow-sm">
      <Stage
        width={1000}
        height={600}
        className={`rounded-lg bg-white shadow-inner ${panMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
        draggable={panMode}
        onDragEnd={(event) => {
          const stage = event.target.getStage()
          if (!panMode || event.target !== stage) return
          const x = event.target.x()
          const y = event.target.y()
          event.target.position({ x: 0, y: 0 })
          onViewportChange({ ...viewport, x: viewport.x + x, y: viewport.y + y })
        }}
        onMouseDown={(event) => {
          if (event.target === event.target.getStage()) onClearSelection()
        }}
        onWheel={(event) => {
          event.evt.preventDefault()
          const stage = event.target.getStage()
          const pointer = stage?.getPointerPosition()
          if (!pointer) return
          const nextScale = Math.min(3, Math.max(0.25, viewport.scale * (event.evt.deltaY < 0 ? 1.1 : 1 / 1.1)))
          const worldPoint = {
            x: (pointer.x - viewport.x) / viewport.scale,
            y: (pointer.y - viewport.y) / viewport.scale,
          }
          onViewportChange({
            scale: nextScale,
            x: pointer.x - worldPoint.x * nextScale,
            y: pointer.y - worldPoint.y * nextScale,
          })
        }}
      >
        <Layer x={viewport.x} y={viewport.y} scaleX={viewport.scale} scaleY={viewport.scale}>
          <Rect x={0} y={0} width={1000} height={600} fill="#f8fafc" listening={false} />
          {showGrid && Array.from({ length: Math.floor(1000 / GRID_SIZE) + 1 }, (_, index) => (
            <Line key={`vertical-${index}`} points={[index * GRID_SIZE, 0, index * GRID_SIZE, 600]} stroke="#023777" strokeWidth={0.7} opacity={0.55} listening={false} />
          ))}
          {showGrid && Array.from({ length: Math.floor(600 / GRID_SIZE) + 1 }, (_, index) => (
            <Line key={`horizontal-${index}`} points={[0, index * GRID_SIZE, 1000, index * GRID_SIZE]} stroke="#023777" strokeWidth={0.7} opacity={0.55} listening={false} />
          ))}
          {elements.map((element) => (
            <Group
              key={element.elementId}
              ref={(node) => {
                if (node) groupRefs.current.set(element.elementId, node)
                else groupRefs.current.delete(element.elementId)
              }}
              draggable={!panMode}
              x={element.x}
              y={element.y}
              rotation={element.rotation}
              onMouseDown={(event) => {
                if (panMode) return
                const additive = event.evt.shiftKey
                const wasSelected = selectedIds.includes(element.elementId)
                pointerSelectionRef.current = { elementId: element.elementId, wasSelected, additive }
                if (additive) {
                  if (!wasSelected) onSelect(element, true)
                } else if (!wasSelected) {
                  onSelect(element, false)
                }
              }}
              onClick={() => {
                const pointerSelection = pointerSelectionRef.current
                if (pointerSelection?.elementId === element.elementId && pointerSelection.additive && pointerSelection.wasSelected) {
                  onSelect(element, true)
                }
                pointerSelectionRef.current = null
              }}
              onTouchStart={() => {
                if (!panMode && !selectedIds.includes(element.elementId)) onSelect(element, false)
              }}
              onDragEnd={(event) => {
                event.cancelBubble = true
                onMove(element.elementId, event.target.x(), event.target.y())
              }}
              onTransformEnd={(event) => {
                const node = event.target
                const xScale = node.scaleX()
                const yScale = node.scaleY()
                const width = Math.max(20, element.w * xScale)
                const height = Math.max(20, element.h * yScale)
                node.scaleX(1)
                node.scaleY(1)
                onTransform(element.elementId, {
                  x: node.x(),
                  y: node.y(),
                  w: width,
                  h: height,
                  rotation: node.rotation(),
                })
              }}
            >
              <Rect
                width={element.w}
                height={element.h}
                fill={element.kind === 'resource' ? RESOURCE_COLOR[element.tipo] : SHAPE_COLOR[element.kind]}
                opacity={element.kind === 'common-area' ? 0.45 : 0.9}
                cornerRadius={element.kind === 'resource' || element.kind === 'common-area' ? 8 : 1}
                stroke={selectedIds.includes(element.elementId) ? '#f59e0b' : element.kind === 'common-area' ? '#d97706' : '#334155'}
                strokeWidth={selectedIds.includes(element.elementId) ? 3 : element.kind === 'wall' ? 1 : 2}
                shadowColor="#0f172a"
                shadowBlur={selectedIds.includes(element.elementId) ? 8 : 3}
                shadowOpacity={0.15}
              />
              <Text
                text={element.kind === 'resource'
                  ? `${element.nombre}\n${element.capacidad} ${element.capacidad === 1 ? 'persona' : 'personas'}`
                  : element.kind === 'wall' ? '' : element.label}
                width={element.w}
                height={element.h}
                align="center"
                verticalAlign="middle"
                fontSize={element.kind === 'resource' ? 13 : 11}
                fontStyle="bold"
                fill={element.kind === 'common-area' ? '#78350f' : '#ffffff'}
                padding={8}
                listening={false}
              />
            </Group>
          ))}
          {!panMode && (
            <Transformer
              ref={transformerRef}
              rotateEnabled
              keepRatio={false}
              flipEnabled={false}
              boundBoxFunc={(oldBox, newBox) => newBox.width < 20 || newBox.height < 20 ? oldBox : newBox}
            />
          )}
        </Layer>
      </Stage>
      <p className="px-1 pt-3 text-xs text-slate-500">Arrastrá los recursos para ubicarlos. Seleccioná uno para editar sus datos y tarifas.</p>
    </div>
  )
}
