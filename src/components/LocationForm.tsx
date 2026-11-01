import { useEffect, useState } from 'react'
import type { CreateLocationRequest, LocationDto } from '../api/types'

interface LocationFormProps {
  initial?: LocationDto | null
  submitLabel: string
  submitting: boolean
  onSubmit: (payload: CreateLocationRequest) => void | Promise<void>
}

export default function LocationForm({ initial, submitLabel, submitting, onSubmit }: LocationFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [province, setProvince] = useState(initial?.province ?? '')
  const [zipCode, setZipCode] = useState(initial?.zipCode ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? '')
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? '')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!initial) return
    setNombre(initial.nombre)
    setAddress(initial.address ?? '')
    setCity(initial.city ?? '')
    setProvince(initial.province ?? '')
    setZipCode(initial.zipCode ?? '')
    setDescription(initial.description ?? '')
    setContactEmail(initial.contactEmail ?? '')
    setContactPhone(initial.contactPhone ?? '')
    setIsActive(initial.isActive)
  }, [initial])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    void onSubmit({
      nombre: nombre.trim(),
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      province: province.trim() || undefined,
      zipCode: zipCode.trim() || undefined,
      description: description.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      isActive,
    })
  }

  const inputClass = 'w-full border border-border rounded-md px-3 py-2 bg-surface'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="block text-sm text-muted-foreground mb-1">Nombre</label>
          <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la sede" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm text-muted-foreground mb-1">Dirección</label>
          <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle y número" className={inputClass} />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm text-muted-foreground mb-1">Ciudad</label>
          <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" className={inputClass} />
        </div>
        <div>
          <label htmlFor="province" className="block text-sm text-muted-foreground mb-1">Provincia</label>
          <input id="province" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Provincia" className={inputClass} />
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm text-muted-foreground mb-1">Código postal</label>
          <input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Código postal" className={inputClass} />
        </div>
        <div>
          <label htmlFor="contactEmail" className="block text-sm text-muted-foreground mb-1">Email de contacto</label>
          <input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contacto@empresa.com" className={inputClass} />
        </div>
        <div>
          <label htmlFor="contactPhone" className="block text-sm text-muted-foreground mb-1">Teléfono de contacto</label>
          <input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+54 11 0000 0000" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm text-muted-foreground mb-1">Descripción</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describí la sede, servicios, ambiente..." rows={4} className={inputClass} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-primary-700" />
        Sede activa
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
