import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { WorkspaceDto } from '../api/types'
import Spinner from '../components/Spinner'

export default function OwnerDashboard() {
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([])
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get<WorkspaceDto[]>('/workspaces/mine')
      setWorkspaces(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await api.post('/workspaces', { nombre })
      setNombre('')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis espacios</h1>

      <form onSubmit={create} className="flex gap-2 mb-8">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del espacio (ej. Piso 1)"
          required
          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-indigo-600 text-white rounded-md px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? 'Creando...' : 'Crear workspace'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <Spinner label="Cargando espacios..." />
      ) : workspaces.length === 0 ? (
        <p className="text-gray-500">Todavía no creaste ningún espacio.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div key={ws.id} className="border rounded-lg bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{ws.nombre}</h2>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/workspaces/${ws.id}/edit`}
                  className="text-sm bg-indigo-600 text-white rounded-md px-3 py-1.5 font-medium hover:bg-indigo-700"
                >
                  Editar mapa
                </Link>
                <Link
                  to={`/workspaces/${ws.id}/reservations`}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 font-medium hover:bg-gray-50"
                >
                  Ver reservas
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
