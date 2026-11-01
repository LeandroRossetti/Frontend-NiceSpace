import { useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../api/client'
import { uploadImage } from '../api/images'
import type { CreateLocationRequest, LocationDto } from '../api/types'

const MAX_IMAGE_BYTES = 32 * 1024 * 1024

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
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setImageUrl(initial.imageUrl ?? '')
  }, [initial])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError('')
    if (!file.type.startsWith('image/')) {
      setImageError('El archivo debe ser una imagen.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('La imagen supera el tamaño máximo permitido (32 MB).')
      return
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setImageError('')
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    let finalImageUrl = imageUrl
    if (imageFile) {
      setUploadingImage(true)
      try {
        finalImageUrl = await uploadImage(imageFile)
        setImageUrl(finalImageUrl)
      } catch (err) {
        setImageError(getErrorMessage(err))
        setUploadingImage(false)
        return
      }
      setUploadingImage(false)
    }
    await onSubmit({
      nombre: nombre.trim(),
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      province: province.trim() || undefined,
      zipCode: zipCode.trim() || undefined,
      description: description.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      imageUrl: finalImageUrl.trim() || undefined,
      isActive,
    })
  }

  const inputClass = 'w-full border border-border rounded-md px-3 py-2 bg-surface'
  const previewSrc = imagePreview || imageUrl || null
  const busy = submitting || uploadingImage

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <span className="block text-sm text-muted-foreground mb-1">Imagen de la sede</span>
        <div className="flex items-center gap-4">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="Vista previa de la sede"
              className="h-32 w-48 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="h-32 w-48 rounded-md border border-dashed border-border bg-surface-muted flex items-center justify-center text-2xl text-muted-foreground">
              🏢
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="self-start border border-border rounded-md px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
            >
              {previewSrc ? 'Cambiar imagen' : 'Elegir imagen'}
            </button>
            {previewSrc && (
              <button
                type="button"
                onClick={removeImage}
                className="self-start text-sm text-danger-600 hover:underline"
              >
                Quitar imagen
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground mt-1">Imagen de portada (máx. 32 MB).</p>
        {imageError && <p className="text-sm text-danger-600 mt-1">{imageError}</p>}
      </div>

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
        disabled={busy}
        className="self-start bg-primary-700 text-white rounded-md px-4 py-2 font-medium hover:bg-primary-800 disabled:opacity-50"
      >
        {uploadingImage ? 'Subiendo imagen…' : submitting ? 'Guardando…' : submitLabel}
      </button>
    </form>
  )
}
