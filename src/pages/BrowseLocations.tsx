import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { LocationDto } from '../api/types'
import Spinner from '../components/Spinner'
import AmenityChips from '../components/AmenityChips'
import LocationFilters, { EMPTY_FILTERS, type LocationFiltersValue } from '../components/LocationFilters'

function toInstant(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

function hasActiveFilters(filters: LocationFiltersValue): boolean {
  return Boolean(
    filters.city.trim() || filters.province.trim() || filters.amenityIds.length > 0 || filters.date,
  )
}

export default function BrowseLocations() {
  const [locations, setLocations] = useState<LocationDto[]>([])
  const [filters, setFilters] = useState<LocationFiltersValue>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLocations = (f: LocationFiltersValue) => {
    setLoading(true)
    setError('')

    const params = new URLSearchParams()
    if (f.city.trim()) params.set('city', f.city.trim())
    if (f.province.trim()) params.set('province', f.province.trim())
    if (f.amenityIds.length > 0) params.set('amenityIds', f.amenityIds.join(','))
    if (f.date) {
      params.set('start', toInstant(f.date, f.startTime))
      params.set('end', toInstant(f.date, f.endTime))
    }
    const qs = params.toString()

    api
      .get<LocationDto[]>(`/locations${qs ? `?${qs}` : ''}`)
      .then(({ data }) => setLocations(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLocations(EMPTY_FILTERS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const search = () => fetchLocations(filters)

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    fetchLocations(EMPTY_FILTERS)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Espacios de coworking</h1>

      <LocationFilters
        value={filters}
        onChange={setFilters}
        onSubmit={search}
        onClear={clearFilters}
        searching={loading}
      />

      {error && <p className="text-danger-600 mb-4">{error}</p>}

      {loading ? (
        <Spinner label="Cargando sedes..." />
      ) : locations.length === 0 ? (
        <p className="text-muted-foreground">
          {hasActiveFilters(filters) ? 'No se encontraron sedes con esos filtros.' : 'Todavía no hay sedes publicadas.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <Link
              key={loc.id}
              to={`/locations/${loc.id}`}
              className="border rounded-lg bg-surface shadow-sm overflow-hidden flex flex-col hover:shadow-soft-lg transition-shadow"
            >
              <div className="h-36 w-full bg-surface-muted flex items-center justify-center">
                {loc.imageUrl ? (
                  <img src={loc.imageUrl} alt={loc.nombre} className="h-36 w-full object-cover" />
                ) : (
                  <span className="text-4xl opacity-40" aria-hidden="true">🏢</span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-semibold">{loc.nombre}</h2>
                {(loc.address || loc.city || loc.province) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {[loc.address, loc.city, loc.province].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="mt-3">
                  <AmenityChips amenities={loc.amenities} />
                </div>
                <div className="mt-4">
                  <span className="text-sm bg-primary-700 text-white rounded-md px-3 py-1.5 font-medium hover:bg-primary-800 inline-block">
                    Ver espacios
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
