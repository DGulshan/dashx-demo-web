# dashx-demo-web

Demo React app for testing the [@dashx/browser](https://github.com/dashxhq/dashx-browser) SDK — push notifications, identity management, analytics, and more.

## Prerequisites

- Node.js 18+
- A [DashX](https://dashx.com) account with a public key
- A [Firebase](https://console.firebase.google.com) project with Cloud Messaging enabled
- A VAPID key (Firebase Console > Project Settings > Cloud Messaging > Web Push certificates)

## Setup

1. Install dependencies:

To test against the local SDK, update DashX sdk dependency in `package.json`:
```sh
"@dashx/browser": "file:../dashx-browser",
```

and then run:

```sh
npm install
```

2. Copy the env template and fill in your credentials:

```sh
cp .env.example .env
```

```
VITE_DASHX_PUBLIC_KEY=your-dashx-public-key
VITE_DASHX_TARGET_ENVIRONMENT=your-environment
VITE_DASHX_BASE_URI=                              # optional, defaults to https://api.dashx.com/graphql

VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

3. Start the dev server:

```sh
npm run dev
```

4. Open http://localhost:5173 in your browser.

## Usage

`DashX.configure()` is called once from `src/main.tsx` at app bootstrap, so the SDK is ready before any page renders. The app provides buttons for each SDK method — follow this order to test push notifications:

1. **Identify** — Enter a user UID and click `identify()` or `setIdentity()` to set the current user
2. **Subscribe** — Click `subscribe()` to request notification permission and register for push notifications
3. **Send a notification** — Use the DashX dashboard to send a push notification to the subscribed user
4. **Observe** — Foreground notifications appear in the log panel; background notifications appear as system notifications (switch tabs to test)
5. **Unsubscribe** — Click `unsubscribe()` to stop receiving notifications

## Service Worker

The Firebase service worker (`public/firebase-messaging-sw.js`) is auto-generated from your `.env` variables when the dev server starts or when you build. You don't need to edit it manually.

The DashX service worker helper (`public/dashx-sw-helper.umd.js`) is copied from the `@dashx/browser` package build output. To update it after rebuilding the SDK:

```sh
cp ../dashx-browser/dist/sw-helper.umd.js public/dashx-sw-helper.umd.js
```

## Build

```sh
npm run build
npm run preview
```
