import type { AmenityDto } from '../api/types'

interface AmenityChipsProps {
  amenities: AmenityDto[]
}

export default function AmenityChips({ amenities }: AmenityChipsProps) {
  if (amenities.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((amenity) => (
        <span
          key={amenity.id}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-foreground"
        >
          {amenity.nombre}
        </span>
      ))}
    </div>
  )
}
