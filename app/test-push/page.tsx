'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function PushTestPage() {
  const [status, setStatus] = useState<string>('Checking...')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev])
    console.log(message)
  }, [])

  const checkUser = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (currentUser) {
      setUser(currentUser)
      addLog(`✅ User authenticated: ${currentUser.email}`)
    } else {
      addLog('❌ No user logged in - please login first')
    }
  }, [addLog])

  const checkServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      setStatus('❌ Service Workers not supported')
      addLog('❌ Service Workers not supported in this browser')
      return
    }

    if (!('PushManager' in window)) {
      setStatus('❌ Push notifications not supported')
      addLog('❌ Push notifications not supported in this browser')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      addLog('✅ Service Worker is ready')
      
      const existingSub = await registration.pushManager.getSubscription()
      if (existingSub) {
        setSubscription(existingSub)
        setStatus('✅ Already subscribed')
        addLog('✅ Existing push subscription found')
      } else {
        setStatus('⏳ Not subscribed yet')
        addLog('⏳ No existing push subscription')
      }
    } catch (error) {
      const err = error as Error
      setStatus('❌ Error checking service worker')
      addLog(`❌ Error: ${err.message}`)
    }
  }, [addLog])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      checkUser()
      checkServiceWorker()
    })

    return () => cancelAnimationFrame(frame)
  }, [checkUser, checkServiceWorker])

  const requestPermission = async () => {
    addLog('📝 Requesting notification permission...')
    
    const permission = await Notification.requestPermission()
    addLog(`📝 Permission result: ${permission}`)
    
    if (permission === 'granted') {
      addLog('✅ Notification permission granted')
      return true
    } else {
      addLog('❌ Notification permission denied')
      return false
    }
  }

  const subscribeToPush = async () => {
    try {
      if (!user) {
        addLog('❌ Please login first')
        alert('Please login first')
        return
      }

      addLog('🔔 Starting push subscription process...')
      
      // Request permission
      const hasPermission = await requestPermission()
      if (!hasPermission) {
        return
      }

      // Get VAPID public key
      addLog('🔑 Fetching VAPID public key...')
      const response = await fetch('/api/push/vapid-public-key')
      const { publicKey } = await response.json()
      addLog(`🔑 VAPID key received: ${publicKey.substring(0, 20)}...`)

      // Subscribe to push
      addLog('📡 Registering push subscription...')
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      })

      addLog('✅ Push subscription created')
      setSubscription(pushSubscription)

      // Send to backend
      addLog('💾 Saving subscription to database...')
      const saveResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pushSubscription),
      })

      if (saveResponse.ok) {
        addLog('✅ Subscription saved successfully!')
        setStatus('✅ Subscribed successfully')
        alert('✅ Push notifications enabled!')
      } else {
        const error = await saveResponse.json()
        addLog(`❌ Failed to save subscription: ${error.error}`)
        alert(`Failed to save subscription: ${error.error}`)
      }
    } catch (error) {
      const err = error as Error
      addLog(`❌ Error: ${err.message}`)
      console.error('Subscription error:', error)
      alert(`Error: ${err.message}`)
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      if (!subscription) {
        addLog('❌ No active subscription')
        return
      }

      addLog('🔕 Unsubscribing from push notifications...')

      // Unsubscribe from push manager
      await subscription.unsubscribe()
      addLog('✅ Unsubscribed from push manager')

      // Remove from backend
      addLog('💾 Removing subscription from database...')
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })

      if (response.ok) {
        addLog('✅ Subscription removed successfully!')
        setSubscription(null)
        setStatus('⏳ Not subscribed')
        alert('✅ Push notifications disabled!')
      } else {
        const error = await response.json()
        addLog(`❌ Failed to remove subscription: ${error.error}`)
      }
    } catch (error) {
      const err = error as Error
      addLog(`❌ Error: ${err.message}`)
      console.error('Unsubscribe error:', error)
      alert(`Error: ${err.message}`)
    }
  }

  const sendTestNotification = async () => {
    try {
      if (!user) {
        addLog('❌ Please login first')
        return
      }

      addLog('📬 Sending test notification...')

      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: 'Test Notification',
          body: 'This is a test push notification from Personal Academy!',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        addLog(`✅ Notification sent successfully! (${result.sent} sent)`)
        alert('✅ Test notification sent! Check your notifications.')
      } else {
        const error = await response.json()
        addLog(`❌ Failed to send notification: ${error.error}`)
        alert(`Failed: ${error.error}`)
      }
    } catch (error) {
      const err = error as Error
      addLog(`❌ Error: ${err.message}`)
      console.error('Send error:', error)
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-2">🔔 Push Notification Test</h1>
          <p className="text-gray-600 mb-6">Test the push notification system</p>

          {/* Status */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold mb-2">Current Status:</h2>
            <p className="text-lg">{status}</p>
            {user && (
              <p className="text-sm text-gray-600 mt-2">
                Logged in as: {user.email}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mb-6 space-y-3">
            <h2 className="font-semibold mb-3">Actions:</h2>
            
            <button
              onClick={subscribeToPush}
              disabled={!!subscription}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition"
            >
              {subscription ? '✅ Already Subscribed' : '🔔 Subscribe to Push Notifications'}
            </button>

            <button
              onClick={unsubscribeFromPush}
              disabled={!subscription}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition"
            >
              🔕 Unsubscribe from Push Notifications
            </button>

            <button
              onClick={sendTestNotification}
              disabled={!subscription}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition"
            >
              📬 Send Test Notification
            </button>

            <button
              onClick={() => {
                setLogs([])
                addLog('🗑️ Logs cleared')
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              🗑️ Clear Logs
            </button>
          </div>

          {/* Subscription Info */}
          {subscription && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="font-semibold mb-2">Subscription Details:</h2>
              <div className="text-sm font-mono break-all text-gray-700">
                <p><strong>Endpoint:</strong> {subscription.endpoint.substring(0, 60)}...</p>
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Activity Log:</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-400">No activity yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="font-semibold mb-2">📋 Instructions:</h2>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Make sure you&apos;re logged in</li>
              <li>Click &quot;Subscribe to Push Notifications&quot;</li>
              <li>Grant notification permission when prompted</li>
              <li>Click &quot;Send Test Notification&quot; to test</li>
              <li>Check the activity log for detailed information</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
