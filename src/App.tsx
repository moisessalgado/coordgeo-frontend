import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import SignupPage from './pages/SignupPage.tsx'
import { OrgSelectPage } from './pages/OrgSelectPage.tsx'
import { UpgradePage } from './pages/UpgradePage.tsx'
import { useAuthStore } from './state/authStore.ts'
import { useOrgStore } from './state/orgStore.ts'

const MapPage = lazy(() => import('./pages/MapPage.tsx').then((module) => ({ default: module.MapPage })))
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage.tsx').then((module) => ({ default: module.SettingsPage })),
)

function RequireAuth({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  if (!accessToken) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RequireOrg({ children }: { children: ReactNode }) {
  const activeOrgId = useOrgStore((state) => state.activeOrgId)
  const resolveAndSetActiveOrg = useOrgStore((state) => state.resolveAndSetActiveOrg)
  const [isResolving, setIsResolving] = useState(false)
  const [hasResolvedOnce, setHasResolvedOnce] = useState(false)

  useEffect(() => {
    if (activeOrgId || isResolving || hasResolvedOnce) {
      return
    }

    const resolveOrg = async () => {
      setIsResolving(true)
      await resolveAndSetActiveOrg()
      setIsResolving(false)
      setHasResolvedOnce(true)
    }

    void resolveOrg()
  }, [activeOrgId, hasResolvedOnce, isResolving, resolveAndSetActiveOrg])

  if (activeOrgId) {
    return children
  }

  if (isResolving || !hasResolvedOnce) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <img
            src="/brand/coordgeo-mark.png"
            alt="CoordGeo"
            className="h-16 w-16 object-contain"
          />
          <p className="text-sm text-slate-600">Preparando sua organização...</p>
        </div>
      </main>
    )
  }

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
    return <Navigate to="/map" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
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
                    <main className="grid min-h-screen place-items-center bg-slate-100 px-6">
                      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
                        <img
                          src="/brand/coordgeo-mark.png"
                          alt="CoordGeo"
                          className="h-16 w-16 object-contain"
                        />
                        <p className="text-sm text-slate-600">Carregando mapa...</p>
                      </div>
                    </main>
                  }
                >
                  <MapPage />
                </Suspense>
              </RequireOrg>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <RequireOrg>
                <Suspense
                  fallback={
                    <main className="grid min-h-screen place-items-center bg-slate-100 px-6">
                      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
                        <img
                          src="/brand/coordgeo-mark.png"
                          alt="CoordGeo"
                          className="h-16 w-16 object-contain"
                        />
                        <p className="text-sm text-slate-600">Carregando configurações...</p>
                      </div>
                    </main>
                  }
                >
                  <SettingsPage />
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
