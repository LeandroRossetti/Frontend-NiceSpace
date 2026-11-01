import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { LocationDto, UpdateLocationRequest, WorkspaceDto, WorkspaceType } from '../api/types'
import Spinner from '../components/Spinner'
import LocationForm from '../components/LocationForm'
import AmenityChips from '../components/AmenityChips'

const TYPE_LABEL: Record<WorkspaceType, string> = {
  HOT_DESK: 'Hot desk',
  PRIVATE_OFFICE: 'Oficina privada',
  MEETING_ROOM: 'Sala de reuniones',
}

function currencySymbol(currency: string): string {
  return currency === 'USD' ? 'US$' : '$'
}

function formatPrice(value: number | null, currency: string): string | null {
  if (value == null) return null
  return `${currencySymbol(currency)} ${value.toLocaleString('es-AR')}`
}

export default function LocationDetail() {
  const { id } = useParams()
  const locationId = Number(id)

  const [location, setLocation] = useState<LocationDto | null>(null)
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingLocation, setEditingLocation] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)

  const load = async () => {
    try {
      const [locationResponse, workspaceResponse] = await Promise.all([
        api.get<LocationDto>(`/locations/${locationId}`),
        api.get<WorkspaceDto[]>(`/locations/${locationId}/workspaces`),
      ])
      setLocation(locationResponse.data)
      setWorkspaces(workspaceResponse.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId])

  const updateLocation = async (payload: UpdateLocationRequest) => {
    setSavingLocation(true)
    setError('')
    try {
      const { data } = await api.put<LocationDto>(`/locations/${locationId}`, payload)
      setLocation(data)
      setEditingLocation(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSavingLocation(false)
    }
  }

  if (loading) return <Spinner label="Cargando sede..." />

  return (
    <div>
      <Link to="/dashboard" className="text-sm text-primary-700 hover:underline">← Volver</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{location?.nombre ?? 'Sede'}</h1>
        <Link
          to={`/dashboard/locations/${locationId}/edit`}
          className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
        >
          Editar plano
        </Link>
      </div>

      {location && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {[location.address, location.city, location.province, location.zipCode].filter(Boolean).join(', ')}
              {location.contactEmail && <div className="mt-1">{location.contactEmail}</div>}
              {location.contactPhone && <div>{location.contactPhone}</div>}
              {!location.isActive && <div className="text-amber-600">Sede inactiva</div>}
            </div>
            <button
              onClick={() => setEditingLocation((value) => !value)}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
            >
              {editingLocation ? 'Cancelar' : 'Editar sede'}
            </button>
          </div>
          {location.description && <p className="mt-3 text-sm text-foreground whitespace-pre-line">{location.description}</p>}
          {editingLocation && (
            <div className="mt-4 border-t border-border pt-4">
              <LocationForm initial={location} submitLabel="Guardar sede" submitting={savingLocation} onSubmit={updateLocation} />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-danger-600 mb-4">{error}</p>}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Espacios ({workspaces.length})</h2>
        <span className="text-sm text-muted-foreground">Los espacios se crean desde el plano</span>
      </div>

      {workspaces.length === 0 ? (
        <p className="text-muted-foreground">
          Todavía no hay espacios en esta sede. Usá "Editar plano" para dibujarlos.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div key={ws.id} className="border rounded-lg bg-surface p-4 shadow-sm">
              <h3 className="font-semibold">{ws.nombre}</h3>
              <p className="text-sm text-muted-foreground">{TYPE_LABEL[ws.workspaceType]} · Capacidad {ws.capacity}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                {formatPrice(ws.pricePerHour, ws.currency) && <div>Hora: {formatPrice(ws.pricePerHour, ws.currency)}</div>}
                {formatPrice(ws.pricePerDay, ws.currency) && <div>Día: {formatPrice(ws.pricePerDay, ws.currency)}</div>}
                {formatPrice(ws.pricePerMonth, ws.currency) && <div>Mes: {formatPrice(ws.pricePerMonth, ws.currency)}</div>}
              </div>
              <div className="mt-3">
                <AmenityChips amenities={ws.amenities} />
              </div>
              {!ws.isActive && <p className="text-xs text-amber-600 mt-2">Espacio inactivo</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
