import { useState, useCallback } from 'react'
import DashX from '@dashx/browser'
import { messaging } from './firebase'
import './App.css'

type LogEntry = {
  time: string
  message: string
  type: 'info' | 'success' | 'error'
}

function App() {
  const [subscribed, setSubscribed] = useState(false)
  const [identitySet, setIdentitySet] = useState(false)
  const [uid, setUid] = useState('test-user-123')
  const [logs, setLogs] = useState<LogEntry[]>([])

  const log = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [{ time, message, type }, ...prev])
  }, [])

  const handleIdentify = async () => {
    try {
      await DashX.identify(uid)
      log(`Identified as "${uid}"`, 'success')
    } catch (err) {
      log(`Identify failed: ${err}`, 'error')
    }
  }

  const handleSetIdentity = () => {
    try {
      DashX.setIdentity(uid)
      setIdentitySet(true)
      log(`Identity set for "${uid}"`, 'success')
    } catch (err) {
      log(`setIdentity failed: ${err}`, 'error')
    }
  }

  const handleReset = () => {
    try {
      DashX.reset()
      setSubscribed(false)
      setIdentitySet(false)
      log('Identity reset', 'success')
    } catch (err) {
      log(`Reset failed: ${err}`, 'error')
    }
  }

  const handleSubscribe = async () => {
    try {
      const result = await DashX.subscribe(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      })
      setSubscribed(true)
      log(`Subscribed to push notifications (token: ${result.value.slice(0, 20)}...)`, 'success')
    } catch (err) {
      log(`Subscribe failed: ${err}`, 'error')
    }
  }

  const handleUnsubscribe = async () => {
    try {
      await DashX.unsubscribe()
      setSubscribed(false)
      log('Unsubscribed from push notifications', 'success')
    } catch (err) {
      log(`Unsubscribe failed: ${err}`, 'error')
    }
  }

  const handleOnPushNotification = () => {
    const unsub = DashX.onPushNotificationReceived((payload) => {
      log(`Push received: ${payload.title} - ${payload.body}`, 'info')
    })
    log('Listening for foreground push notifications (refresh to stop)', 'success')
    // Store for potential cleanup — for demo purposes we just let it live
    ;(window as any).__dashxPushUnsub = unsub
  }

  const handleTrack = () => {
    try {
      DashX.track('Button Clicked', { label: 'Demo Button', timestamp: Date.now() })
      log('Event tracked: "Button Clicked"', 'success')
    } catch (err) {
      log(`Track failed: ${err}`, 'error')
    }
  }

  return (
    <div className="app">
      <header>
        <h1>DashX Browser SDK Demo</h1>
        <div className="status-bar">
          <span className={`badge ${subscribed ? 'active' : ''}`}>
            {subscribed ? 'Subscribed' : 'Not Subscribed'}
          </span>
        </div>
      </header>

      <main>
        <section className="card">
          <h2>Identity</h2>
          <div className="input-row">
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="User UID"
            />
          </div>
          <div className="button-row">
            <button onClick={handleSetIdentity}>
              Set Identity
            </button>
            <button onClick={handleIdentify} disabled={!identitySet}>
              Identify
            </button>
            <button onClick={handleReset}>
              Reset
            </button>
          </div>
        </section>

        <section className="card">
          <h2>Push Notifications</h2>
          <div className="button-row">
            <button onClick={handleSubscribe} disabled={subscribed}>
              Subscribe
            </button>
            <button onClick={handleUnsubscribe} disabled={!subscribed}>
              Unsubscribe
            </button>
            <button onClick={handleOnPushNotification}>
              On Push Received
            </button>
          </div>
        </section>

        <section className="card">
          <h2>Analytics</h2>
          <button onClick={handleTrack}>
            Track Event
          </button>
        </section>

        <section className="card log-card">
          <div className="log-header">
            <h2>Log</h2>
            <button className="clear-btn" onClick={() => setLogs([])}>Clear</button>
          </div>
          <div className="log">
            {logs.length === 0 && <p className="log-empty">No events yet. Click a button above.</p>}
            {logs.map((entry, i) => (
              <div key={i} className={`log-entry ${entry.type}`}>
                <span className="log-time">{entry.time}</span>
                <span className="log-msg">{entry.message}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
