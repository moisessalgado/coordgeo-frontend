import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { configureApiInterceptors } from './services/api.ts'
import { useAuthStore } from './state/authStore.ts'
import { useOrgStore } from './state/orgStore.ts'

configureApiInterceptors({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setAccessToken: (accessToken) => useAuthStore.getState().setAccessToken(accessToken),
  clearSession: () => {
    useAuthStore.getState().logout()
    useOrgStore.getState().clearActiveOrg()
  },
  getActiveOrgId: () => useOrgStore.getState().activeOrgId,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
