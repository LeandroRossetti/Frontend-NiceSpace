import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { api, getErrorMessage } from '../api/client'
import { useAuthStore } from '../store/authStore'
import type { AccountType, AuthResponse } from '../api/types'
import ThemeToggle from '../components/ThemeToggle'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const roles: { value: AccountType; titulo: string; descripcion: string }[] = [
  {
    value: 'TENANT',
    titulo: 'Quiero alquilar',
    descripcion: 'Buscar y reservar espacios de trabajo.',
  },
  {
    value: 'OWNER',
    titulo: 'Quiero ofrecer mi espacio',
    descripcion: 'Publicar un lugar como coworking.',
  },
]

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
      navigate(data.user.accountType === 'OWNER' ? '/dashboard' : '/locations')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft-lg">
          <div className="text-center">
            <img
              src="/icon.jpeg"
              alt="OpenSpot"
              className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-soft"
            />
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              Bienvenido a OpenSpot
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrá con tu cuenta de Google. No necesitás crear una contraseña.
            </p>
          </div>

          <div className="mt-8">
            <p className="mb-2 text-sm font-medium text-foreground">
              ¿Qué querés hacer?
            </p>
            <div className="space-y-2">
              {roles.map((rol) => {
                const selected = accountType === rol.value
                return (
                  <label
                    key={rol.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all duration-300 ${
                      selected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-border hover:bg-surface-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={rol.value}
                      checked={selected}
                      onChange={() => setAccountType(rol.value)}
                      className="mt-0.5 accent-primary-700 focus:ring-2 focus:ring-primary-500"
                    />
                    <span>
                      <span className="text-sm font-semibold text-foreground">
                        {rol.titulo}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {rol.descripcion}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Solo se usa si es tu primera vez. Si ya tenés cuenta, se respeta
              tu rol actual.
            </p>
          </div>

          {error && (
            <p className="mt-5 rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-600">
              {error}
            </p>
          )}

          <div className="mt-6">
            {!googleClientId ? (
              <p className="text-sm text-danger-600">
                Falta configurar VITE_GOOGLE_CLIENT_ID en el frontend.
              </p>
            ) : loading ? (
              <button
                type="button"
                disabled
                className="w-full rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-medium text-white opacity-50"
              >
                Ingresando...
              </button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  setError('No se pudo completar el inicio de sesión con Google.')
                }
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/"
            className="font-medium text-primary-700 hover:underline dark:text-primary-300"
          >
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
