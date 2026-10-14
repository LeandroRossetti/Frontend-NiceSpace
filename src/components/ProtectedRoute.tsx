import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { AccountType } from '../api/types'

interface Props {
  children: React.ReactNode
  require?: AccountType
}

export default function ProtectedRoute({ children, require }: Props) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  if (require && user.accountType !== require) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
