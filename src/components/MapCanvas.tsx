import { Stage, Layer, Rect, Text, Group } from 'react-konva'
import type { AvailabilityElement, StaticMapObject } from '../api/types'

interface Props {
  elements: AvailabilityElement[]
  objects: StaticMapObject[]
  onSelect?: (el: AvailabilityElement) => void
}

const OBJECT_COLOR: Record<StaticMapObject['kind'], string> = {
  wall: '#334155',
  door: '#b45309',
  'common-area': '#fbbf24',
}

export default function MapCanvas({ elements, objects, onSelect }: Props) {
  const width = 1000
  const height = 600

  return (
    <Stage width={width} height={height} className="border rounded-lg bg-white">
      <Layer>
          <Rect x={0} y={0} width={width} height={height} fill="#f1f5f9" />
          {objects.map((object) => (
            <Group key={object.elementId} x={object.x} y={object.y} rotation={object.rotation} listening={false}>
              <Rect
                width={object.w}
                height={object.h}
                fill={OBJECT_COLOR[object.kind]}
                opacity={object.kind === 'common-area' ? 0.45 : 0.9}
                cornerRadius={object.kind === 'common-area' ? 8 : 1}
                stroke={object.kind === 'common-area' ? '#d97706' : '#334155'}
                strokeWidth={2}
              />
              {object.kind !== 'wall' && (
                <Text text={object.label} width={object.w} height={object.h} align="center" verticalAlign="middle" fontSize={11} fontStyle="bold" fill={object.kind === 'common-area' ? '#78350f' : '#ffffff'} padding={8} />
              )}
            </Group>
          ))}
        {elements.map((el) => (
          <Group
            key={el.resourceId}
            x={el.x}
            y={el.y}
            rotation={el.rotation}
            onClick={() => onSelect?.(el)}
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container()
              if (container && el.available) container.style.cursor = 'pointer'
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container()
              if (container) container.style.cursor = 'default'
            }}
          >
            <Rect
              width={el.w}
              height={el.h}
              fill={el.available ? '#22c55e' : '#ef4444'}
              opacity={el.available ? 0.85 : 0.75}
              cornerRadius={4}
              stroke="#0f172a"
              strokeWidth={1}
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
  )
}
