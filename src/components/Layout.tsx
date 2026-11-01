import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'bg-primary-100 text-primary-800' : 'text-foreground hover:bg-surface-muted'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-primary-800">
            OpenSpot
          </Link>
          {user && (
            <nav className="flex items-center gap-1">
              {user.accountType === 'OWNER' ? (
                <NavLink to="/dashboard" className={linkClass}>
                  Mis espacios
                </NavLink>
              ) : (
                <NavLink to="/workspaces" className={linkClass}>
                  Buscar espacios
                </NavLink>
              )}
              {user.accountType === 'TENANT' && (
                <>
                  <NavLink to="/teams" className={linkClass}>
                    Equipos
                  </NavLink>
                  <NavLink to="/reservations" className={linkClass}>
                    Mis reservas
                  </NavLink>
                </>
              )}
              <span className="ml-3 text-sm text-muted-foreground">{user.nombre}</span>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-danger-600 hover:bg-danger-500/10"
              >
                Salir
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
