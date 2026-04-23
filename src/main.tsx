import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DashX from '@dashx/browser'
import { messaging } from './firebase'
import App from './App.tsx'

DashX.configure({
  publicKey: import.meta.env.VITE_DASHX_PUBLIC_KEY,
  targetEnvironment: import.meta.env.VITE_DASHX_TARGET_ENVIRONMENT,
  ...(import.meta.env.VITE_DASHX_BASE_URI ? { baseUri: import.meta.env.VITE_DASHX_BASE_URI } : {}),
})

// Wire Firebase's foreground `onMessage` listener AND explicitly register
// the messaging service worker at app bootstrap. Two reasons to register
// here rather than lazily:
//   1. Firebase's `getToken()` only registers the SW on the first Subscribe
//      click. Until then (or if the SW was unregistered during debugging),
//      no SW is active — which means `registration.showNotification(...)`
//      for the foreground banner silently no-ops.
//   2. Background deliveries need an active SW regardless of whether the
//      user has subscribed in this session.
// Passing `registerServiceWorker` to attachForegroundMessaging makes the
// SDK do the register call internally and cache the resulting registration
// for banner rendering. Subscribe() later reuses the same registration.
DashX.attachForegroundMessaging(messaging, {
  registerServiceWorker: '/firebase-messaging-sw.js',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
