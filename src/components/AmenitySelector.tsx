import { useEffect, useState } from 'react'
import { getAmenities } from '../api/amenities'
import { getErrorMessage } from '../api/client'
import type { AmenityDto } from '../api/types'

interface AmenitySelectorProps {
  amenities?: AmenityDto[]
  selected: number[]
  onChange: (ids: number[]) => void
}

export default function AmenitySelector({ amenities, selected, onChange }: AmenitySelectorProps) {
  const [available, setAvailable] = useState<AmenityDto[]>(amenities ?? [])
  const [error, setError] = useState('')

  useEffect(() => {
    if (amenities) return
    getAmenities()
      .then(setAvailable)
      .catch((err) => setError(getErrorMessage(err)))
  }, [amenities])

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  if (error) return <p className="text-sm text-danger-600">{error}</p>

  return (
    <div>
      <p className="block text-sm text-muted-foreground mb-2">Amenities</p>
      {available.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay amenities disponibles.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {available.map((amenity) => (
            <label
              key={amenity.id}
              className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer text-sm ${
                selected.includes(amenity.id)
                  ? 'border-primary-700 bg-primary-50 text-primary-800'
                  : 'border-border bg-surface'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(amenity.id)}
                onChange={() => toggle(amenity.id)}
                className="accent-primary-700"
              />
              {amenity.nombre}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
