import { useEffect, useMemo, useState } from 'react'
import { getAmenities } from '../api/amenities'
import { getErrorMessage } from '../api/client'
import type { AmenityDto } from '../api/types'

interface AmenitySelectProps {
  selected: number[]
  onChange: (ids: number[]) => void
}

export default function AmenitySelect({ selected, onChange }: AmenitySelectProps) {
  const [available, setAvailable] = useState<AmenityDto[]>([])
  const [draftId, setDraftId] = useState<number | ''>('')
  const [error, setError] = useState('')

  useEffect(() => {
    getAmenities()
      .then(setAvailable)
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  const selectedMap = useMemo(() => new Set(selected), [selected])
  const remaining = available.filter((amenity) => !selectedMap.has(amenity.id))
  const selectedAmenities = available.filter((amenity) => selectedMap.has(amenity.id))

  const add = () => {
    if (draftId === '' || selectedMap.has(draftId)) return
    onChange([...selected, draftId])
    setDraftId('')
  }

  const remove = (id: number) => {
    onChange(selected.filter((item) => item !== id))
  }

  if (error) return <p className="text-sm text-danger-600">{error}</p>

  return (
    <div>
      <span className="block text-sm text-muted-foreground mb-1">Amenities</span>
      <div className="flex gap-2">
        <select
          value={draftId}
          onChange={(e) => setDraftId(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full border border-border rounded-md px-3 py-2 bg-surface"
        >
          <option value="" disabled>
            {remaining.length === 0 ? 'No hay más amenities para agregar' : 'Seleccionar amenity'}
          </option>
          {remaining.map((amenity) => (
            <option key={amenity.id} value={amenity.id}>
              {amenity.nombre}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          disabled={draftId === ''}
          className="shrink-0 border border-border rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-muted disabled:opacity-50"
        >
          Agregar
        </button>
      </div>

      {selectedAmenities.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Todavía no elegiste amenities.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedAmenities.map((amenity) => (
            <span
              key={amenity.id}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-foreground"
            >
              {amenity.nombre}
              <button
                type="button"
                onClick={() => remove(amenity.id)}
                aria-label={`Quitar ${amenity.nombre}`}
                className="text-muted-foreground hover:text-danger-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}