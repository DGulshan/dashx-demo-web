import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // Pull @dashx/browser's current version from its package.json and embed it
  // as a comment in the generated SW. Service workers are byte-compared by
  // the browser on every load — when the SDK bumps, the comment changes, the
  // SW file content changes, the browser registers the new SW. Without this
  // bump, the SW `importScripts('./dashx-sw-helper.umd.js')` caches the old
  // helper indefinitely because the top-level SW file didn't change.
  const dashxPkg = JSON.parse(
    readFileSync(resolve(__dirname, 'node_modules/@dashx/browser/package.json'), 'utf8'),
  ) as { version: string }

  return {
    plugins: [
      react(),
      {
        name: 'generate-firebase-sw',
        buildStart() {
          const sw = `/* Auto-generated — do not edit. @dashx/browser v${dashxPkg.version} */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')
importScripts('./dashx-sw-helper.umd.js')

// Take over immediately on update — otherwise a new SW sits in the "waiting"
// state until every demo-web tab is fully closed, which most users never do.
self.addEventListener('install', (event) => { event.waitUntil(self.skipWaiting()) })
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()) })

firebase.initializeApp({
  apiKey: '${env.VITE_FIREBASE_API_KEY || ''}',
  authDomain: '${env.VITE_FIREBASE_AUTH_DOMAIN || ''}',
  projectId: '${env.VITE_FIREBASE_PROJECT_ID || ''}',
  storageBucket: '${env.VITE_FIREBASE_STORAGE_BUCKET || ''}',
  messagingSenderId: '${env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}',
  appId: '${env.VITE_FIREBASE_APP_ID || ''}',
  measurementId: '${env.VITE_FIREBASE_MEASUREMENT_ID || ''}',
})

var messaging = firebase.messaging()

var dashx = createDashXServiceWorkerHandler({
  publicKey: '${env.VITE_DASHX_PUBLIC_KEY || ''}',
  targetEnvironment: '${env.VITE_DASHX_TARGET_ENVIRONMENT || ''}',
  ${env.VITE_DASHX_BASE_URI ? `baseUri: '${env.VITE_DASHX_BASE_URI}',` : ''}
})

messaging.onBackgroundMessage(function(payload) { dashx.onBackgroundMessage(payload, self.registration) })
self.addEventListener('notificationclick', function(event) { dashx.onNotificationClick(event, self.clients) })
self.addEventListener('notificationclose', function(event) { dashx.onNotificationClose(event) })
`
          writeFileSync(resolve(__dirname, 'public/firebase-messaging-sw.js'), sw)
          // Also refresh the vendored DashX SW helper from node_modules so
          // `dashx-sw-helper.umd.js` always matches the installed SDK. Without
          // this, bumping the package alone wouldn't update the helper bytes
          // served from `public/`, and the SW would load a stale helper even
          // though the top-level SW file's version comment changed.
          const helperSrc = resolve(__dirname, 'node_modules/@dashx/browser/dist/sw-helper.umd.js')
          const helperDst = resolve(__dirname, 'public/dashx-sw-helper.umd.js')
          writeFileSync(helperDst, readFileSync(helperSrc))
        },
      },
    ],
  }
})
