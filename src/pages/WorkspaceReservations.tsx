import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { ReservationDto } from '../api/types'
import Spinner from '../components/Spinner'

const STATUS_COLOR: Record<string, string> = {
  CONFIRMADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-red-100 text-red-700',
  COMPLETADA: 'bg-gray-100 text-gray-600',
}

export default function WorkspaceReservations() {
  const { id } = useParams()
  const [reservations, setReservations] = useState<ReservationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canceling, setCanceling] = useState<number | null>(null)

  const load = () => {
    api
      .get<ReservationDto[]>(`/reservations/workspace/${id}`)
      .then(({ data }) => setReservations(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const cancel = async (rid: number) => {
    setCanceling(rid)
    setError('')
    try {
      await api.post(`/reservations/${rid}/cancel`)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCanceling(null)
    }
  }

  if (loading) return <Spinner label="Cargando reservas..." />

  return (
    <div>
      <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Reservas del espacio</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {reservations.length === 0 ? (
        <p className="text-gray-500">No hay reservas en este espacio.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div key={r.id} className="border rounded-lg bg-white p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {r.resourceName} <span className="text-gray-400">·</span> {r.createdByName}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(r.startTime).toLocaleString()} → {new Date(r.endTime).toLocaleString()}
                </p>
                {r.teamName && <p className="text-xs text-indigo-600">Equipo: {r.teamName}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[r.status]}`}>
                  {r.status}
                </span>
                {r.status === 'CONFIRMADA' && new Date(r.endTime) > new Date() && (
                  <button
                    onClick={() => cancel(r.id)}
                    disabled={canceling === r.id}
                    className="text-sm text-red-600 border border-red-200 rounded-md px-3 py-1 hover:bg-red-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
