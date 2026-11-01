import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { PaymentDto, ReservationDto } from '../api/types'
import Spinner from '../components/Spinner'

const STATUS_COLOR: Record<string, string> = {
  CONFIRMADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-danger-500/10 text-danger-700',
  COMPLETADA: 'bg-surface-muted text-muted-foreground',
}

const PAYMENT_LABEL: Record<string, string> = {
  PAID: 'Pagado',
  PENDING: 'Pago pendiente',
  REJECTED: 'Pago rechazado',
}

const PAYMENT_COLOR: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-danger-500/10 text-danger-700',
}

function currencySymbol(currency: string): string {
  return currency === 'USD' ? 'US$' : '$'
}

export default function MyReservations() {
  const [reservations, setReservations] = useState<ReservationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [notice, setNotice] = useState('')
  const [canceling, setCanceling] = useState<number | null>(null)
  const [paying, setPaying] = useState<number | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const load = () => {
    api
      .get<ReservationDto[]>('/reservations/mine')
      .then(({ data }) => setReservations(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  // Al volver de Mercado Pago (back_urls), confirmamos el pago contra la API.
  useEffect(() => {
    const paymentId = searchParams.get('payment_id')
    const externalReference = searchParams.get('external_reference')
    if (!paymentId || !externalReference) return
    const reservationId = Number(externalReference)
    if (!reservationId) return

    setError('')
    setSuccess('')
    setNotice('')
    api
      .post<PaymentDto>('/payments/confirm', { reservationId, paymentId })
      .then(({ data }) => {
        if (data.status === 'PAID') {
          setSuccess('¡Pago aprobado! Tu reserva quedó abonada.')
        } else if (data.status === 'REJECTED') {
          setNotice('El pago fue rechazado. Podés intentarlo de nuevo.')
        } else {
          setNotice('El pago quedó pendiente de confirmación.')
        }
        return load()
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setSearchParams({}, { replace: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const cancel = async (id: number) => {
    setCanceling(id)
    setError('')
    setSuccess('')
    setNotice('')
    try {
      await api.post(`/reservations/${id}/cancel`)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCanceling(null)
    }
  }

  const pay = async (r: ReservationDto) => {
    setPaying(r.id)
    setError('')
    setSuccess('')
    setNotice('')
    try {
      const { data } = await api.post<PaymentDto>(`/reservations/${r.id}/pay`)
      window.location.href = data.checkoutUrl
    } catch (err) {
      setError(getErrorMessage(err))
      setPaying(null)
    }
  }

  if (loading) return <Spinner label="Cargando reservas..." />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis reservas</h1>
      {error && <p className="text-sm text-danger-600 mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}
      {notice && <p className="text-sm text-amber-600 mb-4">{notice}</p>}

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
                  {r.totalPrice != null && <> · {currencySymbol(r.currency)} {r.totalPrice.toLocaleString('es-AR')}</>}
                </p>
                {r.teamName && <p className="text-xs text-primary-700">Equipo: {r.teamName}</p>}
              </div>
              <div className="flex items-center gap-3">
                {r.paymentStatus && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLOR[r.paymentStatus]}`}>
                    {PAYMENT_LABEL[r.paymentStatus]}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[r.status]}`}>
                  {r.status}
                </span>
                {r.status === 'CONFIRMADA' && r.paymentStatus !== 'PAID' && new Date(r.endTime) > new Date() && (
                  <button
                    onClick={() => pay(r)}
                    disabled={paying === r.id}
                    className="text-sm bg-primary-700 text-white rounded-md px-3 py-1 hover:bg-primary-800 disabled:opacity-50"
                  >
                    {paying === r.id ? 'Redirigiendo...' : 'Pagar Reserva'}
                  </button>
                )}
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
