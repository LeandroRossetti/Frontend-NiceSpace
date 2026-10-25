import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { api, getErrorMessage } from '../api/client'
import { useAuthStore } from '../store/authStore'
import type { AccountType, AuthResponse } from '../api/types'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function LoginPage() {
  const [accountType, setAccountType] = useState<AccountType>('TENANT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential
    if (!idToken) {
      setError('No se pudo obtener el token de Google.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/auth/google', { idToken, accountType })
      setAuth(data.token, data.user)
      navigate(data.user.accountType === 'OWNER' ? '/dashboard' : '/workspaces')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-2">Iniciar sesión</h1>
      <p className="text-sm text-gray-500 mb-6">
        Entrá con tu cuenta de Google. No necesitás crear una contraseña.
      </p>

      <div className="mb-6">
        <p className="block text-sm font-medium text-gray-700 mb-2">¿Qué querés hacer?</p>
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
                Buscar y reservar espacios de trabajo.
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
                Publicar un lugar como coworking.
              </span>
            </span>
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Solo se usa si es tu primera vez. Si ya tenés cuenta, se respeta tu rol actual.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!googleClientId ? (
        <p className="text-sm text-red-600">
          Falta configurar VITE_GOOGLE_CLIENT_ID en el frontend.
        </p>
      ) : loading ? (
        <button
          type="button"
          disabled
          className="w-full bg-indigo-600 text-white rounded-md py-2 font-medium opacity-50"
        >
          Ingresando...
        </button>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('No se pudo completar el inicio de sesión con Google.')}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="100%"
        />
      )}
    </div>
  )
}
