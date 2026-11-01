import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { WorkspaceDto, WorkspaceType } from '../api/types'
import Spinner from '../components/Spinner'
import AmenityChips from '../components/AmenityChips'

const TYPE_LABEL: Record<WorkspaceType, string> = {
  HOT_DESK: 'Hot desk',
  PRIVATE_OFFICE: 'Oficina privada',
  MEETING_ROOM: 'Sala de reuniones',
}

export default function BrowseWorkspaces() {
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<WorkspaceDto[]>('/workspaces')
      .then(({ data }) => setWorkspaces(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Cargando espacios..." />
  if (error) return <p className="text-danger-600">{error}</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Espacios disponibles</h1>
      {workspaces.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay espacios publicados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div key={ws.id} className="border rounded-lg bg-surface p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{ws.nombre}</h2>
              <p className="text-sm text-muted-foreground mb-1">{TYPE_LABEL[ws.workspaceType]}</p>
              {(ws.city || ws.address) && (
                <p className="text-sm text-muted-foreground mb-2">{[ws.address, ws.city].filter(Boolean).join(', ')}</p>
              )}
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {ws.capacity != null && <span>Capacidad: {ws.capacity}</span>}
                {ws.pricePerHour != null && (
                  <span className="font-semibold text-foreground">
                    {ws.currency === 'USD' ? 'US$' : '$'} {ws.pricePerHour.toLocaleString('es-AR')}/h
                  </span>
                )}
              </div>
              <div className="mb-4">
                <AmenityChips amenities={ws.amenities} />
              </div>
              <Link
                to={`/locations/${ws.locationId}`}
                className="text-sm bg-primary-700 text-white rounded-md px-3 py-1.5 font-medium hover:bg-primary-800"
              >
                Ver disponibilidad
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
