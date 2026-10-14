import { Stage, Layer, Rect, Text, Group } from 'react-konva'
import type { AvailabilityElement } from '../api/types'

interface Props {
  elements: AvailabilityElement[]
  onSelect?: (el: AvailabilityElement) => void
}

export default function MapCanvas({ elements, onSelect }: Props) {
  const width = 1000
  const height = 600

  return (
    <Stage width={width} height={height} className="border rounded-lg bg-white">
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill="#f1f5f9" />
        {elements.map((el) => (
          <Group
            key={el.resourceId}
            x={el.x}
            y={el.y}
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
