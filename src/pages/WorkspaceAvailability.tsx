import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { AvailabilityElement, AvailabilityResponse, FloorDto, LocationDto, RentalType, TeamDto, WorkspaceType } from '../api/types'
import MapCanvas from '../components/MapCanvas'
import Spinner from '../components/Spinner'
import AmenityChips from '../components/AmenityChips'

const TYPE_LABEL: Record<WorkspaceType, string> = {
  HOT_DESK: 'Hot desk',
  PRIVATE_OFFICE: 'Oficina privada',
  MEETING_ROOM: 'Sala de reuniones',
}

const RENTAL_LABEL: Record<RentalType, string> = {
  HORA: 'Por hora',
  DIA: 'Por día',
  MES: 'Por mes',
}

function toInstant(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

function currencySymbol(currency: string): string {
  return currency === 'USD' ? 'US$' : '$'
}

function priceFor(element: AvailabilityElement, rentalType: RentalType): number | null {
  if (rentalType === 'HORA') return element.pricePerHour
  if (rentalType === 'DIA') return element.pricePerDay
  return element.pricePerMonth
}

function maxFor(element: AvailabilityElement, rentalType: RentalType): number {
  if (rentalType === 'HORA') return element.maxHours
  if (rentalType === 'DIA') return element.maxDays
  return element.maxMonths
}

export default function WorkspaceAvailability() {
  const { id } = useParams()
  const locationId = Number(id)

  const [location, setLocation] = useState<LocationDto | null>(null)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('11:00')
  const [rentalType, setRentalType] = useState<RentalType>('HORA')
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [floors, setFloors] = useState<FloorDto[]>([])
  const [floorId, setFloorId] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState<AvailabilityElement | null>(null)
  const [teams, setTeams] = useState<TeamDto[]>([])
  const [teamId, setTeamId] = useState<number | ''>('')
  const [reserving, setReserving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api
      .get<LocationDto>(`/locations/${locationId}`)
      .then(({ data }) => setLocation(data))
      .catch((err) => setError(getErrorMessage(err)))
  }, [locationId])

  useEffect(() => {
    api
      .get<FloorDto[]>(`/locations/${locationId}/floors`)
      .then(({ data }) => {
        setFloors(data)
        setFloorId(data[0]?.id ?? '')
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [locationId])

  useEffect(() => {
    api
      .get<TeamDto[]>('/teams/mine')
      .then(({ data }) => setTeams(data))
      .catch(() => setTeams([]))
  }, [])

  const buildQuery = () =>
    `/locations/${locationId}/availability?floorId=${floorId}&start=${encodeURIComponent(toInstant(date, startTime))}&end=${encodeURIComponent(toInstant(date, endTime))}`

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (floorId === '') {
      setError('Esta sede todavía no tiene pisos configurados.')
      return
    }
    setError('')
    setSuccess('')
    setSelected(null)
    setLoading(true)
    try {
      const { data } = await api.get<AvailabilityResponse>(buildQuery())
      setAvailability(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const searchRefetch = async () => {
    if (floorId === '') return
    try {
      const { data } = await api.get<AvailabilityResponse>(buildQuery())
      setAvailability(data)
    } catch {
      /* ignore */
    }
  }

  const reserve = async () => {
    if (!selected) return
    setReserving(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/reservations', {
        workspaceId: selected.workspaceId,
        startTime: toInstant(date, startTime),
        endTime: toInstant(date, endTime),
        rentalType,
        teamId: teamId === '' ? null : teamId,
      })
      setSuccess(`Reserva confirmada para "${selected.nombre}". Pagala desde "Mis reservas" para completar el alquiler.`)
      setSelected(null)
      await searchRefetch()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setReserving(false)
    }
  }

  const selectedPrice = selected ? priceFor(selected, rentalType) : null
  const selectedMax = selected ? maxFor(selected, rentalType) : null

  return (
    <div>
      <Link to="/locations" className="text-sm text-primary-700 hover:underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">
        {location ? location.nombre : 'Disponibilidad'}
      </h1>

      {location && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap items-start gap-4">
            <div className="h-24 w-36 shrink-0 rounded-md border border-border bg-surface-muted flex items-center justify-center overflow-hidden">
              {location.imageUrl ? (
                <img src={location.imageUrl} alt={location.nombre} className="h-24 w-36 object-cover" />
              ) : (
                <span className="text-3xl opacity-40" aria-hidden="true">🏢</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {[location.address, location.city, location.province, location.zipCode].filter(Boolean).length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {[location.address, location.city, location.province, location.zipCode].filter(Boolean).join(', ')}
                </p>
              )}
              {location.description && (
                <p className="mt-2 text-sm text-foreground whitespace-pre-line">{location.description}</p>
              )}
              {(location.contactEmail || location.contactPhone) && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {location.contactEmail && <a className="hover:underline" href={`mailto:${location.contactEmail}`}>{location.contactEmail}</a>}
                  {location.contactEmail && location.contactPhone && ' · '}
                  {location.contactPhone && <span>{location.contactPhone}</span>}
                </p>
              )}
              {!location.isActive && <p className="mt-2 text-sm text-amber-600 font-medium">Sede no disponible temporalmente</p>}
              <div className="mt-3">
                <AmenityChips amenities={location.amenities} />
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={search} className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="block text-sm text-muted-foreground mb-1" htmlFor="floor-select">Piso</label>
          <select
            id="floor-select"
            value={floorId}
            onChange={(event) => {
              setFloorId(event.target.value === '' ? '' : Number(event.target.value))
              setAvailability(null)
              setSelected(null)
            }}
            required
            className="border border-border rounded-md px-3 py-2 bg-surface"
          >
            <option value="" disabled>Seleccionar piso</option>
            {floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Fecha</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="border border-border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Desde</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="border border-border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Hasta</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="border border-border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Modalidad</label>
          <select value={rentalType} onChange={(e) => setRentalType(e.target.value as RentalType)} className="border border-border rounded-md px-3 py-2 bg-surface">
            <option value="HORA">Por hora</option>
            <option value="DIA">Por día</option>
            <option value="MES">Por mes</option>
          </select>
        </div>
        <div>
          <button type="submit" className="bg-primary-700 text-white rounded-md px-4 py-2 font-medium hover:bg-primary-800">
            Buscar
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-danger-600 mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      {loading ? (
        <Spinner label="Consultando disponibilidad..." />
      ) : availability ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <MapCanvas elements={availability.elements} objects={availability.objects ?? []} onSelect={(el) => el.available && setSelected(el)} />
            <p className="mt-2 text-xs text-muted-foreground">
              Verde = disponible · Rojo = ocupado. Hacé clic en un espacio verde para reservar.
            </p>
          </div>

          {selected && (
            <div className="w-full lg:w-72 border rounded-lg bg-surface p-4 h-fit">
              <h3 className="font-semibold mb-2">{selected.nombre}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {TYPE_LABEL[selected.workspaceType]} · Capacidad {selected.capacity}
              </p>

              <div className="mb-3 rounded-lg bg-surface-muted p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tarifas</p>
                <ul className="space-y-1 text-sm text-foreground">
                  {selected.pricePerHour != null && <li>Por hora: {currencySymbol(selected.currency)} {selected.pricePerHour.toLocaleString('es-AR')}</li>}
                  {selected.pricePerDay != null && <li>Por día: {currencySymbol(selected.currency)} {selected.pricePerDay.toLocaleString('es-AR')}</li>}
                  {selected.pricePerMonth != null && <li>Por mes: {currencySymbol(selected.currency)} {selected.pricePerMonth.toLocaleString('es-AR')}</li>}
                </ul>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {RENTAL_LABEL[rentalType]} · {date} {startTime} – {endTime}
              </p>

              {selectedPrice != null && (
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Precio: {currencySymbol(selected.currency)} {selectedPrice.toLocaleString('es-AR')}
                  {selectedMax != null && <span className="font-normal text-muted-foreground"> · máx. {selectedMax} {rentalType === 'HORA' ? 'hs' : rentalType === 'DIA' ? 'días' : 'meses'}</span>}
                </p>
              )}

              {teams.length > 0 && (
                <div className="mb-3">
                  <label className="block text-sm text-muted-foreground mb-1">Reservar para el equipo (opcional)</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-border rounded-md px-3 py-2"
                  >
                    <option value="">Reserva individual</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={reserve}
                disabled={reserving}
                className="w-full bg-green-600 text-white rounded-md px-3 py-2 font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {reserving ? 'Reservando...' : 'Confirmar reserva'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Seleccioná una fecha, un rango horario y una modalidad para ver la disponibilidad.</p>
      )}

      {availability && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Espacios ({availability.elements.length})</h2>
          {availability.elements.length === 0 ? (
            <p className="text-muted-foreground">Esta sede todavía no tiene espacios en el plano.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.elements.map((el) => (
                <button
                  key={el.workspaceId}
                  type="button"
                  onClick={() => el.available && setSelected(el)}
                  disabled={!el.available}
                  className={`text-left border rounded-lg bg-surface p-4 shadow-sm ${el.available ? 'hover:shadow-soft-lg' : 'opacity-60'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{el.nombre}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${el.available ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                      {el.available ? 'Disponible' : 'Ocupado'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {TYPE_LABEL[el.workspaceType]} · Capacidad {el.capacity}
                  </p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {el.pricePerHour != null && <div>Hora: {currencySymbol(el.currency)} {el.pricePerHour.toLocaleString('es-AR')}</div>}
                    {el.pricePerDay != null && <div>Día: {currencySymbol(el.currency)} {el.pricePerDay.toLocaleString('es-AR')}</div>}
                    {el.pricePerMonth != null && <div>Mes: {currencySymbol(el.currency)} {el.pricePerMonth.toLocaleString('es-AR')}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}