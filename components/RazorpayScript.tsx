'use client'

import { useEffect, useState } from 'react'

export default function RazorpayScript() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadScript = () => {
      // Check if Razorpay is already loaded
      if (typeof window !== 'undefined' && window.Razorpay) {
        if (isMounted) {
          setLoaded(true)
        }
        return
      }

      // Create and load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      
      script.onload = () => {
        if (isMounted) {
          setLoaded(true)
          console.log('✅ Razorpay script loaded successfully')
        }
      }
      
      script.onerror = () => {
        if (isMounted) {
          setError(true)
          console.error('❌ Failed to load Razorpay script')
        }
      }

      document.body.appendChild(script)

      return script
    }

    const script = loadScript()

    return () => {
      isMounted = false
      // Cleanup script on unmount
      if (script && document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Debug info in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (loaded) {
        console.log('🔐 Razorpay ready for payments')
      }
      if (error) {
        console.warn('⚠️ Razorpay script failed to load. Check your internet connection.')
      }
    }
  }, [loaded, error])

  return null // This component doesn't render anything
}
