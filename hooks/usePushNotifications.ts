'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to manage push notification subscriptions
 * Handles browser push notification permission and subscription
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if push notifications are supported
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window

    setIsSupported(supported)

    if (supported) {
      checkSubscriptionStatus()
    }
  }, [])

  /**
   * Check if user is already subscribed to push notifications
   */
  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription status:', error)
      setIsSubscribed(false)
    }
  }

  /**
   * Subscribe to push notifications
   */
  const subscribe = async () => {
    if (!isSupported) {
      console.error('Push notifications are not supported in this browser')
      return false
    }

    try {
      setIsLoading(true)

      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('Notification permission denied')
        return false
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Get VAPID public key
      const response = await fetch('/api/push/vapid-public-key')
      if (!response.ok) throw new Error('Failed to get VAPID key')
      const { publicKey } = await response.json()

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })

      // Send subscription to backend
      const saveResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      if (!saveResponse.ok) throw new Error('Failed to save subscription')

      setIsSubscribed(true)
      console.log('Successfully subscribed to push notifications')
      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = async () => {
    if (!isSupported) return false

    try {
      setIsLoading(true)

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        setIsSubscribed(false)
        return true
      }

      // Notify backend about unsubscription
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      })

      if (!response.ok) throw new Error('Failed to unsubscribe')

      // Unsubscribe from push manager
      await subscription.unsubscribe()
      setIsSubscribed(false)
      console.log('Successfully unsubscribed from push notifications')
      return true
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
