import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import type { AvailabilityElement, AvailabilityResponse, FloorDto, TeamDto } from '../api/types'
import MapCanvas from '../components/MapCanvas'
import Spinner from '../components/Spinner'

function toInstant(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

export default function WorkspaceAvailability() {
  const { id } = useParams()
  const workspaceId = Number(id)

  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('11:00')
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
      .get<FloorDto[]>(`/workspaces/${workspaceId}/floors`)
      .then(({ data }) => {
        setFloors(data)
        setFloorId(data[0]?.id ?? '')
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [workspaceId])

  useEffect(() => {
    api
      .get<TeamDto[]>('/teams/mine')
      .then(({ data }) => setTeams(data))
      .catch(() => setTeams([]))
  }, [])

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (floorId === '') {
      setError('Este edificio todavía no tiene pisos configurados.')
      return
    }
    setError('')
    setSuccess('')
    setSelected(null)
    setLoading(true)
    try {
      const start = toInstant(date, startTime)
      const end = toInstant(date, endTime)
      const { data } = await api.get<AvailabilityResponse>(
        `/workspaces/${workspaceId}/availability?floorId=${floorId}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
      )
      setAvailability(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const reserve = async () => {
    if (!selected) return
    setReserving(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/reservations', {
        resourceId: selected.resourceId,
        startTime: toInstant(date, startTime),
        endTime: toInstant(date, endTime),
        teamId: teamId === '' ? null : teamId,
      })
      setSuccess(`Reserva confirmada para "${selected.nombre}".`)
      setSelected(null)
      await searchRefetch()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setReserving(false)
    }
  }

  const searchRefetch = async () => {
    if (floorId === '') return
    try {
      const start = toInstant(date, startTime)
      const end = toInstant(date, endTime)
      const { data } = await api.get<AvailabilityResponse>(
        `/workspaces/${workspaceId}/availability?floorId=${floorId}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
      )
      setAvailability(data)
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <Link to="/workspaces" className="text-sm text-indigo-600 hover:underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">
        {availability ? availability.workspaceName : 'Disponibilidad'}
      </h1>

      <form onSubmit={search} className="flex flex-wrap gap-3 mb-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="floor-select">Piso</label>
          <select
            id="floor-select"
            value={floorId}
            onChange={(event) => {
              setFloorId(event.target.value === '' ? '' : Number(event.target.value))
              setAvailability(null)
              setSelected(null)
            }}
            required
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="" disabled>Seleccionar piso</option>
            {floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Desde</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Hasta</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div className="self-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-md px-4 py-2 font-medium hover:bg-indigo-700"
          >
            Buscar
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      {loading ? (
        <Spinner label="Consultando disponibilidad..." />
      ) : availability ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <MapCanvas elements={availability.elements} objects={availability.objects ?? []} onSelect={(el) => el.available && setSelected(el)} />
            <p className="mt-2 text-xs text-gray-500">
              Verde = disponible · Rojo = ocupado. Hacé clic en un espacio verde para reservar.
            </p>
          </div>

          {selected && (
            <div className="w-full lg:w-72 border rounded-lg bg-white p-4 h-fit">
              <h3 className="font-semibold mb-2">{selected.nombre}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {selected.tipo} · Capacidad {selected.capacidad}
              </p>
              {(selected.hourlyPrice != null || selected.dailyPrice != null || selected.monthlyPrice != null) && (
                <div className="mb-3 rounded-lg bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tarifas</p>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {selected.hourlyPrice != null && <li>Por hora: {selected.currency} {selected.hourlyPrice.toLocaleString('es-AR')}</li>}
                    {selected.dailyPrice != null && <li>Por día: {selected.currency} {selected.dailyPrice.toLocaleString('es-AR')}</li>}
                    {selected.monthlyPrice != null && <li>Por mes: {selected.currency} {selected.monthlyPrice.toLocaleString('es-AR')}</li>}
                  </ul>
                </div>
              )}
              <p className="text-sm text-gray-500 mb-3">
                {date} {startTime} – {endTime}
              </p>

              {teams.length > 0 && (
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Reservar para el equipo (opcional)</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
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
        <p className="text-gray-500">Seleccioná una fecha y un rango horario para ver la disponibilidad.</p>
      )}
    </div>
  )
}
