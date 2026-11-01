import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import type { ReservationDto } from '../api/types'
import Spinner from '../components/Spinner'

const STATUS_COLOR: Record<string, string> = {
  CONFIRMADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-danger-500/10 text-danger-700',
  COMPLETADA: 'bg-surface-muted text-muted-foreground',
}

export default function MyReservations() {
  const [reservations, setReservations] = useState<ReservationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canceling, setCanceling] = useState<number | null>(null)

  const load = () => {
    api
      .get<ReservationDto[]>('/reservations/mine')
      .then(({ data }) => setReservations(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const cancel = async (id: number) => {
    setCanceling(id)
    setError('')
    try {
      await api.post(`/reservations/${id}/cancel`)
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
      <h1 className="text-2xl font-bold mb-6">Mis reservas</h1>
      {error && <p className="text-sm text-danger-600 mb-4">{error}</p>}

      {reservations.length === 0 ? (
        <p className="text-muted-foreground">No tenés reservas todavía.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <div key={r.id} className="border rounded-lg bg-surface p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{r.workspaceName}</p>
                <p className="text-sm text-muted-foreground">
                  {r.locationName} · {new Date(r.startTime).toLocaleString()} → {new Date(r.endTime).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.rentalType === 'HORA' ? 'Por hora' : r.rentalType === 'DIA' ? 'Por día' : 'Por mes'}
                  {r.totalPrice != null && <> · ARS {r.totalPrice.toLocaleString('es-AR')}</>}
                </p>
                {r.teamName && <p className="text-xs text-primary-700">Equipo: {r.teamName}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[r.status]}`}>
                  {r.status}
                </span>
                {r.status === 'CONFIRMADA' && new Date(r.endTime) > new Date() && (
                  <button
                    onClick={() => cancel(r.id)}
                    disabled={canceling === r.id}
                    className="text-sm text-danger-600 border border-danger-600/20 rounded-md px-3 py-1 hover:bg-danger-500/10 disabled:opacity-50"
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
