import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { SignupPage } from './pages/SignupPage.tsx'
import { OrgSelectPage } from './pages/OrgSelectPage.tsx'
import { useAuthStore } from './state/authStore.ts'
import { useOrgStore } from './state/orgStore.ts'

const MapPage = lazy(() => import('./pages/MapPage.tsx').then((module) => ({ default: module.MapPage })))

function RequireAuth({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  if (!accessToken) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RequireOrg({ children }: { children: ReactNode }) {
  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  if (!activeOrgId) {
    return <Navigate to="/select-org" replace />
  }
  return children
}

function PublicOnlyGuard({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const activeOrgId = useOrgStore((state) => state.activeOrgId)

  if (accessToken && activeOrgId) {
    return <Navigate to="/map" replace />
  }

  if (accessToken) {
    return <Navigate to="/select-org" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/signup"
          element={
            <PublicOnlyGuard>
              <SignupPage />
            </PublicOnlyGuard>
          }
        />
        <Route
          path="/select-org"
          element={
            <RequireAuth>
              <OrgSelectPage />
            </RequireAuth>
          }
        />
        <Route
          path="/map"
          element={
            <RequireAuth>
              <RequireOrg>
                <Suspense
                  fallback={
                    <main className="grid min-h-screen place-items-center bg-slate-100">
                      <p className="text-sm text-slate-600">Carregando mapa...</p>
                    </main>
                  }
                >
                  <MapPage />
                </Suspense>
              </RequireOrg>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
