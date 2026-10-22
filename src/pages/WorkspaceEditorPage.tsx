import { Link, useParams } from 'react-router-dom'
import MapEditor from '../components/MapEditor'

export default function WorkspaceEditorPage() {
  const { id } = useParams()

  return (
    <div>
      <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Editor del edificio</h1>
      <MapEditor workspaceId={Number(id)} />
    </div>
  )
}
