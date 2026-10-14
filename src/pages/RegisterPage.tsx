import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import { useAuthStore } from '../store/authStore'
import type { AccountType, AuthResponse } from '../api/types'

export default function RegisterPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('TENANT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        nombre,
        email,
        password,
        accountType,
      })
      setAuth(data.token, data.user)
      navigate(data.user.accountType === 'OWNER' ? '/dashboard' : '/workspaces')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Crear cuenta</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña (mín. 8 caracteres)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
          <div className="space-y-2">
            <label className="flex items-start gap-2 border rounded-md p-3 cursor-pointer">
              <input
                type="radio"
                name="accountType"
                value="TENANT"
                checked={accountType === 'TENANT'}
                onChange={() => setAccountType('TENANT')}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Quiero alquilar</span>
                <span className="block text-sm text-gray-500">
                  Persona, equipo o pyme que busca reservar espacios de trabajo.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 border rounded-md p-3 cursor-pointer">
              <input
                type="radio"
                name="accountType"
                value="OWNER"
                checked={accountType === 'OWNER'}
                onChange={() => setAccountType('OWNER')}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Quiero ofrecer mi espacio</span>
                <span className="block text-sm text-gray-500">
                  Dueño de un lugar que quiere publicarlo como coworking.
                </span>
              </span>
            </label>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-md py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="text-indigo-600 font-medium">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
