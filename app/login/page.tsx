'use client'

// React
import { useState, useEffect } from 'react'

// Next.js
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Internal utilities
import { login } from '@/lib/auth'
import { initializeGoogleSignIn, renderGoogleButton, type GoogleUserInfo } from '@/lib/google-auth'
import { trackLogin, trackSignUp } from '@/lib/analytics'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  useEffect(() => {
    // Initialize Google Sign-In
    initializeGoogleSignIn(
      (userInfo: GoogleUserInfo) => {
        // Success callback - automatically log in user with their Google info
        const token = 'google-auth-token-' + Date.now()
        login(token, {
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          authProvider: 'google'
        })
        trackLogin('google')
        router.push('/dashboard')
      },
      (error) => {
        console.error('Google Sign-In error:', error)
      }
    )

    // Wait for Google script to load, then render button
    const timer = setTimeout(() => {
      renderGoogleButton('googleSignInButton')
    }, 500)

    return () => clearTimeout(timer)
  }, [router])

  const handleSignIn = () => {
    setIsLoading(true)
    // Authentication in progress

    // Simulate auth delay
    setTimeout(() => {
      // Set auth token with basic user info
      login('mock-auth-token-' + Date.now(), {
        name: email.split('@')[0] || 'User',
        email: email,
        picture: '',
        authProvider: 'email'
      })
      trackLogin('email')
      setIsLoading(false)
      router.push('/dashboard')
    }, 1000)
  }

  const handleSignUp = () => {
    setIsLoading(true)
    // User registration in progress

    setTimeout(() => {
      // Set auth token with basic user info
      login('mock-auth-token-' + Date.now(), {
        name: email.split('@')[0] || 'User',
        email: email,
        picture: '',
        authProvider: 'email'
      })
      trackSignUp('email')
      setIsLoading(false)
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-slate-700">
          
          {/* Heading */}
          <h1 className="text-2xl font-bold text-center mb-1 text-gray-900 dark:text-white">
            Welcome to Personal Academy App
          </h1>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-5">
            Sign in to start creating amazing courses
          </p>

          {/* Google Sign-In Button */}
          <div 
            id="googleSignInButton" 
            className="flex justify-center mb-3 w-full"
          ></div>

          {/* Divider */}
          <div className="flex flex-col items-center gap-2 my-4">
            <div className="w-full h-px bg-gray-200 dark:bg-slate-700"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">OR</span>
            <div className="w-full h-px bg-gray-200 dark:bg-slate-700"></div>
          </div>

          {/* Email Input */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1.5 text-gray-900 dark:text-white">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-10 px-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5 text-gray-900 dark:text-white">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="mb-4">
            <label className="flex items-start gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-teal focus:ring-brand-teal focus:ring-2 cursor-pointer"
                disabled={isLoading}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                I agree to the{' '}
                <Link href="/trust/terms-of-service" className="text-brand-teal hover:underline font-medium">
                  Terms of Service
                </Link>
                {', '}
                <Link href="/trust/terms-of-use" className="text-brand-teal hover:underline font-medium">
                  Terms of Use
                </Link>
                {', and '}
                <Link href="/trust/privacy" className="text-brand-teal hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isLoading || !agreedToTerms}
            className="w-full h-10 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            disabled={isLoading || !agreedToTerms}
            className="w-full h-10 border-2 border-brand-teal text-brand-teal font-semibold rounded-lg hover:bg-brand-teal/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Account
          </button>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            By continuing, you agree to our{' '}
            <Link href="/trust/terms-of-service" className="text-brand-teal hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/trust/privacy" className="text-brand-teal hover:underline">
              Privacy Policy
            </Link>
          </p>

        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-brand-teal transition-colors text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
