import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { WorkspaceDto } from '../api/types'
import Spinner from '../components/Spinner'

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
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Espacios disponibles</h1>
      {workspaces.length === 0 ? (
        <p className="text-gray-500">Todavía no hay espacios publicados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div key={ws.id} className="border rounded-lg bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{ws.nombre}</h2>
              <p className="text-sm text-gray-500 mb-4">Ofrecido por {ws.ownerName}</p>
              <Link
                to={`/workspaces/${ws.id}`}
                className="text-sm bg-indigo-600 text-white rounded-md px-3 py-1.5 font-medium hover:bg-indigo-700"
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
