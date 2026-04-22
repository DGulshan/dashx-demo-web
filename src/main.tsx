import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DashX from '@dashx/browser'
import App from './App.tsx'

DashX.configure({
  publicKey: import.meta.env.VITE_DASHX_PUBLIC_KEY,
  targetEnvironment: import.meta.env.VITE_DASHX_TARGET_ENVIRONMENT,
  ...(import.meta.env.VITE_DASHX_BASE_URI ? { baseUri: import.meta.env.VITE_DASHX_BASE_URI } : {}),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
