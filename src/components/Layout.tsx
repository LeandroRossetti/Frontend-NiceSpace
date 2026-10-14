import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

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
      isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-indigo-700">
            Cowork Spaces
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
              <span className="ml-3 text-sm text-gray-500">{user.nombre}</span>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
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
