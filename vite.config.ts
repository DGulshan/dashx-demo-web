import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      react(),
      {
        name: 'generate-firebase-sw',
        buildStart() {
          const sw = `/* Auto-generated — do not edit */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')
importScripts('./dashx-sw-helper.umd.js')

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
        },
      },
    ],
  }
})
