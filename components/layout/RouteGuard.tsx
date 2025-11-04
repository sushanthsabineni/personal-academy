'use client'

// React
import { useEffect, useState, memo } from 'react'

// Next.js
import { useRouter, usePathname } from 'next/navigation'

// Supabase
import { supabase } from '@/lib/supabase/client'

// Internal utilities
import { isProtectedRoute } from '@/lib/auth'

function RouteGuardComponent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔒 RouteGuard checking auth for:', pathname)
      
      // Check if route requires authentication
      if (isProtectedRoute(pathname)) {
        try {
          // Check if user has an active session with Supabase
          const { data: { session }, error } = await supabase.auth.getSession()
          
          console.log('🔍 RouteGuard session check:', { 
            hasSession: !!session, 
            userId: session?.user?.id,
            error: error?.message 
          })
          
          if (!session) {
            // Redirect to login page if not authenticated
            console.log('❌ No session, redirecting to login from RouteGuard')
            router.push('/login?redirect=' + pathname)
            return
          }
          
          console.log('✅ RouteGuard: User authenticated')
          setIsChecking(false)
        } catch (error) {
          console.error('❌ RouteGuard error:', error)
          router.push('/login')
        }
      } else {
        // Public route, allow access
        console.log('✅ RouteGuard: Public route, allowing access')
        setIsChecking(false)
      }
    }

    checkAuth()
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 RouteGuard: Auth state changed:', event, { hasSession: !!session })
      
      if (event === 'SIGNED_OUT' && isProtectedRoute(pathname)) {
        console.log('❌ User signed out, redirecting to login')
        router.push('/login')
      } else if (event === 'SIGNED_IN') {
        console.log('✅ User signed in')
        setIsChecking(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  // Show loading while checking authentication for protected routes
  if (isChecking && isProtectedRoute(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Memoized export for performance
export const RouteGuard = memo(RouteGuardComponent)
