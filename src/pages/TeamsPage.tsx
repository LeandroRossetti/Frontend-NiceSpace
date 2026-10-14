import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import type { TeamDto, TeamInvitationDto, TeamMemberDto } from '../api/types'
import Spinner from '../components/Spinner'

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamDto[]>([])
  const [invitations, setInvitations] = useState<TeamInvitationDto[]>([])
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [members, setMembers] = useState<Record<number, TeamMemberDto[]>>({})
  const [inviteEmail, setInviteEmail] = useState<Record<number, string>>({})
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [t, inv] = await Promise.all([
        api.get<TeamDto[]>('/teams/mine'),
        api.get<TeamInvitationDto[]>('/invitations/mine'),
      ])
      setTeams(t.data)
      setInvitations(inv.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/teams', { nombre })
      setNombre('')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const toggle = async (id: number) => {
    if (expanded === id) {
      setExpanded(null)
      return
    }
    setExpanded(id)
    try {
      const { data } = await api.get<TeamMemberDto[]>(`/teams/${id}/members`)
      setMembers((prev) => ({ ...prev, [id]: data }))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const invite = async (teamId: number) => {
    const email = inviteEmail[teamId]
    if (!email) return
    setError('')
    setMessage('')
    try {
      await api.post(`/teams/${teamId}/invite`, { email })
      setInviteEmail((prev) => ({ ...prev, [teamId]: '' }))
      setMessage('Invitación enviada.')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const accept = async (token: string) => {
    setError('')
    try {
      await api.post(`/invitations/${token}/accept`)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const decline = async (token: string) => {
    setError('')
    try {
      await api.post(`/invitations/${token}/decline`)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <Spinner label="Cargando equipos..." />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Equipos</h1>

      <form onSubmit={create} className="flex gap-2 mb-8">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del equipo (ej. Startup Demo)"
          required
          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white rounded-md px-4 py-2 font-medium hover:bg-indigo-700"
        >
          Crear equipo
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {message && <p className="text-sm text-green-600 mb-4">{message}</p>}

      {invitations.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Invitaciones pendientes</h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="border rounded-lg bg-white p-3 flex items-center justify-between">
                <span className="text-sm">
                  Te invitaron al equipo <span className="font-medium">{inv.teamName}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => accept(inv.token)}
                    className="text-sm bg-green-600 text-white rounded-md px-3 py-1 hover:bg-green-700"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => decline(inv.token)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="text-lg font-semibold mb-3">Mis equipos</h2>
      {teams.length === 0 ? (
        <p className="text-gray-500">No pertenecés a ningún equipo.</p>
      ) : (
        <div className="space-y-3">
          {teams.map((t) => (
            <div key={t.id} className="border rounded-lg bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{t.nombre}</span>
                  <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">
                    {t.myRole === 'OWNER' ? 'Dueño' : 'Miembro'}
                  </span>
                </div>
                <button
                  onClick={() => toggle(t.id)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {expanded === t.id ? 'Ocultar' : 'Gestionar'}
                </button>
              </div>

              {expanded === t.id && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Miembros</h4>
                  <ul className="space-y-1 mb-4">
                    {(members[t.id] ?? []).map((m) => (
                      <li key={m.userId} className="text-sm text-gray-700">
                        {m.nombre} <span className="text-gray-400">({m.email})</span>
                      </li>
                    ))}
                  </ul>

                  {t.myRole === 'OWNER' && (
                    <div className="flex gap-2">
                      <input
                        value={inviteEmail[t.id] ?? ''}
                        onChange={(e) => setInviteEmail((prev) => ({ ...prev, [t.id]: e.target.value }))}
                        placeholder="Email del invitado"
                        type="email"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      />
                      <button
                        onClick={() => invite(t.id)}
                        className="bg-indigo-600 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-indigo-700"
                      >
                        Invitar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
