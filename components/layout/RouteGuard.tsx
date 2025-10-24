'use client'

// React
import { useEffect, useState } from 'react'

// Next.js
import { useRouter, usePathname } from 'next/navigation'

// Internal utilities
import { isAuthenticated, isProtectedRoute } from '@/lib/auth'

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      // Check if route requires authentication
      if (isProtectedRoute(pathname)) {
        // Check if user is authenticated
        const authenticated = isAuthenticated()
        
        if (!authenticated) {
          // Redirect to login page if not authenticated
          router.push('/login')
        } else {
          setIsChecking(false)
        }
      } else {
        // Public route, allow access
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Show loading while checking authentication for protected routes
  if (isChecking && isProtectedRoute(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
