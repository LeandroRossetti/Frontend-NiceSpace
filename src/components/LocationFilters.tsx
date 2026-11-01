import { useEffect, useState } from 'react'
import { getAmenities } from '../api/amenities'
import { getErrorMessage } from '../api/client'
import type { AmenityDto } from '../api/types'

export interface LocationFiltersValue {
  city: string
  province: string
  amenityIds: number[]
  date: string
  startTime: string
  endTime: string
}

export const EMPTY_FILTERS: LocationFiltersValue = {
  city: '',
  province: '',
  amenityIds: [],
  date: '',
  startTime: '09:00',
  endTime: '11:00',
}

interface LocationFiltersProps {
  value: LocationFiltersValue
  onChange: (value: LocationFiltersValue) => void
  onSubmit: () => void
  onClear: () => void
  searching: boolean
}

export default function LocationFilters({ value, onChange, onSubmit, onClear, searching }: LocationFiltersProps) {
  const [amenities, setAmenities] = useState<AmenityDto[]>([])
  const [amenitiesError, setAmenitiesError] = useState('')

  useEffect(() => {
    getAmenities()
      .then(setAmenities)
      .catch((err) => setAmenitiesError(getErrorMessage(err)))
  }, [])

  const update = (patch: Partial<LocationFiltersValue>) => onChange({ ...value, ...patch })

  const toggleAmenity = (id: number) => {
    const amenityIds = value.amenityIds.includes(id)
      ? value.amenityIds.filter((item) => item !== id)
      : [...value.amenityIds, id]
    update({ amenityIds })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="rounded-xl border border-border bg-surface p-4 shadow-sm mb-6"
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-muted-foreground mb-1" htmlFor="filter-city">
              Localidad
            </label>
            <input
              id="filter-city"
              type="text"
              value={value.city}
              onChange={(e) => update({ city: e.target.value })}
              placeholder="Ej. Palermo"
              className="w-full border border-border rounded-md px-3 py-2 bg-surface"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1" htmlFor="filter-province">
              Provincia
            </label>
            <input
              id="filter-province"
              type="text"
              value={value.province}
              onChange={(e) => update({ province: e.target.value })}
              placeholder="Ej. Córdoba"
              className="w-full border border-border rounded-md px-3 py-2 bg-surface"
            />
          </div>
        </div>

        <div>
          <span className="block text-sm text-muted-foreground mb-1">Amenities</span>
          {amenitiesError ? (
            <p className="text-sm text-danger-600">{amenitiesError}</p>
          ) : amenities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay amenities disponibles.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => {
                const active = value.amenityIds.includes(amenity.id)
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-primary-700 border-primary-700 text-white'
                        : 'border-border bg-surface-muted text-foreground hover:bg-surface'
                    }`}
                  >
                    {amenity.nombre}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <span className="block text-sm text-muted-foreground mb-1">Disponibilidad (opcional)</span>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1" htmlFor="filter-date">
                Fecha
              </label>
              <input
                id="filter-date"
                type="date"
                value={value.date}
                onChange={(e) => update({ date: e.target.value })}
                className="border border-border rounded-md px-3 py-2 bg-surface"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1" htmlFor="filter-start">
                Desde
              </label>
              <input
                id="filter-start"
                type="time"
                value={value.startTime}
                onChange={(e) => update({ startTime: e.target.value })}
                className="border border-border rounded-md px-3 py-2 bg-surface"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1" htmlFor="filter-end">
                Hasta
              </label>
              <input
                id="filter-end"
                type="time"
                value={value.endTime}
                onChange={(e) => update({ endTime: e.target.value })}
                className="border border-border rounded-md px-3 py-2 bg-surface"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={searching}
            className="bg-primary-700 text-white rounded-md px-4 py-2 font-medium hover:bg-primary-800 disabled:opacity-50"
          >
            {searching ? 'Buscando…' : 'Buscar'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="border border-border rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </form>
  )
}
