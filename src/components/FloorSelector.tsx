import type { FloorDto } from '../api/types'

interface Props {
  floors: FloorDto[]
  activeFloorId: number | null
  onSelect: (floorId: number) => void
  onAdd: () => void
  onDelete: () => void
}

export default function FloorSelector({ floors, activeFloorId, onSelect, onAdd, onDelete }: Props) {
  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Pisos del edificio">
      {floors.map((floor) => (
        <button
          key={floor.id}
          onClick={() => onSelect(floor.id)}
          aria-pressed={activeFloorId === floor.id}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeFloorId === floor.id ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
        >
          {floor.nombre}
        </button>
      ))}
      <button onClick={onAdd} className="rounded-full border border-dashed border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
        + Agregar piso
      </button>
      {floors.length > 1 && (
        <button onClick={onDelete} className="ml-auto rounded-lg px-3 py-2 text-sm text-rose-700 hover:bg-rose-50">
          Eliminar piso vacío
        </button>
      )}
    </nav>
  )
}
