'use client'

// React
import { useState, useEffect, memo } from 'react'

// Next.js
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

// Supabase
import { supabase } from '@/lib/supabase/client'

// External libraries
import { Bell, Sun, Moon, Coins, CreditCard, Gift, Settings, LogOut, BookOpen } from '@/lib/icons'

function HeaderComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      return savedTheme ? savedTheme === 'dark' : true
    }
    return true
  })
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('User')
  const [userEmail, setUserEmail] = useState('')
  const [userPicture, setUserPicture] = useState('')
  const [credits, setCredits] = useState(100)
  const hasNotifications = false

  const userInitial = userName.charAt(0).toUpperCase()

  // Handle theme and authentication on mount and route changes
  useEffect(() => {
    // Apply theme to DOM
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  useEffect(() => {
    // Check authentication status using Supabase
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setIsLoggedIn(true)
          setUserEmail(session.user.email || '')
          
          // Fetch profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, credits_balance')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUserName(profile.full_name || session.user.email?.split('@')[0] || 'User')
            setUserPicture(profile.avatar_url || session.user.user_metadata?.avatar_url || '')
            setCredits(profile.credits_balance || 100)
          } else {
            setUserName(session.user.email?.split('@')[0] || 'User')
          }
        } else {
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('header: auth check error', error)
        setIsLoggedIn(false)
      }
    }
    
    const initializeAuth = async () => {
      await checkAuth()
      setMounted(true)
    }
    
    initializeAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true)
        setUserEmail(session.user.email || '')
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false)
        setUserName('User')
        setUserEmail('')
        setUserPicture('')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    // Force re-render
    window.dispatchEvent(new Event('storage'))
  }

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          <button 
            onClick={() => router.push('/')}
            className="shrink-0 hover:opacity-80 transition-opacity"
          >
            <Image 
              src="/logo.png?v=2" 
              alt="Personal Academy" 
              width={120}
              height={120}
              priority
              className="object-contain"
              unoptimized
            />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-24 h-8"></div> {/* Placeholder for credits */}
            <div className="w-8 h-8"></div> {/* Placeholder for notifications */}
            <div className="w-8 h-8"></div> {/* Placeholder for theme toggle */}
            <div className="w-10 h-10"></div> {/* Placeholder for avatar */}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 h-16 z-50">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* LEFT: Logo */}
        <button 
          onClick={() => router.push(isLoggedIn ? '/dashboard' : '/')}
          className="shrink-0 hover:opacity-80 transition-opacity"
        >
          <Image 
            src="/logo.png?v=2" 
            alt="Personal Academy" 
            width={120}
            height={120}
            priority
            className="object-contain"
            unoptimized
          />
        </button>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">
          
          {/* Show public navigation ONLY when NOT logged in */}
          {!isLoggedIn && (
            <>
              {/* Always show Pricing and Refer & Earn when not logged in */}
              <button
                onClick={() => router.push('/pricing')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-teal dark:hover:text-brand-teal font-medium transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => router.push('/refer')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-teal dark:hover:text-brand-teal font-medium transition-colors"
              >
                Refer & Earn
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-medium transition-all shadow-md"
              >
                Login / Sign Up
              </button>
            </>
          )}

          {/* Show authenticated navigation ONLY when logged in */}
          {isLoggedIn && (
            <>
              {/* Dashboard Button - Hide during course creation flow */}
              {!pathname.startsWith('/create') && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand-teal dark:hover:text-brand-teal font-medium transition-colors flex items-center gap-2"
                >
                  <BookOpen size={18} />
                  Dashboard
                </button>
              )}

              {/* Credits */}
              <button
                onClick={() => router.push('/account/credits')}
                className="flex items-center gap-2 bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal dark:text-brand-teal px-3 py-1 rounded-full text-sm font-medium hover:bg-brand-teal/20 dark:hover:bg-brand-teal/30 transition-colors"
              >
                <Coins size={16} />
                {credits}
              </button>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                {hasNotifications && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </>
          )}

          {/* Theme Toggle - Always visible */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDark ? (
              <Sun size={20} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <Moon size={20} className="text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {/* User Avatar Dropdown - Show only when logged in */}
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold hover:bg-blue-700 transition-colors overflow-hidden"
              >
                {userPicture ? (
                  <Image 
                    src={userPicture} 
                    alt={userName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-[60]">
                
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                </div>

                {/* Menu Items */}
                <nav className="py-2">
                  <button
                    onClick={() => {
                      router.push('/account/pricing')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard size={16} className="text-gray-600 dark:text-gray-400" />
                    Pricing Plans
                  </button>

                  <button
                    onClick={() => {
                      router.push('/account/referrals')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Gift size={16} className="text-gray-600 dark:text-gray-400" />
                    Refer & Earn
                  </button>

                  <button
                    onClick={() => {
                      router.push('/account/credits')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Coins size={16} className="text-gray-600 dark:text-gray-400" />
                    Credits & Purchases
                  </button>

                  <button
                    onClick={() => {
                      router.push('/account/settings')
                      setIsDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Settings size={16} className="text-gray-600 dark:text-gray-400" />
                    Account Settings
                  </button>

                  <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>

                  <button
                    onClick={async () => {
                      try {
                        await supabase.auth.signOut()
                        setIsDropdownOpen(false)
                        // Redirect to landing page with full reload
                        window.location.href = '/'
                      } catch (error) {
                        console.error('header: logout error', error)
                      }
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} className="text-red-600 dark:text-red-400" />
                    Logout
                  </button>
                </nav>
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </header>
  )
}

// Memoized export for performance
export const Header = memo(HeaderComponent)
