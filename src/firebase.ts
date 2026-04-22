import { initializeApp } from 'firebase/app'
import {
  getMessaging,
  getToken,
  deleteToken,
  onMessage,
} from 'firebase/messaging'
import type { FirebaseMessaging } from '@dashx/browser'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const fbMessaging = getMessaging(app)

// Wrap Firebase's function-based API into the interface DashX expects
const messaging: FirebaseMessaging = {
  getToken: (options) => getToken(fbMessaging, options),
  onMessage: (handler) => onMessage(fbMessaging, handler),
  deleteToken: () => deleteToken(fbMessaging),
}

export { messaging }
