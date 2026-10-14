import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'El servidor está tardando en responder (posible cold start). Reintentá en unos segundos.'
    }
    if (!error.response) {
      return 'No se pudo conectar con el servidor.'
    }
    const data = error.response.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.response.status === 401) return 'Sesión expirada. Iniciá sesión nuevamente.'
  }
  return 'Ocurrió un error inesperado.'
}
