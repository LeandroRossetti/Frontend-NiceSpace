import { useEffect, useState } from 'react'
import type { CreateWorkspaceRequest, WorkspaceDto, WorkspaceType } from '../api/types'
import AmenitySelector from './AmenitySelector'

const WORKSPACE_TYPE_OPTIONS: { value: WorkspaceType; label: string }[] = [
  { value: 'HOT_DESK', label: 'Hot desk' },
  { value: 'PRIVATE_OFFICE', label: 'Oficina privada' },
  { value: 'MEETING_ROOM', label: 'Sala de reuniones' },
]

interface WorkspaceDetailsFormProps {
  initial?: WorkspaceDto | null
  submitLabel: string
  submitting: boolean
  onSubmit: (payload: CreateWorkspaceRequest) => void | Promise<void>
}

function toNumberOrNull(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toIntOr(value: string, fallback: number): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : fallback
}

export default function WorkspaceDetailsForm({ initial, submitLabel, submitting, onSubmit }: WorkspaceDetailsFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>(initial?.workspaceType ?? 'HOT_DESK')
  const [capacity, setCapacity] = useState(initial?.capacity != null ? String(initial.capacity) : '')
  const [pricePerHour, setPricePerHour] = useState(initial?.pricePerHour != null ? String(initial.pricePerHour) : '')
  const [pricePerDay, setPricePerDay] = useState(initial?.pricePerDay != null ? String(initial.pricePerDay) : '')
  const [pricePerMonth, setPricePerMonth] = useState(initial?.pricePerMonth != null ? String(initial.pricePerMonth) : '')
  const [maxHours, setMaxHours] = useState(String(initial?.maxHours ?? 24))
  const [maxDays, setMaxDays] = useState(String(initial?.maxDays ?? 30))
  const [maxMonths, setMaxMonths] = useState(String(initial?.maxMonths ?? 12))
  const [currency, setCurrency] = useState(initial?.currency ?? 'ARS')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [amenityIds, setAmenityIds] = useState<number[]>(initial?.amenities.map((amenity) => amenity.id) ?? [])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!initial) return
    setNombre(initial.nombre)
    setWorkspaceType(initial.workspaceType)
    setCapacity(initial.capacity != null ? String(initial.capacity) : '')
    setPricePerHour(initial.pricePerHour != null ? String(initial.pricePerHour) : '')
    setPricePerDay(initial.pricePerDay != null ? String(initial.pricePerDay) : '')
    setPricePerMonth(initial.pricePerMonth != null ? String(initial.pricePerMonth) : '')
    setMaxHours(String(initial.maxHours))
    setMaxDays(String(initial.maxDays))
    setMaxMonths(String(initial.maxMonths))
    setCurrency(initial.currency)
    setIsActive(initial.isActive)
    setAmenityIds(initial.amenities.map((amenity) => amenity.id))
  }, [initial])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    const capacityNumber = toNumberOrNull(capacity)
    if (capacityNumber == null || !Number.isInteger(capacityNumber) || capacityNumber < 1) {
      setError('La capacidad debe ser un número entero mayor o igual a 1.')
      return
    }

    void onSubmit({
      nombre: nombre.trim(),
      workspaceType,
      capacity: capacityNumber,
      pricePerHour: toNumberOrNull(pricePerHour),
      pricePerDay: toNumberOrNull(pricePerDay),
      pricePerMonth: toNumberOrNull(pricePerMonth),
      maxHours: toIntOr(maxHours, 24),
      maxDays: toIntOr(maxDays, 30),
      maxMonths: toIntOr(maxMonths, 12),
      currency,
      isActive,
      amenityIds,
    })
  }

  const inputClass = 'w-full border border-border rounded-md px-3 py-2 bg-surface'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="block text-sm text-muted-foreground mb-1">Nombre</label>
          <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Sala de reuniones A" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="workspaceType" className="block text-sm text-muted-foreground mb-1">Tipo de espacio</label>
          <select id="workspaceType" value={workspaceType} onChange={(e) => setWorkspaceType(e.target.value as WorkspaceType)} className={inputClass}>
            {WORKSPACE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="capacity" className="block text-sm text-muted-foreground mb-1">Capacidad</label>
          <input id="capacity" type="number" min={1} step={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Personas" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm text-muted-foreground mb-1">Moneda</label>
          <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
            <option value="ARS">ARS · Pesos</option>
            <option value="USD">USD · Dólares</option>
          </select>
        </div>
        <div>
          <label htmlFor="pricePerHour" className="block text-sm text-muted-foreground mb-1">Precio por hora</label>
          <input id="pricePerHour" type="number" min={0} step="0.01" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} placeholder="0.00" className={inputClass} />
        </div>
        <div>
          <label htmlFor="pricePerDay" className="block text-sm text-muted-foreground mb-1">Precio por día</label>
          <input id="pricePerDay" type="number" min={0} step="0.01" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} placeholder="0.00" className={inputClass} />
        </div>
        <div>
          <label htmlFor="pricePerMonth" className="block text-sm text-muted-foreground mb-1">Precio por mes</label>
          <input id="pricePerMonth" type="number" min={0} step="0.01" value={pricePerMonth} onChange={(e) => setPricePerMonth(e.target.value)} placeholder="0.00" className={inputClass} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="maxHours" className="block text-sm text-muted-foreground mb-1">Máx. horas</label>
            <input id="maxHours" type="number" min={1} step={1} value={maxHours} onChange={(e) => setMaxHours(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="maxDays" className="block text-sm text-muted-foreground mb-1">Máx. días</label>
            <input id="maxDays" type="number" min={1} step={1} value={maxDays} onChange={(e) => setMaxDays(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="maxMonths" className="block text-sm text-muted-foreground mb-1">Máx. meses</label>
            <input id="maxMonths" type="number" min={1} step={1} value={maxMonths} onChange={(e) => setMaxMonths(e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      <AmenitySelector selected={amenityIds} onChange={setAmenityIds} />

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-primary-700" />
        Espacio activo
      </label>

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-primary-700 text-white rounded-md px-4 py-2 font-medium hover:bg-primary-800 disabled:opacity-50"
      >
        {submitting ? 'Guardando…' : submitLabel}
      </button>
    </form>
  )
}
