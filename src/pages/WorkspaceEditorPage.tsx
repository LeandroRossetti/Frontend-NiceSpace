import { Link, useParams } from 'react-router-dom'
import MapEditor from '../components/MapEditor'

export default function WorkspaceEditorPage() {
  const { id } = useParams()

  return (
    <div>
      <Link to={`/dashboard/locations/${id}`} className="text-sm text-primary-700 hover:underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Editor del plano</h1>
      <MapEditor locationId={Number(id)} />
    </div>
  )
}
