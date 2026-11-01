import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { CreateLocationRequest, LocationDto } from '../api/types'
import Spinner from '../components/Spinner'
import LocationForm from '../components/LocationForm'

export default function OwnerDashboard() {
  const [locations, setLocations] = useState<LocationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get<LocationDto[]>('/locations/mine')
      setLocations(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (payload: CreateLocationRequest) => {
    setError('')
    setCreating(true)
    try {
      await api.post('/locations', payload)
      setShowForm(false)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis sedes</h1>
        <button
          onClick={() => setShowForm((value) => !value)}
          className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
        >
          {showForm ? 'Cancelar' : 'Crear sede'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-border bg-surface p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Nueva sede</h2>
          <LocationForm submitLabel="Crear sede" submitting={creating} onSubmit={create} />
        </div>
      )}

      {error && <p className="text-sm text-danger-600 mb-4">{error}</p>}

      {loading ? (
        <Spinner label="Cargando sedes..." />
      ) : locations.length === 0 ? (
        <p className="text-muted-foreground">Todavía no creaste ninguna sede.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div key={loc.id} className="border rounded-lg bg-surface shadow-sm overflow-hidden flex flex-col">
              <div className="h-36 w-full bg-surface-muted flex items-center justify-center">
                {loc.imageUrl ? (
                  <img src={loc.imageUrl} alt={loc.nombre} className="h-36 w-full object-cover" />
                ) : (
                  <span className="text-4xl opacity-40" aria-hidden="true">🏢</span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-semibold">{loc.nombre}</h2>
                {(loc.address || loc.city) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {[loc.address, loc.city].filter(Boolean).join(', ')}
                  </p>
                )}
                {!loc.isActive && <p className="text-xs text-amber-600 mt-1">Sede inactiva</p>}
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/dashboard/locations/${loc.id}`}
                    className="text-sm bg-primary-700 text-white rounded-md px-3 py-1.5 font-medium hover:bg-primary-800"
                  >
                    Administrar
                  </Link>
                  <Link
                    to={`/dashboard/locations/${loc.id}/reservations`}
                    className="text-sm border border-border rounded-md px-3 py-1.5 font-medium hover:bg-surface-muted"
                  >
                    Ver reservas
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
