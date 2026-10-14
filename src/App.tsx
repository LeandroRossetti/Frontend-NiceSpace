import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OwnerDashboard from './pages/OwnerDashboard'
import BrowseWorkspaces from './pages/BrowseWorkspaces'
import WorkspaceAvailability from './pages/WorkspaceAvailability'
import WorkspaceEditorPage from './pages/WorkspaceEditorPage'
import WorkspaceReservations from './pages/WorkspaceReservations'
import MyReservations from './pages/MyReservations'
import TeamsPage from './pages/TeamsPage'

function HomeRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.accountType === 'OWNER' ? '/dashboard' : '/workspaces'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomeRedirect />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute require="OWNER">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/workspaces" element={<BrowseWorkspaces />} />
          <Route path="/workspaces/:id" element={<WorkspaceAvailability />} />
          <Route
            path="/workspaces/:id/edit"
            element={
              <ProtectedRoute require="OWNER">
                <WorkspaceEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspaces/:id/reservations"
            element={
              <ProtectedRoute require="OWNER">
                <WorkspaceReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute require="TENANT">
                <MyReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute require="TENANT">
                <TeamsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
